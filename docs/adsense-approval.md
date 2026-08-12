# AdSense approval — what stands between this site and a yes

Written after a full pass over the codebase, the six Supabase migrations, every public
page, both legal pages, and the ad/analytics setup. Current state: **31 jobs, 9 articles,
8 static pages** — roughly 48 indexable URLs.

**Verdict: not yet. Two weeks of work, most of it writing.**

The compliance layer is in better shape than most applicants ever get it. What will decide
the review is the ratio of original content to aggregated listings, plus three things that
can fail the application outright regardless of how good everything else is.

---

## What is already right — do not touch these

Listed so nobody "fixes" something that is already correct.

| Item | Where | Note |
|---|---|---|
| `ads.txt` | [public/ads.txt](../public/ads.txt) | Correct single-line DIRECT record |
| Verification script | [src/app/layout.tsx:89](../src/app/layout.tsx#L89) | Plain `<script>`, lands in the SSR payload. This is the mistake most Next.js applicants make — `next/script` would emit only a preload link and the crawler would see nothing |
| `google-adsense-account` meta | [src/app/layout.tsx:45](../src/app/layout.tsx#L45) | Present |
| Ad disclosures in privacy policy | [privacy-policy/page.tsx:177–312](<../src/app/(public)/privacy-policy/page.tsx#L177>) | Third-party vendors, DART cookie, Google Ads Settings, aboutads.info, NAI — all present, all worded the way Google asks |
| Terms & Conditions | [terms-and-conditions/page.tsx](<../src/app/(public)/terms-and-conditions/page.tsx>) | 15+ sections incl. liability, IP, governing law |
| About page | [about/page.tsx](<../src/app/(public)/about/page.tsx>) | Real narrative, not filler |
| Contact page | [contact/page.tsx](<../src/app/(public)/contact/page.tsx>) | Working form, direct email, stated response time |
| Consent Mode v2 | [google-analytics.tsx:31](../src/components/analytics/google-analytics.tsx#L31) | Region-scoped `denied` defaults set before gtag loads |
| Technical SEO | sitemap, robots, canonicals, JSON-LD, OG images | Complete. `JobPosting`, `Article`, `Breadcrumb`, `Organization` all emitted |
| Navigation & mobile | header, footer, breadcrumbs | Clear, one H1 per page, fast (ISR + data cache) |
| No prohibited content | — | Nothing adult, violent, or restricted anywhere on the site |

---

## Blockers — fix before applying

### B1. Purge the fictional seed jobs (do this first, today)

`supabase/migrations/20260729090200_seed_sample_jobs.sql` inserted **10 active + 1 draft
fabricated listings** — "Nexthire Labs", "Zentari Studio" and friends — every one of them
with `https://example.com/careers/...` as the apply URL.

If any of those are inside your 31, the application fails on the spot: fabricated job
postings with dead apply buttons are simultaneously *misleading content* and *broken user
experience*, two separate policy violations.

Check:

```sql
select slug, company_name, application_url, status
from public.jobs
where company_website = 'https://example.com'
   or application_url like 'https://example.com%'
order by posted_at desc;
```

Delete every row that comes back, then delete the migration file so a fresh environment
never reintroduces them. Recount afterwards — if your real total drops from 31 to 21, that
changes the plan in B2 substantially.

### B2. The content ratio — the actual reason job boards get rejected

A reviewer sees ~48 URLs, of which 31 are job listings. Listings are treated as aggregated
third-party content and contribute little toward the "original content" bar. Your original
corpus is effectively **9 articles**.

Your own [job-scrape-prompt.md:228](job-scrape-prompt.md#L228) already states this: *"A
perfect listing on a site that is 400 generated listings and four articles still reads as
a scraper."* The prompt is well-built and its anti-paraphrase rules are the right defence
at the page level — but page-level quality does not fix a site-level ratio.

**Target before applying: 20–25 published articles.** That is 11–16 more, at the depth the
existing nine already hit (1000+ characters minimum, 8–11 minute reads).

Gaps in the current set, by category:

- `resume` — 1 article. Add: resume formats for career gaps; ATS keyword matching for
  Indian roles; the fresher resume with no work experience.
- `interviews` — 1 article. Add: the HR round scripted; technical interview prep by
  discipline; what to ask the interviewer; virtual interview mechanics.
- `salary` — 2 articles. Add: PF/gratuity/HRA explained; variable pay and joining bonus
  traps; counter-offer decisions.
- `job-search` — 2 articles. Add: LinkedIn for the Indian market; referrals without a
  network; how long a search actually takes.
- `career-growth` — few. Add: switching stacks mid-career; the manager-vs-IC fork;
  upskilling that employers actually verify.
- `workplace` — 1 article. Add: probation rights; WFH/hybrid policy in Indian law;
  resigning without burning the bridge.

Publish these **spread over 2–3 weeks**. Nine articles appearing on one day is itself a
scaled-content signal.

### B3. Domain and canonical origin

Two separate failure modes:

1. **`*.vercel.app` subdomains are not approvable.** AdSense requires a domain you own and
   control. If the live site is `hiring-instantly.vercel.app`, buy and connect
   `hiringinstantly.in` (the codebase already assumes it — see
   [site.ts:48](../src/lib/site.ts#L48)) before doing anything else on this list.

2. **`NEXT_PUBLIC_SITE_URL` must be set in production.** It is missing from `.env.download`.
   Unset, [resolveSiteUrl()](../src/lib/site.ts#L15) falls back to the Vercel deploy host
   or `localhost` — publishing localhost canonicals, a localhost sitemap, and localhost OG
   image URLs. The build logs a warning; nothing blocks the deploy.

Verify after deploying:

```
curl -s https://<your-domain>/sitemap.xml | head -20
curl -s https://<your-domain>/ | grep -o 'rel="canonical" href="[^"]*"'
curl -s https://<your-domain>/ads.txt
curl -s https://<your-domain>/ | grep -c 'adsbygoogle.js'
```

All four must show the production domain, and the last must return `1`.

### B4. The privacy policy describes a consent banner that does not exist

[privacy-policy/page.tsx:294](<../src/app/(public)/privacy-policy/page.tsx#L294>) states
that for EEA/UK/CH visitors *"advertising and analytics cookies are set only after you have
given consent through the notice presented on the site, and you can withdraw or change that
consent at any time through the same notice."*

There is no consent notice anywhere in the codebase. Consent Mode v2 defaults those regions
to `denied` and nothing ever calls `gtag('consent','update',…)`, so no cookies actually get
set — the *behaviour* is compliant, the *statement* is false.

Pick one:

- **Option A (recommended, ~1 hour).** Reword the section to describe what the site really
  does: non-essential cookies are disabled by default for EEA/UK/CH visitors and are not
  enabled without a consent mechanism. Honest, accurate, and true today.
- **Option B (~1 day).** Add a Google-certified CMP. Required anyway if you ever want to
  monetise EEA/UK traffic. Google's own consent management in the AdSense UI is the
  cheapest path and is certified by definition.

For an India-focused board, Option A now and Option B later is the sensible order.

### B5. Expired listings stay live forever

`jobs_valid_through_idx` is commented *"Expiry sweep"* in
[init_schema.sql:207](../supabase/migrations/20260729090000_init_schema.sql#L207) and
`'expired'` is a valid status — but **nothing in the codebase ever performs the sweep**. No
cron, no route handler, no server action.

So a reviewer can land on a live, indexed job page reading "Apply before 12 June 2026"
against a past date, with an apply button pointing at a closed requisition. That is exactly
the *broken user experience* finding job boards get rejected for, and
[job-scrape-prompt.md:242](job-scrape-prompt.md#L242) already claims — incorrectly — that
it is handled.

Fix with a Supabase scheduled function:

```sql
-- Runs daily; flips listings whose deadline has passed.
update public.jobs
set status = 'expired'
where status = 'active'
  and valid_through is not null
  and valid_through < now();
```

Schedule via `pg_cron` in the Supabase dashboard (Database → Cron Jobs), or a Vercel Cron
route that calls it. Whichever you pick, the write must also flush the cache — call
`revalidateTag('jobs')` — or the listing keeps serving from the data cache for its TTL.

Run it once manually before applying, then confirm no live listing shows a past
"Apply before" date.

---

## Strong recommendations — meaningfully raise the odds

### R1. Human bylines on articles

[json-ld.tsx:107](../src/components/seo/json-ld.tsx#L107) sets `author` to the
Organization. The articles render a date and a reading time but no writer.

Career advice is squarely inside Google's "Your Money or Your Life" territory — advice that
affects someone's livelihood — where authorship is weighted heavily. Add:

- An `author_name` / `author_bio` column pair on `public.articles`, surfaced in the admin
  form and rendered under the article title.
- `author` in the Article JSON-LD as a `Person`.
- A short "About the author" block at the foot of each article.

Even one named editor with two sentences of credentials beats an anonymous Organization.

### R2. Real business identity

The Contact page says *"India — we operate remotely."* AdSense wants to know who is behind
a site — and you will need a verified address for payments regardless.

Add a city and state at minimum. Better: a registered business name and address on both the
Contact page and in the footer.

### R3. Confirm `hello@hiringinstantly.in` receives mail

It appears on the contact page, in the privacy policy as the grievance contact, and in the
terms. A reviewer may test it. A bouncing address on a page that promises a reply "within 2
working days" is worse than no address.

### R4. Close the anon-write hole on the public tables

[init_schema.sql:274](../supabase/migrations/20260729090000_init_schema.sql#L274) and
[:293](../supabase/migrations/20260729090000_init_schema.sql#L293) grant `anon` insert with
`with check (true)` on `contact_submissions` and `newsletter_subscribers`. But
[actions/public.ts:65](../src/app/actions/public.ts#L65) writes through the **service-role**
client — so the honeypot and IP rate limit only guard a path nobody is forced to use.
Anyone holding the anon key (it ships to every browser) can POST unbounded rows directly.

Not an AdSense criterion, but a spam flood filling your database mid-review is a bad week.
Drop both `anon` insert policies; the app does not need them.

### R5. Durable rate limiting

`UPSTASH_REDIS_REST_URL` / `_TOKEN` are absent from `.env.download`, so
[rate-limit.ts](../src/lib/rate-limit.ts) falls back to the in-memory map — per-isolate on
Vercel, reset on every cold start, trivially walked past. A free Upstash database closes it
in ten minutes.

### R6. Internal linking from articles into listings

Each article ends with a generic CTA block. Contextual links — a salary article linking to
`/jobs?salaryBands=1200000-plus`, a fresher article linking to
`/jobs?experienceLevel=fresher` — bind the original content to the listings and demonstrate
the site is one coherent product rather than a blog bolted onto a scraper.

Note the tension with [robots.ts:19](../src/app/robots.ts#L19), which disallows crawling of
filtered `/jobs?` URLs. That is the correct call for crawl budget — these links are for
human readers, and they still pass the signal. Do not remove the disallow rules.

---

## Ad placement — after approval, not before

There are currently **no `<ins class="adsbygoogle">` units anywhere in the codebase**, only
the verification script. That is the right state to apply in.

Once approved:

- **Start with Auto ads** from the AdSense dashboard. No code changes.
- **Never place ads on `/admin`.** The dashboard sits outside `(public)/layout.tsx`, so
  keep every ad unit out of the root layout — same reasoning that already keeps GA off it.
- **Job detail pages:** at most one unit after the Description section and one in the
  sidebar rail. Nothing above the H1, nothing between the apply button and the listing.
- **Article pages:** one after the second heading, one at the foot. Not mid-paragraph.
- **Never near the Apply button.** An ad adjacent to the primary CTA invites accidental
  clicks — that is invalid traffic, and it gets accounts banned, not warned.

---

## Order of work

**Week 1 — blockers**

1. Purge fictional seed jobs, delete the seed migration (B1)
2. Connect the real domain, set `NEXT_PUBLIC_SITE_URL`, verify all four curl checks (B3)
3. Reword the consent paragraph in the privacy policy (B4)
4. Ship the expiry sweep, run it once, verify no past deadlines are live (B5)
5. Drop the anon insert policies, add Upstash credentials (R4, R5)

**Weeks 2–3 — the part that actually decides it**

6. Write and publish 11–16 articles, spread across days, hitting the existing depth (B2)
7. Add author bylines and Person JSON-LD (R1)
8. Add real business identity to Contact and footer (R2)
9. Confirm the contact email is live (R3)
10. Add contextual internal links from articles to filtered listings (R6)

**Then**

11. Let the site sit 7–10 days so Google indexes the new articles — check Search Console
    coverage before applying
12. Apply
13. Enable Auto ads on approval

---

## Honest assessment

A job board is a genuinely harder approval than an editorial site, because the bulk of its
pages are other people's postings. The mitigation is the one your own scrape prompt
identifies: the listings have to carry judgement the source page does not, and the original
editorial content has to be substantial enough that the site reads as a publisher rather
than an aggregator.

The compliance work here is done and done well. The blocker is arithmetic — 9 original
articles against 31 listings does not clear the bar. At 20–25 articles, with the fabricated
listings gone, a real domain, and no dead job pages, this becomes a reasonable application.

Applying before then risks a rejection, and reapplying with substantially the same content
usually fails the same way.
