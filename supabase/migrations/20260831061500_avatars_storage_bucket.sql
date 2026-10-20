-- Bucket pour les avatars de profil, utilisé par les 3 apps (même compte
-- partagé). Même schéma de policies que work-covers : public en lecture,
-- chaque utilisateur ne peut écrire que dans son propre dossier
-- (avatars/<user_id>/...).
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "avatars are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "users upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users manage their own avatar"
on storage.objects for update
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own avatar"
on storage.objects for delete
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
