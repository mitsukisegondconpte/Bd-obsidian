-- Seules les notifications de mention avaient un link_path — cliquer sur un
-- "nouvel abonné" ou un "nouveau chapitre" ne menait nulle part. On complète
-- les deux triggers restants.
create or replace function public.notify_new_follower()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  owner_id uuid;
  follower_name text;
  follower_username text;
begin
  owner_id := public.resolve_follow_target_owner(new.target_type, new.target_id);
  if owner_id is null or owner_id = new.follower_id then
    return new;
  end if;

  select display_name, username into follower_name, follower_username from public.profiles where id = new.follower_id;

  insert into public.notifications (user_id, type, title, body, link_path)
  values (
    owner_id,
    'new_follower',
    'Nouvel abonné',
    coalesce(follower_name, 'Quelqu''un') || ' s''est abonné(e) à toi.',
    case when follower_username is not null then '/profil/' || follower_username else null end
  );

  return new;
end;
$$;

create or replace function public.notify_new_chapter()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  parent_title text;
  target_type_val text;
  parent_id uuid;
  chapter_link text;
  series_slug text;
begin
  if new.published_at is null then
    return new;
  end if;
  if TG_OP = 'UPDATE' and old.published_at is not null then
    return new;
  end if;

  if TG_TABLE_NAME = 'chapters' then
    target_type_val := 'series';
    parent_id := new.series_id;
    select title, slug into parent_title, series_slug from public.series where id = new.series_id;
    chapter_link := '/serie/' || series_slug || '/chapitre/' || new.id;
  else
    target_type_val := 'work';
    parent_id := new.work_id;
    select title into parent_title from public.works where id = new.work_id;
    chapter_link := '/oeuvre/' || new.work_id || '/chapitre/' || new.id;
  end if;

  insert into public.notifications (user_id, type, title, body, link_path)
  select f.follower_id, 'new_chapter', 'Nouveau chapitre',
    coalesce(parent_title, 'Une série que tu suis') || ' vient de publier le chapitre ' || new.number,
    chapter_link
  from public.follows f
  where f.target_type = target_type_val and f.target_id = parent_id;

  return new;
end;
$$;
