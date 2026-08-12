import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface JobPaginationProps {
  page: number;
  totalPages: number;
  /** Raw searchParams for the current request, minus `page`. */
  searchParams: Record<string, string | string[] | undefined>;
  basePath?: string;
}

/**
 * Numbered pagination, rendered as real anchors so crawlers can walk the whole
 * listing.
 *
 * This stays the control on desktop and the fallback everywhere: on small
 * screens <MobileInfiniteJobs> hides it while its scroll is driving, and shows
 * it again at the end of the list, on a failure, or when JavaScript never runs.
 */
export function JobPagination({
  page,
  totalPages,
  searchParams,
  basePath = "/jobs",
}: JobPaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page" || value === undefined) continue;
      params.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  };

  return (
    <nav aria-label="Pagination" className="mt-12 flex justify-center">
      <ul className="flex items-center gap-2">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              rel="prev"
              aria-label="Previous page"
              className="flex size-10 items-center justify-center text-slate-400 hover:text-primary"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </Link>
          ) : (
            <span
              aria-hidden
              className="flex size-10 items-center justify-center text-line"
            >
              <ChevronLeft className="size-5" />
            </span>
          )}
        </li>

        {pageWindow(page, totalPages).map((entry, index) =>
          entry === "gap" ? (
            <li
              key={`gap-${index}`}
              aria-hidden
              className="flex size-10 items-center justify-center text-slate-400"
            >
              …
            </li>
          ) : (
            <li key={entry}>
              <Link
                href={hrefFor(entry)}
                aria-current={entry === page ? "page" : undefined}
                aria-label={`Page ${entry}`}
                className={cn(
                  "flex size-10 items-center justify-center text-base font-semibold transition-colors",
                  entry === page
                    ? "bg-primary text-white"
                    : "text-slate-400 hover:bg-primary-surface hover:text-primary",
                )}
              >
                {entry}
              </Link>
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <Link
              href={hrefFor(page + 1)}
              rel="next"
              aria-label="Next page"
              className="flex size-10 items-center justify-center text-slate-400 hover:text-primary"
            >
              <ChevronRight className="size-5" aria-hidden />
            </Link>
          ) : (
            <span
              aria-hidden
              className="flex size-10 items-center justify-center text-line"
            >
              <ChevronRight className="size-5" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

/** 1 2 3 4 5 … 33 — first pages, a gap, then the last page. */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const window = new Set<number>([1, totalPages, page]);
  for (const offset of [-2, -1, 1, 2]) {
    const candidate = page + offset;
    if (candidate > 1 && candidate < totalPages) window.add(candidate);
  }
  if (page <= 4) for (const candidate of [2, 3, 4, 5]) window.add(candidate);
  if (page >= totalPages - 3) {
    for (const candidate of [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1]) {
      if (candidate > 1) window.add(candidate);
    }
  }

  const sorted = [...window].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];

  sorted.forEach((value, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && value - previous > 1) result.push("gap");
    result.push(value);
  });

  return result;
}
