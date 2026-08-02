import { describe, expect, it } from "vitest";

import { pickRelated } from "@/lib/blog";
import { estimateReadingMinutes, type ArticleSummary } from "@/types/blog";

/**
 * Articles are database rows now, so the old registry invariants (unique slugs,
 * resolvable `related` entries) are enforced by the unique constraint and the
 * form schema instead of by a test. What is left here is the logic that is
 * genuinely ours: the ordering of the "Read next" rail and the reading-time
 * estimate.
 */

function article(
  slug: string,
  overrides: Partial<ArticleSummary> = {},
): ArticleSummary {
  return {
    id: slug,
    slug,
    title: slug,
    description: "",
    excerpt: "",
    category: "job-search",
    reading_minutes: 5,
    tags: [],
    related: [],
    status: "published",
    published_at: "2026-07-30T00:00:00.000Z",
    revised_at: null,
    created_at: "2026-07-30T00:00:00.000Z",
    updated_at: "2026-07-30T00:00:00.000Z",
    ...overrides,
  };
}

describe("pickRelated", () => {
  const published = [
    article("a", { category: "salary" }),
    article("b", { category: "salary" }),
    article("c", { category: "resume" }),
    article("d", { category: "interviews" }),
  ];

  it("puts hand-picked reads first, in the order given", () => {
    const current = article("a", { category: "salary", related: ["d", "c"] });

    expect(pickRelated(published, current).map((item) => item.slug)).toEqual([
      "d",
      "c",
      "b",
    ]);
  });

  it("never includes the article being read", () => {
    const current = article("a", { category: "salary", related: ["a"] });

    expect(pickRelated(published, current).map((item) => item.slug)).not.toContain(
      "a",
    );
  });

  it("skips a related slug that is not published", () => {
    const current = article("a", {
      category: "salary",
      related: ["scheduled-post", "c"],
    });

    expect(pickRelated(published, current).map((item) => item.slug)).toEqual([
      "c",
      "b",
      "d",
    ]);
  });

  it("tops up with same-category articles before anything else", () => {
    const current = article("a", { category: "salary" });

    expect(pickRelated(published, current)[0]?.slug).toBe("b");
  });

  it("respects the limit", () => {
    const current = article("a", { category: "salary" });

    expect(pickRelated(published, current, 2)).toHaveLength(2);
  });

  it("returns an empty rail rather than throwing when nothing else exists", () => {
    const only = article("a");

    expect(pickRelated([only], only)).toEqual([]);
  });

  it("does not repeat an article that is both hand-picked and same-category", () => {
    const current = article("a", { category: "salary", related: ["b"] });
    const slugs = pickRelated(published, current).map((item) => item.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("estimateReadingMinutes", () => {
  it("floors at one minute for anything non-empty", () => {
    expect(estimateReadingMinutes("a few words only")).toBe(1);
    expect(estimateReadingMinutes("")).toBe(1);
  });

  it("scales with length", () => {
    expect(estimateReadingMinutes("word ".repeat(2200))).toBe(10);
  });

  it("ignores markdown whitespace", () => {
    const spaced = "word\n\n\n  word\t\tword";
    expect(estimateReadingMinutes(spaced)).toBe(1);
  });
});
