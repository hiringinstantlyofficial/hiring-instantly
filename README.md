# HiringInstantly

A job board for the Indian market — public, SEO-first job listings plus a
single-admin dashboard for managing them.

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · Supabase · TanStack
Query v5 · React Hook Form + Zod.

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

`.env.local` is already populated for the existing Supabase project. For a fresh
environment, copy `.env.example` and fill it in:

| Variable | Required | Exposed to browser | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | yes | Anon key — every query it makes is subject to RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **no** | Bypasses RLS. Server-only; used for contact/newsletter writes |
| `NEXT_PUBLIC_SITE_URL` | in production | yes | Absolute origin for canonicals, sitemap and OG images |
| `NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS` | no | yes | Extra logo hosts, comma separated, allowed through the image optimiser |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | yes | GA4 measurement ID (`G-…`). Production builds only, public pages only |
| `UPSTASH_REDIS_REST_URL` | no | **no** | Durable rate limiting for the public forms |
| `UPSTASH_REDIS_REST_TOKEN` | no | **no** | Paired with the URL above |

**Set `NEXT_PUBLIC_SITE_URL` to the real domain before deploying.** Every
canonical tag, sitemap entry, OG image URL and JSON-LD `@id` is built from it;
left on localhost, Google indexes `http://localhost:3000/jobs/…` as the
canonical and the site earns no organic traffic. On Vercel the deployment host
is used as a fallback so preview builds are at least self-consistent, and a
production build without the variable logs a warning — but the fallback is
server-side only, so production must set it explicitly.

Without the two `UPSTASH_*` variables the contact/newsletter rate limiter falls
back to an in-memory map. That is per-instance on serverless and resets on cold
start, so the limit is trivially bypassed; a free Upstash Redis database is
enough to make it hold.

### 3. Database (required — do this before first run)

Migrations live in `supabase/migrations/` and are applied with the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref ippkiksifkoilripafdd   # prompts for the DB password
npx supabase db push
```

| Migration | What it does |
|---|---|
| `20260729090000_init_schema.sql` | Tables, indexes, RLS policies, `updated_at` trigger, and the trigger promoting the first auth user to admin |
| `20260729090100_storage_company_logos.sql` | `company-logos` storage bucket + policies |
| `20260729090200_seed_sample_jobs.sql` | Sample listings — 10 active, 1 draft |
| `20260730120000_location_trigram_index.sql` | `pg_trgm` GIN index so the `location ILIKE '%…%'` filter stops full-scanning |
| `20260802120000_articles.sql` | `articles` table, indexes, RLS (including the schedule gate) and its `updated_at` trigger |
| `20260802120100_seed_articles.sql` | The nine career articles, converted from the compiled modules to markdown |

All are idempotent. Until they run, pages render their empty states and
the server logs a warning rather than erroring — `/blog` included, which shows
"No articles published yet" until the two article migrations are applied.

**Two things to know before pushing:**

- **Delete the seed migration** if you don't want demo listings in a production
  database. Once applied it is recorded as run and won't repeat, but the rows
  stay until you remove them.
- **Storage policies may be skipped.** `storage.objects` is owned by
  `supabase_storage_admin`, so depending on the role the CLI connects as, the
  policy creation can hit `insufficient_privilege`. That migration catches the
  error and raises a `NOTICE` instead of failing the push — if you see it,
  create the bucket and its four policies from the dashboard. Only logo uploads
  depend on it.

The article seed uses `on conflict (slug) do nothing`, so replaying it never
overwrites an edit made in the admin panel.

`supabase db reset` re-runs all of them against a local database (needs Docker).

### 4. Create the admin account

Supabase dashboard → **Authentication → Users → Add user**. Set a password and
mark the email confirmed.

The first user created is inserted into `public.admins` automatically, and every
write policy is gated on membership of that table. Also turn **off** public
sign-ups under Authentication → Providers → Email, since the site has no
candidate accounts.

### 5. Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint
npm run test       # vitest run
npm run verify     # typecheck + lint + test
```

**`next build` and OneDrive do not get along.** This working copy lives under
`OneDrive\Desktop`, and the sync client holds handles on `.next` while Next is
writing thousands of small files into it. The symptom is not an error: the build
prints its banner and then sits at ~4% CPU and ~38 MB of memory indefinitely —
it never reaches `Creating an optimized production build`. The same build takes
44 seconds outside a synced folder.

