import type { Article } from "@/types/blog";

export const article: Article = {
  slug: "resume-that-gets-shortlisted",
  title: "How to Write a Resume That Actually Gets Shortlisted in India",
  description:
    "A recruiter gives your resume about twenty seconds. Here is what to put in those twenty seconds, what to cut, and how to survive the ATS.",
  excerpt:
    "Most resumes are rejected for reasons that have nothing to do with the candidate's ability. A practical walkthrough of the format, the bullet points, and the Indian-market conventions that are safe to drop.",
  category: "resume",
  publishedAt: "2026-07-30",
  readingMinutes: 10,
  tags: ["Resume", "ATS", "Freshers", "Job Applications"],
  related: [
    "first-job-without-experience",
    "interview-preparation-that-works",
    "spot-a-fake-job-posting",
  ],
  body: (
    <>
      <p>
        A recruiter filling one role in a mid-sized Indian company will often
        receive several hundred applications. They are not reading your resume.
        They are scanning it — for about twenty seconds — looking for a reason to
        move it to the shortlist pile or the other one.
      </p>
      <p>
        That is not laziness, it is arithmetic. And it means the resume that gets
        shortlisted is rarely the one belonging to the best candidate. It is the
        one that made its case fastest. Almost everything below follows from
        that single constraint.
      </p>

      <h2>Keep it to one page until you have ten years behind you</h2>
      <p>
        One page. Two only if you genuinely have a decade of relevant work, or
        you are in academia or research where publications matter. Three pages
        for a candidate with four years of experience does not read as thorough;
        it reads as someone who cannot tell what matters.
      </p>
      <p>
        If you cannot fit it, you are not short of space — you are including
        things that are not earning their place. The school you attended, the
        summer workshop, the six-line paragraph about a role you held for three
        months in 2019.
      </p>

      <h2>The header: less than you think</h2>
      <p>Include, in one compact block at the top:</p>
      <ul>
        <li>Your name, in the largest type on the page.</li>
        <li>
          One phone number — the one you will actually answer, with country code
          if you are applying outside India.
        </li>
        <li>
          A professional email address. <strong>firstname.lastname@</strong> at
          Gmail is fine. A college email you are about to lose access to is not,
          and neither is the address you made in class nine.
        </li>
        <li>City and state. That is enough.</li>
        <li>
          One or two links that add evidence — LinkedIn, GitHub, a portfolio,
          Behance. Only if they are current and worth opening.
        </li>
      </ul>
      <p>Leave out, with no hesitation:</p>
      <ul>
        <li>
          <strong>Your photograph.</strong> Standard on Indian resume templates,
          and a liability. It invites bias, it breaks parsing in some systems,
          and outside a handful of fields nobody needs it.
        </li>
        <li>
          <strong>Father&apos;s or husband&apos;s name, date of birth, gender,
          marital status, nationality, religion, caste.</strong> None of it is
          relevant to whether you can do the job. These fields are a hangover
          from government application forms and they do not belong on a private
          sector resume.
        </li>
        <li>
          <strong>Your full postal address.</strong> Nobody is posting you a
          letter, and it is unnecessary personal data sitting on job portals.
        </li>
        <li>
          <strong>The word &ldquo;Resume&rdquo; or
          &ldquo;Curriculum Vitae&rdquo; as a heading.</strong> The reader knows.
        </li>
      </ul>

      <h2>Three lines of summary, or none at all</h2>
      <p>
        A summary is worth including only if it says something specific. Compare:
      </p>
      <blockquote>
        Hardworking and passionate professional seeking a challenging position in
        a reputed organisation where I can utilise my skills and grow with the
        company.
      </blockquote>
      <p>
        That sentence appears on a hundred thousand Indian resumes and conveys
        nothing. It could be attached to any candidate applying for any role.
        Now:
      </p>
      <blockquote>
        Backend developer, 3 years on Java and Spring Boot, currently running the
        payments integration for a 200k-user fintech app. Looking for a role with
        more ownership of system design.
      </blockquote>
      <p>
        The second one tells a recruiter what you are, what scale you have
        operated at, and what you want. If you cannot write something in that
        register, delete the section and give the space to your experience.
      </p>

      <h2>Bullets that carry weight</h2>
      <p>
        This is where most resumes are won and lost. The default failure is to
        describe your job description rather than your work. A useful bullet has
        three parts: <strong>what you did</strong>,{" "}
        <strong>at what scale</strong>, and <strong>what changed as a
        result</strong>.
      </p>
      <p>Weak:</p>
      <blockquote>
        Responsible for handling social media accounts of the company.
      </blockquote>
      <p>Better:</p>
      <blockquote>
        Ran Instagram and LinkedIn for a D2C skincare brand; grew combined
        following from 4k to 31k in 11 months and took social from 6% to 22% of
        monthly web traffic.
      </blockquote>
      <p>
        You do not need a dramatic number for every line. You need a specific
        one. &ldquo;Reduced monthly closing from 9 days to 5&rdquo; is more
        persuasive than &ldquo;streamlined accounting processes,&rdquo; and it is
        harder to fake, which is exactly why it reads as credible.
      </p>
      <p>
        If you genuinely have no metrics — common in support functions and in
        early roles — substitute scope. How many clients, how large a codebase,
        how many invoices a month, how many people you trained. Scale is a number
        too.
      </p>
      <p>
        Start each bullet with a verb in the past tense (present tense for your
        current role), and never with &ldquo;Responsible for.&rdquo; Four to six
        bullets for your most recent role, two or three for older ones.
      </p>

      <h2>The ATS, minus the mythology</h2>
      <p>
        Applicant tracking systems are widely misunderstood. They are not AI
        gatekeepers scoring you out of a hundred. Most are databases: they parse
        your file into fields, and a recruiter then searches and filters that
        database. Your job is simply to parse cleanly and match the search.
      </p>
      <p>Practical consequences:</p>
      <ul>
        <li>
          <strong>Single column.</strong> Two-column templates from Canva often
          parse into interleaved nonsense. This is the single most common
          self-inflicted rejection.
        </li>
        <li>
          <strong>No tables, text boxes, images or icons</strong> holding real
          information. Nothing in the page header or footer, which many parsers
          skip entirely — including your phone number, if you put it there.
        </li>
        <li>
          <strong>Standard section headings.</strong> &ldquo;Work
          Experience,&rdquo; &ldquo;Education,&rdquo; &ldquo;Skills.&rdquo; Not
          &ldquo;My Journey&rdquo; or &ldquo;Where I&apos;ve Been.&rdquo;
        </li>
        <li>
          <strong>Dates in a consistent, obvious format</strong> —{" "}
          <em>Mar 2023 – Present</em> — on every entry.
        </li>
        <li>
          <strong>A text-based PDF</strong> unless the posting asks for .docx.
          Never a scan or a screenshot of your resume. If you can select the text
          in your PDF reader, a parser can too.
        </li>
        <li>
          <strong>Use the words the posting uses.</strong> If it says
          &ldquo;Power BI&rdquo; and your resume says &ldquo;business
          intelligence dashboards,&rdquo; you will not appear in the search for
          Power BI. This is not keyword stuffing — it is using the same
          vocabulary as your reader, for skills you actually have.
        </li>
      </ul>
      <p>
        Name the file <strong>Firstname-Lastname-Resume.pdf</strong>. A recruiter
        with forty files named <em>resume_final(2).pdf</em> in their downloads
        folder will remember the one they can find.
      </p>

      <h2>Freshers: projects are your experience section</h2>
      <p>
        If you have no full-time work history, your resume should be ordered:
        education, projects, internships, skills. And the projects section should
        be the largest thing on the page.
      </p>
      <p>
        Treat each project like a job. What was the problem, what did you build,
        what did you build it with, and what came of it. A live link or a repo
        beats any description. Two substantial projects you can discuss for
        fifteen minutes are worth more than six tutorials you followed — and an
        interviewer can tell the difference within two questions.
      </p>
      <p>
        Include coursework only if it is directly relevant and specific. A line
        listing &ldquo;Data Structures, DBMS, Operating Systems&rdquo; adds
        nothing that your degree title did not already imply.
      </p>

      <h2>Skills: a list, not a scoreboard</h2>
      <p>
        Group skills into two or three plain lines — languages and frameworks,
        tools, domain skills. Then stop.
      </p>
      <p>
        Delete the star ratings and the percentage bars. Nobody has a calibrated
        scale for &ldquo;Python: 80%,&rdquo; the reader knows it is a guess, and
        graphical bars parse as garbage. Also cut anything you would not want to
        be questioned on. Listing a skill is an invitation, and interviewers
        accept it.
      </p>

      <h2>What to cut from an Indian resume, specifically</h2>
      <ul>
        <li>
          <strong>The declaration.</strong> &ldquo;I hereby declare that the
          above information is true to the best of my knowledge,&rdquo; with a
          place and signature. It has no legal weight in a private job
          application and takes a fifth of your page.
        </li>
        <li>
          <strong>&ldquo;References available on request.&rdquo;</strong>
          Assumed. They will ask.
        </li>
        <li>
          <strong>Class 10 and 12 percentages</strong>, once you have a degree
          and any work experience. Keep them only for campus applications and
          roles that explicitly ask.
        </li>
        <li>
          <strong>Hobbies</strong>, unless genuinely relevant or genuinely
          distinctive. &ldquo;Reading, music, travelling&rdquo; is filler.
          &ldquo;Ranked state-level chess&rdquo; is a fact about you.
        </li>
        <li>
          <strong>Expected or current CTC.</strong> Never on the resume. That is
          a conversation, and putting a number on paper before it starts only
          ever costs you.
        </li>
      </ul>

      <h2>Handling the awkward bits</h2>
      <p>
        <strong>Employment gaps.</strong> Do not hide them by removing dates —
        that reads as evasion and gets caught in background verification anyway.
        Name the gap in one neutral line: a health matter, family
        responsibilities, exam preparation, a period of upskilling with the
        course named. A stated gap is a non-issue; an unexplained one is a
        question mark on every screening call.
      </p>
      <p>
        <strong>Short stints.</strong> One three-month role is noise. Three in a
        row invite a question, so pre-empt it — &ldquo;contract engagement,
        3-month scope&rdquo; costs you four words and closes the topic.
      </p>
      <p>
        <strong>A career change.</strong> Lead with a summary that connects the
        two, and rewrite your old bullets to emphasise the transferable part.
        Nobody will do that translation for you.
      </p>

      <h2>Tailor, but only the top third</h2>
      <p>
        Rewriting your resume from scratch for every application is not
        sustainable, and the returns are concentrated anyway. Keep one strong
        master resume, then for each application adjust three things: the
        summary, the order of your bullets so the most relevant ones sit at the
        top, and the skills line to match the posting&apos;s vocabulary. Ten
        minutes, and it addresses most of what a tailored resume actually buys
        you.
      </p>

      <h2>Before you send it</h2>
      <ul>
        <li>Open the PDF on a phone. Most recruiters will.</li>
        <li>
          Read it aloud. Every typo you have missed four times will surface.
        </li>
        <li>
          Check that every date, title and company name matches what your
          payslips and offer letters say. Background verification checks this,
          and a mismatch you introduced casually can cost you an offer after you
          have resigned.
        </li>
        <li>
          Hand it to someone outside your field for twenty seconds, then ask
          them what you do. If they cannot say, the resume is not working yet.
        </li>
      </ul>
      <p>
        None of this makes a weak application strong. What it does is stop a
        strong application from being discarded for reasons that had nothing to
        do with you — which, on the evidence of most inboxes, is where the
        majority of good candidates are lost.
      </p>
    </>
  ),
};
