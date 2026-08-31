-- Permet à l'auteur de répondre (accepter/refuser) à une proposition de
-- repêchage par Hypercube Obsidian / Bohio Mag sur sa propre oeuvre.
create policy "authors respond to own work migrations" on public.work_migrations for update using (
  exists (select 1 from public.works w where w.id = work_id and w.author_id = auth.uid())
);
