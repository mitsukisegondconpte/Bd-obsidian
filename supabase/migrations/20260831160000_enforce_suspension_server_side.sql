-- is_suspended n'était vérifié que côté client (SuspendedScreen.jsx bloque
-- l'app entière visuellement) — rien côté base n'empêchait un compte
-- suspendu de continuer à écrire (poster, commenter, publier, suivre...)
-- via un appel direct à l'API REST, en contournant l'app. On ferme la vraie
-- porte avec une policy RESTRICTIVE par table : contrairement à une policy
-- normale (permissive, combinée en OR), une policy RESTRICTIVE se combine
-- en AND avec toutes les autres — elle bloque l'écriture peu importe ce que
-- les policies permissives autorisent par ailleurs, sans avoir à toucher à
-- aucune des policies d'insertion existantes.
do $$
declare
  t text;
  tables text[] := array[
    'series', 'chapters', 'series_genres', 'chapter_pages',
    'works', 'work_chapters',
    'comments', 'likes', 'follows',
    'communities', 'community_members', 'community_posts',
    'channels', 'channel_posts',
    'image_requests', 'edition_requests', 'reading_progress', 'chapter_purchases'
  ];
begin
  foreach t in array tables loop
    execute format(
      'create policy "suspended users cannot insert into %1$I" on public.%1$I as restrictive for insert with check (
        not exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_suspended)
      )',
      t
    );
  end loop;
end $$;
