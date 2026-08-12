import {
  DEFAULT_JOB_SORT,
  JOB_CATEGORIES,
  JOB_LEVELS,
  JOB_SORTS,
  JOB_TYPES,
  SALARY_BANDS,
  type JobFilters,
  type JobSort,
  type SalaryBandId,
} from "@/types/job";

/**
 * URL search params -> typed filters.
 *
 * Kept in its own module, separate from the query layer in lib/jobs.ts, so it
 * carries no dependency on the Supabase client or next/headers: it is pure, it
 * is the boundary where untrusted URL input becomes typed data, and it can be
 * unit-tested directly.
 */
export function parseJobFilters(
  params: Record<string, string | string[] | undefined>,
): JobFilters {
  const readList = <T extends string>(
    key: string,
    allowed: readonly T[],
  ): T[] | undefined => {
    const raw = params[key];
    if (!raw) return undefined;
    const values = (Array.isArray(raw) ? raw : raw.split(","))
      .map((value) => value.trim())
      .filter((value): value is T =>
        (allowed as readonly string[]).includes(value),
      );
    return values.length ? values : undefined;
  };

  const readString = (key: string): string | undefined => {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value?.trim() ? value.trim() : undefined;
  };

  const pageRaw = Number.parseInt(readString("page") ?? "1", 10);
  const sortRaw = readString("sort");

  // A company slug, not a name: /jobs?company=acme-labs. Shape-checked here
  // rather than trusted, since it goes into a database filter downstream.
  const company = readString("company");

  return {
    q: readString("q"),
    location: readString("location"),
    company:
      company && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(company)
        ? company
        : undefined,
    jobTypes: readList("jobTypes", JOB_TYPES),
    categories: readList("categories", JOB_CATEGORIES),
    jobLevels: readList("jobLevels", JOB_LEVELS),
    experienceLevel: readList("experienceLevel", [
      "fresher",
      "experienced",
    ] as const)?.[0],
    salaryBands: readList(
      "salaryBands",
      SALARY_BANDS.map((band) => band.id) as readonly SalaryBandId[],
    ),
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    sort: (JOB_SORTS as readonly string[]).includes(sortRaw ?? "")
      ? (sortRaw as JobSort)
      : DEFAULT_JOB_SORT,
  };
}
