-- =============================================================================
-- Hypercube Obsidian — schéma Supabase (identité via auth.users + RLS)
-- =============================================================================
-- Variante de database/schema.sql adaptée à Supabase :
--   - l'identité/mot de passe est gérée par Supabase Auth (auth.users), pas
--     par nous. `profiles` étend auth.users avec les infos communes aux 3
--     plateformes (is_author, is_editor, ...).
--   - un trigger crée automatiquement une ligne `profiles` à chaque inscription.
--   - Row Level Security (RLS) est activé sur toutes les tables : Supabase
--     expose chaque table du schéma "public" via son API REST, donc sans RLS
--     n'importe qui avec la clé publique pourrait lire/écrire n'importe quoi.
-- =============================================================================

create extension if not exists pgcrypto;

-- =============================================================================
-- 1. IDENTITÉ COMMUNE
-- =============================================================================

create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  username          text not null unique,
  display_name      text not null,
  avatar_url        text,
  bio               text,
  is_author         boolean not null default false,
  is_editor         boolean not null default false,
  is_platform_admin boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Crée automatiquement le profil au moment de l'inscription (auth.users).
-- Le username/display_name viennent des métadonnées passées à supabase.auth.signUp().
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.follows (
  id            uuid primary key default gen_random_uuid(),
  follower_id   uuid not null references public.profiles(id) on delete cascade,
  target_type   text not null check (target_type in ('author', 'series', 'work', 'channel')),
  target_id     uuid not null,
  created_at    timestamptz not null default now(),
  unique (follower_id, target_type, target_id)
);

create index idx_follows_target on public.follows (target_type, target_id);

-- =============================================================================
-- 2. PLATEFORME 1 — LECTURE & PUBLICATION
-- =============================================================================

