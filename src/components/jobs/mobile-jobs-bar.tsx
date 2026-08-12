"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  ClearFiltersButton,
  FilterGroups,
} from "@/components/jobs/filter-sidebar";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import {
  PendingSpinner,
  useJobsNavigation,
} from "@/components/jobs/jobs-navigation";
import { hasActiveFilters, withParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import type { FacetCounts } from "@/types/job";

/** Below Tailwind's `lg`, matching the rest of /jobs' mobile behaviour. */
const MOBILE_QUERY = "(max-width: 1023.98px)";

/** The sticky site header the collapsed bar parks beneath. */
const HEADER_HEIGHT = 74;

/** Scroll jitter under this many pixels never flips the bar. */
const DIRECTION_THRESHOLD = 6;

/**
 * Above this offset the expanded panel is still on screen, so the collapsed bar
 * stays out of the way entirely rather than doubling it.
 */
const COLLAPSE_AFTER = 220;

/* -------------------------------------------------------------------------- */
/*  At the top of the page: the full thing, centred on the hero background      */
/* -------------------------------------------------------------------------- */

/**
 * Search and filters as they appear at rest, inside the hero on small screens.
 *
 * Ordinary page flow — it scrolls away like everything else, and <MobileJobsBar>
 * takes over from there. Being in flow is also what keeps this the no-JS
 * fallback: it renders server-side and needs nothing to appear.
 */
export function MobileJobsPanel({ facets }: { facets: FacetCounts }) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="mt-6 lg:hidden">
      <div className="mx-auto w-full max-w-xl">
        <JobSearchBar variant="inline" idPrefix="mobile" showPopular={false} />

        <div className="mt-3 flex items-center justify-center gap-4">
          <FilterToggle
            id="mobile-job-filters"
            open={filtersOpen}
            onToggle={() => setFiltersOpen((value) => !value)}
          />
          <ClearAllIfFiltered />
        </div>

        {filtersOpen ? (
          <div
            id="mobile-job-filters"
            className="mt-4 space-y-8 border border-line bg-white p-5 text-left"
          >
            <FilterGroups facets={facets} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Once scrolled: a collapsed bar that slides in on the way back up            */
/* -------------------------------------------------------------------------- */

/**
 * The collapsed search + filters bar for /jobs on small screens.
 *
 * The expanded panel above is tall — two fields and a button, stacked — so it is
 * not what should reappear halfway down a listing. This is its collapsed form: a
 * single row holding the keyword field itself and the filters toggle, so a new
 * search is one tap and one Enter, with nothing unfolding underneath. It slides
 * away on the way down and returns on the way up, so the controls are always
 * about one gesture away without ever holding the viewport.
 *
 * Location stays with the full panel at the top of the page: it is the rarer
 * edit, and any value already set survives a search from here untouched.
 *
 * Purely an overlay: it is `fixed`, reserves no space, and renders nothing at
 * all until the page has scrolled past the panel it stands in for — so there is
 * no layout shift to manage and no spacer to keep in sync.
 *
 * Desktop keeps the hero search bar and the filter column and never mounts this.
 */
export function MobileJobsBar({ facets }: { facets: FacetCounts }) {
  const [isMobile, setIsMobile] = useState(false);
  const [visible, setVisible] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const lastScrollRef = useRef(0);
  // Read inside the scroll handler, which must not be rebuilt on every toggle.
  // Typing counts as busy too: the on-screen keyboard scrolls the page by itself.
  const busyRef = useRef(false);
  const typingRef = useRef(false);
  busyRef.current = filtersOpen;

  // Doubles as the mount flag: false through SSR, so this renders nothing until
  // the client confirms both that it is running and that the screen is small.
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    lastScrollRef.current = Math.max(0, window.scrollY);
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;

        // Clamped: iOS rubber-banding reports negative offsets at both ends,
        // which would otherwise read as a direction change and flap the bar.
        const current = Math.max(0, window.scrollY);
        const delta = current - lastScrollRef.current;

        if (Math.abs(delta) < DIRECTION_THRESHOLD) return;
        lastScrollRef.current = current;

        // Back at the top the expanded panel is on screen and owns the job.
        if (current <= COLLAPSE_AFTER) {
          setVisible(false);
          return;
        }

        // Never pull the bar out from under someone typing or ticking a filter.
        if (busyRef.current || typingRef.current) return;

        setVisible(delta < 0);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isMobile]);

  // Collapse on the way out, so it never slides back in mid-expansion.
  useEffect(() => {
    if (!visible) setFiltersOpen(false);
  }, [visible]);

  if (!isMobile) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-30 border-b border-line-soft bg-white transition-transform duration-300 lg:hidden motion-reduce:transition-none",
        // Its own height is enough to clear the viewport: the header is opaque
        // and sits a layer above, so the bar simply parks behind it.
        !visible && "pointer-events-none -translate-y-full",
      )}
      style={{ top: HEADER_HEIGHT }}
    >
      <div className="container-page flex items-center gap-3 py-3">
        <StickySearchField
          onTypingChange={(typing) => {
            typingRef.current = typing;
          }}
        />
        <FilterToggle
          id="sticky-job-filters"
          compact
          open={filtersOpen}
          onToggle={() => setFiltersOpen((value) => !value)}
        />
      </div>

      {/* The filter panel opens inside the bar and scrolls internally, so it is
          reachable from wherever the reader is without pushing the listing
          off the bottom of the screen. */}
      {filtersOpen ? (
        <div
          id="sticky-job-filters"
          className="max-h-[60vh] overflow-y-auto border-t border-line-soft"
        >
          <div className="container-page space-y-8 py-5">
            <div className="flex justify-end">
              <ClearAllIfFiltered />
            </div>
            <FilterGroups facets={facets} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The collapsed bar's search field: the real input rather than a button that
 * opens one, so the whole interaction is tap, type, Enter. It shows the keyword
 * currently in the URL, so a reader halfway down a filtered listing can also see
 * what produced it without scrolling back up.
 */
function StickySearchField({
  onTypingChange,
}: {
  onTypingChange: (typing: boolean) => void;
}) {
  const { navigate, pending } = useJobsNavigation();
  const searchParams = useSearchParams();
  const applied = searchParams.get("q") ?? "";

  const [keyword, setKeyword] = useState(applied);
  const inputRef = useRef<HTMLInputElement>(null);

  // Follow the URL when the keyword changes elsewhere — "Clear all", a popular
  // search, the back button — without fighting whatever is being typed here.
  useEffect(() => setKeyword(applied), [applied]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Dismisses the on-screen keyboard, so the results are visible on landing.
    inputRef.current?.blur();
    navigate(`/jobs${withParams(searchParams, { q: keyword.trim() || null })}`);
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search jobs"
      className="flex min-w-0 flex-1 items-center gap-2.5 border border-line px-3.5 py-2"
    >
      {pending ? (
        <PendingSpinner className="size-4 shrink-0 text-primary" />
      ) : (
        <Search className="size-4 shrink-0 text-navy-700" aria-hidden />
      )}
      <label htmlFor="sticky-job-keyword" className="sr-only">
        Job title or keyword
      </label>
      <input
        ref={inputRef}
        id="sticky-job-keyword"
        name="q"
        type="search"
        enterKeyHint="search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        onFocus={() => onTypingChange(true)}
        onBlur={() => onTypingChange(false)}
        placeholder="Search jobs"
        className="w-full min-w-0 border-0 bg-transparent py-0.5 text-sm text-navy-700 placeholder:text-slate-400 focus:outline-none"
      />
    </form>
  );
}

function FilterToggle({
  id,
  open,
  onToggle,
  compact = false,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const active = hasActiveFilters(useSearchParams());

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={id}
      aria-label={compact ? "Filters" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 border border-line py-2.5 text-sm font-semibold text-navy-700",
        compact ? "px-3" : "px-4",
      )}
    >
      {open ? (
        <X className="size-4" aria-hidden />
      ) : (
        <SlidersHorizontal className="size-4" aria-hidden />
      )}
      {compact ? null : "Filters"}
      {active ? (
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs text-white">
          •
        </span>
      ) : null}
    </button>
  );
}

function ClearAllIfFiltered() {
  const active = hasActiveFilters(useSearchParams());
  return active ? <ClearFiltersButton /> : null;
}
