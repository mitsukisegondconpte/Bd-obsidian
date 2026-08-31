-- Linter de performance (unindexed_foreign_keys, 25 occurrences) : ces
-- colonnes de clé étrangère n'ont pas d'index, ce qui ralentit les jointures
-- et les DELETE en cascade sur la table référencée à mesure que le volume
-- de données grandit. Ajout d'un index simple sur chacune.
create index if not exists idx_channels_owner_id on public.channels (owner_id);
create index if not exists idx_chapter_purchases_chapter_id on public.chapter_purchases (chapter_id);
create index if not exists idx_comments_parent_comment_id on public.comments (parent_comment_id);
create index if not exists idx_comments_user_id on public.comments (user_id);
create index if not exists idx_communities_creator_id on public.communities (creator_id);
create index if not exists idx_communities_related_series_id on public.communities (related_series_id);
create index if not exists idx_communities_related_work_id on public.communities (related_work_id);
create index if not exists idx_community_members_user_id on public.community_members (user_id);
create index if not exists idx_community_posts_author_id on public.community_posts (author_id);
create index if not exists idx_community_reports_community_id on public.community_reports (community_id);
create index if not exists idx_community_reports_reporter_id on public.community_reports (reporter_id);
create index if not exists idx_edition_requests_work_chapter_id on public.edition_requests (work_chapter_id);
create index if not exists idx_edition_requests_work_id on public.edition_requests (work_id);
create index if not exists idx_image_requests_delivered_image_id on public.image_requests (delivered_image_id);
create index if not exists idx_image_requests_requester_id on public.image_requests (requester_id);
create index if not exists idx_platform_images_owner_id on public.platform_images (owner_id);
create index if not exists idx_reading_list_items_work_id on public.reading_list_items (work_id);
create index if not exists idx_reading_lists_owner_id on public.reading_lists (owner_id);
create index if not exists idx_reading_progress_last_chapter_id on public.reading_progress (last_chapter_id);
create index if not exists idx_reading_progress_work_id on public.reading_progress (work_id);
create index if not exists idx_series_genres_genre_id on public.series_genres (genre_id);
create index if not exists idx_work_migrations_new_series_id on public.work_migrations (new_series_id);
create index if not exists idx_work_migrations_work_id on public.work_migrations (work_id);
create index if not exists idx_works_cover_image_id on public.works (cover_image_id);
create index if not exists idx_works_author_id on public.works (author_id);
