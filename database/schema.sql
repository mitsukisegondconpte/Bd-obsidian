-- =============================================================================
-- Hypercube Obsidian — schéma de base de données unique pour les 3 plateformes
-- =============================================================================
--
-- Architecture : UNE seule base de données PostgreSQL, partagée par les 3
-- plateformes front-end (déployées séparément) :
--   1. Lecture & publication de BD/webtoons   (déjà prototypé en front-end)
--   2. Écriture façon Wattpad (romans, light novels, édition, images)
--   3. Réseau social (canaux, communautés)
--
-- Le principe : "users" est LA table d'identité commune. Un compte créé sur
-- une plateforme fonctionne sur les 2 autres (même login), et n'importe
-- quelle plateforme peut vérifier si l'utilisateur connecté est déjà auteur,
-- éditeur, etc. en interrogeant les mêmes tables.
--
-- Convention : clés primaires en UUID (portables entre services, pas de
-- collision même si plusieurs apps/back-ends écrivent dans la même base).
--
-- Note Supabase : si le projet utilise Supabase, la table `users` ci-dessous
-- peut être remplacée par une table `profiles` avec
-- `id uuid primary key references auth.users(id) on delete cascade`
-- (Supabase gère alors mots de passe / sessions / OAuth nativement).
-- Le reste du schéma ne change pas.
-- =============================================================================

create extension if not exists pgcrypto; -- pour gen_random_uuid()

-- =============================================================================
-- 1. IDENTITÉ COMMUNE (partagée par les 3 plateformes)
-- =============================================================================

