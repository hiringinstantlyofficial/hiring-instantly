import type { Metadata } from "next";
import { BadgeCheck, HeartHandshake, Target, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { absoluteUrl, editorialAuthor, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `${siteConfig.name} is a job board for the Indian market, built to give freshers and experienced professionals a clear, honest view of who is hiring.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${siteConfig.name}`,
    url: absoluteUrl("/about"),
  },
};

const values = [
  {
    icon: BadgeCheck,
    title: "Verified before published",
    body: "Every listing is reviewed by a person before it goes live. No scraped ghost jobs, no expired roles left sitting at the top of the page.",
  },
  {
    icon: Target,
    title: "Freshers get a real shot",
    body: "Entry-level roles are a first-class filter, not an afterthought buried under ten years of experience requirements.",
  },
  {
    icon: HeartHandshake,
    title: "Salary shown where we have it",
    body: "We ask every employer for a compensation range and publish it whenever they provide one, so you can decide before you apply.",
  },
  {
    icon: Users,
    title: "Free for candidates, always",
    body: "No paywalls, no premium tier to see contact details, no charge to apply. Employers pay for placement; candidates never do.",
  },
];

const stats = [
  { label: "Live roles", value: "Updated daily" },
  { label: "Cities covered", value: "Pan-India + remote" },
  { label: "Cost to apply", value: "Free" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="We make Indian job hunting less of a guessing game"
        subtitle="HiringInstantly started from a simple frustration: job boards are full of listings that are stale, vague about pay, or closed to anyone without five years of experience. We built the board we wanted to use."
        breadcrumb={[{ name: "About", href: "/about" }]}
      />

      <div className="container-page py-12 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div className="prose-legal max-w-none">
            <h2>Our story</h2>
            <p>
              We spent years watching capable people — final-year students,
              career switchers, engineers coming back from a break — lose weeks
              to listings that were never really open. Applications went into a
              void. Salary was &ldquo;as per industry standards.&rdquo; The same
              role appeared on six sites with four different titles.
            </p>
            <p>
              So we started small and deliberately narrow: a single board for the
              Indian market, with every role checked by hand before it is
              published, and clear labelling of what the employer actually
              expects.
            </p>

            <h2>What we do differently</h2>
            <p>
              We keep the listing itself honest. Employment type, experience
              level, location and pay range sit at the top of every posting, not
              buried in paragraph six. When a role closes, we close it here too.
            </p>
            <p>
              We also keep the site fast and readable on a phone, because that is
              where most of our visitors are searching from — often on patchy
              connections, between other commitments.
            </p>

            <h2>Who we are</h2>
            <p>
              A small, distributed team of engineers and recruiters working
              across India. We are not a staffing agency and we do not take a cut
              of anyone&apos;s salary — we simply run the board.
            </p>

            {/*
              The target of the `rel="author"` link under every article byline.
              A named writer on career advice is only worth something if the
              name resolves to a real person somewhere on the site — this is
              that somewhere, so the id must not be renamed without updating
              editorialAuthor.path in lib/site.ts.
            */}
            <h2 id="editorial">Editorial</h2>
            <p>
              Our career guides are written by{" "}
              <strong>{editorialAuthor.name}</strong>, a software engineer at an
              MNC in India. He writes them in his own time, for a fairly ordinary
              reason: he went through the same resumes, interview rounds and
              offer conversations himself, and found that most of the advice
              available was either generic or written for a different job
              market.
            </p>
            <p>
              He is not a recruiter, and the guides do not pretend otherwise.
              They are written from the candidate&apos;s side of the table,
              which is the side most of our readers are on.
            </p>
            <p>
              Everything in the guides is written for the Indian market
              specifically: rupee figures, the components of an actual CTC,
              notice periods as they work under Indian employment contracts. We
              do not publish sponsored articles, and no employer pays to appear
              in one.
            </p>

            <h2>Working with us</h2>
            <p>
              Hiring for a role? Send us the details and we will get it in front
              of candidates who are actually looking. Spotted a listing that
              seems wrong? Tell us and we will investigate it the same week.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="border border-line bg-surface-muted p-6">
              <h2 className="text-h4">At a glance</h2>
              <dl className="mt-5 space-y-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="text-sm text-slate-400">{stat.label}</dt>
                    <dd className="text-sm font-semibold text-navy-700">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border border-line p-6">
              <h2 className="text-h4">Hiring right now?</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Send us the role and we will review it for publication.
              </p>
              <ButtonLink
                href="/contact?intent=post-a-job"
                className="mt-5"
                fullWidth
              >
                Post a job
              </ButtonLink>
            </div>
          </aside>
        </section>

        <section className="mt-16 border-t border-line pt-12">
          <h2 className="text-h2">What we stand for</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="border border-line p-6">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary-surface text-primary">
                  <value.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-h4">{value.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-slate-600">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 border border-line bg-surface-muted px-6 py-12 text-center">
          <h2 className="text-h2">Start with the roles that are open today</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
            Filter by employment type, experience level, city and salary — then
            apply directly with the employer.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/jobs" size="lg">
              Browse jobs
            </ButtonLink>
            <ButtonLink href="/companies" variant="outline" size="lg">
              Browse companies
            </ButtonLink>
          </div>
        </section>
      </div>
    </>
  );
}
