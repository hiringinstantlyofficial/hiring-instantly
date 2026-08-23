import type { CompanyRef } from "@/types/company";

export const JOB_TYPES = [
  "full-time",
  "part-time",
  "internship",
  "contract",
  "remote",
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  internship: "Internship",
  contract: "Contract",
  remote: "Remote",
};

export const EXPERIENCE_LEVELS = ["fresher", "experienced"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  fresher: "Fresher",
  experienced: "Experienced",
};

export const JOB_LEVELS = [
  "entry",
  "mid",
  "senior",
  "director",
  "vp-or-above",
] as const;
export type JobLevel = (typeof JOB_LEVELS)[number];

export const JOB_LEVEL_LABELS: Record<JobLevel, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level",
  director: "Director",
  "vp-or-above": "VP or Above",
};

export const JOB_CATEGORIES = [
  "design",
  "sales",
  "marketing",
  "business",
  "human-resource",
  "finance",
  "engineering",
  "technology",
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  design: "Design",
  sales: "Sales",
  marketing: "Marketing",
  business: "Business",
  "human-resource": "Human Resource",
  finance: "Finance",
  engineering: "Engineering",
  technology: "Technology",
};

export const JOB_STATUSES = [
  "draft",
  "pending",
  "active",
  "rejected",
  "closed",
  "expired",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/**
 * `pending` and `rejected` are worded for the recruiter who reads them:
 * the review flow is a revision loop, so `rejected` reads "Needs changes",
 * never "Rejected".
 */
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  pending: "In review",
  active: "Active",
  rejected: "Needs changes",
  closed: "Closed",
  expired: "Expired",
};

export const JOB_SOURCES = ["admin", "recruiter"] as const;
export type JobSource = (typeof JOB_SOURCES)[number];

/**
 * Annual salary bands used by the sidebar facet, denominated in INR to suit the
 * Indian market. `max: null` means "and above".
 */
export const SALARY_BANDS = [
  { id: "0-300000", label: "Up to ₹3 LPA", min: 0, max: 300000 },
  { id: "300000-600000", label: "₹3 - ₹6 LPA", min: 300000, max: 600000 },
  { id: "600000-1200000", label: "₹6 - ₹12 LPA", min: 600000, max: 1200000 },
  { id: "1200000-plus", label: "₹12 LPA or above", min: 1200000, max: null },
] as const;
export type SalaryBandId = (typeof SALARY_BANDS)[number]["id"];

/**
 * A row of `public.jobs`, exactly as it comes back from Supabase.
 *
 * Declared as a type alias, not an interface: supabase-js constrains table rows
 * to `Record<string, unknown>`, and only type aliases get TypeScript's implicit
 * index signature. As an interface this silently resolves every query to
 * `never`.
 */
export type Job = {
  id: string;
  slug: string;
  title: string;

  company_id: string;
  /**
   * A mirror of `companies.name`, maintained by a database trigger — never
   * written by the app.
   *
   * It exists because `jobs.search_vector` is a generated column built from
   * this value, and a generated column cannot contain a subquery, so it cannot
   * reach through the company_id foreign key. Keeping the name denormalised is
   * also what lets the admin table's ilike filter search by company without a
   * join. Everything else about a company (logo, website, description) lives on
   * the company row alone.
   */
  company_name: string;

  location: string;
  job_type: JobType;
  categories: JobCategory[];

  experience_level: ExperienceLevel;
  job_level: JobLevel | null;
  min_experience_years: number | null;

  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;

  description: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_haves: string[];
  skills: string[];
  benefits: string[];

  application_url: string | null;
  application_email: string | null;
  application_phone: string | null;

  capacity: number | null;
  applicants_count: number;

  status: JobStatus;
  is_featured: boolean;
  posted_at: string;
  valid_through: string | null;

  /** Who sent it (null for admin-typed listings) — survives approval (D8). */
  submitted_by: string | null;
  source: JobSource;
  reviewed_by: string | null;
  reviewed_at: string | null;
  /** Shown to the recruiter verbatim when changes are requested. */
  review_note: string | null;
  /**
   * The row as it looked when last approved, captured by a trigger on the
   * `-> active` transition. The re-review diff renders against this.
   */
  approved_snapshot: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;
};

/**
 * A job with its company embedded, which is what every read in lib/jobs.ts
 * actually returns. `company` is nullable only because PostgREST types an
 * embedded relation that way; the FK is NOT NULL, so in practice it is present.
 */
export type JobWithCompany = Job & { company: CompanyRef | null };

/**
 * Fields the admin form writes. Server-managed columns are omitted, and so is
 * company_name — the trigger derives it from company_id.
 */
export type JobInput = Omit<
  Job,
  | "id"
  | "created_at"
  | "updated_at"
  | "applicants_count"
  | "company_name"
  // Review metadata is written by the review actions and triggers alone.
  | "submitted_by"
  | "source"
  | "reviewed_by"
  | "reviewed_at"
  | "review_note"
  | "approved_snapshot"
> & { applicants_count?: number };

export interface JobFilters {
  q?: string;
  location?: string;
  /** Company slug, from /jobs?company=acme — the "all roles at X" link. */
  company?: string;
  jobTypes?: JobType[];
  categories?: JobCategory[];
  jobLevels?: JobLevel[];
  experienceLevel?: ExperienceLevel;
  salaryBands?: SalaryBandId[];
  page?: number;
  perPage?: number;
  sort?: JobSort;
}

/** Listed in dropdown order, so the default sits at the top. */
export const JOB_SORTS = ["newest", "relevant", "salary-high"] as const;
export type JobSort = (typeof JOB_SORTS)[number];

/** The board's default: a job board is only as good as its freshest listing. */
export const DEFAULT_JOB_SORT: JobSort = "newest";

export const JOB_SORT_LABELS: Record<JobSort, string> = {
  newest: "Newest first",
  relevant: "Featured first",
  "salary-high": "Highest salary",
};

/** Counts per facet value, used for the "(24)" numbers in the sidebar. */
export interface FacetCounts {
  jobTypes: Record<string, number>;
  categories: Record<string, number>;
  jobLevels: Record<string, number>;
  salaryBands: Record<string, number>;
}

export interface JobListResult {
  jobs: JobWithCompany[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: FacetCounts;
}
