-- Les canaux restent à sens unique (seul le propriétaire publie) mais,
-- contrairement aux groupes de communauté, ils supportent les médias — le
-- propriétaire peut illustrer une annonce. Bucket public, même schéma que
-- work-covers/avatars : lecture publique, écriture dans son propre dossier.
insert into storage.buckets (id, name, public)
values ('channel-media', 'channel-media', true)
on conflict (id) do nothing;

create policy "channel-media are publicly readable"
on storage.objects for select
using (bucket_id = 'channel-media');

create policy "users upload channel media to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'channel-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users manage their own channel media"
on storage.objects for update
using (bucket_id = 'channel-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own channel media"
on storage.objects for delete
using (bucket_id = 'channel-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- Repartager une actu de canal dans son propre groupe de fans (comme
-- transférer un message WhatsApp) : le post de communauté référence le
-- post de canal d'origine, affiché en aperçu "repartagé depuis".
alter table public.community_posts
  add column shared_from_channel_post_id uuid references public.channel_posts(id) on delete set null;

create index idx_community_posts_shared_from on public.community_posts (shared_from_channel_post_id);
