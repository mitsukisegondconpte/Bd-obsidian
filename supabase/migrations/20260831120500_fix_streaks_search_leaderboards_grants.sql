-- `create function` accorde EXECUTE au pseudo-rôle PUBLIC par défaut ; le
-- `revoke ... from anon, authenticated` de la migration précédente ne
-- touchait pas ce grant (même piège que fix_lock_down_internal_functions_v2).
-- On referme la vraie porte ici, et on fixe le search_path mutable des
-- fonctions SQL (linter sécurité) au passage.

revoke execute on function public.record_streak_activity(text) from public;
revoke execute on function public.award_first_publish_badge() from public, authenticated;

create or replace function public.global_search(search_term text, result_limit integer default 6)
returns table (
  result_type text,
  id uuid,
  title text,
  subtitle text,
  slug text
)
language sql
stable
set search_path = public
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

create or replace function public.top_series_weekly(p_limit integer default 10)
returns table (series_id uuid, title text, slug text, cover_url text, author_username text, author_display_name text, new_followers bigint)
language sql stable set search_path = public as $$
  select s.id, s.title, s.slug, s.cover_url, p.username, p.display_name,
    count(f.id) filter (where f.created_at >= now() - interval '7 days') as new_followers
  from public.series s
  join public.profiles p on p.id = s.author_id
  left join public.follows f on f.target_type = 'series' and f.target_id = s.id
  group by s.id, p.username, p.display_name
  order by new_followers desc, s.views desc
  limit p_limit;
$$;

create or replace function public.top_works_weekly(p_limit integer default 10)
returns table (work_id uuid, title text, work_type text, author_username text, author_display_name text, new_followers bigint)
language sql stable set search_path = public as $$
  select w.id, w.title, w.work_type, p.username, p.display_name,
    count(f.id) filter (where f.created_at >= now() - interval '7 days') as new_followers
  from public.works w
  join public.profiles p on p.id = w.author_id
  left join public.follows f on f.target_type = 'work' and f.target_id = w.id
  group by w.id, p.username, p.display_name
  order by new_followers desc, w.created_at desc
  limit p_limit;
$$;

create or replace function public.top_communities_weekly(p_limit integer default 10)
returns table (community_id uuid, name text, is_validated boolean, new_members bigint)
language sql stable set search_path = public as $$
  select c.id, c.name, c.is_validated,
    count(cm.user_id) filter (where cm.joined_at >= now() - interval '7 days') as new_members
  from public.communities c
  left join public.community_members cm on cm.community_id = c.id
  group by c.id
  order by new_members desc, c.created_at desc
  limit p_limit;
$$;

create or replace function public.top_channels_weekly(p_limit integer default 10)
returns table (channel_id uuid, name text, owner_username text, new_followers bigint)
language sql stable set search_path = public as $$
  select ch.id, ch.name, p.username,
    count(f.id) filter (where f.created_at >= now() - interval '7 days') as new_followers
  from public.channels ch
  join public.profiles p on p.id = ch.owner_id
  left join public.follows f on f.target_type = 'channel' and f.target_id = ch.id
  group by ch.id, p.username
  order by new_followers desc, ch.created_at desc
  limit p_limit;
$$;

create or replace function public.top_authors_weekly(p_limit integer default 10)
returns table (author_id uuid, username text, display_name text, avatar_url text, new_followers bigint)
language sql stable set search_path = public as $$
  select p.id, p.username, p.display_name, p.avatar_url,
    count(f.id) filter (where f.created_at >= now() - interval '7 days') as new_followers
  from public.profiles p
  join public.follows f on f.target_type = 'author' and f.target_id = p.id
  where p.is_author
  group by p.id
  order by new_followers desc
  limit p_limit;
$$;

grant execute on function public.global_search(text, integer) to anon, authenticated;
grant execute on function public.top_series_weekly(integer) to anon, authenticated;
grant execute on function public.top_works_weekly(integer) to anon, authenticated;
grant execute on function public.top_communities_weekly(integer) to anon, authenticated;
grant execute on function public.top_channels_weekly(integer) to anon, authenticated;
grant execute on function public.top_authors_weekly(integer) to anon, authenticated;