create table public.genres (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

create table public.series (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  slug         text not null unique,
  summary      text,
  cover_url    text,
  banner_url   text,
  status       text not null default 'ongoing' check (status in ('ongoing', 'paused', 'completed')),
  update_day   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_series_author on public.series (author_id);

create table public.series_genres (
  series_id  uuid not null references public.series(id) on delete cascade,
  genre_id   uuid not null references public.genres(id) on delete cascade,
  primary key (series_id, genre_id)
);

create table public.chapters (
  id             uuid primary key default gen_random_uuid(),
  series_id      uuid not null references public.series(id) on delete cascade,
  number         integer not null,
  title          text not null,
  is_free        boolean not null default true,
  price_cents    integer not null default 0 check (price_cents >= 0),
  page_count     integer not null default 0,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  unique (series_id, number)
);

create index idx_chapters_series on public.chapters (series_id);

create table public.chapter_pages (
  id            uuid primary key default gen_random_uuid(),
  chapter_id    uuid not null references public.chapters(id) on delete cascade,
  page_number   integer not null,
  image_url     text not null,
  unique (chapter_id, page_number)
);

create table public.chapter_purchases (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  chapter_id     uuid not null references public.chapters(id) on delete cascade,
  amount_cents   integer not null check (amount_cents >= 0),
  currency       text not null default 'HTG',
  status         text not null default 'completed' check (status in ('pending', 'completed', 'refunded', 'failed')),
  purchased_at   timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create table public.comments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  target_type       text not null check (target_type in ('chapter', 'work_chapter', 'community_post', 'channel_post')),
  target_id         uuid not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body              text not null,
  created_at        timestamptz not null default now()
);

create index idx_comments_target on public.comments (target_type, target_id);

create table public.likes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  target_type  text not null check (target_type in ('chapter', 'comment', 'work_chapter', 'community_post', 'channel_post')),
  target_id    uuid not null,
  created_at   timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create index idx_likes_target on public.likes (target_type, target_id);

-- =============================================================================
-- 3. PLATEFORME 2 — ÉCRITURE & ÉDITION
-- =============================================================================

create table public.works (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  synopsis      text,
  work_type     text not null default 'novel' check (work_type in ('novel', 'light_novel')),
  cover_image_id uuid,
  status        text not null default 'ongoing' check (status in ('ongoing', 'paused', 'completed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.work_chapters (
  id            uuid primary key default gen_random_uuid(),
  work_id       uuid not null references public.works(id) on delete cascade,
  number        integer not null,
  title         text not null,
  content       text not null,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (work_id, number)
);

create table public.platform_images (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references public.profiles(id) on delete set null,
  source         text not null check (source in ('platform_catalog', 'user_upload', 'external_url')),
  image_url      text not null,
  is_free        boolean not null default true,
  price_cents    integer not null default 0 check (price_cents >= 0),
  created_at     timestamptz not null default now()
);

alter table public.works
  add constraint fk_works_cover_image
  foreign key (cover_image_id) references public.platform_images(id) on delete set null;

create table public.image_requests (
  id              uuid primary key default gen_random_uuid(),
  requester_id    uuid not null references public.profiles(id) on delete cascade,
  description     text not null,
  contact_channel text default 'whatsapp',
  status          text not null default 'pending' check (status in ('pending', 'in_discussion', 'delivered', 'cancelled')),
  price_cents     integer check (price_cents >= 0),
  delivered_image_id uuid references public.platform_images(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table public.edition_credits (
  user_id                   uuid primary key references public.profiles(id) on delete cascade,
  free_level1_credits_left  integer not null default 4 check (free_level1_credits_left >= 0)
);

-- Crédits gratuits initialisés automatiquement avec le profil.
create function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.edition_credits (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

create table public.edition_requests (
  id               uuid primary key default gen_random_uuid(),
  work_id          uuid not null references public.works(id) on delete cascade,
  work_chapter_id  uuid references public.work_chapters(id) on delete cascade,
  author_id        uuid not null references public.profiles(id) on delete cascade,
  editor_id        uuid references public.profiles(id) on delete set null,
  level            integer not null check (level in (1, 2, 3)),
  status           text not null default 'pending' check (status in ('pending', 'assigned', 'in_progress', 'delivered', 'cancelled')),
  used_free_credit boolean not null default false,
  price_cents      integer not null default 0 check (price_cents >= 0),
  feedback         text,
  created_at       timestamptz not null default now(),
  delivered_at     timestamptz
);

create index idx_edition_requests_author on public.edition_requests (author_id);
create index idx_edition_requests_editor on public.edition_requests (editor_id);

create table public.work_migrations (
  id                uuid primary key default gen_random_uuid(),
  work_id           uuid not null references public.works(id) on delete cascade,
  target_platform   text not null check (target_platform in ('reading_publishing')),
  status            text not null default 'proposed' check (status in ('proposed', 'accepted', 'declined', 'completed')),
  new_series_id     uuid references public.series(id) on delete set null,
  proposed_at       timestamptz not null default now(),
  resolved_at       timestamptz
);

-- =============================================================================
-- 4. PLATEFORME 3 — RÉSEAU SOCIAL
-- =============================================================================

create table public.channels (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  description  text,
  created_at   timestamptz not null default now()
);

create table public.channel_posts (
  id           uuid primary key default gen_random_uuid(),
  channel_id   uuid not null references public.channels(id) on delete cascade,
  body         text not null,
  media_url    text,
  created_at   timestamptz not null default now()
);

create index idx_channel_posts_channel on public.channel_posts (channel_id);

create table public.communities (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid not null references public.profiles(id) on delete cascade,
  name             text not null,
  description      text,
  related_series_id uuid references public.series(id) on delete set null,
  related_work_id  uuid references public.works(id) on delete set null,
  is_validated     boolean not null default false,
  validated_at     timestamptz,
  created_at       timestamptz not null default now()
);

create table public.community_members (
  community_id  uuid not null references public.communities(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          text not null default 'member' check (role in ('member', 'moderator')),
  joined_at     timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.community_posts (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  author_id     uuid not null references public.profiles(id) on delete cascade,
  body          text not null,
  media_url     text,
  created_at    timestamptz not null default now()
);

create index idx_community_posts_community on public.community_posts (community_id);

create table public.community_reports (
  id             uuid primary key default gen_random_uuid(),
  community_id   uuid not null references public.communities(id) on delete cascade,
  reporter_id    uuid not null references public.profiles(id) on delete cascade,
  reason         text not null,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);

-- =============================================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================================
-- Règle générale : lecture publique sur le contenu publié (comme un site de
-- lecture classique), écriture réservée au propriétaire de la ligne
-- (auth.uid() = ...). Les cas "admin uniquement" (valider une communauté,
-- gérer les crédits d'édition) sont volontairement laissés sans policy
-- d'écriture cliente : ils passent par la clé service_role côté backend.

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.genres enable row level security;
alter table public.series enable row level security;
alter table public.series_genres enable row level security;
alter table public.chapters enable row level security;
alter table public.chapter_pages enable row level security;
alter table public.chapter_purchases enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.works enable row level security;
alter table public.work_chapters enable row level security;
alter table public.platform_images enable row level security;
alter table public.image_requests enable row level security;
alter table public.edition_credits enable row level security;
alter table public.edition_requests enable row level security;
alter table public.work_migrations enable row level security;
alter table public.channels enable row level security;
alter table public.channel_posts enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_reports enable row level security;

-- Profiles : visibles par tous, modifiables seulement par leur propriétaire.
create policy "profiles are publicly readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- Follows : visibles par tous (compteurs d'abonnés publics), gérés par soi-même.
create policy "follows are publicly readable" on public.follows for select using (true);
create policy "users manage own follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "users remove own follows" on public.follows for delete using (auth.uid() = follower_id);

-- Genres : catalogue public en lecture seule côté client.
create policy "genres are publicly readable" on public.genres for select using (true);

-- Series : lecture publique, écriture réservée à l'auteur.
create policy "series are publicly readable" on public.series for select using (true);
create policy "authors manage own series" on public.series for insert with check (auth.uid() = author_id);
create policy "authors update own series" on public.series for update using (auth.uid() = author_id);
create policy "authors delete own series" on public.series for delete using (auth.uid() = author_id);

create policy "series_genres are publicly readable" on public.series_genres for select using (true);
create policy "authors tag own series" on public.series_genres for insert with check (
  exists (select 1 from public.series s where s.id = series_id and s.author_id = auth.uid())
);
create policy "authors untag own series" on public.series_genres for delete using (
  exists (select 1 from public.series s where s.id = series_id and s.author_id = auth.uid())
);

-- Chapters / pages : lecture publique, écriture réservée à l'auteur de la série.
create policy "chapters are publicly readable" on public.chapters for select using (true);
create policy "authors manage own chapters" on public.chapters for insert with check (
  exists (select 1 from public.series s where s.id = series_id and s.author_id = auth.uid())
);
create policy "authors update own chapters" on public.chapters for update using (
  exists (select 1 from public.series s where s.id = series_id and s.author_id = auth.uid())
);
create policy "authors delete own chapters" on public.chapters for delete using (
  exists (select 1 from public.series s where s.id = series_id and s.author_id = auth.uid())
);

create policy "chapter_pages are publicly readable" on public.chapter_pages for select using (true);
create policy "authors manage own chapter pages" on public.chapter_pages for insert with check (
  exists (
    select 1 from public.chapters c join public.series s on s.id = c.series_id
    where c.id = chapter_id and s.author_id = auth.uid()
  )
);
create policy "authors delete own chapter pages" on public.chapter_pages for delete using (
  exists (
    select 1 from public.chapters c join public.series s on s.id = c.series_id
    where c.id = chapter_id and s.author_id = auth.uid()
  )
);

-- Achats : chacun ne voit et ne crée que ses propres achats.
create policy "users view own purchases" on public.chapter_purchases for select using (auth.uid() = user_id);
create policy "users create own purchases" on public.chapter_purchases for insert with check (auth.uid() = user_id);

-- Commentaires / likes : lecture publique, écriture/suppression par l'auteur du commentaire.
create policy "comments are publicly readable" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "users delete own comments" on public.comments for delete using (auth.uid() = user_id);

create policy "likes are publicly readable" on public.likes for select using (true);
create policy "users manage own likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "users remove own likes" on public.likes for delete using (auth.uid() = user_id);

-- Works / chapitres d'écriture : lecture publique, écriture réservée à l'auteur.
create policy "works are publicly readable" on public.works for select using (true);
create policy "authors manage own works" on public.works for insert with check (auth.uid() = author_id);
create policy "authors update own works" on public.works for update using (auth.uid() = author_id);
create policy "authors delete own works" on public.works for delete using (auth.uid() = author_id);

create policy "work_chapters are publicly readable" on public.work_chapters for select using (true);
create policy "authors manage own work chapters" on public.work_chapters for insert with check (
  exists (select 1 from public.works w where w.id = work_id and w.author_id = auth.uid())
);
create policy "authors update own work chapters" on public.work_chapters for update using (
  exists (select 1 from public.works w where w.id = work_id and w.author_id = auth.uid())
);

-- Images : catalogue public en lecture, upload réservé à son propriétaire.
create policy "platform_images are publicly readable" on public.platform_images for select using (true);
create policy "users upload own images" on public.platform_images for insert with check (
  owner_id is null or owner_id = auth.uid()
);

-- Demandes d'image sur mesure : visibles/gérées par leur demandeur uniquement.
create policy "users view own image requests" on public.image_requests for select using (auth.uid() = requester_id);
create policy "users create own image requests" on public.image_requests for insert with check (auth.uid() = requester_id);

-- Crédits d'édition : lecture seule pour soi-même (les mouvements de crédit
-- passent par une fonction service-role, pas par un update client direct).
create policy "users view own edition credits" on public.edition_credits for select using (auth.uid() = user_id);

-- Demandes d'édition : visibles par l'auteur concerné et l'éditeur assigné.
create policy "authors view own edition requests" on public.edition_requests for select using (
  auth.uid() = author_id or auth.uid() = editor_id
);
create policy "authors create own edition requests" on public.edition_requests for insert with check (auth.uid() = author_id);
create policy "editors update assigned requests" on public.edition_requests for update using (auth.uid() = editor_id);

-- Migrations d'oeuvre : visibles par l'auteur de l'oeuvre concernée.
create policy "authors view own work migrations" on public.work_migrations for select using (
  exists (select 1 from public.works w where w.id = work_id and w.author_id = auth.uid())
);

-- Canaux : lecture publique, gestion réservée au propriétaire.
create policy "channels are publicly readable" on public.channels for select using (true);
create policy "owners manage own channels" on public.channels for insert with check (auth.uid() = owner_id);
create policy "owners update own channels" on public.channels for update using (auth.uid() = owner_id);

create policy "channel_posts are publicly readable" on public.channel_posts for select using (true);
create policy "owners post in own channels" on public.channel_posts for insert with check (
  exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
);

-- Communautés : lecture publique, création libre (validation gérée côté admin/service-role).
create policy "communities are publicly readable" on public.communities for select using (true);
create policy "users create communities" on public.communities for insert with check (auth.uid() = creator_id);
create policy "creators update own communities" on public.communities for update using (auth.uid() = creator_id);

create policy "community_members are publicly readable" on public.community_members for select using (true);
create policy "users join communities" on public.community_members for insert with check (auth.uid() = user_id);
create policy "users leave communities" on public.community_members for delete using (auth.uid() = user_id);

create policy "community_posts are publicly readable" on public.community_posts for select using (true);
create policy "members post in communities" on public.community_posts for insert with check (
  auth.uid() = author_id and exists (
    select 1 from public.community_members m where m.community_id = community_posts.community_id and m.user_id = auth.uid()
  )
);

-- Signalements : n'importe quel utilisateur connecté peut signaler ; seuls
-- l'auteur du signalement et les admins peuvent le consulter.
create policy "users create reports" on public.community_reports for insert with check (auth.uid() = reporter_id);
create policy "reporters view own reports" on public.community_reports for select using (
  auth.uid() = reporter_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_platform_admin)
);

-- =============================================================================
-- 6. MIGRATIONS SUIVANTES (voir supabase/migrations/ pour le détail exact et
--    l'ordre d'application — cette section est une copie de lecture, pas la
--    source de vérité).
-- =============================================================================

-- Fonctionnalités additionnelles pour la plateforme 2 (écriture) :
-- tags libres, brouillon/publié, reprise de lecture, listes de lecture.

alter table public.works add column tags text[] not null default '{}';
create index idx_works_tags on public.works using gin (tags);

alter table public.work_chapters add column is_draft boolean not null default true;

-- Un chapitre en brouillon n'est visible que par l'auteur de l'oeuvre.
drop policy "work_chapters are publicly readable" on public.work_chapters;
create policy "published work_chapters are publicly readable" on public.work_chapters for select using (
  not is_draft or exists (select 1 from public.works w where w.id = work_id and w.author_id = auth.uid())
);

-- Reprendre la lecture : un seul repère par utilisateur × oeuvre.
create table public.reading_progress (
  user_id          uuid not null references public.profiles(id) on delete cascade,
  work_id          uuid not null references public.works(id) on delete cascade,
  last_chapter_id  uuid references public.work_chapters(id) on delete set null,
  updated_at       timestamptz not null default now(),
  primary key (user_id, work_id)
);

alter table public.reading_progress enable row level security;
create policy "users manage own reading progress" on public.reading_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Listes de lecture (collections perso, façon "à lire plus tard").
create table public.reading_lists (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table public.reading_list_items (
  list_id    uuid not null references public.reading_lists(id) on delete cascade,
  work_id    uuid not null references public.works(id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (list_id, work_id)
);

alter table public.reading_lists enable row level security;
alter table public.reading_list_items enable row level security;

create policy "reading_lists are publicly readable" on public.reading_lists for select using (true);
create policy "users manage own reading lists" on public.reading_lists for insert with check (auth.uid() = owner_id);
create policy "users update own reading lists" on public.reading_lists for update using (auth.uid() = owner_id);
create policy "users delete own reading lists" on public.reading_lists for delete using (auth.uid() = owner_id);

create policy "reading_list_items are publicly readable" on public.reading_list_items for select using (true);
create policy "owners manage own reading list items" on public.reading_list_items for insert with check (
  exists (select 1 from public.reading_lists l where l.id = list_id and l.owner_id = auth.uid())
);
create policy "owners remove own reading list items" on public.reading_list_items for delete using (
  exists (select 1 from public.reading_lists l where l.id = list_id and l.owner_id = auth.uid())
);
-- Fonction sécurisée pour décrémenter son propre crédit d'édition niveau 1.
-- Les clients n'ont pas de policy UPDATE directe sur edition_credits (voir
-- schéma) : ce passage obligé empêche un utilisateur de remonter son propre
-- solde, seul le décrément via demande réelle est possible.
create function public.decrement_edition_credit(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'not allowed';
  end if;

  update public.edition_credits
  set free_level1_credits_left = free_level1_credits_left - 1
  where user_id = p_user_id and free_level1_credits_left > 0;
end;
$$;

grant execute on function public.decrement_edition_credit(uuid) to authenticated;
-- Bucket public pour les couvertures uploadées depuis l'appareil de l'utilisateur.
insert into storage.buckets (id, name, public)
values ('work-covers', 'work-covers', true)
on conflict (id) do nothing;

create policy "work-covers are publicly readable"
on storage.objects for select
using (bucket_id = 'work-covers');

-- Chaque utilisateur ne peut écrire que dans son propre dossier (work-covers/<user_id>/...).
create policy "users upload to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'work-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users manage their own uploaded files"
on storage.objects for update
using (bucket_id = 'work-covers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own uploaded files"
on storage.objects for delete
using (bucket_id = 'work-covers' and (storage.foldername(name))[1] = auth.uid()::text);
-- Permet à l'auteur de répondre (accepter/refuser) à une proposition de
-- repêchage par Hypercube Obsidian sur sa propre oeuvre.
create policy "authors respond to own work migrations" on public.work_migrations for update using (
  exists (select 1 from public.works w where w.id = work_id and w.author_id = auth.uid())
);

-- Plateforme 3 (réseau social) + synchronisation cross-plateforme :
-- voir supabase/migrations/20260831040724_platform3_social_sync.sql

-- Champs d'affichage plateforme 1 (note, vues) :
-- voir supabase/migrations/20260831044127_platform1_display_fields.sql

-- Durcissement de handle_new_user() pour l'inscription Google OAuth
-- (username dérivé sans collision, nom/avatar depuis les métadonnées Google) :
-- voir supabase/migrations/20260831053000_oauth_signup_hardening.sql
