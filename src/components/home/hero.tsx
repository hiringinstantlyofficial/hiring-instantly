import { Suspense } from "react";

import { JobSearchBar } from "@/components/jobs/job-search-bar";

/** Hand-drawn double underline under the accent word, as in the reference. */
function SketchUnderline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 16"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full text-accent-blue"
    >
      <path
        d="M2 8.5C40 4 96 3 145 5.5c33 1.7 63 3.5 93 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M6 13c46-3.5 104-4.2 152-2 26 1.2 52 2 78 .5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/** Same box model as the real search bar, so hydration shifts nothing. */
function SearchBarFallback() {
  return (
    <div>
      <div className="skeleton h-[78px] w-full" />
      <div className="skeleton mt-4 h-5 w-72" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero-pattern border-b border-line-soft">
      <div className="container-page py-14 text-center lg:py-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-display">
          Find your{" "}
          <span className="relative inline-block whitespace-nowrap text-accent-blue">
            dream job
            <SketchUnderline />
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          Verified openings for freshers and experienced professionals at
          startups and enterprises hiring across India.
        </p>

        <div className="mx-auto mt-10 max-w-4xl text-left">
          {/* The search bar reads the URL, so it renders inside a boundary to
              keep the rest of the hero statically prerendered. */}
          <Suspense fallback={<SearchBarFallback />}>
            <JobSearchBar />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
