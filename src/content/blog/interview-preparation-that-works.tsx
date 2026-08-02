import Link from "next/link";

import type { Article } from "@/types/blog";

export const article: Article = {
  slug: "interview-preparation-that-works",
  title: "Interview Preparation That Actually Moves the Needle",
  description:
    "With 48 hours before an interview, most preparation is wasted on the wrong things. What to do instead, in priority order.",
  excerpt:
    "Preparation is triage, not memorisation. The five stories worth having ready, the most common failure mode nobody warns you about, and how to answer a question you cannot answer.",
  category: "interviews",
  publishedAt: "2026-08-05",
  readingMinutes: 12,
  tags: ["Interviews", "Preparation", "Communication"],
  related: [
    "resume-that-gets-shortlisted",
    "negotiate-salary-in-india",
    "first-job-without-experience",
  ],
  body: (
    <>
      <p>
        You have an interview in two days. The temptation is to read fifty
        commonly asked questions and rehearse answers to all of them.
      </p>
      <p>
        That is close to the least efficient thing you could do. Interviewers do
        not reject people for lacking a polished answer to &ldquo;what is your
        greatest weakness.&rdquo; They reject people who could not explain their
        own resume, could not describe the work in any specific terms, and had
        clearly not thought about the company for five minutes.
      </p>
      <p>
        Preparation is triage. Here is the order that actually pays.
      </p>

      <h2>First: read the job description backwards</h2>
      <p>
        Print the JD, or paste it somewhere you can annotate it. For every
        requirement, write one line of your own evidence — a project, a metric, a
        situation. Where you have no evidence, write that too.
      </p>
      <p>This produces three things in twenty minutes:</p>
      <ul>
        <li>
          A map of what they will ask about, because interviewers are usually
          working from the same document.
        </li>
        <li>
          Your talking points, pre-attached to their language rather than yours.
        </li>
        <li>
          An honest list of your gaps — so that when one comes up, you are not
          discovering it live.
        </li>
      </ul>
      <p>
        Pay attention to what the JD lists first and what it repeats. That is
        usually the actual problem they are hiring to solve, and the rest is
        wishlist.
      </p>

      <h2>Second: know your own resume cold</h2>
      <p>
        This is the most common serious failure, and almost nobody prepares for
        it. Candidates write a resume in March, apply in July, and cannot explain
        a number they put on it themselves.
      </p>
      <p>For every line on your resume, be able to answer:</p>
      <ul>
        <li>What exactly did you do, versus what your team did?</li>
        <li>How did you arrive at that number, and over what period?</li>
        <li>What was hard about it?</li>
        <li>What would you do differently?</li>
      </ul>
      <p>
        If you wrote &ldquo;improved page load time by 40%,&rdquo; know what it
        was before, how it was measured, and which change contributed most. An
        interviewer who finds one number you cannot defend will discount the
        entire document, which is a rational response.
      </p>
      <p>
        The corollary: never put anything on a resume you are not prepared to be
        cross-examined on. Anything you cannot defend should come off, not be
        risked.
      </p>

      <h2>Third: have five stories ready</h2>
      <p>
        Nearly every behavioural question is a request for one of a small number
        of stories. Prepare five, from real experience:
      </p>
      <ol>
        <li>
          <strong>Something you built or delivered</strong> that you are
          genuinely proud of.
        </li>
        <li>
          <strong>Something that went wrong through your own error</strong>, and
          what you did about it.
        </li>
        <li>
          <strong>A disagreement with a colleague or manager</strong> and how it
          resolved.
        </li>
        <li>
          <strong>A time you worked under real constraint</strong> — no time, no
          budget, no information — and what you cut.
        </li>
        <li>
          <strong>Something you learned quickly</strong> because you had to.
        </li>
      </ol>
      <p>
        Between them these cover ownership, accountability, conflict, judgement
        under pressure and learning speed, which is most of what a behavioural
        round is assessing. Cover the situation, what you specifically did, and
        how it turned out — the standard STAR structure is fine as a checklist,
        but do not let it flatten your delivery into a recitation. Interviewers
        can hear a memorised template, and it costs you credibility.
      </p>
      <p>
        Two things matter more than structure. Say <strong>&ldquo;I&rdquo;</strong>{" "}
        when describing your own contribution — candidates who say
        &ldquo;we&rdquo; throughout leave the interviewer unable to tell what
        they actually did. And keep each story to <strong>two minutes</strong>.
        Time yourself once out loud; most people are astonished at how long they
        run, and a five-minute answer to a simple question is itself a signal
        about how you will behave in a meeting.
      </p>
      <p>
        For the failure story, pick a real one with a real cost. A story where
        the failure was &ldquo;I worked too hard&rdquo; or the fault was someone
        else&apos;s answers a different question than the one asked, and
        interviewers notice the dodge.
      </p>

      <h2>Fourth: twenty minutes on the company</h2>
      <p>You do not need to become an analyst. You need to know:</p>
      <ul>
        <li>
          <strong>What they sell and who pays for it.</strong> Surprisingly many
          candidates cannot say this.
        </li>
        <li>
          <strong>Who their main competitors are</strong>, and one way this
          company is positioned differently.
        </li>
        <li>
          <strong>One recent, specific thing</strong> — a funding round, a
          product launch, a market they entered, something the founder said in an
          interview.
        </li>
        <li>
          <strong>Roughly how large they are</strong> and how long they have
          existed.
        </li>
      </ul>
      <p>
        Then use the product if you can. Fifteen minutes in their app gives you
        an observation nobody else in the pipeline will have, and
        &ldquo;I noticed onboarding asks for a PAN before showing me anything —
        is that a regulatory constraint?&rdquo; is worth more than any amount of
        researched enthusiasm.
      </p>

      <h2>Fifth: prepare questions that are not filler</h2>
      <p>
        &ldquo;Do you have any questions for us?&rdquo; is a real part of the
        assessment, and &ldquo;What is the company culture like?&rdquo; scores
        nothing because it has no wrong answer.
      </p>
      <p>Better, because the answers actually inform your decision:</p>
      <ul>
        <li>
          What does success in this role look like at six months? What would have
          to be true?
        </li>
        <li>
          Why is the position open — is it new, or is someone leaving?
        </li>
        <li>
          What is the hardest part of this job that would not be obvious from the
          description?
        </li>
        <li>How is work prioritised when two stakeholders disagree?</li>
        <li>Who would I work with most closely, and what do they need from me?</li>
        <li>What has the team shipped in the last quarter?</li>
      </ul>
      <p>
        Ask three, and listen to the answers rather than waiting to ask the next
        one. Hesitation on &ldquo;why is the role open&rdquo; is one of the more
        useful pieces of information you will get all process.
      </p>

      <h2>Technical rounds: what is actually being assessed</h2>
      <p>
        Whether it is a coding round, a case study, a modelling test or a design
        exercise, the assessment is rarely just correctness. Three things are
        being watched:
      </p>
      <ul>
        <li>
          <strong>Do you clarify before you start?</strong> Candidates who begin
          solving before establishing constraints are the ones who build the
          wrong thing at work. Ask about scale, edge cases, the inputs you can
          assume.
        </li>
        <li>
          <strong>Do you narrate your reasoning?</strong> Silence for eight
          minutes is unassessable. Say what you are considering and why you
          rejected the alternative — an interviewer will often nudge you if they
          can hear where you are, and cannot if they cannot.
        </li>
        <li>
          <strong>How do you behave when stuck?</strong> This is the highest
          signal moment in the whole interview. Getting stuck is normal; freezing,
          bluffing or getting defensive is what damages you.
        </li>
      </ul>
      <p>
        Practise out loud, against a clock, at least once before the day. Solving
        problems silently in your head is a different skill from solving them
        while talking, and it is the second one you are being tested on.
      </p>

      <h2>The mechanics of a video interview</h2>
      <p>
        These are unglamorous and they cost people offers anyway.
      </p>
      <ul>
        <li>
          Test the link, camera and microphone the day before, in the actual
          application they will use.
        </li>
        <li>
          Have a mobile hotspot ready as a fallback, and know how to switch. If
          your connection fails, say so immediately and reconnect on the phone —
          do not spend four minutes hoping.
        </li>
        <li>
          Camera at eye level, light in front of you rather than behind. A window
          behind you turns you into a silhouette.
        </li>
        <li>
          Set your display name to your actual name, not{" "}
          <em>Redmi Note 12</em>.
        </li>
        <li>
          Use a headset. Laptop microphones pick up the room and echo the
          interviewer back at themselves.
        </li>
        <li>
          Look at the camera when making a point, not at your own thumbnail.
        </li>
        <li>
          Keep your resume and JD notes open, but out of your eyeline enough that
          you are not visibly reading.
        </li>
        <li>
          Allow the small delay. Video calls swallow the start of sentences, so
          pause briefly before answering rather than talking over the last word
          of the question.
        </li>
      </ul>

      <h2>Two questions people handle badly</h2>
      <p>
        <strong>&ldquo;What are your salary expectations?&rdquo;</strong> Deflect
        once and ask for their budgeted band; if pressed, give a researched range
        and say the word <em>fixed</em>. The full mechanics are in{" "}
        <Link href="/blog/negotiate-salary-in-india">
          our guide to negotiating salary in India
        </Link>
        , but the short version is: do not name a precise number before you
        understand the role.
      </p>
      <p>
        <strong>&ldquo;Why are you leaving your current job?&rdquo;</strong>{" "}
        Answer forwards, not backwards. &ldquo;I want to work on X, and this role
        has more of it&rdquo; is safe and true for most people. Criticising your
        current employer — even fairly, even accurately — reads as a preview of
        how you will describe them, and interviewers are consistent about
        penalising it.
      </p>

      <h2>How to say you do not know</h2>
      <p>
        You will be asked something you cannot answer. There is a version of this
        that helps you:
      </p>
      <blockquote>
        I haven&apos;t worked with Kafka directly, so I don&apos;t want to guess.
        What I do know is the problem it solves, and I&apos;ve used SQS for
        something similar on the notifications pipeline — is the concern here
        ordering, or throughput?
      </blockquote>
      <p>
        Admit the gap, show the nearest real thing you have, stay engaged. Every
        interviewer has hired people with gaps. Almost none will hire someone who
        bluffed and got caught, because the inference is about honesty rather than
        knowledge.
      </p>

      <h2>Afterwards</h2>
      <p>
        Send a short note within a day, to whoever you have an address for. Three
        sentences: thanks, one specific thing from the conversation, and that you
        remain interested. It is not obsequious and it is remembered, largely
        because so few candidates do it.
      </p>
      <p>
        Ask about the timeline before you leave the call — &ldquo;what are the
        next steps, and when should I expect to hear?&rdquo; — so that following
        up is a scheduled action rather than an anxious guess. If the stated date
        passes, one polite follow-up is appropriate. Then move on and keep
        interviewing elsewhere, because pipelines go quiet for reasons that have
        nothing to do with you.
      </p>
      <p>
        If you are rejected, ask once what would have made the difference. Most
        will not reply. The ones who do will tell you something more accurate than
        anything you could have inferred, and it is frequently a small mechanical
        habit that takes one afternoon to fix.
      </p>
    </>
  ),
};
