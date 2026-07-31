import Link from "next/link";

import type { Article } from "@/types/blog";

export const article: Article = {
  slug: "spot-a-fake-job-posting",
  title: "How to Spot a Fake Job Posting Before It Costs You",
  description:
    "Job scams in India follow a small number of scripts. The red flags, a ten-minute verification routine, and what to do if you have already paid.",
  excerpt:
    "One rule eliminates most of it: no legitimate employer charges you to be hired. Here are the patterns behind registration fees, WhatsApp interviews and instant offer letters — and how to check a company yourself.",
  category: "job-search",
  publishedAt: "2026-07-30",
  readingMinutes: 11,
  tags: ["Job Scams", "Fraud", "Safety", "Job Search"],
  related: [
    "genuine-remote-jobs-from-india",
    "resume-that-gets-shortlisted",
    "first-job-without-experience",
  ],
  body: (
    <>
      <p>
        Job fraud works because it targets people at their least sceptical. A
        candidate four months into a search, watching their savings fall, is sent
        an offer letter with a real company&apos;s logo on it and asked for
        ₹2,500 as a refundable registration fee. The amount is small enough to
        seem reasonable and the moment is the worst possible one to be careful.
      </p>
      <p>
        The reassuring part is that these scams are not sophisticated. There are
        perhaps six scripts in circulation and they all leave the same marks.
        Learn them once.
      </p>

      <h2>The one rule that eliminates most of it</h2>
      <p>
        <strong>A legitimate employer never asks you for money.</strong>
      </p>
      <p>
        Not a registration fee. Not a security deposit. Not a training or
        certification charge, a laptop deposit, a courier fee for your welcome
        kit, a background verification fee, a &ldquo;processing&rdquo; charge, or
        anything described as refundable. Not payment to a consultant who
        &ldquo;guarantees&rdquo; placement in a named company.
      </p>
      <p>
        Real recruitment costs the employer money and they pay it. If anyone in
        the process asks you to pay, transfer, deposit or buy something, the
        process is fraudulent. There is no exception worth entertaining, and the
        word &ldquo;refundable&rdquo; is a feature of the script, not a
        protection.
      </p>

      <h2>Red flags in the posting itself</h2>
      <ul>
        <li>
          <strong>Pay far above the market for the work described.</strong>{" "}
          &ldquo;Data entry, work from home, no experience, ₹35,000/month&rdquo;
          describes a job that does not exist. Data entry is among the most
          commoditised work there is.
        </li>
        <li>
          <strong>No named company</strong>, or only &ldquo;a leading MNC&rdquo;
          / &ldquo;our reputed client.&rdquo; Some genuine consultants withhold
          the client name early on, so this alone is not proof — but combined with
          anything else here, treat it as decisive.
        </li>
        <li>
          <strong>Vague responsibilities and no real requirements.</strong> A
          genuine JD is specific because a real manager wrote it about real work.
        </li>
        <li>
          <strong>Unlimited openings, permanent urgency.</strong>{" "}
          &ldquo;Hiring 500 candidates, immediate joining&rdquo; is a funnel, not
          a role.
        </li>
        <li>
          <strong>A free email domain for a corporate role.</strong> An
          &ldquo;HR Manager&rdquo; at a large company writing from a Gmail,
          Outlook or Yahoo address is a serious flag. So is a near-miss domain:{" "}
          <em>@tcs-careers.com</em>, <em>@infosys-hr.net</em>, or a name with a
          letter swapped that you will not notice unless you look for it.
        </li>
        <li>
          <strong>Language errors throughout.</strong> Not the odd typo, but
          consistently broken phrasing in what claims to be corporate
          communication.
        </li>
      </ul>

      <h2>Red flags in the process</h2>
      <ul>
        <li>
          <strong>An offer with no real interview.</strong> Selection after a
          five-minute chat, or purely over text, does not happen for salaried
          work.
        </li>
        <li>
          <strong>The entire process on WhatsApp or Telegram.</strong> Recruiters
          do use WhatsApp for scheduling. They do not conduct hiring in it, and
          Telegram in particular is used because the accounts are disposable.
        </li>
        <li>
          <strong>An offer letter within hours.</strong> Real approvals take
          days. Instant offer letters are template documents with your name
          pasted in, and the accompanying urgency exists to stop you checking.
        </li>
        <li>
          <strong>Interviews at odd hours from personal numbers</strong>, with no
          calendar invite, no company video platform, no email trail.
        </li>
        <li>
          <strong>Pressure and deadlines.</strong> &ldquo;This slot closes in two
          hours.&rdquo; Manufactured scarcity is the core mechanism of the whole
          category.
        </li>
        <li>
          <strong>Sensitive documents requested too early.</strong> Aadhaar,
          PAN, bank account details, a cancelled cheque, your date of birth — all
          legitimately needed <em>after</em> you accept a written offer, for
          payroll and PF. Never during screening. Your Aadhaar and PAN together
          are enough to attempt loans and accounts in your name.
        </li>
        <li>
          <strong>Anyone asking for an OTP.</strong> No employer needs one, for
          anything, ever. An OTP request is always an attack in progress.
        </li>
        <li>
          <strong>Being asked to install remote-access software</strong> — screen
          sharing tools you have not heard of, or an APK sent over chat — to
          &ldquo;complete verification&rdquo; or receive your salary.
        </li>
      </ul>

      <h2>The specific scripts to know</h2>
      <h3>Recruiter impersonation</h3>
      <p>
        The most convincing variant, because the company is real. Someone
        registers a lookalike domain, copies a genuine JD, and runs an entire
        process using a real firm&apos;s name and branding. The fee request
        arrives at the offer stage, when your guard is lowest.
      </p>
      <p>
        The defence is simple and absolute: <strong>go to the company&apos;s own
        careers page and confirm the role exists there</strong>, then contact the
        company through a number or address you found yourself. Never through the
        contact details in the message.
      </p>

      <h3>Task and commission scams</h3>
      <p>
        Marketed as &ldquo;online part-time work,&rdquo; &ldquo;digital
        marketing&rdquo; or &ldquo;app reviews.&rdquo; You complete simple tasks,
        earn ₹150, and get paid — which is the hook, because now it seems real.
        Then the tasks require you to prepay to unlock a higher tier, or to fund
        a &ldquo;merchant order&rdquo; you will be reimbursed for with
        commission. Early withdrawals succeed; the large one never does.
      </p>
      <p>
        Any arrangement where you send money in order to earn money is not
        employment, whatever it is called.
      </p>

      <h3>The placement consultancy that charges candidates</h3>
      <p>
        Charges ₹5,000 to ₹25,000 for &ldquo;registration&rdquo; and a promised
        number of interviews. Some are outright fraud; others technically deliver
        worthless interviews and are therefore hard to pursue. Genuine
        recruitment consultants are paid by the employer, as a percentage of the
        placed candidate&apos;s salary. That is the entire business model.
      </p>

      <h3>Data harvesting</h3>
      <p>
        Some fake postings do not want your money at all — they want a verified
        resume with a working phone number, which sells. If you applied to
        something that then went silent and you began receiving loan and
        insurance calls, you have probably found the reason. Keep your full postal
        address off your resume, and treat any &ldquo;application form&rdquo;
        asking for Aadhaar number, salary slips or family details before an
        interview as a collection exercise.
      </p>

      <h2>Ten minutes of verification</h2>
      <p>Before you invest any further effort in a suspicious posting:</p>
      <ol>
        <li>
          <strong>Search the company name with &ldquo;fraud,&rdquo;
          &ldquo;scam&rdquo; and &ldquo;review.&rdquo;</strong> Trivial, and it
          resolves a surprising share of cases immediately.
        </li>
        <li>
          <strong>Check the company exists on the MCA register.</strong> The
          Ministry of Corporate Affairs runs a free master-data lookup at{" "}
          <a
            href="https://www.mca.gov.in"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            mca.gov.in
          </a>
          . You can confirm the CIN, incorporation date, registered address and
          directors. A company claiming twenty years of operation and
          incorporated eight months ago has answered your question.
        </li>
        <li>
          <strong>Look at the website properly.</strong> Is there a registered
          address, a landline, a GSTIN in the footer? Are the team photographs
          reverse-image-searchable to a stock library? Was the domain registered
          three weeks ago?
        </li>
        <li>
          <strong>Cross-check the role on the careers page</strong> — the
          company&apos;s own, reached by typing the domain yourself.
        </li>
        <li>
          <strong>Check the recruiter on LinkedIn.</strong> An account created
          last month, with few connections and no history at the company, is not a
          recruiter. Also sanity-check the company page: a firm claiming 5,000
          employees with eleven on LinkedIn is not real.
        </li>
        <li>
          <strong>Call the company&apos;s published switchboard</strong> and ask
          whether the person and the role exist. Two minutes, and it defeats
          impersonation entirely.
        </li>
        <li>
          <strong>Read the email headers</strong> if you can. Reply-to addresses
          on a different domain from the sender are a common tell.
        </li>
      </ol>

      <h2>If you have already paid</h2>
      <p>
        Act the same day — recovery odds fall sharply with time, and this is worth
        doing even for small amounts, because the reports are what build cases.
      </p>
      <ul>
        <li>
          <strong>Call 1930</strong>, the national cybercrime financial fraud
          helpline. Reporting within the first hours materially improves the
          chance that the receiving account can be frozen.
        </li>
        <li>
          <strong>File a complaint at{" "}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            cybercrime.gov.in
          </a></strong>
          , the Government of India portal. Keep the acknowledgement number.
        </li>
        <li>
          <strong>Notify your bank in writing</strong> and ask them to raise a
          dispute. If you paid by card there may be a chargeback route; UPI and
          IMPS transfers are harder but the beneficiary account can still be
          flagged.
        </li>
        <li>
          <strong>Preserve everything</strong> — screenshots of the chat, the
          posting, the offer letter, transaction references, phone numbers, UPI
          IDs. Do not delete the conversation, however much you want to.
        </li>
        <li>
          <strong>If you shared Aadhaar or PAN</strong>, check your credit report
          for enquiries you did not make, and keep checking for a few months.
        </li>
        <li>
          <strong>Tell the real company</strong> whose name was used. They
          generally have a fraud reporting address and an active interest in
          shutting the lookalike domain down.
        </li>
      </ul>
      <p>
        And do not carry it as a personal failure. These scripts are built by
        people who run them thousands of times and refine what works. Being
        deceived by a professional deception says very little about you.
      </p>

      <h2>What we do at our end</h2>
      <p>
        Every listing on this site is reviewed by a person before it is
        published, and we remove roles that go quiet or turn out to be
        misrepresented. We will never ask you to pay to apply, and no employer
        listed here is permitted to.
      </p>
      <p>
        That review is not infallible. If a listing you found through us asks you
        for money, requests documents before an offer, or does not match the
        company it claims to be from, please{" "}
        <Link href="/contact">tell us</Link> — with the listing link and a
        screenshot if you have one. We investigate the same week, and one report
        usually
        protects a lot of people who would have applied after you.
      </p>
    </>
  ),
};
