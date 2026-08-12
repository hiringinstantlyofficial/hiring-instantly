# Implementation plan — company profiles + self-hosted company images

**Goal.** Promote "company" from four duplicated columns on `jobs` to a first-class
`companies` table with its own public profile page, and host both company images
(logo + background) in Supabase Storage with full upload / replace / remove
control from the admin.

**Why now.** `jobs.company_description` is written per listing, so the same
employer carries a different "About us" on every role. `/companies` is a rollup
computed at read time with no page of its own, and `company_logo_url` is a free
text field an admin pastes an arbitrary URL into.

---

## 0. Decisions taken up front

These shape everything below; each is a deliberate trade-off, not an oversight.

### D1 — `jobs.company_name` stays, denormalised and trigger-maintained

`jobs.search_vector` is a **generated column** built by
`public.jobs_search_vector(title, company_name, location, skills, description)`
([init_schema.sql](supabase/migrations/20260729090000_init_schema.sql)). A
generated column cannot contain a subquery, so it cannot reach through a foreign
key. Dropping `company_name` therefore means rewriting keyword search, the
facet scan and the admin table's `.or(...ilike...)` filter.

So: `jobs` gains `company_id uuid references companies(id)`, and keeps
`company_name` as a mirror that a trigger overwrites from `companies.name` on
every insert/update of a job and on every rename of a company. Two storage
locations, one writer — the mirror can't drift.

### D2 — logo / website / description move off `jobs` entirely

`company_logo_url`, `company_website` and `company_description` are **dropped**
from `jobs` after backfill. These are exactly the "multiple descriptions for the
same company" the change exists to remove, and unlike `company_name` nothing
generated depends on them. Job reads embed the company row via PostgREST
(`select("*, company:companies(...)")`), which the new FK makes available.

### D3 — one storage bucket, two folder prefixes

A new public bucket `company-media` holding `logos/…` and `covers/…`, rather
than a second bucket beside `company-logos`. One set of four RLS policies to
maintain instead of eight. The existing `company-logos` bucket is **not**
deleted — old public URLs stay resolvable, and the backfill copies the URLs as
they are.

### D4 — columns store the full public URL, not the storage path

`company_logo_url` on `companies` keeps holding a full `https://…` URL, matching
what's in `jobs.company_logo_url` today and letting an admin still point at an
external CDN. Deletion needs the object path, so a small helper parses it back
out of the URL when the URL is on our own bucket. This keeps the backfill a
straight column copy and leaves [image-hosts.ts](src/lib/image-hosts.ts)
unchanged.

### D5 — a company with zero active jobs is `noindex` and out of the sitemap

The page still renders (useful for admin preview and for direct links), but a
profile with no live roles is thin content that shouldn't be crawled.

---

## 1. Data model

### `supabase/migrations/20260813090000_companies.sql`

Idempotent, in the style of the existing migrations.

```
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  legal_name text,

  logo_url text,
  cover_url text,              -- the profile background image

  website text,
  description text,            -- the single "About the company", long form
  tagline text,                -- one line, used on the /companies card + meta

  industry text,
  headquarters text,
  founded_year int check (founded_year between 1800 and 2100),
  size_range text check (size_range in
    ('1-10','11-50','51-200','201-500','501-1000','1001-5000','5000+')),
  linkedin_url text,

  is_verified boolean not null default false,
  status text not null default 'active' check (status in ('active','hidden')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists companies_name_lower_idx
  on public.companies (lower(name));
```

Then, on `jobs`:

```
alter table public.jobs
  add column if not exists company_id uuid references public.companies (id) on delete restrict;

create index if not exists jobs_company_id_idx on public.jobs (company_id);
```

**Backfill**, in the same migration and in this order:

1. `insert into companies (slug, name, logo_url, website, description) select …
   distinct on (lower(company_name))` from `jobs`, picking the **longest**
   non-null `company_description` per company as the winner and the first
   non-null `logo_url` / `website`. Slug via a plpgsql `slugify` helper with a
   `-2`, `-3` suffix loop for collisions.
2. `update jobs set company_id = c.id from companies c where lower(jobs.company_name) = lower(c.name)`.
3. `alter table public.jobs alter column company_id set not null` — guarded by a
   `do $$ … $$` that raises a clear notice and skips if any row is still null,
   so a partially-seeded database doesn't hard-fail the push.
