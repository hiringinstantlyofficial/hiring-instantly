import { ChevronRight } from "lucide-react";

export default function JobDetailLoading() {
  return (
    <>
      {/* --- header ---------------------------------------------------------- */}
      <div className="hero-pattern border-b border-line-soft">
        <div className="container-page py-8 lg:py-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5">
              <li className="skeleton h-5 w-12 rounded-md" />
              <ChevronRight className="size-4 text-slate-400" aria-hidden />
              <li className="skeleton h-5 w-12 rounded-md" />
              <ChevronRight className="size-4 text-slate-400" aria-hidden />
              <li className="skeleton h-5 w-32 rounded-md" />
            </ol>
          </nav>

          <div className="mt-6 flex flex-col gap-6 border border-line bg-white p-6 sm:flex-row sm:items-center lg:p-8">
            <div className="skeleton size-20 shrink-0 rounded-md" />

            <div className="min-w-0 flex-1">
              <div className="skeleton h-8 w-3/4 max-w-lg rounded-md" />
              <div className="mt-4 flex items-center gap-2">
                <div className="skeleton h-5 w-32 rounded-md" />
                <span className="text-slate-400">•</span>
                <div className="skeleton h-5 w-24 rounded-md" />
                <span className="text-slate-400">•</span>
                <div className="skeleton h-5 w-24 rounded-md" />
              </div>
              <div className="skeleton mt-3 h-5 w-48 rounded-md" />
            </div>

            <div className="w-full sm:w-56">
              <div className="skeleton h-12 w-full rounded-md" />
              <div className="skeleton mt-4 h-2 w-full rounded-full" />
              <div className="skeleton mt-2 h-4 w-3/4 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* --- body ------------------------------------------------------------ */}
      <div className="container-page py-12 lg:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <article className="min-w-0 flex-1 space-y-10">
            <section>
              <div className="skeleton h-8 w-40 rounded-md" />
              <div className="mt-4 space-y-3">
                <div className="skeleton h-5 w-full rounded-md" />
                <div className="skeleton h-5 w-full rounded-md" />
                <div className="skeleton h-5 w-11/12 rounded-md" />
                <div className="skeleton h-5 w-4/5 rounded-md" />
              </div>
            </section>

            <section>
              <div className="skeleton h-8 w-48 rounded-md" />
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton size-5 shrink-0 rounded-full" />
                  <div className="skeleton h-5 w-full rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="skeleton size-5 shrink-0 rounded-full" />
                  <div className="skeleton h-5 w-11/12 rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="skeleton size-5 shrink-0 rounded-full" />
                  <div className="skeleton h-5 w-4/5 rounded-md" />
                </div>
              </div>
            </section>
          </article>

          {/* --- meta rail ---------------------------------------------------- */}
          <aside className="w-full shrink-0 lg:w-[320px]">
            <div className="border border-line p-6">
              <div className="skeleton h-6 w-32 rounded-md" />
              <div className="mt-5 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="skeleton h-5 w-24 rounded-md" />
                    <div className="skeleton h-5 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
