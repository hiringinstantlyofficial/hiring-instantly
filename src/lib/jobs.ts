import { unstable_cache } from "next/cache";
import { cache } from "react";

import { captureError } from "@/lib/observability";
import { escapeLike, sanitizeSearchTerm } from "@/lib/postgrest";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import {
  JOB_CATEGORIES,
  JOB_LEVELS,
  JOB_TYPES,
  SALARY_BANDS,
  type FacetCounts,
  type Job,
  type JobCategory,
  type JobFilters,
  type JobLevel,
  type JobListResult,
  type JobType,
  type SalaryBandId,
} from "@/types/job";

// Re-exported so callers keep a single import site for the listing layer, even
// though the parser itself lives apart from the Supabase-dependent code.
export { parseJobFilters } from "@/lib/job-filters";

export const JOBS_PER_PAGE = 7;

/** Ceiling on rows scanned to compute sidebar facet counts. */
const FACET_SCAN_LIMIT = 5000;

/**
 * Cache tag shared by every listing read in this module. The admin mutations
 * flush it through revalidateJobPaths(), so an edit goes live immediately
 * rather than waiting out the TTL below.
 */
export const JOBS_CACHE_TAG = "jobs";

/**
 * How long a cached listing read may be served before it is recomputed.
 *
 * /jobs reads searchParams, so it can never be a static route — it is
 * server-rendered on demand, and every visit used to cost two Supabase round
 * trips, one of them a scan of up to FACET_SCAN_LIMIT rows that was then
 * re-tallied in JS. Caching the *data* instead of the page keeps the route
 * dynamic (filters stay instant and shareable) while making the common
 * navigations — the header link, pagination, ticking a facet — serve from the
 * data cache instead of hitting Postgres.
 */
const JOBS_CACHE_TTL = 300;

/**
 * Carries a PostgREST error across the unstable_cache boundary.
 *
 * unstable_cache stores return values, so a failure must throw rather than be
 * returned — a thrown error propagates to the caller and is deliberately not
 * written to the cache, which keeps a transient Supabase outage from being
 * pinned as an empty job list for the whole TTL.
 */
class JobQueryError extends Error {
  readonly pgError: { code?: string } | null;

  constructor(pgError: { code?: string; message?: string } | null) {
    super(pgError?.message ?? "Supabase query failed");
    this.name = "JobQueryError";
    this.pgError = pgError;
  }
}

/** Unwraps a rejected cached read back into something reportError understands. */
function toPgError(reason: unknown): { code?: string } | null {
  if (reason instanceof JobQueryError) return reason.pgError;
  return (reason ?? null) as { code?: string } | null;
}

/**
 * A missing table (before the migration is applied) or a transient Supabase
 * error should degrade to an empty list, not a 500 on a public page.
 */
function reportError(context: string, error: { code?: string } | null): void {
  if (error?.code === "PGRST205" || error?.code === "42P01") {
    captureError(error, {
      scope: `jobs.${context}`,
      severity: "warning",
      meta: {
        hint: "The 'jobs' table is missing. Apply supabase/migrations in the Supabase SQL editor.",
      },
    });
    return;
  }
  captureError(error, { scope: `jobs.${context}` });
}

type NormalizedFilters = JobFilters & { page: number; perPage: number };

/**
 * Clamps paging and puts the filters into a canonical shape.
 *
 * The canonical part matters because this object is an argument to
 * fetchJobPage(), and unstable_cache derives its key by serialising the
 * arguments. Two requests describing the same query have to produce the same
 * key, so the fields are written in a fixed order rather than spread from the
 * caller's literal, and the multi-select arrays are sorted — `?jobTypes=
 * remote,onsite` and `?jobTypes=onsite,remote` are the same search, and `in` /
 * `overlaps` don't care about order either.
 */