4. `alter table public.jobs drop column if exists company_logo_url, …website, …description`.

**Sync trigger** (D1):

- `jobs_sync_company_name` — `before insert or update of company_id on jobs`,
  sets `new.company_name := (select name from companies where id = new.company_id)`.
- `companies_propagate_rename` — `after update of name on companies`, runs
  `update jobs set company_name = new.name where company_id = new.id` (which
  re-derives each affected `search_vector`).
- `companies_set_updated_at` — reuses the existing `public.set_updated_at()`.

**RLS**, mirroring the `jobs` policies exactly:

- `companies_public_read` — `select` to `anon, authenticated` where `status = 'active'`.
- `companies_admin_read_all` / `_insert` / `_update` / `_delete` — gated on `public.is_admin()`.

The `on delete restrict` on the FK is deliberate: deleting a company that still
has listings should fail loudly, and the admin delete flow (§6) checks the job
count first and offers to reassign.

### `supabase/migrations/20260813090100_storage_company_media.sql`

A copy of [storage_company_logos.sql](supabase/migrations/20260729090100_storage_company_logos.sql)
— including the `insufficient_privilege` → `raise notice` escape hatch, which
exists because `storage.objects` is owned by `supabase_storage_admin` — creating
bucket `company-media` with:

- `public = true`
- `file_size_limit = 5242880` (5 MB)
- `allowed_mime_types = {image/png, image/jpeg, image/webp, image/avif}`

**No `image/svg+xml`**: an SVG is an executable document, and a public bucket
serves it inline. `next/image` won't optimise it either, so it buys nothing.

Four policies: public `select`; `insert` / `update` / `delete` to `authenticated`
where `bucket_id = 'company-media' and public.is_admin()`.

---

## 2. Types and validation

| File | Change |
|---|---|
| `src/types/company.ts` *(new)* | `Company` row type (**type alias**, not an interface — supabase-js resolves interfaces to `never`, see the note in [job.ts](src/types/job.ts)), `CompanyInput`, `COMPANY_SIZE_RANGES` + labels, `COMPANY_STATUSES`. |
| [src/types/job.ts](src/types/job.ts) | Drop `company_logo_url` / `company_website` / `company_description` from `Job`; add `company_id: string`. Add `JobWithCompany = Job & { company: CompanyRef | null }` where `CompanyRef` is the embedded subset (`id, slug, name, logo_url, website`). |
| [src/types/database.ts](src/types/database.ts) | Add the `companies` table (`Row` / `Insert` / `Update`), amend `JobInsert`, and add the `jobs → companies` FK to `Relationships` so the embedded select types correctly. Insert shapes stay **longhand** — the file's header explains why derived `Omit`/`Partial` types break here. |
| [src/lib/validations.ts](src/lib/validations.ts) | New `companyFormSchema` reusing the existing `optionalUrl` helper for `website` / `linkedin_url` / `logo_url` / `cover_url`, slug regex identical to the job/article one, `description` `.max(8000)`, `tagline` `.max(200)`. Strip the four company fields out of `jobFormSchema`, add `company_id: z.string().uuid("Pick a company")`. |
| [src/lib/job-import.ts](src/lib/job-import.ts) | The scrape JSON still carries `company_name` etc. Keep parsing them, but emit them as a `companyHint: { name, website, logoUrl, description }` on the parse result instead of form fields; the form turns that into a "match or create" step (§6). |

---

## 3. Storage plumbing

### `src/lib/storage.ts` *(new)*

Pure, unit-testable helpers — no Supabase client, so they test without mocks:

- `COMPANY_MEDIA_BUCKET = "company-media"`
- `companyMediaPath(kind: "logo" | "cover", companyId, fileName)` →
  `logos/<companyId>/<uuid>.<ext>`. UUID-suffixed rather than a fixed name so a
  replacement gets a new URL and can't be served from a stale CDN cache.
- `storagePathFromPublicUrl(url)` → the object path, or `null` when the URL is
  external or on a different bucket. This is what makes "remove" and "replace"
  able to clean up the old object without a second column (D4).
- `assertUploadable(file)` → mirrors the bucket's own limits client-side (≤5 MB,
  mime in the allowlist) so the admin gets a readable error instead of a 413.