Two things make it worse, and both are worth checking first if a build appears to
hang:

- **Never run `next build` while `next dev` is running.** They share `.next`, and
  the dev server's locks are enough to stall the build on their own.
- `rm -rf .next` failing with `Device or resource busy` after every Node process
  is dead is the OneDrive handle, not a stray process.

If you need a local production build, either pause OneDrive sync first, exclude
`.next` from sync, or move the working copy off OneDrive. CI and Vercel are
unaffected — they check the repo out onto an ordinary filesystem.

Unit tests cover the pure logic in `src/lib/` — the URL-to-filters parser, the
PostgREST/LIKE escaping, the `?next=` redirect allowlist, the image-host
allowlist, the Zod schemas and the formatting helpers. They are the pieces
where a silent regression is either a security hole or invisible until Google
notices, so they are the ones worth pinning down; rendering and the query layer
are not covered.

---

## Structure

```
src/
  app/
    (public)            /, /jobs, /jobs/[slug], /blog, /blog/[slug], /about,
                        /companies, /contact, /privacy-policy,
                        /terms-and-conditions
    admin/
      login/            unauthenticated
      (protected)/      dashboard, jobs CRUD, blog CRUD, messages — auth-gated
    actions/            server actions (contact, newsletter, revalidation)
    sitemap.ts robots.ts
  components/
    jobs/ blog/ home/ forms/ admin/ layout/ seo/ ui/ providers/
  hooks/                TanStack Query hooks for the admin dashboard
  lib/                  supabase clients, query layer, validation, utils
                        (*.test.ts sit next to what they cover)
  types/                Job and Article domain types + Supabase schema types
supabase/
  migrations/           schema, storage bucket, seed data, indexes
```

## Posting a job

`docs/job-scrape-prompt.md` holds the prompt that turns a careers-page URL into a
full listing: it reads the page, keeps the verifiable facts, and writes the
600-plus words of details the listing needs to rank.

The prompt is written against **AdSense's low-value-content rules**, which is why
it treats the source posting as facts to report rather than prose to paraphrase,
and requires each listing to carry judgement the source page does not have — who
the role suits, how it screens, where it leads. A listing that reads as a rewrite
of someone else's posting is the likeliest single reason an application is
refused. The same file ends with the site-level limits the prompt cannot fix.

**Admin → Jobs → New job → Paste JSON** takes that output directly.
`src/lib/job-import.ts` maps it onto the form — arrays become the one-per-line
textareas, dates become `yyyy-MM-dd`, salaries like `₹6,00,000` become integers —
and reports rather than applies anything the schema would reject, so a bad enum
never arrives disguised as a real answer. Everything imports as a **draft**; a
human still reviews and publishes.

## The blog

`/blog` carries the career articles. They are rows in `public.articles`, written
and edited from **Admin → Blog**, with the body stored as GitHub-flavoured
markdown and rendered through `react-markdown`.

They used to be typed modules compiled into the bundle under `src/content/blog/`.
That bought static rendering and review-in-the-diff, and cost a deploy per
correction; the nine originals were converted to markdown and seeded in
`supabase/migrations/20260802120100_seed_articles.sql`. `prose-legal` in
`globals.css` still supplies the typography, so the rendered result is the same
markup the compiled articles produced.

### Publishing is two conditions

An article is public only when `status = 'published'` **and** `published_at` has
passed. A future date is therefore a **scheduled post**: written, approved, and
invisible until its moment, at which point it appears on the blog, in the
sitemap and to crawlers on its own. Nothing runs at that instant — the ISR
window on `/blog` and `/blog/[slug]` (600s) is what brings it in.

That is the honest way to spread out a launch. Back-dating articles to fake a
publishing history, or publishing everything on one day, are the two things that
read as manufactured to an AdSense reviewer; a queue does neither.

Both conditions are enforced twice, in the RLS policy and again in every query in
`src/lib/blog.ts`, so a query that forgot them returns nothing rather than
leaking a draft.

- **`published_at`** — the publication date and the schedule gate.
- **`revised_at`** — the visible "Updated on" stamp, set by hand after a material
  revision only. Feeds `dateModified`.
