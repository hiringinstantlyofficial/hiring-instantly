import {
  JOB_CATEGORIES,
  JOB_LEVELS,
  JOB_TYPES,
  SALARY_BANDS,
  type JobFilters,
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

  return {
    q: readString("q"),
    location: readString("location"),
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
    sort:
      sortRaw === "newest" || sortRaw === "salary-high" || sortRaw === "relevant"
        ? sortRaw
        : "relevant",
  };
}
