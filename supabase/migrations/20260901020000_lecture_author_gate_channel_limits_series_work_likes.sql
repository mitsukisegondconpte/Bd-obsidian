-- Trois demandes du client (WhatsApp, 1er septembre) :
-- 1. Un auteur ne peut créer qu'UN SEUL canal par œuvre/série (au global,
--    pas juste par auteur — un canal "représente" cette œuvre), sauf pour
--    ses PROPRES œuvres où il peut toujours créer un canal (même si
--    l'œuvre n'est pas dans le Top 5 / mise en avant HOS-Bohio Mag).
-- 2. Publier sur le site 1 (lecture/BD) nécessite désormais d'être nommé
--    "auteur lecture" par un admin — is_author (site 2/écriture) reste
--    libre comme avant, is_lecture_author est une distinction séparée que
--    seul un admin peut accorder.
-- 3. On peut désormais aimer (❤) une série/œuvre entière, pas juste ses
--    chapitres.

-- =============================================================================
-- 1. Un seul canal par œuvre/série + bypass pour ses propres œuvres.
-- =============================================================================

create unique index idx_channels_unique_series on public.channels (related_series_id) where related_series_id is not null;
create unique index idx_channels_unique_work on public.channels (related_work_id) where related_work_id is not null;

create or replace function public.check_content_link_eligible()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.related_series_id is null and new.related_work_id is null then
    raise exception 'Un canal ou une communauté doit être lié à une œuvre officielle (HOS/Bohio Mag) ou figurant actuellement au Top 5 hebdomadaire.';
  end if;

  -- Un canal sur sa PROPRE œuvre est toujours permis, sans condition de
  -- classement ni de mise en avant (n'affecte pas les communautés).
  if TG_TABLE_NAME = 'channels' then
    if new.related_series_id is not null and exists (select 1 from public.series s where s.id = new.related_series_id and s.author_id = (select auth.uid())) then
      return new;
    end if;
    if new.related_work_id is not null and exists (select 1 from public.works w where w.id = new.related_work_id and w.author_id = (select auth.uid())) then
      return new;
    end if;
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
-- 2. Publication site 1 (lecture) réservée aux auteurs nommés par un admin.
-- =============================================================================

alter table public.profiles add column is_lecture_author boolean not null default false;

drop policy "authors manage own series" on public.series;
create policy "authors manage own series" on public.series for insert
  with check (
    (select auth.uid()) = author_id
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author)
  );

create or replace function public.admin_set_profile_flags(
  target_user_id uuid,
  new_is_author boolean default null,
  new_is_editor boolean default null,
  new_is_platform_admin boolean default null,
  new_is_suspended boolean default null,
  new_partner_verified boolean default null,
  new_is_lecture_author boolean default null
)
returns public.profiles
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  result public.profiles;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_platform_admin) then
    raise exception 'not authorized';
  end if;

  update public.profiles set
    is_author = coalesce(new_is_author, is_author),
    is_editor = coalesce(new_is_editor, is_editor),
    is_platform_admin = coalesce(new_is_platform_admin, is_platform_admin),
    is_suspended = coalesce(new_is_suspended, is_suspended),
    is_lecture_author = coalesce(new_is_lecture_author, is_lecture_author),
    partner_verified_at = case
      when new_partner_verified is true then now()
      when new_partner_verified is false then null
      else partner_verified_at
    end,
    updated_at = now()
  where id = target_user_id
  returning * into result;

  return result;
end;
$function$;

-- Le "repêchage" (ecriture -> lecture) est une nomination admin implicite :
-- l'auteur qui accepte devient officiellement auteur lecture.
create or replace function public.complete_work_migration()
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

    update public.profiles set is_lecture_author = true where id = v_author_id;

    v_slug := regexp_replace(lower(coalesce(v_title, 'oeuvre')), '[^a-z0-9]+', '-', 'g')
      || '-' || substr(md5(random()::text), 1, 5);

    insert into public.series (author_id, title, summary, status, slug)
    values (v_author_id, v_title, v_synopsis, 'ongoing', v_slug)
    returning id into v_series_id;

    new.new_series_id := v_series_id;
    new.status := 'completed';
  end if;
  return new;
end;
$$;

-- =============================================================================
-- 3. Aimer une série/œuvre entière (pas seulement ses chapitres).
-- =============================================================================

alter table public.likes drop constraint likes_target_type_check;
alter table public.likes add constraint likes_target_type_check
  check (target_type in ('chapter', 'comment', 'work_chapter', 'community_post', 'channel_post', 'series', 'work'));
