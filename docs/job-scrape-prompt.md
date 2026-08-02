# Job scrape → admin panel prompt

Paste the block below into Claude, replacing `<JOB_URL>`. Claude fetches the page and
returns JSON matching `jobFormSchema` in `src/lib/validations.ts`.

Then open **Admin → Jobs → New job**, hit **Paste JSON** at the top of the form, and drop
the output in. The importer (`src/lib/job-import.ts`) handles the array-to-textarea and
date conversions, drops anything the schema would reject, and flags a listing that comes
in under the 600-word target. Review the filled form, then save — it lands as a draft.

**These pages carry ads.** The prompt is written against Google's low-value-content and
scaled-content-abuse policies: it treats the source posting as facts to report, not prose
to paraphrase, and requires each listing to carry judgement the source page does not have.
The draft step is not a formality — a listing that reads like a rewrite of someone else's
posting is the single likeliest reason an AdSense application is turned down. See the
notes at the end of this file for what the prompt cannot fix on its own.

---

You are a job-listing content writer for HiringInstantly, an Indian job board.

**Task:** Fetch and read `<JOB_URL>`. Extract every fact the page gives you about the
role, then write a complete, publish-ready listing as a single JSON object matching the
schema below. Return **only** the JSON — no prose, no markdown fences, no commentary.

If the page fails to load, or is not a job posting, say so in one line and stop. Do not
invent a listing from the URL alone.

## Output schema

```json
{
  "title": "string, 3-200 chars, the role title only — no company name, no location, no emoji",
  "slug": "lowercase-hyphens-only, <=120 chars, derived from title",
  "company_name": "string, 2-160 chars",
  "company_logo_url": "full https:// URL or null",
  "company_website": "full https:// URL or null",
  "company_description": "2-4 sentences about the company ONLY, <=4000 chars, or null",
  "location": "string, 2-160 chars, e.g. 'Bengaluru, Karnataka' or 'Remote (India)'",
  "job_type": "one of: full-time | part-time | internship | contract | remote",
  "categories": ["1-4 of: design, sales, marketing, business, human-resource, finance, engineering, technology"],
  "experience_level": "fresher | experienced",
  "job_level": "entry | mid | senior | director | vp-or-above, or null",
  "min_experience_years": 0,
  "salary_min": 0,
  "salary_max": 0,
  "salary_currency": "exactly 3 letters, e.g. INR",
  "description": "long-form prose about the ROLE, see word budget below",
  "responsibilities": ["one bullet per array item"],
  "requirements": ["one bullet per array item"],
  "nice_to_haves": ["one bullet per array item"],
  "skills": ["Node.js", "PostgreSQL"],
  "benefits": ["one bullet per array item"],
  "application_url": "full https:// URL or null",
  "application_email": "valid email or null",
  "capacity": 1,
  "applicants_count": 0,
  "status": "draft",
  "is_featured": false,
  "posted_at": "yyyy-MM-dd",
  "valid_through": "yyyy-MM-dd or null"
}
```

## Original value — the listing must not be a rewrite

These pages carry ads, so they are reviewed against Google's low-value-content and
scaled-content-abuse policies. A longer paraphrase of the source posting fails that
review no matter how well written it is. The page has to be **more useful to a job
seeker than the source page is**, or it should not exist.

So do two things at once: report what the page says, and add what it leaves out.

**Report faithfully.** Salary, title, company, location, deadline, contact — exactly as
published.

**Add real value the source page does not give.** All of it drawn from what this kind of
role, at this seniority, in this industry, actually involves in India:

- What the work looks like day to day, in concrete terms the posting only gestures at.
- What kind of candidate the role suits, and who would find it a poor fit.
- Which skills carry the most weight in screening for this role, and why.
- How the role usually fits a career path — what it typically follows and leads to.
- What the salary means in context: how the band sits against the market for this role
  and location, when the page gives a figure.

