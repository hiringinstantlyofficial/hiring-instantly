import Link from "next/link";

import { CapacityMeter } from "@/components/jobs/capacity-meter";
import { CategoryBadge, JobTypeBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { RelativeTime } from "@/components/ui/relative-time";
import { cn, formatSalaryRange, truncate } from "@/lib/utils";
import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  view?: "list" | "grid";
  /** True for the first card, which is the LCP candidate. */
  priority?: boolean;
}

export function JobCard({ job, view = "list", priority = false }: JobCardProps) {
  const salary = formatSalaryRange(
    job.salary_min,
    job.salary_max,
    job.salary_currency,
  );
  const href = `/jobs/${job.slug}`;

  if (view === "grid") {
    return (
      <article className="flex h-full flex-col border border-line bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <CompanyLogo
            name={job.company_name}
            logoUrl={job.company_logo_url}
            priority={priority}
          />
          <JobTypeBadge jobType={job.job_type} />
        </div>

        <h3 className="mt-4 text-h4">
          <Link href={href} prefetch={true} className="hover:text-primary">
            {job.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          {job.company_name} • {job.location}
        </p>

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {truncate(job.description, 140)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.categories.slice(0, 2).map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-line-soft pt-4">
          <span className="text-sm font-semibold text-navy-700">
            {salary ?? "Salary not disclosed"}
          </span>
          <RelativeTime date={job.posted_at} className="text-xs text-slate-400" />
        </div>
      </article>
    );
  }

  return (
    <article className="border border-line bg-white p-6 transition-colors hover:border-primary/40">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <CompanyLogo
          name={job.company_name}
          logoUrl={job.company_logo_url}
          priority={priority}
          className="sm:mr-2"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-h4">
            <Link href={href} prefetch={true} className="hover:text-primary">
              {job.title}
            </Link>
          </h3>

          <p className="mt-1 text-base text-slate-400">
            {job.company_name} <span aria-hidden>•</span> {job.location}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <JobTypeBadge jobType={job.job_type} />
            {job.categories.length ? (
              <span aria-hidden className="mx-1 h-6 w-px bg-line" />
            ) : null}
            {job.categories.slice(0, 2).map((category) => (
              <CategoryBadge key={category} category={category} />
            ))}
          </div>

          {salary ? (
            <p className="mt-3 text-sm text-slate-600">
              <span className="font-semibold text-navy-700">{salary}</span> per
              year
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "flex shrink-0 flex-col items-stretch gap-3 sm:w-[152px] sm:items-end",
          )}
        >
          <ButtonLink href={href} fullWidth className="justify-center">
            Apply
          </ButtonLink>
          <CapacityMeter
            applied={job.applicants_count}
            capacity={job.capacity}
          />
          <p className="text-xs text-slate-400 sm:text-right">
            Posted <RelativeTime date={job.posted_at} />
          </p>
        </div>
      </div>
    </article>
  );
}
