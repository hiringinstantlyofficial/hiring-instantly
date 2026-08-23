import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";

import { StatusChip } from "@/components/employers/status-chip";
import { WithdrawButton } from "@/components/employers/withdraw-button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { getJobReviewEvents, getRecruiterJob } from "@/lib/recruiters";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatSalaryRange } from "@/lib/utils";
import { JOB_TYPE_LABELS } from "@/types/job";
import { REVIEW_ACTION_LABELS } from "@/types/review";

export const metadata: Metadata = {
  title: "Listing status",
  robots: { index: false, follow: false },
};

/**
 * The status detail: the submission roughly as it will look publicly, the
 * review timeline, and the reviewer's note front and centre when changes were
 * requested. This page is what makes the review loop feel like a conversation
 * rather than a rejection.
 */
export default async function EmployerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/employers/login");

  const job = await getRecruiterJob(supabase, user.id, id);
  if (!job) notFound();

  const events = await getJobReviewEvents(supabase, job.id);
  const salary = formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency);

  return (
    <div className="container-page max-w-4xl py-10">
      <Link href="/employers" className="text-sm font-semibold text-primary hover:underline">
        ← All listings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <CompanyLogo name={job.company_name} logoUrl={job.company?.logo_url} size={56} />
          <div>
            <h1 className="text-h2">{job.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {job.company_name} · {job.location} · {JOB_TYPE_LABELS[job.job_type]}
            </p>
          </div>
        </div>
        <StatusChip status={job.status} />
      </div>

      {job.status === "rejected" && job.review_note ? (
        <div className="mt-6 border border-accent-red/30 bg-accent-red/5 p-5">
          <p className="text-sm font-semibold text-navy-700">
            What our reviewer asked for
          </p>
          <p className="mt-1 text-sm text-slate-600">{job.review_note}</p>
          <Link
            href={`/employers/jobs/${job.id}/edit`}
            className="mt-4 inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Pencil className="size-4" aria-hidden />
            Edit and resubmit
          </Link>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {job.status === "active" ? (
          <Link
            href={`/jobs/${job.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <ExternalLink className="size-4" aria-hidden />
            View live listing
          </Link>
        ) : null}
        {job.status !== "rejected" ? (
          <Link
            href={`/employers/jobs/${job.id}/edit`}
            className="inline-flex items-center gap-2 border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary-surface"
          >
            <Pencil className="size-4" aria-hidden />
            Edit listing
          </Link>
        ) : null}
        {job.status === "pending" ? (
          <WithdrawButton jobId={job.id} jobTitle={job.title} />
        ) : null}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* The submission, roughly as the public page renders it. */}
        <article className="border border-line bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Your listing
          </h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-400">Salary</dt>
              <dd className="mt-0.5 text-sm font-semibold text-navy-700">
                {salary ?? "Not disclosed"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Experience</dt>
              <dd className="mt-0.5 text-sm font-semibold text-navy-700 capitalize">
                {job.experience_level}
                {job.min_experience_years
                  ? ` · ${job.min_experience_years}+ yrs`
                  : ""}
              </dd>
            </div>
          </dl>

          <div className="prose-sm mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {job.description}
          </div>

          {job.requirements.length ? (
            <>
              <h3 className="mt-6 text-sm font-semibold text-navy-700">Requirements</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}

          {job.skills.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-primary-surface px-3 py-1 text-xs font-semibold text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </article>

        {/* The review timeline. */}
        <aside className="h-fit border border-line bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Review history
          </h2>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              {job.status === "draft"
                ? "Still a draft — submit it when you're ready."
                : "No review activity yet."}
            </p>
          ) : (
            <ol className="mt-4 space-y-4">
              {events.map((event) => (
                <li key={event.id} className="relative border-l-2 border-line pl-4">
                  <p className="text-sm font-semibold text-navy-700">
                    {REVIEW_ACTION_LABELS[event.action]}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(event.created_at)}
                  </p>
                  {event.note ? (
                    <p className="mt-1 text-xs text-slate-600">{event.note}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}

          <p className="mt-6 border-t border-line pt-4 text-xs text-slate-400">
            Submitted listings are usually reviewed within one working day.
            Posted {formatDate(job.created_at)}.
          </p>
        </aside>
      </div>
    </div>
  );
}
