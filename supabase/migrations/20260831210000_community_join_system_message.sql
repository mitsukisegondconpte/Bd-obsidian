-- Quand quelqu'un rejoint une communauté, un message système visible dans
-- le fil ("X a rejoint la communauté") le signale à tous les membres —
-- même mécanique qu'un groupe WhatsApp/Discord. Un post normal (author_id
-- = la personne qui rejoint) avec is_system=true pour un rendu distinct
-- côté UI plutôt qu'une bulle de chat classique.
alter table public.community_posts add column is_system boolean not null default false;

create or replace function public.notify_community_join()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  insert into public.community_posts (community_id, author_id, body, is_system)
  values (new.community_id, new.user_id, 'a rejoint la communauté', true);
  return new;
end;
$$;

create trigger on_community_member_joined
  after insert on public.community_members
  for each row execute function public.notify_community_join();