function normalizeFilters(filters: JobFilters): NormalizedFilters {
  const sorted = <T extends string>(values: T[] | undefined): T[] | undefined =>
    values?.length ? [...values].sort() : undefined;

  return {
    q: filters.q,
    location: filters.location,
    jobTypes: sorted(filters.jobTypes),
    categories: sorted(filters.categories),
    jobLevels: sorted(filters.jobLevels),
    experienceLevel: filters.experienceLevel,
    salaryBands: sorted(filters.salaryBands),
    page: Math.max(filters.page ?? 1, 1),
    perPage: Math.min(Math.max(filters.perPage ?? JOBS_PER_PAGE, 1), 50),
    sort: filters.sort ?? "relevant",
  };
}

/** OR-clause matching jobs whose salary range overlaps any selected band. */
function salaryBandClause(bandIds: SalaryBandId[]): string | null {
  const clauses = bandIds
    .map((id) => SALARY_BANDS.find((band) => band.id === id))
    .filter((band): band is (typeof SALARY_BANDS)[number] => Boolean(band))
    .map((band) =>
      band.max === null
        ? `salary_max.gte.${band.min}`
        : `and(salary_max.gte.${band.min},salary_min.lte.${band.max})`,
    );

  return clauses.length ? clauses.join(",") : null;
}

const EMPTY_FACETS: FacetCounts = {
  jobTypes: {},
  categories: {},
  jobLevels: {},
  salaryBands: {},
};

interface FacetRow {
  job_type: JobType;
  categories: JobCategory[] | null;
  job_level: JobLevel | null;
  salary_min: number | null;
  salary_max: number | null;
}

/** Tallies a scanned page of rows into the sidebar's per-facet counts. */
function countFacets(rows: FacetRow[]): FacetCounts {
  const counts: FacetCounts = {
    jobTypes: Object.fromEntries(JOB_TYPES.map((type) => [type, 0])),
    categories: Object.fromEntries(
      JOB_CATEGORIES.map((category) => [category, 0]),
    ),
    jobLevels: Object.fromEntries(JOB_LEVELS.map((level) => [level, 0])),
    salaryBands: Object.fromEntries(SALARY_BANDS.map((band) => [band.id, 0])),
  };

  for (const row of rows) {
    if (row.job_type in counts.jobTypes) counts.jobTypes[row.job_type] += 1;
    if (row.job_level && row.job_level in counts.jobLevels) {
      counts.jobLevels[row.job_level] += 1;
    }
    for (const category of row.categories ?? []) {
      if (category in counts.categories) counts.categories[category] += 1;
    }
    for (const band of SALARY_BANDS) {
      const overlapsBand =
        row.salary_max !== null &&
        row.salary_max >= band.min &&
        (band.max === null ||
          row.salary_min === null ||
          row.salary_min <= band.max);
      if (overlapsBand) counts.salaryBands[band.id] += 1;
    }
  }

  return counts;
}

/**
 * One paginated page of jobs with an exact total, cached per filter
 * combination. Every filter participates in the cache key.
 */
const fetchJobPage = unstable_cache(
  async (
    filters: NormalizedFilters,
  ): Promise<{ jobs: Job[]; total: number }> => {
    const supabase = createSupabasePublicClient();
    const from = (filters.page - 1) * filters.perPage;
    const term = filters.q ? sanitizeSearchTerm(filters.q) : "";
    const location = filters.location?.trim();

    let listQuery = supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("status", "active");

    // `config` must match the one the search_vector column is built with,
    // otherwise stemming differs between the query and the index.
    if (term) {
      listQuery = listQuery.textSearch("search_vector", term, {
        type: "websearch",
        config: "english",
      });
    }
    if (location) listQuery = listQuery.ilike("location", `%${escapeLike(location)}%`);
    if (filters.jobTypes?.length) listQuery = listQuery.in("job_type", filters.jobTypes);
    if (filters.jobLevels?.length) listQuery = listQuery.in("job_level", filters.jobLevels);
    if (filters.categories?.length) {
      listQuery = listQuery.overlaps("categories", filters.categories);
    }
    if (filters.experienceLevel) {
      listQuery = listQuery.eq("experience_level", filters.experienceLevel);
    }
    if (filters.salaryBands?.length) {
      const clause = salaryBandClause(filters.salaryBands);
      if (clause) listQuery = listQuery.or(clause);
    }

    if (filters.sort === "newest") {
      listQuery = listQuery.order("posted_at", { ascending: false });
    } else if (filters.sort === "salary-high") {
      listQuery = listQuery
        .order("salary_max", { ascending: false, nullsFirst: false })
        .order("posted_at", { ascending: false });
    } else {
      // "Most relevant": featured listings first, then freshest.
      listQuery = listQuery
        .order("is_featured", { ascending: false })
        .order("posted_at", { ascending: false });
    }

    const { data, error, count } = await listQuery.range(
      from,
      from + filters.perPage - 1,
    );

    if (error) throw new JobQueryError(error);

    return { jobs: (data ?? []) as Job[], total: count ?? 0 };
  },
  ["jobs:list"],
  { tags: [JOBS_CACHE_TAG], revalidate: JOBS_CACHE_TTL },
);

