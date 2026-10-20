-- =============================================================================
-- Séries de régularité (streaks) + badges — partagés entre les 3 plateformes
-- puisque c'est le même compte. 'reading' est alimenté par lecture ET
-- ecriture (lire un chapitre BD ou un chapitre de roman compte pareil),
-- 'writing' par la publication d'un chapitre sur l'une ou l'autre, et
-- 'community' par une activité de post/message sur communaute.
-- =============================================================================

create table public.user_streaks (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  streak_type        text not null check (streak_type in ('reading', 'writing', 'community')),
  current_count      integer not null default 0,
  longest_count      integer not null default 0,
  last_activity_date date,
  updated_at         timestamptz not null default now(),
  unique (user_id, streak_type)
);

alter table public.user_streaks enable row level security;
create policy "user_streaks are publicly readable" on public.user_streaks for select using (true);
-- Pas de policy insert/update : seule la fonction security definer
-- record_streak_activity() peut écrire ici, pour éviter qu'un utilisateur
-- ne gonfle sa propre série à la main via un PATCH direct.

create table public.badges (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  label        text not null,
  description  text not null,
  icon         text not null,
  created_at   timestamptz not null default now()
);

alter table public.badges enable row level security;
create policy "badges are publicly readable" on public.badges for select using (true);

create table public.user_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  badge_id    uuid not null references public.badges(id) on delete cascade,
  earned_at   timestamptz not null default now(),
  unique (user_id, badge_id)
);

alter table public.user_badges enable row level security;
create policy "user_badges are publicly readable" on public.user_badges for select using (true);
-- Idem : attribution uniquement via fonctions security definer côté serveur.

create index idx_user_streaks_user on public.user_streaks (user_id);
create index idx_user_badges_user on public.user_badges (user_id);

insert into public.badges (code, label, description, icon) values
  ('reading_streak_3',  'Lecteur curieux',      '3 jours de lecture consécutifs',  'BookOpen'),
  ('reading_streak_7',  'Lecteur assidu',       '7 jours de lecture consécutifs',  'Flame'),
  ('reading_streak_30', 'Lecteur dévoué',       '30 jours de lecture consécutifs', 'Trophy'),
  ('writing_streak_3',  'Créateur en herbe',    '3 jours de publication consécutifs',  'PenLine'),
  ('writing_streak_7',  'Créateur régulier',    '7 jours de publication consécutifs',  'Flame'),
  ('writing_streak_30', 'Créateur infatigable', '30 jours de publication consécutifs', 'Trophy'),
  ('community_streak_7','Pilier de la communauté', '7 jours d''activité communautaire consécutifs', 'Flame'),
  ('first_publish',     'Premier pas',          'A publié sa première série ou œuvre', 'Sparkles');

-- Incrémente (ou réinitialise) la série de régularité de l'utilisateur
-- connecté pour le type donné, et attribue les badges de palier atteints.
-- Idempotent : appeler plusieurs fois le même jour ne compte qu'une fois.
create function public.record_streak_activity(p_streak_type text)
returns public.user_streaks
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_row public.user_streaks;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_streak_type not in ('reading', 'writing', 'community') then
    raise exception 'invalid streak type';
  end if;

  select * into v_row from public.user_streaks
  where user_id = v_user_id and streak_type = p_streak_type
  for update;

  if not found then
    insert into public.user_streaks (user_id, streak_type, current_count, longest_count, last_activity_date)
    values (v_user_id, p_streak_type, 1, 1, v_today)
    returning * into v_row;
  elsif v_row.last_activity_date = v_today then
    return v_row; -- déjà comptée aujourd'hui
  elsif v_row.last_activity_date = v_today - 1 then
    update public.user_streaks
    set current_count = v_row.current_count + 1,
        longest_count = greatest(v_row.longest_count, v_row.current_count + 1),
        last_activity_date = v_today,
        updated_at = now()
    where id = v_row.id
    returning * into v_row;
  else
    update public.user_streaks
    set current_count = 1,
        longest_count = greatest(v_row.longest_count, 1),
        last_activity_date = v_today,
        updated_at = now()
    where id = v_row.id
    returning * into v_row;
  end if;

  insert into public.user_badges (user_id, badge_id)
  select v_user_id, b.id from public.badges b
  where b.code in (
    case when v_row.current_count >= 3 then p_streak_type || '_streak_3' end,
    case when v_row.current_count >= 7 then p_streak_type || '_streak_7' end,
    case when v_row.current_count >= 30 then p_streak_type || '_streak_30' end
  )
  on conflict (user_id, badge_id) do nothing;

  return v_row;
end;
$$;

grant execute on function public.record_streak_activity(text) to authenticated;
revoke execute on function public.record_streak_activity(text) from anon;

-- Badge "Premier pas" à la première série (lecture) ou première œuvre (ecriture).
create function public.award_first_publish_badge()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_badges (user_id, badge_id)
  select new.author_id, id from public.badges where code = 'first_publish'
  on conflict (user_id, badge_id) do nothing;
  return new;
end;
$$;

create trigger award_first_publish_badge_series
  after insert on public.series
  for each row execute function public.award_first_publish_badge();

create trigger award_first_publish_badge_works
  after insert on public.works
  for each row execute function public.award_first_publish_badge();

