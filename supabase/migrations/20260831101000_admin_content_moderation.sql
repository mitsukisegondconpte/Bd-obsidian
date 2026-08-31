-- Modération admin : un admin doit pouvoir supprimer n'importe quel
-- contenu sur les 3 plateformes (série/chapitre/œuvre/canal/communauté/
-- commentaire/post), pas seulement le sien. On fusionne avec la policy
-- "propriétaire" existante plutôt que d'empiler une 2e policy permissive
-- (même principe que la fusion communities faite plus tôt — évite le lint
-- de performance multiple_permissive_policies).

-- series
drop policy "authors delete own series" on public.series;
create policy "authors or admins delete series" on public.series for delete
using (
  (select auth.uid()) = author_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- chapters
drop policy "authors delete own chapters" on public.chapters;
create policy "authors or admins delete chapters" on public.chapters for delete
using (
  exists (select 1 from public.series s where s.id = chapters.series_id and s.author_id = (select auth.uid()))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- works
drop policy "authors delete own works" on public.works;
create policy "authors or admins delete works" on public.works for delete
using (
  (select auth.uid()) = author_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- work_chapters (pas de policy delete existante du tout)
create policy "authors or admins delete work chapters" on public.work_chapters for delete
using (
  exists (select 1 from public.works w where w.id = work_chapters.work_id and w.author_id = (select auth.uid()))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- channels (pas de policy delete existante du tout)
create policy "owners or admins delete channels" on public.channels for delete
using (
  (select auth.uid()) = owner_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- communities (pas de policy delete existante du tout)
create policy "creators or admins delete communities" on public.communities for delete
using (
  (select auth.uid()) = creator_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- comments
drop policy "users delete own comments" on public.comments;
create policy "users or admins delete comments" on public.comments for delete
using (
  (select auth.uid()) = user_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- community_posts (pas de policy delete existante du tout — même l'auteur
-- ne pouvait pas supprimer son propre post)
create policy "authors or admins delete community posts" on public.community_posts for delete
using (
  (select auth.uid()) = author_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- channel_posts (idem, pas de policy delete existante)
create policy "owners or admins delete channel posts" on public.channel_posts for delete
using (
  exists (select 1 from public.channels c where c.id = channel_posts.channel_id and c.owner_id = (select auth.uid()))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);