### `src/components/admin/image-uploader.tsx` *(new, client)*

One component, two instances (logo and cover), driven by props:

```
<ImageUploader
  kind="logo" | "cover"
  companyId={id}
  value={watch("logo_url")}
  onChange={(url) => setValue("logo_url", url, { shouldDirty: true })}
/>
```

Behaviour:

- File input + drag-and-drop, showing the current image (`next/image` when
  [isOptimizableImage](src/lib/image-hosts.ts) says so — the Supabase host is
  already in `remotePatterns`, so **no `next.config.ts` change is needed**).
- Upload through the **browser** client ([client.ts](src/lib/supabase/client.ts)),
  so the admin's own session authorises it and the storage RLS policy is what
  actually gates the write. No service-role key anywhere near this.
- **Replace** = upload new → set the field → best-effort `remove()` of the old
  object when `storagePathFromPublicUrl` resolves it.
- **Remove** = clear the field → best-effort delete of the object.
- Both deletes are best-effort by design: an orphaned object is harmless, a
  dangling URL on the page is not, so the column write is what's trusted.
- Progress + error surface inline; a failed upload never touches the field.

**New-company ordering.** Uploads need a company id for the path, but a new
company has no row yet. The form generates `crypto.randomUUID()` on mount and
submits it as the explicit `id` (the column has a default, not a constraint
against supplying one). Nothing is two-phase. Cost: abandoning the form after
uploading leaves an orphan object — acceptable, and noted in §9 as a periodic
sweep.

---

## 4. Read layer

### `src/lib/companies.ts` *(new)*

Follows [lib/jobs.ts](src/lib/jobs.ts) exactly — `unstable_cache` around the
Supabase call, a `CompanyQueryError` so a transient failure **throws** rather
than caching an empty result, and `reportError` degrading `PGRST205`/`42P01`
(table missing) to a warning instead of a 500.

- `COMPANIES_CACHE_TAG = "companies"`
- `getCompanyDirectory()` — replaces `getCompanies()` in [jobs.ts](src/lib/jobs.ts).
  One query on `companies` with an embedded `jobs!inner(count)` filtered to
  `status = 'active'`, so the job count comes from Postgres instead of the
  current scan-5000-rows-and-tally-in-JS rollup.
- `getCompanyBySlug(slug)` — the profile row, `cache()`-wrapped.
- `getJobsByCompany(companyId, { limit, page })` — active jobs for the profile.
- `getAllCompanySlugs()` — for `generateStaticParams` and the sitemap; returns
  only companies **with ≥1 active job** (D5).

### [src/lib/jobs.ts](src/lib/jobs.ts)

- Every `select("*")` becomes
  `select("*, company:companies(id, slug, name, logo_url, website)")` — in
  `fetchJobPage`, `getJobBySlug`, `getSimilarJobs`, `getFeaturedJobs`. The facet
  scan and `getAllActiveJobSlugs` are untouched (neither reads company columns).
- `getCompanies()` and `CompanySummary` are **deleted**; callers move to
  `lib/companies.ts`.
- Return type widens to `JobWithCompany`.

---

## 5. Public site

### `/companies` — [page.tsx](src/app/(public)/companies/page.tsx)

Cards link to `/companies/<slug>` instead of `/jobs?q=<name>` (the current link
is a keyword search that also matches the name appearing in unrelated job copy).
Card gains the tagline and a thin cover strip.

### `/companies/[slug]` *(new)*

- `export const revalidate = 600` + `generateStaticParams()` from
  `getAllCompanySlugs()`, matching [jobs/[slug]](src/app/(public)/jobs/[slug]/page.tsx).
- **Hero**: the cover image as a `next/image` `fill` background with a gradient
  scrim for text contrast, logo card overlapping the lower edge, name, tagline,
  verified badge, website link (`rel="noopener noreferrer nofollow"`, as
  elsewhere). A company with no cover falls back to the existing
  `hero-pattern` class — the page must never look broken for an unset image.
- **Body**: `description` (the single source of truth), an "At a glance" rail
  (industry, HQ, size, founded, LinkedIn), then **Open roles at X** rendered
  with the existing [JobCard](src/components/jobs/job-card.tsx), and a
  "See all N jobs" link to `/jobs?company=<slug>`.
