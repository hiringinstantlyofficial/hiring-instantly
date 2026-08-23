"use client";

import Link from "next/link";
import { ExternalLink, Mail, Phone } from "lucide-react";

import { ReviewDiff } from "@/components/admin/review-diff";
import { TrustChips } from "@/components/admin/trust-chips";
import { CompanyLogo } from "@/components/ui/company-logo";
import { formatDateTime, formatSalaryRange } from "@/lib/utils";
import {
  EXPERIENCE_LEVEL_LABELS,
  JOB_CATEGORY_LABELS,
  JOB_TYPE_LABELS,
} from "@/types/job";
import { TRUST_LEVEL_LABELS } from "@/types/recruiter";
import type {
  ReviewQueueJob,
  ReviewRecruiter,
  TrustSignal,
} from "@/types/review";

/**
 * The right-hand panel of the split view: the submission rendered the way the
 * public job page lays it out — title, meta, salary, body sections, skills —
 * so the admin reviews what will actually ship, not a form dump. Beneath it,
 * the recruiter block with tel:/mailto: links (§2 — the phone is the admin's
 * escape hatch and appears nowhere public).
 */
export function ReviewPreview({
  job,
  signals,
}: {
  job: ReviewQueueJob;
  signals: TrustSignal[];
}) {
  const isReReview = job.approved_snapshot !== null;
  const salary = formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency);

  return (
    <div className="space-y-6">
      {/* A re-review opens on the diff, not the full listing (§7). */}
      {isReReview ? <ReviewDiff job={job} /> : null}

      <article className="border border-line bg-white">
        <header className="border-b border-line p-6">
          <div className="flex items-start gap-4">
            <CompanyLogo
              name={job.company_name}
              logoUrl={job.company?.logo_url}
              size={56}
            />
            <div className="min-w-0">
              <h2 className="text-h3">{job.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {job.company_name} · {job.location} ·{" "}
                {JOB_TYPE_LABELS[job.job_type]}
              </p>
              <p className="mt-2 text-sm font-semibold text-navy-700">
                {salary ?? "Salary not disclosed"}
                <span className="ml-3 font-normal text-slate-500">
                  {EXPERIENCE_LEVEL_LABELS[job.experience_level]}
                  {job.min_experience_years
                    ? ` · ${job.min_experience_years}+ yrs`
                    : ""}
                </span>
              </p>
            </div>
          </div>
          {job.categories.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-primary-surface px-3 py-1 text-xs font-semibold text-primary"
                >
                  {JOB_CATEGORY_LABELS[category] ?? category}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Description
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {job.description}
            </p>
          </section>

          {(
            [
              ["Responsibilities", job.responsibilities],
              ["Requirements", job.requirements],
              ["Nice to have", job.nice_to_haves],
              ["Benefits", job.benefits],
            ] as const
          ).map(([label, items]) =>
            items.length ? (
              <section key={label}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}

          {job.skills.length ? (
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}

          <section className="border-t border-line pt-4 text-sm text-slate-600">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Apply route
            </h3>
            <div className="mt-2 space-y-1">
              {job.application_url ? (
                <p>
                  URL:{" "}
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-semibold text-primary hover:underline"
                  >
                    {job.application_url}
                  </a>
                </p>
              ) : null}
              {job.application_email ? <p>Email: {job.application_email}</p> : null}
              {job.application_phone ? <p>Phone: {job.application_phone}</p> : null}
            </div>
          </section>
        </div>
      </article>

      <RecruiterBlock recruiter={job.recruiter} signals={signals} submittedAt={job.created_at} />
    </div>
  );
}

export function RecruiterBlock({
  recruiter,
  signals,
  submittedAt,
}: {
  recruiter: ReviewRecruiter | null;
  signals: TrustSignal[];
  submittedAt?: string;
}) {
  if (!recruiter) {
    return (
      <p className="border border-line bg-white p-4 text-sm text-slate-400">
        No recruiter attached — likely an admin-created row.
      </p>
    );
  }

  return (
    <aside className="border border-line bg-white p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Submitted by
      </h3>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-navy-700">
            {recruiter.full_name}
            <span className="ml-2 text-xs font-normal text-slate-400">
              {recruiter.designation ?? ""}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            @{recruiter.email_domain} ·{" "}
            {TRUST_LEVEL_LABELS[recruiter.trust_level]} recruiter
            {submittedAt ? ` · submitted ${formatDateTime(submittedAt)}` : ""}
          </p>
          <TrustChips signals={signals} className="mt-2" />
        </div>
        <div className="flex items-center gap-2">
          {/* The phone is the escape hatch: a suspicious listing is resolved
              by one call, not an email thread. */}
          <a
            href={`tel:${recruiter.phone}`}
            title={`Call ${recruiter.phone}`}
            className="flex size-9 items-center justify-center border border-line text-slate-500 hover:border-primary hover:text-primary"
          >
            <Phone className="size-4" aria-hidden />
          </a>
          <a
            href={`mailto:${recruiter.work_email}`}
            title={`Email ${recruiter.work_email}`}
            className="flex size-9 items-center justify-center border border-line text-slate-500 hover:border-primary hover:text-primary"
          >
            <Mail className="size-4" aria-hidden />
          </a>
          {recruiter.linkedin_url ? (
            <a
              href={recruiter.linkedin_url}
              target="_blank"
              rel="noreferrer"
              title="LinkedIn profile"
              className="flex size-9 items-center justify-center border border-line text-slate-500 hover:border-primary hover:text-primary"
            >
              <ExternalLink className="size-4" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
      <p className="mt-4 border-t border-line pt-3 text-xs text-slate-400">
        Full history in{" "}
        <Link href="/admin/recruiters" className="font-semibold text-primary hover:underline">
          the recruiter directory
        </Link>
        .
      </p>
    </aside>
  );
}
