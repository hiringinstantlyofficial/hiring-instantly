/** Helpers for reading and writing the job-search state held in the URL. */

export type ParamUpdates = Record<string, string | string[] | null | undefined>;

/**
 * Returns a query string with `updates` applied. `null` removes a key. Any
 * change resets pagination, since page 4 of the old filter set is meaningless.
 */
export function withParams(
  current: URLSearchParams | ReadonlyURLSearchParamsLike,
  updates: ParamUpdates,
  { resetPage = true }: { resetPage?: boolean } = {},
): string {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      next.delete(key);
    } else if (Array.isArray(value)) {
      if (value.length) next.set(key, value.join(","));
      else next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  if (resetPage && !("page" in updates)) next.delete("page");
  if (next.get("page") === "1") next.delete("page");

  const query = next.toString();
  return query ? `?${query}` : "";
}

interface ReadonlyURLSearchParamsLike {
  toString(): string;
}

/** Reads a comma-separated multi-value param into an array. */
export function readList(
  params: ReadonlyURLSearchParamsLike,
  key: string,
): string[] {
  const raw = new URLSearchParams(params.toString()).get(key);
  return raw ? raw.split(",").filter(Boolean) : [];
}

/** Adds or removes `value` from a comma-separated multi-value param. */
export function toggleListValue(
  params: ReadonlyURLSearchParamsLike,
  key: string,
  value: string,
): ParamUpdates {
  const current = readList(params, key);
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return { [key]: next.length ? next : null };
}

/** True when any facet, keyword or location filter is applied. */
export function hasActiveFilters(
  params: ReadonlyURLSearchParamsLike,
): boolean {
  const search = new URLSearchParams(params.toString());
  return [
    "q",
    "location",
    "jobTypes",
    "categories",
    "jobLevels",
    "experienceLevel",
    "salaryBands",
  ].some((key) => Boolean(search.get(key)));
}