- `generateMetadata` with canonical `/companies/<slug>`, OG image, and
  `robots: { index: false }` when the active job count is 0 (D5).
- `loading.tsx` + `not-found.tsx` beside it, matching the jobs route.
- Optional, same shape as [jobs/[slug]/opengraph-image.tsx](src/app/(public)/jobs/[slug]/opengraph-image.tsx):
  a dynamic OG image over the cover.

### `/jobs` filter

`parseJobFilters` ([job-filters.ts](src/lib/job-filters.ts)) gains `company`
(a slug); `fetchJobPage` filters on `companies.slug` through the embedded
select. This is what makes "See all roles" a real, linkable, indexable URL —
and it participates in the cache key like every other filter.

### Job detail — [jobs/[slug]/page.tsx](src/app/(public)/jobs/[slug]/page.tsx)

- Header logo and company link read from `job.company`.
- The "About {company}" section renders `job.company.description` (truncated,
  with a **View company profile →** link to `/companies/<slug>`) instead of the
  per-listing copy that no longer exists.

### SEO — [json-ld.tsx](src/components/seo/json-ld.tsx)

- `JobPostingJsonLd`: `hiringOrganization` sources `name` / `sameAs` / `logo`
  from the embedded company.
- New `CompanyJsonLd` — an `Organization` with `@id` at the profile URL, `logo`,
  `image` (cover), `sameAs` (website + LinkedIn), `numberOfEmployees`,
  `foundingDate`, plus `BreadcrumbJsonLd` and an `ItemList` of open roles.
- [sitemap.ts](src/app/sitemap.ts): a `companyRoutes` block from
  `getAllCompanySlugs()`, `changeFrequency: "weekly"`, `priority: 0.6`.

---

## 6. Admin

### New routes, mirroring the blog CRUD exactly

- `src/app/admin/(protected)/companies/page.tsx` — table
- `…/companies/new/page.tsx`
- `…/companies/[id]/edit/page.tsx`

Plus a `Building2` nav entry in
[admin/(protected)/layout.tsx](src/app/admin/(protected)/layout.tsx).

### `src/hooks/use-admin-companies.ts` *(new)*

Copy of [use-admin-jobs.ts](src/hooks/use-admin-jobs.ts): `adminCompanyKeys`,
`useAdminCompanies(filters)`, `useCreateCompany`, `useUpdateCompany`,
`useDeleteCompany`. Search uses `containsPattern` from
[postgrest.ts](src/lib/postgrest.ts) — the helper that exists because raw
`.or()` filter strings mangle names like "Node.js".

### `src/components/admin/company-form.tsx` *(new)*

`Fieldset` / `Field` / `inputClass` from
[form-fields.tsx](src/components/admin/form-fields.tsx), `zodResolver` on
`companyFormSchema`, slug auto-derived from the name until edited by hand and
frozen on edit (identical to the job form's `dirtyFields.slug` guard — changing
it breaks the live URL). Two `ImageUploader` instances for logo and cover.

### `src/components/admin/company-table.tsx` *(new)*

Logo thumbnail, name, job count, status, verified flag, edit / view-live /
delete. Delete is blocked with a clear message when the job count is > 0 (the FK
is `on delete restrict`), offering a reassign-then-delete path.

### [job-form.tsx](src/components/admin/job-form.tsx)

- The whole **Company** fieldset collapses to one `CompanyPicker` — a searchable
  select over `useAdminCompanies`, showing logo + name, with an inline
  **+ New company** that opens the company form in a dialog and selects the
  result on save.
- The import panel's `companyHint` (§2) is matched case-insensitively against
  existing companies; on a hit it selects it and warns *"Matched existing
  company — its profile was not overwritten"*; on a miss it prefills the
  new-company dialog. This is the guard that stops the import path from
  re-introducing the per-listing description the whole change removes.
- `payload` drops the four company fields and carries `company_id`.

### [job-table.tsx](src/components/admin/job-table.tsx)

Reads the logo from the embedded company; the search `.or()` keeps using the
denormalised `company_name` (D1) so it needs no join.

---

## 7. Cache invalidation

[app/actions/admin.ts](src/app/actions/admin.ts):

