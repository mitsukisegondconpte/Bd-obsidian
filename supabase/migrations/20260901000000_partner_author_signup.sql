-- Formulaire d'inscription partenaire : Bohio Mag envoie ce lien à ses
-- auteurs pour qu'ils créent directement un compte chez nous (pas besoin
-- d'accès à leur base de données). La source est déclarée par la personne
-- elle-même à l'inscription (self-report, via raw_user_meta_data -> le
-- trigger handle_new_user) ; le badge réel n'est accordé qu'après
-- validation manuelle par un admin (partner_verified_at).

alter table public.profiles
  add column author_source text check (author_source in ('bohio_mag', 'hypercube')),
  add column partner_verified_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  base_username text := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
  final_username text := base_username;
  suffix int := 0;
begin
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url, author_source)
  values (
    new.id,
    final_username,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'author_source'
  );
  return new;
end;
$function$;

-- admin_set_profile_flags gagne un 6e paramètre pour valider/refuser le
-- statut d'auteur partenaire (même garde is_platform_admin que les autres
-- champs, aucune nouvelle policy nécessaire).
create or replace function public.admin_set_profile_flags(
  target_user_id uuid,
  new_is_author boolean default null,
  new_is_editor boolean default null,
  new_is_platform_admin boolean default null,
  new_is_suspended boolean default null,
  new_partner_verified boolean default null
)
returns public.profiles
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  result public.profiles;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_platform_admin) then
    raise exception 'not authorized';
  end if;

  update public.profiles set
    is_author = coalesce(new_is_author, is_author),
    is_editor = coalesce(new_is_editor, is_editor),
    is_platform_admin = coalesce(new_is_platform_admin, is_platform_admin),
    is_suspended = coalesce(new_is_suspended, is_suspended),
    partner_verified_at = case
      when new_partner_verified is true then now()
      when new_partner_verified is false then null
      else partner_verified_at
    end,
    updated_at = now()
  where id = target_user_id
  returning * into result;

  return result;
end;
$function$;
