import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * "2 days ago" / "3 weeks ago" — matches the posted-date style in the design.
 *
 * Reads the clock, so the result is not stable between a server render and the
 * client hydration that follows it. Render it through <RelativeTime>, which
 * owns that mismatch, rather than calling it inline in a Server Component.
 */
export function relativeTime(input: string | Date, now: number = Date.now()): string {
  const then = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(then.getTime())) return "";

  const seconds = Math.round((now - then.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2629800],
    ["year", 31557600],
  ];

  let unit: Intl.RelativeTimeFormatUnit = "minute";
  let divisor = 60;

  for (const [candidateUnit, candidateDivisor] of units) {
    if (seconds >= candidateDivisor) {
      unit = candidateUnit;
      divisor = candidateDivisor;
    }
  }

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return formatter.format(-Math.floor(seconds / divisor), unit);
}

/** ISO date as "12 Jul 2026", stable between server and client. */
export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
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