- `revalidateJobPaths()` additionally `revalidateTag(COMPANIES_CACHE_TAG)` and
  `revalidatePath("/companies/[slug]", "page")` — a job going live changes the
  role count on its company's profile.
- New `revalidateCompanyPaths(slug)`: both tags, `/companies`,
  `/companies/<slug>`, `/sitemap.xml`, and `/jobs` (a rename changes the name on
  every card). Called from the company mutations.

Both layers are needed for the same reason the existing comment gives:
`revalidateTag` drops the cached Supabase reads, `revalidatePath` drops the
rendered ISR HTML.

---

## 8. Tests and verification

New unit tests (Vitest, alongside the existing `*.test.ts` files):

- `src/lib/storage.test.ts` — `storagePathFromPublicUrl` round-trips our own
  URLs, returns `null` for external ones and for a different bucket;
  `assertUploadable` rejects oversized files and disallowed mime types.
- [validations.test.ts](src/lib/validations.test.ts) — `companyFormSchema`
  happy path, slug regex, URL coercion of `""` → `null`; plus the updated
  `jobFormSchema` rejecting a missing `company_id`.
- [job-import.test.ts](src/lib/job-import.test.ts) — `companyHint` extraction.

Manual verification, in order:

1. `supabase db push` against a branch DB → confirm every job has a
   `company_id` and the duplicate descriptions collapsed to one row per company.
2. Rename a company in the admin → the new name appears on job cards and a
   keyword search for it still matches (proves the trigger re-derived
   `search_vector`).
3. Upload, replace and remove both images → check the object actually
   disappeared from the bucket, and that the profile falls back cleanly with no
   image set.
4. Sign out, hit the profile → images load, and a `POST` to the bucket from an
   anon session is refused.
5. Rich Results Test on a job page and a company page.

---

## 9. Rollout and ops notes

- **Order matters**: apply both migrations, deploy the code, *then* verify — the
  column drop in §1 is what makes the old code stop working, so the two are not
  independently revertible. Take a DB snapshot first.
- **The drop is irreversible in practice.** Steps 1–3 of the backfill must be
  confirmed on a branch database before step 4 runs anywhere near production.
- The old `company-logos` bucket stays. Backfilled `logo_url` values keep
  pointing into it; new uploads land in `company-media`. Both are covered by
  the same `remotePatterns` entry, so nothing needs to migrate.
- **Orphaned objects**: abandoned uploads (§3) accumulate slowly. A later
  admin-only maintenance action can list the bucket and delete objects whose
  URL appears in no `companies` row — deliberately out of scope here.
- Anything in the four unapplied migrations currently sitting uncommitted
  (`article_authors`, `seed_articles_batch_two`, `correct_author_bio`) should be
  pushed first so the ordering stays linear.

---

## Touchpoint summary

**New (17)**
`supabase/migrations/20260813090000_companies.sql`,
`…090100_storage_company_media.sql`,
`src/types/company.ts`,
`src/lib/companies.ts`,
`src/lib/storage.ts`,
`src/lib/storage.test.ts`,
`src/hooks/use-admin-companies.ts`,
`src/components/admin/company-form.tsx`,
`src/components/admin/company-table.tsx`,
`src/components/admin/image-uploader.tsx`,
`src/components/admin/company-picker.tsx`,
`src/app/(public)/companies/[slug]/{page,loading,not-found,opengraph-image}.tsx`,
`src/app/admin/(protected)/companies/{page,new/page,[id]/edit/page}.tsx`

**Modified (16)**
[types/job.ts](src/types/job.ts),
[types/database.ts](src/types/database.ts),
[lib/jobs.ts](src/lib/jobs.ts),
[lib/job-filters.ts](src/lib/job-filters.ts),
[lib/validations.ts](src/lib/validations.ts),
[lib/job-import.ts](src/lib/job-import.ts),
[hooks/use-admin-jobs.ts](src/hooks/use-admin-jobs.ts),
[components/admin/job-form.tsx](src/components/admin/job-form.tsx),
[components/admin/job-table.tsx](src/components/admin/job-table.tsx),
[components/jobs/job-card.tsx](src/components/jobs/job-card.tsx),
[components/jobs/apply-button.tsx](src/components/jobs/apply-button.tsx),
[components/seo/json-ld.tsx](src/components/seo/json-ld.tsx),
[app/(public)/companies/page.tsx](src/app/(public)/companies/page.tsx),
[app/(public)/jobs/[slug]/page.tsx](src/app/(public)/jobs/[slug]/page.tsx),
[app/(public)/jobs/[slug]/opengraph-image.tsx](src/app/(public)/jobs/[slug]/opengraph-image.tsx),
[app/actions/admin.ts](src/app/actions/admin.ts),
[app/sitemap.ts](src/app/sitemap.ts),
[app/admin/(protected)/layout.tsx](src/app/admin/(protected)/layout.tsx)

