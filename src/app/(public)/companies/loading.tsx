import { ChevronRight } from "lucide-react";

export default function CompaniesLoading() {
  return (
    <>
      <div className="bg-surface-muted border-b border-line">
        <div className="container-page py-8 lg:py-12">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5">
              <li className="skeleton h-4 w-12 rounded-md" />
              <ChevronRight className="size-4 text-slate-400" aria-hidden />
              <li className="skeleton h-4 w-20 rounded-md" />
            </ol>
          </nav>
          <div className="skeleton h-9 w-64 rounded-md" />
          <div className="skeleton mt-3 h-5 w-80 rounded-md" />
        </div>
      </div>

      <div className="container-page py-12 lg:py-16">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <li
              key={i}
              className="flex h-full flex-col border border-line bg-white p-6"
            >
              <div className="flex items-center gap-4">
                <div className="skeleton size-12 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <div className="skeleton h-6 w-3/4 rounded-md" />
                  <div className="skeleton mt-2 h-4 w-1/2 rounded-md" />
                </div>
              </div>
              <div className="skeleton mt-4 h-4 w-2/3 rounded-md" />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
