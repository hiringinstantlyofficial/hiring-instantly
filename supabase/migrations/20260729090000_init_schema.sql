-- =============================================================================
-- HiringInstantly - initial schema, RLS and indexes
--
-- Applied with `supabase db push`. Idempotent, so it is safe to re-run against
-- a database that already has some of these objects.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Admin identity
--
-- There is no public sign-up. The FIRST user created in Supabase Auth is
-- promoted to admin automatically by the trigger below; every write policy in
-- this file is gated on public.is_admin(). Adding candidate logins later
-- therefore cannot grant write access by accident.
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.promote_first_user_to_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admins) then
    insert into public.admins (user_id, email) values (new.id, new.email);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_promote_admin on auth.users;
create trigger on_auth_user_created_promote_admin
  after insert on auth.users
  for each row execute function public.promote_first_user_to_admin();

-- -----------------------------------------------------------------------------
-- jobs
-- -----------------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,

  -- Company
  company_name text not null,
  company_logo_url text,
  company_website text,
  company_description text,

  -- Placement
  location text not null,
  job_type text not null check (job_type in ('full-time','part-time','internship','contract','remote')),
  categories text[] not null default '{}',

  -- Seniority. experience_level is the coarse Fresher/Experienced split used by
  -- the homepage quick filter; job_level is the finer ladder shown in the
  -- sidebar facets.
  experience_level text not null check (experience_level in ('fresher','experienced')),
  job_level text check (job_level in ('entry','mid','senior','director','vp-or-above')),
  min_experience_years int check (min_experience_years >= 0),

  -- Compensation (annual, INR by default)
  salary_min numeric check (salary_min >= 0),
  salary_max numeric check (salary_max >= 0),
  salary_currency text not null default 'INR',

  -- Content
  description text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  nice_to_haves text[] not null default '{}',
  skills text[] not null default '{}',
  benefits text[] not null default '{}',

  -- How to apply
  application_url text,
  application_email text,

  -- Capacity meter shown on each job card
  capacity int check (capacity > 0),
  applicants_count int not null default 0 check (applicants_count >= 0),

  -- Internal
  status text not null default 'draft' check (status in ('draft','active','closed','expired')),
  is_featured boolean not null default false,
  posted_at timestamptz not null default now(),
  valid_through timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jobs_salary_range_valid check (salary_max is null or salary_min is null or salary_max >= salary_min),
  constraint jobs_has_apply_route check (application_url is not null or application_email is not null)
);

-- Full-text search vector kept in sync by Postgres itself.
--
-- The weighting lives in a helper function because a generated column requires
-- an IMMUTABLE expression, and `array_to_string` is only STABLE (in general its
-- result depends on the element type's output function). For a text[] the
-- result is genuinely deterministic, so wrapping it in an IMMUTABLE function is
-- sound - and a generated column cannot contain a subquery, which rules out
-- the `string_agg(... from unnest(skills))` alternative.
create or replace function public.jobs_search_vector(
  p_title text,
  p_company_name text,
  p_location text,
  p_skills text[],
  p_description text
)
returns tsvector
language sql
immutable
parallel safe
-- Built-ins and the text-search config are schema-qualified so the result can't
-- shift with the caller's search_path. (A `SET search_path` clause would also
-- work but would block inlining.)
as $$
  select pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.english', coalesce(p_title, '')), 'A') ||
         pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.english', coalesce(p_company_name, '')), 'B') ||
         pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.english', coalesce(p_location, '')), 'B') ||
         pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.english', coalesce(pg_catalog.array_to_string(p_skills, ' '), '')), 'C') ||
         pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.english', coalesce(p_description, '')), 'D')
$$;

alter table public.jobs
  add column if not exists search_vector tsvector
  generated always as (
    public.jobs_search_vector(
      title,
      company_name,
      location,
      skills,
      description
    )
  ) stored;

-- -----------------------------------------------------------------------------
-- contact_submissions
-- -----------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- newsletter_subscribers (footer "Get job notifications" form)
-- -----------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes - targeted at the queries this app actually runs, not blanket.
-- -----------------------------------------------------------------------------

-- The public listing query: status = 'active' ordered by posted_at desc.
-- Partial + composite so the index only carries rows the public can see.
create index if not exists jobs_active_posted_at_idx
  on public.jobs (posted_at desc)
  where status = 'active';

-- Featured rail on the homepage.
create index if not exists jobs_featured_idx
  on public.jobs (posted_at desc)
  where status = 'active' and is_featured = true;

-- Admin table view filters/sorts by status then recency.
create index if not exists jobs_status_posted_at_idx
  on public.jobs (status, posted_at desc);

-- Keyword search.
create index if not exists jobs_search_vector_idx
  on public.jobs using gin (search_vector);

-- Sidebar facet on categories (array containment).
create index if not exists jobs_categories_idx
  on public.jobs using gin (categories);

-- Case-insensitive location filter without a per-row function scan.
create index if not exists jobs_location_lower_idx
  on public.jobs (lower(location));

-- Expiry sweep.
create index if not exists jobs_valid_through_idx
  on public.jobs (valid_through)
  where status = 'active';

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row-Level Security
-- -----------------------------------------------------------------------------
alter table public.jobs enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.admins enable row level security;

-- jobs: anyone may read ACTIVE jobs; only the admin may read drafts or write.
drop policy if exists "jobs_public_read_active" on public.jobs;
create policy "jobs_public_read_active"
  on public.jobs for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "jobs_admin_read_all" on public.jobs;
create policy "jobs_admin_read_all"
  on public.jobs for select
  to authenticated
  using (public.is_admin());

drop policy if exists "jobs_admin_insert" on public.jobs;
create policy "jobs_admin_insert"
  on public.jobs for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "jobs_admin_update" on public.jobs;
create policy "jobs_admin_update"
  on public.jobs for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "jobs_admin_delete" on public.jobs;
create policy "jobs_admin_delete"
  on public.jobs for delete
  to authenticated
  using (public.is_admin());

-- contact_submissions: public may insert only; admin may read.
drop policy if exists "contact_public_insert" on public.contact_submissions;
create policy "contact_public_insert"
  on public.contact_submissions for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_admin_read" on public.contact_submissions;
create policy "contact_admin_read"
  on public.contact_submissions for select
  to authenticated
  using (public.is_admin());

drop policy if exists "contact_admin_delete" on public.contact_submissions;
create policy "contact_admin_delete"
  on public.contact_submissions for delete
  to authenticated
  using (public.is_admin());

-- newsletter_subscribers: public may insert only; admin may read.
drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "newsletter_admin_read" on public.newsletter_subscribers;
create policy "newsletter_admin_read"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

-- admins: a signed-in admin may read their own row. No client-side writes at
-- all; membership is granted by the auth trigger or manually via SQL.
drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());
