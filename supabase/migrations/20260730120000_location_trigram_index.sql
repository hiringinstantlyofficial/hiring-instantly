-- =============================================================================
-- Make the location filter index-backed.
--
-- The listing query filters with `location ilike '%<term>%'` (see getJobs in
-- src/lib/jobs.ts). The original index was a btree on `lower(location)`, which
-- ILIKE cannot use at all -- and even a plain `LIKE` cannot use a btree for a
-- leading-wildcard pattern. Every location search was therefore a sequential
-- scan of the whole jobs table.
--
-- pg_trgm's GIN index is the one thing that *does* accelerate `%term%`
-- matching, case-insensitively, so it replaces the btree outright: nothing in
-- the app ever queried `lower(location)` directly.
--
-- Idempotent, like the rest of the migrations.
-- =============================================================================

create extension if not exists pg_trgm with schema extensions;

create index if not exists jobs_location_trgm_idx
  on public.jobs
  using gin (location extensions.gin_trgm_ops);

-- Superseded by the trigram index above; no query referenced it.
drop index if exists public.jobs_location_lower_idx;