- **`updated_at`** — touched by a trigger on every save. Never shown.

### Details worth knowing

- `/blog/[slug]` sets `dynamicParams = true` and ISR. It was `false` while
  articles were compiled in, because the build knew every slug that could exist;
  a post published after the build would have 404'd until a redeploy. An unknown
  slug is still a real 404.
- The markdown is rendered to React elements, not to an HTML string — there is no
  `dangerouslySetInnerHTML` and no sanitiser to keep current. Raw HTML in a body
  is inert because `rehype-raw` is deliberately not installed.
- `related` holds slugs and is deliberately not a foreign key: it may point at a
  post that is still a draft or still scheduled, and `pickRelated` skips what it
  cannot resolve rather than the write failing.
- Leave **reading time** blank and the form estimates it from the body, so it
  cannot drift as paragraphs are added.
- Articles carry `BlogPosting` JSON-LD with the organisation as `author` — the
  articles are team-written, and naming an individual with no verifiable byline
  is worse than naming none.
- Categories are labels on the index page, not links. Six categories over nine
  articles would mean per-topic pages holding one or two entries each, which is
  the thin content the section exists to avoid.

## Analytics

Google Analytics 4, behind `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Unset, nothing
loads; set to anything that is not a `G-…` ID, it refuses to load and warns.

Three things about the wiring are deliberate:

- **Mounted in `(public)/layout.tsx`, not the root layout.** The root layout also
  wraps `/admin`, and one admin working in the dashboard all day would be a
  visible share of the traffic on a site this new.
- **Consent Mode v2 defaults ship with it.** `ad_storage`, `ad_user_data`,
  `ad_personalization` and `analytics_storage` all default to `denied` for the
  EEA, UK and Switzerland (`CONSENT_REQUIRED_REGIONS` in `src/lib/analytics.ts`)
  and granted elsewhere. The defaults are set by a plain inline `<script>`
  because they must run before `gtag.js`, and next/script's
  `beforeInteractive` only works from the root layout.
- **`gtag.js` is a plain `<script async>`, not next/script.** In the App Router,
  `strategy="afterInteractive"` leaves only a `<link rel="preload">` in the
  server HTML and injects the real tag after hydration. Anything that reads the
  page without running the React bundle — Google's tag connection test, Tag
  Assistant's fetch, verification crawlers — then sees no Google tag, which is
  exactly how the connection test failed. React hoists the tag to `<head>` and
  de-duplicates it; the `dataLayer` queue keeps the consent defaults ahead of
  `config` regardless of when the loader finishes downloading.
- **Page views come from the tag itself.** `config` keeps the default
  `send_page_view: true`, and GA4 Enhanced measurement's "Page changes based on
  browser history events" covers App Router navigations, which are history
  pushes. An earlier version suppressed the page view and re-sent it from a
  client effect; that made every hit depend on React hydrating, so a checker
  that does not hydrate saw a property receiving nothing.

**After deploying:** confirm data is arriving in **Realtime** (Reports →
Realtime) within a few minutes. `next dev` never sends anything, so this is the
first point at which the install can be verified. Leave Enhanced measurement →
"Page changes based on browser history events" **on** — it is what measures
client-side navigation now.

## Advertising and the privacy policy

The privacy policy carries the disclosures Google AdSense requires of
publishers: third-party ad cookies, the DoubleClick DART cookie, Google Ads
Settings and aboutads.info opt-out links, and third-party ad network language.
It also names Google Analytics 4 and links the opt-out add-on.

Two things follow from that:

- **It is written in the present tense.** Publish it together with the AdSense
  code, not before — until ads are live the advertising section describes
  something that is not happening yet.
- **EEA/UK/Switzerland traffic still needs a consent tool before ads go live.**
  Consent Mode defaults mean nothing is stored for those visitors today, so the
  policy is accurate as it stands. But there is no way for them to *grant*
  consent either, which means no personalised ads and no analytics cookies from
  those regions. Adding a Google-certified CMP that calls
  `gtag('consent', 'update', …)` is what unlocks that; until then the defaults
  are the safe side to fail to.

## Security model

Three independent layers guard the admin area, in this order:

1. **Middleware** (`src/middleware.ts`) refreshes the auth cookie and redirects
   anonymous visitors away from `/admin`.
2. **The protected layout** re-checks the session server-side and calls the
   `is_admin()` RPC.
3. **Row-Level Security** is the actual authority. Public clients can read only
   `status = 'active'` jobs; all writes require a row in `public.admins`.
   `contact_submissions` and `newsletter_subscribers` are insert-only for the
   public and readable by the admin.

The service-role key is imported only through `src/lib/supabase/admin.ts`, which
carries a `server-only` import so any accidental client-side import becomes a
build error.

Two further constraints worth knowing about:

- **`?next=` on the admin login** is validated by `safeAdminRedirect()`
  (`src/lib/safe-redirect.ts`), which resolves the value against a throwaway
  base and accepts only paths that land on `/admin` or under `/admin/`. A
  `startsWith("/admin")` check is not equivalent — `/admin@evil.com` passes it.
- **`images.remotePatterns` is an allowlist, deliberately with no `**`
  wildcard.** A wildcard would let the image optimiser fetch any HTTPS URL on
  the internet, which is an SSRF primitive and an easy way to make the server
  download very large files. Logos on non-allowlisted hosts still render, as an
  unoptimised `<img>`; add hosts to `NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS` to opt
  them into optimisation.

## SEO

- Job content is server-rendered; `/jobs/[slug]` is ISR (`revalidate = 600`)
  with the 200 freshest slugs prerendered at build. Articles are fully static.
- `JobPosting`, `BlogPosting`, `Blog`, `Organization`, `BreadcrumbList` and
  `WebSite` JSON-LD.
- Per-page metadata, canonicals, per-job OG images (`opengraph-image.tsx`).
- Dynamic `sitemap.xml`; `robots.txt` blocks `/admin` and facet parameters while
  leaving numbered pagination crawlable.
- Filtered listing URLs are `noindex, follow` to avoid thin duplicates. The
  `robots.txt` parameter rules are a second line of defence only: query params
  can appear in any order, so a pattern like `/jobs?*q=` misses
  `/jobs?page=2&q=x`. The `noindex` in `generateMetadata` is the one that
  actually holds.
- The homepage is not a second copy of `/jobs`. It carries the hero and a
  "Latest Jobs" teaser; the filter sidebar, sort toolbar and pagination live on
  `/jobs` alone, so `/` and `/jobs?page=1` are not near-identical documents
  competing for the same queries.
- Admin mutations call `revalidateJobPaths()` so edits go live without a
  redeploy.

Note: the `/jobs` listing lives in a `(list)` route group so its `loading.tsx`
does not wrap `/jobs/[slug]`. With a shared loading boundary the response starts
streaming before `notFound()` runs, and a missing job returns a soft 404 (HTTP
200) — which search engines will happily index.

## Design system

Tokens live in `src/app/globals.css` under `@theme`, extracted from the homepage
reference: primary `#4640DE`, accents `#26A4FF` / `#56CDAD` / `#FFB836` /
`#FF6550`, ink `#25324B` / `#515B6F` / `#7C8493`, hairline `#D6DDEB`, surfaces
`#FFFFFF` / `#F8F8FD`. Epilogue via `next/font`. Square corners on cards,
buttons and inputs; pills for badges. Depth comes from 1px borders — the only
shadow is the hero search bar lift.

## Deploying

Vercel is the natural fit. Add the environment variables in the project
settings, set `NEXT_PUBLIC_SITE_URL` to the production origin, and deploy. After
the first deploy, submit `/sitemap.xml` in Google Search Console and validate a
job page with the Rich Results Test.

Not yet wired, and worth doing before or shortly after launch:

- **Error monitoring.** All server-side error reporting funnels through
  `captureError()` in `src/lib/observability.ts`, which currently emits one
  structured JSON line per error. Forwarding to Sentry is a change to that one
  function plus `npm install @sentry/nextjs` — it needs a DSN from your own
  Sentry project, so it is left as a marked TODO rather than half-configured.
- **Durable rate limiting.** See `UPSTASH_*` above.
- **Dependency advisories.** `npm audit` reports high-severity issues in
  `postcss` and `sharp`, both reached transitively through `next`. The fix is a
  Next.js upgrade, not a change in this codebase.