/**
 * Sidebar facet counts, cached on the keyword + location pair alone.
 *
 * The counts are deliberately computed against the keyword + location query
 * only, so ticking one checkbox doesn't zero out the sibling counts beside it.
 * That narrow key is also what makes this worth caching: every combination of
 * checkboxes on an unfiltered search shares a single cache entry, so the
 * expensive scan runs once per TTL rather than once per click. The tallied
 * counts are cached rather than the rows, so the per-request work drops to
 * nothing.
 */
const fetchFacets = unstable_cache(
  async (term: string, location: string): Promise<FacetCounts> => {
    const supabase = createSupabasePublicClient();

    let facetQuery = supabase
      .from("jobs")
      .select("job_type, categories, job_level, salary_min, salary_max")
      .eq("status", "active");

    if (term) {
      facetQuery = facetQuery.textSearch("search_vector", term, {
        type: "websearch",
        config: "english",
      });
    }
    if (location) {
      facetQuery = facetQuery.ilike("location", `%${escapeLike(location)}%`);
    }

    const { data, error } = await facetQuery.limit(FACET_SCAN_LIMIT);

    if (error) throw new JobQueryError(error);

    return countFacets((data ?? []) as FacetRow[]);
  },
  ["jobs:facets"],
  { tags: [JOBS_CACHE_TAG], revalidate: JOBS_CACHE_TTL },
);

/**
 * The listing query behind the homepage and /jobs. Two reads, issued together
 * and cached independently: one paginated page of jobs with an exact count, one
 * narrow scan for facet counts.
 *
 * allSettled rather than all: a failed facet scan should still render the job
 * list, exactly as it did when both were plain queries.
 */
export const getJobs = cache(async (
  rawFilters: JobFilters = {},
): Promise<JobListResult> => {
  const filters = normalizeFilters(rawFilters);
  const term = filters.q ? sanitizeSearchTerm(filters.q) : "";
  const location = filters.location?.trim() ?? "";

  const [listResult, facetResult] = await Promise.allSettled([
    fetchJobPage(filters),
    fetchFacets(term, location),
  ]);

  if (listResult.status === "rejected") {
    reportError("getJobs", toPgError(listResult.reason));
    return {
      jobs: [],
      total: 0,
      page: filters.page,
      perPage: filters.perPage,
      totalPages: 0,
      facets: EMPTY_FACETS,
    };
  }

  if (facetResult.status === "rejected") {
    reportError("getJobs facets", toPgError(facetResult.reason));
  }

  const { jobs, total } = listResult.value;

  return {
    jobs,
    total,
    page: filters.page,
    perPage: filters.perPage,
    totalPages: Math.max(Math.ceil(total / filters.perPage), 1),
    facets: facetResult.status === "fulfilled" ? facetResult.value : EMPTY_FACETS,
  };
});

export const getJobBySlug = cache(async (slug: string): Promise<Job | null> => {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    reportError(`getJobBySlug(${slug})`, error);
    return null;
  }

  return (data as Job | null) ?? null;
});

