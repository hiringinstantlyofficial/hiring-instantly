import {
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  JOB_LEVELS,
  JOB_STATUSES,
  JOB_TYPES,
} from "@/types/job";

import type { JobFormValues } from "./validations";

/**
 * The combined word count the scrape prompt (docs/job-scrape-prompt.md) asks
 * for across the five content fields. Short listings rank badly, so the import
 * warns rather than silently accepting a thin one.
 */
export const MIN_DETAIL_WORDS = 600;

const CONTENT_KEYS = [
  "description",
  "responsibilities",
  "requirements",
  "nice_to_haves",
  "benefits",
] as const;

/** Every key the importer understands. Anything else is reported, not applied. */
const KNOWN_KEYS = [
  "title",
  "slug",
  "company_name",
  "company_logo_url",
  "company_website",
  "company_description",
  "location",
  "job_type",
  "categories",
  "experience_level",
  "job_level",
  "min_experience_years",
  "salary_min",
  "salary_max",
  "salary_currency",
  "description",
  "responsibilities",
  "requirements",
  "nice_to_haves",
  "skills",
  "benefits",
  "application_url",
  "application_email",
  "capacity",
  "applicants_count",
  "status",
  "is_featured",
  "posted_at",
  "valid_through",
] as const;

export type JobImportResult =
  | { ok: true; values: Partial<JobFormValues>; warnings: string[] }
  | { ok: false; error: string };

/**
 * Models like to wrap JSON in a ```json fence even when told not to, and to
 * add a sentence before it. Take the outermost braces and drop the rest.
 */
function extractJson(input: string): string {
  const trimmed = input.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end <= start) return trimmed.trim();
  return trimmed.slice(start, end + 1);
}

function asText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

/** Array (or already-newlined string) -> the one-per-line textarea format. */
function asLines(value: unknown): string | undefined {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split("\n")
      : null;
  if (!items) return undefined;

  const cleaned = items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);

  return cleaned.length ? cleaned.join("\n") : undefined;
}

/** Array (or already-joined string) -> the comma-separated input format. */
function asCsv(value: unknown): string | undefined {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : null;
  if (!items) return undefined;

  const cleaned = items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return cleaned.length ? cleaned.join(", ") : undefined;
}

/**
 * Numbers arrive as numbers, as "600000", or — often enough to be worth
 * handling — as "₹6,00,000". Anything else is a warning, not a silent zero.
 */
function asNumber(value: unknown): number | null | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const stripped = value.replace(/[₹$,\s]/g, "");
  const parsed = Number(stripped);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Any parseable date -> the `yyyy-MM-dd` a date input expects. */
