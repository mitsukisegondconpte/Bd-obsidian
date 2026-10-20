-- Les communautés et canaux n'avaient aucune image propre (juste nom +
-- description), ce qui les rend visuellement tous identiques. Même schéma
-- que work-covers/avatars/channel-media : bucket public, écriture dans son
-- propre dossier.
alter table public.communities add column cover_url text;
alter table public.channels add column cover_url text;

insert into storage.buckets (id, name, public)
values ('community-covers', 'community-covers', true)
on conflict (id) do nothing;

create policy "community-covers are publicly readable"
on storage.objects for select
using (bucket_id = 'community-covers');

create policy "users upload community covers to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'community-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users manage their own community covers"
on storage.objects for update
using (bucket_id = 'community-covers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own community covers"
on storage.objects for delete
using (bucket_id = 'community-covers' and (storage.foldername(name))[1] = auth.uid()::text);