/**
 * Jobs adjacent to the one being viewed: shared categories first, topped up
 * with same-job-type listings so the rail is never empty.
 */
export const getSimilarJobs = cache(async (job: Job, limit = 4): Promise<Job[]> => {
  const supabase = createSupabasePublicClient();

  const base = () =>
    supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .neq("id", job.id)
      .order("posted_at", { ascending: false })
      .limit(limit);

  // Both queries are issued up front rather than the job-type one waiting to
  // find out whether the category one came up short: fetching a handful of rows
  // that get discarded is far cheaper than a second serial round trip.
  const [byCategory, byJobType] = await Promise.all([
    job.categories.length
      ? base().overlaps("categories", job.categories)
      : null,
    base().eq("job_type", job.job_type),
  ]);

  if (byCategory?.error) reportError("getSimilarJobs(categories)", byCategory.error);
  if (byJobType.error) reportError("getSimilarJobs(jobType)", byJobType.error);

  // Category matches first — they are the closer match — then top up with
  // same-job-type listings so the rail is never empty.
  const collected = new Map<string, Job>();
  for (const row of (byCategory?.data ?? []) as Job[]) collected.set(row.id, row);
  for (const row of (byJobType.data ?? []) as Job[]) {
    if (collected.size >= limit) break;
    if (!collected.has(row.id)) collected.set(row.id, row);
  }

  return [...collected.values()].slice(0, limit);
});

export const getFeaturedJobs = cache(async (limit = 4): Promise<Job[]> => {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("posted_at", { ascending: false })
    .limit(limit);

  if (error) {
    reportError("getFeaturedJobs", error);
    return [];
  }

  return (data ?? []) as Job[];
});

export interface CompanySummary {
  name: string;
  logoUrl: string | null;
  website: string | null;
  jobCount: number;
  locations: string[];
}

/**
 * Distinct company rollup for /companies.
 *
 * Deliberately NOT wrapped in unstable_cache. /companies is a fully static ISR
 * page, so its own revalidate window already means this runs once per window
 * rather than once per request — and because Next takes the *minimum* of the
 * page's revalidate and any cached read inside it, adding a shorter-lived cache
 * here would drag the page from a 10-minute window down to the cache's, making
 * it rebuild more often for no benefit.
 */
export const getCompanies = cache(async (): Promise<CompanySummary[]> => {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("company_name, company_logo_url, company_website, location")
    .eq("status", "active")
    .limit(FACET_SCAN_LIMIT);

  if (error) {
    reportError("getCompanies", error);
    return [];
  }

  const rollup = new Map<string, CompanySummary & { locationSet: Set<string> }>();

  const rows = (data ?? []) as unknown as Pick<
    Job,
    "company_name" | "company_logo_url" | "company_website" | "location"
  >[];

  for (const row of rows) {
    const existing = rollup.get(row.company_name);
    if (existing) {
      existing.jobCount += 1;
      existing.logoUrl ??= row.company_logo_url;
      existing.website ??= row.company_website;
      existing.locationSet.add(row.location);
    } else {
      rollup.set(row.company_name, {
        name: row.company_name,
        logoUrl: row.company_logo_url,
        website: row.company_website,
        jobCount: 1,
        locations: [],
        locationSet: new Set([row.location]),
      });
    }
  }

  return [...rollup.values()]
    .map(({ locationSet, ...company }) => ({
      ...company,
      locations: [...locationSet].slice(0, 3),
    }))
    .sort((a, b) => b.jobCount - a.jobCount || a.name.localeCompare(b.name));
});

/** Slug + timestamp pairs for sitemap.xml. */
export async function getAllActiveJobSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("slug, updated_at")
    .eq("status", "active")
    .order("posted_at", { ascending: false })
    .limit(FACET_SCAN_LIMIT);

  if (error) {
    reportError("getAllActiveJobSlugs", error);
    return [];
  }

  return data ?? [];
}
