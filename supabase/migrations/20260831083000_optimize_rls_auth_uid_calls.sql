-- Optimisation de performance signalée par le linter Supabase (auth_rls_initplan,
-- 54 occurrences) : chaque policy RLS appelant auth.uid() directement le
-- réévalue pour CHAQUE ligne scannée. En enveloppant l'appel dans un
-- sous-select — (select auth.uid()) — Postgres le met en cache une seule
-- fois par requête (le planificateur le traite comme un InitPlan). Aucun
-- changement de logique : chaque policy garde exactement la même condition,
-- juste réécrite pour performance. Généré à partir de pg_policies puis
-- vérifié un par un avant application.

alter policy "owners post in own channels" on public.channel_posts with check ((EXISTS ( SELECT 1
   FROM channels c
  WHERE ((c.id = channel_posts.channel_id) AND (c.owner_id = (select auth.uid()))))));
alter policy "authors create own channels" on public.channels with check ((((select auth.uid()) = owner_id) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND p.is_author)))));
alter policy "owners update own channels" on public.channels using (((select auth.uid()) = owner_id));
alter policy "authors delete own chapter pages" on public.chapter_pages using ((EXISTS ( SELECT 1
   FROM (chapters c
     JOIN series s ON ((s.id = c.series_id)))
  WHERE ((c.id = chapter_pages.chapter_id) AND (s.author_id = (select auth.uid()))))));
alter policy "authors manage own chapter pages" on public.chapter_pages with check ((EXISTS ( SELECT 1
   FROM (chapters c
     JOIN series s ON ((s.id = c.series_id)))
  WHERE ((c.id = chapter_pages.chapter_id) AND (s.author_id = (select auth.uid()))))));
alter policy "users create own purchases" on public.chapter_purchases with check (((select auth.uid()) = user_id));
alter policy "users view own purchases" on public.chapter_purchases using (((select auth.uid()) = user_id));
alter policy "authors delete own chapters" on public.chapters using ((EXISTS ( SELECT 1
   FROM series s
  WHERE ((s.id = chapters.series_id) AND (s.author_id = (select auth.uid()))))));
alter policy "authors manage own chapters" on public.chapters with check ((EXISTS ( SELECT 1
   FROM series s
  WHERE ((s.id = chapters.series_id) AND (s.author_id = (select auth.uid()))))));
alter policy "authors update own chapters" on public.chapters using ((EXISTS ( SELECT 1
   FROM series s
  WHERE ((s.id = chapters.series_id) AND (s.author_id = (select auth.uid()))))));
alter policy "users create own comments" on public.comments with check (((select auth.uid()) = user_id));
alter policy "users delete own comments" on public.comments using (((select auth.uid()) = user_id));
alter policy "admins validate communities" on public.communities using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND p.is_platform_admin))));
alter policy "creators update own communities" on public.communities using (((select auth.uid()) = creator_id));
alter policy "users create communities" on public.communities with check (((select auth.uid()) = creator_id));
alter policy "users join communities" on public.community_members with check (((select auth.uid()) = user_id));
alter policy "users leave communities" on public.community_members using (((select auth.uid()) = user_id));
alter policy "members post in communities" on public.community_posts with check ((((select auth.uid()) = author_id) AND (EXISTS ( SELECT 1
   FROM community_members m
  WHERE ((m.community_id = community_posts.community_id) AND (m.user_id = (select auth.uid())))))));
