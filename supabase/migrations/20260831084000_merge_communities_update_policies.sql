-- Linter de performance (multiple_permissive_policies) : "admins validate
-- communities" et "creators update own communities" étaient deux policies
-- UPDATE permissives séparées sur la même table — Postgres doit évaluer les
-- deux à chaque requête même si une seule doit correspondre. Fusionnées en
-- une seule policy avec un OR, même logique exacte, une seule évaluation.
drop policy "admins validate communities" on public.communities;
drop policy "creators update own communities" on public.communities;

create policy "admins or creators update communities" on public.communities for update
using (
  (select auth.uid()) = creator_id
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);
