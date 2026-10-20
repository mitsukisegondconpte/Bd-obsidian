-- =============================================================================
-- Notifications unifiées inter-plateformes
-- =============================================================================
-- Une seule table, lue par les 3 apps (même compte Supabase) : un nouvel
-- abonné sur une série publiée depuis apps/lecture, un nouveau chapitre
-- publié depuis apps/ecriture, ou un repêchage accepté génèrent une
-- notification que l'utilisateur voit où qu'il se connecte ensuite —
-- exemple concret de synchro temps réel entre les 3 plateformes via la
-- base commune (au-delà du simple partage du compte).

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('new_follower', 'new_chapter', 'migration_accepted')),
  title       text not null,
  body        text,
  link_path   text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Chaque utilisateur ne voit et ne modifie (marquer comme lu) que ses
-- propres notifications. Aucune policy insert/delete pour les clients : les
-- lignes sont créées uniquement par les fonctions security definer
-- ci-dessous, déclenchées par de vraies actions sur les 3 plateformes.
create policy "users read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "users mark own notifications read" on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Résout le profil "propriétaire" d'une cible de `follows` (auteur, série,
-- oeuvre ou canal), pour savoir qui notifier d'un nouvel abonné.
create function public.resolve_follow_target_owner(p_target_type text, p_target_id uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  owner_id uuid;
begin
  if p_target_type = 'author' then
    owner_id := p_target_id;
  elsif p_target_type = 'series' then
    select author_id into owner_id from public.series where id = p_target_id;
  elsif p_target_type = 'work' then
    select author_id into owner_id from public.works where id = p_target_id;
  elsif p_target_type = 'channel' then
    select c.owner_id into owner_id from public.channels c where c.id = p_target_id;
  end if;
  return owner_id;
end;
$$;

create function public.notify_new_follower()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  owner_id uuid;
  follower_name text;
begin
  owner_id := public.resolve_follow_target_owner(new.target_type, new.target_id);
  if owner_id is null or owner_id = new.follower_id then
    return new;
  end if;

  select display_name into follower_name from public.profiles where id = new.follower_id;

  insert into public.notifications (user_id, type, title, body)
  values (owner_id, 'new_follower', 'Nouvel abonné', coalesce(follower_name, 'Quelqu''un') || ' s''est abonné(e) à toi.');

  return new;
end;
$$;

create trigger on_follow_created_notify
  after insert on public.follows
  for each row execute procedure public.notify_new_follower();

-- Nouveau chapitre publié (BD ou œuvre) : notifie tous les abonnés de la
-- série/œuvre concernée, sur les 2 plateformes de lecture.
create function public.notify_new_chapter()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  parent_title text;
  target_type_val text;
  parent_id uuid;
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
    select title into parent_title from public.series where id = new.series_id;
  else
    target_type_val := 'work';
    parent_id := new.work_id;
    select title into parent_title from public.works where id = new.work_id;
  end if;

  insert into public.notifications (user_id, type, title, body)
  select f.follower_id, 'new_chapter', 'Nouveau chapitre', coalesce(parent_title, 'Une série que tu suis') || ' vient de publier le chapitre ' || new.number
  from public.follows f
  where f.target_type = target_type_val and f.target_id = parent_id;

  return new;
end;
$$;

create trigger on_chapter_published_notify
  after insert or update on public.chapters
  for each row execute procedure public.notify_new_chapter();

create trigger on_work_chapter_published_notify
  after insert or update on public.work_chapters
  for each row execute procedure public.notify_new_chapter();

-- Repêchage accepté : en plus de l'annonce sur le canal (voir
-- 20260831040724_platform3_social_sync.sql), notifie directement l'auteur.
create function public.notify_migration_accepted()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  work_title text;
  work_author_id uuid;
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    select title, author_id into work_title, work_author_id from public.works where id = new.work_id;

    insert into public.notifications (user_id, type, title, body)
    values (work_author_id, 'migration_accepted', 'Repêchage accepté', '« ' || work_title || ' » va rejoindre une nouvelle plateforme Hypercube.');
  end if;
  return new;
end;
$$;

create trigger on_work_migration_accepted_notify
  after update on public.work_migrations
  for each row execute procedure public.notify_migration_accepted();
