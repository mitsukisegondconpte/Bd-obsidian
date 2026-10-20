-- =============================================================================
-- Plateforme 3 (réseau social) + synchronisation réelle entre les 3 plateformes
-- =============================================================================

-- 1) Un utilisateur qui publie une série (plateforme 1) ou une oeuvre
--    (plateforme 2) devient "auteur" partout, y compris sur la plateforme 3 —
--    c'est la même table `profiles`, donc la synchro est automatique.
create function public.mark_profile_as_author()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set is_author = true, updated_at = now()
  where id = new.author_id and is_author = false;
  return new;
end;
$$;

create trigger on_series_created_mark_author
  after insert on public.series
  for each row execute procedure public.mark_profile_as_author();

create trigger on_work_created_mark_author
  after insert on public.works
  for each row execute procedure public.mark_profile_as_author();

-- 2) Seuls les auteurs peuvent créer un canal (les lecteurs créent des
--    communautés/groupes de discussion, cf. règle du client).
drop policy "owners manage own channels" on public.channels;
create policy "authors create own channels" on public.channels for insert with check (
  auth.uid() = owner_id and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_author)
);

-- 3) Une communauté créée par l'auteur de l'oeuvre/série qu'elle concerne
--    est automatiquement certifiée "officielle" (un des critères de
--    validation du doc client : "créée par l'auteur d'une oeuvre pour
--    l'oeuvre"). Les autres communautés démarrent non validées — la
--    validation par audience/comportement dans la durée reste une action
--    admin (voir policy plus bas), pas automatisée ici.
create function public.auto_validate_official_community()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  related_author_id uuid;
begin
  if new.related_series_id is not null then
    select author_id into related_author_id from public.series where id = new.related_series_id;
  elsif new.related_work_id is not null then
    select author_id into related_author_id from public.works where id = new.related_work_id;
  end if;

  if related_author_id is not null and related_author_id = new.creator_id then
    new.is_validated := true;
    new.validated_at := now();
  end if;

  return new;
end;
$$;

create trigger before_community_insert_auto_validate
  before insert on public.communities
  for each row execute procedure public.auto_validate_official_community();

-- Les admins peuvent valider/dé-valider une communauté (critère "audience
-- dans la durée" + "aucun signalement", évalué manuellement pour l'instant).
create policy "admins validate communities" on public.communities for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_platform_admin)
);

-- 4) Quand un auteur accepte un repêchage (plateforme 2), on annonce
--    automatiquement la nouvelle sur son canal (plateforme 3) s'il en a un —
--    exemple concret de synchro inter-plateformes via la base commune.
create function public.announce_accepted_migration()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  work_title text;
  work_author_id uuid;
  target_channel_id uuid;
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    select title, author_id into work_title, work_author_id from public.works where id = new.work_id;

    select id into target_channel_id from public.channels where owner_id = work_author_id limit 1;

    if target_channel_id is not null then
      insert into public.channel_posts (channel_id, body)
      values (target_channel_id, 'Bonne nouvelle : « ' || work_title || ' » rejoint bientôt une nouvelle plateforme Hypercube !');
    end if;
  end if;
  return new;
end;
$$;

create trigger on_work_migration_accepted_announce
  after update on public.work_migrations
  for each row execute procedure public.announce_accepted_migration();
