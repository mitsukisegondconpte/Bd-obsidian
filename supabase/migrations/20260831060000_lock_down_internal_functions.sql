-- Le linter de sécurité Supabase signale que plusieurs fonctions internes
-- (triggers + un helper) sont exécutables via /rest/v1/rpc/... par anon et
-- authenticated, à cause du GRANT EXECUTE TO PUBLIC par défaut de Postgres
-- sur toute nouvelle fonction. Aucune n'est réellement exploitable (les
-- fonctions "returns trigger" ne peuvent être appelées que par un vrai
-- trigger, et decrement_edition_credit() vérifie déjà auth.uid() = p_user_id
-- en interne), mais on retire l'accès public par principe de moindre
-- privilège — ça ne casse pas les triggers, qui s'exécutent avec les droits
-- du propriétaire de la fonction, pas ceux de l'appelant.
revoke execute on function public.announce_accepted_migration() from public;
revoke execute on function public.auto_validate_official_community() from public;
revoke execute on function public.handle_new_profile() from public;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.mark_profile_as_author() from public;
revoke execute on function public.notify_migration_accepted() from public;
revoke execute on function public.notify_new_chapter() from public;
revoke execute on function public.notify_new_follower() from public;
revoke execute on function public.resolve_follow_target_owner(text, uuid) from public;