function asDateInput(value: unknown): string | null | undefined {
  const text = asText(value);
  if (!text) return undefined;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function asEnum<T extends string>(
  allowed: readonly T[],
  value: unknown,
): T | null | undefined {
  const text = asText(value);
  if (!text) return undefined;
  const match = allowed.find((option) => option === text.toLowerCase());
  return match ?? null;
}

function countWords(values: Partial<JobFormValues>): number {
  return CONTENT_KEYS.reduce((total, key) => {
    const text = values[key];
    if (typeof text !== "string") return total;
    return total + text.split(/\s+/).filter(Boolean).length;
  }, 0);
}

/**
 * Turns the JSON a scrape produces into form values.
 *
 * Deliberately lenient about shape and strict about content: a field it cannot
 * read is left at the form's current value and reported as a warning, so a bad
 * enum or an unparseable salary never lands in the form as a plausible-looking
 * wrong answer.
 */
export function parseJobImport(input: string): JobImportResult {
  const source = extractJson(input);
  if (!source) return { ok: false, error: "Paste the JSON first." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return {
      ok: false,
      error: "That is not valid JSON — check for stray text or a missing brace.",
    };
  }

  // Some models wrap the object in an array. One job per import either way.
  const candidate = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return { ok: false, error: "Expected a JSON object holding the job fields." };
  }

  const record = candidate as Record<string, unknown>;
  const values: Partial<JobFormValues> = {};
  const warnings: string[] = [];

  /** `null` from a converter means "present but unreadable" — warn and skip. */
  const take = <T,>(label: string, value: T | null | undefined): T | undefined => {
    if (value === null) {
      warnings.push(`${label}: could not read the value, left unchanged`);
      return undefined;
    }
    return value ?? undefined;
  };

  const set = <K extends keyof JobFormValues>(
    key: K,
    value: JobFormValues[K] | undefined,
  ) => {
    if (value !== undefined) values[key] = value;
  };

  set("title", asText(record.title));
  set("slug", asText(record.slug)?.toLowerCase());
  set("company_name", asText(record.company_name));
  set("company_logo_url", asText(record.company_logo_url));
  set("company_website", asText(record.company_website));
  set("company_description", asText(record.company_description));
  set("location", asText(record.location));

  set("job_type", take("Employment type", asEnum(JOB_TYPES, record.job_type)));

  // Categories are checked here rather than left to submit-time validation: the
  // form rejects an unknown one outright, and dropping it with a note is more
  // useful than a red field on a listing that is otherwise ready to publish.
  const categories = (asCsv(record.categories)?.split(", ") ?? []).map((item) =>
    item.toLowerCase(),
  );
  const known = (JOB_CATEGORIES as readonly string[]).filter((option) =>
    categories.includes(option),
  );
  const rejected = categories.filter((item) => !known.includes(item));

  if (rejected.length) {
    warnings.push(
      `Dropped unsupported categor${rejected.length === 1 ? "y" : "ies"}: ${rejected.join(", ")}`,
    );
  }
  if (known.length > 4) {
    warnings.push("Kept the first 4 categories — the form allows no more");
  }
  set("categories", known.slice(0, 4).join(", ") || undefined);
  set(
    "experience_level",
    take("Experience level", asEnum(EXPERIENCE_LEVELS, record.experience_level)),
  );
  set("job_level", take("Job level", asEnum(JOB_LEVELS, record.job_level)));
  set("status", take("Status", asEnum(JOB_STATUSES, record.status)));

  set(
    "min_experience_years",
    take("Minimum experience", asNumber(record.min_experience_years)),
  );
  set("salary_min", take("Salary minimum", asNumber(record.salary_min)));
  set("salary_max", take("Salary maximum", asNumber(record.salary_max)));
  set("capacity", take("Capacity", asNumber(record.capacity)));
  set("applicants_count", take("Applicants", asNumber(record.applicants_count)));
  set("salary_currency", asText(record.salary_currency)?.toUpperCase());

  set("description", asText(record.description));
  set("responsibilities", asLines(record.responsibilities));
  set("requirements", asLines(record.requirements));
  set("nice_to_haves", asLines(record.nice_to_haves));
  set("benefits", asLines(record.benefits));
  set("skills", asCsv(record.skills));

  set("application_url", asText(record.application_url));
  set("application_email", asText(record.application_email));

  set("posted_at", take("Posted on", asDateInput(record.posted_at)));
  set("valid_through", take("Apply before", asDateInput(record.valid_through)));

  if (typeof record.is_featured === "boolean") {
    set("is_featured", record.is_featured);
  }

  if (Object.keys(values).length === 0) {
    return {
      ok: false,
      error: "No recognisable job fields in that JSON — nothing was filled in.",
    };
  }

  const unknownKeys = Object.keys(record).filter(
    (key) => !(KNOWN_KEYS as readonly string[]).includes(key),
  );
  if (unknownKeys.length) {
    warnings.push(`Ignored unknown field(s): ${unknownKeys.join(", ")}`);
  }

  const words = countWords(values);
  if (words < MIN_DETAIL_WORDS) {
    warnings.push(
      `Job details total ${words} words, under the ${MIN_DETAIL_WORDS}-word target`,
    );
  }

  return { ok: true, values, warnings };
}
