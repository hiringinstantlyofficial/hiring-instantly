import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  ClipboardCheck,
  IndianRupee,
  Mail,
  Send,
} from "lucide-react";

import { CompanyLogo } from "@/components/ui/company-logo";
import { getCompanyDirectory } from "@/lib/companies";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * The employer landing page (D9): static, indexable, ISR-cached — a page that
 * should rank for "post a job India", not a dialog behind a button. It sits
 * outside the auth middleware matcher, so it is served as cheaply as the rest
 * of the public site. The primary CTA is a single work-email field that lands
 * on /employers/login prefilled — the sign-up form *is* the CTA.
 */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Post a Job Free — Reach Candidates Across India",
  description: `Post your job on ${siteConfig.name} for free. Listings are reviewed and live within one working day, with a company profile, salary-first presentation and Google Jobs visibility.`,
  alternates: { canonical: "/post-a-job" },
  openGraph: {
    title: `Post a job on ${siteConfig.name}`,
    url: absoluteUrl("/post-a-job"),
  },
};

const steps = [
  {
    icon: Mail,
    title: "Sign in with your work email",
    body: "No password, no forms — we email you a link. Your work address doubles as your verification.",
  },
  {
    icon: Send,
    title: "Describe the role",
    body: "One focused form: title, location, salary band, description. Your company profile is written once and reused on every listing.",
  },
  {
    icon: ClipboardCheck,
    title: "We review, you go live",
    body: "A person checks every listing — most go live within one working day, and we email you the link the moment it does.",
  },
];

const faqs = [
  {
    q: "How much does it cost?",
    a: "Nothing. Posting is free while we grow the employer side of the board.",
  },
  {
    q: "How long does review take?",
    a: "Most listings are reviewed within one working day. Complete listings with a salary range clear fastest.",
  },
  {
    q: "Why do you review listings at all?",
    a: "It is why candidates trust the board: no scraped ghost jobs, no bait-and-switch ads. That trust is what gets your role real applicants.",
  },
  {
    q: "Can I edit a listing after it's live?",
    a: "Yes — edits go through a quick re-review of what changed, so the live version always matches what we approved.",
  },
  {
    q: "Do you handle applications?",
    a: "Candidates apply straight to you — your careers page, ATS link or email. We don't sit in the middle.",
  },
];

export default async function PostAJobPage() {
  const companies = (await getCompanyDirectory()).slice(0, 12);

  return (
    <>
      <section className="hero-pattern border-b border-line-soft">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <h1 className="text-display text-navy-900">
              Post a job free.
              <br />
              Live within a working day.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Reach fresher and experienced candidates across India on a board
              where every listing is human-reviewed — which is exactly why they
              apply.
            </p>

            {/* The sign-up form IS the CTA: one field, straight into the
                magic-link flow with the address carried along. */}
            <form action="/employers/login" method="get" className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <label htmlFor="post-job-email" className="sr-only">
                Work email
              </label>
              <input
                id="post-job-email"
                name="email"
                type="email"
                required
                placeholder="you@yourcompany.com"
                className="min-w-0 flex-1 border border-line bg-white px-4 py-3.5 text-base text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="bg-primary px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Post a job
              </button>
            </form>
            <p className="mt-3 text-sm text-slate-500">
              Free · no password to create · reviewed by a person
            </p>
          </div>

          <ul className="space-y-4 lg:pl-8">
            {[
              {
                icon: BadgeCheck,
                title: "A reviewed board candidates trust",
                body: "Human-checked listings mean your role sits beside real openings, not scraped noise.",
              },
              {
                icon: IndianRupee,
                title: "Salary-first presentation",
                body: "INR salary bands, fresher/experienced filters and Google Jobs structured data on every listing.",
              },
              {
                icon: Send,
                title: "Your own employer dashboard",
                body: "Track review status, edit listings, and reuse your company profile on every role.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-4 border border-line bg-white p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-surface text-primary">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-semibold text-navy-700">{item.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works. */}
      <section className="container-page py-14 lg:py-20">
        <h2 className="text-h2 text-center">Three steps to your first applicant</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="border border-line bg-white p-6">
              <span className="text-sm font-bold text-primary">Step {index + 1}</span>
              <div className="mt-3 flex items-center gap-3">
                <step.icon className="size-5 text-primary" aria-hidden />
                <h3 className="font-semibold text-navy-700">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Real logo wall — companies already hiring here. */}
      {companies.length >= 4 ? (
        <section className="border-y border-line-soft bg-surface-muted">
          <div className="container-page py-12">
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
              Companies hiring on {siteConfig.name}
            </p>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {companies.map((company) => (
                <li key={company.id} className="flex items-center gap-2.5">
                  <CompanyLogo name={company.name} logoUrl={company.logo_url} size={32} />
                  <span className="text-sm font-semibold text-slate-600">{company.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* FAQ. */}
      <section className="container-page py-14 lg:py-20">
        <h2 className="text-h2 text-center">Questions employers ask</h2>
        <dl className="mx-auto mt-10 max-w-3xl divide-y divide-line border border-line bg-white">
          {faqs.map((faq) => (
            <div key={faq.q} className="p-6">
              <dt className="font-semibold text-navy-700">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-center text-sm text-slate-500">
          Something else?{" "}
          <Link href="/contact" className="font-semibold text-primary hover:underline">
            Talk to us
          </Link>{" "}
          — or{" "}
          <Link href="/employers/login" className="font-semibold text-primary hover:underline">
            sign in to your employer account
          </Link>
          .
        </p>
      </section>
    </>
  );
}
