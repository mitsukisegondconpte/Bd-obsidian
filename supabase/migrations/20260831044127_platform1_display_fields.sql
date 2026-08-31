-- Colonnes d'affichage pour la plateforme 1 (note, vues) — absentes du
-- schéma initial. Les vues sont incrémentées via une fonction dédiée pour
-- ne pas avoir à ouvrir une policy UPDATE générale sur `series`.
alter table public.series add column rating numeric(2,1) not null default 4.5 check (rating >= 0 and rating <= 5);
alter table public.series add column views bigint not null default 0;

create function public.increment_series_views(p_series_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.series set views = views + 1 where id = p_series_id;
end;
$$;

grant execute on function public.increment_series_views(uuid) to authenticated, anon;
