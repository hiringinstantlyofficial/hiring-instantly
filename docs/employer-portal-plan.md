# Implementation plan — employer portal (HR-submitted jobs, admin-approved)

**Goal.** Let an HR / recruiter sign in, describe themselves and their company,
submit a job listing, and track it — while **nothing they write reaches the
public site until an admin clicks Approve**.

**Why.** Every listing today is typed by an admin, either by hand or pasted out
of the scrape prompt ([job-scrape-prompt.md](docs/job-scrape-prompt.md)). That
caps the board at one person's throughput and makes the employer relationship a
`mailto:` — the header's "Post a Job" button currently points at
[`/contact?intent=post-a-job`](src/components/layout/site-header.tsx#L66), which
lands in the same inbox as every other enquiry. This turns that dead end into a
funnel, without giving up editorial control of what goes live.

**The one-line shape.** Recruiters get their own authenticated area at
`/employers`; everything they write is created with `status = 'pending'`; the
public read policies already say `status = 'active'`, so a pending row is
invisible by construction rather than by carefulness; the admin gets a review
queue at `/admin/review` that turns approval into one keystroke.

---

## 0. Decisions taken up front

Each is a trade-off, not an oversight. They shape everything below.

### D1 — Yes, HRs get a login. Magic link, not a password.

Consider the alternative first, because "no login" is the cheaper build: an
anonymous form that dumps a submission into a staging table. It fails on four
counts, and all four are product failures rather than technical ones.

1. **No identity means no trust signal.** Anyone can type "I'm the HR at
   Infosys." An email the person had to open in order to continue is a real,
   cheap ownership proof — and it is the single highest-value anti-spam control
   in this whole design.
2. **No second job without retyping everything.** The second listing from the
   same company re-enters the company name, logo, description and website. That
   is the exact duplication the companies migration
   ([20260813090000_companies.sql](supabase/migrations/20260813090000_companies.sql))
   just removed.
3. **No status visibility.** "Did you get my job post?" becomes an email to
   support. A dashboard answers it for free, and it is the thing that brings the
   recruiter back.
4. **No edit path.** A typo in the salary means a support ticket and an admin
   doing the work anyway.

**Magic link (email OTP) over email + password**, for the recruiter side only:

- It **verifies the work email as a side effect of signing in**. A password
  flow verifies once, at signup, and then never again; the magic link re-proves
  control of the inbox on every session. For a role where "does this person
  actually work at this company" is the whole question, that is the right
  primitive.
- No password reset flow, no password strength UI, no credential-stuffing
  surface, no "forgot password" support load. Roughly three screens we don't
  build.
- HRs sign in a handful of times a month. The friction argument that makes
  magic links annoying for daily-use tools does not apply here.
- `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`
  is **sign-up and sign-in in one call**, so there is no separate registration
  form at all.

The admin login stays password-based exactly as it is today
([login-form.tsx](src/components/admin/login-form.tsx)) — different audience,
different route, no change.

> **Prerequisite, easy to miss.** Supabase's built-in SMTP sends ~2–3 emails per
> hour and **only to addresses on the project team**. Magic links will appear to
> work in testing and silently fail for real recruiters. A custom SMTP provider
> (ZeptoMail, §8) must be configured under *Authentication → Emails → SMTP
> Settings* before this ships, and the callback URL added to *Authentication →
> URL Configuration → Redirect URLs*.

### D2 — Pending jobs live in `public.jobs`, not a staging table

`jobs.status` gains `'pending'` and `'rejected'`. The alternative — a
`job_submissions` table that gets copied into `jobs` on approval — was rejected:

- It duplicates ~30 columns, plus a mapping function that has to be kept in step
  with every future column, plus a second form, plus a second validation schema.
- The public read policy is already `using (status = 'active')`. A pending row
  in `jobs` is therefore **unreadable by the public by construction**, which is a
  stronger guarantee than a separate table gated by a policy someone wrote by
  hand.
- `search_vector` is a generated column, and every index, the admin job table,
  the job form and `JobWithCompany` all work on a pending row unchanged.
- **Approval becomes a one-column update**, which is what approval should be.
  Under the staging-table design, "approve" is an insert that can partially fail.

The cost is real and stated: `public.jobs` now contains unvetted text. That is
acceptable precisely because `status` was already the gate, and because §12
walks every read path to confirm none of them widen it.

Final status set: `draft`, `pending`, `active`, `rejected`, `closed`, `expired`.
`draft` stays a private working copy (both roles); `pending` means *submitted,
awaiting review*; `rejected` means *changes requested* and is editable and
resubmittable.

### D3 — Editing an approved job sends it back to `pending`

The most important line in the design. Without it, approval is a one-time gate:
submit something clean, get approved, then edit it into whatever you like. With
it, the reviewed state and the live state can never diverge.

This **cannot be expressed as an RLS policy** — a policy's `USING` sees the old
row and `WITH CHECK` sees the new one, but neither can compare the two. It is a
`before update` trigger (§3), which is also the only place that can reliably
force `status` for a non-admin writer regardless of what the client sent.

Softened in the UI: the recruiter's edit screen says so up front, and §7's
review panel shows a **diff against the last approved version** so re-review of
a one-word change costs the admin a glance rather than a full re-read.

### D4 — A recruiter may create a company, but may not seize an existing one

Two paths from the company step, and they are not symmetrical:

- **Company not in the database** → the recruiter creates it, with
  `status = 'pending'` (invisible publicly, same mechanism as D2), and becomes
  its `owner` in `company_members` immediately.
- **Company already in the database** → the recruiter *requests to join*. A
  `company_members` row is created with `status = 'pending'`. They may attach a
  job to it right away (that job is going to review anyway), but they **cannot
  touch the company's logo, cover, description or name** until an admin approves
  the membership.

Letting a stranger edit an existing company profile is a brand-defacement vector
on a page we already index and put in the sitemap. The asymmetry is the point.

**One automatic exception**, because it is a genuine ownership proof: if the
recruiter's work email domain matches the company's website host
(`rahul@acme.com` → `acme.com`), the membership is auto-approved. Free-email
domains (gmail, outlook, yahoo, rediffmail, …) are excluded from this match —
that carve-out is what stops the shortcut from being the hole.

### D5 — Recruiter media uploads reuse the existing bucket and path convention

[`image-uploader.tsx`](src/components/admin/image-uploader.tsx) already uploads
through the *browser* client so the writer's own session authorises it, and
already writes to `logos/<companyId>/<uuid>.<ext>`
([storage.ts](src/lib/storage.ts#L110)). That path convention is what makes the
policy widening trivial: the company id is `(storage.foldername(name))[2]`, so
`company_media_admin_write` becomes "admin **or** an approved member of the
company that owns this folder." The component itself needs **no change**.

Consequence, and it is a real divergence from the admin form: the admin's
company form invents `crypto.randomUUID()` client-side and uploads before the
row exists. A recruiter cannot, because the policy needs a membership row to
check against — and allowing uploads to arbitrary UUIDs would let any signed-in
recruiter fill the bucket. So **the recruiter company form is a two-step wizard**
(identity → branding), where step 1 inserts the `pending` company row and step 2
uploads against a real id. This is better UX anyway: the row is the autosave.

### D6 — `promote_first_user_to_admin` must be defused before public signup exists

Today [init_schema.sql](supabase/migrations/20260729090000_init_schema.sql#L34)
carries a trigger that promotes any new `auth.users` row to admin **if the
`admins` table is empty**, and its own comment explains this is safe because
"there is no public sign-up."

This plan creates public sign-up. The trigger becomes a live privilege
escalation path: empty the `admins` table by any means — an accidental cascade,
a bad cleanup script, a `on delete cascade` from a deleted auth user — and the
next recruiter to request a magic link becomes an administrator. It is inert
today and dangerous the moment §4 ships.

**Ship the fix first, on its own** (Phase 0, §14): drop the trigger and the
function. Bootstrapping a new environment becomes one documented `insert into
public.admins` in the SQL editor, which is a better answer than a trigger that
watches every signup forever.

### D7 — Recruiters never see `/admin`, and admins never need `/employers`

Two separate route trees, two separate layouts, two separate nav shells, one
shared middleware. Merging them behind role-conditional rendering means every
admin component grows an `if (role === …)` branch and a single missed branch is
a privilege bug. Separate trees make the boundary something you can see in the
file system.

The `is_admin()` / `is_recruiter()` split also means the admin retains full
write access to everything a recruiter created — the admin *is* the editor of
last resort, and "approve with edits" (§7) depends on it.

### D8 — Job source is recorded and shown, permanently

`jobs.source` (`'admin' | 'recruiter'`) survives approval. It is what lets the
admin filter "everything a recruiter sent us" a month later when a pattern of
bad listings surfaces, and it costs one column.

### D9 — The public "Post a job" surface is a real page, not a modal

`/post-a-job` is static, indexable and ISR-cached — it is a landing page that
should rank for "post a job India", not a dialog behind a button. It sits
outside the auth middleware matcher so it stays as cheap to serve as the rest of
the public site (see the matcher note in
[middleware.ts](src/middleware.ts#L68)).

---

## 1. The three journeys

Written as journeys first, because the routes in §5 only make sense against
them.

### A. First-time HR, company not on the board

```
/post-a-job                 Landing. "Post a job free. Live within 24 hours."
   │                        One field: work email. One button.
   ▼
/employers/login            "Check rahul@acme.com — we sent a link."
   │                        (signInWithOtp, shouldCreateUser: true)
   ▼  (clicks link in email)
/auth/callback              Exchanges the code for a session, then routes by
   │                        role: no recruiter profile yet → onboarding.
   ▼
/employers/onboarding       Step 1 of 3 · About you
   │                        Full name · Phone · Designation · Work email (locked,
   │                        already verified). ~20 seconds.
   ▼
/employers/company/new      Step 2 of 3 · Your company
   │                        Types "Acme Robotics" → live search over existing
   │                        companies finds nothing → "Create Acme Robotics".
   │                        2a Identity: name, website, HQ, industry, size,
   │                           founded, one-line tagline, about.  → INSERTS the
   │                           pending company row; recruiter becomes owner.
   │                        2b Branding: logo + cover via the existing
   │                           ImageUploader, now that a real company id exists.
   │                           Live preview of the /companies/<slug> hero beside
   │                           the uploaders — they are drawing a page, and they
   │                           should see the page.
   ▼
/employers/jobs/new         Step 3 of 3 · Your first job
   │                        The full job form, minus everything editorial
   │                        (status, featured, slug, posted_at).
   │                        [Save draft]   [Submit for review]
   ▼
/employers                  "Submitted. Most listings are reviewed within one
                             working day — we'll email rahul@acme.com."
                             Dashboard shows the job with a Pending chip.
```

### B. Returning HR, company already exists

Steps 1 and 2 collapse. The company search finds "Acme Robotics", and:

- **Email domain matches** `acme.com` → membership auto-approved (D4), the
  wizard skips straight to the job form, and the dashboard shows the company as
  editable.
- **Domain does not match** → "You'll be able to post for Acme Robotics right
  away. Editing their company profile needs our OK first — usually same day."
  The job form opens; the company card on the dashboard is read-only with a
  *Verification pending* chip.

A recruiter with an approved membership skips everything: `/employers` →
**Post a job** → form → submit. Four clicks.

### C. Admin reviewing

```
/admin                      Sidebar: Review ⑦  ← the badge is the whole
   │                        notification system for the admin side.
   ▼
/admin/review               Split view. Queue left, preview right.
                            ↓ / ↑ or J / K to move · A approve · R request
                            changes · E open in the full editor.
                            Approve → job goes active, posted_at = now(),
                            caches flush, HR is emailed the live link.
```

---

## 2. What we collect from the HR

The user asked specifically for name, phone and company. The full set, and why
each field exists:

| Field | Required | Public? | Why |
|---|---|---|---|
| Work email | yes | no | Identity. Verified by the magic link. Domain drives D4's auto-approve and §9's trust chips. |
| Full name | yes | no | Who the admin is talking to in the review panel and in email. |
| Phone | yes | **no** | The admin's escape hatch. A suspicious listing is resolved by one call, not an email thread. Shown in the review panel as a `tel:` link; never rendered on the public site, never in JSON-LD, never in the sitemap. |
| Designation | optional | no | "TA Lead" vs "Founder" changes how much benefit of the doubt a first submission gets. |
| LinkedIn profile | optional | no | The cheapest identity check the admin has for a free-email submission. |

**Phone stays private.** Publishing a recruiter's mobile on an indexed page is a
guarantee of spam calls and the fastest way to lose employer trust. It is stored
on `recruiters`, read only through the admin-gated policy, and deliberately
absent from every public type.

Validation: **Indian mobiles only, and mandatory.** Every common written form
(bare 10 digits, `0`-prefixed, `91`/`+91`-prefixed, any spacing) normalises to
canonical `+91XXXXXXXXXX`; anything else — including a valid foreign E.164
number — is rejected. A matching `CHECK` constraint on `recruiters.phone`
backstops the validator at the database. Matches the INR-denominated salary
bands already in [job.ts](src/types/job.ts#L82).

---

## 3. Data model

### `supabase/migrations/20260820090000_recruiter_portal.sql`

Idempotent, in the style of the existing migrations.

**`recruiters`** — the profile row hanging off an auth user. Parallel to
`admins`, deliberately: same shape, same `security definer` predicate function.

```
create table if not exists public.recruiters (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  work_email text not null,
  phone text not null,
  designation text,
  linkedin_url text,

  -- 'pending' only until onboarding completes; 'suspended' is the kill switch
  -- and is checked by every write policy below.
  status text not null default 'active'
    check (status in ('pending','active','suspended')),

  -- Sorts the review queue (§7) and is the hook a future auto-approve hangs on.
  -- Recomputed by the approve/reject actions, never written by the recruiter.
  trust_level text not null default 'new'
    check (trust_level in ('new','known','trusted')),

  -- Generated, so D4's domain match is an indexed equality rather than a scan.
  email_domain text generated always as (
    lower(split_part(work_email, '@', 2))
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recruiters_email_domain_idx on public.recruiters (email_domain);
create index if not exists recruiters_status_idx on public.recruiters (status);
```

**`company_members`** — which recruiters may act for which company (D4).

```
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  recruiter_id uuid not null references public.recruiters (user_id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  -- Records WHY it was approved: 'domain-match' or 'admin'. Worth keeping —
  -- it is the audit answer to "who let this person edit Infosys?"
  approved_via text check (approved_via in ('domain-match','admin')),
  approved_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, recruiter_id)
);
```

`on delete cascade` here, unlike `jobs.company_id`'s `restrict`: a membership is
a relationship, not content, and it has no meaning without both ends.

**`companies`** — three additions, no drops.

```
alter table public.companies
  drop constraint if exists companies_status_check,
  add constraint companies_status_check
    check (status in ('pending','active','hidden'));

alter table public.companies
  add column if not exists created_by uuid references auth.users (id),
  add column if not exists email_domain text;   -- derived from website host
```

`email_domain` is a plain column rather than generated, because deriving a host
from a free-text URL is not `IMMUTABLE`-safe; it is written by
`companies_derive_email_domain`, a `before insert or update of website` trigger
using the same normalisation as the TypeScript side. `'pending'` is added to the
existing check, and — this is the part that needs no work — the untouched
`companies_public_read` policy (`using (status = 'active')`) already excludes it.

**`jobs`** — the status widening plus review metadata.

```
alter table public.jobs
  drop constraint if exists jobs_status_check,
  add constraint jobs_status_check
    check (status in ('draft','pending','active','rejected','closed','expired'));

alter table public.jobs
  add column if not exists submitted_by uuid references public.recruiters (user_id) on delete set null,
  add column if not exists source text not null default 'admin' check (source in ('admin','recruiter')),
  add column if not exists reviewed_by uuid references auth.users (id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text,       -- shown to the HR verbatim
  -- The D3 diff base: a snapshot of the row as last approved.
  add column if not exists approved_snapshot jsonb;

create index if not exists jobs_pending_idx
  on public.jobs (created_at desc) where status = 'pending';
create index if not exists jobs_submitted_by_idx
  on public.jobs (submitted_by, updated_at desc);
```

`jobs_pending_idx` is partial, matching the style of `jobs_active_posted_at_idx`
— the queue query is `status = 'pending' order by created_at`, and the index
should carry only those rows.

**`job_review_events`** — the audit trail. Small, append-only, admin-read.

```
create table if not exists public.job_review_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  actor_id uuid references auth.users (id),
  action text not null check (action in
    ('submitted','approved','changes-requested','rejected','resubmitted','withdrawn')),
  note text,
  created_at timestamptz not null default now()
);
```

Two things depend on it: the recruiter's job detail page renders it as a
timeline ("Submitted 14 Aug · Changes requested 15 Aug · Resubmitted 15 Aug"),
and a rejection dispute is answerable from data rather than memory.

### Predicate functions

Mirroring `public.is_admin()` — `security definer`, `set search_path = public`,
`stable`:

- `public.is_recruiter()` → an `active` row in `recruiters` for `auth.uid()`.
  Note it returns **false for a suspended recruiter**, so suspension is enforced
  by every policy at once rather than by remembering to check it in each.
- `public.can_manage_company(p_company_id uuid)` → an `approved`
  `company_members` row, or `is_admin()`.
- `public.can_post_for_company(p_company_id uuid)` → any membership row
  regardless of status (D4: posting is allowed while verification is pending),
  or `is_admin()`.

### The trigger that does the actual enforcing

`public.jobs_enforce_recruiter_rules()`, `before insert or update on public.jobs`.
This is D3's mechanism and the reason recruiter writes are safe:

```
if public.is_admin() then return new; end if;          -- admin writes untouched

-- Non-admin: the client does not get to pick these, whatever it sent.
new.status         := case when new.status = 'draft' then 'draft' else 'pending' end;
new.source         := 'recruiter';
new.submitted_by   := coalesce(old.submitted_by, auth.uid());
new.is_featured    := coalesce(old.is_featured, false);
new.applicants_count := coalesce(old.applicants_count, 0);
new.reviewed_by    := old.reviewed_by;      -- (null on insert)
new.reviewed_at    := old.reviewed_at;
new.review_note    := old.review_note;
new.approved_snapshot := old.approved_snapshot;
new.posted_at      := coalesce(old.posted_at, now());
```

Read the first assignment carefully: an update to a row that was `active` lands
on `pending`. That *is* D3, and it holds no matter which client made the write,
because the database is the thing enforcing it — not a server action a future
refactor might route around.

A companion `public.jobs_capture_approval_snapshot()`, `before update of status`,
writes `approved_snapshot = to_jsonb(new)` on the `→ active` transition. That is
the diff base §7 renders against.

### RLS

Additive throughout; **no existing policy is loosened**. `jobs_public_read_active`
and `companies_public_read` are not touched at all, which is the property §12
verifies.

On `jobs`:
- `jobs_recruiter_read_own` — `select` where `submitted_by = auth.uid()`. This
  is what lets an HR see their own drafts, pending and rejected listings; the
  public policy still only exposes `active`.
- `jobs_recruiter_insert` — `with check (is_recruiter() and can_post_for_company(company_id))`.
- `jobs_recruiter_update` — `using (submitted_by = auth.uid() and status in
  ('draft','pending','rejected','active'))`, same in `with check`. Note
  `'closed'` and `'expired'` are absent: a finished listing is not editable back
  into circulation.
- `jobs_recruiter_delete` — `using (submitted_by = auth.uid() and status in ('draft','rejected'))`.
  A recruiter can withdraw something never published; they cannot delete a live
  listing out from under the board (they close it instead).

On `companies`:
- `companies_member_read_own` — `select` where `can_post_for_company(id)`, so a
  pending company is visible to the person who created it.
- `companies_recruiter_insert` — `with check (is_recruiter() and status = 'pending' and created_by = auth.uid())`.
  The literal `status = 'pending'` in the `WITH CHECK` is the thing that stops a
  recruiter from self-publishing a company.
- `companies_member_update` — `using (can_manage_company(id))` — **approved
  members only** (D4).

A `companies_enforce_recruiter_rules` trigger pins `status`, `is_verified` and
`slug` for non-admin writers, for the same reason as the jobs one.

On `recruiters`: self-read, self-insert (`user_id = auth.uid()`), self-update
excluding `status` and `trust_level` (pinned by trigger), plus admin read/write.
On `company_members`: read own + admin; insert own with `status = 'pending'`;
**no recruiter update at all** — approving your own membership is exactly the
thing being prevented, and the admin action uses the service-role client.
On `job_review_events`: recruiters read events for their own jobs; only the
admin and the server actions insert.

### `supabase/migrations/20260820090100_storage_recruiter_media.sql`

Replaces the three write policies on the `company-media` bucket (D5). Same
`do $$ … exception when insufficient_privilege` wrapper as
[the existing one](supabase/migrations/20260813090100_storage_company_media.sql),
for the same reason — `storage.objects` is owned by `supabase_storage_admin`.

```
create policy "company_media_write" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'company-media'
    and (
      public.is_admin()
      or public.can_manage_company(((storage.foldername(name))[2])::uuid)
    )
  );
```

`(storage.foldername(name))[2]` is the `<companyId>` segment of
`logos/<companyId>/<uuid>.webp` — the convention
[companyMediaPath](src/lib/storage.ts#L110) already produces. The `::uuid` cast
is inside the `can_manage_company` call rather than in the policy predicate so a
malformed path fails the membership check rather than erroring the statement;
the helper takes `text` and returns false on a bad parse.

Public read is unchanged. Update and delete get the same predicate as insert.

---

## 4. Auth and roles

Three roles, one Supabase Auth pool:

| | Table | Predicate | Signs in at | Lands on |
|---|---|---|---|---|
| Admin | `admins` | `is_admin()` | `/admin/login` (password) | `/admin` |
| Recruiter | `recruiters` | `is_recruiter()` | `/employers/login` (magic link) | `/employers` |
| Visitor | — | — | — | public site |

A user in neither table is authenticated but authorised for nothing, which is
already how the codebase behaves — the protected admin layout's "This account
isn't an administrator" screen
([layout.tsx](src/app/admin/(protected)/layout.tsx#L49)) is exactly that state.

### `src/app/auth/callback/route.ts` *(new)*

Magic links need a code-exchange endpoint; the password flow did not, which is
why nothing like this exists yet.

```
GET /auth/callback?code=…&next=/employers
  → supabase.auth.exchangeCodeForSession(code)
  → resolve role → redirect
```

Role resolution decides the destination, and it must be done server-side here
rather than trusted from `?next=`:

1. `is_admin()` → `/admin`
2. a `recruiters` row exists → `/employers`
3. authenticated but no profile → `/employers/onboarding`
4. exchange failed (expired or reused link) → `/employers/login?error=expired`
   with a "Send me a new link" button. Magic links expire; this screen is the
   difference between a recovered session and a lost recruiter.

`?next=` is honoured only after passing through
[safe-redirect.ts](src/lib/safe-redirect.ts) — the existing `safeAdminRedirect`
generalises to `safeInternalRedirect(path, allowedPrefixes)`, keeping its
same-origin guarantee.

### [`src/middleware.ts`](src/middleware.ts) — three changes

1. **Matcher** widens to `["/admin/:path*", "/employers/:path*"]`. `/post-a-job`
   and `/auth/callback` stay outside it: the landing page must remain
   statically served (D9), and the callback does its own session work.
2. **Role-aware redirects.** The current rule "signed in and on `/admin/login`
   → `/admin`" sends a recruiter to a page that tells them they aren't an
   admin. It becomes a lookup of the user's role and a redirect to that role's
   home. Anonymous on `/employers/*` → `/employers/login?next=…`.
3. **`X-Robots-Tag: noindex, nofollow`** on `/employers/*`, matching what
   `/admin/*` already sets.

The three-layer model in the existing header comment is preserved verbatim:
middleware redirects, the layout re-checks server-side, RLS is the final
authority. Middleware is never the security boundary.

---

## 5. The page map

Every route, what it is for, and what it connects to.

### Public — no auth, indexable

| Route | Purpose |
|---|---|
| `/post-a-job` *(new)* | The employer landing page (D9). Value proposition, "free, reviewed within one working day", a three-step how-it-works strip, a logo wall of companies already on the board (real data from `getCompanyDirectory()`), FAQ. The primary CTA is a **single work-email field** that posts to `/employers/login` — the sign-up form *is* the CTA, so there is no dead click between intent and action. Replaces the header's `/contact?intent=post-a-job` link. |
| `/employers/login` *(new)* | Email in → `signInWithOtp` → "Check your inbox" state on the same page, with the address echoed back and a *Resend* button that respects the rate limit (§9). Also the destination for expired-link errors. |
| `/auth/callback` *(new)* | §4. Not a page — a route handler. |

### Recruiter — `src/app/employers/(protected)/`

Layout mirrors `admin/(protected)/layout.tsx`: server-side `getUser()`, then a
`recruiters` lookup, then the shell.

| Route | Purpose | Connects to |
|---|---|---|
| `/employers` | **Dashboard.** Three bands: (1) a status strip — *2 live · 1 in review · 1 needs changes*; (2) the job list, each row a status chip, the live link when active, and the rejection reason inline when rejected; (3) the company card with its verification state. Empty state is the whole onboarding CTA, not a shrug. | → every route below |
| `/employers/onboarding` | Journey A step 1. Name, phone, designation, LinkedIn. Writes `recruiters`. Redirects here from anywhere if the profile is missing — it is a wall, not a suggestion. | → `/employers/company/new` |
| `/employers/company/new` | Journey A step 2. Search-or-create over existing companies (D4), then the two-step wizard (D5). | → `/employers/jobs/new` |
| `/employers/company/[id]` | Edit an owned company. Read-only with a *Verification pending* banner when the membership isn't approved. | → `/companies/<slug>` (live preview) |
| `/employers/jobs/new` | The job form. `[Save draft]` and `[Submit for review]`. | → `/employers/jobs/[id]` |
| `/employers/jobs/[id]` | **Status detail.** The submission as it will look publicly, plus the `job_review_events` timeline, plus the admin's `review_note` rendered prominently when changes were requested. This page is what makes the review loop feel like a conversation rather than a rejection. | → edit |
| `/employers/jobs/[id]/edit` | Edit + resubmit. Carries the D3 warning banner when the job is currently `active`. | → detail |

### Admin — `src/app/admin/(protected)/`

| Route | Purpose |
|---|---|
| `/admin/review` *(new)* | The approval queue. §7. |
| `/admin/recruiters` *(new)* | Recruiter directory: name, work email + domain-match chip, phone, company/companies, submitted / approved / rejected counts, trust level, suspend toggle. |
| `/admin/jobs` *(modified)* | Status tabs gain **Pending** and **Rejected**; a **Source** column distinguishes recruiter submissions; the row action gains *Review* when pending. |
| `/admin/companies` *(modified)* | A **Pending** filter tab, and a *Submitted by* column for recruiter-created rows. |
| `/admin` *(modified)* | `StatsCards` gains an **Awaiting review** tile that links straight into the queue. |

### How they connect

```
                        ┌──────────────┐
  header CTA ─────────► │ /post-a-job  │
                        └──────┬───────┘
                               │ work email
                        ┌──────▼───────────┐    magic link    ┌────────────────┐
                        │ /employers/login │ ───────────────► │ /auth/callback │
                        └──────────────────┘                  └───────┬────────┘
                                                                      │ role?
              ┌───────────────────────────────────────────────────────┤
              ▼ no profile                    ▼ recruiter             ▼ admin
   /employers/onboarding  ──►  /employers  ◄──┘                    /admin
              │                    │  ▲                               │
              ▼                    ▼  │                               ▼
   /employers/company/new ─► /employers/jobs/new                /admin/review
                                     │                                │
                                     │ status: pending ───────────────┤
                                     │                                │ approve
                                     ◄──── email + status chip ───────┤
                                                                      ▼
                                                          /jobs/<slug> goes live
```

---

## 6. Recruiter UI — components and reuse

The rule: **extract shared field groups, do not fork the forms.**
[job-form.tsx](src/components/admin/job-form.tsx) and
[company-form.tsx](src/components/admin/company-form.tsx) are large and
carefully built; two copies would drift within a month.

| Component | Change |
|---|---|
| `src/components/admin/job-fields.tsx` *(new)* | Every field group lifted out of `job-form.tsx` verbatim, taking a `mode: "admin" \| "recruiter"` prop. `recruiter` hides `status`, `is_featured`, `capacity`, `applicants_count`, `slug`, `posted_at`, `valid_through` and the bulk-import panel; it also swaps the CompanyPicker for a locked one. |
| [job-form.tsx](src/components/admin/job-form.tsx) | Becomes the `admin` shell around `job-fields.tsx`. **No behaviour change.** |
| `src/components/employers/job-submit-form.tsx` *(new)* | The `recruiter` shell. Two submit buttons, a "what happens next" strip, and the D3 warning when editing something live. |
| `src/components/admin/company-fields.tsx` *(new)* | Same split for the company form; `recruiter` hides `status`, `is_verified`, `legal_name` and `slug`. |
| `src/components/employers/company-wizard.tsx` *(new)* | Step 1 identity → insert → step 2 branding (D5), with a live `/companies/<slug>` hero preview beside the uploaders. |
| `src/components/employers/company-search.tsx` *(new)* | Debounced search over `companies` by name, showing logo + HQ + live job count, with a "None of these — create a new company" tail item. This component is what enforces D4's fork in the road, so the two outcomes must look visibly different. |
| [image-uploader.tsx](src/components/admin/image-uploader.tsx) | **Unchanged** (D5). |
| `src/components/employers/status-chip.tsx` *(new)* | One chip, six statuses, used on the dashboard, the job detail and the admin queue. Wording is recruiter-facing: `rejected` reads **"Needs changes"**, never "Rejected" — the flow is a revision loop, and the label should say so. |
| [form-fields.tsx](src/components/admin/form-fields.tsx), [confirm-dialog.tsx](src/components/admin/confirm-dialog.tsx), [Button](src/components/ui/button.tsx), [CompanyLogo](src/components/ui/company-logo.tsx), [CompanyCover](src/components/ui/company-cover.tsx) | Reused as-is. |

**Hooks**, following [use-admin-jobs.ts](src/hooks/use-admin-jobs.ts) exactly
(React Query, browser client, RLS-authorised, `containsPattern` from
[postgrest.ts](src/lib/postgrest.ts) for search):

- `src/hooks/use-recruiter-jobs.ts` — list / create / update / withdraw.
- `src/hooks/use-recruiter-company.ts` — the recruiter's companies + membership state.
- `src/hooks/use-review-queue.ts` — the admin queue, its counts, and the
  approve / request-changes / reject mutations.

---

## 7. The admin review queue

The one screen that decides whether this feature is a relief or a chore. The
design target: **clear twenty submissions in under three minutes**, and never
approve something the admin didn't actually read.

### Layout — split view, list left (380px), preview right

Each **queue card** carries, in one glance:

- Type chip: *New job* / *New company* / *Join request* / *Re-review*
- Company logo, job title, company name
- Recruiter name, and the email **domain** (not the full address — the domain is
  the signal)
- Age, with anything over 24h in amber

…and beneath it, **auto-computed trust chips**. These are the feature's real
intelligence, because they let the admin skip verification on the 80% that are
obviously fine:

| Chip | Rule |
|---|---|
| ✅ Domain verified | `recruiters.email_domain = companies.email_domain` (D4) |
| ✅ 5 approved before | `trust_level = 'trusted'` |
| ⚠️ Free email | domain in the free-provider list |
| ⚠️ First submission | recruiter has no approved job |
| ⚠️ New company | company `status = 'pending'` |
| ⚠️ No salary | both `salary_min` and `salary_max` null |
| ⚠️ Off-site apply | `application_url` host ∉ {company website, known ATS hosts} |
| 🔁 Re-review | `approved_snapshot is not null` (D3) — **and this card opens on the diff, not the full listing** |

The queue sorts by risk, not by time: warnings first, `trusted` recruiters
last. Time is the tiebreaker.

**Preview panel** renders the submission using the *public* job detail
components, at public width — the admin reviews what will actually ship, not a
form dump. Beneath it: the recruiter block with `tel:` and `mailto:` links (§2)
and their submission history.

For a re-review, the panel opens on a **field-level diff** against
`approved_snapshot`: *Salary max ₹18L → ₹22L*, *Description +2 paragraphs*. This
is what keeps D3 from making the admin's job worse — a one-word fix should cost
one glance.

### Four actions, not two

| Action | Effect |
|---|---|
| **Approve** `A` | `status = 'active'`, `posted_at = now()`, `reviewed_by/at` set, snapshot captured, `revalidateJobPaths(slug, companySlug)`, approval email. If the company was `pending`, it goes `active` in the same transaction — a job cannot be live under an invisible company. |
| **Request changes** `R` | `status = 'rejected'` + a required `review_note`. Note goes to the recruiter verbatim, so the dialog offers canned reasons (*Salary range missing*, *Apply link doesn't resolve*, *Reads as an ad, not a role*) that fill an editable textarea. Editable, because a canned rejection with no specifics is why review loops stall. |
| **Approve with edits** `E` | Opens the submission in the full admin job form. Most submissions are 90% right; making the admin bounce a listing over a typo wastes both sides' time. Fix, save, approve — one pass. This works only because the admin retains write access to recruiter rows (D7). |
| **Reject & block** | `status = 'rejected'`, no resubmit, and optionally `recruiters.status = 'suspended'` — which cuts off every write at once via `is_recruiter()` (§3). Behind a confirm dialog. |

Every action writes a `job_review_events` row (§3).

### Where it lives in the nav

[admin/(protected)/layout.tsx](src/app/admin/(protected)/layout.tsx) gains a
`ClipboardCheck` entry **above Jobs** with a live count badge, polled by
`use-review-queue`. Above Jobs on purpose: the queue is the thing with a
service-level expectation attached, and it should be the first thing in the eye
line.

---

## 8. Notifications

Email is what holds the two sides together across the review gap. Six messages:

| Trigger | To | Contains |
|---|---|---|
| Magic link | HR | Supabase built-in (custom SMTP — D1) |
| Submission received | HR | "We have it. Reviewed within one working day." |
| New submission | Admin | Title, company, trust chips, deep link to `/admin/review` |
| Approved | HR | The **live URL**, a share prompt, "post another" |
| Changes requested | HR | The `review_note` verbatim + a deep link to the edit page |
| Membership approved | HR | "You can now edit Acme Robotics' profile" |

**`src/lib/email.ts` *(new)*** — a thin ZeptoMail (Zoho) wrapper. There is no email
infrastructure in this codebase today, so this is the one genuinely new external
dependency.

Two properties it must have:

- **A missing `ZEPTOMAIL_TOKEN` logs a warning and returns, never throws.** Local
  dev and preview deploys must not require mail, and an email failure must never
  roll back the submission it was announcing. Every call site treats delivery as
  best-effort, the same way [image-uploader.tsx](src/components/admin/image-uploader.tsx)
  treats orphan cleanup.
- Failures go through [`captureError`](src/lib/observability.ts) with
  `severity: "warning"`, so they are visible without being pages.

The admin notification is also rate-limited to one digest per 15 minutes using
the existing [rate-limit.ts](src/lib/rate-limit.ts) — a recruiter posting eight
roles at once should produce one email, not eight.

---

## 9. Anti-abuse

Layered, cheapest first. The premise underneath all of it: **nothing a recruiter
writes is ever public without an admin click**, so abuse costs the attacker
effort and costs us queue noise — never a bad listing on the live site.

1. **Verified email.** The magic link is the gate (D1). No throwaway submission
   without a working inbox.
2. **Rate limits** via [rate-limit.ts](src/lib/rate-limit.ts), keyed on
   recruiter id where signed in and on IP where not:
   - magic link: 3 / hour / email, 10 / hour / IP
   - job submission: 5 / day / recruiter
   - company creation: 1 / day / recruiter
   - image upload: 20 / day / recruiter (server-action-issued token; see the gap below)
3. **Free-email flagging**, not blocking. A genuine startup founder posts from
   Gmail; blocking that costs real listings. Flag it in the queue and let the
   admin decide — that is what the phone number is for.
4. **Suspension** is a single field with system-wide reach (§3).
5. **Honeypot + `website` trap** on `/employers/login`, matching
   [contact-form.tsx](src/components/forms/contact-form.tsx)'s pattern.
6. **`company_members` caps** — a recruiter joining twelve companies is a
   signal; cap at 5 pending memberships and surface the rest for review.

> **Known gap, stated rather than hidden.** Uploads go browser → Storage
> directly, so a server-side rate limit cannot sit in front of them. The bucket's
> 5 MB ceiling and the 200 KB browser compression
> ([image-compress.ts](src/lib/image-compress.ts)) bound the damage, and D5's
> policy bounds *where* a recruiter can write to companies they belong to — but
> a determined recruiter can still write many objects into their own folder. The
> mitigation is the orphan sweep already noted as future work in
> [company-profiles-plan.md §9](docs/company-profiles-plan.md), extended to
> alert on per-company object counts. Not solved here.

---

## 10. Types, validation, cache

| File | Change |
|---|---|
| `src/types/recruiter.ts` *(new)* | `Recruiter`, `RecruiterInput`, `CompanyMember`, `RECRUITER_STATUSES`, `TRUST_LEVELS`, `MEMBERSHIP_STATUSES` + label maps. **Type aliases, not interfaces** — the `never` trap documented in [company.ts](src/types/company.ts#L33). |
| `src/types/review.ts` *(new)* | `ReviewQueueItem` (the discriminated union of job / company / membership), `TrustSignal`, `ReviewAction`, `JobReviewEvent`. |
| [src/types/job.ts](src/types/job.ts) | `JOB_STATUSES` gains `'pending'`, `'rejected'`; labels gain **"In review"** and **"Needs changes"** (§6). New fields on `Job`. A `JobSource` union. |
| [src/types/company.ts](src/types/company.ts) | `COMPANY_STATUSES` gains `'pending'`; `created_by`, `email_domain` on `Company`. |
| [src/types/database.ts](src/types/database.ts) | The three new tables (`Row`/`Insert`/`Update`), amended `jobs` and `companies`, and the new FKs in `Relationships` so embedded selects type. Longhand insert shapes, per that file's header. |
| [src/lib/validations.ts](src/lib/validations.ts) | `recruiterProfileSchema` (phone via a new `indianPhone` helper, §2), `companyClaimSchema`, `reviewActionSchema` (a `review_note` **required** when the action is `changes-requested`), `magicLinkSchema`. The recruiter job schema is `jobFormSchema.omit({ status, is_featured, slug, … })` — derived, so a new field can't be forgotten on one side. |
| `src/lib/recruiters.ts` *(new)* | Server reads for the portal and the queue, `unstable_cache`-free (all per-user), with a `RecruiterQueryError` following [companies.ts](src/lib/companies.ts). Plus `freeEmailDomain(domain)` and `domainFromWebsite(url)` — pure, unit-tested, and shared with the SQL trigger's logic. |
| [src/app/actions/admin.ts](src/app/actions/admin.ts) | `revalidateJobPaths` / `revalidateCompanyPaths` are **already correct** for approval — approving a job is a job going live, which is the case they were written for. New: `approveJob`, `requestJobChanges`, `rejectJob`, `approveMembership`, `suspendRecruiter`, each re-checking `is_admin()` server-side (a Server Action is a public endpoint — see the comment in [actions/jobs.ts](src/app/actions/jobs.ts#L20)). |
| `src/app/actions/employers.ts` *(new)* | `submitJobForReview`, `withdrawSubmission`, `requestMagicLink`, `completeOnboarding`, `claimCompany`. Rate-limited per §9. |
| [src/app/sitemap.ts](src/app/sitemap.ts), [src/app/robots.ts](src/app/robots.ts) | `/post-a-job` added to the sitemap; `/employers` added to the robots disallow list beside `/admin`. |

**Cache note worth stating**: a recruiter submitting or editing a pending job
touches **nothing public**, so no revalidation runs on the hot path. Only the
admin's approve action flushes caches. That falls out of D2 for free, and it is
the reason this feature adds no load to the public site.

---

## 11. Security review checklist

Run before merge; each line is a specific query, not a vibe.

- [ ] Anonymous `select` on `jobs` returns **only** `status = 'active'` — no
      policy added here widens it.
- [ ] Recruiter A cannot read, update or delete recruiter B's jobs.
- [ ] A recruiter `update` setting `status = 'active'` lands on `'pending'`
      (the D3 trigger), including a direct PostgREST call with a forged body.
- [ ] Editing an `active` job as a recruiter drops it to `pending` and removes
      it from `/jobs` on the next revalidation.
- [ ] A recruiter cannot set `is_featured`, `posted_at`, `reviewed_by` or
      `review_note` on any row.
- [ ] A recruiter cannot update a company they are not an **approved** member of
      (the D4 asymmetry).
- [ ] A recruiter cannot insert a company with `status = 'active'`.
- [ ] A recruiter cannot insert or update `company_members` (no self-approval).
- [ ] Uploading to `logos/<someone-elses-company-id>/…` is refused by storage RLS.
- [ ] `phone` appears in no public query, no public type, no JSON-LD, no OG image.
- [ ] A `suspended` recruiter's every write is refused, and their live jobs stay live.
- [ ] `promote_first_user_to_admin` is **gone** (D6) — verified by requesting a
      magic link against a database with an empty `admins` table and confirming
      no promotion.
- [ ] `/employers/*` carries `X-Robots-Tag: noindex` and is in `robots.ts`.
- [ ] Every new Server Action re-checks its role server-side.

---

## 12. Tests and manual verification

**Unit** (Vitest, beside the existing `*.test.ts`):

- `src/lib/recruiters.test.ts` — `freeEmailDomain` across the provider list and
  its near-misses (`gmail.co.in`, a corporate `mail.acme.com`);
  `domainFromWebsite` over `http://`, `https://`, `www.`, a path, a port, and
  garbage.
- [validations.test.ts](src/lib/validations.test.ts) — `indianPhone` (bare
  10-digit → `+91`, rejects a leading 5, accepts an already-`+91` string);
  `reviewActionSchema` requiring a note on `changes-requested`; the derived
  recruiter job schema rejecting a `status` field.
- `src/lib/review-signals.test.ts` — the trust-chip rules (§7) as pure functions
  over fixtures, which is where an inverted condition would otherwise turn a
  warning into a green tick.

**Integration**, against a Supabase branch DB — the RLS and trigger behaviour is
the part that actually matters, and none of it is exercised by unit tests:
every box in §11, driven by two real sessions.

**Manual**, in order:

1. Fresh email → magic link → onboarding → new company → job → submit. Confirm
   the job is absent from `/jobs`, absent from the sitemap, and 404s at
   `/jobs/<slug>`.
2. Approve from the queue → live within the revalidation window, correct on the
   company profile, present in the sitemap, HR emailed the live URL.
3. Edit the now-live job as the recruiter → confirm it drops off `/jobs` and
   reappears in the queue as a **Re-review** with a correct diff (D3).
4. Second recruiter on the same email domain → membership auto-approves.
   Third recruiter on `gmail.com` claiming the same company → membership
   pending, job posting still allowed, company profile read-only (D4).
5. Suspend a recruiter → every write refused, their live jobs untouched.
6. Sign out entirely → `/employers` redirects, and a direct PostgREST `GET` for
   a pending job with the anon key returns `[]`.

---

## 13. Rollout

Six shippable phases. Each leaves the site working.

| Phase | Contents | Ships behind |
|---|---|---|
| **0 — Harden** | Drop `promote_first_user_to_admin` (D6). Document the manual bootstrap in the README. | Nothing. **Merge this first, on its own.** |
| **1 — Model** | Both migrations, types, validation, `lib/recruiters.ts`. No UI. Existing admin flows regression-tested against the widened status check. | Nothing user-visible |
| **2 — Auth** | `/employers/login`, `/auth/callback`, middleware, onboarding, the protected layout. A recruiter can sign in and see an empty dashboard. | `NEXT_PUBLIC_EMPLOYER_PORTAL` |
| **3 — Submit** | Field-group extraction, company wizard, job form, submission actions. Recruiters can submit; admins approve from `/admin/jobs` with the existing table. | same flag |
| **4 — Review** | `/admin/review`, trust chips, diff view, `/admin/recruiters`, nav badge. | same flag |
| **5 — Email** | `lib/email.ts`, the six templates, Supabase custom SMTP. | `ZEPTOMAIL_TOKEN` |
| **6 — Launch** | `/post-a-job`, header CTA switch, sitemap, robots. Flag removed. | — |

**Order notes.** Phase 1's migration is additive and reversible — nothing is
dropped, unlike the companies migration. Phase 2 is the first point at which
public signup exists, which is why Phase 0 must already be deployed. Phase 6 is
the only phase that changes anything a current visitor sees.

**Soft launch.** Before flipping the header CTA, invite ten employers already in
the `contact_submissions` table by hand. Ten real submissions through the queue
will find the field the form is missing, and the rejection reason that needed to
be canned, far more cheaply than a public launch will.

---

## 14. Touchpoint summary

**New — migrations (2)**
`20260820090000_recruiter_portal.sql`,
`20260820090100_storage_recruiter_media.sql`
*(plus `20260820085900_drop_admin_promotion_trigger.sql` in Phase 0)*

**New — lib / types / hooks (9)**
`src/types/recruiter.ts`, `src/types/review.ts`,
`src/lib/recruiters.ts`, `src/lib/recruiters.test.ts`,
`src/lib/review-signals.ts`, `src/lib/review-signals.test.ts`,
`src/lib/email.ts`,
`src/hooks/use-recruiter-jobs.ts`, `src/hooks/use-recruiter-company.ts`,
`src/hooks/use-review-queue.ts`

**New — routes (12)**
`src/app/(public)/post-a-job/page.tsx`,
`src/app/employers/login/page.tsx`,
`src/app/auth/callback/route.ts`,
`src/app/employers/(protected)/layout.tsx`,
`…/(protected)/page.tsx`,
`…/(protected)/onboarding/page.tsx`,
`…/(protected)/company/new/page.tsx`,
`…/(protected)/company/[id]/page.tsx`,
`…/(protected)/jobs/new/page.tsx`,
`…/(protected)/jobs/[id]/page.tsx`,
`…/(protected)/jobs/[id]/edit/page.tsx`,
`src/app/admin/(protected)/review/page.tsx`,
`src/app/admin/(protected)/recruiters/page.tsx`

**New — components (10)**
`admin/job-fields.tsx`, `admin/company-fields.tsx`,
`admin/review-queue.tsx`, `admin/review-preview.tsx`,
`admin/review-diff.tsx`, `admin/trust-chips.tsx`,
`employers/job-submit-form.tsx`, `employers/company-wizard.tsx`,
`employers/company-search.tsx`, `employers/status-chip.tsx`

**New — actions (1)**
`src/app/actions/employers.ts`

**Modified (12)**
[middleware.ts](src/middleware.ts),
[types/job.ts](src/types/job.ts),
[types/company.ts](src/types/company.ts),
[types/database.ts](src/types/database.ts),
[lib/validations.ts](src/lib/validations.ts),
[lib/safe-redirect.ts](src/lib/safe-redirect.ts),
[app/actions/admin.ts](src/app/actions/admin.ts),
[components/admin/job-form.tsx](src/components/admin/job-form.tsx),
[components/admin/company-form.tsx](src/components/admin/company-form.tsx),
[components/admin/job-table.tsx](src/components/admin/job-table.tsx),
[components/admin/stats-cards.tsx](src/components/admin/stats-cards.tsx),
[app/admin/(protected)/layout.tsx](src/app/admin/(protected)/layout.tsx),
[components/layout/site-header.tsx](src/components/layout/site-header.tsx),
[app/sitemap.ts](src/app/sitemap.ts),
[app/robots.ts](src/app/robots.ts)

**Unchanged, deliberately**
[image-uploader.tsx](src/components/admin/image-uploader.tsx) and
[lib/storage.ts](src/lib/storage.ts) (D5 — the path convention already carries
the company id), [lib/jobs.ts](src/lib/jobs.ts) (the public read filters on
`status = 'active'` and needs no new exclusion — D2),
[next.config.ts](next.config.ts).

---

## 15. Deliberately out of scope

Named so they are decisions rather than omissions:

- **Applicant tracking.** No candidate accounts, no applications stored, no
  resume handling. `application_url` / `application_email` stay the apply route.
  This would be the single largest follow-on feature and pulls in resume storage
  and PII handling.
- **Paid / featured placements.** `is_featured` stays admin-only, so the
  commercial hook exists without any billing code.
- **Auto-approval for trusted recruiters.** `trust_level` is populated and shown
  from day one, but nothing acts on it automatically. Ship the manual gate,
  watch a hundred submissions, then decide.
- **Multi-recruiter company admin.** `company_members.role` distinguishes
  `owner` from `member`, but there is no invite flow — an admin adds the second
  member. The column is there so the later feature is additive.
- **In-app messaging.** Rejection notes are one-way. If a back-and-forth turns
  out to be needed, `job_review_events` is already the thread.
- **Bulk / CSV job upload.** The scrape-import panel stays admin-only.
- **Recruiter analytics** (views, clicks per listing). Wanted eventually;
  [lib/analytics.ts](src/lib/analytics.ts) is client-side GA today and has no
  per-listing server-side counter to read from.
