import Link from "next/link";
import { SearchX } from "lucide-react";

import { JobCard } from "@/components/jobs/job-card";
import { cn } from "@/lib/utils";
import type { JobWithCompany } from "@/types/job";

interface JobListProps {
  jobs: JobWithCompany[];
  view?: "list" | "grid";
}

export function JobList({ jobs, view = "list" }: JobListProps) {
  if (!jobs.length) return <JobsEmptyState />;

  return (
    <div
      className={cn(
        view === "grid"
          ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col gap-4",
      )}
    >
      {jobs.map((job, index) => (
        <JobCard key={job.id} job={job} view={view} priority={index === 0} />
      ))}
    </div>
  );
}

export function JobsEmptyState() {
  return (
    <div className="flex flex-col items-center border border-line bg-surface-muted px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-surface text-primary">
        <SearchX className="size-7" aria-hidden />
      </span>
      <h3 className="mt-5 text-h3">No jobs match those filters</h3>
      <p className="mt-2 max-w-md text-base text-slate-600">
        Try a broader keyword, clear a filter, or widen the location. New roles
        are posted every day.
      </p>
      <Link
        href="/jobs"
        prefetch={true}
        className="mt-6 bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary-hover"
      >
        Browse all jobs
      </Link>
    </div>
  );
}

/**
 * Skeleton mirrors the real card's box model exactly (same padding, same
 * 48px logo, same three-column split) so swapping in real data shifts nothing.
 */
export function JobListSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading jobs…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border border-line bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="skeleton size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="skeleton h-[25px] w-2/5" />
              <div className="skeleton h-[22px] w-3/5" />
              <div className="flex gap-2">
                <div className="skeleton h-[30px] w-24 rounded-full" />
                <div className="skeleton h-[30px] w-24 rounded-full" />
              </div>
            </div>
            <div className="shrink-0 space-y-3 sm:w-[152px]">
              <div className="skeleton h-[48px] w-full" />
              <div className="skeleton h-1 w-full" />
              <div className="skeleton h-4 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
