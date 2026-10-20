-- Le document juridique du site 3 précise : "Les canaux et communautés du
-- site 3 sont réservés aux œuvres HOS, Bohio Mag et aux œuvres éligibles
-- sélectionnées parmi les dix meilleures œuvres du site 2." Aujourd'hui
-- n'importe qui peut créer un canal/une communauté sur n'importe quel sujet
-- (related_series_id/related_work_id sur communities sont optionnels, et
-- channels n'a même pas ces colonnes). On ferme cet écart.
--
-- Le contrôle se fait à la création uniquement (trigger BEFORE INSERT) :
-- les canaux/communautés déjà créés ne sont pas invalidés rétroactivement,
-- et l'éligibilité (Top 10 hebdomadaire) n'est pas revérifiée en continu —
-- exactement le même choix que pour la mention "validée" des communautés.

alter table public.works add column is_featured boolean not null default false;

alter table public.channels add column related_series_id uuid references public.series(id) on delete cascade;
alter table public.channels add column related_work_id uuid references public.works(id) on delete cascade;

create index idx_channels_related_series_id on public.channels (related_series_id);
create index idx_channels_related_work_id on public.channels (related_work_id);

create or replace function public.check_content_link_eligible()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.related_series_id is null and new.related_work_id is null then
    raise exception 'Un canal ou une communauté doit être lié à une œuvre officielle (HOS/Bohio Mag) ou figurant actuellement au Top 10 hebdomadaire.';
  end if;

  if new.related_series_id is not null then
    if not exists (select 1 from public.top_series_weekly(10) t where t.series_id = new.related_series_id) then
      raise exception 'La série liée ne figure pas actuellement dans le Top 10 hebdomadaire.';
    end if;
  end if;

  if new.related_work_id is not null then
    if not exists (select 1 from public.works w where w.id = new.related_work_id and w.is_featured)
       and not exists (select 1 from public.top_works_weekly(10) t where t.work_id = new.related_work_id) then
      raise exception 'L''œuvre liée n''est ni mise en avant par HOS/Bohio Mag, ni actuellement dans le Top 10 hebdomadaire.';
    end if;
  end if;

  return new;
end;
$$;

create trigger check_channel_content_eligible before insert on public.channels
  for each row execute function public.check_content_link_eligible();

create trigger check_community_content_eligible before insert on public.communities
  for each row execute function public.check_content_link_eligible();
