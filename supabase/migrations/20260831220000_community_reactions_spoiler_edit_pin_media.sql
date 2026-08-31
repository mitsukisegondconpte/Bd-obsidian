-- Lot de fonctionnalités de chat demandées : réactions, spoiler,
-- modifier/supprimer ses messages, épingler un message, partage d'images.

-- 1. Réactions emoji (une réaction par utilisateur et par message ; la
--    reposer avec un autre emoji remplace la précédente).
create table public.community_post_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index idx_community_post_reactions_post_id on public.community_post_reactions (post_id);
create index idx_community_post_reactions_user_id on public.community_post_reactions (user_id);

alter table public.community_post_reactions enable row level security;

create policy "reactions are publicly readable" on public.community_post_reactions
  for select using (true);

create policy "members react to posts" on public.community_post_reactions for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.community_posts cp
      join public.community_members cm on cm.community_id = cp.community_id
      where cp.id = post_id and cm.user_id = (select auth.uid())
    )
  );

create policy "users update own reaction" on public.community_post_reactions for update
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "users remove own reaction" on public.community_post_reactions for delete
  using ((select auth.uid()) = user_id);

create policy "suspended users cannot insert into community_post_reactions" on public.community_post_reactions
  as restrictive for insert
  with check (not exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_suspended));

-- 2. Spoiler et édition sur les messages de communauté. (media_url existe
--    déjà sur community_posts depuis le schéma d'origine — colonne prévue
--    mais jamais câblée puisque les communautés étaient volontairement
--    "texte seulement" jusqu'à cette demande.)
alter table public.community_posts add column is_spoiler boolean not null default false;
alter table public.community_posts add column edited_at timestamptz;

create policy "authors edit own posts" on public.community_posts for update
  using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);

-- 3. Épingler un message (un seul message épinglé à la fois par
--    communauté ; la policy UPDATE "admins or creators update communities"
--    couvre déjà ce nouveau champ, aucune policy supplémentaire requise).
alter table public.communities add column pinned_post_id uuid references public.community_posts(id) on delete set null;
create index idx_communities_pinned_post_id on public.communities (pinned_post_id);

-- 4. Partage d'images dans les communautés — même schéma que
--    channel-media/community-covers : bucket public, écriture dans son
--    propre dossier.
insert into storage.buckets (id, name, public)
values ('community-media', 'community-media', true)
on conflict (id) do nothing;

create policy "community-media are publicly readable"
on storage.objects for select
using (bucket_id = 'community-media');

create policy "users upload community media to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'community-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users manage their own community media"
on storage.objects for update
using (bucket_id = 'community-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own community media"
on storage.objects for delete
using (bucket_id = 'community-media' and (storage.foldername(name))[1] = auth.uid()::text);
