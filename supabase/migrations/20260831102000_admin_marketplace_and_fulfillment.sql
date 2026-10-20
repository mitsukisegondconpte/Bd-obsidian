-- Catalogue d'images (marketplace) : la policy insert actuelle
-- ((owner_id IS NULL) OR (owner_id = auth.uid())) laissait n'importe quel
-- utilisateur connecté créer une image "source = platform_catalog" avec
-- n'importe quel prix, en réglant juste owner_id à null — le catalogue
-- n'était pas vraiment protégé. On restreint : un utilisateur ne peut créer
-- que du user_upload/external_url pour lui-même ; seul un admin peut créer
-- une entrée de catalogue (ou n'importe quoi d'autre, au cas où).
drop policy "users upload own images" on public.platform_images;
create policy "users upload own or admins upload any image" on public.platform_images for insert
with check (
  (owner_id = (select auth.uid()) and source in ('user_upload', 'external_url'))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

create policy "admins update platform_images" on public.platform_images for update
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin));

create policy "admins delete platform_images" on public.platform_images for delete
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin));

-- Demandes d'images sur-mesure : un admin doit voir toutes les demandes
-- (pas juste les siennes) et pouvoir les faire avancer (statut, image livrée).
drop policy "users view own image requests" on public.image_requests;
create policy "view own or admin image requests" on public.image_requests for select
using (
  requester_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

create policy "admins update image requests" on public.image_requests for update
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin));

-- Demandes d'édition : un admin doit voir toutes les demandes et pouvoir
-- assigner un éditeur (poser editor_id la première fois), en plus de
-- l'éditeur déjà assigné qui peut faire avancer sa propre demande.
drop policy "authors view own edition requests" on public.edition_requests;
create policy "view own or admin edition requests" on public.edition_requests for select
using (
  author_id = (select auth.uid())
  or editor_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

drop policy "editors update assigned requests" on public.edition_requests;
create policy "editors or admins update edition requests" on public.edition_requests for update
using (
  editor_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- Repêchages (work_migrations) : aucune policy insert n'existait — personne
-- ne pouvait créer une offre depuis le client. Un admin doit pouvoir en
-- proposer une, et voir toutes les propositions (pas juste ses propres
-- œuvres, pour suivre l'ensemble).
create policy "admins create work migrations" on public.work_migrations for insert
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin));

drop policy "authors view own work migrations" on public.work_migrations;
create policy "view own or admin work migrations" on public.work_migrations for select
using (
  exists (select 1 from public.works w where w.id = work_migrations.work_id and w.author_id = (select auth.uid()))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

-- Genres (plateforme lecture) : aucune policy d'écriture n'existait — les 8
-- genres actuels ont été créés à la main en base. Un admin doit pouvoir en
-- ajouter/modifier/retirer depuis le panel.
create policy "admins manage genres" on public.genres for insert
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin));

create policy "admins update genres" on public.genres for update
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin));

create policy "admins delete genres" on public.genres for delete
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin));

-- Achats de chapitres : un admin doit pouvoir voir l'ensemble des achats
-- pour le tableau de bord (revenus), pas seulement les siens.
drop policy "users view own purchases" on public.chapter_purchases;
create policy "view own or admin purchases" on public.chapter_purchases for select
using (
  (select auth.uid()) = user_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);
