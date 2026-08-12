import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*  Dates — everything the site shows is on an IST wall clock                  */
/* -------------------------------------------------------------------------- */

export const IST_TIME_ZONE = "Asia/Kolkata";

/**
 * India has been a fixed UTC+05:30 since 1945 and has no DST, so plain offset
 * arithmetic is exact here — no Intl round-trip, and the inverse (IST wall
 * clock -> instant) is exact too, which `Intl` alone cannot give us.
 */
const IST_OFFSET_MINUTES = 330;
const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60_000;

/** `yyyy-MM-dd` with no time part — a plain calendar date, not an instant. */
const PLAIN_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toDate(input: string | Date): Date | null {
  const date = typeof input === "string" ? new Date(input) : input;
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * The calendar/clock fields an instant shows on an IST wall clock.
 *
 * Shifting the instant and then reading the UTC getters is the standard trick:
 * the UTC fields of `t + 5h30m` are exactly the IST fields of `t`.
 */
function istFields(date: Date) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
    seconds: shifted.getUTCSeconds(),
  };
}

const pad = (value: number, width = 2) => String(value).padStart(width, "0");

/**
 * A timestamp as "12-08-2026" — DD-MM-YYYY on an IST clock.
 *
 * Supabase stores `timestamptz`, which comes back as a UTC ISO string. A job
 * posted at 01:00 IST is `…T19:30:00Z` the day before, so formatting in UTC
 * showed the wrong day to every Indian reader. The offset is applied here, once.
 *
 * Timezone-pinned rather than locale-pinned, so a server render and the client
 * hydration that follows it always agree.
 */
export function formatDate(input: string | Date): string {
  const date = toDate(input);
  if (!date) return "";
  const { year, month, day } = istFields(date);
  return `${pad(day)}-${pad(month)}-${year}`;
}

/** As `formatDate`, with the IST time appended: "12-08-2026, 14:30". */
export function formatDateTime(input: string | Date): string {
  const date = toDate(input);
  if (!date) return "";
  const { hours, minutes } = istFields(date);
  return `${formatDate(date)}, ${pad(hours)}:${pad(minutes)}`;
}

/**
 * A timestamp as `2026-08-12T14:30:00+05:30` — the same instant as the stored
 * UTC string, written on the IST clock.
 *
 * Used for `<time dateTime>` and JSON-LD, where the value has to stay a machine
 * readable ISO 8601 instant but should read as IST to anyone inspecting it.
 */
export function toISTISOString(input: string | Date): string {
  const date = toDate(input);
  if (!date) return "";
  const { year, month, day, hours, minutes, seconds } = istFields(date);
  return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}+05:30`;
}

/**
 * A timestamp -> the `yyyy-MM-dd` an `<input type="date">` expects, read on the
 * IST clock so the admin sees back the day they picked rather than the day
 * before.
 */
export function toISTDateInput(input: string | Date | null | undefined): string {
  if (!input) return "";
  const date = toDate(input);
  if (!date) return "";
  const { year, month, day } = istFields(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * The inverse: a `yyyy-MM-dd` from a date input -> the ISO instant of that day's
 * IST midnight (`2026-08-12` -> `2026-08-11T18:30:00.000Z`).
 *
 * This is what makes the round-trip through Supabase stable — and it is also
 * what makes scheduled publishing correct, since an article dated 12-08-2026
 * should go live at IST midnight, not 05:30 IST.
 *
 * Anything that already carries a time is passed through as a normal instant.
 */
export function istDateInputToISO(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  if (PLAIN_DATE.test(value)) {
    const midnightUtc = new Date(`${value}T00:00:00.000Z`).getTime();
    if (Number.isNaN(midnightUtc)) return null;
    return new Date(midnightUtc - IST_OFFSET_MS).toISOString();
  }

  const date = toDate(value);
  return date ? date.toISOString() : null;
}

/** True when the timestamp is still ahead of now — i.e. scheduled, not live. */
export function isFutureDate(input: string | Date | null | undefined): boolean {
  if (!input) return false;
  const date = toDate(input);
  return date ? date.getTime() > Date.now() : false;
}

const LAKH = 100000;
const CRORE = 10000000;

/** 850000 -> "₹8.5 L". Indian readers scan lakhs faster than raw digits. */
function compactInr(amount: number): string {
  if (amount >= CRORE) {
    return `₹${trimZero(amount / CRORE)} Cr`;
  }
  if (amount >= LAKH) {
    return `₹${trimZero(amount / LAKH)} L`;
  }
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

function trimZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

export function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency = "INR",
): string | null {
  if (min === null && max === null) return null;

  if (currency !== "INR") {
    const format = (value: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    if (min !== null && max !== null) return `${format(min)} - ${format(max)}`;
    return format((min ?? max)!);
  }

  if (min !== null && max !== null) {
    return `${compactInr(min)} - ${compactInr(max)}`;
  }
  if (min !== null) return `From ${compactInr(min)}`;
  return `Up to ${compactInr(max!)}`;
}

/** URL-safe slug from a job title, e.g. "Senior Backend Engineer, Bengaluru". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-$/, "");
}

/** Deterministic tint for a company logo fallback, so it never flickers. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/** Cuts at the last word boundary within `maxLength`, or mid-word if there isn't one. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // lastIndexOf returns -1 on a long single word (a URL, say), and slice(0, -1)
  // would then hand back nearly the whole string unchanged. Hard-cut instead.
  const boundary = text.lastIndexOf(" ", maxLength);
  const cut = boundary > 0 ? boundary : maxLength;
  return `${text.slice(0, cut).trimEnd()}…`;
}

/** Strips markdown-ish syntax so descriptions can feed meta tags cleanly. */
export function toPlainText(text: string): string {
  return text
    .replace(/[#*_`>[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
