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
