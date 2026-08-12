import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateTime,
  formatSalaryRange,
  initialsOf,
  isFutureDate,
  istDateInputToISO,
  slugify,
  toISTDateInput,
  toISTISOString,
  toPlainText,
  truncate,
} from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Senior Backend Engineer")).toBe("senior-backend-engineer");
  });

  it("drops punctuation rather than encoding it", () => {
    expect(slugify("Senior Backend Engineer, Bengaluru")).toBe(
      "senior-backend-engineer-bengaluru",
    );
    expect(slugify("C++ / Node.js Developer")).toBe("c-nodejs-developer");
  });

  it("collapses runs of separators", () => {
    expect(slugify("Data    Analyst")).toBe("data-analyst");
    expect(slugify("Data - - Analyst")).toBe("data-analyst");
  });

  it("never leaves a trailing hyphen", () => {
    expect(slugify("Product Manager ")).toBe("product-manager");
    expect(slugify("Product Manager!!!")).toBe("product-manager");
  });

  it("caps the length at 80 characters", () => {
    expect(slugify("a".repeat(200))).toHaveLength(80);
  });
});

describe("formatSalaryRange", () => {
  it("returns null when there is nothing to show", () => {
    expect(formatSalaryRange(null, null)).toBeNull();
  });

  it("formats INR ranges in lakhs and crores", () => {
    expect(formatSalaryRange(600000, 850000)).toBe("₹6 L - ₹8.5 L");
    expect(formatSalaryRange(10000000, 25000000)).toBe("₹1 Cr - ₹2.5 Cr");
  });

  it("formats sub-lakh amounts as plain rupees", () => {
    expect(formatSalaryRange(50000, 90000)).toBe("₹50,000 - ₹90,000");
  });

  it("handles an open-ended range", () => {
    expect(formatSalaryRange(600000, null)).toBe("From ₹6 L");
    expect(formatSalaryRange(null, 850000)).toBe("Up to ₹8.5 L");
  });

  it("falls back to Intl currency formatting for non-INR", () => {
    const formatted = formatSalaryRange(50000, 80000, "USD");
    expect(formatted).toContain("-");
    expect(formatted).toMatch(/\$|USD/);
  });
});

describe("truncate", () => {
  it("returns short text untouched", () => {
    expect(truncate("short", 20)).toBe("short");
  });

  it("cuts at the last word boundary", () => {
    expect(truncate("the quick brown fox jumps", 15)).toBe("the quick brown…");
  });

  it("hard-cuts a long single word instead of returning it whole", () => {
    // The old implementation used slice(0, lastIndexOf(" ", max)) and so hit
    // slice(0, -1) here, handing back all but the final character.
    const word = "a".repeat(100);
    const result = truncate(word, 20);
    expect(result).toBe(`${"a".repeat(20)}…`);
    expect(result.length).toBeLessThan(word.length);
  });

  it("never returns an empty string for non-empty input", () => {
    expect(truncate("supercalifragilistic", 5)).toBe("super…");
  });

  it("does not leave a dangling space before the ellipsis", () => {
    expect(truncate("hello world", 6)).toBe("hello…");
  });
});

describe("formatDate", () => {
  it("formats as DD-MM-YYYY", () => {
    expect(formatDate("2026-07-12T09:00:00.000Z")).toBe("12-07-2026");
  });

  it("zero-pads single-digit days and months", () => {
    expect(formatDate("2026-01-05T09:00:00.000Z")).toBe("05-01-2026");
  });

  it("reads the day on the IST clock, not UTC", () => {
    // 19:30Z is 01:00 IST the next morning — the whole point of the change.
    expect(formatDate("2026-07-12T19:30:00.000Z")).toBe("13-07-2026");
    // And 18:29Z is still 23:59 IST on the same day.
    expect(formatDate("2026-07-12T18:29:00.000Z")).toBe("12-07-2026");
  });

  it("is pinned to IST rather than the host timezone, so SSR and hydration agree", () => {
    expect(formatDate("2026-07-12T23:30:00.000Z")).toBe("13-07-2026");
    expect(formatDate("2026-07-12T00:30:00.000Z")).toBe("12-07-2026");
  });

  it("returns an empty string for an unparseable date instead of throwing", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("appends the IST time", () => {
    expect(formatDateTime("2026-07-12T09:00:00.000Z")).toBe("12-07-2026, 14:30");
  });
});

describe("toISTISOString", () => {
  it("rewrites the instant on the IST clock without moving it", () => {
    expect(toISTISOString("2026-07-12T09:00:00.000Z")).toBe(
      "2026-07-12T14:30:00+05:30",
    );
    expect(toISTISOString("2026-07-12T19:30:00.000Z")).toBe(
      "2026-07-13T01:00:00+05:30",
    );
  });

  it("stays the same moment in time", () => {
    const utc = "2026-07-12T19:30:00.000Z";
    expect(Date.parse(toISTISOString(utc))).toBe(Date.parse(utc));
  });
});

describe("toISTDateInput", () => {
  it("gives back the IST calendar day", () => {
    expect(toISTDateInput("2026-07-12T19:30:00.000Z")).toBe("2026-07-13");
    expect(toISTDateInput("2026-07-12T00:30:00.000Z")).toBe("2026-07-12");
  });

  it("returns an empty string for nothing", () => {
    expect(toISTDateInput(null)).toBe("");
    expect(toISTDateInput(undefined)).toBe("");
    expect(toISTDateInput("garbage")).toBe("");
  });
});

describe("istDateInputToISO", () => {
  it("reads a plain date as IST midnight, not UTC midnight", () => {
    expect(istDateInputToISO("2026-08-12")).toBe("2026-08-11T18:30:00.000Z");
  });

  it("round-trips with toISTDateInput", () => {
    const day = "2026-08-12";
    expect(toISTDateInput(istDateInputToISO(day)!)).toBe(day);
    expect(formatDate(istDateInputToISO(day)!)).toBe("12-08-2026");
  });

  it("passes an instant through untouched", () => {
    expect(istDateInputToISO("2026-08-12T09:00:00.000Z")).toBe(
      "2026-08-12T09:00:00.000Z",
    );
  });

  it("returns null for empty or unparseable input", () => {
    expect(istDateInputToISO("")).toBeNull();
    expect(istDateInputToISO("garbage")).toBeNull();
  });
});

describe("isFutureDate", () => {
  it("only reports timestamps ahead of now", () => {
    expect(isFutureDate(new Date(Date.now() + 86_400_000).toISOString())).toBe(
      true,
    );
    expect(isFutureDate(new Date(Date.now() - 86_400_000).toISOString())).toBe(
      false,
    );
    expect(isFutureDate(null)).toBe(false);
  });
});

describe("initialsOf", () => {
  it("takes the first letter of the first two words", () => {
    expect(initialsOf("Acme Corp")).toBe("AC");
    expect(initialsOf("Stripe")).toBe("S");
    expect(initialsOf("Tata Consultancy Services")).toBe("TC");
  });

  it("ignores extra whitespace", () => {
    expect(initialsOf("  Acme   Corp  ")).toBe("AC");
  });
});

describe("toPlainText", () => {
  it("strips markdown syntax and collapses whitespace", () => {
    expect(toPlainText("**Bold** and _italic_\n\nnext line")).toBe(
      "Bold and italic next line",
    );
    expect(toPlainText("# Heading\n- item")).toBe("Heading - item");
  });
});
