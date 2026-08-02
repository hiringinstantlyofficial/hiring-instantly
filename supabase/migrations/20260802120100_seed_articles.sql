-- =============================================================================
-- Seed: the nine articles that shipped as compiled modules under
-- src/content/blog/, converted to markdown.
--
-- Generated once from the JSX bodies, then committed. Re-running is safe: a
-- slug that already exists is left alone, so an admin's later edits are never
-- overwritten by a replay of this migration.
-- =============================================================================

insert into public.articles (
  slug, title, description, excerpt, category, body_markdown,
  reading_minutes, tags, related, status, published_at, revised_at
) values
  (
    'resume-that-gets-shortlisted',
    'How to Write a Resume That Actually Gets Shortlisted in India',
    'A recruiter gives your resume about twenty seconds. Here is what to put in those twenty seconds, what to cut, and how to survive the ATS.',
    'Most resumes are rejected for reasons that have nothing to do with the candidate''s ability. A practical walkthrough of the format, the bullet points, and the Indian-market conventions that are safe to drop.',
    'resume',
    $md$A recruiter filling one role in a mid-sized Indian company will often receive several hundred applications. They are not reading your resume. They are scanning it — for about twenty seconds — looking for a reason to move it to the shortlist pile or the other one.

That is not laziness, it is arithmetic. And it means the resume that gets shortlisted is rarely the one belonging to the best candidate. It is the one that made its case fastest. Almost everything below follows from that single constraint.

## Keep it to one page until you have ten years behind you

One page. Two only if you genuinely have a decade of relevant work, or you are in academia or research where publications matter. Three pages for a candidate with four years of experience does not read as thorough; it reads as someone who cannot tell what matters.

If you cannot fit it, you are not short of space — you are including things that are not earning their place. The school you attended, the summer workshop, the six-line paragraph about a role you held for three months in 2019.

## The header: less than you think

Include, in one compact block at the top:

-   Your name, in the largest type on the page.
-   One phone number — the one you will actually answer, with country code if you are applying outside India.
-   A professional email address. **firstname.lastname@** at Gmail is fine. A college email you are about to lose access to is not, and neither is the address you made in class nine.
-   City and state. That is enough.
-   One or two links that add evidence — LinkedIn, GitHub, a portfolio, Behance. Only if they are current and worth opening.

Leave out, with no hesitation:

-   **Your photograph.** Standard on Indian resume templates, and a liability. It invites bias, it breaks parsing in some systems, and outside a handful of fields nobody needs it.
-   **Father's or husband's name, date of birth, gender, marital status, nationality, religion, caste.** None of it is relevant to whether you can do the job. These fields are a hangover from government application forms and they do not belong on a private sector resume.
-   **Your full postal address.** Nobody is posting you a letter, and it is unnecessary personal data sitting on job portals.
-   **The word “Resume” or “Curriculum Vitae” as a heading.** The reader knows.

## Three lines of summary, or none at all

A summary is worth including only if it says something specific. Compare:

> Hardworking and passionate professional seeking a challenging position in a reputed organisation where I can utilise my skills and grow with the company.

That sentence appears on a hundred thousand Indian resumes and conveys nothing. It could be attached to any candidate applying for any role. Now:

> Backend developer, 3 years on Java and Spring Boot, currently running the payments integration for a 200k-user fintech app. Looking for a role with more ownership of system design.

The second one tells a recruiter what you are, what scale you have operated at, and what you want. If you cannot write something in that register, delete the section and give the space to your experience.

## Bullets that carry weight

This is where most resumes are won and lost. The default failure is to describe your job description rather than your work. A useful bullet has three parts: **what you did**, **at what scale**, and **what changed as a result**.

Weak:

> Responsible for handling social media accounts of the company.

Better:

> Ran Instagram and LinkedIn for a D2C skincare brand; grew combined following from 4k to 31k in 11 months and took social from 6% to 22% of monthly web traffic.

You do not need a dramatic number for every line. You need a specific one. “Reduced monthly closing from 9 days to 5” is more persuasive than “streamlined accounting processes,” and it is harder to fake, which is exactly why it reads as credible.

If you genuinely have no metrics — common in support functions and in early roles — substitute scope. How many clients, how large a codebase, how many invoices a month, how many people you trained. Scale is a number too.

Start each bullet with a verb in the past tense (present tense for your current role), and never with “Responsible for.” Four to six bullets for your most recent role, two or three for older ones.

## The ATS, minus the mythology

Applicant tracking systems are widely misunderstood. They are not AI gatekeepers scoring you out of a hundred. Most are databases: they parse your file into fields, and a recruiter then searches and filters that database. Your job is simply to parse cleanly and match the search.

Practical consequences:

-   **Single column.** Two-column templates from Canva often parse into interleaved nonsense. This is the single most common self-inflicted rejection.
-   **No tables, text boxes, images or icons** holding real information. Nothing in the page header or footer, which many parsers skip entirely — including your phone number, if you put it there.
-   **Standard section headings.** “Work Experience,” “Education,” “Skills.” Not “My Journey” or “Where I've Been.”
-   **Dates in a consistent, obvious format** — *Mar 2023 – Present* — on every entry.
-   **A text-based PDF** unless the posting asks for .docx. Never a scan or a screenshot of your resume. If you can select the text in your PDF reader, a parser can too.
-   **Use the words the posting uses.** If it says “Power BI” and your resume says “business intelligence dashboards,” you will not appear in the search for Power BI. This is not keyword stuffing — it is using the same vocabulary as your reader, for skills you actually have.

Name the file **Firstname-Lastname-Resume.pdf**. A recruiter with forty files named *resume\_final(2).pdf* in their downloads folder will remember the one they can find.

## Freshers: projects are your experience section

If you have no full-time work history, your resume should be ordered: education, projects, internships, skills. And the projects section should be the largest thing on the page.

Treat each project like a job. What was the problem, what did you build, what did you build it with, and what came of it. A live link or a repo beats any description. Two substantial projects you can discuss for fifteen minutes are worth more than six tutorials you followed — and an interviewer can tell the difference within two questions.

Include coursework only if it is directly relevant and specific. A line listing “Data Structures, DBMS, Operating Systems” adds nothing that your degree title did not already imply.

## Skills: a list, not a scoreboard

Group skills into two or three plain lines — languages and frameworks, tools, domain skills. Then stop.

Delete the star ratings and the percentage bars. Nobody has a calibrated scale for “Python: 80%,” the reader knows it is a guess, and graphical bars parse as garbage. Also cut anything you would not want to be questioned on. Listing a skill is an invitation, and interviewers accept it.

## What to cut from an Indian resume, specifically

-   **The declaration.** “I hereby declare that the above information is true to the best of my knowledge,” with a place and signature. It has no legal weight in a private job application and takes a fifth of your page.
-   **“References available on request.”**Assumed. They will ask.
-   **Class 10 and 12 percentages**, once you have a degree and any work experience. Keep them only for campus applications and roles that explicitly ask.
-   **Hobbies**, unless genuinely relevant or genuinely distinctive. “Reading, music, travelling” is filler. “Ranked state-level chess” is a fact about you.
-   **Expected or current CTC.** Never on the resume. That is a conversation, and putting a number on paper before it starts only ever costs you.

## Handling the awkward bits

**Employment gaps.** Do not hide them by removing dates — that reads as evasion and gets caught in background verification anyway. Name the gap in one neutral line: a health matter, family responsibilities, exam preparation, a period of upskilling with the course named. A stated gap is a non-issue; an unexplained one is a question mark on every screening call.

**Short stints.** One three-month role is noise. Three in a row invite a question, so pre-empt it — “contract engagement, 3-month scope” costs you four words and closes the topic.

**A career change.** Lead with a summary that connects the two, and rewrite your old bullets to emphasise the transferable part. Nobody will do that translation for you.

## Tailor, but only the top third

Rewriting your resume from scratch for every application is not sustainable, and the returns are concentrated anyway. Keep one strong master resume, then for each application adjust three things: the summary, the order of your bullets so the most relevant ones sit at the top, and the skills line to match the posting's vocabulary. Ten minutes, and it addresses most of what a tailored resume actually buys you.

## Before you send it

-   Open the PDF on a phone. Most recruiters will.
-   Read it aloud. Every typo you have missed four times will surface.
-   Check that every date, title and company name matches what your payslips and offer letters say. Background verification checks this, and a mismatch you introduced casually can cost you an offer after you have resigned.
-   Hand it to someone outside your field for twenty seconds, then ask them what you do. If they cannot say, the resume is not working yet.

None of this makes a weak application strong. What it does is stop a strong application from being discarded for reasons that had nothing to do with you — which, on the evidence of most inboxes, is where the majority of good candidates are lost.$md$,
    10,
    array['Resume', 'ATS', 'Freshers', 'Job Applications'],
    array['first-job-without-experience', 'interview-preparation-that-works', 'spot-a-fake-job-posting'],
    'published',
    '2026-08-08'::timestamptz,
    null
  ),
  (
    'notice-period-and-relieving-letter',
    'Resigning Well: Notice Periods, Buyouts and Relieving Letters',
    'In India the way you exit affects your next job. Notice period rules, how a buyout works, and the documents to collect before your last day.',
    'Background verification makes your exit part of your next hire. What a notice period is contractually, whether an employer can refuse your resignation, and the seven documents you must not leave without.',
    'workplace',
    $md$In many countries resigning is administratively trivial. In India it is not, for one structural reason: background verification. Your next employer will ask your previous one to confirm your dates, title and exit status, and a missing relieving letter or an unresolved notice-period dispute can stall a joining date months later.

This makes the exit worth handling properly, even from a job you are glad to leave. Below is what the process actually involves.

This is general information, not legal advice. Employment terms vary by contract and by state, and if real money or a dispute is involved, get an employment lawyer to read your specific agreement.

## Read your contract before you resign, not after

Find your appointment letter now, before you have accepted anything anywhere. You are looking for five clauses:

-   **Notice period**, and whether it differs during probation.
-   **Buyout terms** — whether payment in lieu of notice is permitted, and how it is calculated. Basic salary and gross salary give very different numbers.
-   **Training or bond clauses**, common in IT services and for candidates the company certified at its own cost.
-   **Any joining or retention bonus clawback**, and its period.
-   **Non-compete, non-solicit and confidentiality** terms.

Knowing these before you negotiate your next offer is worth real money, because a ninety-day notice or a ₹1.5 lakh clawback is something the new employer can be asked to accommodate — but only while you still have leverage, which is before you accept.

## What a notice period actually is

Notice is a contractual obligation, not a criminal one. Thirty days is typical for junior roles, sixty to ninety in larger companies and IT services firms, and occasionally more for senior positions.

Beyond your contract, state Shops and Establishments Acts set minimum notice requirements, and these vary — which is why advice from a friend in another state may not apply to you. Where a statutory minimum and your contract differ, the more favourable term for the employee generally prevails, but the specifics depend on your state and your category of employment.

**Can an employer refuse to accept your resignation?** They cannot compel you to keep working — that is not something Indian law supports. What they can do is decline to waive your notice, treat an early departure as a breach, adjust your full and final settlement accordingly, and withhold your relieving letter. In practice that last one is the real pressure, and it is why exits get settled rather than fought.

## Buying out your notice

A buyout means paying the company for the notice you are not serving. Two things to establish in writing before you commit:

-   **The exact amount and its basis.** Calculated on basic or on gross? Does it include employer PF? For a ninety-day buyout the difference between the two bases can be over a lakh.
-   **That the company will accept a buyout at all.** Some contracts allow it at the employer's discretion, which means they can simply say no.

Ask your new employer to reimburse it. This is a routine request, it is frequently granted, and it is one of the more reliable concessions available when base salary will not move. Get it into the offer letter or an email from the recruiter rather than a verbal assurance.

Where a buyout is not possible, negotiate a shorter served notice instead. Managers have more discretion here than they usually admit, particularly if you leave a clean handover and train a replacement.

## The resignation email

Tell your manager first, in a conversation. Then send the written resignation the same day, because the date on that email starts your notice clock and you want it on record.

Keep it short and give no reasons:

> Subject: Resignation — Ananya Rao  
>   
> Dear Rajesh,  
>   
> Please accept this as formal notice of my resignation from the position of Senior Analyst, effective today, 30 July 2026. As per my appointment letter my notice period is 60 days, which places my last working day on 28 September 2026.  
>   
> I will document my current work and support the transition however is most useful. Thank you for the opportunity and for your support over the last three years.  
>   
> Regards,  
> Ananya Rao

State the date, state your calculated last working day, offer help. Do not explain where you are going, do not list grievances, and do not negotiate in this email. Copy HR, and keep a copy sent to your personal address — you will lose access to your work mailbox, sometimes on the day you resign.

## The last-working-day trap

A common problem: HR calculates your last day differently from you, usually later, by starting the clock from an approval date rather than your resignation date. Since your new employer has your joining date in writing, a two-week discrepancy is a genuine problem.

Get the last working day confirmed in writing within the first week of resigning, and if the number differs from yours, raise it immediately while there is still time. Do not leave this to be discovered in your final fortnight.

Related: unused leave. Find out whether your policy allows leave to be adjusted against notice or encashed at exit. Assuming you can take three weeks of accumulated leave during notice, and then finding you cannot, is a common and avoidable mess.

## The documents to collect before you leave

Chasing these after your last day, from people with no remaining reason to respond, is far harder than collecting them while you are still on the payroll. Get all seven:

1.  **Relieving letter.** Confirms you completed your notice and have no dues. This is the single most important document — many employers will not let you join without it.
2.  **Experience or service certificate**, stating your dates and designation. Sometimes combined with the relieving letter.
3.  **Your appointment letter and any promotion or increment letters.** Background verification and future negotiations both use these.
4.  **The last three to six payslips.** Download them before your portal access is revoked, which frequently happens on your last day.
5.  **Form 16** for every financial year you worked. Issued after the year ends, so you may need to request one later — get a personal email address on record with payroll for exactly this.
6.  **Full and final settlement statement.** Check it line by line: leave encashment, pro-rated variable, any recovery, notice adjustment, gratuity if you qualify. Errors are common and are much easier to correct before it is paid.
7.  **Your UAN and PF details**, with confirmation that the exit date has been updated in the EPFO records. If your employer does not mark your date of exit, you cannot transfer or withdraw the account.

## Provident fund: transfer, do not withdraw

Your UAN stays with you across employers. Once your new employer is linked, raise a transfer request through the EPFO member portal so the balance and — importantly — your continuous service record move across.

Withdrawing instead is tempting and usually a mistake. It resets the service continuity that matters for pension eligibility, and withdrawals before five years of continuous service are generally taxable. If you genuinely need the money, understand the tax position first.

**Gratuity** becomes payable at five years of continuous service, with a widely applied rule treating four years plus 240 days in the fifth year as qualifying. If you are close to that line, the exact arithmetic on your last working day is worth doing before you set it — a few weeks can be worth a substantial amount, and it is one of the few cases where the departure date has direct financial consequences.

## Non-competes, and the thing people fear unnecessarily

Indian contracts routinely contain clauses barring you from joining a competitor for six or twelve months. Under Section 27 of the Indian Contract Act, agreements in restraint of trade are void, and Indian courts have generally declined to enforce post-employment non-competes against employees.

What courts do enforce is different, and worth taking seriously: **confidentiality** obligations over the employer's information, protection of trade secrets, and often **non-solicitation** of clients and colleagues. So the practical position is that joining a competitor is usually fine; taking their customer list, code or pricing data with you is not.

None of which means a company cannot make your life difficult by sending a legal notice. If you receive one, get an employment lawyer to read the clause rather than reasoning from a forum post.

## Do not simply stop showing up

Abandoning a job — what companies call absconding — is the one exit that genuinely follows you. The employer marks it in your record, refuses the relieving letter, and your next background verification returns “terminated for abandonment.” That is difficult to explain for years, and it converts a bad job into a bad record.

If your situation is intolerable — non-payment of salary, harassment, an unsafe workplace — that is a different conversation, and there are statutory routes and labour authorities for it. Take advice rather than vanishing.

## The last two weeks

Write the handover document properly. Not because you owe the company anything at that point, but because your manager and your colleagues are the people who will be called for reference checks for the next decade, and Indian professional networks within an industry are small.

In the exit interview, be measured. Specific, factual process feedback is useful and occasionally acted on. A catalogue of grievances about named individuals is not confidential in practice, will not change anything, and reaches people who will remember it.

Leave with the documents, the relationships and a clean record. The version of you that needs all three is three jobs from now, and will not remember why the last fortnight felt so annoying.$md$,
    12,
    array['Resignation', 'Notice Period', 'Relieving Letter', 'Provident Fund'],
    array['ctc-vs-in-hand-salary', 'negotiate-salary-in-india', 'genuine-remote-jobs-from-india'],
    'published',
    '2026-08-07'::timestamptz,
    null
  ),
  (
    'ctc-vs-in-hand-salary',
    'CTC vs In-Hand: How to Read an Indian Salary Offer',
    'A 12 LPA offer does not put 1 lakh a month in your account. A component-by-component walkthrough of an Indian CTC, with the arithmetic.',
    'Basic, HRA, employer PF, gratuity, variable pay, insurance premiums — what each component actually does to your monthly cash, and the five questions to ask before you accept.',
    'salary',
    $md$The most common disappointment in Indian hiring arrives on the last working day of a candidate's first month. They accepted an offer of ₹12 lakh per annum, divided it by twelve, expected ₹1,00,000, and received something closer to ₹78,000.

Nothing dishonest necessarily happened. CTC — cost to company — is a measure of what the employer spends on you, and a good deal of that spending never becomes cash in your account. Reading an offer properly means knowing which parts do and which parts do not.

Everything below is directional and meant to help you ask better questions. Rates and rules change, so check the current position for your situation with a qualified professional before making a financial decision.

## What CTC is actually made of

A typical Indian offer letter has an annexure breaking the number into components. They fall into three groups, and the distinction is the whole point.

### Group one: money that reaches you monthly

-   **Basic salary.** Usually 40–50% of CTC. This is the reference number for a lot of other things — PF, gratuity, and often your notice-period buyout amount — so a low basic is not neutral, it quietly shrinks your retirement contributions and your gratuity.
-   **House Rent Allowance (HRA).** Commonly 40–50% of basic. Fully paid to you, and partly exempt from tax if you pay rent and are on the old tax regime. If you live in your own home or with family, it is simply taxable salary with a different name.
-   **Special allowance / other allowance.** The balancing figure that makes the arithmetic add up to the promised CTC. Fully taxable, no conditions.
-   **Reimbursements** — telephone, fuel, books, meal cards. Paid on production of bills, so treat any you will not claim as money you are not getting.

### Group two: money set aside for you, but not now

-   **Employer's PF contribution.** 12% of basic, counted in your CTC. It is genuinely your money and it compounds at a decent statutory rate — but it goes to your EPF account, not your bank. Your own matching 12% is additionally deducted from your salary, so PF hits your monthly cash twice: once as a CTC component you never see, and once as a deduction.
-   **Gratuity.** Often shown as roughly 4.81% of basic. Payable under the Payment of Gratuity Act only once you complete five years of continuous service — with a widely applied rule treating four years plus 240 days in the fifth year as qualifying. If you expect to move in three years, this component of your CTC is worth nothing to you. Employers count it anyway.
-   **NPS contributions**, where offered. Same logic.

### Group three: money that may never exist

-   **Variable pay / performance bonus.** Frequently 10–20% of CTC, and the single largest source of offer-letter disappointment. It is conditional, often on company performance rather than yours, and frequently paid at 60–80% of target in a bad year.
-   **Joining bonus.** One-time, and almost always subject to a clawback if you leave within twelve or eighteen months. Do not treat it as salary.
-   **Retention bonus.** Paid on a date, conditional on you being there.
-   **ESOPs or RSUs.** Sometimes shown inside CTC at a notional valuation, which is optimistic accounting. In an unlisted Indian company these are worth nothing until there is a liquidity event, and you should value them accordingly when comparing offers.
-   **Insurance premiums and “benefits.”** The group medical premium the company pays is a real benefit and a real cost to them. It is not income.

## The arithmetic, worked through

Take a ₹12,00,000 CTC offer with a fairly standard structure. Numbers are rounded, and the tax figure is indicative only.

| Component | Annual | Reaches your bank monthly? |
| --- | --- | --- |
| Basic salary | ₹5,40,000 | Yes |
| HRA | ₹2,70,000 | Yes |
| Special allowance | ₹1,62,000 | Yes |
| Employer PF (12% of basic) | ₹64,800 | No — goes to EPF |
| Gratuity provision (4.81% of basic) | ₹25,974 | No — only after ~5 years |
| Group medical premium | ₹17,226 | No — a benefit, not cash |
| Variable pay (target) | ₹1,20,000 | No — annual, and conditional |
| **Total CTC** | **₹12,00,000** |  |

The cash portion is ₹5,40,000 + ₹2,70,000 + ₹1,62,000 = **₹9,72,000** — that is your gross salary, ₹81,000 a month. From that comes:

-   **Your own PF contribution:** 12% of basic, ₹5,400 a month.
-   **Professional tax:** a state levy, typically ₹200 a month where it applies.
-   **TDS on income tax:** depends on your regime and deductions. Say ₹4,000–6,000 a month at this level.

Which lands you around **₹70,000 a month in hand** against a headline of ₹12 LPA — plus roughly ₹1,20,000 of variable pay once a year if targets are met, and ₹1,29,600 a year accumulating in your EPF account between the two contributions.

That is a perfectly reasonable offer. It is simply not ₹1 lakh a month, and no arithmetic will make it so.

## Two offers, same CTC, different value

This is why comparing headline CTCs is close to meaningless. Consider two ₹15 LPA offers:

|  | Offer A | Offer B |
| --- | --- | --- |
| Fixed cash component | ₹13,20,000 | ₹10,20,000 |
| Variable (target) | ₹75,000 | ₹3,00,000 |
| ESOPs at notional value | — | ₹1,50,000 |
| Retirement and benefit provisions | ₹1,05,000 | ₹30,000 |

Offer A pays about ₹25,000 more per month in guaranteed cash. Offer B is worth more only if the variable pays near target and the equity becomes liquid — two independent bets. Neither is wrong, but they are very different jobs financially, and the recruiter for B will describe it as the higher offer.

## The tax regime choice

India runs two personal income tax regimes. The newer default has lower slab rates but removes most exemptions and deductions; the older one keeps them. Broadly, if you claim a lot — HRA on a high city rent, home loan interest, 80C investments, insurance premiums — the old regime can still win. If you claim little, the new one usually does.

Slabs, the standard deduction and the rebate threshold have all been revised repeatedly in recent budgets, so do not rely on a comparison you read a year ago. Run both on the Income Tax Department's own calculator for your actual numbers before you tell payroll which regime you are choosing, and note that your salary structure affects the answer — an offer with high HRA is worth more under the old regime than the same CTC packed into special allowance.

## Five questions before you accept

Ask these in writing, by email, before signing. A reasonable employer will answer all five without friction, and reluctance on any of them is information in itself.

1.  **Can you share the full CTC break-up with the monthly in-hand figure?** Ask for the number after standard deductions. Most companies have this ready.
2.  **What percentage of target variable pay was actually paid out in the last two cycles, company-wide?** Not the policy — the history. This is the question that most changes your expectations.
3.  **Is the variable linked to individual, team or company performance, and when is it paid?** A company-linked annual bonus is nearly outside your control.
4.  **Is there a clawback on the joining bonus, and for how long?** Get the exact period and the repayment terms.
5.  **For equity: how many units, what is the strike price, the vesting schedule and cliff, and the current fair market valuation?** If any of those cannot be answered, value the equity at zero for comparison purposes and treat any upside as a bonus.

## Two things that quietly cost you

**A deliberately low basic.** Some employers keep basic at 30% of CTC to reduce their PF and gratuity liability. It raises your immediate take-home slightly and reduces your retirement corpus, your gratuity, and — since notice buyouts are often calculated on basic — can cut both ways later. Worth noticing, though it is rarely negotiable.

**The notice period clause.** Ninety days is common in Indian companies and it is a real cost, because your next employer may not wait and buying out three months can be expensive. Read that clause before you sign this offer, not when you are leaving.

Read the annexure, not the headline. It takes ten minutes and it is the difference between negotiating from the actual numbers and being surprised by them at the end of your first month.$md$,
    12,
    array['Salary', 'CTC', 'Provident Fund', 'Offer Letters'],
    array['negotiate-salary-in-india', 'notice-period-and-relieving-letter', 'first-job-without-experience'],
    'published',
    '2026-08-02'::timestamptz,
    null
  ),
  (
    'spot-a-fake-job-posting',
    'How to Spot a Fake Job Posting Before It Costs You',
    'Job scams in India follow a small number of scripts. The red flags, a ten-minute verification routine, and what to do if you have already paid.',
    'One rule eliminates most of it: no legitimate employer charges you to be hired. Here are the patterns behind registration fees, WhatsApp interviews and instant offer letters — and how to check a company yourself.',
    'job-search',
    $md$Job fraud works because it targets people at their least sceptical. A candidate four months into a search, watching their savings fall, is sent an offer letter with a real company's logo on it and asked for ₹2,500 as a refundable registration fee. The amount is small enough to seem reasonable and the moment is the worst possible one to be careful.

The reassuring part is that these scams are not sophisticated. There are perhaps six scripts in circulation and they all leave the same marks. Learn them once.

## The one rule that eliminates most of it

**A legitimate employer never asks you for money.**

Not a registration fee. Not a security deposit. Not a training or certification charge, a laptop deposit, a courier fee for your welcome kit, a background verification fee, a “processing” charge, or anything described as refundable. Not payment to a consultant who “guarantees” placement in a named company.

Real recruitment costs the employer money and they pay it. If anyone in the process asks you to pay, transfer, deposit or buy something, the process is fraudulent. There is no exception worth entertaining, and the word “refundable” is a feature of the script, not a protection.

## Red flags in the posting itself

-   **Pay far above the market for the work described.** “Data entry, work from home, no experience, ₹35,000/month” describes a job that does not exist. Data entry is among the most commoditised work there is.
-   **No named company**, or only “a leading MNC” / “our reputed client.” Some genuine consultants withhold the client name early on, so this alone is not proof — but combined with anything else here, treat it as decisive.
-   **Vague responsibilities and no real requirements.** A genuine JD is specific because a real manager wrote it about real work.
-   **Unlimited openings, permanent urgency.** “Hiring 500 candidates, immediate joining” is a funnel, not a role.
-   **A free email domain for a corporate role.** An “HR Manager” at a large company writing from a Gmail, Outlook or Yahoo address is a serious flag. So is a near-miss domain: *@tcs-careers.com*, *@infosys-hr.net*, or a name with a letter swapped that you will not notice unless you look for it.
-   **Language errors throughout.** Not the odd typo, but consistently broken phrasing in what claims to be corporate communication.

## Red flags in the process

-   **An offer with no real interview.** Selection after a five-minute chat, or purely over text, does not happen for salaried work.
-   **The entire process on WhatsApp or Telegram.** Recruiters do use WhatsApp for scheduling. They do not conduct hiring in it, and Telegram in particular is used because the accounts are disposable.
-   **An offer letter within hours.** Real approvals take days. Instant offer letters are template documents with your name pasted in, and the accompanying urgency exists to stop you checking.
-   **Interviews at odd hours from personal numbers**, with no calendar invite, no company video platform, no email trail.
-   **Pressure and deadlines.** “This slot closes in two hours.” Manufactured scarcity is the core mechanism of the whole category.
-   **Sensitive documents requested too early.** Aadhaar, PAN, bank account details, a cancelled cheque, your date of birth — all legitimately needed *after* you accept a written offer, for payroll and PF. Never during screening. Your Aadhaar and PAN together are enough to attempt loans and accounts in your name.
-   **Anyone asking for an OTP.** No employer needs one, for anything, ever. An OTP request is always an attack in progress.
-   **Being asked to install remote-access software** — screen sharing tools you have not heard of, or an APK sent over chat — to “complete verification” or receive your salary.

## The specific scripts to know

### Recruiter impersonation

The most convincing variant, because the company is real. Someone registers a lookalike domain, copies a genuine JD, and runs an entire process using a real firm's name and branding. The fee request arrives at the offer stage, when your guard is lowest.

The defence is simple and absolute: **go to the company's own careers page and confirm the role exists there**, then contact the company through a number or address you found yourself. Never through the contact details in the message.

### Task and commission scams

Marketed as “online part-time work,” “digital marketing” or “app reviews.” You complete simple tasks, earn ₹150, and get paid — which is the hook, because now it seems real. Then the tasks require you to prepay to unlock a higher tier, or to fund a “merchant order” you will be reimbursed for with commission. Early withdrawals succeed; the large one never does.

Any arrangement where you send money in order to earn money is not employment, whatever it is called.

### The placement consultancy that charges candidates

Charges ₹5,000 to ₹25,000 for “registration” and a promised number of interviews. Some are outright fraud; others technically deliver worthless interviews and are therefore hard to pursue. Genuine recruitment consultants are paid by the employer, as a percentage of the placed candidate's salary. That is the entire business model.

### Data harvesting

Some fake postings do not want your money at all — they want a verified resume with a working phone number, which sells. If you applied to something that then went silent and you began receiving loan and insurance calls, you have probably found the reason. Keep your full postal address off your resume, and treat any “application form” asking for Aadhaar number, salary slips or family details before an interview as a collection exercise.

## Ten minutes of verification

Before you invest any further effort in a suspicious posting:

1.  **Search the company name with “fraud,” “scam” and “review.”** Trivial, and it resolves a surprising share of cases immediately.
2.  **Check the company exists on the MCA register.** The Ministry of Corporate Affairs runs a free master-data lookup at [mca.gov.in](https://www.mca.gov.in). You can confirm the CIN, incorporation date, registered address and directors. A company claiming twenty years of operation and incorporated eight months ago has answered your question.
3.  **Look at the website properly.** Is there a registered address, a landline, a GSTIN in the footer? Are the team photographs reverse-image-searchable to a stock library? Was the domain registered three weeks ago?
4.  **Cross-check the role on the careers page** — the company's own, reached by typing the domain yourself.
5.  **Check the recruiter on LinkedIn.** An account created last month, with few connections and no history at the company, is not a recruiter. Also sanity-check the company page: a firm claiming 5,000 employees with eleven on LinkedIn is not real.
6.  **Call the company's published switchboard** and ask whether the person and the role exist. Two minutes, and it defeats impersonation entirely.
7.  **Read the email headers** if you can. Reply-to addresses on a different domain from the sender are a common tell.

## If you have already paid

Act the same day — recovery odds fall sharply with time, and this is worth doing even for small amounts, because the reports are what build cases.

-   **Call 1930**, the national cybercrime financial fraud helpline. Reporting within the first hours materially improves the chance that the receiving account can be frozen.
-   **File a complaint at [cybercrime.gov.in](https://cybercrime.gov.in)**, the Government of India portal. Keep the acknowledgement number.
-   **Notify your bank in writing** and ask them to raise a dispute. If you paid by card there may be a chargeback route; UPI and IMPS transfers are harder but the beneficiary account can still be flagged.
-   **Preserve everything** — screenshots of the chat, the posting, the offer letter, transaction references, phone numbers, UPI IDs. Do not delete the conversation, however much you want to.
-   **If you shared Aadhaar or PAN**, check your credit report for enquiries you did not make, and keep checking for a few months.
-   **Tell the real company** whose name was used. They generally have a fraud reporting address and an active interest in shutting the lookalike domain down.

And do not carry it as a personal failure. These scripts are built by people who run them thousands of times and refine what works. Being deceived by a professional deception says very little about you.

## What we do at our end

Every listing on this site is reviewed by a person before it is published, and we remove roles that go quiet or turn out to be misrepresented. We will never ask you to pay to apply, and no employer listed here is permitted to.

That review is not infallible. If a listing you found through us asks you for money, requests documents before an offer, or does not match the company it claims to be from, please [tell us](/contact) — with the listing link and a screenshot if you have one. We investigate the same week, and one report usually protects a lot of people who would have applied after you.$md$,
    11,
    array['Job Scams', 'Fraud', 'Safety', 'Job Search'],
    array['genuine-remote-jobs-from-india', 'resume-that-gets-shortlisted', 'first-job-without-experience'],
    'published',
    '2026-07-30'::timestamptz,
    null
  ),
  (
    'interview-preparation-that-works',
    'Interview Preparation That Actually Moves the Needle',
    'With 48 hours before an interview, most preparation is wasted on the wrong things. What to do instead, in priority order.',
    'Preparation is triage, not memorisation. The five stories worth having ready, the most common failure mode nobody warns you about, and how to answer a question you cannot answer.',
    'interviews',
    $md$You have an interview in two days. The temptation is to read fifty commonly asked questions and rehearse answers to all of them.

That is close to the least efficient thing you could do. Interviewers do not reject people for lacking a polished answer to “what is your greatest weakness.” They reject people who could not explain their own resume, could not describe the work in any specific terms, and had clearly not thought about the company for five minutes.

Preparation is triage. Here is the order that actually pays.

## First: read the job description backwards

Print the JD, or paste it somewhere you can annotate it. For every requirement, write one line of your own evidence — a project, a metric, a situation. Where you have no evidence, write that too.

This produces three things in twenty minutes:

-   A map of what they will ask about, because interviewers are usually working from the same document.
-   Your talking points, pre-attached to their language rather than yours.
-   An honest list of your gaps — so that when one comes up, you are not discovering it live.

Pay attention to what the JD lists first and what it repeats. That is usually the actual problem they are hiring to solve, and the rest is wishlist.

## Second: know your own resume cold

This is the most common serious failure, and almost nobody prepares for it. Candidates write a resume in March, apply in July, and cannot explain a number they put on it themselves.

For every line on your resume, be able to answer:

-   What exactly did you do, versus what your team did?
-   How did you arrive at that number, and over what period?
-   What was hard about it?
-   What would you do differently?

If you wrote “improved page load time by 40%,” know what it was before, how it was measured, and which change contributed most. An interviewer who finds one number you cannot defend will discount the entire document, which is a rational response.

The corollary: never put anything on a resume you are not prepared to be cross-examined on. Anything you cannot defend should come off, not be risked.

## Third: have five stories ready

Nearly every behavioural question is a request for one of a small number of stories. Prepare five, from real experience:

1.  **Something you built or delivered** that you are genuinely proud of.
2.  **Something that went wrong through your own error**, and what you did about it.
3.  **A disagreement with a colleague or manager** and how it resolved.
4.  **A time you worked under real constraint** — no time, no budget, no information — and what you cut.
5.  **Something you learned quickly** because you had to.

Between them these cover ownership, accountability, conflict, judgement under pressure and learning speed, which is most of what a behavioural round is assessing. Cover the situation, what you specifically did, and how it turned out — the standard STAR structure is fine as a checklist, but do not let it flatten your delivery into a recitation. Interviewers can hear a memorised template, and it costs you credibility.

Two things matter more than structure. Say **“I”** when describing your own contribution — candidates who say “we” throughout leave the interviewer unable to tell what they actually did. And keep each story to **two minutes**. Time yourself once out loud; most people are astonished at how long they run, and a five-minute answer to a simple question is itself a signal about how you will behave in a meeting.

For the failure story, pick a real one with a real cost. A story where the failure was “I worked too hard” or the fault was someone else's answers a different question than the one asked, and interviewers notice the dodge.

## Fourth: twenty minutes on the company

You do not need to become an analyst. You need to know:

-   **What they sell and who pays for it.** Surprisingly many candidates cannot say this.
-   **Who their main competitors are**, and one way this company is positioned differently.
-   **One recent, specific thing** — a funding round, a product launch, a market they entered, something the founder said in an interview.
-   **Roughly how large they are** and how long they have existed.

Then use the product if you can. Fifteen minutes in their app gives you an observation nobody else in the pipeline will have, and “I noticed onboarding asks for a PAN before showing me anything — is that a regulatory constraint?” is worth more than any amount of researched enthusiasm.

## Fifth: prepare questions that are not filler

“Do you have any questions for us?” is a real part of the assessment, and “What is the company culture like?” scores nothing because it has no wrong answer.

Better, because the answers actually inform your decision:

-   What does success in this role look like at six months? What would have to be true?
-   Why is the position open — is it new, or is someone leaving?
-   What is the hardest part of this job that would not be obvious from the description?
-   How is work prioritised when two stakeholders disagree?
-   Who would I work with most closely, and what do they need from me?
-   What has the team shipped in the last quarter?

Ask three, and listen to the answers rather than waiting to ask the next one. Hesitation on “why is the role open” is one of the more useful pieces of information you will get all process.

## Technical rounds: what is actually being assessed

Whether it is a coding round, a case study, a modelling test or a design exercise, the assessment is rarely just correctness. Three things are being watched:

-   **Do you clarify before you start?** Candidates who begin solving before establishing constraints are the ones who build the wrong thing at work. Ask about scale, edge cases, the inputs you can assume.
-   **Do you narrate your reasoning?** Silence for eight minutes is unassessable. Say what you are considering and why you rejected the alternative — an interviewer will often nudge you if they can hear where you are, and cannot if they cannot.
-   **How do you behave when stuck?** This is the highest signal moment in the whole interview. Getting stuck is normal; freezing, bluffing or getting defensive is what damages you.

Practise out loud, against a clock, at least once before the day. Solving problems silently in your head is a different skill from solving them while talking, and it is the second one you are being tested on.

## The mechanics of a video interview

These are unglamorous and they cost people offers anyway.

-   Test the link, camera and microphone the day before, in the actual application they will use.
-   Have a mobile hotspot ready as a fallback, and know how to switch. If your connection fails, say so immediately and reconnect on the phone — do not spend four minutes hoping.
-   Camera at eye level, light in front of you rather than behind. A window behind you turns you into a silhouette.
-   Set your display name to your actual name, not *Redmi Note 12*.
-   Use a headset. Laptop microphones pick up the room and echo the interviewer back at themselves.
-   Look at the camera when making a point, not at your own thumbnail.
-   Keep your resume and JD notes open, but out of your eyeline enough that you are not visibly reading.
-   Allow the small delay. Video calls swallow the start of sentences, so pause briefly before answering rather than talking over the last word of the question.

## Two questions people handle badly

**“What are your salary expectations?”** Deflect once and ask for their budgeted band; if pressed, give a researched range and say the word *fixed*. The full mechanics are in [our guide to negotiating salary in India](/blog/negotiate-salary-in-india), but the short version is: do not name a precise number before you understand the role.

**“Why are you leaving your current job?”** Answer forwards, not backwards. “I want to work on X, and this role has more of it” is safe and true for most people. Criticising your current employer — even fairly, even accurately — reads as a preview of how you will describe them, and interviewers are consistent about penalising it.

## How to say you do not know

You will be asked something you cannot answer. There is a version of this that helps you:

> I haven't worked with Kafka directly, so I don't want to guess. What I do know is the problem it solves, and I've used SQS for something similar on the notifications pipeline — is the concern here ordering, or throughput?

Admit the gap, show the nearest real thing you have, stay engaged. Every interviewer has hired people with gaps. Almost none will hire someone who bluffed and got caught, because the inference is about honesty rather than knowledge.

## Afterwards

Send a short note within a day, to whoever you have an address for. Three sentences: thanks, one specific thing from the conversation, and that you remain interested. It is not obsequious and it is remembered, largely because so few candidates do it.

Ask about the timeline before you leave the call — “what are the next steps, and when should I expect to hear?” — so that following up is a scheduled action rather than an anxious guess. If the stated date passes, one polite follow-up is appropriate. Then move on and keep interviewing elsewhere, because pipelines go quiet for reasons that have nothing to do with you.

If you are rejected, ask once what would have made the difference. Most will not reply. The ones who do will tell you something more accurate than anything you could have inferred, and it is frequently a small mechanical habit that takes one afternoon to fix.$md$,
    12,
    array['Interviews', 'Preparation', 'Communication'],
    array['resume-that-gets-shortlisted', 'negotiate-salary-in-india', 'first-job-without-experience'],
    'published',
    '2026-07-30'::timestamptz,
    null
  ),
  (
    'negotiate-salary-in-india',
    'How to Negotiate Salary in India Without Losing the Offer',
    'When to give a number, what to say when asked for your expected CTC in the first call, and how to make one clear ask that gets accepted.',
    'Most candidates lose money in the first five minutes of the first call. Timing, anchoring, what is negotiable besides base pay, and scripts for the four conversations you will actually have.',
    'salary',
    $md$Salary negotiation in India is widely treated as either impossible or rude. It is neither. What it is, is heavily front-loaded: most of the money is won or lost in the first five minutes of the first call, before anyone has assessed you at all.

The good news is that the mechanics are learnable, and the risk is much lower than people fear. Companies do not withdraw offers because a candidate asked for more — they withdraw them when a candidate is dishonest, erratic, or negotiating in bad faith after accepting.

## The one rule about timing

**Your leverage exists only between the offer and your acceptance.**

Before an offer, the company has no sunk cost in you and can move to the next candidate at no expense. After you accept, the conversation is over — reopening it reads as bad faith and it is the one move that genuinely does cost people offers.

Everything else in this article is about protecting that window: not pinning yourself to a number too early, and using the window properly when it opens.

## Know the range before the first call

You cannot negotiate a number you have not researched, and “what I need to pay my rent” is not a market rate.

Triangulate from at least three sources:

-   **Salary aggregator sites** for the role, city and experience band. Treat these as a rough distribution, not a fact — the data is self-reported and skews high, and Indian entries are often thin for specific roles.
-   **Postings that publish ranges.** Increasingly common, and more reliable than aggregate data because it is what someone is actually budgeting.
-   **People, which is the best source by far.** Two or three people doing your target role at a similar company. Do not ask what they earn. Ask: “If a company were hiring for your role at your level in Pune, what range would you expect them to budget?” That is a comfortable question and it gets answered.

You want three numbers before any call: the market range, your **target** (upper part of that range, justified by your specific fit), and your **walk-away** — the figure below which you would rather stay where you are. Decide the walk-away in advance and in writing, because deciding it live, under pressure, from an offer you are excited about, is how people accept things they resent within a month.

## The expected-CTC question in the first five minutes

A recruiter will ask for your current and expected CTC almost immediately. This is a genuine screening question — they have a band and they are checking whether you fit it — but answering it precisely, before you know the role or their range, means the whole negotiation is anchored to a number you picked while uninformed.

Deflect once, politely, and turn the question around:

> Happy to get to that. It would help to hear the band budgeted for the role first — I'd rather we find out quickly if we're in the same range. What have you set aside for this position?

Roughly half the time they will tell you, and then you are negotiating with information rather than guesses.

If they press — and many will, because they are required to log a figure — do not stonewall a second time. Give a researched range with a condition attached:

> Based on what I've seen for senior QA roles in Hyderabad at this experience level, I'm looking at ₹18 to ₹22 lakh fixed, and I'd want to understand the full structure before committing to a figure. Does that sit inside your band?

Three things are doing work there:

-   **“Fixed.”** Say it every time. Otherwise the offer arrives at your number with a fifth of it in variable pay.
-   **A range, not a point** — and one whose lower end you would genuinely accept, because that is the number they will hear.
-   **A stated basis.** “Based on what the market pays” is a different kind of claim from “I want,” and it invites a counter-argument about the market rather than about you.

## Do not misstate your current CTC

Inflating your current salary is common advice in India and it is a bad bet. Offer letters, payslips, Form 16 and UAN records are all checked at the background verification stage, which happens after you have resigned. A discrepancy discovered then can void the offer while you have no job to return to.

You are not obliged to volunteer it, though. “I'd rather anchor on the market rate for this role than on what I'm paid now, which reflects a company I joined three years ago” is a legitimate and often effective response — particularly if you are underpaid, in which case revealing your current figure is what damages you.

## When the offer arrives: one clear ask

Do not accept on the call, however good it is. Thank them, express genuine enthusiasm, and ask for the written offer with the full break-up plus two working days.

Then make exactly one ask, by email, with a reason:

> Thank you — I've read the offer and I want to accept. One thing I'd like to discuss: the fixed component is ₹19.5 lakh, and based on what I've seen for this role at comparable product companies in Bengaluru I was expecting ₹22 lakh. I'd also point to the migration work in my current role, which is the closest thing to what you described as the first six months here. If you can move the fixed component to ₹22 lakh, I'll sign today.

The structural features that make this work:

-   **Enthusiasm first.** You are negotiating a job you want, not auditing them.
-   **One number, one component.** A list of six requests reads as a negotiation with no end and is usually answered with a flat no.
-   **An external basis plus a specific claim about your fit.** Not “I deserve more.”
-   **A close.** “I'll sign today” converts your request into a decision the hiring manager can make and be done with. This one line is worth more than any amount of justification.
-   **In writing.** The recruiter has to forward it to someone with budget authority. Make that easy.

Ask for 10–20% above the offer if your research supports it. Above 30% without a competing offer usually reads as not having done the research.

## When base pay will not move

Frequently it genuinely cannot: bands are approved, and the recruiter is not being evasive. Several other things are often easier to grant, cost the company less, and are worth real money:

-   **A joining bonus.** Comes from a different pot than recurring salary and is the most common way a stuck negotiation gets resolved. Ask about the clawback period.
-   **Reimbursement of your notice-period buyout.** If you are paying to exit a ninety-day notice, ask them to cover it. Very commonly agreed and rarely requested.
-   **A guaranteed first-year variable**, or a pro-rated bonus for the partial year. Also ask for the review cycle to be brought forward to six months, in writing.
-   **The fixed-versus-variable split.** Same CTC, more of it guaranteed. Often approvable at the manager's discretion.
-   **Relocation support**, including the temporary accommodation period.
-   **Designation.** Costs nothing today and compounds for the rest of your career, because your next employer will benchmark against it.
-   **Remote or hybrid days, and the start date.** Three extra weeks before joining is worth having if you have been working without a break.

Put it plainly: “I understand the band is fixed. If base can't move, would a joining bonus of ₹2 lakh and a six-month review be possible instead?”

## Freshers and campus offers

Be realistic: standardised campus offers are usually not negotiable on salary, because the company has made the same offer to two hundred people and cannot differentiate without a problem. Pushing hard here is one of the few situations where you can genuinely damage your standing.

What is often available even so:

-   Location or office preference.
-   Team, function or technology allocation — frequently negotiable, and worth far more than ₹50,000 over a career.
-   Joining date.
-   Relocation assistance.

Off-campus fresher offers are a different matter and behave like any other negotiation — ask.

## Counter-offers from your current employer

You resign, and your employer offers a raise to keep you. It is flattering and it is usually a mistake to take.

The raise is real, but so is the fact that it took a resignation to produce it — and whatever made you look elsewhere is generally structural: the manager, the scope, the trajectory. None of that changes on Monday. There is also a quieter cost: you are now known to have been looking, which affects how you are staffed and considered.

The exception is a counter-offer that changes something other than money — a different manager, a genuine change in scope, the promotion you were waiting for, confirmed in writing with a date. If the answer to “what will be different?” is only the number, take the new job.

## When to walk away

Below your written walk-away figure. When the negotiation itself has been unpleasant — dismissiveness now is a preview. When you are pressed to accept verbally, today, before you have seen the written offer, which is the most reliable sign of a badly run company and sometimes of a fictitious job.

And do it well. Decline warmly and specifically, by email. Companies re-open roles, budgets change, and recruiters move between firms with their memory of you intact.

One conversation, done properly, is often worth a couple of lakh a year — and because every future offer is benchmarked against this one, the difference compounds for the rest of your working life. It is the highest-return twenty minutes in a job search.$md$,
    12,
    array['Salary', 'Negotiation', 'Offer Letters', 'CTC'],
    array['ctc-vs-in-hand-salary', 'interview-preparation-that-works', 'notice-period-and-relieving-letter'],
    'published',
    '2026-07-30'::timestamptz,
    null
  ),
  (
    'first-job-without-experience',
    'Getting Your First Job When Every Listing Asks for Experience',
    'Nearly every entry-level posting demands two years of experience. Here is how that filter actually works, and how freshers get through it.',
    'The experience requirement on an entry-level listing is usually a preference, not a gate. What to build, how many places to apply, and how to ask a stranger for a referral without being ignored.',
    'job-search',
    $md$You are looking at a posting titled “Junior Analyst.” The requirements say two to three years of experience. You have none, so you close the tab and move on.

That instinct costs freshers more opportunities than any skill gap does. Job descriptions in India are frequently written by copying an old one, or by a hiring manager listing everything they would ideally like rather than what they will actually hold out for. The number in the requirements is a preference far more often than it is a gate.

This is not an argument for applying to senior roles you cannot do. It is an argument for treating “2+ years” on an entry-level listing as a soft signal, and spending your effort on the things that genuinely move a fresher application forward.

## Work out what actually counts as experience

Most freshers have more than they list, because they apply an unnecessarily narrow definition. All of the following are legitimate experience, and all belong on your resume:

-   **Internships**, paid or unpaid, however short. A six-week internship where you shipped something real is worth more than a six-month one where you watched.
-   **Freelance work.** Three logos for a local restaurant, a WordPress site for your uncle's clinic, editing someone's thesis for a fee. This is client work. Name the deliverable and the outcome.
-   **Substantial college projects**, especially anything with a user other than your evaluator.
-   **Open-source contributions**, even small merged pull requests. A merged PR is a public record of your code passing someone else's review, which is rarer on a fresher resume than you might think.
-   **Running something.** A college fest budget, a 150-member society, a campus ambassador programme with targets you hit. Coordination and accountability transfer directly.
-   **Family business work.** Managing inventory, handling GST filings, running the shop's accounts. Many candidates leave this off out of embarrassment. It is often the most operationally real thing on the page.
-   **Tutoring and teaching.** Explaining hard things to people who do not want to hear them is a professional skill.

Write these up the way you would write up a job: what you did, at what scale, what changed. Do not apologise for them and do not label them “just” anything.

## Build one thing that is real

The fastest way to close an experience gap is to produce evidence that does not depend on anyone having employed you.

One genuine project beats a certificate stack, and the distinguishing feature of a genuine project is that it has users, or data, or a constraint that was not handed to you. A to-do app from a tutorial is not evidence. A scraper that tracks fee changes across the twenty colleges you applied to, with a small dashboard, is — because you chose the problem, hit real messy data, and made decisions.

Aim for something you can talk about for fifteen minutes, covering:

-   Why you built it and who it was for.
-   One decision you made and the alternative you rejected.
-   One thing that broke, and how you found out why.
-   What you would do differently now.

That last set of answers is what interviewers are actually probing for, and it is the part that cannot be borrowed.

Non-technical roles have the same logic. Marketing: run a small campaign for a local business and report the numbers. Finance: build a full three-statement model for a listed company and write the one-page thesis. Design: redesign a real Indian app's worst flow and document your reasoning, not just the screens. HR: nothing stops you from writing a proper JD and a structured interview scorecard for a role you have studied.

## Twenty considered applications, not two hundred sprayed ones

Mass applying feels productive because it produces volume, and volume is the only thing you can measure while you are waiting. But the response rate on an untailored application to a role you barely match is close enough to zero that two hundred of them is still roughly nothing.

A better ratio is twenty to thirty applications a week, where each one gets ten minutes: read the posting properly, reorder your resume bullets so the relevant ones are at the top, match the vocabulary, and — if there is any human name attached — send one short note.

Keep a simple tracker. Company, role, date applied, source, contact, status. Not for motivation, but because after four weeks it will tell you something you cannot otherwise see: which channels produce replies. Nearly everyone finds their replies are concentrated in one or two, and then they can stop spending time on the others.

## Referrals, and how to ask a stranger

A referred application is read. That is the whole advantage, and it is enormous. You do not need to know the person.

Find someone in a role adjacent to the one you want at that company — not the HR head, not the CEO. Someone two to four years in, who remembers being where you are and has some standing. Then send something that takes them under thirty seconds to read and one minute to act on:

> Hi Priya — I'm applying for the Junior Data Analyst role at Acme (JR-2481). I'm a 2026 B.Sc. Statistics grad; last month I built a dashboard tracking Bengaluru water tanker prices from municipal data, which is the closest thing I have to the work in the JD — repo here. Would you be willing to refer me, or tell me if I'm not a fit yet? Either answer is genuinely useful. Resume attached.

Why this works, when almost nothing else does:

-   It names the exact role and requisition number, so there is nothing to look up.
-   It offers one piece of concrete evidence, not a self-assessment.
-   It makes a single, specific request and explicitly permits a no. That removes the social cost of replying, which is the actual reason most such messages are ignored.
-   It is short. Nobody owes you five paragraphs of attention.

Send ten of these a week. Expect one or two replies, and do not follow up more than once — after seven days, one line, then let it go.

Your own batch is an underrated source. Seniors from your college who graduated one or two years ago are the single most likely group to help you, and the least likely to be asked.

## Certifications: which ones are worth the money

Certificates have a specific and limited job. They get you past a keyword filter and they signal that you have covered a defined syllabus. They do not substitute for evidence of work, and recruiters discount them heavily because they know how little some of them require.

Worth considering, if the target role genuinely asks for them:

-   Vendor certifications that are actually examined and named in postings — cloud platform associate-level credentials, for instance, in infrastructure roles.
-   Regulated qualifications where the certificate *is* the requirement: NISM modules for capital markets roles, CA or CS intermediate stages, actuarial papers.

Rarely worth the money:

-   Expensive “placement guarantee” bootcamps. Read the guarantee's fine print carefully — the placement promise is frequently conditional in ways that make it unenforceable, and some are funded by an income-share or loan agreement you sign on day one.
-   Any course whose completion needs nothing but watching the videos. The market knows.

If you have limited money, spend it on the exam that is externally invigilated rather than the course that is not.

## Answering the question you will always be asked

“We were looking for someone with experience. Why should we consider you?”

The failing answers are the two obvious ones: apologising, or overclaiming. What works is acknowledging the gap plainly and then redirecting to evidence.

> You're right that I haven't done this in a paid role. What I can point to is the inventory tool I built for my father's distribution business — it's been running fourteen months and cut stock-out incidents from about six a month to one. I know that's smaller than what you deal with. But the reason I'm confident is that I've already had to debug something other people depended on.

Concede the point, then move to something specific and true. Interviewers are not looking for you to pretend the gap is not there — they are checking whether you can be honest about a weakness without collapsing.

## The weeks in between

Job hunting as a fresher involves long stretches of no news, and the damage that does to your interviewing is real: by week six people start sounding defeated on calls, which reads as a lack of ability.

Two things help concretely.

**Keep building.** A project you shipped last month gives you something current to talk about and keeps the conversation about your work rather than your unemployment.

**Debrief every rejection you can.** When you are turned down after an interview, reply once, briefly, and ask what would have made the difference. Most will not answer. Perhaps one in five will, and that feedback is more accurate than anything you can guess at — several candidates discover their problem was something mechanical, like rambling past the four-minute mark on every answer, which is fixable in an afternoon once someone tells you.

Your first job is disproportionately hard to get and then rapidly stops mattering. Two years in, nobody will ask how you got it — only what you did once you were there.$md$,
    11,
    array['Freshers', 'Job Search', 'Internships', 'Referrals'],
    array['resume-that-gets-shortlisted', 'interview-preparation-that-works', 'ctc-vs-in-hand-salary'],
    'published',
    '2026-07-30'::timestamptz,
    null
  ),
  (
    'genuine-remote-jobs-from-india',
    'How to Find a Genuine Remote Job from India',
    'Remote means four different things on Indian job boards. How to tell them apart, how overseas roles are structured, and what changes when you are a contractor.',
    'Remote-in-India and remote-for-a-foreign-company are different jobs with different pay, tax and protection. What to check in a listing, and what nobody tells you about being paid from abroad.',
    'job-search',
    $md$“Remote” on an Indian job board covers four arrangements that differ enormously in pay, security and paperwork. Most of the disappointment in remote job hunting comes from candidates aiming at one and landing in another.

1.  **Work from home at an Indian company.** A normal salaried job, normal CTC, normal PF and gratuity, with the office optional. Often reversible at the company's discretion.
2.  **Hybrid.** Frequently listed as remote. Read for the number of office days and whether they are mandated.
3.  **Remote-first Indian company.** No office to be called back to. Rarer and generally better run for remote work.
4.  **Remote for a foreign company.** Structurally different in every respect — pay, contract type, tax, protections. This is the one people mean when they talk about remote work paying more, and the one with the most to get wrong.

## How overseas remote roles are structured

A company in Berlin or Austin that wants to hire you in Chennai has three options, and which one they choose changes your entire situation.

**Through an Employer of Record.** The foreign company contracts an EOR that has an Indian entity; the EOR employs you locally. You get an Indian employment contract, payslips, PF, gratuity, statutory leave and TDS handled for you. This is the best outcome for the employee by a wide margin, and increasingly common. Ask which EOR — the name tells you they have actually set it up.

**As an independent contractor.** The most common arrangement, and the one that shifts the most onto you. You invoice monthly, you are responsible for your own tax and compliance, and you have no PF, no gratuity, no notice period protection, no statutory leave and no employer-provided insurance. Termination clauses in contractor agreements are often two weeks either way.

**Through their own Indian subsidiary.** Then it is a normal Indian salaried job, usually with a global pay band applied to Indian salary structures.

A contractor rate should not equal a salary. You are absorbing the employer's PF contribution, gratuity, paid leave, insurance and employment risk — a contract rate needs to be meaningfully above the equivalent salary for it to be the same deal, and higher again to compensate for the lack of notice protection.

## The contractor paperwork nobody mentions

This is the part that surprises people six months in. Directional summary only — get a CA involved before your first invoice, because the cost of setting this up correctly is small and the cost of unpicking two years of it is not.

-   **You are running a business.** Income is business or professional income, not salary. No Form 16, no TDS deducted for you, and you file accordingly.
-   **Advance tax.** With no employer deducting TDS, you are expected to pay tax in quarterly instalments. Miss them and interest accrues. This is the single most common failure among new contractors.
-   **GST on export of services.** Services to a foreign client are treated as exports. Registration thresholds, the LUT route for exporting without paying IGST, and the documentation required are all specific — and getting this wrong retrospectively is expensive.
-   **FIRC or FIRA.** Your bank's certificate that money arrived from abroad as an export payment. You need these as proof of export. Ask your bank how to obtain them from your first payment onwards, not at the end of the year.
-   **Presumptive taxation.** Depending on your profession and turnover, a presumptive scheme may dramatically simplify your filing. Worth asking your CA about specifically.
-   **Your own insurance.** No group medical cover. Buy a personal health policy and treat the premium as a cost of the arrangement.
-   **Retirement is now your job.** No employer PF. NPS, PPF or ordinary investing — but somebody has to do it, and that somebody is you.

On getting paid: direct bank transfer is usually cheapest at scale but slower and sometimes awkward for the payer. Wise, Payoneer and similar services are convenient and take a spread. Compare the total cost including the exchange rate margin, not just the visible fee — on a monthly invoice the difference over a year is significant. Whatever you use, make sure you can still obtain export documentation for the receipts.

## Reading a remote listing properly

-   **“Remote (India)” versus “Remote (Anywhere).”** Many listings tagged remote are restricted to countries where the company can legally employ. Check before investing four rounds.
-   **Timezone requirements.** “Four hours of overlap with PST” means starting work in the evening and finishing after midnight, permanently. This is the single most underestimated term in overseas remote work, and it is the reason a lot of people leave otherwise good jobs.
-   **Employment type.** If the listing does not say whether this is employment or a contract, ask in the first call. It is not a rude question.
-   **Currency and structure.** Is the figure in USD or INR, gross or net, and who bears the exchange-rate risk?
-   **Signals of remote maturity.** A company that names its written-communication norms, documents decisions, and mentions async working has done this before. A listing that says “remote” and then requires daily stand-ups at 9am in another timezone has not.
-   **Equipment and stipend.** Who provides the laptop, and is there an internet or home-office allowance? Small, but it is a decent proxy for how seriously they treat remote staff.

## Remote listings attract a higher density of scams

Because the arrangement is legitimately unusual, the usual defences weaken: no office to visit, no colleagues to meet, cross-border payments that are hard to trace. Specific patterns to watch for:

-   Any request for a deposit for equipment, with reimbursement “on your first payslip.”
-   A cheque or transfer sent to you to “buy your own setup,” before you have worked a day. The payment reverses, the money you forwarded does not.
-   Being asked to receive and forward payments, or to open an account for the company. That is money laundering and you are the one holding the account.
-   A hiring process conducted entirely over Telegram with no video call at any point.
-   Requests to install unfamiliar remote-access software as part of “onboarding verification.”

The general verification routine — and what to do if you have already paid — is in [our guide to spotting a fake job posting](/blog/spot-a-fake-job-posting). For overseas employers, add one step: confirm the company exists in its own jurisdiction's companies register, and that the person interviewing you appears in its actual staff.

## Making yourself legible for remote work

Remote hiring assesses something office hiring does not: whether you can be relied on without supervision, and whether you write clearly enough to be understood by people who will never talk to you in person.

Which means, practically:

-   **Your writing is the interview.** Your application email, your take-home submission, your Slack messages during a trial. A well-structured written answer counts for more in a remote process than in any other kind.
-   **Public work matters more.** A repo, a blog, merged pull requests, a portfolio, answers on a public forum. It substitutes for the local reputation a remote employer cannot check.
-   **Show self-direction with evidence.** Something you scoped and finished without being told to, described in a sentence.
-   **Be explicit about timezone willingness**, and be honest about it. Agreeing to a schedule you cannot sustain is the most common way these roles end badly.

## The infrastructure that actually matters

Not an aesthetic desk setup. Two things determine whether you can hold a remote job in India:

-   **A second internet connection.** A mobile hotspot on a different network, tested. Broadband outages are routine and “my internet went down” stops being acceptable around the third time.
-   **Power backup.** A UPS for the router at minimum, and a laptop battery you have not destroyed. If you are on a night shift for a US timezone, this is not optional.

After that: a headset with a decent microphone, a door that closes if you can manage it, and a defined finish time. The last one is what keeps the job survivable — remote work with no boundary at the end of the day expands until it takes everything, and that is the reason most people give when they go back to an office.

## Keeping the job once you have it

The specific risk of remote work, particularly for the only person on the team in a different country, is invisibility. Work that nobody saw happening is work you may not get credit for, and in a difficult quarter the person the leadership team has never met is easier to let go.

The countermeasure is not longer hours. It is writing things down where others can see them: a short weekly summary of what you shipped and what is blocked, decisions documented in the shared channel rather than in direct messages, and a couple of relationships outside your immediate team. Twenty minutes a week, and it does more for your position than anything else available to you.$md$,
    12,
    array['Remote Work', 'Contractors', 'Job Search', 'Freelancing'],
    array['spot-a-fake-job-posting', 'ctc-vs-in-hand-salary', 'changing-careers-without-starting-over'],
    'published',
    '2026-07-30'::timestamptz,
    null
  ),
  (
    'changing-careers-without-starting-over',
    'Changing Careers Mid-Level Without Starting Over',
    'Switching fields at five or eight years in does not have to mean a fresher salary. How to move sideways instead of down, in stages.',
    'The costly mistake is treating a career change as a reset. The adjacent-move strategy, how to reframe experience the new field will value, and what a realistic pay dip looks like.',
    'career-growth',
    $md$Six years into mechanical engineering, you want to work in data. Eight years into banking operations, you want to do product. Four years into teaching, you want to work in learning design at a company.

The advice you will receive is either “you cannot, you are too deep” or “do a ₹3 lakh bootcamp and start fresh.” Both are wrong, and the second one is expensive. Most successful mid-career changes are neither a leap nor a reset — they are two or three deliberate sideways moves, each of which is individually credible.

## The mistake: treating it as a reset

Candidates changing fields routinely apply to entry-level roles, drop their salary by half, and describe their previous career as irrelevant.

This fails in both directions. You will be rejected from junior roles for being overqualified — a hiring manager filling a fresher position sees a 32-year-old with eight years of experience and assumes you will leave within a year, which is usually correct. And you will have discarded the thing that actually makes you employable in the new field: the domain knowledge nobody else applying has.

The bank operations person who wants to do product is not competing with product graduates. They are the only candidate who understands reconciliation, and a fintech building settlement tooling would rather have that than another generalist.

## Move adjacent, not across

An adjacent move keeps one thing constant and changes the other. There are two axes — your **function** (what you do) and your **domain** (the industry you do it in) — and changing one at a time is dramatically easier than changing both.

Same domain, new function:

-   Insurance claims processing to insurance business analyst. Same products, new skill.
-   Pharma quality control to pharma regulatory affairs.
-   Teaching to curriculum design at an edtech company.

Same function, new domain:

-   Manufacturing supply chain to e-commerce supply chain.
-   Agency copywriting to in-house content at a SaaS company.
-   Hospital HR to technology company HR.

Either of those is a story a hiring manager can accept in one sentence, and neither requires you to explain away your history. Two such moves, two or three years apart, will take you somewhere a single leap could not — mechanical engineering to manufacturing analytics to a data role, and the second move is now internal to your own resume.

The intermediate step is often available at your current employer, which makes it the cheapest version of this. An internal transfer to a role that touches your target function costs you no salary and no seniority, and after eighteen months you have relevant experience rather than an aspiration.

## Find out what the new field actually values

Before spending money on a course, spend two weeks on research. Read thirty job descriptions for your target role — properly, with a document open — and record what appears repeatedly.

Sort what you find into three lists:

-   **Already have it.** Usually longer than expected. Stakeholder management, working to a deadline, reading a P&L, writing a specification, handling a difficult client.
-   **Adjacent — one project away.** You know SQL but not Python; you have run projects but never written a PRD.
-   **Genuinely missing.** This list is what your learning budget is for, and it is normally much shorter than the marketing for any course implies.

Then talk to four people doing the job. Not for a referral — for calibration. “I'm moving from X into this. What did you underestimate?” is a question people answer generously, and the answers will not match the course syllabus. Frequently the real barrier turns out to be something unglamorous, like never having presented to a leadership team.

## Learn the shortest thing that produces evidence

The market does not reward certificates from career-changers, because everybody has one. It rewards evidence of doing the new work.

So the test for any course is whether it ends with something you can show. A twelve-week programme that produces one real project you can discuss beats a nine-month one that produces a PDF.

Better still, produce the evidence at work. This is the single highest- leverage move available to a career changer and it is consistently underused:

-   Volunteer for the project in your company that touches your target function. The analytics piece nobody wants. The migration. The vendor evaluation.
-   Solve a real problem in your current role using the new skill, even if nobody asked. An operations analyst who automates their own team's reporting in Python now has production Python experience with a business outcome attached, which is not a portfolio project — it is a job.
-   Offer it free, once, to a small organisation. An NGO or a local business will let you build the thing you cannot yet get paid to build.

Be careful with paid programmes promising job guarantees. Read the conditions closely, particularly where the fee is funded by an income-share or loan agreement — the guarantee is often defined narrowly enough that it cannot be invoked, and the loan is not conditional at all.

## Rewrite your resume for the new reader

The same fifteen-year history can read as irrelevant or as an unusual advantage depending entirely on how it is written. Nobody will do that translation for you.

**Lead with a summary that states the move.** Do not make the reader infer it:

> Operations manager, 7 years in retail banking, moving into product. Built and now own the branch reconciliation tool used by 40 branches — scoped it, wrote the spec, ran it with two developers. Looking for an associate product role in fintech where knowing how banking operations actually work is an advantage.

That paragraph does three things: it names the transition so it is not a puzzle, it presents concrete evidence of the target function, and it states why the old career is an asset rather than baggage.

**Rewrite your bullets in the new field's vocabulary.** The same work, described for a different reader:

-   Before: “Handled escalations from branch operations teams.”
-   After: “Ran the feedback loop between 40 branch teams and the technology group; translated recurring complaints into a prioritised list that shaped two quarters of the reconciliation roadmap.”

This is reframing, not fabrication — the underlying facts are unchanged. The line is that you must be able to defend every word in an interview.

**Reorder the page.** If your evidence for the new function sits in projects rather than job titles, put a “Relevant Projects” section above your work history.

## Be honest with yourself about the pay

A well-executed adjacent move is often lateral on salary, occasionally upwards. A genuine function-and-domain change usually costs something, and pretending otherwise leads people to accept an offer they resent within three months.

Rough expectations: an adjacent move where you bring relevant domain knowledge, flat to slightly up. A change into a field where you have a real portfolio but no professional history, a 10–25% dip that typically recovers within two years because you are progressing from a mid-level base rather than a fresher one. A complete reset into an entry-level role with no bridge, 40% or more, and it takes years.

Work out what dip you can actually absorb, for how long, before you start interviewing. Then negotiate on the things that are easier to grant than base pay — a six-month review, a title that reflects your seniority, a joining bonus to cover the transition. That is often available even when the salary band is not.

## The interview question you must have an answer to

“Why are you leaving a field you have spent seven years in?”

This is asked in every process, and it is a risk assessment: will you leave again in a year, and do you understand what you are moving into? The answer has to be forward-looking and specific.

> The part of my job I've consistently enjoyed most is the two years I spent specifying and running the reconciliation tool — deciding what to build and why. I want to do that as the job rather than as a side project. I'm not leaving banking; I'm staying in it and changing what I do inside it.

Avoid the two failing versions: criticising the field you are leaving, which reads as an unwillingness to be satisfied anywhere, and vague aspiration — “I've always been passionate about technology” — which invites the obvious follow-up about what you have actually done about it.

## Expect the search to take longer

Career changers get a lower response rate, and the reason is mechanical rather than personal: keyword filters and screening recruiters both work by matching your last title to the open one.

Which changes where you should spend your effort. Cold applications through portals work poorly for this profile. What works is warm routes — referrals from people in the target field, hiring managers approached directly with your evidence attached, smaller companies where a human reads every application and one person makes the decision, and internal moves.

Give it six to nine months rather than six to nine weeks, and start producing the evidence while you still have the salary. Almost everyone who does this successfully began the change eighteen months before they changed jobs.$md$,
    11,
    array['Career Change', 'Career Growth', 'Upskilling', 'Mid-Career'],
    array['resume-that-gets-shortlisted', 'negotiate-salary-in-india', 'interview-preparation-that-works'],
    'published',
    '2026-07-30'::timestamptz,
    null
  )
on conflict (slug) do nothing;
