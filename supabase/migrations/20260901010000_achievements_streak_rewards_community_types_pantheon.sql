-- Lot "achievements enrichis + streak + badges commentaires + types de
-- communauté + panthéon" demandé par l'équipe du client (historique WhatsApp
-- du 31 août). Le système gacha et la récompense "coins" ne sont PAS inclus
-- ici : il n'existe pas encore de vrai système de coins/portefeuille sur la
-- plateforme (les achats de chapitres sont simulés, cf. pages légales) — ce
-- sera un chantier à part quand ce système existera.

-- =============================================================================
-- 1. Achievements enrichis : rareté + compteurs cumulés (chapitres lus,
--    commentaires postés), badges "collectionneur" en méta-récompense.
-- =============================================================================

alter table public.badges add column rarity text not null default 'common'
  check (rarity in ('common', 'rare', 'super_rare', 'legendary'));
alter table public.badges add column threshold_counter_type text check (threshold_counter_type in ('chapters_read', 'comments_posted', 'badges_collected'));
alter table public.badges add column threshold_count integer;

update public.badges set rarity = 'common' where code in ('reading_streak_3', 'writing_streak_3', 'first_publish');
update public.badges set rarity = 'rare' where code in ('reading_streak_7', 'writing_streak_7', 'community_streak_7');
update public.badges set rarity = 'legendary' where code in ('reading_streak_30', 'writing_streak_30');

insert into public.badges (code, label, description, icon, rarity, threshold_counter_type, threshold_count) values
  ('chapters_read_5',    'Dévore-pages',       'A lu 5 chapitres',                    'BookOpen', 'common',     'chapters_read', 5),
  ('chapters_read_25',   'Grand lecteur',      'A lu 25 chapitres',                   'BookOpen', 'rare',       'chapters_read', 25),
  ('chapters_read_100',  'Bibliophile',        'A lu 100 chapitres',                  'Trophy',   'legendary',  'chapters_read', 100),
  ('comments_posted_1',    'Première voix',      'A laissé 1 commentaire',              'Award', 'common',     'comments_posted', 1),
  ('comments_posted_100',  'Voix connue',        'A laissé 100 commentaires',           'Award', 'rare',       'comments_posted', 100),
  ('comments_posted_500',  'Voix respectée',     'A laissé 500 commentaires',           'Award', 'super_rare', 'comments_posted', 500),
  ('comments_posted_1000', 'Voix légendaire',    'A laissé 1000 commentaires',          'Award', 'legendary',  'comments_posted', 1000),
  ('collector_5',   'Collectionneur',        'A obtenu 5 badges',   'Sparkles', 'rare',       'badges_collected', 5),
  ('collector_15',  'Grand collectionneur',  'A obtenu 15 badges',  'Sparkles', 'super_rare', 'badges_collected', 15),
  ('collector_30',  'Maître collectionneur', 'A obtenu 30 badges',  'Sparkles', 'legendary',  'badges_collected', 30);

create table public.user_counters (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  counter_type text not null check (counter_type in ('chapters_read', 'comments_posted')),
  count        integer not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (user_id, counter_type)
);

alter table public.user_counters enable row level security;
create policy "user_counters are publicly readable" on public.user_counters for select using (true);
-- Pas de policy insert/update : écriture uniquement via increment_user_counter().

