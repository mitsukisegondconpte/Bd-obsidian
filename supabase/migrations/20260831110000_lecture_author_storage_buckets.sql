-- Buckets pour le panel auteur de la plateforme lecture (BD/webtoons) :
-- couvertures de série et pages de chapitre, uploadées par l'auteur.
-- Même schéma de policies que work-covers/avatars : public en lecture,
-- écriture limitée au dossier de l'utilisateur (<bucket>/<user_id>/...).

insert into storage.buckets (id, name, public)
values ('series-covers', 'series-covers', true)
on conflict (id) do nothing;

create policy "series-covers are publicly readable"
on storage.objects for select
using (bucket_id = 'series-covers');

create policy "users upload series covers to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'series-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users manage their own series covers"
on storage.objects for update
using (bucket_id = 'series-covers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own series covers"
on storage.objects for delete
using (bucket_id = 'series-covers' and (storage.foldername(name))[1] = auth.uid()::text);

insert into storage.buckets (id, name, public)
values ('chapter-pages', 'chapter-pages', true)
on conflict (id) do nothing;

create policy "chapter-pages are publicly readable"
on storage.objects for select
using (bucket_id = 'chapter-pages');

create policy "users upload chapter pages to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'chapter-pages'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users manage their own chapter pages"
on storage.objects for update
using (bucket_id = 'chapter-pages' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own chapter pages"
on storage.objects for delete
using (bucket_id = 'chapter-pages' and (storage.foldername(name))[1] = auth.uid()::text);
