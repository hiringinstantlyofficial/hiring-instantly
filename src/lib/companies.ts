import { unstable_cache } from "next/cache";
import { cache } from "react";

import { captureError } from "@/lib/observability";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { Company, CompanySummary } from "@/types/company";
import type { JobWithCompany } from "@/types/job";

/**
 * Cache tag shared by every company read here. The admin mutations flush it
 * through revalidateCompanyPaths(), so an edit is live immediately rather than
 * waiting out the TTL.
 */
export const COMPANIES_CACHE_TAG = "companies";

const COMPANIES_CACHE_TTL = 300;

/** Ceiling on rows returned by the directory query. */
const DIRECTORY_LIMIT = 1000;

/** Open roles listed on a profile before the "see all" link takes over. */
export const COMPANY_JOBS_LIMIT = 12;

/**
 * Carries a PostgREST error across the unstable_cache boundary.
 *
 * unstable_cache stores return values, so a failure must throw rather than be
 * returned — a thrown error propagates and is deliberately not written to the
 * cache, which keeps a transient Supabase outage from being pinned as an empty
 * company list for the whole TTL. Same reasoning as JobQueryError in lib/jobs.
 */
class CompanyQueryError extends Error {
  readonly pgError: { code?: string } | null;

  constructor(pgError: { code?: string; message?: string } | null) {
    super(pgError?.message ?? "Supabase query failed");
    this.name = "CompanyQueryError";
    this.pgError = pgError;
  }
}

function toPgError(reason: unknown): { code?: string } | null {
  if (reason instanceof CompanyQueryError) return reason.pgError;
  return (reason ?? null) as { code?: string } | null;
}

/**
 * A missing table (before the migration is applied) or a transient Supabase
 * error should degrade to an empty list, not a 500 on a public page.
 */
function reportError(context: string, error: { code?: string } | null): void {
  if (error?.code === "PGRST205" || error?.code === "42P01") {
    captureError(error, {
      scope: `companies.${context}`,
      severity: "warning",
      meta: {
        hint: "The 'companies' table is missing. Apply supabase/migrations in the Supabase SQL editor.",
      },
    });
    return;
  }
  captureError(error, { scope: `companies.${context}` });
}

/** The columns a profile page renders. */
const PROFILE_COLUMNS =
  "id, slug, name, legal_name, logo_url, cover_url, website, description, tagline, industry, headquarters, founded_year, size_range, linkedin_url, is_verified, status, created_at, updated_at";

interface DirectoryRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  website: string | null;
  tagline: string | null;
  headquarters: string | null;
  is_verified: boolean;
  jobs: { count: number }[];
}

/**
 * Every company with at least one live opening, most roles first.
 *
 * The job count comes from PostgREST's aggregate embed (`jobs!inner(count)`)
 * rather than the previous approach of pulling several thousand job rows and
 * tallying them in JS — the count is computed in Postgres and one integer per
 * company crosses the wire. `!inner` is what restricts the result to companies
 * that actually have a matching (active) job.
 */
const fetchDirectory = unstable_cache(
  async (): Promise<CompanySummary[]> => {
    const supabase = createSupabasePublicClient();

    const { data, error } = await supabase
      .from("companies")
      .select(
        "id, slug, name, logo_url, cover_url, website, tagline, headquarters, is_verified, jobs!inner(count)",
      )
      .eq("status", "active")
      .eq("jobs.status", "active")
      .limit(DIRECTORY_LIMIT);

    if (error) throw new CompanyQueryError(error);

    return ((data ?? []) as unknown as DirectoryRow[])
      .map(({ jobs, ...company }) => ({
        ...company,
        jobCount: jobs[0]?.count ?? 0,
      }))
      .filter((company) => company.jobCount > 0)
      .sort((a, b) => b.jobCount - a.jobCount || a.name.localeCompare(b.name));
  },
  ["companies:directory"],
  { tags: [COMPANIES_CACHE_TAG], revalidate: COMPANIES_CACHE_TTL },
);

/** The /companies index. Empty rather than a 500 if the read fails. */
export const getCompanyDirectory = cache(async (): Promise<CompanySummary[]> => {
  try {
    return await fetchDirectory();
  } catch (reason) {
    reportError("getCompanyDirectory", toPgError(reason));
    return [];
  }
});

export const getCompanyBySlug = cache(
  async (slug: string): Promise<Company | null> => {
    const supabase = createSupabasePublicClient();

    const { data, error } = await supabase
      .from("companies")
      .select(PROFILE_COLUMNS)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      reportError(`getCompanyBySlug(${slug})`, error);
      return null;
    }

    return (data as Company | null) ?? null;
  },
);

/**
 * Live roles at one company, plus the exact total.
 *
 * The total is separate from the returned rows because the profile shows the
 * first COMPANY_JOBS_LIMIT and links to /jobs?company=<slug> for the rest —
 * and because a count of zero is what puts the page behind `noindex`.
 */
export const getJobsByCompany = cache(
  async (
    companyId: string,
    limit = COMPANY_JOBS_LIMIT,
  ): Promise<{ jobs: JobWithCompany[]; total: number }> => {
    const supabase = createSupabasePublicClient();

    const { data, error, count } = await supabase
      .from("jobs")
      .select("*, company:companies(id, slug, name, logo_url, website, is_verified)", {
        count: "exact",
      })
      .eq("company_id", companyId)
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("posted_at", { ascending: false })
      // Same-day listings share an identical posted_at, so break the tie on a
      // distinct column rather than leaving the order up to Postgres.
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      reportError(`getJobsByCompany(${companyId})`, error);
      return { jobs: [], total: 0 };
    }

    return {
      jobs: (data ?? []) as unknown as JobWithCompany[],
      total: count ?? 0,
    };
  },
);

/**
 * Slug + timestamp pairs for generateStaticParams and the sitemap.
 *
 * Only companies with a live opening. A profile with no roles is thin content
 * that should not be prerendered or crawled — the page itself marks that case
 * `noindex` for the same reason.
 */
export async function getIndexableCompanySlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("companies")
    .select("slug, updated_at, jobs!inner(id)")
    .eq("status", "active")
    .eq("jobs.status", "active")
    .limit(DIRECTORY_LIMIT);

  if (error) {
    reportError("getIndexableCompanySlugs", error);
    return [];
  }

  // The inner join repeats a company once per matching job, so dedupe by slug.
  const seen = new Map<string, string>();
  for (const row of (data ?? []) as unknown as {
    slug: string;
    updated_at: string;
  }[]) {
    seen.set(row.slug, row.updated_at);
  }

  return [...seen].map(([slug, updated_at]) => ({ slug, updated_at }));
}
