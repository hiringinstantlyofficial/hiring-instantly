import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { Hero } from "@/components/home/hero";
import { JobList } from "@/components/jobs/job-list";
import { WebSiteJsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { getJobs, JOBS_PER_PAGE } from "@/lib/jobs";
import { siteConfig } from "@/lib/site";

/**
 * The homepage is statically rendered and revalidated on an interval, so it
 * stays fast and crawlable. It reads no searchParams.
 *
 * It is deliberately NOT a second copy of /jobs: the filter sidebar, the sort
 * toolbar and pagination all live on /jobs alone. Running both surfaces off the
 * same JobList + FilterSidebar + JobPagination made `/` and `/jobs?page=1`
 * near-identical documents competing for the same queries. Here the job list is
 * a curated "latest openings" teaser that hands off to /jobs for anything else.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline} in India`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  // Newest first, explicitly — the heading below promises "Latest Jobs", and
  // the featured-first ordering used to push older promoted listings above
  // genuinely new ones.
  const { jobs, total } = await getJobs({
    page: 1,
    perPage: JOBS_PER_PAGE,
    sort: "newest",
  });

  return (
    <>
      <Hero />

      <section className="container-page py-12 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-h2">Latest Jobs</h2>
            <p className="mt-1 text-sm text-slate-400">
              The {jobs.length} most recent of {total}{" "}
              {total === 1 ? "opening" : "openings"} hiring right now
            </p>
          </div>
          <ButtonLink href="/jobs" variant="outline">
            Browse all jobs
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>

        <div className="mt-6">
          <JobList jobs={jobs} view="list" />
        </div>

        {jobs.length ? (
          <div className="mt-10 border border-line bg-surface-muted p-8 text-center">
            <h3 className="text-h4">Looking for something specific?</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
              Search by keyword and location, then narrow by employment type,
              category, job level, experience and salary.
            </p>
            <div className="mt-5 flex justify-center">
              <ButtonLink href="/jobs" size="lg">
                Search and filter every opening
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </section>

      <WebSiteJsonLd />
    </>
  );
}