create table users (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  username          text not null unique,
  password_hash     text,                         -- null si auth déléguée (Supabase/OAuth)
  display_name      text not null,
  avatar_url        text,
  bio               text,
  is_author         boolean not null default false, -- vrai dès la 1re oeuvre publiée
  is_editor         boolean not null default false, -- propose des services d'édition (plateforme 2)
  is_platform_admin boolean not null default false, -- modère les communautés, valide les demandes
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_users_username on users (username);

-- Relation générique "je suis abonné à" : un auteur, une série/oeuvre, ou un
-- canal. Remplace les 2-3 tables de follow qu'on aurait dû dupliquer par
-- plateforme.
create table follows (
  id            uuid primary key default gen_random_uuid(),
  follower_id   uuid not null references users(id) on delete cascade,
  target_type   text not null check (target_type in ('author', 'series', 'work', 'channel')),
  target_id     uuid not null, -- pointe vers users.id, series.id, works.id ou channels.id selon target_type
  created_at    timestamptz not null default now(),
  unique (follower_id, target_type, target_id)
);

create index idx_follows_target on follows (target_type, target_id);

-- =============================================================================
-- 2. PLATEFORME 1 — LECTURE & PUBLICATION (BD / webtoons)
-- =============================================================================

create table genres (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

create table series (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references users(id) on delete cascade,
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

create index idx_series_author on series (author_id);

create table series_genres (
  series_id  uuid not null references series(id) on delete cascade,
  genre_id   uuid not null references genres(id) on delete cascade,
  primary key (series_id, genre_id)
);

create table chapters (
  id             uuid primary key default gen_random_uuid(),
  series_id      uuid not null references series(id) on delete cascade,
  number         integer not null,
  title          text not null,
  is_free        boolean not null default true,
  price_cents    integer not null default 0 check (price_cents >= 0),
  page_count     integer not null default 0,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  unique (series_id, number)
);

create index idx_chapters_series on chapters (series_id);

create table chapter_pages (
  id            uuid primary key default gen_random_uuid(),
  chapter_id    uuid not null references chapters(id) on delete cascade,
  page_number   integer not null,
  image_url     text not null,
  unique (chapter_id, page_number)
);

-- Achat d'un chapitre payant.
create table chapter_purchases (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  chapter_id     uuid not null references chapters(id) on delete cascade,
  amount_cents   integer not null check (amount_cents >= 0),
  currency       text not null default 'HTG',
  status         text not null default 'completed' check (status in ('pending', 'completed', 'refunded', 'failed')),
  purchased_at   timestamptz not null default now(),
  unique (user_id, chapter_id)
);

-- Commentaires : générique pour pouvoir aussi servir platform 2/3 plus tard
-- (target_type/target_id), évite de dupliquer la table par contexte.
create table comments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  target_type       text not null check (target_type in ('chapter', 'work_chapter', 'community_post', 'channel_post')),
  target_id         uuid not null,
  parent_comment_id uuid references comments(id) on delete cascade,
  body              text not null,
  created_at        timestamptz not null default now()
);

create index idx_comments_target on comments (target_type, target_id);

create table likes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  target_type  text not null check (target_type in ('chapter', 'comment', 'work_chapter', 'community_post', 'channel_post')),
  target_id    uuid not null,
  created_at   timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create index idx_likes_target on likes (target_type, target_id);

-- =============================================================================
-- 3. PLATEFORME 2 — ÉCRITURE (façon Wattpad : romans / light novels + édition)
-- =============================================================================

-- Oeuvres créées librement par les utilisateurs. La publication d'une oeuvre
-- elle-même est gratuite (voir doc client) — seuls les visuels et
-- l'accompagnement éditorial peuvent être payants.
create table works (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references users(id) on delete cascade,
  title         text not null,
  synopsis      text,
  work_type     text not null default 'novel' check (work_type in ('novel', 'light_novel')),
  cover_image_id uuid, -- référence platform_images(id), ajoutée après (évite un cycle de création)
  status        text not null default 'ongoing' check (status in ('ongoing', 'paused', 'completed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table work_chapters (
  id            uuid primary key default gen_random_uuid(),
  work_id       uuid not null references works(id) on delete cascade,
  number        integer not null,
  title         text not null,
  content       text not null, -- texte du chapitre (roman = texte, pas des planches)
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (work_id, number)
);

-- Banque d'images pour les couvertures : certaines fournies par la
-- plateforme (gratuites ou payantes), d'autres uploadées par l'utilisateur.
create table platform_images (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references users(id) on delete set null, -- null = image fournie par la plateforme
  source         text not null check (source in ('platform_catalog', 'user_upload', 'external_url')),
  image_url      text not null,
  is_free        boolean not null default true,
  price_cents    integer not null default 0 check (price_cents >= 0),
  created_at     timestamptz not null default now()
);

alter table works
  add constraint fk_works_cover_image
  foreign key (cover_image_id) references platform_images(id) on delete set null;

-- Demande d'illustration sur mesure : la mise en relation se fait hors
-- plateforme (WhatsApp/messagerie), on trace juste la demande et son issue.
create table image_requests (
  id              uuid primary key default gen_random_uuid(),
  requester_id    uuid not null references users(id) on delete cascade,
  description     text not null,
  contact_channel text default 'whatsapp',
  status          text not null default 'pending' check (status in ('pending', 'in_discussion', 'delivered', 'cancelled')),
  price_cents     integer check (price_cents >= 0),
  delivered_image_id uuid references platform_images(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- Suit le quota "4 éditions niveau 1 gratuites" par utilisateur mentionné
-- dans le doc client.
create table edition_credits (
  user_id                   uuid primary key references users(id) on delete cascade,
  free_level1_credits_left  integer not null default 4 check (free_level1_credits_left >= 0)
);

create table edition_requests (
  id               uuid primary key default gen_random_uuid(),
  work_id          uuid not null references works(id) on delete cascade,
  work_chapter_id  uuid references work_chapters(id) on delete cascade,
  author_id        uuid not null references users(id) on delete cascade,
  editor_id        uuid references users(id) on delete set null,
  level            integer not null check (level in (1, 2, 3)),
  status           text not null default 'pending' check (status in ('pending', 'assigned', 'in_progress', 'delivered', 'cancelled')),
  used_free_credit boolean not null default false,
  price_cents      integer not null default 0 check (price_cents >= 0),
  feedback         text, -- retour de l'éditeur (niveau 1 : liste de corrections)
  created_at       timestamptz not null default now(),
  delivered_at     timestamptz
);

create index idx_edition_requests_author on edition_requests (author_id);
create index idx_edition_requests_editor on edition_requests (editor_id);

-- "Repêchage" par Hypercube Obsidian / la plateforme 1 (BM) : une oeuvre de
-- la plateforme 2 est reprise ailleurs. Les chapitres déjà lus deviennent
-- gratuits, les suivants payants sur la nouvelle plateforme (règle du doc).
create table work_migrations (
  id                uuid primary key default gen_random_uuid(),
  work_id           uuid not null references works(id) on delete cascade,
  target_platform   text not null check (target_platform in ('reading_publishing')), -- extensible si d'autres marques arrivent
  status            text not null default 'proposed' check (status in ('proposed', 'accepted', 'declined', 'completed')),
  new_series_id     uuid references series(id) on delete set null, -- la série recréée sur la plateforme 1
  proposed_at       timestamptz not null default now(),
  resolved_at       timestamptz
);

-- =============================================================================
-- 4. PLATEFORME 3 — RÉSEAU SOCIAL (canaux & communautés)
-- =============================================================================

-- Canaux façon "chaîne WhatsApp" : un auteur publie, les lecteurs suivent.
create table channels (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references users(id) on delete cascade,
  name         text not null,
  description  text,
  created_at   timestamptz not null default now()
);

create table channel_posts (
  id           uuid primary key default gen_random_uuid(),
  channel_id   uuid not null references channels(id) on delete cascade,
  body         text not null,
  media_url    text,
  created_at   timestamptz not null default now()
);

create index idx_channel_posts_channel on channel_posts (channel_id);

-- Communautés de fans : créées par un lecteur, doivent être validées
-- (voir critères du doc : activité soutenue, créée par l'auteur pour son
-- oeuvre, ou aucun signalement + bon comportement dans la durée).
create table communities (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid not null references users(id) on delete cascade,
  name             text not null,
  description      text,
  related_series_id uuid references series(id) on delete set null,
  related_work_id  uuid references works(id) on delete set null,
  is_validated     boolean not null default false,
  validated_at     timestamptz,
  created_at       timestamptz not null default now()
);

create table community_members (
  community_id  uuid not null references communities(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  role          text not null default 'member' check (role in ('member', 'moderator')),
  joined_at     timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table community_posts (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references communities(id) on delete cascade,
  author_id     uuid not null references users(id) on delete cascade,
  body          text not null,
  media_url     text,
  created_at    timestamptz not null default now()
);

create index idx_community_posts_community on community_posts (community_id);

-- Signalements : sert de critère pour la validation/dé-certification d'une
-- communauté ("aucune activité contraire au règlement n'a été trouvée").
create table community_reports (
  id             uuid primary key default gen_random_uuid(),
  community_id   uuid not null references communities(id) on delete cascade,
  reporter_id    uuid not null references users(id) on delete cascade,
  reason         text not null,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);
