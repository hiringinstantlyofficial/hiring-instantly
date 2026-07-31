"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Rows3 } from "lucide-react";
import { useTransition } from "react";

import { withParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { JOB_SORTS, JOB_SORT_LABELS, type JobSort } from "@/types/job";

/** "Sort by" dropdown plus the grid/list view toggle from the reference. */
export function ResultsToolbar({ view }: { view: "list" | "grid" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const sort = (searchParams.get("sort") ?? "relevant") as JobSort;

  const push = (updates: Parameters<typeof withParams>[1], resetPage = true) => {
    startTransition(() =>
      router.push(`${pathname}${withParams(searchParams, updates, { resetPage })}`, {
        scroll: false,
      }),
    );
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-slate-600">
          Sort by:
        </label>
        <select
          id="sort"
          value={sort}
          disabled={pending}
          onChange={(event) => push({ sort: event.target.value })}
          className="cursor-pointer border-0 bg-transparent py-1 pr-1 text-sm font-semibold text-navy-700 focus:outline-none"
        >
          {JOB_SORTS.map((option) => (
            <option key={option} value={option}>
              {JOB_SORT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div
        className="hidden items-center gap-1 sm:flex"
        role="group"
        aria-label="Result layout"
      >
        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          onClick={() => push({ view: "grid" }, false)}
          className={cn(
            "flex size-8 items-center justify-center transition-colors",
            view === "grid"
              ? "bg-primary-surface text-primary"
              : "text-slate-400 hover:text-primary",
          )}
        >
          <LayoutGrid className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="List view"
          aria-pressed={view === "list"}
          onClick={() => push({ view: null }, false)}
          className={cn(
            "flex size-8 items-center justify-center transition-colors",
            view === "list"
              ? "bg-primary-surface text-primary"
              : "text-slate-400 hover:text-primary",
          )}
        >
          <Rows3 className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
