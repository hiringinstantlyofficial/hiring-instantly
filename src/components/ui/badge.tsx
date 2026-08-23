import { cn } from "@/lib/utils";
import {
  ARTICLE_CATEGORY_LABELS,
  type ArticleCategory,
} from "@/types/blog";
import {
  JOB_CATEGORY_LABELS,
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  type JobCategory,
  type JobStatus,
  type JobType,
} from "@/types/job";

/**
 * Two badge shapes from the reference: a filled tint for employment type, and
 * an outlined pill for categories. Both are fully rounded.
 */
const pill =
  "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold whitespace-nowrap";

export function JobTypeBadge({
  jobType,
  className,
}: {
  jobType: JobType;
  className?: string;
}) {
  return (
    <span
      className={cn(pill, "bg-accent-green/10 text-accent-green", className)}
    >
      {JOB_TYPE_LABELS[jobType]}
    </span>
  );
}

/** Category colours cycle through the accent set, keyed for stability. */
const categoryStyles: Record<JobCategory, string> = {
  design: "border-accent-purple text-accent-purple",
  sales: "border-accent-green text-accent-green",
  marketing: "border-accent-yellow text-accent-yellow",
  business: "border-primary text-primary",
  "human-resource": "border-accent-blue text-accent-blue",
  finance: "border-accent-green text-accent-green",
  engineering: "border-primary text-primary",
  technology: "border-accent-yellow text-accent-yellow",
};

export function CategoryBadge({
  category,
  className,
}: {
  category: JobCategory;
  className?: string;
}) {
  return (
    <span className={cn(pill, "border", categoryStyles[category], className)}>
      {JOB_CATEGORY_LABELS[category]}
    </span>
  );
}

/**
 * Blog categories reuse the filled-tint shape rather than the outlined pill, so
 * an article card never reads as a job listing at a glance.
 */
const articleCategoryStyles: Record<ArticleCategory, string> = {
  resume: "bg-primary-surface text-primary",
  interviews: "bg-accent-purple/10 text-accent-purple",
  salary: "bg-accent-green/10 text-accent-green",
  "job-search": "bg-accent-blue/10 text-accent-blue",
  "career-growth": "bg-accent-yellow/15 text-accent-yellow",
  workplace: "bg-accent-red/10 text-accent-red",
};

export function ArticleCategoryBadge({
  category,
  className,
}: {
  category: ArticleCategory;
  className?: string;
}) {
  return (
    <span className={cn(pill, articleCategoryStyles[category], className)}>
      {ARTICLE_CATEGORY_LABELS[category]}
    </span>
  );
}

const statusStyles: Record<JobStatus, string> = {
  active: "bg-accent-green/10 text-accent-green",
  draft: "bg-slate-400/10 text-slate-600",
  pending: "bg-accent-yellow/15 text-accent-yellow",
  rejected: "bg-accent-red/10 text-accent-red",
  closed: "bg-accent-red/10 text-accent-red",
  expired: "bg-accent-yellow/15 text-accent-yellow",
};

export function StatusBadge({
  status,
  className,
}: {
  status: JobStatus;
  className?: string;
}) {
  return (
    <span className={cn(pill, statusStyles[status], className)}>
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
