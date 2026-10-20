-- Les admins peuvent voir tous les signalements (policy existante) mais
-- n'avaient aucun moyen de les marquer résolus (resolved_at) — aucune
-- policy UPDATE n'existait sur community_reports.
create policy "admins resolve community reports" on public.community_reports for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_platform_admin))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_platform_admin));
