import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatSalaryRange,
  initialsOf,
  relativeTime,
  slugify,
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

describe("relativeTime", () => {
  const now = Date.UTC(2026, 6, 30, 12, 0, 0);

  it("reports sub-minute ages as 'just now'", () => {
    expect(relativeTime(new Date(now - 30_000).toISOString(), now)).toBe(
      "just now",
    );
  });

  it("picks the largest fitting unit", () => {
    expect(relativeTime(new Date(now - 5 * 60_000).toISOString(), now)).toBe(
      "5 minutes ago",
    );
    expect(relativeTime(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe(
      "3 hours ago",
    );
    expect(relativeTime(new Date(now - 2 * 86_400_000).toISOString(), now)).toBe(
      "2 days ago",
    );
    expect(
      relativeTime(new Date(now - 3 * 604_800_000).toISOString(), now),
    ).toBe("3 weeks ago");
  });

  it("returns an empty string for an unparseable date instead of throwing", () => {
    expect(relativeTime("not-a-date", now)).toBe("");
  });
});

describe("formatDate", () => {
  it("formats in UTC so server and client agree", () => {
    // Fixed timezone is the point: without it this flips a day either side of
    // midnight depending on where it runs.
    expect(formatDate("2026-07-12T23:30:00.000Z")).toBe("12 Jul 2026");
    expect(formatDate("2026-07-12T00:30:00.000Z")).toBe("12 Jul 2026");
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
