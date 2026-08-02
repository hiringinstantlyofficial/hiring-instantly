-- =============================================================================
-- Blog articles
--
-- Articles started life as typed modules compiled into the bundle. Moving them
-- here buys an admin CRUD screen and publishing without a deploy; the cost is
-- that they are no longer reviewable in a code diff, which is why `status` and
-- the schedule gate below matter more than they did.
--
-- Idempotent, like the rest of these migrations.
-- =============================================================================

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,

  -- Meta description and OG description; the excerpt is the longer card blurb.
  description text not null,
  excerpt text not null,

  category text not null check (category in (
    'resume','interviews','salary','job-search','career-growth','workplace'
  )),

  -- The article itself, GitHub-flavoured markdown. Rendered through
  -- react-markdown, never through dangerouslySetInnerHTML.
  body_markdown text not null,

  reading_minutes int not null default 5 check (reading_minutes > 0),
  tags text[] not null default '{}',
  -- Slugs of hand-picked follow-on reads. Deliberately not a foreign key: an
  -- article may reference one that is still a draft, and a dangling slug is
  -- dropped at render time rather than blocking the write.
  related text[] not null default '{}',

  status text not null default 'draft' check (status in ('draft','published')),

  -- The publication date, and the schedule gate: a row with a future
  -- published_at is invisible to the public until that moment arrives, so
  -- posts can be queued in advance instead of published in a burst.
  published_at timestamptz not null default now(),

  -- Editorial "Updated on" stamp, set by hand only when an article has been
  -- materially revised. Distinct from updated_at, which the trigger below
  -- touches on every save and which readers never see.
  revised_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

-- The public index page: published, in date order. Partial so the index only
-- carries rows the public can see.
create index if not exists articles_published_at_idx
  on public.articles (published_at desc)
  where status = 'published';

-- Category groupings on the same page.
create index if not exists articles_category_published_at_idx
  on public.articles (category, published_at desc)
  where status = 'published';

-- Admin table view: filtered by status, newest first.
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);

-- -----------------------------------------------------------------------------
-- updated_at maintenance (function defined in the init migration)
-- -----------------------------------------------------------------------------
drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row-Level Security
--
-- The public policy is where scheduling is actually enforced. The query layer
-- applies the same two conditions, but this is the one that holds if a query
-- ever forgets them.
-- -----------------------------------------------------------------------------
alter table public.articles enable row level security;

drop policy if exists "articles_public_read_published" on public.articles;
create policy "articles_public_read_published"
  on public.articles for select
  to anon, authenticated
  using (status = 'published' and published_at <= now());

drop policy if exists "articles_admin_read_all" on public.articles;
create policy "articles_admin_read_all"
  on public.articles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "articles_admin_insert" on public.articles;
create policy "articles_admin_insert"
  on public.articles for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "articles_admin_update" on public.articles;
create policy "articles_admin_update"
  on public.articles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "articles_admin_delete" on public.articles;
create policy "articles_admin_delete"
  on public.articles for delete
  to authenticated
  using (public.is_admin());
