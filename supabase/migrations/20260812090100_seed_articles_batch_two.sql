-- =============================================================================
-- Seed: fourteen career articles, batch two.
--
-- Written to close the gap the AdSense review actually turns on — nine original
-- articles against thirty-one aggregated listings reads as a scraper with a blog
-- bolted on, whatever the quality of any single page. Twenty-three does not.
--
-- Two things about the dates below are deliberate:
--
--   * They are spread one every day or two across three weeks, not stamped with
--     a single afternoon. Fourteen articles appearing at once is itself a
--     scaled-content signal, and the schedule gate in the articles table makes
--     the drip free — a `published` row with a future `published_at` is invisible
--     until its moment, then live without anyone touching it.
--   * No two consecutive posts share a category, so the index page fills evenly
--     rather than in blocks.
--
-- Re-running is safe: a slug that already exists is left alone, so an admin's
-- later edits are never overwritten by a replay of this migration.
-- =============================================================================

insert into public.articles (
  slug, title, description, excerpt, category, body_markdown,
  author_name, author_bio,
  reading_minutes, tags, related, status, published_at, revised_at
) values
  (
    'ats-keywords-for-indian-roles',
    'Getting Past the ATS: Keyword Matching for Indian Job Applications',
    'Recruiters do not read every resume — they search a database. Here is what that search looks like, and how to appear in it without keyword stuffing.',
    'The applicant tracking system is not an AI that scores you. It is a searchable database, and a recruiter typing three words into it decides whether you exist. What those words usually are, where to put them, and the Indian-market synonyms that quietly cost people interviews.',
    'resume',
    $md$There is a persistent belief that applicant tracking systems score your resume out of a hundred and reject anything under some threshold. That is not what happens, and believing it leads people to do genuinely counterproductive things — white text keyword blocks, twenty skills they cannot defend, "ATS-optimised" templates that parse worse than a plain document.

Here is what actually happens at most Indian companies. Your resume is parsed into structured fields — name, contact, employers, dates, education, a bag of skill terms. Those fields go into a database. A recruiter with a role to fill then queries that database, reads the first thirty or so results, and shortlists from them.

That is the whole mechanism. Everything useful about keywords follows from it.

## The query is shorter than you think

Ask a recruiter what they typed to fill their last role and the answer is rarely elaborate. It is usually two to four terms and a filter:

> `"Java" AND "Spring Boot" AND ("Bangalore" OR "Bengaluru")`, experience 3–6 years

Or, on Naukri or LinkedIn Recruiter, a job title plus one non-negotiable skill plus a location. The reason it is short is the same reason your resume gets twenty seconds: the recruiter has forty roles open and no interest in constructing an elegant boolean. They add terms only when the result set is too big, and drop them when it is too small.

Two consequences, and they point in opposite directions from the advice most people follow:

1.  **A handful of terms decide almost everything.** Not fifty. The three or four skills that define the role, the title, and the location. If those are missing or written differently from how the recruiter types them, nothing else on your resume gets a chance.
2.  **Extra keywords do not help.** They do not raise a score, because there is no score. What a long undifferentiated skills list does is make you appear in searches for things you cannot do, where you will be screened out by a human in the first five minutes — which costs you nothing on that role, but it does teach the recruiter that your resume is unreliable.

## Read the job description as a query, not as prose

The posting is written by someone who will also be searching. The vocabulary in it is very close to the vocabulary in their search box. So work backwards from it.

Take the posting and mark, in this order:

-   **The title.** If it says "Data Analyst" and your last title was "MIS Executive", that gap is real and you have to close it — more on that below.
-   **Anything under "must have" or "required".** These are the AND terms.
-   **Named tools and technologies.** Power BI, SAP FICO, Figma, Kubernetes, Tally, Salesforce. Proper nouns are what people search for, because they are unambiguous.
-   **Certifications and qualifications stated as hard filters.** CA, CFA Level 2, PMP, B.Tech in a named branch.

Then check each one against your resume, literally. Not "do I have this skill" — "does this exact string appear on my document".

## The exact-match problem, and where it bites in India

Search is largely literal. A parser does not know that these are the same thing:

| On the posting | On many Indian resumes |
|---|---|
| Bengaluru | Bangalore |
| B.Tech | BE / B.E. / Bachelor of Technology |
| Chartered Accountant | CA |
| Power BI | Business intelligence dashboards |
| MS Excel, advanced | Advanced spreadsheet modelling |
| Reconciliation | Recon |
| Accounts Payable | AP / P2P |
| Human Resources | HR / Personnel |
| Node.js | NodeJS / Node |

Some systems handle some of these. Many handle none of them. The fix costs nothing: **write the long form and the common short form once each**, in a place where it reads naturally.

> B.Tech (Bachelor of Technology), Computer Science — VTU, 2021

> Skills: Power BI, SQL, Advanced Excel (Power Query, pivot models), Python (pandas)

> Bengaluru, Karnataka (open to Bangalore-based hybrid roles)

That last one is slightly awkward and I still recommend it, because the Bengaluru/Bangalore split genuinely fragments search results, and recruiters at older companies type the old name.

## Where a keyword sits changes what it is worth

The same word carries different weight depending on where it appears, for a reason that has nothing to do with algorithms: it is where the human reader looks.

**In your title line.** The strongest position available, and the most underused. If you are an "MIS Executive" applying for analyst roles, do not invent a title you never held — put the market-standard name next to the real one:

> **MIS Executive (Data Analyst)** — Ashirvad Pipes, Bengaluru | Jun 2023 – Present

This is honest, it is common practice, and it puts you in the result set for "data analyst" where your real title would have hidden you.

**In your bullets, attached to work.** This is where a keyword becomes credible instead of merely present. Compare a skills line reading "SQL" against:

> Rewrote the weekly channel-performance report as a set of SQL views on Redshift; cut the manual build from four hours to a scheduled refresh, now used by three regional sales heads.

Both make you appear in a search for SQL. Only one survives the recruiter reading it.

**In the skills section.** Necessary, useful, and the weakest of the three on its own. Treat it as the index, not the argument.

**Nowhere near the header or footer of the page.** Many parsers skip document headers and footers entirely. People put their phone number there and then wonder why nobody calls.

## Tailoring, in ten minutes per application

Rewriting a resume per application is unsustainable and nobody does it for long. What works is a small, bounded edit that takes ten minutes:

1.  Keep a **master resume** — everything you have ever done, four pages, never sent to anyone.
2.  For each application, copy it and cut to one page, keeping the bullets closest to the posting.
3.  Rewrite the **summary line** to name the role you are applying for.
4.  Reorder the **skills line** so the posting's must-haves come first.
5.  Adjust two or three **bullets** to use the posting's vocabulary for work you genuinely did.

Do this for roles you actually want. For everything else, send the general version — the marginal return on tailoring the fortieth application does not justify the hour.

One thing worth doing every time, because it is free: **name the file properly.** `Rakshith-Gowda-Data-Analyst.pdf` beats `resume_final_v3(2).pdf` in a recruiter's downloads folder, and some systems index the filename.

## The things that break parsing

Before worrying about keywords at all, make sure the document parses. In rough order of how often I see each one cost somebody an interview:

-   **Two-column layouts.** The single most common self-inflicted wound. A designer template with a sidebar of skills often parses into interleaved fragments — half a job title, then a skill, then a date. Use one column.
-   **Skills as a graphic.** Star ratings, percentage bars, tag clouds rendered as images. To a parser these are nothing at all.
-   **Tables holding your work history.** Some parsers handle tables; enough do not.
-   **Scanned or image PDFs.** If you cannot select the text in a PDF reader, neither can the system. This includes a resume you signed and scanned.
-   **Unusual section headings.** "My Journey", "What I Bring". Use Work Experience, Education, Skills, Projects.
-   **Dates in inconsistent formats.** Pick `Mon YYYY – Mon YYYY` and use it everywhere, including "Present".

Test it yourself in thirty seconds: open your PDF, select all, copy, paste into a plain text editor. What you see is roughly what the parser sees. If it is scrambled, no amount of keyword work will help.

## What not to do

**Do not paste the job description into white text at the bottom of the page.** It is detected, it is treated as deception, and at companies with any recruiting maturity it gets you blocked rather than merely rejected. The gain if it worked would be one appearance in one search; the cost is your name on a list.

**Do not list skills you cannot discuss for five minutes.** Every term on your resume is an invitation, and technical interviewers accept the ones you look least confident about. A shorter, defensible list outperforms a long one, consistently.

**Do not chase a keyword you do not have.** If a posting requires three years of Kubernetes and you have read about it, you are not going to argue your way past the person who does have it. Spend that hour on a posting where you are a real candidate.

## The portal versions of this

**Naukri** is the biggest ATS in India in practice, because for many roles the recruiter never leaves it. Your profile there is your searchable record, not your uploaded PDF, so the keyword work has to be repeated in the profile fields — key skills, IT skills, current designation, preferred location. The resume headline is indexed and is the closest thing to a search-visible title you control. Profiles that have been updated recently also surface higher in many recruiter views, which is the only real reason to log in periodically.

**LinkedIn** ranks on the headline, the About section and the skills list, in roughly that order. The headline is 220 characters and most people waste them on "Aspiring Data Scientist | Passionate Learner". Put the role and the tools in it instead. If you want the longer version of this, it is in [LinkedIn for the Indian job market](/blog/linkedin-for-indian-job-seekers).

## The honest limit of all of this

Keyword matching gets your resume in front of a person. That is the entire benefit, and it is worth having — a resume nobody sees loses to a mediocre one that gets read. But it is a distribution problem, not a substitute for the document being good, and the twenty seconds after the search is what actually decides the shortlist. The format, the bullets and the cuts that matter are in [the resume guide](/blog/resume-that-gets-shortlisted).

If you are applying at the start of your career, the same mechanics apply with one difference: your keywords come from projects rather than job titles, which is a weaker signal in search and a stronger one in the interview. There are [fresher roles listed here](/jobs?experienceLevel=fresher), and the specifics of that resume are in [the fresher resume guide](/blog/fresher-resume-with-no-experience).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    10,
    array['Resume', 'ATS', 'Keywords', 'Job Applications'],
    array['resume-that-gets-shortlisted', 'linkedin-for-indian-job-seekers', 'fresher-resume-with-no-experience'],
    'published',
    '2026-08-12'::timestamptz,
    null
  ),
  (
    'hr-round-questions',
    'The HR Round, Question by Question',
    'The HR round is not a formality and it is not a personality test. It is four checks in disguise. Here is each question and what is actually being assessed.',
    'Candidates who clear the technical round and then lose the offer usually lose it here. What "tell me about yourself" is really asking, how to answer the salary question before you are ready, and the three answers that end a process quietly.',
    'interviews',
    $md$Ask most candidates what the HR round is for and they will say it is a formality, or that it is about culture fit, or that HR is checking whether you are a nice person. None of that is quite right, and the misunderstanding is expensive: people who have already cleared the hard technical rounds lose offers here regularly, usually without ever being told why.

An HR round is four assessments wearing the costume of a conversation:

1.  **Will you accept and join?** Companies count offer-to-join ratios. A candidate who accepts and ghosts costs the recruiter a filled requisition and two months.
2.  **Will you stay?** Attrition inside twelve months is expensive and visible.
3.  **Is anything going to blow up in background verification?** Dates, titles, the relieving letter, the gap.
4.  **Can you communicate with people who are not in your function?** For most roles this is a genuine job requirement, not a niceness test.

Every question below is one of those four in disguise. Once you can see which, the answers stop being guesswork.

## "Tell me about yourself"

The most-asked and most-wasted question in Indian interviewing. The failure mode is autobiography: born in Mysuru, schooling at St. Joseph's, then B.E. from VTU with 8.1 CGPA, then joined Infosys as a systems engineer, then...

The interviewer stopped listening at "schooling". This question is a request for a **ninety-second professional summary aimed at this role**. Structure that works:

> I'm a backend developer, three years in, currently at a logistics startup in Bengaluru where I own the shipment-tracking services — Java and Spring Boot, about 40k requests a day. Before that I was at Wipro for a year on a banking client, which is where I learnt to work in a regulated codebase. I'm looking to move because the platform work I enjoy is now maintenance rather than building, and this role is squarely a build role.

Present, past, then why you are here. It answers the question and hands the interviewer their next three questions, all on your terms.

## "Why do you want to leave your current company?"

This is assessment 2 — will you stay — and it is the question people most often answer honestly and badly.

The rule is not "never say anything negative". The rule is that whatever you name as the reason must be **something this new role visibly fixes**. If you say your manager is difficult, the interviewer's next thought is that managers are difficult everywhere, so you will leave again. If you say the work has stopped growing and the role in front of you is a step up, you have made leaving a consequence of the job rather than of you.

Works:

> I've been on the same product for two and a half years and the scope has narrowed — most of what I do now is keeping it running. I want to be building again, and ideally closer to the business side, which is what this role looks like.

Does not work, in ascending order of damage: "the pay is low" (fine as a reason, weak as an answer — it says you will leave for the next raise), "my manager doesn't support me" (unverifiable, and reads as a pattern), "there's too much politics" (says nothing about the company, quite a lot about you).

If you are leaving something genuinely bad — a company that stopped paying salaries on time, a role that turned out to be nothing like the posting — say it plainly and without adjectives. Facts land as facts. It is the editorialising that reads as a warning.

## "Where do you see yourself in five years?"

Nobody expects a plan. What is being checked is whether your stated direction is **compatible with the job they are filling**. If you say you want to start your own company in two years, the honest interviewer stops considering you for a role that needs three years of continuity — and they are right to.

Answer with a direction, not a title:

> In five years I'd like to be the person who owns a system end to end — architecture, not just implementation — and to have mentored a couple of juniors. Whether that comes with a title I'm not too fussed about.

Avoid naming a title above the one you are interviewing for on a timeline shorter than the company can plausibly deliver. "Engineering Manager in two years" told to a company where that takes six is not ambition, it is a scheduled resignation.

## "What is your expected CTC?"

The one that costs the most money, and it usually arrives in the first ten minutes of the first call, before you know the band, the components or the role's real scope.

The full treatment is in [negotiating salary in India](/blog/negotiate-salary-in-india). The short version for this round:

**First, try to get their number.** Politely, once:

> I'd rather understand the role fully before putting a number on it. Do you have a budgeted range for this position?

Often you get it — most Indian recruiters have a band and will share it, because a mismatch wastes their time too.

**If pressed, give a range and anchor it to the market, not to your current salary:**

> Based on what I've seen for this scope in Bengaluru, I'd be looking at 18–22 lakhs fixed. If the role turns out to be broader than the posting, I'd revisit that.

**Do not lie about your current CTC.** Background verification and, increasingly, your Form 16 or payslips will surface it. A candidate caught inflating their current salary loses the offer, and reasonably so.

**Do not say "as per company standards".** It reads as agreeable and gets you the bottom of the band. You are not being generous; you are being budgeted.

## "What are your strengths and weaknesses?"

The strengths half is easy and low-value — name two that the job needs and attach one example each.

The weakness half is a trap with three standard failures: the humblebrag ("I'm a perfectionist", "I work too hard"), which insults the interviewer; the disqualifier ("I'm bad at deadlines"), which is honest and fatal; and the deflection ("I can't think of any"), which reads as no self-awareness at all.

What works is a real, non-central weakness plus the specific thing you do about it:

> I'm slow at saying no. Early on I'd take on three parallel things and deliver all of them late. What I do now is keep a visible list with my manager and make the trade-off explicit — if something new comes in, we agree together what moves. It's still effort rather than instinct.

That is a genuine weakness, it does not undermine the core of the job, and the second half shows you have a system rather than an apology.

## "Why should we hire you?"

Rarely asked in that blunt form these days, but the underlying question runs through everything. The answer is not enthusiasm. It is the two or three things about your background that map to the hardest part of the role.

> You're building the payments integration from scratch and you've said reconciliation is the painful part. That's the exact thing I spent last year on — I've dealt with the settlement mismatches and the reversal edge cases already, so I'd be useful from week one rather than month three.

To say something like that you have to know what the hardest part of the role is, which means asking. Which is the next section.

## "Do you have any questions for us?"

Saying no is a genuine mistake — it reads as no interest, and it wastes the one part of the interview you control. It also happens to be the point where you learn whether you want this job.

There is a full guide to this at [questions to ask the interviewer](/blog/questions-to-ask-the-interviewer). If you remember one thing: ask about the work, not about the perks.

## The parts of this round that are administrative

Somewhere near the end an HR round becomes logistics, and these answers matter more than they sound:

**Notice period.** Give the contractual number and whether a buyout is possible, accurately. Overpromising a joining date you cannot hit is the single most common way a candidate turns a good offer into a bad start. [Notice periods and relieving letters](/blog/notice-period-and-relieving-letter) covers what is actually enforceable.

**Other offers in hand.** Being in another process is normal and saying so is fine — it is mild leverage and it moves timelines. Inventing an offer you do not have is a bluff that gets called roughly as often as you would expect.

**Gaps and short stints.** Answer in one flat sentence and stop. "I took eight months off for my father's treatment and started applying in March." The length of the explanation is what makes a gap look like a problem, not the gap.

**Documents.** Payslips, Form 16, relieving letters, education certificates. Know which of these you can actually produce. Discovering during BGV that your previous employer will not issue a relieving letter is a problem you want to find now, not in week three of onboarding.

## Three answers that end a process quietly

You will not be told these are why. They are:

-   **Criticising a former employer with heat.** One sentence of fact is fine. A paragraph of grievance transfers the risk to them.
-   **Being vague about dates or titles.** It reads as something to hide, and BGV is where it gets confirmed.
-   **Treating the round as beneath you.** The recruiter running it usually has a veto, frequently briefs the hiring manager afterwards, and remembers.

## Preparation, honestly bounded

You cannot script this round, and the people who try sound scripted, which is its own failure. What is worth doing the night before is small:

-   Write your ninety-second summary and say it aloud twice. Not memorised — just enough that you do not start with your birthplace.
-   Have one sentence ready for leaving, and check it names something this role fixes.
-   Know your number, your notice period and your dates cold.
-   Have three questions written down. Bring them on paper; nobody minds.

That is about forty minutes of work and it is the difference between an HR round that confirms the offer and one that quietly loses it. If your technical rounds are still ahead of you, [interview preparation that actually moves the needle](/blog/interview-preparation-that-works) covers those.$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    11,
    array['Interviews', 'HR Round', 'Interview Questions', 'Job Search'],
    array['interview-preparation-that-works', 'questions-to-ask-the-interviewer', 'negotiate-salary-in-india'],
    'published',
    '2026-08-14'::timestamptz,
    null
  ),
  (
    'pf-gratuity-hra-explained',
    'PF, Gratuity and HRA: The Parts of Your Salary Nobody Explains',
    'Three components decide a large share of what your offer is really worth. What each one is, when you get it, and the rules that quietly cost people money.',
    'Provident fund, gratuity and house rent allowance are the least understood lines on an Indian salary slip and three of the most consequential. The arithmetic behind each, the five-year rule people get wrong, and when a component is worth less than the number printed next to it.',
    'salary',
    $md$Most people can read the top and bottom of their salary slip — the CTC at one end, the credit in the bank at the other — and very little in between. That gap is where three components sit that together decide a substantial part of what a job is actually worth: provident fund, gratuity, and house rent allowance.

They are worth understanding for a plain reason. Two offers with identical CTC can differ by tens of thousands of rupees a year in take-home, and by considerably more in what you walk away with in five years, purely on how these three are structured. If you have not yet read the component-by-component walkthrough in [CTC vs in-hand salary](/blog/ctc-vs-in-hand-salary), start there — this piece goes one level deeper into the three that behave least like ordinary pay.

*One caveat before the numbers: rates, ceilings and tax rules change most years, and some of this depends on your state and your employer's structure. Treat the arithmetic here as the shape of the thing, and check current figures before you make a decision that turns on them.*

## Employees' Provident Fund

### What it is

A retirement fund you and your employer both pay into every month. The standard rate is **12% of basic salary plus dearness allowance from you, matched by 12% from your employer**.

Your 12% is deducted from your salary. The employer's 12% is normally counted inside your CTC — which is the first thing to understand about it. When an offer says 12 lakhs, roughly ₹43,200 to ₹86,400 of that is the employer's PF contribution, depending on how the basic is set. It is real money and it is yours, but it never appears in your bank account during the job.

### Where the employer's 12% actually goes

Not all of it lands in your PF account. It splits:

-   **8.33% to the Employees' Pension Scheme (EPS)**, capped at 8.33% of a ₹15,000 wage — so ₹1,250 a month for most people.
-   **The remaining 3.67%** (more, once the EPS cap binds) to your EPF account.

The EPS portion is a pension entitlement, not a balance you withdraw freely. This is why people who check their passbook after two years often find less than they expected: their own 12% is all there, the employer's is only partly there.

### The ₹15,000 ceiling

The statutory wage ceiling for mandatory PF is **₹15,000 a month of basic + DA**. Above that, an employer *may* contribute on actual basic, and many do, but they are not obliged to. Two employers offering the same CTC can therefore contribute very differently.

Worth asking directly in an offer conversation: *is PF calculated on my full basic, or restricted to the ₹15,000 ceiling?* On a basic of ₹50,000 that is the difference between ₹6,000 and ₹1,800 a month going in from each side.

### Interest, and why it is the good part

EPF interest has run in the region of 8% in recent years — declared annually by the EPFO, and typically ahead of what a fixed deposit pays. Contributions plus interest, compounding, largely untaxed if you meet the conditions below, is not a bad deal for the part of your salary you were least likely to invest well yourself.

### The rules that cost people money

**Do not withdraw when you change jobs.** The single most expensive habit in Indian salaried life. Your Universal Account Number (UAN) stays with you across employers; the balance can be transferred rather than withdrawn. Withdrawing resets a compounding balance to zero and, if your total service is under five years, makes the withdrawal taxable.

**The five-year rule.** EPF withdrawal is tax-free after five years of continuous service — and "continuous" counts across employers *if you transferred rather than withdrew*. Four jobs in six years with transfers each time is continuous service. The same four jobs with a withdrawal in between is not.

**Check your passbook once a year.** Employers deduct your 12% from your salary and are supposed to deposit both halves. Occasionally they do not — a genuine risk at very small or struggling companies. Your passbook on the EPFO member portal shows exactly what has been credited and when. A three-month gap in credits is worth a conversation.

**Nomination.** Takes ten minutes online and determines who receives the balance. Very few people have done it.

## Gratuity

### What it is

A lump sum your employer owes you for length of service, under the Payment of Gratuity Act, 1972. It applies to establishments with ten or more employees, which is nearly every company you will encounter on a job board.

The formula:

> **Last drawn basic + DA × 15 / 26 × completed years of service**

The 15/26 is fifteen days' wages for each year, counting a month as twenty-six working days. On a final basic of ₹60,000 with six years of service, that is 60,000 × 15 ÷ 26 × 6 ≈ **₹2.08 lakh**.

### The five-year cliff, which is the whole story

Gratuity is payable on **completing five years of continuous service** with one employer. Not four. Not four and a half. And unlike PF, it does not travel — the clock resets entirely when you change jobs.

There is a long-standing line of case law treating four years and 240 days in the fifth year as qualifying, and some employers pay on that basis. Others do not, and you would be litigating for it. Do not plan around it.

The practical consequence is the one nobody mentions when you resign at four years and eight months: you are leaving that money on the table. Whether four extra months is worth it depends on the offer in front of you, but it should be an explicit calculation rather than a discovery.

### The part that annoys people, correctly

Many employers include gratuity in your CTC — typically 4.81% of basic — from day one. So your stated CTC includes an amount you have a roughly one-in-three chance of ever receiving, given how long people actually stay in a job.

You cannot usually get this removed. You can price it correctly: when comparing two offers, deduct the gratuity line from both and compare what is left, because it is not compensation until year five.

Gratuity is tax-free up to a lifetime limit of ₹20 lakh for most private-sector employees. Very few people ever approach it.

## House Rent Allowance

### What it is

A salary component that is partly exempt from income tax if you actually pay rent. Structurally it is the one place where how your salary is *labelled* changes what you keep.

### The exemption, which is a "least of three"

Under Section 10(13A), the exempt portion is the **smallest** of:

1.  The actual HRA you receive;
2.  Rent paid minus 10% of salary (salary here meaning basic + DA);
3.  **50%** of salary if you live in Delhi, Mumbai, Kolkata or Chennai; **40%** everywhere else — including Bengaluru, Hyderabad and Pune, which surprises people every year.

Worked through, for someone in Bengaluru with a basic of ₹50,000 a month, HRA of ₹25,000 and rent of ₹22,000:

| Test | Monthly |
|---|---|
| Actual HRA received | ₹25,000 |
| Rent paid − 10% of basic (22,000 − 5,000) | ₹17,000 |
| 40% of basic (non-metro) | ₹20,000 |

The exemption is the least of the three: **₹17,000 a month**, or ₹2.04 lakh a year, on which no tax is paid. The remaining ₹8,000 a month of HRA is taxable like any other salary.

Two things fall straight out of that table. If your rent is low relative to your basic, test 2 collapses and most of your HRA is taxable — the component is worth much less to you than to a colleague on the same CTC paying city rent. And if your basic is a small fraction of your CTC, tests 2 and 3 both shrink, which is one reason a low basic is not automatically good for you.

### The conditions people miss

-   **You must actually pay rent**, to someone who is not you. Paying rent to a parent who owns the property is legal and increasingly scrutinised — the parent must declare it as income, and there should be a real transfer, not a cash arrangement invented in March.
-   **If your annual rent exceeds ₹1 lakh, you need your landlord's PAN.** No PAN, no exemption. Establish this before you sign a rental agreement, not in January when payroll asks.
-   **Keep receipts and bank transfers.** Rent paid by transfer with an agreement in your name is evidence. Cash with a receipt book bought at a stationery shop is what gets disallowed.
-   **You can claim HRA and a home loan deduction simultaneously**, if the facts support it — you rent in the city you work in and own elsewhere. It is legitimate and it is checked.

### The regime problem

HRA exemption is available under the **old tax regime**. The new regime, which is now the default, has lower slab rates and no HRA exemption.

Which is better depends entirely on your numbers — someone paying high rent in Mumbai with an 80C-heavy portfolio often still comes out ahead on the old regime; someone paying modest rent with few deductions usually does not. Run both. Payroll systems and the income tax portal both offer a comparison, and the choice is generally revisitable each year for salaried employees.

This is also why HRA structuring has become less universally valuable than it used to be. If you are on the new regime, a high HRA component is just salary with an odd name.

## What to do with this

Three questions, worth asking before you accept an offer:

1.  **Is PF on my full basic or capped at ₹15,000?** Changes real savings by tens of thousands a year.
2.  **What is the basic as a percentage of CTC?** It drives PF, gratuity and your HRA exemption ceiling simultaneously. A basic below about 40% of CTC is worth a question.
3.  **Is gratuity inside the CTC number you quoted me?** If yes, mentally remove it when comparing.

And one habit: log into the EPFO portal once a year and look at your passbook. It takes five minutes and it is the only way you will notice if something has gone wrong.

If you are weighing an offer right now, [how to negotiate salary in India](/blog/negotiate-salary-in-india) covers what is actually movable in these conversations — and a fair amount of structure is, even when the CTC number is fixed. Roles [in the ₹12 LPA and above band are listed here](/jobs?salaryBands=1200000-plus).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    11,
    array['Salary', 'Provident Fund', 'Gratuity', 'HRA', 'Tax'],
    array['ctc-vs-in-hand-salary', 'negotiate-salary-in-india', 'variable-pay-and-joining-bonus'],
    'published',
    '2026-08-16'::timestamptz,
    null
  ),
  (
    'linkedin-for-indian-job-seekers',
    'LinkedIn for the Indian Job Market, Without the Theatre',
    'Most LinkedIn advice is written for a different market. What actually gets an Indian recruiter to open your profile, and what is just performance.',
    'Recruiters search LinkedIn the same way they search any database — with three words. How the headline, About section and skills decide whether you appear, why posting daily is not the answer, and how to approach a stranger so they reply.',
    'job-search',
    $md$LinkedIn occupies an odd place in an Indian job search. Nearly everyone has a profile. Very few get anything from it. And the advice circulating on the platform itself is mostly written by people whose business is the platform — posting daily, engaging with everything, building a personal brand — which is a full-time strategy for a part-time problem.

What follows is the narrower version: what LinkedIn does well for someone in India who wants a job in the next three months, and what to ignore.

## What LinkedIn is actually good at

Three things, in descending order of value:

1.  **Being found by recruiters searching for your skills.** This is the whole game for experienced candidates. It happens passively, while you sleep, and it is the one thing LinkedIn does better than any Indian portal.
2.  **Finding the human attached to a role** so an application is not a form submission into a queue.
3.  **Warm routes into companies** — someone from your college, your previous employer, your city, who will forward a resume.

What it is not good at: applying. Easy Apply is a high-volume, low-response channel, and a large share of Indian listings on LinkedIn are duplicated from company sites or reposted by consultancies. It is fine as a discovery surface and poor as a submission surface.

## The headline is the highest-value real estate you own

220 characters, shown next to your name everywhere on the platform, and heavily weighted in search. Most people fill it with the default job title or with something like:

> Aspiring Data Scientist | Passionate Learner | Open to Opportunities

That headline does not appear in any useful search. "Aspiring" is not a term recruiters look for, "passionate learner" is not a skill, and the title is missing.

What works is boring and effective — role, tools, and the market signal:

> Data Analyst | SQL, Power BI, Python | 3 yrs in D2C retail analytics | Bengaluru

> Backend Engineer — Java, Spring Boot, AWS | Payments & reconciliation | Open to remote

Two rules. Put your real or target job title first, because that is the first term any recruiter search contains. And use the words a recruiter would type — the exact-match problem described in [ATS keyword matching](/blog/ats-keywords-for-indian-roles) applies here identically.

## The About section, in the format people actually read

Three short paragraphs, and the first one has to survive the "see more" cut at roughly 300 characters.

-   **What you do now, concretely.** Role, domain, scale, one number.
-   **What you have done before, compressed.** Two sentences.
-   **What you are looking for**, if you are looking. Explicit.

Write it in first person. The third-person corporate register — "Rakshith is a results-driven professional" — reads as a press release nobody commissioned.

Do not write a paragraph about your philosophy of work. Nobody reads it, including the people who tell you to write it.

## Experience entries are not resume bullets

The most common mistake here is pasting the resume. LinkedIn is read by three audiences with different needs — recruiters skimming, hiring managers checking substance, and your own network — so the entries should be slightly fuller than a resume and considerably less dense.

For each role: one line of context (what the company does, how big the team was — recruiters outside your industry have no idea), then three or four bullets with numbers. Skip anything you would not want to be asked about.

The one thing worth doing that people skip: **fill in the skills section properly, and reorder it.** LinkedIn's recruiter search leans on it, and the top three are pinned to your profile. Twelve to fifteen real skills, ordered by what you want to be found for. Endorsements from people who actually worked with you help slightly; endorsement-swapping with strangers does not.

## "Open to work", and the green frame question

Two separate settings:

-   **Visible to recruiters only.** Signals availability inside LinkedIn Recruiter without telling your current employer. There is no reliable guarantee your own company's recruiters will not see it, since the filter works on company affiliation and is imperfect — but in practice it is low risk and worth switching on.
-   **The public green photo frame.** Everyone sees it, including your manager.

For someone employed and searching quietly, the first only. For someone between jobs, the frame is fine and mildly useful — it is a filter recruiters use, and there is no longer much stigma to being between roles in the Indian market. The people who tell you the frame reads as desperate are usually not the people doing the hiring.

## Connection requests that get accepted

The mechanics matter more than the sentiment. A request with a note, from a profile that looks like a real professional, from someone with a plausible reason to connect, gets accepted most of the time. Without a note, it depends entirely on how your profile photo and headline read.

A note that works is short, specific, and asks for nothing on the first message:

> Hi Priya — I saw the Senior Analyst opening on your team. I've spent the last three years doing retail analytics at Ashirvad and the reconciliation piece in the JD is close to what I do now. Would it be alright if I sent across my resume?

What kills it: "I want to expand my network" (says nothing), a paragraph of flattery, and asking for a referral from someone who has never spoken to you. On the last one — referrals have their own mechanics and a very specific way of failing. That is covered in [getting referrals without a network](/blog/referrals-without-a-network).

## Who to actually message

In order of response rate:

1.  **The recruiter who posted the role.** Their job is to find candidates; you are not interrupting them.
2.  **Someone in your extended network at the company** — same college, same previous employer, same city. The shared attribute does most of the work.
3.  **The hiring manager**, if identifiable. Higher value, lower response rate. Worth it for a role you genuinely want.
4.  **Strangers with no connection to the role.** Low return, and the volume of these is why senior people stop reading their requests.

Follow up once, after five to seven days. Once. A second follow-up converts almost nobody and costs you the impression.

## Should you post?

The honest answer for most job seekers is: not much, and not for the reasons usually given.

Posting builds visibility slowly and unpredictably, and the Indian LinkedIn feed rewards a specific genre — the emotional anecdote with a career moral, the rejection-to-offer story, the list of twelve lessons — that most people are not going to write well or comfortably. Chasing it is a large investment in a channel that may not produce a single interview.

What is worth doing, if you want a presence:

-   **A short post when you have something real to show.** A project you shipped, a thing you learnt, a summary of a problem you solved. One a fortnight at most.
-   **Comments on posts in your field**, with something substantive. Cheaper than posting, and it puts you in front of exactly the right people.
-   **A featured section** with two or three artefacts — a GitHub repo, a dashboard, a portfolio, a piece of writing. This does more for a hiring manager than fifty posts.

If you are early in your career, one or two well-documented projects on your profile beat a posting habit comfortably. The rest of that argument is in [getting your first job when every listing asks for experience](/blog/first-job-without-experience).

## The Indian-market specifics

**Naukri still matters more for volume.** For mid-level roles at Indian companies, particularly in services, manufacturing, finance and operations, more recruiters search Naukri than LinkedIn. LinkedIn skews towards product companies, startups, MNC captives and senior roles. Keep both current; do not assume one substitutes for the other.

**"Open to relocate" is a real filter.** If you will move, say so in the headline or the About section. Recruiters filter hard on location and a great candidate in the wrong city is invisible.

**Beware the consultancy repost.** A large share of LinkedIn listings from staffing firms are speculative or already filled, and some are pure resume harvesting. The verification routine in [spotting a fake job posting](/blog/spot-a-fake-job-posting) applies directly. If the poster will not name the client company before you send a resume, treat it as a lead, not a role.

**Do not pay for Premium as a first move.** InMail credits and "who viewed your profile" are worth something to a candidate already getting traction; they do very little for a profile that is not being found. Fix the headline and skills first, then decide.

## A profile audit worth ninety minutes

If you do nothing else on this list:

1.  Rewrite the headline as role, tools, domain, city.
2.  Rewrite the first 300 characters of About so it says what you do and what you want.
3.  Add or reorder fifteen skills so the top three are what you want to be hired for.
4.  Add a real photo — a plain, well-lit head and shoulders. Not a wedding photo, not a group crop.
5.  Turn on "visible to recruiters".
6.  Add two artefacts to Featured.

That is one evening, and it changes the passive half of your search — which is the half that works while you are doing something else. The active half is applications and referrals, and it is still where most offers come from. [Current openings are here](/jobs) if you want to start there.$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    10,
    array['LinkedIn', 'Job Search', 'Networking', 'Personal Branding'],
    array['referrals-without-a-network', 'ats-keywords-for-indian-roles', 'spot-a-fake-job-posting'],
    'published',
    '2026-08-17'::timestamptz,
    null
  ),
  (
    'fresher-resume-with-no-experience',
    'The Fresher Resume: What Goes on a Page With No Work History',
    'A one-page resume for someone with no job yet. What replaces the experience section, how to write up a project, and the sections to delete outright.',
    'Freshers are told to write a resume in a format designed for people with careers. Here is the ordering that actually works with nothing to put under Work Experience, how to describe a project so it survives an interview, and the conventions to drop.',
    'resume',
    $md$A resume template assumes you have a work history. A fresher does not, which is why the standard advice produces a page that is 20% content and 80% padding — a bloated skills list, a paragraph of objective, the school percentages, three certificates from a video course, and a hobbies line.

The document works fine without work experience. It just needs a different order and a different centre of gravity.

## The order

For someone with no full-time role yet, and in this sequence:

1.  **Header** — name, phone, email, city, one or two links.
2.  **A two-line summary**, if and only if you can be specific.
3.  **Education** — degree, institution, year, CGPA if it is decent.
4.  **Projects** — the largest section on the page.
5.  **Internships / training**, if any.
6.  **Skills**.
7.  **Anything genuinely distinguishing** — a competitive rank, a publication, a position of responsibility with real scope.

Education goes near the top for a fresher because it is the thing being screened on. Once you have two years of work, it drops to the bottom permanently.

One page. There is no version of this that needs two.

## Projects are your experience section

This is the part that decides the shortlist, and the part most freshers write worst — usually as a title and a technology list:

> **E-commerce Website** — HTML, CSS, JavaScript, PHP, MySQL

That tells a reader nothing except that you followed a common tutorial. What it needs is what any experience bullet needs: what the problem was, what you built, and what came of it.

> **Split** — expense-sharing app for hostel rooms *(React Native, Firebase)*
> Built because we were settling mess and electricity bills over WhatsApp and constantly getting them wrong. Handles uneven splits and partial payments, keeps a running balance per person. Used by about 60 students across two hostels; roughly 40 weekly active as of March. [github.com/…]

Four lines, and it does a great deal of work. There is a real motivation, a real user count, a hard-ish problem in it (uneven splits and partial settlements), and a link. An interviewer reading that has three questions ready, and you will enjoy answering all of them.

Rules that hold generally:

-   **Two or three projects, described properly, beat six listed.** The marginal project adds nothing; the marginal detail adds a lot.
-   **A link beats a description.** A repo, a deployed URL, a published dashboard, a Behance page. Anything that can be opened.
-   **Say what was hard.** "Handles partial payments" is more interesting than "user-friendly interface".
-   **Do not list tutorial projects as if they were yours.** A to-do app, a portfolio site, a clone built step by step from a video — an interviewer identifies these in two questions, and the credibility cost is worse than the empty space would have been.
-   **Group project? Say what you did.** "Team of four; I built the payment flow and the reconciliation job."

If you have nothing that meets this bar, the honest answer is to spend three weekends building one thing before you spend three months applying. One project you can talk about for fifteen minutes changes the shape of every interview you get.

## Education, and how much of it to include

Degree, branch, institution, year of completion, and CGPA or percentage if it is above roughly 7.0 / 70%. If it is below that, leave it out — nobody asked, and the ones with a hard cutoff will ask.

Class 10 and 12 numbers are worth including **only** for campus placements and for companies that explicitly screen on them (a fair number of Indian services companies and banks still do). Once you have a degree and any real project work, they are taking space that projects should have.

Coursework lists add almost nothing. "Data Structures, DBMS, Operating Systems" is implied by the degree. Include a course only if it is unusual and relevant — a formal statistics sequence for an analytics role, a semester on embedded systems for a hardware role.

## Internships, including the unimpressive ones

Write them like jobs: organisation, role, dates, two or three bullets with scope.

If your internship was mostly observation — which is common and not your fault — do not inflate it. Write what you genuinely did:

> **Intern, Finance** — Sundaram Fasteners, Chennai | May–Jul 2025
> Reconciled vendor ledgers for the two-wheeler division; cleared a backlog of ~300 open line items. Built the Excel model the team now uses for monthly ageing.

Small, real, and specific beats "gained exposure to financial processes and enhanced my knowledge", which is what most internship bullets say and what none of them are believed for.

No internships at all? It is not disqualifying. Freelance work, a college fest you actually ran the budget for, a family business you did real work in, an NGO project — all of it counts if you describe it with the same specificity.

## Skills, without the scoreboard

Two or three grouped lines:

> **Languages:** Python, Java, SQL
> **Tools:** Git, Postman, Power BI, Excel (Power Query)
> **Coursework-level:** React, Docker

That last grouping is a useful honesty device. It tells the reader which things you have used properly and which you have touched, and it pre-empts the interview question that otherwise catches people out.

Delete the star ratings and the percentage bars. Nobody has a calibrated scale for "Python: 80%", the reader knows it is a guess, and graphical bars parse badly. Delete anything you would not want to be questioned on — listing a skill is an invitation, and technical interviewers accept the ones you sound least sure about.

Also delete "MS Office" and "Internet" unless the job is genuinely clerical. And do not put soft skills — "team player", "quick learner" — in a skills list. They are assertions, not evidence, and every resume has them.

## Certificates, honestly weighted

Certificates from short online courses are worth very little on their own, and freshers consistently overrate them. Six Coursera certificates do not equal one working project, and a screening recruiter has seen the same six on forty resumes this week.

Worth listing:

-   **Vendor certifications with a real exam** — AWS, Azure, Google Cloud, Oracle, Cisco, Tableau. These are verified and they cost something.
-   **A course whose output was a real artefact**, in which case list the artefact under Projects and mention the course in one line.
-   **Domain qualifications with standing** — NISM, IRDAI, CFA levels, whatever your field's equivalent is.

Not worth a section: participation certificates, webinar attendance, "workshop on machine learning", one-day college events. If you need them to fill the page, the page needs another project instead.

## The things to delete outright

Indian resume templates carry a set of conventions that are pure inheritance from government forms. On a private-sector application in 2026, all of these should go:

-   **The photograph.** It invites bias, it breaks some parsers, and outside a handful of fields nobody needs it.
-   **Father's name, date of birth, gender, marital status, nationality, religion, caste.** None of it is relevant to whether you can do the job.
-   **Full postal address.** City and state is enough.
-   **The declaration** — "I hereby declare that the above information is true…" with place and signature. It has no legal weight in a job application and eats a fifth of your page.
-   **"References available on request."** Assumed.
-   **An objective paragraph** about seeking a challenging position in a reputed organisation. It appears on a hundred thousand resumes and conveys nothing.
-   **Hobbies**, unless genuinely distinctive. "Reading, music, travelling" is filler; "state-ranked chess" is a fact about you.

That is often half a page recovered, which goes to projects.

## Format, so it survives the software

Single column. No tables holding your work history, no text boxes, nothing important in the page header or footer — many parsers skip those entirely. Standard section headings. Dates in one consistent format. A text-based PDF, not a scan.

Test it in thirty seconds: open the PDF, select all, copy, paste into a plain text editor. That is roughly what the parsing software sees. If it is scrambled, the template is the problem.

Name the file `Firstname-Lastname-Role.pdf`. The full mechanics of how recruiters search, and why the exact words matter, are in [ATS keyword matching for Indian roles](/blog/ats-keywords-for-indian-roles).

## What to do when nothing on the page feels like enough

Two things, and neither is more applications.

**Build the one project.** Pick a problem you personally have, build the smallest thing that solves it, put it somewhere it can be opened. Three weekends. It will do more for your search than another two hundred applications with the current resume.

**Get one person to look at it.** A senior from college who is now working, a cousin in the industry, anyone who has screened resumes. Fifteen minutes of their time surfaces things you cannot see in your own document.

Then apply in volume, because the response rate at this stage is genuinely low and that is a property of the market rather than of you. The realistic arithmetic — how many applications, over how many weeks — is in [how long a job search actually takes](/blog/how-long-a-job-search-takes), and there are [fresher openings listed here](/jobs?experienceLevel=fresher) and [internships here](/jobs?jobTypes=internship).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    10,
    array['Resume', 'Freshers', 'Projects', 'Entry Level'],
    array['first-job-without-experience', 'ats-keywords-for-indian-roles', 'resume-that-gets-shortlisted'],
    'published',
    '2026-08-19'::timestamptz,
    null
  ),
  (
    'technical-interview-preparation',
    'Preparing for a Technical Interview Without Wasting Three Months',
    'What to prepare depends on who is hiring. A discipline-by-discipline breakdown of what Indian technical rounds test, and what to do first.',
    'Product companies, services companies and startups run completely different technical interviews, and preparing for the wrong one is the most common way capable people fail. What each format tests, how to allocate limited preparation time, and what to do when you are stuck in the room.',
    'interviews',
    $md$"Preparing for the technical round" means four different things depending on who is interviewing you, and the single most common reason a capable person fails one is that they prepared thoroughly for a different format.

Someone spends three months grinding data structures problems and then interviews at a services company that asks them to explain normalisation and write a join. Someone else revises framework internals for a startup that hands them a laptop and a broken API. Both prepared. Neither prepared for what happened.

So the first question is not what to study. It is who is asking.

## Identify the format before you prepare

**Product companies and larger startups** — the ones running structured multi-round loops. Expect algorithmic problem solving under time pressure, one system design round from mid-level upwards, and a round on your actual past work. This is the format everything on the internet is written about, which is why people assume it is universal. It is not; it is the minority of Indian hiring by volume.

**Services and consulting companies** — expect breadth over depth. Core language semantics, SQL, one framework you claimed, a little OOP theory, and questions that check you have genuinely worked on what your resume says. Fewer puzzles, more "explain how this works".

**Startups outside the funded tier** — expect practical. A take-home, a debugging exercise, a conversation about how you would build the thing they are building. Often the CTO, often one long round, frequently the fastest process you will be in.

**Captives and GCCs** (an MNC's India engineering centre) — usually a hybrid: one algorithmic round because the global process demands it, plus deep questions on the specific stack the team runs.

You can identify which you are in with two questions to the recruiter, and they will answer:

> What do the technical rounds look like — how many, and roughly what does each cover?

> Is there a coding round, and is it algorithmic problem solving or working with a codebase?

Ask this. It is not presumptuous, it is the most useful five minutes of your preparation, and a recruiter who cannot answer it has told you something too.

## By discipline

### Software engineering

**If it is an algorithmic loop:** arrays, strings, hash maps, two pointers, sorting, binary search, trees, graphs, and basic dynamic programming — roughly in that order of frequency. Depth on the first five beats coverage of all of them. The realistic target is not 500 problems; it is 80 to 120 problems worked properly, meaning you solved it, then re-derived it a week later, and can state the complexity without thinking.

Talk while you solve. A silent candidate who reaches the optimal answer often scores below one who narrates a brute force, states its complexity, notices the repeated work and improves it. The interview is measuring how you think, and silence hides exactly that.

**If it is system design** (usually from three or four years up): the vocabulary matters more than novelty. Load balancing, caching layers, SQL versus NoSQL and why, sharding, queues and asynchronous processing, idempotency, and the CAP trade-off stated without the slogan. Practise out loud on three or four familiar systems — a URL shortener, a rate limiter, a notification service, whatever your own product does. Start with requirements and scale estimates, not with a box diagram.

**Always:** your own last two years. The most reliable question in any format is "walk me through something you built and why it was designed that way". People who cannot answer that well fail rounds they should have passed, and it is entirely preventable — write out three of your systems on paper before the interview.

### Data and analytics

**SQL is the round.** Not a component of it — for analyst roles it frequently is the technical interview. Joins including self-joins, group by with having, window functions (`row_number`, `rank`, `lag`, running totals), date handling, and the CTE-versus-subquery choice. Window functions are where most candidates fall over, and they appear constantly.

Then: Excel at a level beyond `VLOOKUP` — index-match, pivot models, Power Query if you claimed it. One visualisation tool properly, meaning you can discuss the data model behind a Power BI or Tableau report, not just build a chart. Python with pandas for the more technical roles.

And a case discussion: *sign-ups dropped 20% last week, how would you investigate*. This is testing structure, not statistics. Segment, isolate, check the instrumentation before the theory.

### Frontend

Beyond framework syntax: rendering and re-rendering behaviour, state management choices and why, browser fundamentals (event loop, the request lifecycle, what actually blocks paint), accessibility basics, and CSS layout that you can write without a UI library. Expect a live build — a component with a real requirement — and expect to be judged on how you handle the requirement changing halfway.

### DevOps, cloud and infrastructure

Linux fundamentals and networking are asked far more than people expect — DNS, TLS, ports, `netstat`, reading a log. Then one cloud platform properly, CI/CD pipelines you have genuinely configured, containers and orchestration, infrastructure as code, and an incident you were part of, told honestly with what went wrong.

### QA and testing

Test design is the differentiator, not tool syntax. Given a feature, how do you decide what to test and what to skip. Boundary and equivalence reasoning, the automation-versus-manual trade-off, flaky test handling, and API testing. Expect to be handed a small feature and asked to enumerate cases.

### Non-engineering technical rounds

Finance and accounting roles get accounting standards, closing processes and a practical Excel exercise. Marketing gets funnel maths and a campaign structure. HR gets statutory compliance and a case on a real situation. The principle is unchanged: the interview is about the mechanics of your actual work, and the preparation is being able to explain what you did and why.

## How to allocate time when you have two weeks

Preparation is triage. In rough priority:

1.  **Your own resume, defended.** Every project and claim on it, with numbers. This is asked in every format, and it is the cheapest thing to fix.
2.  **The one skill named most in the job description.** If the posting says SQL four times, that is your first three days.
3.  **The format's core** — algorithms, or SQL, or the practical exercise.
4.  **The company's product.** Use it. Read what they have published. Twenty minutes here changes the tenor of the whole conversation.
5.  **Everything else.**

What is not worth your two weeks: reading a language reference end to end, starting a new framework, or attempting 300 problems and retaining none.

If your preparation time is measured in days rather than weeks, the triage version is in [interview preparation that actually moves the needle](/blog/interview-preparation-that-works).

## In the room

**Restate the problem before you start.** Thirty seconds, and it catches misunderstandings that would otherwise cost you the whole round.

**Ask about constraints.** Input size, edge cases, whether you can assume the data fits in memory. Interviewers deliberately underspecify; asking is the test.

**Brute force first, out loud, then improve it.** A working answer with a stated complexity is a position to negotiate from. Nothing on the whiteboard is not.

**When you are stuck, say what you are stuck on.** "I want to avoid the nested loop here, and I'm trying to work out what to store so the second pass isn't needed" invites a hint and is scored as reasoning. Silence for four minutes is scored as nothing.

**Do not claim familiarity you do not have.** "I haven't used Kafka in production; I know it as a durable log with consumer groups — is that enough to reason about this?" is a good answer. Bluffing is a bad one, and it is transparent.

**Handling a question you genuinely cannot answer:** say so, then say what you would do about it. "I don't know how the garbage collector handles that. I'd read the GC logs and test it with a small heap." Interviewers are calibrating your honesty as much as your knowledge, and everyone has a limit.

## Take-home assignments

Increasingly common, and worth a rule: **scope your time and say so.** If a take-home says four hours and would take twelve to do fully, do the four honestly and include a short note on what you would add next and why. That note is often read more carefully than the code.

Refuse anything that is plainly production work — a full feature for their live product, unpaid, with a "we'll evaluate it" attached. It happens, and the pattern is close enough to the exploitative postings described in [how to spot a fake job posting](/blog/spot-a-fake-job-posting) to be worth naming.

## Afterwards

Write down every question you were asked, the same day, while you can still remember them. Two things come out of this: a real syllabus for the next interview, because companies in the same tier ask overlapping questions, and an accurate record of where you actually failed — which is almost never where you think it was.

Then check the non-technical half is not the thing costing you offers. Plenty of people clear every technical round and lose the process afterwards; what goes wrong there is in [the HR round, question by question](/blog/hr-round-questions).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    11,
    array['Interviews', 'Technical Interview', 'Preparation', 'Engineering'],
    array['interview-preparation-that-works', 'hr-round-questions', 'questions-to-ask-the-interviewer'],
    'published',
    '2026-08-20'::timestamptz,
    null
  ),
  (
    'variable-pay-and-joining-bonus',
    'Variable Pay, Joining Bonuses and Retention Clauses: Reading the Fine Print',
    'The components of an offer that are conditional, clawback-able or simply unlikely to be paid — and the questions that surface them before you sign.',
    'A 20 lakh offer with 25% variable and a clawback-bound joining bonus is not a 20 lakh offer. How variable pay is actually calculated in India, what a retention clause obliges you to, and the four questions that turn a promise into a number.',
    'salary',
    $md$Fixed pay is a promise. Everything else in an offer letter is a conditional, and the conditions are where offers stop being comparable.

Two candidates comparing "22 lakhs" and "20 lakhs" often discover, six months in, that the second one pays more — because the first was 25% variable against a target nobody hit last year, and the second was almost entirely fixed. That is not bad luck. It is information that was available at offer stage and never asked for.

This piece is about the conditional components: variable pay, joining bonuses, retention bonuses, ESOPs in brief, and the clauses attached to each. For the base structure of an Indian CTC — basic, HRA, PF, gratuity and the rest — start with [CTC vs in-hand salary](/blog/ctc-vs-in-hand-salary) and [PF, gratuity and HRA explained](/blog/pf-gratuity-hra-explained).

## Variable pay

### What it is, mechanically

A portion of your CTC paid only if certain targets are met. Usually stated as a percentage of CTC or as an absolute annual figure, and usually paid quarterly or annually, in arrears.

The critical thing to understand is that it is almost always **a product of two or three factors**, not one:

> Payout = Target variable × company performance factor × individual rating factor

So a 3 lakh variable at a company that hit 80% of plan, for someone rated "meets expectations" at a 0.9 factor, pays 3,00,000 × 0.8 × 0.9 = **₹2.16 lakh**. Nothing has gone wrong; that is the system working normally. The 3 lakh figure in the offer letter was always a ceiling with conditions.

### What varies by role

**Sales roles** carry the largest variable — 20% to 40% of CTC is normal, sometimes more — and it is usually genuinely achievable, with an explicit incentive plan, quota and accelerators above target. Ask for the plan document and last year's team attainment distribution. A quota that 30% of the team hit is a different job from one that 80% hit.

**Engineering and support functions** typically carry 10% to 15%, paid on a company-wide multiplier plus a personal rating. It is closer to a bonus than a commission, and the personal-rating half is subject to whatever bell curve the company runs.

**Senior roles** carry more, and increasingly with a deferred portion.

### The questions that turn it into a number

Ask the recruiter, plainly. These are normal questions and a reluctance to answer them is itself information:

1.  **What percentage of target variable was actually paid out last year, on average?** The single most useful question in this whole conversation.
2.  **Is it paid quarterly or annually, and in arrears?** Determines cash flow, and whether you see any of it in year one.
3.  **What is it calculated on — company performance, individual rating, or both?** And who sets the rating.
4.  **What happens if I resign mid-cycle?** Very commonly: nothing is paid. This matters more than people realise.

That last one is worth dwelling on. At many companies, variable is paid only to employees on the rolls on the payout date. Resign in month eleven of a twelve-month cycle and the entire year's variable can lapse. It is legal, it is in the policy document, and it silently sets the cheapest month for you to leave.

### How to price it when comparing offers

Compare **fixed to fixed** first. That is the number you can plan a rent and an EMI around.

Then add variable at a realistic discount rather than at face value: for a role with a track record of paying near target, perhaps 80%; for a new team, a new product line, or a company that has missed plan two years running, considerably less. If the recruiter will not tell you last year's payout, that is itself an answer, and you should discount accordingly.

## Joining bonuses

A one-time payment at joining, typically used to cover a notice-period buyout, a lapsed bonus at your current employer, or simply to close the gap when the band will not stretch.

Three things to check, always:

**The clawback period.** Almost every joining bonus is repayable in full if you leave within a stated period — usually twelve months, sometimes eighteen or twenty-four. Leaving at month eleven means writing a cheque, often for the gross amount even though you received it net of tax. Read the exact wording, and know the date.

**When it is paid.** With the first salary, after probation confirmation, or after ninety days. "After confirmation" is common and turns a joining bonus into a probation-completion bonus.

**How it is taxed.** As salary, in the month it is paid, which typically means a large TDS deduction in that month. A 2 lakh joining bonus is not 2 lakh in your account.

A joining bonus is genuinely useful — it is the easiest concession to obtain when the fixed band is capped, because it comes from a different budget line and does not affect internal parity. It is also the concession most likely to have strings. Both things are true.

## Retention bonuses

Offered when a company wants you to stay through something specific — an acquisition, a migration, a product launch, or a wave of attrition on your team. Structured as a payment at a future date conditional on still being employed.

Worth taking, generally, with two cautions. A retention bonus tells you something about the company's expectations of the near future, and it is usually not the optimistic thing. And it will be timed to sit exactly across the period when you would otherwise be free to leave, which is the entire point of it.

Check whether it is paid if you are laid off during the period. Sometimes yes, often not, and that is the scenario in which you will most want it.

## ESOPs, briefly

Deserve their own treatment, but three things belong here because they show up in offer comparisons:

-   **The number of options is meaningless without the total share count.** 10,000 options out of 10 crore shares is 0.01%. Ask for the percentage, or ask for the current fair market value per share.
-   **Vesting is typically four years with a one-year cliff.** Nothing vests if you leave inside twelve months.
-   **Exercise costs money and is taxed at exercise**, on the difference between fair market value and strike price, as a perquisite — in cash, in an unlisted company, on shares you cannot sell. People are regularly caught by this on resignation, when the exercise window is often only ninety days.

Treat ESOPs at an early-stage private company as a lottery ticket with a positive expected value and no liquidity. Do not accept a materially lower fixed salary for them unless you can afford for them to be worth zero.

## The retention and notice clauses in the letter itself

Read the offer letter and the employment agreement before signing, not after. In particular:

**Notice period on your side.** Sixty or ninety days is standard in India; some agreements are asymmetric, with thirty days from the company and ninety from you. Check whether a buyout is contractually permitted and at what rate — basic or full CTC. The mechanics of getting out cleanly are in [notice periods and relieving letters](/blog/notice-period-and-relieving-letter).

**Training bonds.** Common in services companies and some manufacturing roles. A bond requiring repayment for leaving early is enforceable only to the extent of actual, demonstrable training cost — a penalty clause is not enforceable as such — but the practical leverage is not the money. It is the relieving letter, which your next employer's background verification will ask for.

**Non-compete.** Broadly unenforceable in India after employment ends under Section 27 of the Indian Contract Act. Non-solicitation of clients and employees is treated more seriously. Confidentiality obligations survive regardless and should be taken seriously.

**Probation terms.** Length, notice during probation, and what confirmation depends on. See [what probation actually means in India](/blog/probation-period-in-india).

## The four questions, if you remember nothing else

Before accepting any offer with a conditional component:

1.  What was the actual variable payout last year, as a percentage of target?
2.  Is variable paid if I am not on the rolls on the payout date?
3.  What is the clawback period on the joining bonus, and is the repayable amount gross or net?
4.  What is my fixed component, monthly, after PF and tax?

Ask them by email, so the answers are in writing. A recruiter answering these clearly is a good sign about the company generally; one who deflects has told you what the numbers were going to tell you anyway.

And when you have the answers, negotiate on the structure rather than only the headline. Shifting 2 lakh from variable to fixed is often easier for a company to approve than adding 2 lakh to the total, and it is worth more to you. The rest of that argument is in [how to negotiate salary in India](/blog/negotiate-salary-in-india).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    10,
    array['Salary', 'Variable Pay', 'Offer Letter', 'ESOP', 'Negotiation'],
    array['ctc-vs-in-hand-salary', 'negotiate-salary-in-india', 'pf-gratuity-hra-explained'],
    'published',
    '2026-08-22'::timestamptz,
    null
  ),
  (
    'referrals-without-a-network',
    'How to Get a Referral When You Do Not Know Anyone',
    'Referred candidates are read first. Here is how to get one from a stranger — who to ask, what to send, and why most referral requests are ignored.',
    'A referral moves your application from a queue of four hundred to a queue of eight. Most people ask badly and get nothing. The three-message approach that works, who to approach in what order, and what to do when the answer is no.',
    'job-search',
    $md$A referred application at most Indian companies is a different object from a portal application. It typically enters a separate queue, it is looked at within days rather than weeks, and it comes with an implicit endorsement from someone with a stake in being right. Referral programmes exist because they work: referred hires are cheaper to source and, at most companies, stay longer.

Which means the response rate difference is not marginal. A cold application to a well-known company might get a reply one time in forty. A referral to the same company gets read close to every time.

The obvious problem: referrals appear to require a network, and if you had one you would not be reading this.

You do not need a network. You need a plausible connection and a request that costs the other person almost nothing to grant.

## Why most referral requests fail

Here is the message that lands in a hundred inboxes a week:

> Hi Sir, I am a 2024 B.Tech graduate with skills in Java, Python and web development. I am looking for opportunities in your esteemed organisation. Kindly refer me. Resume attached. Thank you.

It fails for reasons that have nothing to do with the sender's ability:

-   **It names no role.** The recipient would have to go and find one, which is work they did not sign up for.
-   **It gives no reason to trust.** A referral puts the referrer's judgement on record. Some companies track referral quality; at many, referring badly twice means being ignored the third time.
-   **It is addressed to no one in particular.** It is visibly a template, which tells the reader they are one of a hundred.
-   **It asks for the largest possible favour in the first message.**

Fix those four things and the response rate changes completely.

## Who to ask, in order

**1. Your college alumni.** Comfortably the highest-yield group in the Indian market, and the most underused. Shared institution is a real bond here — people help juniors from their own college, reliably, and often without knowing them at all.

Find them on LinkedIn: search the company name, filter by your school. Most colleges also have alumni groups on WhatsApp or Telegram that nobody uses well.

**2. Former colleagues, and their colleagues.** Anyone you have actually worked with, plus the people they moved on to work with. A person who has seen your work can refer you honestly, which is the strongest kind.

**3. People from your city or region**, particularly for candidates from smaller towns applying to metro companies. Weaker than the first two, but real.

**4. People in your online communities** — a Discord for your framework, a local meetup group, an open-source project you have contributed to, a subreddit for your industry. Contribution history substitutes for personal acquaintance surprisingly well.

**5. Complete strangers at the company.** Lowest yield, still non-zero, and worth doing at volume for a role you really want.

Skip senior leadership. A VP does not know the requirement, does not run the referral, and will at best forward you to a recruiter — which you could have done yourself.

The best person to ask is usually **two to five years into their career, in the same function as the role**. Junior enough to remember needing help, senior enough to have referral rights, close enough to the team to know whether you fit.

## The three-message approach

The core idea: never ask for the referral in the first message. Ask for something smaller that gives the other person a way to say yes cheaply, and lets them decide about you before committing their name.

### Message one — the opening

Short, specific, and asking a question rather than a favour:

> Hi Ankit — I'm from NIT Surathkal too, 2023 batch, currently doing backend work at a logistics startup in Bengaluru. I saw Razorpay has an opening for a Backend Engineer II (JR-4412). Would you be open to telling me what the team's actually looking for? Happy to keep it to five minutes.

What this does: establishes the connection in the first clause, states who you are in one line, names the specific role, and asks for information rather than a referral. Most people will answer a question about their own team. Very few will vouch for a stranger.

### Message two — after they reply

They have now invested a small amount in you. Reply with something that demonstrates you are worth the second step, then ask:

> That's helpful, thanks — the reconciliation piece is close to what I've been doing. I've built the settlement matching for our COD flow, about 40k transactions a day, so I'd be coming in with that already. Would you be comfortable referring me for it? Completely fine if you'd rather not, given we haven't worked together — happy to just apply through the portal.

Two things matter here. The evidence comes before the ask. And you name the objection yourself and release them from it, which — counterintuitively — makes people considerably more likely to agree, because it signals that you understand what you are asking for.

### Message three — making it effortless

If they say yes, send everything in one message so the referral takes them ninety seconds:

> Thanks, really appreciate it. Everything in one place:
> Role: Backend Engineer II, JR-4412, Bengaluru
> Resume: [link]
> One line if they ask: "Backend dev, 3 yrs, built payment reconciliation at scale — knows the exact problem this team is hiring for."
> My email: […] | Phone: […]

The one-line summary is the piece people forget. Your referrer will be asked "how do you know them / why this person" by a form field or a recruiter, and if you have written it for them they will use it.

Then: **follow up once, after a week, and once after the process ends** — to thank them, whatever the outcome. That second one costs you nothing and is why some people have a network and others do not.

## What to do when they say no, or say nothing

Most will say nothing. That is the base rate, not a verdict on you — assume a response rate somewhere around one in four for alumni and rather lower for strangers, and send accordingly. Ten well-written messages to a company you want is a reasonable afternoon's work.

If someone declines, accept it in one line and do not argue. "Completely understood — thanks for reading." People remember graciousness, and a no this month is sometimes a yes next quarter when a role opens on their own team.

If nobody at a company will refer you, apply through the portal anyway. A cold application with a good resume still works; it just works less often. And a referral is a distribution advantage, not a substitute for the underlying case — the resume and the interviews still have to hold up.

## The things that get you blocked

-   **Mass-sending the same message.** Visible immediately, and the Indian tech community on LinkedIn is small enough that it circulates.
-   **Asking for a referral to "any role".** It converts a specific favour into an open-ended obligation.
-   **Sending a resume as an unrequested attachment in the first message.** A link is fine; a 2 MB PDF from a stranger is not.
-   **Following up more than twice.** The third message is the one that gets you remembered for the wrong reason.
-   **Asking someone to refer you after they have said no.** Once is a request. Twice is pressure.
-   **Paying for a referral.** There is a small market in this and it is worth avoiding entirely — it is against most companies' policies, it gets the referrer fired, and the same channels overlap heavily with the scams described in [how to spot a fake job posting](/blog/spot-a-fake-job-posting).

## Building the thing you wish you already had

The uncomfortable truth is that a referral network is easiest to build before you need it, and most people start when they need it. Two habits, if you want next year's search to be easier than this one:

**Stay in touch with people you worked with, minimally.** A message when they change jobs. A reply when they post something. Twice a year is enough to make a request later feel like a continuation rather than an approach.

**Be findable and be useful in one community.** Answer questions in a group for your field, contribute to something open source, write up a problem you solved. Not for a brand — so that when you send a message, the recipient can click through and see a person rather than a blank profile. The profile side of this is in [LinkedIn for the Indian job market](/blog/linkedin-for-indian-job-seekers).

And refer people yourself, once you can. It is the only part of this system that scales, and it is why the alumni route works at all.

Meanwhile, the applications still have to go out. [Current openings are here](/jobs) — find the role first, then find the person. That order matters: the specific role is what makes the request answerable.$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    9,
    array['Job Search', 'Referrals', 'Networking', 'LinkedIn'],
    array['linkedin-for-indian-job-seekers', 'first-job-without-experience', 'how-long-a-job-search-takes'],
    'published',
    '2026-08-23'::timestamptz,
    null
  ),
  (
    'resume-with-a-career-gap',
    'Writing a Resume With a Career Gap, a Break or Three Short Stints',
    'Gaps are common and rarely the reason someone is rejected. Hiding them is. How to format a break, explain it in one line, and handle the interview question.',
    'A two-year break for caregiving, a layoff, exam preparation, a startup that folded — none of these end a career. What ends processes is a date range that does not add up. The formats that work, the one-line explanation, and what background verification actually checks.',
    'resume',
    $md$Career gaps are far more common than the anxiety around them suggests. Layoffs, caregiving, health, exam preparation, a company that shut down, a relocation, a startup that did not work, a deliberate break — in any given hiring pipeline, a meaningful share of candidates have one.

What actually costs people interviews is almost never the gap. It is the attempt to conceal it, which produces a resume with unexplained date jumps, or years-only dates that read as evasion, and an interview where a straightforward question turns into a defensive answer.

The gap is a fact. Facts are manageable. What is not manageable is the impression that you are hiding something, because a reader who suspects that stops evaluating your work and starts auditing your timeline.

## First, be accurate

Do not remove dates. Do not switch to years-only to blur a nine-month gap — recruiters read "2022 – 2024" as "there is something in here", and they are usually right. Do not extend an employment end date to close a gap: your exit date is on your relieving letter, your Form 16 and your PF record, and it is checked in background verification for essentially every salaried role in India. Getting caught on that is a withdrawn offer, sometimes after joining.

Accuracy is not merely ethical here. It is strategically better, because a stated gap is a one-line item and a discovered discrepancy is a disqualification.

## Formats that work

### The short gap — under about four months

Do nothing. Notice periods, joining dates and job searches routinely produce three-month gaps and nobody blinks. If you are using month-year dates, it will barely register.

### The explained gap — the default approach

Put it in the timeline as an entry, with a one-line neutral description. It occupies the space, it answers the question, and it stops the reader wondering:

> **Career break — family caregiving** | Mar 2024 – Aug 2025
> Full-time carer following a parent's illness. Maintained skills through an AWS Solutions Architect certification (Jan 2025).

> **Career break — planned** | Jun 2023 – Feb 2024
> Relocated to Hyderabad for family reasons; searched selectively for roles matching my analytics background.

Two features do the work. It is stated without apology, and it is a single line. Length signals discomfort — a paragraph explaining a gap makes it look larger than it is.

### The gap with something in it

If you did anything at all — freelance work, a certification, a family business, a serious course, volunteering, contract work — that goes in as its own entry rather than as a footnote:

> **Freelance — bookkeeping and GST filing** | Apr 2024 – Present
> Three small clients in Mysuru; monthly books, GSTR-1 and 3B filings, and one migration from manual records to Zoho Books.

This is real work. Freelance and contract work belong in the experience section on equal footing, labelled honestly as freelance so nobody feels misled later.

If you did nothing professional during the break — which is entirely legitimate, particularly for health or caregiving — do not invent something. "Career break — health" with a return date is a complete answer.

### The functional resume, and why not to use it

Advice circulating online suggests a skills-based resume that omits the chronology. Do not. Recruiters know exactly what it is for, and it reads as concealment. Also, most parsing systems handle it badly, so you compound a credibility problem with a technical one. Chronological, with the gap stated.

## Wording, by situation

The right register throughout is flat and factual. Adjectives make it worse.

**Layoff or company closure.** The easiest to explain and the one people over-explain. It is not a performance event and it is treated as such:

> Role eliminated when the India engineering centre was wound down (Nov 2024, ~120 roles).

**Health.** You are not obliged to give a diagnosis, and should not. What matters to an employer is that it is resolved:

> Break for a medical matter, now fully resolved. Available immediately.

**Caregiving.** Extremely common, particularly for women returning to work, and increasingly well understood by Indian employers — several large companies run explicit returnship programmes. State it plainly and do not apologise for it.

**Exam preparation.** UPSC, CAT, GATE, CA — a very common Indian gap and one interviewers understand instantly:

> Prepared full-time for UPSC CSE (2023–2025); cleared prelims 2024. Now returning to a technology career.

Say clearly that you have stopped. The unspoken concern is that you will resume preparing and leave, so address it directly rather than waiting to be asked.

**A startup that failed.** Your own venture is experience, not a gap. Write it as a role, with what you actually did and what you learnt, and be prepared to state why you are returning to employment and that you intend to stay.

**A long search.** If you have been looking for a year, that is difficult to write as a positive, and the honest framing is usually best in the interview rather than on paper. On the resume, put the certification or the freelance work you did during it, which most people in a long search do have.

## Three short stints

A different problem from a gap and it worries interviewers slightly more, because it predicts behaviour rather than describing circumstance.

One three-month role is noise; leave it in with dates and move on. Two or three in succession invites the question, so pre-empt it on the page in four words:

> **Business Analyst** — Fintech startup (contract, 4-month scope) | Jan – Apr 2025

> **Operations Executive** — Retail chain | Jun – Sep 2024 *(role closed during restructuring)*

If your last three roles were genuinely short for genuinely different reasons, say so in the interview in one compressed sentence — one was a contract, one shut down, one you left because the role was misrepresented — and then stop talking. The instinct to keep explaining is what makes it sound like a pattern.

What to actually avoid: leaving out a short stint entirely. It shows up in PF records and in background verification, and an omission is treated far more harshly than the stint would have been.

## The interview question

It will be asked, usually in the HR round, usually as "I see there's a gap here — could you tell me about that?" It is a risk check, not an interrogation. The structure that works is three short beats:

1.  **What it was**, in one sentence, without apology.
2.  **That it is over**, explicitly.
3.  **Why you are ready now**, pointing forward.

> I took eighteen months out from mid-2024 — my mother had a stroke and I was the only one in the city. She's stable and has a full-time carer now, so I've been applying since February. I kept my AWS certification current during it and did a couple of freelance migrations, so I'm not coming back cold.

Twenty seconds. Complete. The interviewer's next question is about your work.

What weakens it: apologising, over-explaining, volunteering medical detail, or blaming a previous employer at length. Also being vague — "personal reasons" said in an uncomfortable tone invites more questions than a plain fact does. If you genuinely do not want to discuss it, one neutral sentence and a clear pivot works: "It was a personal matter that's fully resolved — happy to talk about anything on the work side."

The rest of that round, question by question, is in [the HR round](/blog/hr-round-questions).

## Coming back after a long break

If the break was over a year, two things reduce the friction considerably.

**Produce something current.** A certification with an exam, a small project, a short contract engagement, a freelance client. It does not need to be impressive. It needs to be dated recently, because the concern being managed is currency, not capability.

**Target the right routes.** Cold portal applications are the weakest channel for a returning candidate, because a screening filter reads the date on your last role and stops. Referrals, returnship programmes at large companies, contract-to-hire roles, and smaller companies where a human reads every application all work considerably better. The mechanics of the first of those are in [how to get a referral when you do not know anyone](/blog/referrals-without-a-network).

Expect it to take longer than a search from inside a job, and be a little more willing to take a shorter-term or contract role as a re-entry point — a six-month contract that ends with a current employer on your resume solves the actual problem.

## What background verification checks

Worth knowing, because it determines what you can and cannot leave ambiguous. A standard Indian BGV covers employment dates and titles with previous employers, education credentials, and often address and criminal record. Increasingly it includes a PF or UAN check, which lays out your employment history as a matter of record.

So: dates must be right, titles must be right, and any role you held will be visible. Within those constraints there is a great deal of room to present a gap well — and no room at all to pretend it did not happen.

The rest of the document still has to do its job. Format, bullets and the sections worth deleting are in [how to write a resume that actually gets shortlisted](/blog/resume-that-gets-shortlisted), and the search mechanics in [ATS keyword matching](/blog/ats-keywords-for-indian-roles).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    10,
    array['Resume', 'Career Break', 'Career Gap', 'Return to Work'],
    array['resume-that-gets-shortlisted', 'hr-round-questions', 'changing-careers-without-starting-over'],
    'published',
    '2026-08-25'::timestamptz,
    null
  ),
  (
    'questions-to-ask-the-interviewer',
    'What to Ask the Interviewer, and What Their Answer Tells You',
    'The last five minutes of an interview are the only part you control. Questions that tell you whether to take the job — and what a bad answer sounds like.',
    'Saying "no, I think you have covered everything" wastes the one segment of the interview that is yours. Twenty questions worth asking, sorted by who to ask them of, and how to read the answers you get back.',
    'interviews',
    $md$"Do you have any questions for us?" is the last five minutes of nearly every interview, and it is the only part of the process where you are the one gathering information.

Most candidates waste it. Some say no. Some ask about working hours and leave policy, which is fair but tells them nothing they could not read in the handbook. And some ask a question they found on a list, which the interviewer has heard nine times this month and recognises immediately.

The segment does two things at once. It signals what you care about — a candidate who asks how the team decides what to build is understood differently from one who asks about the appraisal cycle. And more importantly, it is how you find out whether you actually want the job, at the only moment when someone is obliged to answer you.

## Ask the right person

The single most common mistake is asking everyone the same three questions. Each interviewer knows different things, and asking outside their knowledge produces a vague answer that helps nobody.

**The recruiter** knows process, band, timeline, and how the role came to exist. Not the technical detail.

**The hiring manager** knows the work, the team, the expectations and the problems. This is the highest-value conversation you will have, and most candidates under-use it.

**Peer interviewers** know what it is actually like — the day-to-day, the tooling, the meetings, whether the stated process is the real process. They are also the most candid, because they are not selling.

**Senior leadership**, if you meet them, knows direction and priorities. Ask about the business, not the team.

## Questions for the hiring manager

These are the ones worth the time.

**"What does the first ninety days look like for whoever takes this role?"**
A good answer is concrete — a specific thing to learn, a specific thing to ship. A vague one ("get up to speed, meet the team") frequently means the role is not clearly defined yet, which is a real and common problem.

**"Why is this position open?"**
Growth, backfill, or a new function. All three are fine; the useful part is the follow-up. If it is a backfill: *what did the previous person go on to do?* An internal move is a good sign. A quick exit that the manager is uncomfortable discussing is worth noticing.

**"What is the hardest part of this job — the thing that makes it not straightforward?"**
The best question on this list. Every role has one. A manager who names it honestly is someone you can work for. A manager who says there isn't one either does not know the role or is selling, and both are informative.

**"How is success measured for this role at six months and at a year?"**
If there is no answer, there is no clear expectation — which sounds like freedom and usually turns into a performance conversation about criteria nobody stated.

**"How does the team decide what to work on?"**
Tells you where the role sits: executing a defined roadmap, or shaping one. Neither is wrong, but a candidate expecting the second and getting the first is a resignation in eighteen months.

**"What is your management style — how often do we speak, and how do you like to hear about problems?"**
Practical, appropriate, and answered honestly more often than you would expect.

**"What happened to the last person who was promoted out of this team?"**
Slightly pointed, and worth asking anyway. If nobody has been, that is a fact about the team's growth ceiling.

## Questions for peer interviewers

**"What does a normal week look like — how much of it is meetings?"**
Concrete and hard to spin.

**"What is the thing that most frustrates you about working here?"**
Ask this. Almost everyone answers honestly, because it is a relief to. What matters is not whether they have a complaint — everyone does — but whether it is something you can live with. "The build takes twenty minutes" is different from "you can't tell who decides anything".

**"How long have you been here, and what has kept you?"**
Two useful signals in one question.

**"What is the on-call or crunch situation, realistically?"**
Ask a peer, not a manager. And ask about the last incident, not the policy.

**"How does code review / handover / approval actually work here?"**
Substitute your function's equivalent. You are asking whether the process is real.

## Questions for the recruiter

**"What is the budgeted range for this role?"**
Ask early rather than late. Most Indian recruiters have a band and will share it, because a mismatch wastes their time too. The rest of that conversation is in [how to negotiate salary in India](/blog/negotiate-salary-in-india).

**"What do the remaining rounds look like, and what does each one cover?"**
Lets you prepare for the correct format, which matters more than most preparation. See [preparing for a technical interview](/blog/technical-interview-preparation).

**"What is the fixed-versus-variable split, and how did variable pay out last year?"**
The single most useful compensation question, and the answer is often revealing. Detail in [variable pay and joining bonuses](/blog/variable-pay-and-joining-bonus).

**"What is the timeline for a decision?"**
Sets expectations and gives you a legitimate reason to follow up.

**"What is the policy on remote and hybrid — and has it changed recently?"**
The second half is the real question. Policies have been moving in one direction for three years, and "three days in office" agreed verbally is worth less than the same in the offer letter.

## Questions about the company

Worth one or two, and only if you have done the reading. A question that reveals you have not looked at the product is worse than no question.

**"What is the biggest change in the business over the last year?"**
**"Who do you lose deals to most often?"** — for a commercial role, an excellent question.
**"How is this team funded — is it a cost centre or attached to revenue?"** — unglamorous and genuinely predictive of headcount stability.

## What their answers tell you

The content matters less than three other things.

**Whether they can answer at all.** Vagueness on scope, success criteria or why the role is open is the most reliable warning sign available to you. It usually means the role has not been thought through, and the cost of that lands on whoever joins.

**Whether the answers are consistent across interviewers.** Ask two people what the team's priority is this quarter. Matching answers indicate a functioning team. Three different answers indicate something you will inherit.

**How they respond to a slightly uncomfortable question.** "What's the hardest part of this job" is mildly awkward and completely fair. A manager who engages with it is showing you how disagreement will go later. One who deflects is showing you that too.

Specific things worth treating as warnings: describing the team as "a family" and then not being able to describe a boundary; unprompted emphasis on how hard everyone works; talking about the previous occupant of the role with visible irritation; being unable to name a single thing that is difficult.

## The ones to skip

-   **Anything answered on the careers page.** It reads as not having looked.
-   **Leave, holidays and perks in the first round.** Legitimate questions, wrong timing. Ask the recruiter once an offer is close.
-   **"What is the company culture like?"** Too broad to produce a real answer. Ask a specific behavioural question instead — how disagreements get resolved, what happens when a deadline is going to be missed.
-   **"Do you have any concerns about my candidacy?"** Popular advice, and it puts the interviewer in an awkward position at the worst moment. If you want feedback, ask the recruiter afterwards.
-   **Six questions when there are four minutes.** Two or three good ones, then stop.

## How to actually do it

Write four questions down before the interview and bring them on paper or in a notebook. Nobody has ever thought less of a candidate for referring to notes; several interviewers have thought more.

Cross off any that were already answered during the conversation — and say so: "I had a question about how the team prioritises, but you covered that when you described the quarterly planning." That is a better signal than asking it anyway.

Then listen to the answer properly and ask one follow-up. The follow-up is the part that makes it a conversation rather than a checklist, and it is where the useful information lives.

The rest of the round — what is being assessed and how the standard questions are read — is in [the HR round, question by question](/blog/hr-round-questions).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    9,
    array['Interviews', 'Questions', 'Hiring Manager', 'Job Search'],
    array['hr-round-questions', 'interview-preparation-that-works', 'technical-interview-preparation'],
    'published',
    '2026-08-26'::timestamptz,
    null
  ),
  (
    'counter-offer-decision',
    'Your Employer Made a Counter-Offer. Now What?',
    'A counter-offer solves your employer''s problem immediately and yours temporarily. How to evaluate one honestly, and the cases where accepting is right.',
    'The standard advice is to never accept a counter-offer, which is too simple. What a counter-offer actually is from the company''s side, the four questions that separate a real one from a retention patch, and how to decline without damage.',
    'salary',
    $md$You resign. Within a day or two your manager asks for a conversation, and by the end of the week there is a number on the table that is higher than the one you were about to leave for. Possibly a title. Possibly a promise about the project you complained about.

The internet's advice is that you should never accept a counter-offer. That is too simple, and the reasoning behind it is usually a statistic of dubious provenance about how everyone who accepts leaves within six months anyway.

The better way to think about it: a counter-offer is your employer solving *their* problem — an unplanned vacancy, a delivery at risk, a replacement that costs three months and a hiring premium. Whether it also solves yours is a separate question, and it depends almost entirely on why you were leaving.

## Start with why you were actually leaving

Write it down before the conversation, because the counter-offer will reframe it for you if you do not.

**If you were leaving purely for money** — you were underpaid relative to market, the work was fine, the manager was fine — then a counter-offer that closes the gap genuinely addresses the reason. This is the case where accepting can be correct, and it is more common than the standard advice admits.

**If you were leaving for anything else** — the work, the manager, the growth ceiling, the commute, the on-call load, the fact that the interesting projects consistently go elsewhere — then money does not fix it. You will have the same job in three months at a higher salary, and the thing that made you open a job portal in the first place will still be there.

The uncomfortable version of this test: if your employer had offered this exact package six months ago, unprompted, would you have started looking at all? If yes, the counter-offer is on point. If no, it is treating the wrong condition.

## What a counter-offer costs you, and what it does not

Some of the standard warnings are real and some are folklore.

**Real:**

-   **You have revealed that you were looking.** In many teams this changes how you are seen in a way that does not reverse — quietly, in stretch-assignment decisions and in who gets told about reorganisations early.
-   **Retention money is often borrowed from your next increment.** A common pattern: a large out-of-cycle raise now, then a below-average appraisal increase for two cycles. Net over three years, considerably less than it looked.
-   **You burn the other offer, and usually the relationship with that company.** Declining after accepting is remembered, particularly at smaller companies and with recruiters who will place you again later.
-   **The original problem is still there** if the original problem was not money.

**Folklore:**

-   *"They will fire you as soon as they find a replacement."* This does happen and it is not the norm. Most Indian employers are not running a revenge plan; they are running short-staffed.
-   *"You will be first on the layoff list."* Sometimes, at a company already looking for candidates. Not a general rule.
-   *"Everyone who accepts leaves in six months."* Directionally true — many do, because most counter-offers address money when money was not the issue — but it is a consequence of the mismatch, not a law.

## The four questions that separate a real offer from a patch

If you are seriously considering staying, get these answered before you decide, and in writing where possible.

**1. Is this a permanent revision or a one-time payment?**
A retention bonus paid in six months with a clawback is not a raise. A revised annual CTC with a letter is. They are frequently presented in similar language.

**2. What happens to my next appraisal?**
Ask directly: *is this in addition to the normal cycle, or in place of it?* A manager who cannot say is telling you it will come out of it.

**3. If the reason I am leaving is the work, what specifically changes and by when?**
Not "we'll find you something more interesting". A named project, a named date, a named scope. If it is a title change, ask when it takes effect on paper and whether it changes your band — a title with no band change is frequently free for the company and worth little to you.

**4. Why did this require me to resign?**
Ask it, politely and once. The answer is genuinely informative. "You're right, we should have done this at the last cycle and I argued for it" is a different company from "budgets only open in these situations". The second one is telling you that the only mechanism for getting paid properly there is to threaten to leave, which is a mechanism you can use exactly once more.

## When accepting is the right call

It happens, and it is worth naming the cases:

-   **The gap was purely pay**, the revision is permanent, and it lands you at or near market for your role. Verify that last part independently rather than taking their word for it.
-   **The new offer had real problems** you were tolerating for the raise — an unstable company, a much longer commute, a stack you did not want, a probation clause you disliked — and the counter removes the reason to accept those.
-   **You genuinely like the job**, and the counter-offer comes with a specific, dated change to the thing that was wrong.
-   **Personal circumstances make stability worth a lot right now** — a loan, a visa dependency, a family situation, a health matter. This is a legitimate reason and it does not need justifying to anyone.

If you accept, do two things. Get the revision in writing, on letterhead, before you withdraw from the other process. And set yourself a review date six months out, with a note about what was promised — because the most common failure mode is not betrayal, it is quiet drift.

## When declining is the right call

-   The reason you were leaving was the work, the manager, or the ceiling.
-   The money is a one-time payment or comes with a clawback.
-   Nothing changes about the role, and the promise is "we'll look at it".
-   You have already mentally left. This is not a soft signal; it is usually the accurate one.

## How to decline without damage

You may want this employer as a reference, and the industry is small. The way to do it is short, warm and final:

> Thank you for putting that together — I know it took some doing, and it means a lot that you did. I've thought about it properly and I'm going to go ahead with the move. It isn't about the number; it's the kind of work I want to be doing for the next few years, and that's the difference. I'd like to leave this in good shape — happy to write up handover notes and be available for questions after I go.

Do not negotiate against the counter-offer. Do not use it to extract more from the new employer either — going back to a company that has already issued an offer to ask for more, on the strength of a counter, sours a relationship you are about to depend on. It occasionally works and it starts the job badly.

Then serve the notice properly. The exit mechanics — buyouts, what a relieving letter is for, the documents to collect before your last day — are in [notice periods and relieving letters](/blog/notice-period-and-relieving-letter).

## The version of this that avoids the whole situation

Counter-offers are, structurally, a symptom of a compensation conversation that did not happen at the right time. The way to not be here is to have the conversation before you interview: an explicit discussion with your manager about where your pay sits relative to market, with a specific ask and a timeline, six months before you would otherwise start looking.

Plenty of the time that conversation produces nothing, and then you interview with a clear conscience and no ambiguity about why. But it produces something often enough to be worth the discomfort, and it is a much better position to negotiate from than a resignation letter — which is leverage you can only spend once, and which costs you something whichever way it goes.

If you are in the middle of comparing offers, the components that actually decide which is better are in [variable pay, joining bonuses and retention clauses](/blog/variable-pay-and-joining-bonus) and [CTC vs in-hand salary](/blog/ctc-vs-in-hand-salary).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    9,
    array['Salary', 'Counter Offer', 'Resignation', 'Negotiation'],
    array['negotiate-salary-in-india', 'notice-period-and-relieving-letter', 'variable-pay-and-joining-bonus'],
    'published',
    '2026-08-28'::timestamptz,
    null
  ),
  (
    'probation-period-in-india',
    'What Probation Actually Means in India',
    'Probation does not suspend your rights. What an employer can and cannot do during it, what confirmation depends on, and what to do if it is extended.',
    'Salary, PF, notice and statutory leave apply from day one — probation changes almost none of that. What it genuinely changes, why confirmation letters go missing, and how to handle an extension or a termination during the period.',
    'workplace',
    $md$Almost every private-sector offer letter in India contains a probation clause — typically three or six months — and almost nobody reads it properly until something goes wrong.

The general belief is that during probation you have no rights, can be dismissed instantly, and should keep your head down. That is wrong in most of its particulars, and the confusion costs people money and leverage at exactly the moment they are least confident.

*The usual caveat: employment terms in India are governed by your contract plus state-specific Shops and Establishments legislation, and the details vary. This is the general shape. For a dispute that matters, read your own contract and take proper advice.*

## What probation is

A defined initial period during which the employer assesses whether to confirm you in the role. That is genuinely all it is. It is a contractual arrangement, not a separate legal category of employment — you are an employee from your date of joining.

Typical lengths: three months at startups and product companies, six months more broadly, up to a year in some manufacturing, banking and public-sector-adjacent roles. Six months is the most common.

## What does not change during probation

This is the part most people get wrong, and it is worth being precise about.

**Your salary is payable in full.** There is no legal concept of reduced pay during probation unless your own contract states a different probation salary — which is uncommon in white-collar roles and should be a serious question at offer stage if it appears.

**PF applies from day one.** Provident fund contributions are due from your first month of employment; there is no probation exemption. If your payslip shows no PF deduction "because you're on probation", that is not a rule, and it is worth raising immediately. What PF is actually doing with that money is in [PF, gratuity and HRA explained](/blog/pf-gratuity-hra-explained).

**ESI applies from day one** if your wages are within the coverage threshold.

**Statutory leave accrues.** Earned leave accrual under state Shops and Establishments rules is not conditional on confirmation, though many employers restrict when it can be *taken* during probation — which is a policy about usage, not about entitlement. Read the difference carefully in your handbook.

**Maternity benefit** under the Maternity Benefit Act is not conditional on confirmation, subject to the qualifying service conditions in the Act itself.

**Your gratuity clock starts at joining**, not at confirmation. Since gratuity requires five years, this occasionally matters.

**You are an employee for tax and TDS purposes.** If a company puts you on "probation" and pays you as a consultant against an invoice with TDS under 194J, that is not probation — that is a contractor arrangement dressed as employment, and it means no PF, no gratuity, and no statutory protections. This is worth catching before you sign.

## What probation genuinely changes

**Notice period, in both directions.** Almost always shorter — commonly seven to thirty days during probation against sixty or ninety after confirmation. This cuts both ways and is the single most practically significant difference.

**The confirmation decision itself.** The employer may end the arrangement at the close of probation without the process a confirmed termination would involve, subject to the notice in your contract.

**Access to some benefits.** Insurance enrolment, tuition reimbursement, internal transfer eligibility, and sometimes variable pay eligibility are often gated on confirmation. These are policy choices, and legitimate ones.

**Loan and visa paperwork.** Banks and consulates frequently ask for a confirmation letter. This is the most common practical reason people discover their confirmation letter was never issued.

## Termination during probation

An employer can end employment during probation with the notice specified in your contract, or with pay in lieu of it. What they cannot do:

-   **Dismiss you without the contractual notice or pay in lieu**, unless the contract genuinely provides for immediate termination and the circumstances match it.
-   **Withhold salary already earned.** Wages for days worked are payable regardless of how the employment ended, and delayed payment of wages has its own statutory remedies.
-   **Terminate for a discriminatory or otherwise unlawful reason.** Probation is not a shield for that.
-   **Refuse to state that you worked there.** More on the paperwork below.

If you are dismissed during probation, ask for three things in writing, calmly and immediately: the termination letter stating the last working day, settlement of wages and any accrued leave, and an experience or service letter confirming your dates and title. You will need the last one for background verification in your next job — see [notice periods and relieving letters](/blog/notice-period-and-relieving-letter) for what those documents actually do.

A short stint ended by the employer is not fatal to a resume, and it is far better handled openly than hidden. How to write it is in [writing a resume with a career gap](/blog/resume-with-a-career-gap).

## Extension of probation

Legal, common, and frequently mishandled by the employer rather than the employee.

If your probation is extended, ask for two things:

1.  **The extension in writing**, with a new end date. An extension that exists only as a verbal remark leaves you in an indefinite state, which is the worst version of this.
2.  **Specific criteria.** What, exactly, needs to be different at the end of the extension. If nobody can name it, the extension is usually about something other than your performance — a headcount freeze, a budget approval, a manager who has not done the paperwork.

That second scenario is more common than people assume, and it is worth identifying, because it means the thing you are anxious about is not a performance problem at all.

An extension beyond a total that looks unusual for your industry — say, past a year — is worth a direct conversation. So is a company that routinely does not confirm anyone, which happens and which you can detect by asking a colleague when they were confirmed.

## Confirmation, and the letter people forget to ask for

Many employees are never issued a confirmation letter. In a fair number of companies, confirmation simply happens by the fact of continued employment and nobody generates the document.

That is usually fine and occasionally a problem — banks processing home loans, consulates processing visas, and some background verification vendors ask for it specifically.

So: **when your probation ends, email HR and ask for the confirmation letter.** One line, no drama. If they say confirmation is automatic and no letter exists, ask them to confirm that in the email reply. That reply is your document.

Also worth checking at confirmation, because things change and nobody tells you: your notice period (it has just got longer), your revised CTC if the offer specified a post-confirmation increase, and your eligibility date for variable pay.

## Resigning during probation

You can. The notice is whatever your contract says for probation — commonly short — and that is the whole obligation.

Two practical points. Serve the stated notice properly even if it is only a week; a company that will not issue a relieving letter because you left abruptly can create real friction in your next background check. And do not skip the paperwork on the way out just because the stint was short: get the relieving or experience letter and the full and final settlement, because a two-month role with no documentation is harder to explain later than a two-month role with a clean exit.

If you are resigning during probation because the job was materially misrepresented — a different role, a different location, a different salary structure than the offer letter said — say so plainly in the resignation and keep the offer letter. That is a documented fact rather than a job-hopping pattern, and it reads very differently in your next interview.

## What to do in your first week, regardless

Small, unglamorous, and it prevents most of the problems above:

-   **Read the probation clause in your own offer letter.** Length, notice during probation, and what confirmation is stated to depend on.
-   **Check your first payslip** for PF, and that the structure matches the offer.
-   **Register or link your UAN** so contributions land in one account and your service stays continuous.
-   **Save a PDF of your offer letter and employment agreement** somewhere that is not your work laptop.

That is twenty minutes, and it is the difference between having a document when you need it and reconstructing what was agreed from memory.

The other side of this — what to check before you sign at all — is in [variable pay, joining bonuses and retention clauses](/blog/variable-pay-and-joining-bonus). And if you are still deciding between offers, [current openings are here](/jobs).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    9,
    array['Workplace', 'Probation', 'Employment Rights', 'Offer Letter'],
    array['notice-period-and-relieving-letter', 'variable-pay-and-joining-bonus', 'resume-with-a-career-gap'],
    'published',
    '2026-08-29'::timestamptz,
    null
  ),
  (
    'how-long-a-job-search-takes',
    'How Long a Job Search Actually Takes, and What to Do in the Meantime',
    'Realistic timelines by experience level, the arithmetic behind response rates, and how to tell a slow search from a broken one.',
    'Most people underestimate a job search by half and then conclude something is wrong with them. What the funnel really looks like, how many applications produce one offer, the three checkpoints that tell you what to change, and how to keep the search survivable.',
    'job-search',
    $md$The most damaging thing about a job search is not the rejections. It is the absence of a baseline — no way to tell whether four weeks of silence is normal or a sign that something is wrong. In that vacuum most people conclude the problem is them, stop applying at the rate they were, and make the search longer.

So: some arithmetic, and three checkpoints that tell you what to actually change.

## Realistic timelines

Broad ranges, for the Indian market, from starting to apply seriously to holding an offer:

| Situation | Typical range |
|---|---|
| Fresher, non-campus | 3–6 months |
| 1–3 years, in-demand skills | 1–2 months |
| 3–8 years, in-demand skills | 1.5–3 months |
| 8+ years / leadership | 3–6 months |
| Career changer | 6–9 months |
| Returning after a long break | 3–6 months |
| Niche function, few employers | Unbounded — depends on openings existing |

Two adjustments. Searching while employed is slower in elapsed time and easier in every other way. And the process itself — from first call to offer letter — runs two to six weeks at most Indian companies and considerably longer at large MNCs, banks and anywhere with a global approval chain. That is on top of the time spent finding the process to enter.

If you have been at it for three weeks and are anxious, you are inside the normal range and there is nothing to diagnose yet.

## The funnel, with numbers

Rough orders of magnitude for a mid-level candidate with a reasonable resume applying to reasonably matched roles:

-   **100 applications** through portals →
-   **5 to 15 recruiter responses** →
-   **3 to 8 first-round interviews** →
-   **1 to 3 processes reaching final rounds** →
-   **1 offer**, sometimes.

That top-of-funnel conversion — around 5 to 15% — is the number that shocks people, and it is not a comment on your ability. It reflects roles already filled internally, postings left up after closing, consultancy listings that were never real, and hundreds of other applicants for the same URL.

Two things change these ratios more than anything else:

**Referrals.** A referred application converts at a dramatically higher rate — often one in three gets a conversation. This is why the same candidate can send 200 cold applications and 15 referral requests and get more interviews from the second. The mechanics are in [how to get a referral when you do not know anyone](/blog/referrals-without-a-network).

**Match quality.** Applying to 30 roles you genuinely fit outperforms 200 sent indiscriminately, because the interview time you save is the scarce resource, not the application time.

## What a week should look like

The failure mode of an unemployed search is doing it all day and burning out in three weeks; the failure mode of an employed search is doing it only when frustrated. Something structured beats both.

A workable week, roughly twelve to fifteen hours:

-   **10–15 applications**, matched, with the ten-minute tailoring pass from [ATS keyword matching](/blog/ats-keywords-for-indian-roles). Not 100 with no tailoring.
-   **5 referral or recruiter messages**, specific to a named role.
-   **One preparation block** — the format-specific work in [preparing for a technical interview](/blog/technical-interview-preparation), or your stories for the HR round.
-   **One skill block** — the project or certification that will still be true in three months.
-   **A record of every application** in a spreadsheet: company, role, date, source, status. Unglamorous and it is what makes the checkpoints below possible.

And a hard stop. A search conducted at every waking moment produces worse interviews, because you arrive at them exhausted and slightly desperate, and both are legible.

## The three checkpoints

This is the useful part. Each stage of the funnel fails for different reasons, and the fix is different.

### Checkpoint 1 — 30+ applications, no recruiter responses

The problem is upstream: the resume, the match, or the channel.

-   **Match.** Be honest about how many of those 30 you genuinely fit. Applying to roles requiring five years with two years of experience produces exactly this pattern.
-   **Resume.** Does it parse, and does it contain the words in the posting? Copy your PDF into a plain text editor and look at what comes out. [The resume guide](/blog/resume-that-gets-shortlisted) covers the content; [ATS keyword matching](/blog/ats-keywords-for-indian-roles) covers the search.
-   **Channel.** If everything went through one portal's Easy Apply, that is not a search, it is a lottery. Add referrals and direct company career pages.
-   **A second pair of eyes.** One person who has screened resumes, fifteen minutes. This surfaces things you cannot see in your own document.

### Checkpoint 2 — interviews happening, none progressing past the first round

The resume is working. Something in the room is not.

-   Which round are you losing? First technical, HR, or final? The pattern is the diagnosis.
-   **Losing the first technical round** usually means preparing for the wrong format, which is extremely common. Ask the recruiter what the rounds cover.
-   **Losing on "tell me about your work"** means you have not written out your own projects. This is the cheapest fix available and almost nobody does it.
-   **Losing at HR** after clearing technical rounds is usually the leaving-reason answer, the salary conversation, or notice-period friction. [The HR round, question by question](/blog/hr-round-questions).
-   **Ask for feedback.** Most companies give none, some give a sentence, and a sentence is enough to spot a pattern across four rejections.

### Checkpoint 3 — reaching final rounds, no offers

The most frustrating position and usually the closest to done. Common causes, in order:

-   **Compensation mismatch** discovered late, because nobody discussed the band early. Fix by asking for the range in the first call.
-   **You were the second candidate.** Genuinely common at this stage and not a defect — it means your profile is right and you need more processes running in parallel, not a different profile.
-   **Notice period.** A ninety-day notice against a role that needs someone in four weeks loses to a candidate on thirty days. Know your buyout position before it comes up: [notice periods and relieving letters](/blog/notice-period-and-relieving-letter).
-   **Something in the final conversation.** Often the questions you asked, or did not. [What to ask the interviewer](/blog/questions-to-ask-the-interviewer).

At this checkpoint the answer is usually volume rather than change. Three final-round processes running simultaneously produces an offer far more reliably than one at a time, and it also produces a better one.

## Seasonality, which is real in India

Not decisive, but worth knowing. Hiring generally picks up from January through March as new budgets open, is reasonable through the middle of the year, dips around the appraisal cycle in April–June at companies that freeze external hiring during it, and slows in late December. Campus hiring runs to its own calendar entirely.

None of this should stop you applying in a slow month. It should stop you concluding from three quiet weeks in December that your resume is broken.

## Keeping it survivable

The practical points that people who came through a long search mention afterwards:

**Track everything.** The spreadsheet is what turns "nothing is working" into "I have had 40 applications and 2 responses, so the problem is upstream". Anxiety cannot be argued with; a funnel can be diagnosed.

**Keep one thing that is not the search.** Something with visible progress — a project, a certification, teaching someone, a physical routine. A search gives you no feedback for weeks at a time and that is corrosive without a counterweight.

**Do not tell everyone and then avoid everyone.** The narrowest version of this — telling six people you trust, specifically, what you are looking for — is also the most useful, because that is where referrals come from.

**Set a floor, not a target.** "Ten applications a week" is achievable on a bad week. "An offer by October" is not something you control, and missing it feels like failure when it may simply be the market.

**Take the interview even when you are not sure.** Interviewing is a skill that decays, and a process you do not particularly want is the cheapest place to practise the salary conversation.

And if the search runs long enough that money becomes the constraint, a contract or short-term role is a legitimate move rather than a defeat — it restores a current employer on your resume, which measurably changes how the next set of applications are read.

[Current openings are here](/jobs), including [fresher roles](/jobs?experienceLevel=fresher) and [remote positions](/jobs?jobTypes=remote).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    10,
    array['Job Search', 'Timelines', 'Applications', 'Planning'],
    array['referrals-without-a-network', 'ats-keywords-for-indian-roles', 'first-job-without-experience'],
    'published',
    '2026-08-31'::timestamptz,
    null
  ),
  (
    'manager-or-individual-contributor',
    'Manager or Individual Contributor: Choosing at the Fork',
    'Around five to eight years in, most people are offered a management track. What each path actually involves, what it pays, and how to choose deliberately.',
    'The move into management is usually presented as a promotion rather than a change of profession, which is what it is. What a first-time manager actually does all day, whether the senior IC track really exists in India, and how to test the decision before committing.',
    'career-growth',
    $md$Somewhere around five to eight years in, most people in India are offered a team. It arrives as a promotion — more money, a title with "Lead" or "Manager" in it, recognition that you are good at your job — and it is usually accepted in about four days.

That framing hides the actual decision. Management is not a more senior version of your current work. It is a different job, with different daily activities, a different definition of success, and a different set of things that make it satisfying. Some excellent engineers, analysts and designers are miserable in it. Some are far better at it than they were at the craft. Very few can predict which they will be without looking closely.

## What actually changes

**Your output becomes other people's output.** You are no longer measured on what you produced. You are measured on what your team produced, which you influence indirectly, slowly, and through other people's decisions. For people who get their satisfaction from finishing things, this is the hardest adjustment and the one they are least warned about.

**Your calendar stops being yours.** One-to-ones, planning, reviews, hiring, cross-team coordination, escalations. A first-time Indian tech manager with a team of six typically has fifteen to twenty-five hours of meetings a week. The deep work you used to do in blocks now happens in fragments, or after hours, or not at all.

**Your feedback loop lengthens from days to quarters.** A shipped feature gives you a result on Friday. A hiring decision, a restructured process, a person you invested in — those tell you whether you were right in six months.

**You inherit problems that have no clean solution.** Two people who cannot work together. A rating cycle where you have five good performers and a curve that permits two top ratings. A layoff you did not decide and have to deliver. This is the part nobody previews, and it is a real part of the job.

**Your craft decays.** Slowly at first. Most managers who stay in the role for three years cannot return to hands-on work at their previous level without a period of catching up. Some accept this; some are blindsided by it.

## What you gain

Stated fairly, because the honest case for management is strong:

-   **Leverage.** A good manager makes six people meaningfully more effective, which is more impact than one person can produce directly.
-   **Scope.** Decisions about what gets built, and by whom, sit on this side of the line.
-   **A clear ladder.** In most Indian companies the management track has more rungs, more visible progression, and less ambiguity about how to advance.
-   **Building people.** For a certain kind of person this is genuinely the most satisfying work available, and it does not exist on the IC track.
-   **Transferability.** Management skills move between industries more easily than a specific technical stack does.

## The money, honestly

Two claims circulate and both are half true.

At the first rung — team lead or engineering manager against senior engineer — pay in the Indian market is broadly comparable, often within 10–20%, and at product companies the senior IC is sometimes ahead. Taking a first management role for the money is usually a mistake, because the money is not the difference.

Higher up, the picture diverges. At most Indian companies — particularly services companies, banks, manufacturing and traditional enterprises — the ceiling on the management track is considerably higher, and beyond a point the only route to senior compensation is headcount. At product companies, MNC captives and well-funded startups, a genuine senior IC track exists with staff and principal levels that pay at or above the equivalent manager.

Which category your company falls into is not a matter of what the career-ladder document says. It is a matter of who actually holds the senior IC titles today. Which brings us to the test.

## Does the senior IC track exist where you work?

Almost every company claims a dual ladder. Far fewer have one. Three questions settle it:

1.  **Name the people at your company two levels above you on the IC track.** If you cannot name any, the track is aspirational.
2.  **Are they in the rooms where decisions get made?** A principal engineer who is not consulted on direction has a title, not a track.
3.  **What did the last three promotions at that level require, and how long did they take** relative to the management-track equivalents?

If the answers are discouraging and you want to stay hands-on, the conclusion is not necessarily that you should take the management role. It may be that you should change companies. Product companies and captives are structurally better at this than services companies, and that is a real reason to move.

## Testing the decision before committing

You can get a surprisingly good preview without accepting anything.

**Mentor someone properly for two quarters.** Not answering questions — owning whether they improve. This isolates the core of management better than any other single experience.

**Run a project with three or four people on it.** You will do planning, coordination, and the uncomfortable conversation when someone is behind. Notice how you feel on Friday.

**Do the hiring work.** Screen resumes, run interviews, sit in the debrief. A large part of a manager's job is this, and people are startled by how much of it there is.

**Ask a manager you respect what their last week actually contained**, hour by hour. Not the good version — the real one. Most will tell you, and the answer is frequently clarifying in the direction of "I do not want this".

If those experiences leave you energised, that is real evidence. If they leave you counting the hours until you can get back to your own work, that is also real evidence, and it is worth more than a title.

## Choosing badly, and recovering

Two things worth saying plainly.

**Declining a management offer is not career-limiting at a company with a real IC track**, and it is at a company without one. Know which you are in before you decide, and if you decline, say what you do want instead — larger technical scope, architecture ownership, a specific problem — so it registers as ambition rather than reluctance.

**Going back is possible and it is not a demotion**, although it is often experienced as one. The people who make this move well tend to do it early, before their craft has decayed too far, and to be explicit about the reason: "I'm more useful and considerably happier building than coordinating." Companies that handle this badly exist; so do companies where it is routine.

If the return requires changing employers — which it sometimes does, because internal perception is stickier than internal policy — the framing is the same as any pivot. [Changing careers mid-level without starting over](/blog/changing-careers-without-starting-over) covers how to write and explain that move.

## The question that usually settles it

Not "do I want to be a manager", which is really a question about status and pay, but this:

**Would you rather be the person who solved the hard problem, or the person whose team solved it?**

Answer that honestly, in the language of what makes a good week for you, and the decision is usually already made. The people who thrive in management genuinely prefer the second answer — not out of selflessness, but because building the conditions for other people's work is the thing they find interesting.

There is no correct answer, only a correct fit. What is not defensible is drifting into management because it was offered and declining felt awkward, then spending four years in a job you never chose. That is the outcome worth avoiding, and thirty minutes of honest thought avoids it.

Whichever way you go, the skills that make the next step credible are the ones an employer can verify — which is a narrower set than most people assume. That is covered in [upskilling that employers actually verify](/blog/upskilling-that-employers-verify).$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    9,
    array['Career Growth', 'Management', 'Individual Contributor', 'Promotion'],
    array['changing-careers-without-starting-over', 'upskilling-that-employers-verify', 'negotiate-salary-in-india'],
    'published',
    '2026-09-01'::timestamptz,
    null
  ),
  (
    'upskilling-that-employers-verify',
    'Upskilling That Employers Actually Verify',
    'Most certificates are worth very little in a hiring decision. What does count, how each is checked, and how to choose one thing instead of six.',
    'Six online certificates rarely move a shortlist; one verified credential or one working artefact frequently does. How recruiters and interviewers actually test a claimed skill, which credentials carry weight in India, and a way to choose that survives contact with a busy year.',
    'career-growth',
    $md$There is an enormous amount of upskilling happening and remarkably little of it changing hiring outcomes. The gap is not effort. It is that most of what people do produces something an employer cannot verify, and unverifiable claims are quietly discounted by everyone who reads resumes.

Understanding how a claimed skill is actually checked is the whole of this problem.

## The three ways a skill gets verified

**1. A credential with a controlled exam.** AWS, Azure, Google Cloud, Oracle, Cisco, PMP, Tableau, CFA, NISM, CA. What makes these count is not the syllabus — it is that somebody sat an invigilated exam with a pass mark and a public verification link. The credential is a claim about you that a third party is willing to stand behind.

**2. An artefact somebody can open.** A repository, a deployed application, a published dashboard, a portfolio, a written case study, a package other people install. This is often stronger than a certificate, because it is evidence of the actual work rather than of knowledge about the work.

**3. Interview performance.** The ultimate arbiter, and the reason both of the above matter less than people hope. Every claimed skill is checked here eventually, and the check is not gentle.

Anything that does not produce one of these three is, from a hiring perspective, close to invisible. A course you watched, a book you read, a workshop you attended — all genuinely valuable for what you learnt and worth almost nothing as a signal, because there is no way for a stranger to distinguish it from the same claim made by someone who did not.

## What a completion certificate is and is not

Certificates from open-enrolment online courses — the kind issued for finishing a video series, with no proctored exam — are weak signals. A screening recruiter has seen the same ones on forty resumes this week, and knows that completion required attention rather than competence.

That is not an argument against taking the courses. It is an argument against expecting the certificate to do the work. Take the course, then produce something with it, and put the something on your resume.

The exception is where a specific employer or client explicitly requires a named course. Then it is a checkbox and it is worth exactly what the checkbox is worth.

## What carries weight in the Indian market

Roughly in descending order of how much a hiring manager will care:

**Cloud certifications with exams** — AWS Solutions Architect, Azure Administrator or the equivalent Google Cloud paths. Widely recognised, genuinely tested, and directly mapped to job requirements. Currently among the highest-return credentials available to an engineer.

**Vendor certifications for enterprise platforms** — SAP modules, Salesforce, ServiceNow, Oracle. In the specific market segments that use them, these are close to a hiring requirement, and salary differentials for certified people are real.

**Professional qualifications with standing** — CA, CS, CFA levels, FRM, actuarial papers, NISM certifications for financial services roles. Long, difficult, and treated as serious by everyone.

**Data and analytics tooling** — Tableau, Power BI, Databricks certifications. Moderate weight on their own; considerably more when attached to a dashboard someone can open.

**Kubernetes and adjacent infrastructure certifications** — CKA and its relatives are performance-based, which is precisely why they carry more weight than a multiple-choice equivalent.

**University-affiliated programmes** — the executive and diploma programmes run by IITs, IIMs and ISB through the online providers. Uneven in quality and the market knows it, but the brand still opens doors, particularly for a career change into management or analytics.

**Everything else.** Which is most of it.

## The artefact route, which is usually better

For most technical and analytical roles, one substantial piece of work outperforms three certificates, for a simple reason: a certificate says you passed a test somebody else designed, and an artefact says you solved a problem you chose.

What makes an artefact count:

-   **It solves a real problem**, ideally one you actually had. The tell for a tutorial project is that nobody would have wanted it.
-   **It is opened easily.** A link that works, a README that explains what it does in three lines, a deployed version if applicable.
-   **It contains something hard.** Handling scale, or messy real data, or a genuine constraint. The difficulty is what makes the interview conversation interesting.
-   **You can talk about it for fifteen minutes** — what you chose, what you rejected, what broke.

And the highest-leverage version, consistently underused: **produce the evidence inside your current job.** Volunteer for the project that touches the function you want to move into. Automate your own team's reporting in Python. Take the vendor evaluation nobody wants. An operations analyst who builds their team's reporting pipeline now has production experience with a business outcome attached, which is not a portfolio project — it is work history. That argument in full is in [changing careers mid-level without starting over](/blog/changing-careers-without-starting-over).

## Choosing what to learn

The common failure is breadth: three courses started, none finished, all of them adjacent to things you already do. A filter that works:

**Look at twenty job postings you would actually apply for in eighteen months.** Not today's job — the one after. Count which skills appear repeatedly. That frequency list is a better curriculum than any roadmap on the internet, because it is derived from what employers near you are actually asking for.

Then pick **one** thing from it, on these criteria:

-   **It is verifiable.** Exam or artefact. If neither, pick something else.
-   **It compounds with what you already have.** A backend engineer adding cloud infrastructure is worth more than a backend engineer adding an unrelated design tool, because the combination is rarer than either part.
-   **It has a half-life longer than two years.** SQL, statistics, system design, writing, and the fundamentals of your domain still pay in a decade. A specific framework's current version does not.
-   **You can finish it in a quarter.** Anything longer will lose to a busy month at work, and an unfinished course is worth precisely nothing.

One thing per quarter, finished, is a far better year than five things started.

## What to be careful with

**Paid programmes promising job guarantees.** Read the conditions closely, especially where the fee is funded by an income-share agreement or a loan. The guarantee is frequently defined narrowly enough to be unusable — a stated number of "eligible" applications, roles anywhere in the country at any salary — while the loan is not conditional at all. Ask for placement data with company names and dates. A programme that will not provide it has answered you.

**Anything whose main claim is placement rather than teaching.** The overlap between this category and the patterns in [how to spot a fake job posting](/blog/spot-a-fake-job-posting) is larger than it should be.

**Certificate collecting as procrastination.** It is the most comfortable form of job-search activity — measurable, safe, and entirely under your control — which is exactly why people do it instead of applying. If you have four certificates and have sent nine applications this quarter, the constraint is not your skills.

## How to put it on a resume

Under a short **Certifications** heading: name, issuing body, year, and a verification link if there is one. Nothing else.

The skills themselves belong in your bullets, attached to work:

> Migrated the reporting stack to Redshift after the AWS SA certification — cut the nightly batch from 3 hours to 40 minutes and retired two EC2 instances.

That sentence does what the certificate line alone cannot: it proves the credential turned into something. If you have a certification and nothing to attach it to yet, that is the next thing to build, not the next certification to start.

The mechanics of getting any of this in front of a human — how the words on your resume interact with how recruiters search — are in [ATS keyword matching for Indian roles](/blog/ats-keywords-for-indian-roles). And once you are being asked about a skill in the room, [preparing for a technical interview](/blog/technical-interview-preparation) covers what that check actually looks like.$md$,
    'Rakshith Gowda',
    'Rakshith Gowda is a software engineer at an MNC in India. He writes these guides in his own time — he went through the same resumes, interview rounds and offer conversations himself, and found most of the advice online was either generic or written for a different job market. He is not a recruiter; everything here is from the candidate''s side of the table, which is the side most readers are on.',
    9,
    array['Career Growth', 'Upskilling', 'Certifications', 'Learning'],
    array['changing-careers-without-starting-over', 'manager-or-individual-contributor', 'ats-keywords-for-indian-roles'],
    'published',
    '2026-09-03'::timestamptz,
    null
  )
on conflict (slug) do nothing;
