import { describe, expect, it } from "vitest";

import { parseJobFilters } from "@/lib/job-filters";

describe("parseJobFilters", () => {
  it("defaults an empty query string to page 1, newest first", () => {
    expect(parseJobFilters({})).toEqual({
      q: undefined,
      location: undefined,
      jobTypes: undefined,
      categories: undefined,
      jobLevels: undefined,
      experienceLevel: undefined,
      salaryBands: undefined,
      page: 1,
      sort: "newest",
    });
  });

  it("reads and trims the free-text params", () => {
    const filters = parseJobFilters({ q: "  backend  ", location: " Pune " });
    expect(filters.q).toBe("backend");
    expect(filters.location).toBe("Pune");
  });

  it("treats a whitespace-only value as absent", () => {
    expect(parseJobFilters({ q: "   " }).q).toBeUndefined();
  });

  it("splits comma-separated lists", () => {
    expect(parseJobFilters({ jobTypes: "full-time,internship" }).jobTypes).toEqual(
      ["full-time", "internship"],
    );
  });

  it("accepts repeated params as an array", () => {
    expect(
      parseJobFilters({ jobTypes: ["full-time", "remote"] }).jobTypes,
    ).toEqual(["full-time", "remote"]);
  });

  // This is the security-relevant behaviour: values reach a database query, so
  // anything not on the allowlist has to be dropped rather than passed through.
  it("drops values that are not in the allowed set", () => {
    expect(
      parseJobFilters({ jobTypes: "full-time,'; drop table jobs;--" }).jobTypes,
    ).toEqual(["full-time"]);
    expect(parseJobFilters({ categories: "not-a-category" }).categories).toBeUndefined();
    expect(parseJobFilters({ jobLevels: "god-tier" }).jobLevels).toBeUndefined();
  });

  it("returns undefined rather than an empty array when nothing survives", () => {
    expect(parseJobFilters({ jobTypes: "bogus,alsobogus" }).jobTypes).toBeUndefined();
  });

  it("takes only the first experience level", () => {
    expect(
      parseJobFilters({ experienceLevel: "fresher,experienced" }).experienceLevel,
    ).toBe("fresher");
    expect(parseJobFilters({ experienceLevel: "senior" }).experienceLevel).toBeUndefined();
  });

  it("parses page numbers and rejects nonsense ones", () => {
    expect(parseJobFilters({ page: "3" }).page).toBe(3);
    expect(parseJobFilters({ page: "0" }).page).toBe(1);
    expect(parseJobFilters({ page: "-5" }).page).toBe(1);
    expect(parseJobFilters({ page: "abc" }).page).toBe(1);
    expect(parseJobFilters({ page: "2; drop table" }).page).toBe(2);
  });

  it("only honours known sort keys, falling back to newest", () => {
    expect(parseJobFilters({ sort: "newest" }).sort).toBe("newest");
    expect(parseJobFilters({ sort: "relevant" }).sort).toBe("relevant");
    expect(parseJobFilters({ sort: "salary-high" }).sort).toBe("salary-high");
    expect(parseJobFilters({ sort: "posted_at desc" }).sort).toBe("newest");
    expect(parseJobFilters({ sort: "" }).sort).toBe("newest");
  });

  // ?company= carries a slug that reaches a database filter, so its shape is
  // checked here — the boundary where URL input becomes typed data — rather
  // than trusted downstream.
  it("accepts a well-formed company slug and rejects anything else", () => {
    expect(parseJobFilters({ company: "acme-labs" }).company).toBe("acme-labs");
    expect(parseJobFilters({ company: "acme" }).company).toBe("acme");
    expect(parseJobFilters({ company: "Acme Labs" }).company).toBeUndefined();
    expect(parseJobFilters({ company: "acme,foo" }).company).toBeUndefined();
    expect(parseJobFilters({ company: "-acme-" }).company).toBeUndefined();
    expect(parseJobFilters({ company: "" }).company).toBeUndefined();
  });
});