revoke execute on function public.award_first_publish_badge() from anon, authenticated;

-- =============================================================================
-- Recherche unifiée — une requête, résultats des 3 plateformes (même base).
-- =============================================================================
create function public.global_search(search_term text, result_limit integer default 6)
returns table (
  result_type text,
  id uuid,
  title text,
  subtitle text,
  slug text
)
language sql
stable
as $$
  select * from (
    select 'series'::text, s.id, s.title, 'BD / Webtoon'::text, s.slug
    from public.series s
    where s.title ilike '%' || search_term || '%'
    order by s.views desc
    limit result_limit
  ) t
  union all
  select * from (
    select 'work'::text, w.id, w.title,
      (case w.work_type when 'light_novel' then 'Light novel' else 'Roman' end)::text, null::text
    from public.works w
    where w.title ilike '%' || search_term || '%'
    order by w.created_at desc
    limit result_limit
  ) t
  union all
  select * from (
    select 'community'::text, c.id, c.name, 'Communauté'::text, null::text
    from public.communities c
    where c.name ilike '%' || search_term || '%'
    order by c.created_at desc
    limit result_limit
  ) t
  union all
  select * from (
    select 'channel'::text, ch.id, ch.name, 'Canal'::text, null::text
    from public.channels ch
    where ch.name ilike '%' || search_term || '%'
    order by ch.created_at desc
    limit result_limit
  ) t
  union all
  select * from (
    select 'author'::text, p.id, p.display_name, ('@' || p.username)::text, p.username
    from public.profiles p
    where p.is_author and (p.display_name ilike '%' || search_term || '%' or p.username ilike '%' || search_term || '%')
    limit result_limit
  ) t
$$;

grant execute on function public.global_search(text, integer) to anon, authenticated;

-- =============================================================================
-- Classements hebdomadaires — nouveaux abonnés / nouveaux membres sur les
-- 7 derniers jours. Réutilise `follows`/`community_members` existants,
-- aucune donnée de série temporelle supplémentaire à maintenir.
-- =============================================================================
create function public.top_series_weekly(p_limit integer default 10)
returns table (series_id uuid, title text, slug text, cover_url text, author_username text, author_display_name text, new_followers bigint)
language sql stable as $$
  select s.id, s.title, s.slug, s.cover_url, p.username, p.display_name,
    count(f.id) filter (where f.created_at >= now() - interval '7 days') as new_followers
  from public.series s
  join public.profiles p on p.id = s.author_id
  left join public.follows f on f.target_type = 'series' and f.target_id = s.id
  group by s.id, p.username, p.display_name
  order by new_followers desc, s.views desc
  limit p_limit;
$$;

create function public.top_works_weekly(p_limit integer default 10)
returns table (work_id uuid, title text, work_type text, author_username text, author_display_name text, new_followers bigint)
language sql stable as $$
  select w.id, w.title, w.work_type, p.username, p.display_name,
    count(f.id) filter (where f.created_at >= now() - interval '7 days') as new_followers
  from public.works w
  join public.profiles p on p.id = w.author_id
  left join public.follows f on f.target_type = 'work' and f.target_id = w.id
  group by w.id, p.username, p.display_name
  order by new_followers desc, w.created_at desc
  limit p_limit;
$$;

create function public.top_communities_weekly(p_limit integer default 10)
returns table (community_id uuid, name text, is_validated boolean, new_members bigint)
language sql stable as $$
  select c.id, c.name, c.is_validated,
    count(cm.user_id) filter (where cm.joined_at >= now() - interval '7 days') as new_members
  from public.communities c
  left join public.community_members cm on cm.community_id = c.id
  group by c.id
  order by new_members desc, c.created_at desc
  limit p_limit;
$$;

create function public.top_channels_weekly(p_limit integer default 10)
returns table (channel_id uuid, name text, owner_username text, new_followers bigint)
language sql stable as $$
  select ch.id, ch.name, p.username,
    count(f.id) filter (where f.created_at >= now() - interval '7 days') as new_followers
  from public.channels ch
  join public.profiles p on p.id = ch.owner_id
  left join public.follows f on f.target_type = 'channel' and f.target_id = ch.id
  group by ch.id, p.username
  order by new_followers desc, ch.created_at desc
  limit p_limit;
$$;

-- Classement des créateurs, tous supports confondus (BD + écriture) —
-- même compte, donc une seule vitrine "top créateurs Hypercube".
create function public.top_authors_weekly(p_limit integer default 10)
returns table (author_id uuid, username text, display_name text, avatar_url text, new_followers bigint)
language sql stable as $$
  select p.id, p.username, p.display_name, p.avatar_url,
    count(f.id) filter (where f.created_at >= now() - interval '7 days') as new_followers
  from public.profiles p
  join public.follows f on f.target_type = 'author' and f.target_id = p.id
  where p.is_author
  group by p.id
  order by new_followers desc
  limit p_limit;
$$;

grant execute on function public.top_series_weekly(integer) to anon, authenticated;
grant execute on function public.top_works_weekly(integer) to anon, authenticated;
grant execute on function public.top_communities_weekly(integer) to anon, authenticated;
grant execute on function public.top_channels_weekly(integer) to anon, authenticated;
grant execute on function public.top_authors_weekly(integer) to anon, authenticated;
