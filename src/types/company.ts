export const COMPANY_SIZE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5000+",
] as const;
export type CompanySizeRange = (typeof COMPANY_SIZE_RANGES)[number];

export const COMPANY_SIZE_LABELS: Record<CompanySizeRange, string> = {
  "1-10": "1–10 employees",
  "11-50": "11–50 employees",
  "51-200": "51–200 employees",
  "201-500": "201–500 employees",
  "501-1000": "501–1,000 employees",
  "1001-5000": "1,001–5,000 employees",
  "5000+": "5,000+ employees",
};

export const COMPANY_STATUSES = ["active", "hidden"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  active: "Active",
  hidden: "Hidden",
};

/**
 * A row of `public.companies`, exactly as it comes back from Supabase.
 *
 * A type alias rather than an interface, for the same reason as `Job`:
 * supabase-js constrains table rows to `Record<string, unknown>`, and only type
 * aliases get TypeScript's implicit index signature. As an interface this
 * silently resolves every query to `never`.
 */
export type Company = {
  id: string;
  slug: string;
  name: string;
  legal_name: string | null;

  logo_url: string | null;
  cover_url: string | null;

  website: string | null;
  description: string | null;
  tagline: string | null;

  industry: string | null;
  headquarters: string | null;
  founded_year: number | null;
  size_range: CompanySizeRange | null;
  linkedin_url: string | null;

  is_verified: boolean;
  status: CompanyStatus;

  created_at: string;
  updated_at: string;
};

/** Fields the admin form writes. Server-managed columns are omitted. */
export type CompanyInput = Omit<Company, "created_at" | "updated_at">;

/**
 * The subset of a company embedded alongside every job read.
 *
 * Deliberately narrow: a job card needs a logo and a link, not the full
 * description, and every one of these columns is transferred for every row of
 * every listing page.
 */
export type CompanyRef = Pick<
  Company,
  "id" | "slug" | "name" | "logo_url" | "website" | "is_verified"
>;

/** A company plus its live-listing rollup, as shown on /companies. */
export interface CompanySummary extends CompanyRef {
  tagline: string | null;
  cover_url: string | null;
  headquarters: string | null;
  jobCount: number;
}
