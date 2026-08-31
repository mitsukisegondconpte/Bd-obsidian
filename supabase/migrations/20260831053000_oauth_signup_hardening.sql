-- L'inscription Google OAuth ne passe pas de username/display_name choisis
-- à la main (contrairement au formulaire email/mot de passe) : le trigger
-- doit donc (1) éviter d'échouer sur une collision de username dérivé de
-- l'email/du nom Google, et (2) récupérer nom complet + avatar depuis les
-- métadonnées que Google fournit automatiquement.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
  final_username text := base_username;
  suffix int := 0;
begin
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;
