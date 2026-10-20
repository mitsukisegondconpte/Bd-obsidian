-- Les chaines (channels) sont à sens unique et publiques, mais n'avaient
-- aucun moyen de signaler un contenu abusif — seules les communautés en
-- avaient un (community_reports). On mirrore exactement ce même modèle
-- pour les chaines.
create table public.channel_reports (
  id             uuid primary key default gen_random_uuid(),
  channel_id     uuid not null references public.channels(id) on delete cascade,
  reporter_id    uuid not null references public.profiles(id) on delete cascade,
  reason         text not null,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);

create index idx_channel_reports_channel_id on public.channel_reports (channel_id);
create index idx_channel_reports_reporter_id on public.channel_reports (reporter_id);

alter table public.channel_reports enable row level security;

create policy "users create channel reports" on public.channel_reports for insert
  with check ((select auth.uid()) = reporter_id);

create policy "reporters or admins view channel reports" on public.channel_reports for select using (
  (select auth.uid()) = reporter_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

create policy "admins resolve channel reports" on public.channel_reports for update using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);
