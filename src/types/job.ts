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

export const JOB_STATUSES = ["draft", "active", "closed", "expired"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  active: "Active",
  closed: "Closed",
  expired: "Expired",
};

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

  company_name: string;
  company_logo_url: string | null;
  company_website: string | null;
  company_description: string | null;

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

  capacity: number | null;
  applicants_count: number;

  status: JobStatus;
  is_featured: boolean;
  posted_at: string;
  valid_through: string | null;
  created_at: string;
  updated_at: string;
};

/** Fields the admin form writes. Server-managed columns are omitted. */
export type JobInput = Omit<
  Job,
  "id" | "created_at" | "updated_at" | "applicants_count"
> & { applicants_count?: number };

export interface JobFilters {
  q?: string;
  location?: string;
  jobTypes?: JobType[];
  categories?: JobCategory[];
  jobLevels?: JobLevel[];
  experienceLevel?: ExperienceLevel;
  salaryBands?: SalaryBandId[];
  page?: number;
  perPage?: number;
  sort?: JobSort;
}

export const JOB_SORTS = ["relevant", "newest", "salary-high"] as const;
export type JobSort = (typeof JOB_SORTS)[number];

export const JOB_SORT_LABELS: Record<JobSort, string> = {
  relevant: "Most relevant",
  newest: "Newest",
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
  jobs: Job[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: FacetCounts;
}
