-- apps/communaute a un flux complet de signalement (report -> file d'attente
-- admin -> résolution) pour les communautés et les chaines, mais ni
-- apps/lecture (séries) ni apps/ecriture (œuvres) n'avaient d'équivalent :
-- aucun moyen pour un lecteur de signaler un contenu abusif à un admin.
-- On mirrore exactement le même modèle (community_reports/channel_reports).

create table public.series_reports (
  id             uuid primary key default gen_random_uuid(),
  series_id      uuid not null references public.series(id) on delete cascade,
  reporter_id    uuid not null references public.profiles(id) on delete cascade,
  reason         text not null,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);

create index idx_series_reports_series_id on public.series_reports (series_id);
create index idx_series_reports_reporter_id on public.series_reports (reporter_id);

alter table public.series_reports enable row level security;

create policy "users create series reports" on public.series_reports for insert
  with check ((select auth.uid()) = reporter_id);

create policy "reporters or admins view series reports" on public.series_reports for select using (
  (select auth.uid()) = reporter_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

create policy "admins resolve series reports" on public.series_reports for update using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

create table public.work_reports (
  id             uuid primary key default gen_random_uuid(),
  work_id        uuid not null references public.works(id) on delete cascade,
  reporter_id    uuid not null references public.profiles(id) on delete cascade,
  reason         text not null,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);

create index idx_work_reports_work_id on public.work_reports (work_id);
create index idx_work_reports_reporter_id on public.work_reports (reporter_id);

alter table public.work_reports enable row level security;

create policy "users create work reports" on public.work_reports for insert
  with check ((select auth.uid()) = reporter_id);

create policy "reporters or admins view work reports" on public.work_reports for select using (
  (select auth.uid()) = reporter_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

create policy "admins resolve work reports" on public.work_reports for update using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);