**Unchanged, deliberately**: [next.config.ts](next.config.ts) (the Supabase
storage host is already allowlisted) and [lib/image-hosts.ts](src/lib/image-hosts.ts)
(the `/storage/v1/object/public/` prefix check already covers the new bucket).

---

## As built

Implemented as planned, with these deviations. Tests, lint and `next build` all
pass; the migrations have **not** been applied to any database yet (§9).

**The `/jobs?company=` filter resolves the slug to an id instead of filtering
the embedded resource.** Filtering on `company.slug` forces the embed to an
inner join, which would silently drop any job whose company row is hidden.
`fetchJobPage` now looks the slug up first and applies a plain
`.eq("company_id", …)`. The lookup sits inside `unstable_cache`, so it costs one
extra round trip per TTL rather than one per request, and an unknown slug
returns an empty result rather than an unfiltered board.

**New file not in the plan**: `src/components/ui/company-cover.tsx`. The cover
image needed the same optimizable-or-plain-`<img>` decision `CompanyLogo`
makes, plus a gradient scrim and the `hero-pattern` fallback for an unset
image; that is more than belongs inline in a page.

**Company OG image does not composite the cover.** Satori fetches remote images
at render time, and a 5 MB upload on a cold cache would make that route the
slowest thing on the site. The card is drawn from text, like the job card.

**`revalidateJobPaths(slug, companySlug)`** gained a second argument, so saving
a listing also drops the ISR HTML for that company's profile — the role count
on it just changed.

**lucide-react ships no brand icons** in this version, so the LinkedIn link uses
the generic `ExternalLink` glyph.

**`/jobs?company=` is `noindex, follow`** and titles itself from the embedded
company on the first result. `/companies/<slug>` is the canonical "every role at
X" surface; the filtered listing should not compete with it.

**Small addition to [validations.ts](src/lib/validations.ts)**: an `optionalText(max)`
helper, since the company form has eight fields that all needed the same
trim → empty-string → `null` normalisation.

Test coverage added: 12 cases in `src/lib/storage.test.ts`, 8 for
`companyFormSchema` and the job form's company reference, 4 for the importer's
`company` hint, and 1 for the `?company=` slug guard.

### Follow-up: automatic compression on upload

Uploads are now re-encoded in the browser before they reach Storage, targeting
**200 KB**. `src/lib/image-compress.ts` decodes the picked file (honouring EXIF
orientation), scales it into the ceiling for its slot — 512×512 for a logo,
1920×1080 for a banner — and re-encodes to WebP, walking a quality/scale ladder
and stopping at the first result under target. WebP because it is the only
allowed type carrying both an alpha channel (logos are routinely transparent
PNGs) and a quality dial; the JPEG fallback exists only for a browser that
cannot encode it, and paints a white ground first since JPEG has no alpha.

Two cases pass the original through untouched rather than degrading it: a file
already inside both limits, and one whose re-encode came out *larger* than the
source (an already-efficient small WebP or flat PNG can).

The size gate moved accordingly. `uploadRejectionReason` now judges the *source*
against `MAX_SOURCE_BYTES` (25 MB — the point at which decoding could lock up
the tab), not the bucket's 5 MB limit, because a 12 MB press-kit PNG is a
reasonable thing to pick when it will be compressed on the way out. The new
`uploadedSizeRejection` guards what actually goes up.

`compressImage` needs a canvas, so it is exercised in the browser; the pure
geometry and naming it rests on (`fitWithin`, `renameForType`) are unit-tested,
where an off-by-one would silently produce a squashed logo. **161 tests passing
overall**, lint clean, build green.
