"use server";

import { getJobs, JOBS_PER_PAGE, parseJobFilters } from "@/lib/jobs";
import type { JobWithCompany } from "@/types/job";

/** Hard ceiling on how deep the mobile infinite scroll will walk. */
const MAX_PAGE = 200;

export interface LoadMoreJobsResult {
  jobs: JobWithCompany[];
  /** The page these jobs came from, echoed back so the client can't drift. */
  page: number;
  hasMore: boolean;
}

/**
 * One more page of listings, for the mobile infinite scroll on /jobs.
 *
 * The client hands back the raw search params it was rendered with rather than
 * a filter object, so the untrusted input goes through `parseJobFilters` — the
 * same whitelist the page itself uses. A Server Action is a public HTTP
 * endpoint; nothing here may assume the caller is our own component.
 *
 * Page size is derived from `view` exactly as the page derives it, so page 2
 * lines up with page 1 instead of overlapping or skipping rows.
 */
export async function loadMoreJobs(
  params: Record<string, string | string[] | undefined>,
  page: number,
): Promise<LoadMoreJobsResult> {
  const filters = parseJobFilters(params ?? {});

  const requested = Math.floor(Number(page));
  const safePage =
    Number.isFinite(requested) && requested > 1 ? Math.min(requested, MAX_PAGE) : 2;

  const view = Array.isArray(params?.view) ? params.view[0] : params?.view;
  const perPage = view === "grid" ? 9 : JOBS_PER_PAGE;

  const { jobs, totalPages } = await getJobs({ ...filters, page: safePage, perPage });

  return {
    jobs,
    page: safePage,
    hasMore: safePage < Math.min(totalPages, MAX_PAGE),
  };
}
