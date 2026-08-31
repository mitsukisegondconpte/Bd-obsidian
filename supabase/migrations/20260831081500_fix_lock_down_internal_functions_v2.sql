-- La migration 20260831060000_lock_down_internal_functions.sql a raté sa
-- cible : elle a fait `revoke ... from public` (le pseudo-rôle PUBLIC), mais
-- Supabase accorde EXECUTE directement aux rôles `anon` et `authenticated`
-- sur chaque fonction du schéma exposé, pas seulement via PUBLIC — donc le
-- revoke n'a rien retiré (confirmé via information_schema.routine_privileges,
-- resignalé par le linter de sécurité). Cette fois on cible les bons rôles.
revoke execute on function public.announce_accepted_migration() from anon, authenticated;
revoke execute on function public.auto_validate_official_community() from anon, authenticated;
revoke execute on function public.handle_new_profile() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.mark_profile_as_author() from anon, authenticated;
revoke execute on function public.notify_migration_accepted() from anon, authenticated;
revoke execute on function public.notify_new_chapter() from anon, authenticated;
revoke execute on function public.notify_new_follower() from anon, authenticated;
revoke execute on function public.resolve_follow_target_owner(text, uuid) from anon, authenticated;
