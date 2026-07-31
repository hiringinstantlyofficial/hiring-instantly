import { JobListSkeleton } from "@/components/jobs/job-list";

export default function JobsLoading() {
  return (
    <>
      <section className="hero-pattern border-b border-line-soft">
        <div className="container-page py-10">
          <div className="skeleton h-9 w-64" />
          <div className="skeleton mt-3 h-5 w-40" />
          <div className="skeleton mt-6 h-[78px] max-w-4xl" />
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="hidden shrink-0 space-y-8 lg:block lg:w-(--container-sidebar)">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-4">
                <div className="skeleton h-6 w-40" />
                {Array.from({ length: 4 }, (__, row) => (
                  <div key={row} className="skeleton h-6 w-full" />
                ))}
              </div>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-end justify-between gap-4">
              <div className="skeleton h-5 w-48" />
              <div className="skeleton h-8 w-56" />
            </div>
            <div className="mt-6">
              <JobListSkeleton />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
