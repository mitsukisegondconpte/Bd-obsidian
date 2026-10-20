-- Le "repêchage" (plateforme 2 -> plateforme 1) s'arrêtait à l'acceptation
-- de l'auteur : la ligne work_migrations passait à 'accepted', une annonce
-- était postée sur son canal, une notification envoyée — mais aucune série
-- n'était jamais créée sur la plateforme lecture. new_series_id restait
-- toujours null. MyWorks.jsx promet pourtant "elle sera republiée sur la
-- plateforme de lecture" : on tient cette promesse ici.
--
-- Note : on ne migre pas automatiquement les chapitres. Une série lecture
-- est faite de planches (chapter_pages) ; une oeuvre écriture est faite de
-- texte (work_chapters) — ce sont deux formats différents, pas une simple
-- conversion. Accepter crée la place de la série sur lecture (titre, résumé),
-- prête à recevoir les planches que l'auteur illustrera lui-même via le
-- panel auteur lecture. L'oeuvre originale reste sur ecriture (la retirer
-- automatiquement serait une action destructive à ne pas déclencher sans
-- confirmation explicite de l'auteur — pas géré par ce trigger).
create function public.complete_work_migration()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_title text;
  v_synopsis text;
  v_author_id uuid;
  v_slug text;
  v_series_id uuid;
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    select w.title, w.synopsis, w.author_id into v_title, v_synopsis, v_author_id
    from public.works w where w.id = new.work_id;

    v_slug := regexp_replace(lower(coalesce(v_title, 'oeuvre')), '[^a-z0-9]+', '-', 'g')
      || '-' || substr(md5(random()::text), 1, 5);

    insert into public.series (author_id, title, summary, status, slug)
    values (v_author_id, v_title, v_synopsis, 'ongoing', v_slug)
    returning id into v_series_id;

    new.new_series_id := v_series_id;
    new.status := 'completed';
    new.resolved_at := now();
  end if;
  return new;
end;
$$;

create trigger before_work_migration_accepted_complete
  before update on public.work_migrations
  for each row execute procedure public.complete_work_migration();

revoke execute on function public.complete_work_migration() from anon, authenticated, public;

-- Les deux triggers existants réagissaient à status = 'accepted', qui n'est
-- désormais plus jamais l'état persisté (le trigger BEFORE ci-dessus le
-- fait immédiatement passer à 'completed') — on les met à jour pour réagir
-- au vrai état final, et on lie la notification à la série créée.
create or replace function public.announce_accepted_migration()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  work_title text;
  work_author_id uuid;
  target_channel_id uuid;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    select title, author_id into work_title, work_author_id from public.works where id = new.work_id;

    select id into target_channel_id from public.channels where owner_id = work_author_id limit 1;

    if target_channel_id is not null then
      insert into public.channel_posts (channel_id, body)
      values (target_channel_id, 'Bonne nouvelle : « ' || work_title || ' » a maintenant sa propre série sur la plateforme Lecture !');
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.notify_migration_accepted()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  work_title text;
  work_author_id uuid;
  series_slug text;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    select title, author_id into work_title, work_author_id from public.works where id = new.work_id;
    select slug into series_slug from public.series where id = new.new_series_id;

    insert into public.notifications (user_id, type, title, body, link_path)
    values (
      work_author_id,
      'migration_accepted',
      'Ta série est en ligne',
      '« ' || work_title || ' » a maintenant sa propre série sur la plateforme Lecture — ajoute tes premières planches !',
      '/serie/' || series_slug
    );
  end if;
  return new;
end;
$$;