-- Badges "collectionneur" : à appeler après tout octroi de badge, pour
-- réagir au nombre total de badges désormais détenus par l'utilisateur.
create function public.award_collector_badges(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_total integer;
begin
  select count(*) into v_total from public.user_badges where user_id = p_user_id;

  insert into public.user_badges (user_id, badge_id)
  select p_user_id, b.id from public.badges b
  where b.threshold_counter_type = 'badges_collected' and b.threshold_count <= v_total
  on conflict (user_id, badge_id) do nothing;
end;
$$;

revoke execute on function public.award_collector_badges(uuid) from anon, authenticated;

-- Incrémente un compteur cumulé (chapitres lus, commentaires postés) pour
-- l'utilisateur connecté et attribue les badges de palier atteints.
create function public.increment_user_counter(p_counter_type text)
returns public.user_counters
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.user_counters;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_counter_type not in ('chapters_read', 'comments_posted') then
    raise exception 'invalid counter type';
  end if;

  insert into public.user_counters (user_id, counter_type, count)
  values (v_user_id, p_counter_type, 1)
  on conflict (user_id, counter_type) do update set count = user_counters.count + 1, updated_at = now()
  returning * into v_row;

  insert into public.user_badges (user_id, badge_id)
  select v_user_id, b.id from public.badges b
  where b.threshold_counter_type = p_counter_type and b.threshold_count <= v_row.count
  on conflict (user_id, badge_id) do nothing;

  perform public.award_collector_badges(v_user_id);

  return v_row;
end;
$$;

grant execute on function public.increment_user_counter(text) to authenticated;
revoke execute on function public.increment_user_counter(text) from anon;

-- record_streak_activity gagne aussi la vérification des badges collectionneur.
create or replace function public.record_streak_activity(p_streak_type text)
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
    return v_row;
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

  perform public.award_collector_badges(v_user_id);

  return v_row;
end;
$$;

-- Statistique sociale "X% des utilisateurs ont ce badge".
create function public.badge_stats()
returns table (badge_id uuid, holder_count bigint, holder_percent numeric)
language sql stable as $$
  select b.id, count(ub.user_id),
    round(100.0 * count(ub.user_id) / nullif((select count(*) from public.profiles), 0), 1)
  from public.badges b
  left join public.user_badges ub on ub.badge_id = b.id
  group by b.id;
$$;

grant execute on function public.badge_stats() to anon, authenticated;

-- =============================================================================
-- 2. Deux types de communauté/canal : "hypercube_world" (top 5 hebdomadaire
--    uniquement) et "officiel" (œuvres HOS/Bohio Mag, via is_featured).
-- =============================================================================

alter table public.communities add column link_type text not null default 'hypercube_world' check (link_type in ('hypercube_world', 'officiel'));
alter table public.channels add column link_type text not null default 'hypercube_world' check (link_type in ('hypercube_world', 'officiel'));

create or replace function public.check_content_link_eligible()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.related_series_id is null and new.related_work_id is null then
    raise exception 'Un canal ou une communauté doit être lié à une œuvre officielle (HOS/Bohio Mag) ou figurant actuellement au Top 5 hebdomadaire.';
  end if;

  if new.link_type = 'officiel' then
    if new.related_work_id is null or not exists (select 1 from public.works w where w.id = new.related_work_id and w.is_featured) then
      raise exception 'Le type "Officiel" nécessite une œuvre mise en avant HOS/Bohio Mag.';
    end if;
    if new.related_series_id is not null then
      raise exception 'Le type "Officiel" ne s''applique qu''aux œuvres HOS/Bohio Mag (pas aux séries BD).';
    end if;
  else
    if new.related_series_id is not null and not exists (select 1 from public.top_series_weekly(5) t where t.series_id = new.related_series_id) then
      raise exception 'Le type "Hypercube World" est réservé aux 5 séries les plus populaires actuellement.';
    end if;
    if new.related_work_id is not null and not exists (select 1 from public.top_works_weekly(5) t where t.work_id = new.related_work_id) then
      raise exception 'Le type "Hypercube World" est réservé aux 5 œuvres les plus populaires actuellement.';
    end if;
  end if;

  return new;
end;
$$;

-- =============================================================================
-- 3. Panthéon : classement all-time (pas hebdomadaire) par score de prestige
--    pondéré selon la rareté des badges obtenus.
-- =============================================================================

create function public.pantheon_top_users(p_limit integer default 20)
returns table (user_id uuid, username text, display_name text, avatar_url text, prestige_score bigint, badge_count bigint)
language sql stable as $$
  select p.id, p.username, p.display_name, p.avatar_url,
    coalesce(sum(case b.rarity
      when 'legendary' then 15
      when 'super_rare' then 7
      when 'rare' then 3
      else 1 end), 0) as prestige_score,
    count(ub.id) as badge_count
  from public.profiles p
  join public.user_badges ub on ub.user_id = p.id
  join public.badges b on b.id = ub.badge_id
  group by p.id
  order by prestige_score desc, badge_count desc
  limit p_limit;
$$;

grant execute on function public.pantheon_top_users(integer) to anon, authenticated;
