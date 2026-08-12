"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";

import { loadMoreJobs } from "@/app/actions/jobs";
import { JobCard } from "@/components/jobs/job-card";
import { cn } from "@/lib/utils";
import type { JobWithCompany } from "@/types/job";

/**
 * Below Tailwind's `lg` — exactly where /jobs drops its filter sidebar and
 * becomes a single column. One breakpoint governs the layout and the paging
 * behaviour, so they can never disagree.
 */
const MOBILE_QUERY = "(max-width: 1023.98px)";

/** Start fetching before the sentinel is actually on screen. */
const PREFETCH_MARGIN = "600px 0px";

interface MobileInfiniteJobsProps {
  /** Raw search params for this request; re-validated server-side on each load. */
  params: Record<string, string | string[] | undefined>;
  /** The page the server rendered. Loading continues from the one after it. */
  page: number;
  totalPages: number;
  view: "list" | "grid";
  /** ids already on the page, so a shifted row can't render twice. */
  seedIds: string[];
  /** The numbered pagination — desktop's control, and the no-JS fallback. */
  children: ReactNode;
}

/**
 * Infinite scroll for /jobs on small screens only.
 *
 * Desktop keeps the numbered pagination: it is a real set of crawlable anchors,
 * and on a wide screen the page numbers are a faster way around a long list than
 * scrolling. Thumbs on a phone want the opposite.
 *
 * The server still renders the requested page in full, so the first screen of
 * results, the metadata and the crawl path are unchanged — this only appends.
 * Pagination stays mounted underneath and is merely hidden while the scroll is
 * driving, which is what keeps the no-JS case working: without JavaScript this
 * component never mounts its own controls and never hides anything.
 */
export function MobileInfiniteJobs({
  params,
  page,
  totalPages,
  view,
  seedIds,
  children,
}: MobileInfiniteJobsProps) {
  const [extra, setExtra] = useState<JobWithCompany[]>([]);
  const [hasMore, setHasMore] = useState(page < totalPages);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [isMobile, setIsMobile] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const nextPageRef = useRef(page + 1);
  // Guards against the observer firing again while a request is in flight;
  // state would settle a render too late to stop a double fetch.
  const loadingRef = useRef(false);

  // Also the mount flag: false during SSR and the first client render, so the
  // markup React hydrates matches the HTML the server sent.
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const load = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setStatus("loading");

    try {
      const result = await loadMoreJobs(params, nextPageRef.current);

      setExtra((previous) => {
        // A listing added or edited mid-scroll can shift across the page
        // boundary and come back twice. Duplicate React keys throw, so filter
        // against everything already on screen rather than trusting the offset.
        const seen = new Set([...seedIds, ...previous.map((job) => job.id)]);
        return [...previous, ...result.jobs.filter((job) => !seen.has(job.id))];
      });

      nextPageRef.current = result.page + 1;
      setHasMore(result.hasMore);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore, params, seedIds]);

  // The observer reads the newest `load` through a ref, so it is built once per
  // activation instead of being torn down and rebuilt on every state change.
  const loadRef = useRef(load);
  loadRef.current = load;

  const active = isMobile && hasMore;

  // Once the scroll is driving, the numbered pages are redundant on a phone —
  // including at the end of the list, where they were only ever a way back up.
  // `isMobile` is false until mount, so the server HTML ships them unhidden and
  // a browser without JavaScript keeps a working way through the listing.
  const paginationHidden = isMobile;

  useEffect(() => {
    if (!active) return;

    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadRef.current();
      },
      { rootMargin: PREFETCH_MARGIN },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return (
    <>
      {extra.length ? (
        <div
          className={cn(
            "mt-4",
            view === "grid"
              ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-4",
          )}
        >
          {extra.map((job) => (
            <JobCard key={job.id} job={job} view={view} />
          ))}
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {status === "loading"
          ? "Loading more jobs…"
          : extra.length
            ? `${extra.length} more jobs loaded.`
            : ""}
      </p>

      {isMobile ? (
        <div
          ref={sentinelRef}
          className="mt-8 flex justify-center lg:hidden"
          data-testid="infinite-scroll-sentinel"
        >
          {status === "error" ? (
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 border border-line px-5 py-3 text-sm font-semibold text-navy-700 hover:border-primary hover:text-primary"
            >
              <RotateCcw className="size-4" aria-hidden />
              Couldn&apos;t load more — retry
            </button>
          ) : status === "loading" ? (
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Loading more jobs…
            </span>
          ) : hasMore ? (
            // The observer normally fires first, but a tap has to work too: on a
            // short viewport, with the observer unsupported, or when a scroll
            // ends past the sentinel without a fresh intersection.
            <button
              type="button"
              onClick={() => void load()}
              className="border border-line px-5 py-3 text-sm font-semibold text-navy-700 hover:border-primary hover:text-primary"
            >
              Load more jobs
            </button>
          ) : extra.length ? (
            <p className="text-sm text-slate-400">
              That&apos;s every matching job.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={cn(paginationHidden && "hidden lg:block")}>{children}</div>
    </>
  );
}
