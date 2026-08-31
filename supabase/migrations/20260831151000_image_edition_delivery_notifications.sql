-- image_requests.delivered_image_id et edition_requests.feedback existaient
-- déjà dans le schéma initial mais rien ne les renseignait jamais côté admin,
-- et le demandeur n'était jamais notifié d'une livraison. Complète la
-- communication admin <-> utilisateur pour ces deux flux.
alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('new_follower', 'new_chapter', 'migration_accepted', 'mention', 'image_delivered', 'edition_delivered'));

create function public.notify_image_request_delivered()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'delivered' and old.status is distinct from 'delivered' then
    insert into public.notifications (user_id, type, title, body, link_path)
    values (
      new.requester_id,
      'image_delivered',
      'Ton image sur mesure est prête',
      'L''équipe Hypercube a livré l''image que tu as demandée.',
      '/edition'
    );
  end if;
  return new;
end;
$$;

create trigger on_image_request_delivered_notify
  after update on public.image_requests
  for each row execute procedure public.notify_image_request_delivered();

create function public.notify_edition_request_delivered()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  work_title text;
begin
  if new.status = 'delivered' and old.status is distinct from 'delivered' then
    select title into work_title from public.works where id = new.work_id;

    insert into public.notifications (user_id, type, title, body, link_path)
    values (
      new.author_id,
      'edition_delivered',
      'Ton retour d''édition est prêt',
      'L''éditeur a terminé sa relecture de « ' || coalesce(work_title, 'ton œuvre') || ' ».',
      '/edition'
    );
  end if;
  return new;
end;
$$;

create trigger on_edition_request_delivered_notify
  after update on public.edition_requests
  for each row execute procedure public.notify_edition_request_delivered();

revoke execute on function public.notify_image_request_delivered() from anon, authenticated, public;
revoke execute on function public.notify_edition_request_delivered() from anon, authenticated, public;
