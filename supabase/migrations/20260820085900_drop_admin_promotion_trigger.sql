-- =============================================================================
-- Drop the first-user-becomes-admin trigger BEFORE public sign-up exists.
--
-- init_schema.sql promotes any new auth.users row to admin while the admins
-- table is empty, and its own comment justifies that with "there is no public
-- sign-up." The employer portal introduces public sign-up (magic-link
-- recruiters), which turns the trigger into a live privilege-escalation path:
-- empty the admins table by any means — an accidental cascade, a bad cleanup
-- script — and the next recruiter to request a magic link becomes an
-- administrator.
--
-- Bootstrapping a new environment is now one documented statement, run in the
-- Supabase SQL editor after creating the auth user:
--
--   insert into public.admins (user_id, email)
--   select id, email from auth.users where email = 'you@example.com';
--
-- Idempotent, like the rest of these migrations. Ships on its own (Phase 0 of
-- docs/employer-portal-plan.md) and must be deployed before the portal's
-- sign-up routes.
-- =============================================================================

drop trigger if exists on_auth_user_created_promote_admin on auth.users;
drop function if exists public.promote_first_user_to_admin();
