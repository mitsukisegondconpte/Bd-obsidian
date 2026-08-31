-- Fonction sécurisée pour décrémenter son propre crédit d'édition niveau 1.
-- Les clients n'ont pas de policy UPDATE directe sur edition_credits (voir
-- schéma) : ce passage obligé empêche un utilisateur de remonter son propre
-- solde, seul le décrément via demande réelle est possible.
create function public.decrement_edition_credit(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'not allowed';
  end if;

  update public.edition_credits
  set free_level1_credits_left = free_level1_credits_left - 1
  where user_id = p_user_id and free_level1_credits_left > 0;
end;
$$;

grant execute on function public.decrement_edition_credit(uuid) to authenticated;
