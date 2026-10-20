-- CRITIQUE : la policy RLS "users update own profile" (using (auth.uid() =
-- id)) n'a pas de with_check et ne protège que la ligne, pas les colonnes.
-- Combiné au GRANT UPDATE large que Supabase applique par défaut sur toute
-- la table à `authenticated` (et même `anon`), n'importe quel utilisateur
-- connecté pouvait s'auto-promouvoir admin via
-- `PATCH /rest/v1/profiles?id=eq.<son-id>` avec `{"is_platform_admin": true}`
-- (confirmé exploitable, testé et corrigé dans la même session).
--
-- Un REVOKE UPDATE(colonne) seul ne suffit pas : les privilèges table et
-- colonne sont suivis indépendamment par Postgres, donc tant que le GRANT
-- UPDATE au niveau table existe, il couvre toujours implicitement toutes
-- les colonnes. Il faut d'abord retirer le grant table, puis ne redonner
-- UPDATE que sur les colonnes sûres.
revoke update on public.profiles from authenticated, anon;
grant update (username, display_name, avatar_url, bio) on public.profiles to authenticated;
