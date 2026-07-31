import { describe, expect, it } from "vitest";

import {
  getAllArticles,
  getArticleBySlug,
  getArticleSlugs,
  getArticlesByCategory,
  getRelatedArticles,
  getUsedCategories,
} from "@/lib/blog";
import { slugify } from "@/lib/utils";
import { ARTICLE_CATEGORIES } from "@/types/blog";

const articles = getAllArticles();

/*
 * The registry is hand-authored, so the failure modes are typos: a `related`
 * slug that no longer resolves, a duplicated slug shadowing an article, a
 * description long enough for Google to truncate it. None of these throw at
 * build time and all of them are invisible until something is already indexed.
 */
describe("article registry", () => {
  it("publishes articles", () => {
    expect(articles.length).toBeGreaterThanOrEqual(5);
  });

  it("has unique, URL-safe slugs", () => {
    const slugs = getArticleSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const slug of slugs) {
      expect(slugify(slug), `"${slug}" is not already URL-safe`).toBe(slug);
    }
  });

  it("orders articles newest first", () => {
    const dates = articles.map((article) => Date.parse(article.publishedAt));
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("resolves every hand-picked related slug", () => {
    for (const article of articles) {
      for (const slug of article.related ?? []) {
        expect(
          getArticleBySlug(slug),
          `${article.slug} links to unknown article "${slug}"`,
        ).toBeDefined();
        expect(slug, `${article.slug} lists itself as related`).not.toBe(
          article.slug,
        );
      }
    }
  });

  it("carries metadata that will not be truncated in search results", () => {
    for (const article of articles) {
      expect(article.title.length, article.slug).toBeLessThanOrEqual(70);
      expect(article.description.length, article.slug).toBeGreaterThan(50);
      expect(article.description.length, article.slug).toBeLessThanOrEqual(165);
      expect(article.excerpt.length, article.slug).toBeGreaterThan(50);
      expect(article.readingMinutes, article.slug).toBeGreaterThan(0);
      expect(article.tags.length, article.slug).toBeGreaterThan(0);
      expect(ARTICLE_CATEGORIES).toContain(article.category);
    }
  });

  it("carries parseable dates, with revisions no earlier than publication", () => {
    for (const article of articles) {
      expect(article.publishedAt, article.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(article.publishedAt))).toBe(false);

      if (article.updatedAt) {
        expect(article.updatedAt, article.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Date.parse(article.updatedAt)).toBeGreaterThanOrEqual(
          Date.parse(article.publishedAt),
        );
      }
    }
  });
});

describe("getArticleBySlug", () => {
  it("finds a published article", () => {
    const slug = getArticleSlugs()[0]!;
    expect(getArticleBySlug(slug)?.slug).toBe(slug);
  });

  it("returns undefined for an unknown slug, so the route can 404", () => {
    expect(getArticleBySlug("no-such-article")).toBeUndefined();
    expect(getArticleBySlug("")).toBeUndefined();
  });
});

describe("getRelatedArticles", () => {
  it("always fills the requested number of slots", () => {
    for (const article of articles) {
      expect(getRelatedArticles(article), article.slug).toHaveLength(3);
    }
  });

  it("never repeats itself or duplicates a suggestion", () => {
    for (const article of articles) {
      const slugs = getRelatedArticles(article).map((related) => related.slug);
      expect(slugs).not.toContain(article.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("honours the hand-picked order first", () => {
    const article = articles.find((candidate) => candidate.related?.length)!;
    const slugs = getRelatedArticles(article).map((related) => related.slug);
    expect(slugs.slice(0, article.related!.length)).toEqual(article.related);
  });

  it("respects the limit", () => {
    expect(getRelatedArticles(articles[0]!, 1)).toHaveLength(1);
    expect(getRelatedArticles(articles[0]!, 0)).toHaveLength(0);
  });

  it("omits the body so a summary cannot be rendered as an article", () => {
    const [related] = getRelatedArticles(articles[0]!);
    expect(related).not.toHaveProperty("body");
  });
});

describe("category helpers", () => {
  it("lists only categories that have an article", () => {
    const used = getUsedCategories();
    expect(new Set(used).size).toBe(used.length);

    for (const category of used) {
      expect(getArticlesByCategory(category).length).toBeGreaterThan(0);
    }
  });

  it("partitions every article into exactly one used category", () => {
    const counted = getUsedCategories().reduce(
      (total, category) => total + getArticlesByCategory(category).length,
      0,
    );
    expect(counted).toBe(articles.length);
  });
});
