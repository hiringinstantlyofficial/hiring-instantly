import { ChevronRight } from "lucide-react";

export default function CompanyProfileLoading() {
  return (
    <>
      <div className="hero-pattern border-b border-line-soft">
        <div className="container-page py-8 lg:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5">
              <li className="skeleton h-4 w-12 rounded-md" />
              <ChevronRight className="size-4 text-slate-400" aria-hidden />
              <li className="skeleton h-4 w-20 rounded-md" />
              <ChevronRight className="size-4 text-slate-400" aria-hidden />
              <li className="skeleton h-4 w-28 rounded-md" />
            </ol>
          </nav>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="skeleton size-24 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <div className="skeleton h-10 w-72 max-w-full rounded-md" />
              <div className="skeleton mt-3 h-5 w-96 max-w-full rounded-md" />
              <div className="skeleton mt-3 h-4 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-12 lg:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="min-w-0 flex-1">
            <div className="skeleton h-7 w-56 rounded-md" />
            <div className="mt-4 space-y-3">
              <div className="skeleton h-4 w-full rounded-md" />
              <div className="skeleton h-4 w-full rounded-md" />
              <div className="skeleton h-4 w-2/3 rounded-md" />
            </div>

            <div className="skeleton mt-12 h-7 w-64 rounded-md" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-line bg-white p-6">
                  <div className="flex items-center gap-5">
                    <div className="skeleton size-12 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <div className="skeleton h-6 w-2/3 rounded-md" />
                      <div className="skeleton mt-2 h-4 w-1/2 rounded-md" />
                    </div>
                    <div className="skeleton hidden h-11 w-32 shrink-0 rounded-md sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="w-full shrink-0 lg:w-[320px]">
            <div className="border border-line p-6">
              <div className="skeleton h-6 w-32 rounded-md" />
              <div className="mt-5 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-4 w-full rounded-md" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
