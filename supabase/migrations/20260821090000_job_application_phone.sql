-- A third apply route: a phone number.
--
-- Plenty of the listings we take on (field sales, retail, walk-in hiring) give a
-- number and nothing else, and until now those could not be entered at all —
-- jobs_has_apply_route demanded a URL or an email. Phone joins that OR, so a
-- number on its own is a complete listing.

alter table public.jobs
  add column if not exists application_phone text;

comment on column public.jobs.application_phone is
  'Contact number for applying, used by the Apply button only when no URL or email is set.';

alter table public.jobs
  drop constraint if exists jobs_has_apply_route;

alter table public.jobs
  add constraint jobs_has_apply_route check (
    application_url is not null
    or application_email is not null
    or application_phone is not null
  );
