import { cn } from "@/lib/utils";
import { JOB_STATUS_LABELS, type JobStatus } from "@/types/job";

/**
 * One chip, six statuses — used on the recruiter dashboard, the job detail
 * page and the admin queue, so the same state never wears two colours.
 *
 * The wording comes from JOB_STATUS_LABELS, which is recruiter-facing on
 * purpose: `rejected` reads "Needs changes", never "Rejected" — the review
 * flow is a revision loop, and the label should say so.
 */
const TONES: Record<JobStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending: "bg-accent-yellow/15 text-accent-yellow",
  active: "bg-accent-green/15 text-accent-green",
  rejected: "bg-accent-red/10 text-accent-red",
  closed: "bg-slate-100 text-slate-500",
  expired: "bg-slate-100 text-slate-500",
};

export function StatusChip({
  status,
  className,
}: {
  status: JobStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        TONES[status],
        className,
      )}
    >
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
