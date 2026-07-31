"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { useState, useTransition } from "react";

import { hasActiveFilters, readList, toggleListValue, withParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
  JOB_CATEGORIES,
  JOB_CATEGORY_LABELS,
  JOB_LEVELS,
  JOB_LEVEL_LABELS,
  JOB_TYPES,
  JOB_TYPE_LABELS,
  SALARY_BANDS,
  type FacetCounts,
} from "@/types/job";

interface FilterSidebarProps {
  facets: FacetCounts;
}

export function FilterSidebar({ facets }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchParams = useSearchParams();
  const active = hasActiveFilters(searchParams);

  return (
    <>
      {/* Mobile: filters collapse behind a button so the list stays above the fold. */}
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="job-filters"
          className="inline-flex items-center gap-2 border border-line px-4 py-2.5 text-sm font-semibold text-navy-700"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
          {active ? (
            <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              •
            </span>
          ) : null}
        </button>
        {active ? <ClearFiltersButton /> : null}
      </div>

      <aside
        id="job-filters"
        aria-label="Filter jobs"
        className={cn(
          "shrink-0 lg:block lg:w-(--container-sidebar)",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="mt-6 space-y-8 border border-line p-5 lg:mt-0 lg:border-0 lg:p-0">
          <div className="hidden items-center justify-between lg:flex">
            {active ? <ClearFiltersButton /> : null}
          </div>

          <FilterGroup title="Type of Employment">
            {JOB_TYPES.map((type) => (
              <FacetCheckbox
                key={type}
                paramKey="jobTypes"
                value={type}
                label={JOB_TYPE_LABELS[type]}
                count={facets.jobTypes[type]}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Categories">
            {JOB_CATEGORIES.map((category) => (
              <FacetCheckbox
                key={category}
                paramKey="categories"
                value={category}
                label={JOB_CATEGORY_LABELS[category]}
                count={facets.categories[category]}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Job Level">
            {JOB_LEVELS.map((level) => (
              <FacetCheckbox
                key={level}
                paramKey="jobLevels"
                value={level}
                label={JOB_LEVEL_LABELS[level]}
                count={facets.jobLevels[level]}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Experience">
            {EXPERIENCE_LEVELS.map((level) => (
              <FacetRadio
                key={level}
                value={level}
                label={EXPERIENCE_LEVEL_LABELS[level]}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Salary Range">
            {SALARY_BANDS.map((band) => (
              <FacetCheckbox
                key={band.id}
                paramKey="salaryBands"
                value={band.id}
                label={band.label}
                count={facets.salaryBands[band.id]}
              />
            ))}
          </FilterGroup>
        </div>
      </aside>
    </>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const id = `filter-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section>
      <h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between py-1 text-left"
        >
          <span className="text-base font-semibold text-navy-700">{title}</span>
          <ChevronUp
            aria-hidden
            className={cn(
              "size-5 text-navy-700 transition-transform",
              open ? "" : "rotate-180",
            )}
          />
        </button>
      </h2>
      <div id={id} hidden={!open} className="mt-4 space-y-4">
        {children}
      </div>
    </section>
  );
}

/** Shared navigation for every facet control. */
function useFacetNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const apply = (updates: Parameters<typeof withParams>[1]) => {
    // Filters live in the URL so results stay server-rendered, shareable and
    // crawlable. `scroll: false` keeps the user's place in the list.
    const target = `${pathname === "/" ? "/jobs" : pathname}${withParams(searchParams, updates)}`;
    startTransition(() => router.push(target, { scroll: false }));
  };

  return { apply, searchParams, pending };
}

function FacetCheckbox({
  paramKey,
  value,
  label,
  count,
}: {
  paramKey: string;
  value: string;
  label: string;
  count?: number;
}) {
  const { apply, searchParams, pending } = useFacetNavigation();
  const checked = readList(searchParams, paramKey).includes(value);

  return (
    <label className="flex cursor-pointer items-center gap-3 text-base text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={() => apply(toggleListValue(searchParams, paramKey, value))}
        className="size-6 shrink-0 cursor-pointer appearance-none rounded-xs border border-line bg-white checked:border-primary checked:bg-primary checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%2220 6 9 17 4 12%22/></svg>')] checked:bg-center checked:bg-no-repeat"
      />
      <span>
        {label}
        {typeof count === "number" ? (
          <span className="text-slate-400"> ({count})</span>
        ) : null}
      </span>
    </label>
  );
}

/** Fresher/Experienced is single-select, so it reads as a radio group. */
function FacetRadio({ value, label }: { value: string; label: string }) {
  const { apply, searchParams, pending } = useFacetNavigation();
  const current = searchParams.get("experienceLevel");
  const checked = current === value;

  return (
    <label className="flex cursor-pointer items-center gap-3 text-base text-slate-600">
      <input
        type="radio"
        name="experienceLevel"
        checked={checked}
        disabled={pending}
        // Clicking the checked option clears the filter.
        onChange={() => apply({ experienceLevel: checked ? null : value })}
        onClick={() => {
          if (checked) apply({ experienceLevel: null });
        }}
        className="size-5 shrink-0 cursor-pointer appearance-none rounded-full border border-line bg-white checked:border-[6px] checked:border-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function ClearFiltersButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = new URLSearchParams(searchParams.toString());
        for (const key of [
          "q",
          "location",
          "jobTypes",
          "categories",
          "jobLevels",
          "experienceLevel",
          "salaryBands",
          "page",
        ]) {
          next.delete(key);
        }
        const query = next.toString();
        startTransition(() =>
          router.push(`${pathname}${query ? `?${query}` : ""}`, {
            scroll: false,
          }),
        );
      }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
    >
      <X className="size-4" aria-hidden />
      Clear all
    </button>
  );
}