alter policy "admins resolve community reports" on public.community_reports using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND p.is_platform_admin)))) with check ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND p.is_platform_admin))));
alter policy "reporters view own reports" on public.community_reports using ((((select auth.uid()) = reporter_id) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND p.is_platform_admin)))));
alter policy "users create reports" on public.community_reports with check (((select auth.uid()) = reporter_id));
alter policy "users view own edition credits" on public.edition_credits using (((select auth.uid()) = user_id));
alter policy "authors create own edition requests" on public.edition_requests with check (((select auth.uid()) = author_id));
alter policy "authors view own edition requests" on public.edition_requests using ((((select auth.uid()) = author_id) OR ((select auth.uid()) = editor_id)));
alter policy "editors update assigned requests" on public.edition_requests using (((select auth.uid()) = editor_id));
alter policy "users manage own follows" on public.follows with check (((select auth.uid()) = follower_id));
alter policy "users remove own follows" on public.follows using (((select auth.uid()) = follower_id));
alter policy "users create own image requests" on public.image_requests with check (((select auth.uid()) = requester_id));
alter policy "users view own image requests" on public.image_requests using (((select auth.uid()) = requester_id));
alter policy "users manage own likes" on public.likes with check (((select auth.uid()) = user_id));
alter policy "users remove own likes" on public.likes using (((select auth.uid()) = user_id));
alter policy "users mark own notifications read" on public.notifications using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));
alter policy "users read own notifications" on public.notifications using ((user_id = (select auth.uid())));
alter policy "users upload own images" on public.platform_images with check (((owner_id IS NULL) OR (owner_id = (select auth.uid()))));
alter policy "users update own profile" on public.profiles using (((select auth.uid()) = id));
alter policy "owners manage own reading list items" on public.reading_list_items with check ((EXISTS ( SELECT 1
   FROM reading_lists l
  WHERE ((l.id = reading_list_items.list_id) AND (l.owner_id = (select auth.uid()))))));
alter policy "owners remove own reading list items" on public.reading_list_items using ((EXISTS ( SELECT 1
   FROM reading_lists l
  WHERE ((l.id = reading_list_items.list_id) AND (l.owner_id = (select auth.uid()))))));
alter policy "users delete own reading lists" on public.reading_lists using (((select auth.uid()) = owner_id));
alter policy "users manage own reading lists" on public.reading_lists with check (((select auth.uid()) = owner_id));
alter policy "users update own reading lists" on public.reading_lists using (((select auth.uid()) = owner_id));
alter policy "users manage own reading progress" on public.reading_progress using (((select auth.uid()) = user_id)) with check (((select auth.uid()) = user_id));
alter policy "authors delete own series" on public.series using (((select auth.uid()) = author_id));
alter policy "authors manage own series" on public.series with check (((select auth.uid()) = author_id));
alter policy "authors update own series" on public.series using (((select auth.uid()) = author_id));
alter policy "authors tag own series" on public.series_genres with check ((EXISTS ( SELECT 1
   FROM series s
  WHERE ((s.id = series_genres.series_id) AND (s.author_id = (select auth.uid()))))));
alter policy "authors untag own series" on public.series_genres using ((EXISTS ( SELECT 1
   FROM series s
  WHERE ((s.id = series_genres.series_id) AND (s.author_id = (select auth.uid()))))));
alter policy "authors manage own work chapters" on public.work_chapters with check ((EXISTS ( SELECT 1
   FROM works w
  WHERE ((w.id = work_chapters.work_id) AND (w.author_id = (select auth.uid()))))));
alter policy "authors update own work chapters" on public.work_chapters using ((EXISTS ( SELECT 1
   FROM works w
  WHERE ((w.id = work_chapters.work_id) AND (w.author_id = (select auth.uid()))))));
alter policy "published work_chapters are publicly readable" on public.work_chapters using (((NOT is_draft) OR (EXISTS ( SELECT 1
   FROM works w
  WHERE ((w.id = work_chapters.work_id) AND (w.author_id = (select auth.uid())))))));
alter policy "authors respond to own work migrations" on public.work_migrations using ((EXISTS ( SELECT 1
   FROM works w
  WHERE ((w.id = work_migrations.work_id) AND (w.author_id = (select auth.uid()))))));
alter policy "authors view own work migrations" on public.work_migrations using ((EXISTS ( SELECT 1
   FROM works w
  WHERE ((w.id = work_migrations.work_id) AND (w.author_id = (select auth.uid()))))));
alter policy "authors delete own works" on public.works using (((select auth.uid()) = author_id));
alter policy "authors manage own works" on public.works with check (((select auth.uid()) = author_id));
alter policy "authors update own works" on public.works using (((select auth.uid()) = author_id));
