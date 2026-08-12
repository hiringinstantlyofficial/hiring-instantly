import type { Metadata } from "next";
import { Suspense } from "react";

import { FilterSidebar } from "@/components/jobs/filter-sidebar";
import { JobList } from "@/components/jobs/job-list";
import { JobPagination } from "@/components/jobs/job-pagination";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { MobileInfiniteJobs } from "@/components/jobs/mobile-infinite-jobs";
import {
  MobileJobsBar,
  MobileJobsPanel,
} from "@/components/jobs/mobile-jobs-bar";
import { ResultsToolbar } from "@/components/jobs/results-toolbar";
import { getJobs, JOBS_PER_PAGE, parseJobFilters } from "@/lib/jobs";
import { siteConfig } from "@/lib/site";
import {
  JOB_CATEGORY_LABELS,
  JOB_TYPE_LABELS,
  type JobCategory,
  type JobType,
} from "@/types/job";

type SearchParams = Record<string, string | string[] | undefined>;

/** Human-readable summary of the active filters, reused in the H1 and title. */
function describeFilters(params: SearchParams): string {
  const first = <T extends string>(value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value) as T | undefined;

  const jobType = first<JobType>(params.jobTypes);
  const category = first<JobCategory>(params.categories);
  const keyword = first<string>(params.q);
  const location = first<string>(params.location);

  const subject =
    keyword ??
    (category ? JOB_CATEGORY_LABELS[category] : undefined) ??
    (jobType ? JOB_TYPE_LABELS[jobType] : undefined);

  if (subject && location) return `${subject} jobs in ${location}`;
  if (subject) return `${subject} jobs`;
  if (location) return `Jobs in ${location}`;
  return "All Jobs";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const description = describeFilters(params);
  const page = Number.parseInt(
    (Array.isArray(params.page) ? params.page[0] : params.page) ?? "1",
    10,
  );

  // Facet permutations are near-infinite; letting Google index them wastes
  // crawl budget and creates thin duplicates. The unfiltered listing (and its
  // numbered pages) stay indexable.
  const isFiltered = [
    "q",
    "location",
    // `company` included deliberately: /companies/<slug> is the canonical
    // surface for "every role at X", so this listing should not compete with
    // it in the index.
    "company",
    "jobTypes",
    "categories",
    "jobLevels",
    "experienceLevel",
    "salaryBands",
    "sort",
    "view",
  ].some((key) => Boolean(params[key]));

  const pageSuffix = page > 1 ? ` — Page ${page}` : "";
  const canonical = page > 1 ? `/jobs?page=${page}` : "/jobs";

  return {
    title:
      description === "All Jobs"
        ? `All Jobs in India${pageSuffix}`
        : `${description}${pageSuffix}`,
    description: `Browse ${description.toLowerCase()} on ${siteConfig.name}. Filter by employment type, category, job level, experience and salary.`,
    alternates: isFiltered ? undefined : { canonical },
    robots: isFiltered ? { index: false, follow: true } : undefined,
  };
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = parseJobFilters(params);
  const view =
    (Array.isArray(params.view) ? params.view[0] : params.view) === "grid"
      ? "grid"
      : "list";

  const { jobs, total, page, totalPages, facets } = await getJobs({
    ...filters,
    perPage: view === "grid" ? 9 : JOBS_PER_PAGE,
  });

  // With ?company= active the slug alone would render as "All Jobs". The
  // company's real name comes off the embedded row on the first result, which
  // is already loaded — no extra query to title the page correctly.
  const companyName = filters.company ? jobs[0]?.company?.name : undefined;
  const heading = companyName
    ? `Jobs at ${companyName}`
    : describeFilters(params);

  return (
    <>
      <section className="hero-pattern border-b border-line-soft">
        <div className="container-page py-10">
          <h1 className="text-2xl font-bold sm:text-3xl">{heading}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {total} {total === 1 ? "opening" : "openings"} available
          </p>
          <div className="mt-6 hidden max-w-4xl lg:block">
            <Suspense fallback={<div className="skeleton h-[78px] w-full" />}>
              <JobSearchBar variant="inline" />
            </Suspense>
          </div>

          {/* Small screens get search and filters here, centred on the hero
              background. Once it scrolls away <MobileJobsBar> stands in. */}
          <Suspense fallback={<div className="mt-6 skeleton h-[150px] w-full lg:hidden" />}>
            <MobileJobsPanel facets={facets} />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={null}>
        <MobileJobsBar facets={facets} />
      </Suspense>

      <section className="container-page py-10 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <Suspense fallback={null}>
            <FilterSidebar facets={facets} />
          </Suspense>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <p className="text-sm text-slate-400">
                {/* Mobile keeps the total alone. The infinite scroll makes the
                    rendered count climb as you read, so "showing 7 of 32" is
                    stale the moment it paints — and it counts a page size the
                    reader never chose. The total is the one stable fact. */}
                <span className="lg:hidden">
                  <span className="font-semibold text-navy-700">{total}</span>{" "}
                  {total === 1 ? "result" : "results"}
                </span>
                <span className="hidden lg:inline">
                  Showing{" "}
                  <span className="font-semibold text-navy-700">
                    {jobs.length}
                  </span>{" "}
                  of {total} {total === 1 ? "result" : "results"}
                </span>
              </p>
              <Suspense fallback={<div className="skeleton h-8 w-56" />}>
                <ResultsToolbar view={view} />
              </Suspense>
            </div>

            <div className="mt-6">
              <JobList jobs={jobs} view={view} />
            </div>

            {/* Keyed on the query so applying a filter drops whatever the
                previous search had scrolled in, rather than appending to it. */}
            <MobileInfiniteJobs
              key={JSON.stringify(params)}
              params={params}
              page={page}
              totalPages={totalPages}
              view={view}
              seedIds={jobs.map((job) => job.id)}
            >
              <JobPagination
                page={page}
                totalPages={totalPages}
                searchParams={params}
              />
            </MobileInfiniteJobs>
          </div>
        </div>
      </section>
    </>
  );
}
