-- =============================================================================
-- Employer portal: recruiters, company memberships, the pending/rejected job
-- states and the review audit trail.
--
-- The design premise (docs/employer-portal-plan.md, D2): nothing a recruiter
-- writes is ever publicly readable, because the public read policies already
-- say `status = 'active'` and every recruiter write is forced to
-- 'draft'/'pending' by the triggers below. No existing policy is loosened by
-- this file — everything here is additive.
--
-- Idempotent, in the style of the existing migrations.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- recruiters — the profile row hanging off an auth user. Parallel to
-- public.admins deliberately: same shape, same security-definer predicate.
-- -----------------------------------------------------------------------------
create table if not exists public.recruiters (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  work_email text not null,
  phone text not null,
  designation text,
  linkedin_url text,

  -- 'suspended' is the kill switch: is_recruiter() below returns false for a
  -- suspended recruiter, so every write policy enforces it at once.
  status text not null default 'active'
    check (status in ('pending','active','suspended')),

  -- Sorts the review queue and is the hook a future auto-approve hangs on.
  -- Recomputed by the approve/reject actions, never written by the recruiter.
  trust_level text not null default 'new'
    check (trust_level in ('new','known','trusted')),

  -- Generated, so the D4 domain match is an indexed equality, not a scan.
  email_domain text generated always as (
    lower(split_part(work_email, '@', 2))
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The phone is mandatory and must be an Indian mobile in canonical +91 form —
-- it is the admin's escape hatch for a suspicious submission, so it has to be
-- dialable. The app's `indianPhone` validator normalises to exactly this
-- shape; the constraint is the backstop against a direct PostgREST write
-- through the self-update policy sneaking in garbage.
alter table public.recruiters
  drop constraint if exists recruiters_phone_india_check;
alter table public.recruiters
  add constraint recruiters_phone_india_check
    check (phone ~ '^\+91[6-9]\d{9}$');

create index if not exists recruiters_email_domain_idx
  on public.recruiters (email_domain);
create index if not exists recruiters_status_idx
  on public.recruiters (status);

drop trigger if exists recruiters_set_updated_at on public.recruiters;
create trigger recruiters_set_updated_at
  before update on public.recruiters
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- company_members — which recruiters may act for which company (D4).
--
-- `on delete cascade`, unlike jobs.company_id's `restrict`: a membership is a
-- relationship, not content, and it has no meaning without both ends.
-- -----------------------------------------------------------------------------
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  recruiter_id uuid not null references public.recruiters (user_id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  -- WHY it was approved: 'domain-match' (work-email host = company website
  -- host), 'admin' (reviewed by hand), or 'owner' (the recruiter created this
  -- company, so there is nothing to protect from them yet). This is the audit
  -- answer to "who let this person edit Infosys?"
  approved_via text check (approved_via in ('domain-match','admin','owner')),
  approved_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, recruiter_id)
);

create index if not exists company_members_recruiter_idx
  on public.company_members (recruiter_id, status);
create index if not exists company_members_pending_idx
  on public.company_members (created_at desc) where status = 'pending';

drop trigger if exists company_members_set_updated_at on public.company_members;
create trigger company_members_set_updated_at
  before update on public.company_members
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- companies — three additions, no drops. 'pending' joins the status set, and
-- the untouched companies_public_read policy (`using (status = 'active')`)
-- already excludes it: invisible by construction.
-- -----------------------------------------------------------------------------
alter table public.companies
  drop constraint if exists companies_status_check;
alter table public.companies
  add constraint companies_status_check
    check (status in ('pending','active','hidden'));

alter table public.companies
  add column if not exists created_by uuid references auth.users (id),
  add column if not exists email_domain text;

-- email_domain is a plain column rather than generated: deriving a host from a
-- free-text URL is not IMMUTABLE-safe, so a trigger writes it instead. Must
-- stay in step with domainFromWebsite() in src/lib/recruiters.ts.
create or replace function public.companies_derive_email_domain()
returns trigger
language plpgsql
as $$
begin
  new.email_domain := nullif(
    lower(
      regexp_replace(
        regexp_replace(coalesce(new.website, ''), '^[a-z][a-z0-9+.-]*://', '', 'i'),
        '^(www\.)?([^/:?#]*).*$', '\2'
      )
    ),
    ''
  );
  -- A bare word with no dot ("localhost", garbage) is not a domain.
  if new.email_domain is not null and position('.' in new.email_domain) = 0 then
    new.email_domain := null;
  end if;
  return new;
end;
$$;

drop trigger if exists companies_derive_email_domain on public.companies;
create trigger companies_derive_email_domain
  before insert or update of website on public.companies
  for each row execute function public.companies_derive_email_domain();

-- Backfill the new column for rows that predate the trigger.
update public.companies
set website = website
where website is not null and email_domain is null;

-- -----------------------------------------------------------------------------
-- jobs — the status widening plus review metadata.
-- -----------------------------------------------------------------------------
alter table public.jobs
  drop constraint if exists jobs_status_check;
alter table public.jobs
  add constraint jobs_status_check
    check (status in ('draft','pending','active','rejected','closed','expired'));

alter table public.jobs
  add column if not exists submitted_by uuid references public.recruiters (user_id) on delete set null,
  add column if not exists source text not null default 'admin' check (source in ('admin','recruiter')),
  add column if not exists reviewed_by uuid references auth.users (id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text,
  -- The D3 diff base: a snapshot of the row as last approved.
  add column if not exists approved_snapshot jsonb;

-- Partial, matching jobs_active_posted_at_idx: the queue query is
-- `status = 'pending' order by created_at` and the index carries only those.
create index if not exists jobs_pending_idx
  on public.jobs (created_at desc) where status = 'pending';
create index if not exists jobs_submitted_by_idx
  on public.jobs (submitted_by, updated_at desc);

-- -----------------------------------------------------------------------------
-- job_review_events — small, append-only audit trail. The recruiter's job
-- detail page renders it as a timeline, and a rejection dispute is answerable
-- from data rather than memory.
-- -----------------------------------------------------------------------------
create table if not exists public.job_review_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  actor_id uuid references auth.users (id),
  action text not null check (action in
    ('submitted','approved','changes-requested','rejected','resubmitted','withdrawn')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists job_review_events_job_idx
  on public.job_review_events (job_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Predicate functions, mirroring public.is_admin(): security definer, stable,
-- pinned search_path.
-- -----------------------------------------------------------------------------

-- False for a suspended recruiter, so suspension is enforced by every policy
-- at once rather than by remembering to check it in each.
create or replace function public.is_recruiter()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.recruiters
    where user_id = auth.uid() and status = 'active'
  );
$$;

-- Approved members only (D4): may edit the company profile and write into its
-- media folders.
create or replace function public.can_manage_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.company_members m
    join public.recruiters r on r.user_id = m.recruiter_id
    where m.company_id = p_company_id
      and m.recruiter_id = auth.uid()
      and m.status = 'approved'
      and r.status = 'active'
  );
$$;

-- Text overload for the storage policies, where the company id is a path
-- segment: a malformed path must fail the membership check, not error the
-- statement.
create or replace function public.can_manage_company(p_company_id text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  begin
    v_id := p_company_id::uuid;
  exception when others then
    return false;
  end;
  return public.can_manage_company(v_id);
end;
$$;

-- Any non-rejected membership (D4: posting is allowed while the membership is
-- still pending verification), or admin.
create or replace function public.can_post_for_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.company_members m
    join public.recruiters r on r.user_id = m.recruiter_id
    where m.company_id = p_company_id
      and m.recruiter_id = auth.uid()
      and m.status in ('pending','approved')
      and r.status = 'active'
  );
$$;

-- -----------------------------------------------------------------------------
-- The triggers that do the actual enforcing.
--
-- All of them pass admin writes through untouched, and also writes where
-- auth.uid() is null — the service-role client and SQL run from migrations or
-- the dashboard carry no user JWT. RLS already stops anonymous writers, so the
-- null case can only be a trusted server-side caller.
-- -----------------------------------------------------------------------------

-- D3's mechanism, and the reason recruiter writes are safe: whatever the
-- client sent, a non-admin write lands on 'draft' or 'pending', and every
-- editorial column is pinned. An update to an 'active' row therefore lands on
-- 'pending' — the reviewed state and the live state can never diverge, no
-- matter which client made the write.
create or replace function public.jobs_enforce_recruiter_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;

  new.status := case when new.status = 'draft' then 'draft' else 'pending' end;
  new.source := 'recruiter';

  if tg_op = 'INSERT' then
    new.submitted_by      := auth.uid();
    new.is_featured       := false;
    new.applicants_count  := 0;
    new.reviewed_by       := null;
    new.reviewed_at       := null;
    new.review_note       := null;
    new.approved_snapshot := null;
    new.posted_at         := now();
  else
    new.submitted_by      := coalesce(old.submitted_by, auth.uid());
    new.is_featured       := old.is_featured;
    new.applicants_count  := old.applicants_count;
    new.reviewed_by       := old.reviewed_by;
    new.reviewed_at       := old.reviewed_at;
    new.review_note       := old.review_note;
    new.approved_snapshot := old.approved_snapshot;
    new.posted_at         := coalesce(old.posted_at, now());
    -- The slug is the public URL once approved; a recruiter edit never moves it.
    new.slug              := old.slug;
  end if;

  return new;
end;
$$;

drop trigger if exists jobs_enforce_recruiter_rules on public.jobs;
create trigger jobs_enforce_recruiter_rules
  before insert or update on public.jobs
  for each row execute function public.jobs_enforce_recruiter_rules();

-- Captures the diff base for re-review on the -> active transition. Gated on
-- the writer being an admin (or server-side) because BEFORE-UPDATE triggers
-- fire alphabetically: this one runs before jobs_enforce_recruiter_rules, so
-- without the gate a recruiter forging status='active' would poison the
-- snapshot with unapproved content before the enforcement trigger reset it.
create or replace function public.jobs_capture_approval_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (public.is_admin() or auth.uid() is null)
     and new.status = 'active'
     and old.status is distinct from 'active' then
    -- Strip the recursive column and the (large, derived) search vector.
    new.approved_snapshot := to_jsonb(new) - 'approved_snapshot' - 'search_vector';
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_capture_approval_snapshot on public.jobs;
create trigger jobs_capture_approval_snapshot
  before update of status on public.jobs
  for each row execute function public.jobs_capture_approval_snapshot();

-- Same shape for companies: a non-admin writer cannot publish, verify or move
-- the URL of a company, whatever the client sent. work is pinned on both paths.
create or replace function public.companies_enforce_recruiter_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status      := 'pending';
    new.is_verified := false;
    new.created_by  := auth.uid();
  else
    new.status      := old.status;
    new.is_verified := old.is_verified;
    new.slug        := old.slug;
    new.created_by  := old.created_by;
  end if;

  return new;
end;
$$;

drop trigger if exists companies_enforce_recruiter_rules on public.companies;
create trigger companies_enforce_recruiter_rules
  before insert or update on public.companies
  for each row execute function public.companies_enforce_recruiter_rules();

-- The recruiter's own profile: status, trust_level and the verified work email
-- are the server's to write, never the client's. work_email is pinned to the
-- auth email because it drives the D4 domain auto-approve — a self-written
-- value would let anyone claim any company's domain.
create or replace function public.recruiters_enforce_self_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'active';
    new.trust_level := 'new';
    select lower(email) into new.work_email from auth.users where id = auth.uid();
  else
    new.status := old.status;
    new.trust_level := old.trust_level;
    new.work_email := old.work_email;
    new.user_id := old.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists recruiters_enforce_self_rules on public.recruiters;
create trigger recruiters_enforce_self_rules
  before insert or update on public.recruiters
  for each row execute function public.recruiters_enforce_self_rules();

-- -----------------------------------------------------------------------------
-- Row-Level Security. Additive throughout: jobs_public_read_active and
-- companies_public_read are not touched at all.
-- -----------------------------------------------------------------------------
alter table public.recruiters enable row level security;
alter table public.company_members enable row level security;
alter table public.job_review_events enable row level security;

-- recruiters: self read/insert/update (the trigger above pins the protected
-- columns), plus admin read/write for the directory and the suspend toggle.
drop policy if exists "recruiters_self_read" on public.recruiters;
create policy "recruiters_self_read"
  on public.recruiters for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "recruiters_self_insert" on public.recruiters;
create policy "recruiters_self_insert"
  on public.recruiters for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "recruiters_self_update" on public.recruiters;
create policy "recruiters_self_update"
  on public.recruiters for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "recruiters_admin_read" on public.recruiters;
create policy "recruiters_admin_read"
  on public.recruiters for select
  to authenticated
  using (public.is_admin());

drop policy if exists "recruiters_admin_update" on public.recruiters;
create policy "recruiters_admin_update"
  on public.recruiters for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- company_members: read own + admin; insert own, pending only. NO recruiter
-- update or delete at all — approving your own membership is exactly the thing
-- being prevented. Approvals go through the service-role client (which
-- bypasses RLS) inside the server actions.
drop policy if exists "company_members_read_own" on public.company_members;
create policy "company_members_read_own"
  on public.company_members for select
  to authenticated
  using (recruiter_id = auth.uid() or public.is_admin());

drop policy if exists "company_members_self_insert" on public.company_members;
create policy "company_members_self_insert"
  on public.company_members for insert
  to authenticated
  with check (
    public.is_recruiter()
    and recruiter_id = auth.uid()
    and status = 'pending'
    and approved_via is null
    and approved_by is null
  );

-- jobs: the recruiter policies sit beside the admin ones. The public policy
-- still only exposes status = 'active'.
drop policy if exists "jobs_recruiter_read_own" on public.jobs;
create policy "jobs_recruiter_read_own"
  on public.jobs for select
  to authenticated
  using (submitted_by = auth.uid());

drop policy if exists "jobs_recruiter_insert" on public.jobs;
create policy "jobs_recruiter_insert"
  on public.jobs for insert
  to authenticated
  with check (public.is_recruiter() and public.can_post_for_company(company_id));

-- 'closed' and 'expired' are deliberately absent: a finished listing is not
-- editable back into circulation.
drop policy if exists "jobs_recruiter_update" on public.jobs;
create policy "jobs_recruiter_update"
  on public.jobs for update
  to authenticated
  using (
    public.is_recruiter()
    and submitted_by = auth.uid()
    and status in ('draft','pending','rejected','active')
  )
  with check (
    public.is_recruiter()
    and submitted_by = auth.uid()
    and status in ('draft','pending','rejected','active')
    -- An edit may not re-point the listing at a company the recruiter has no
    -- membership with — same rule as insert.
    and public.can_post_for_company(company_id)
  );

-- Withdraw something never published; a live listing is closed, not deleted.
drop policy if exists "jobs_recruiter_delete" on public.jobs;
create policy "jobs_recruiter_delete"
  on public.jobs for delete
  to authenticated
  using (
    public.is_recruiter()
    and submitted_by = auth.uid()
    and status in ('draft','rejected')
  );

-- companies: a pending company is visible to the people attached to it; the
-- literal status = 'pending' in the insert check is what stops a recruiter
-- from self-publishing one (the trigger forces it anyway — belt and braces).
drop policy if exists "companies_member_read_own" on public.companies;
create policy "companies_member_read_own"
  on public.companies for select
  to authenticated
  using (public.can_post_for_company(id));

-- The creator can always read their own row. Necessary and not redundant with
-- the policy above: the wizard's INSERT ... RETURNING runs before the owner
-- membership row exists, and RETURNING requires a passing select policy.
drop policy if exists "companies_creator_read" on public.companies;
create policy "companies_creator_read"
  on public.companies for select
  to authenticated
  using (created_by = auth.uid());

drop policy if exists "companies_recruiter_insert" on public.companies;
create policy "companies_recruiter_insert"
  on public.companies for insert
  to authenticated
  with check (
    public.is_recruiter()
    and status = 'pending'
    and created_by = auth.uid()
  );

drop policy if exists "companies_member_update" on public.companies;
create policy "companies_member_update"
  on public.companies for update
  to authenticated
  using (public.is_recruiter() and public.can_manage_company(id))
  with check (public.is_recruiter() and public.can_manage_company(id));

-- job_review_events: recruiters read events for their own jobs; the admin
-- reads and writes everything; the employer-side server actions write through
-- the service-role client, which bypasses RLS.
drop policy if exists "job_review_events_read" on public.job_review_events;
create policy "job_review_events_read"
  on public.job_review_events for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.jobs j
      where j.id = job_id and j.submitted_by = auth.uid()
    )
  );

drop policy if exists "job_review_events_admin_insert" on public.job_review_events;
create policy "job_review_events_admin_insert"
  on public.job_review_events for insert
  to authenticated
  with check (public.is_admin());
