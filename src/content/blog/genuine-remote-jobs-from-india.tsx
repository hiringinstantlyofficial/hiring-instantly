import Link from "next/link";

import type { Article } from "@/types/blog";

export const article: Article = {
  slug: "genuine-remote-jobs-from-india",
  title: "How to Find a Genuine Remote Job from India",
  description:
    "Remote means four different things on Indian job boards. How to tell them apart, how overseas roles are structured, and what changes when you are a contractor.",
  excerpt:
    "Remote-in-India and remote-for-a-foreign-company are different jobs with different pay, tax and protection. What to check in a listing, and what nobody tells you about being paid from abroad.",
  category: "job-search",
  publishedAt: "2026-07-30",
  readingMinutes: 12,
  tags: ["Remote Work", "Contractors", "Job Search", "Freelancing"],
  related: [
    "spot-a-fake-job-posting",
    "ctc-vs-in-hand-salary",
    "changing-careers-without-starting-over",
  ],
  body: (
    <>
      <p>
        &ldquo;Remote&rdquo; on an Indian job board covers four arrangements that
        differ enormously in pay, security and paperwork. Most of the
        disappointment in remote job hunting comes from candidates aiming at one
        and landing in another.
      </p>
      <ol>
        <li>
          <strong>Work from home at an Indian company.</strong> A normal salaried
          job, normal CTC, normal PF and gratuity, with the office optional. Often
          reversible at the company&apos;s discretion.
        </li>
        <li>
          <strong>Hybrid.</strong> Frequently listed as remote. Read for the
          number of office days and whether they are mandated.
        </li>
        <li>
          <strong>Remote-first Indian company.</strong> No office to be called
          back to. Rarer and generally better run for remote work.
        </li>
        <li>
          <strong>Remote for a foreign company.</strong> Structurally different in
          every respect — pay, contract type, tax, protections. This is the one
          people mean when they talk about remote work paying more, and the one
          with the most to get wrong.
        </li>
      </ol>

      <h2>How overseas remote roles are structured</h2>
      <p>
        A company in Berlin or Austin that wants to hire you in Chennai has three
        options, and which one they choose changes your entire situation.
      </p>
      <p>
        <strong>Through an Employer of Record.</strong> The foreign company
        contracts an EOR that has an Indian entity; the EOR employs you locally.
        You get an Indian employment contract, payslips, PF, gratuity, statutory
        leave and TDS handled for you. This is the best outcome for the employee
        by a wide margin, and increasingly common. Ask which EOR — the name tells
        you they have actually set it up.
      </p>
      <p>
        <strong>As an independent contractor.</strong> The most common
        arrangement, and the one that shifts the most onto you. You invoice
        monthly, you are responsible for your own tax and compliance, and you have
        no PF, no gratuity, no notice period protection, no statutory leave and no
        employer-provided insurance. Termination clauses in contractor agreements
        are often two weeks either way.
      </p>
      <p>
        <strong>Through their own Indian subsidiary.</strong> Then it is a normal
        Indian salaried job, usually with a global pay band applied to Indian
        salary structures.
      </p>
      <p>
        A contractor rate should not equal a salary. You are absorbing the
        employer&apos;s PF contribution, gratuity, paid leave, insurance and
        employment risk — a contract rate needs to be meaningfully above the
        equivalent salary for it to be the same deal, and higher again to
        compensate for the lack of notice protection.
      </p>

      <h2>The contractor paperwork nobody mentions</h2>
      <p>
        This is the part that surprises people six months in. Directional summary
        only — get a CA involved before your first invoice, because the cost of
        setting this up correctly is small and the cost of unpicking two years of
        it is not.
      </p>
      <ul>
        <li>
          <strong>You are running a business.</strong> Income is business or
          professional income, not salary. No Form 16, no TDS deducted for you,
          and you file accordingly.
        </li>
        <li>
          <strong>Advance tax.</strong> With no employer deducting TDS, you are
          expected to pay tax in quarterly instalments. Miss them and interest
          accrues. This is the single most common failure among new contractors.
        </li>
        <li>
          <strong>GST on export of services.</strong> Services to a foreign
          client are treated as exports. Registration thresholds, the LUT route
          for exporting without paying IGST, and the documentation required are
          all specific — and getting this wrong retrospectively is expensive.
        </li>
        <li>
          <strong>FIRC or FIRA.</strong> Your bank&apos;s certificate that money
          arrived from abroad as an export payment. You need these as proof of
          export. Ask your bank how to obtain them from your first payment
          onwards, not at the end of the year.
        </li>
        <li>
          <strong>Presumptive taxation.</strong> Depending on your profession and
          turnover, a presumptive scheme may dramatically simplify your filing.
          Worth asking your CA about specifically.
        </li>
        <li>
          <strong>Your own insurance.</strong> No group medical cover. Buy a
          personal health policy and treat the premium as a cost of the
          arrangement.
        </li>
        <li>
          <strong>Retirement is now your job.</strong> No employer PF. NPS,
          PPF or ordinary investing — but somebody has to do it, and that somebody
          is you.
        </li>
      </ul>
      <p>
        On getting paid: direct bank transfer is usually cheapest at scale but
        slower and sometimes awkward for the payer. Wise, Payoneer and similar
        services are convenient and take a spread. Compare the total cost
        including the exchange rate margin, not just the visible fee — on a
        monthly invoice the difference over a year is significant. Whatever you
        use, make sure you can still obtain export documentation for the
        receipts.
      </p>

      <h2>Reading a remote listing properly</h2>
      <ul>
        <li>
          <strong>&ldquo;Remote (India)&rdquo; versus &ldquo;Remote
          (Anywhere).&rdquo;</strong> Many listings tagged remote are restricted
          to countries where the company can legally employ. Check before
          investing four rounds.
        </li>
        <li>
          <strong>Timezone requirements.</strong> &ldquo;Four hours of overlap
          with PST&rdquo; means starting work in the evening and finishing after
          midnight, permanently. This is the single most underestimated term in
          overseas remote work, and it is the reason a lot of people leave
          otherwise good jobs.
        </li>
        <li>
          <strong>Employment type.</strong> If the listing does not say whether
          this is employment or a contract, ask in the first call. It is not a
          rude question.
        </li>
        <li>
          <strong>Currency and structure.</strong> Is the figure in USD or INR,
          gross or net, and who bears the exchange-rate risk?
        </li>
        <li>
          <strong>Signals of remote maturity.</strong> A company that names its
          written-communication norms, documents decisions, and mentions async
          working has done this before. A listing that says &ldquo;remote&rdquo;
          and then requires daily stand-ups at 9am in another timezone has not.
        </li>
        <li>
          <strong>Equipment and stipend.</strong> Who provides the laptop, and is
          there an internet or home-office allowance? Small, but it is a decent
          proxy for how seriously they treat remote staff.
        </li>
      </ul>

      <h2>Remote listings attract a higher density of scams</h2>
      <p>
        Because the arrangement is legitimately unusual, the usual defences
        weaken: no office to visit, no colleagues to meet, cross-border payments
        that are hard to trace. Specific patterns to watch for:
      </p>
      <ul>
        <li>
          Any request for a deposit for equipment, with reimbursement
          &ldquo;on your first payslip.&rdquo;
        </li>
        <li>
          A cheque or transfer sent to you to &ldquo;buy your own
          setup,&rdquo; before you have worked a day. The payment reverses, the
          money you forwarded does not.
        </li>
        <li>
          Being asked to receive and forward payments, or to open an account for
          the company. That is money laundering and you are the one holding the
          account.
        </li>
        <li>
          A hiring process conducted entirely over Telegram with no video call at
          any point.
        </li>
        <li>
          Requests to install unfamiliar remote-access software as part of
          &ldquo;onboarding verification.&rdquo;
        </li>
      </ul>
      <p>
        The general verification routine — and what to do if you have already
        paid — is in{" "}
        <Link href="/blog/spot-a-fake-job-posting">
          our guide to spotting a fake job posting
        </Link>
        . For overseas employers, add one step: confirm the company exists in its
        own jurisdiction&apos;s companies register, and that the person
        interviewing you appears in its actual staff.
      </p>

      <h2>Making yourself legible for remote work</h2>
      <p>
        Remote hiring assesses something office hiring does not: whether you can
        be relied on without supervision, and whether you write clearly enough to
        be understood by people who will never talk to you in person.
      </p>
      <p>Which means, practically:</p>
      <ul>
        <li>
          <strong>Your writing is the interview.</strong> Your application email,
          your take-home submission, your Slack messages during a trial. A
          well-structured written answer counts for more in a remote process than
          in any other kind.
        </li>
        <li>
          <strong>Public work matters more.</strong> A repo, a blog, merged pull
          requests, a portfolio, answers on a public forum. It substitutes for
          the local reputation a remote employer cannot check.
        </li>
        <li>
          <strong>Show self-direction with evidence.</strong> Something you
          scoped and finished without being told to, described in a sentence.
        </li>
        <li>
          <strong>Be explicit about timezone willingness</strong>, and be honest
          about it. Agreeing to a schedule you cannot sustain is the most common
          way these roles end badly.
        </li>
      </ul>

      <h2>The infrastructure that actually matters</h2>
      <p>
        Not an aesthetic desk setup. Two things determine whether you can hold a
        remote job in India:
      </p>
      <ul>
        <li>
          <strong>A second internet connection.</strong> A mobile hotspot on a
          different network, tested. Broadband outages are routine and
          &ldquo;my internet went down&rdquo; stops being acceptable around the
          third time.
        </li>
        <li>
          <strong>Power backup.</strong> A UPS for the router at minimum, and a
          laptop battery you have not destroyed. If you are on a night shift for
          a US timezone, this is not optional.
        </li>
      </ul>
      <p>
        After that: a headset with a decent microphone, a door that closes if you
        can manage it, and a defined finish time. The last one is what keeps the
        job survivable — remote work with no boundary at the end of the day
        expands until it takes everything, and that is the reason most people
        give when they go back to an office.
      </p>

      <h2>Keeping the job once you have it</h2>
      <p>
        The specific risk of remote work, particularly for the only person on the
        team in a different country, is invisibility. Work that nobody saw
        happening is work you may not get credit for, and in a difficult quarter
        the person the leadership team has never met is easier to let go.
      </p>
      <p>
        The countermeasure is not longer hours. It is writing things down where
        others can see them: a short weekly summary of what you shipped and what
        is blocked, decisions documented in the shared channel rather than in
        direct messages, and a couple of relationships outside your immediate
        team. Twenty minutes a week, and it does more for your position than
        anything else available to you.
      </p>
    </>
  ),
};
