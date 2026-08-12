-- =============================================================================
-- Companies as a first-class table
--
-- Company identity used to live as four denormalised columns on public.jobs
-- (company_name, company_logo_url, company_website, company_description). That
-- meant the same employer carried a different "About us" on every listing, and
-- there was nothing to hang a profile page off.
--
-- This migration creates public.companies, backfills it from the distinct
-- company names already on jobs, points jobs at it via company_id, and drops
-- the three columns that are now owned by the company row.
--
-- company_name deliberately STAYS on jobs. jobs.search_vector is a generated
-- column built from it (see the init migration), and a generated column cannot
-- contain a subquery, so it cannot reach through a foreign key. It is kept in
-- step by the triggers at the bottom of this file, which are the only writers.
--
-- Idempotent, like the rest of these migrations.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Slug helper
--
-- Mirrors slugify() in src/lib/utils.ts so a row created by this backfill gets
-- the same slug the admin form would have produced for it.
-- -----------------------------------------------------------------------------
create or replace function public.slugify(p_input text)
returns text
language sql
immutable
parallel safe
as $$
  select nullif(
    regexp_replace(
      regexp_replace(
        left(
          regexp_replace(
            lower(trim(coalesce(p_input, ''))),
            '[^a-z0-9]+', '-', 'g'
          ),
          80
        ),
        '-+', '-', 'g'
      ),
      '^-|-$', '', 'g'
    ),
    ''
  );
$$;

-- -----------------------------------------------------------------------------
-- companies
-- -----------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  legal_name text,

  -- Both images live in the `company-media` Storage bucket (see the companion
  -- migration). The column holds the full public URL rather than the object
  -- path: an admin may still point at an external CDN, and it keeps this
  -- backfill a straight column copy from jobs.
  logo_url text,
  cover_url text,

  website text,
  -- THE company description. One row, one description, every listing.
  description text,
  -- One line, used on the /companies card and as the meta description.
  tagline text,

  industry text,
  headquarters text,
  founded_year int check (founded_year between 1800 and 2100),
  size_range text check (size_range in (
    '1-10','11-50','51-200','201-500','501-1000','1001-5000','5000+'
  )),
  linkedin_url text,

  is_verified boolean not null default false,
  status text not null default 'active' check (status in ('active','hidden')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Company names are matched case-insensitively everywhere (the backfill below,
-- the admin's "match or create" on import), so the uniqueness that actually
-- matters is on lower(name), not on the raw text.
create unique index if not exists companies_name_lower_idx
  on public.companies (lower(name));

create index if not exists companies_status_name_idx
  on public.companies (status, name);

-- -----------------------------------------------------------------------------
-- jobs.company_id
--
-- `on delete restrict`: deleting a company that still has listings should fail
-- loudly rather than cascade away the jobs. The admin UI checks the count first
-- and offers to reassign.
-- -----------------------------------------------------------------------------
alter table public.jobs
  add column if not exists company_id uuid references public.companies (id) on delete restrict;

create index if not exists jobs_company_id_idx on public.jobs (company_id);

-- -----------------------------------------------------------------------------
-- Backfill
--
-- Guarded on the columns still existing so a re-run against an already-migrated
-- database is a no-op rather than an error.
-- -----------------------------------------------------------------------------
do $$
declare
  v_has_legacy_columns boolean;
  v_unassigned int;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jobs'
      and column_name = 'company_description'
  ) into v_has_legacy_columns;

  if v_has_legacy_columns then
    -- One row per distinct company name. Where listings disagree, the longest
    -- description wins (it is the one someone actually wrote), and the first
    -- non-null logo/website is taken.
    execute $backfill$
      insert into public.companies (slug, name, logo_url, website, description)
      select
        coalesce(public.slugify(name), 'company') ||
          case when row_number() over (partition by public.slugify(name) order by name) > 1
            then '-' || (row_number() over (partition by public.slugify(name) order by name))::text
            else ''
          end,
        name,
        logo_url,
        website,
        description
      from (
        select
          min(company_name) as name,
          (array_remove(array_agg(company_logo_url order by company_logo_url), null))[1] as logo_url,
          (array_remove(array_agg(company_website order by company_website), null))[1] as website,
          (array_remove(
            array_agg(company_description order by length(company_description) desc nulls last),
            null
          ))[1] as description
        from public.jobs
        group by lower(company_name)
      ) as rollup
      on conflict do nothing
    $backfill$;
  end if;

  -- Attach every job to its company. Runs unconditionally: a row inserted
  -- between the two halves of this migration still needs an owner.
  update public.jobs j
  set company_id = c.id
  from public.companies c
  where j.company_id is null
    and lower(j.company_name) = lower(c.name);

  select count(*) into v_unassigned from public.jobs where company_id is null;

  if v_unassigned = 0 then
    alter table public.jobs alter column company_id set not null;
  else
    raise notice
      'Left jobs.company_id nullable: % job row(s) have no matching company. '
      'Fix those rows, then run: alter table public.jobs alter column company_id set not null;',
      v_unassigned;
  end if;
end;
$$;

-- The three columns the company row now owns. Dropped only after the backfill
-- above has read them.
alter table public.jobs
  drop column if exists company_logo_url,
  drop column if exists company_website,
  drop column if exists company_description;

-- -----------------------------------------------------------------------------
-- Keeping jobs.company_name in step
--
-- Two triggers, one direction of truth: companies.name is authoritative and
-- jobs.company_name is a derived mirror that exists so the generated
-- search_vector (and the admin table's ilike filter) keep working.
-- -----------------------------------------------------------------------------
create or replace function public.jobs_sync_company_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.company_id is not null then
    select name into new.company_name from public.companies where id = new.company_id;
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_sync_company_name on public.jobs;
create trigger jobs_sync_company_name
  before insert or update of company_id on public.jobs
  for each row execute function public.jobs_sync_company_name();

create or replace function public.companies_propagate_rename()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Touching company_name re-derives search_vector on each affected job, which
  -- is the whole point: a renamed company stays findable by its new name.
  update public.jobs set company_name = new.name where company_id = new.id;
  return new;
end;
$$;

drop trigger if exists companies_propagate_rename on public.companies;
create trigger companies_propagate_rename
  after update of name on public.companies
  for each row when (old.name is distinct from new.name)
  execute function public.companies_propagate_rename();

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row-Level Security — the same shape as public.jobs.
-- -----------------------------------------------------------------------------
alter table public.companies enable row level security;

drop policy if exists "companies_public_read" on public.companies;
create policy "companies_public_read"
  on public.companies for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "companies_admin_read_all" on public.companies;
create policy "companies_admin_read_all"
  on public.companies for select
  to authenticated
  using (public.is_admin());

drop policy if exists "companies_admin_insert" on public.companies;
create policy "companies_admin_insert"
  on public.companies for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "companies_admin_update" on public.companies;
create policy "companies_admin_update"
  on public.companies for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "companies_admin_delete" on public.companies;
create policy "companies_admin_delete"
  on public.companies for delete
  to authenticated
  using (public.is_admin());