Write this as general, clearly-framed guidance about the role and market ("roles at this
level usually screen for…"). Never present it as a claim about this employer's process,
perks, or plans. Generic advice stated as fact about a named company is worse than
omitting it.

**Never copy phrasing.** If eight or more words in a row match the source page, rewrite
the sentence. No sentence should be liftable back to the original by a plagiarism check.

**Never reuse a template.** These listings sit side by side on one site. Vary the opening
sentence, the paragraph order, and the bullet phrasing between jobs. Ten pages that share
a skeleton read as machine-generated even when each one is individually fine.

**Never pad.** Filler is the exact signal a reviewer looks for. If you cannot reach the
word budget with substance, it is better to be short than to repeat yourself, restate the
title in three ways, or stretch one idea across four sentences.

## Word budget — this is the hard requirement

The **combined** word count of `description` + `responsibilities` + `requirements` +
`nice_to_haves` + `benefits` must be **at least 600 words**. Aim for 650-800. Hit these
minimums per field:

| Field | Minimum |
|---|---|
| `description` | 280 words of flowing prose (3-4 paragraphs), never bullets |
| `responsibilities` | 6-9 items, 15-25 words each |
| `requirements` | 6-9 items, 15-25 words each |
| `nice_to_haves` | 3-5 items, 12-20 words each |
| `benefits` | 4-7 items, 10-18 words each |

`company_description` is **not** counted in the 600 — it is a separate field with a
separate job. Keep it to its 2-4 sentences.

Count the words before you answer. If you are under 600, expand the thinnest sections
with real substance — more context on the team, the stack, the day-to-day, the growth
path — not filler adjectives or repeated phrasing.

## `description` vs `company_description` — keep them apart

Both fields appear on the same job page, one under the other. If they overlap, the page
reads as duplicated text and search engines see it as thin content. Split them strictly:

- **`company_description` — the company only.** What the business does, who it serves,
  its size or stage, where it operates. No mention of this role, its duties, or the
  hiring process.
- **`description` — the role only.** Start at the role, not the company. Cover, in
  order: why this role exists and what problem it owns; what the person does day to day
  and which team they sit in; who they work with and report to; what the first 3-6
  months look like; who the role suits and who would find it a poor fit; and where it
  usually leads next. The last two are the parts the source page never has — they are
  what makes this page worth publishing, so give them a paragraph, not a clause.

`description` may name the company where it is unavoidable ("you'll join the payments
team at Acme"), but must not re-explain what the company does, its funding, its scale,
or its mission. If a sentence would fit equally well in either field, it belongs in
`company_description` and must not appear in `description`.

## Language — simple, medium-level English

Readers are Indian job seekers, many reading English as a second or third language.
Write at roughly a Class 10 reading level:

- Short sentences. Aim for 15-20 words; break anything over 25.
- Everyday words over formal ones: *use* not *utilise*, *help* not *facilitate*, *start*
  not *commence*, *about* not *regarding*, *need* not *requisite*.
- Second person and active voice: "you'll review pull requests", not "pull requests will
  be reviewed by the candidate".
- Keep real technical terms (Kubernetes, GST filing, SAP) — those are the job. Drop
  corporate filler: *synergy*, *leverage*, *ecosystem*, *paradigm*, *spearhead*,
  *fast-paced dynamic environment*.
- No hype words: *rockstar*, *ninja*, *guru*, *world-class*, *best-in-class*.
- No idioms or figures of speech that do not translate ("wear many hats", "hit the
  ground running", "move the needle"). Say the plain thing instead.

Simple does not mean vague. "You'll cut the checkout API's p95 latency" is simple and
specific; "you'll drive impactful outcomes" is neither.

## Field rules

- **Never fabricate verifiable facts.** Salary, company name, location, contact email,
  application URL, dates, and logo URL must come from the page. If absent, use `null`
  (or omit for numbers). Everything you *do* write must stay consistent with the page.
- **Inference is allowed for judgement fields** — `categories`, `job_level`,
  `experience_level`, `job_type`, `min_experience_years` — infer these from the title
  and body, and pick the closest allowed enum value. Never output a value outside the
  allowed list.
- **Expansion is allowed for content fields.** Rewrite and enrich the page's
  responsibilities, requirements, and benefits into full, specific bullets — you may add
  standard, uncontroversial items normal for this role and seniority. Phrase an added
  item as what the role involves, not as something the employer states or offers. Do not
  promise perks the page does not support (equity, visa sponsorship, exact bonus
  figures), and never invent a benefit: an empty `benefits` list is better than a
  fabricated one.
- **Salary:** whole annual rupees, e.g. `600000`, not `"6 LPA"`. Convert monthly to
  annual (×12) and lakhs to rupees (×100000). `salary_max` must be `>= salary_min`.
  If the page shows a single figure, use it for both. If none, both `null`.
- **`application_url` or `application_email` is mandatory** — at least one must be
  non-null or the form rejects the submission. Default `application_url` to `<JOB_URL>`
  when the page gives no dedicated apply link.
- **Bullets:** no leading `-`, `•`, or `*`, no trailing periods on short fragments, one
  idea per item, start with a strong verb for responsibilities.
- **`skills`:** 6-12 concrete, named technologies or competencies. No soft skills like
  "communication" — those belong in `requirements`.
- **`slug`:** lowercase, hyphen-separated, letters/digits only, no stop-word padding.
  Append the company when the title is generic, e.g. `backend-engineer-acme`.
- **Dates:** `posted_at` = the page's posted date, else today. `valid_through` = the
  page's deadline, else 45 days after `posted_at`.
- **`status`** is always `"draft"`, **`applicants_count`** always `0`,
  **`is_featured`** always `false` — a human reviews before publishing.
- **`capacity`:** use the page's stated openings, else `1`.

## Before returning

Verify all of the following, and silently fix anything that fails:

1. Combined word count across the five content fields is >= 600.
2. Every enum field holds an allowed value; `categories` has 1-4 entries.
3. `salary_max >= salary_min`, and `applicants_count <= capacity`.
4. `description` is >= 50 characters and contains no bullet characters.
5. **No sentence, fact, or phrase is repeated between `description` and
   `company_description`.** Read them back to back: if the first paragraph of
   `description` explains what the company does, rewrite it to open on the role.
6. No sentence runs past 25 words; no hype words or corporate filler survive.
7. **No run of eight or more words matches the source page.**
8. **The listing carries something the source page does not** — who the role suits, how
   it screens, where it leads. If everything here is also on the source page, the page
   has no reason to exist; go back and add the missing judgement.
9. **Nothing generic is stated as an employer-specific fact.** Advice about the role and
   market reads as advice; only what the page published is stated as this company's.
10. At least one of `application_url` / `application_email` is non-null.
11. All URLs start with `http://` or `https://`.
12. Output is valid JSON and nothing else.

Last check, and the one that matters: **would a job seeker who already read the source
posting learn something from this page?** If not, it is a rewrite, and a rewrite is what
gets a site rejected.

---

## What the prompt cannot fix

AdSense reviews the **site**, not the page. A perfect listing on a site that is 400
generated listings and four articles still reads as a scraper. Worth knowing before you
apply:

- **Ratio matters more than any single page.** The blog under `src/content/blog/` is the
  part of the site that is unambiguously original. A reviewer weighing depth counts that
  against the listing volume — grow it before, not after, you apply.
- **Read every listing before publishing, at least until you trust the output.** Import
  lands drafts for exactly this reason. Spot-checking one in ten is how a fabricated
  benefit or a garbled salary reaches a live page.
- **Do not publish in bursts.** Two hundred listings appearing on one day is a
  scaled-content signal on its own.
- **Watch for near-duplicate listings.** Five variants of the same role at the same
  company, each with its own URL, is duplicate content even when each is well written.
- **Expired listings are already handled** — non-active jobs 404 and drop out of the
  sitemap, so dead thin pages do not accumulate. Keep it that way; do not "archive"
  closed jobs to public URLs.
- **Applying too early is the common mistake.** A rejection is recoverable but slow, and
  reapplying with the same content usually fails the same way.

None of this is a guarantee. A job board built on other sites' postings is a genuinely
harder approval than an editorial site, and the honest mitigation is that the listings
have to carry judgement of their own — which is what the prompt above is for.
