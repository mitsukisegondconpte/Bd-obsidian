-- Panel admin (les 3 apps) : un admin doit pouvoir gérer les rôles d'un
-- compte (auteur, éditeur, admin) et suspendre un compte. On avait
-- verrouillé les colonnes privilégiées de `profiles` contre l'écriture
-- client directe (cf. fix_profiles_privilege_escalation) — la seule porte
-- désormais est cette fonction security definer, qui vérifie elle-même que
-- l'appelant est admin avant de toucher que que ce soit.
alter table public.profiles add column is_suspended boolean not null default false;

create function public.admin_set_profile_flags(
  target_user_id uuid,
  new_is_author boolean default null,
  new_is_editor boolean default null,
  new_is_platform_admin boolean default null,
  new_is_suspended boolean default null
)
returns public.profiles
language plpgsql
security definer set search_path = public
as $$
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
    updated_at = now()
  where id = target_user_id
  returning * into result;

  return result;
end;
$$;

grant execute on function public.admin_set_profile_flags(uuid, boolean, boolean, boolean, boolean) to authenticated;
revoke execute on function public.admin_set_profile_flags(uuid, boolean, boolean, boolean, boolean) from anon;

-- Un admin doit pouvoir lister tous les profils (l'app le fait déjà pour un
-- profil individuel via "profiles are publicly readable" en SELECT — cette
-- policy existe déjà et couvre le cas admin aussi, rien à ajouter côté
-- lecture. Seule l'écriture des colonnes privilégiées était bloquée.
