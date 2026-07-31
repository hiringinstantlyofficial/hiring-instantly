export const ARTICLE_CATEGORIES = [
  "resume",
  "interviews",
  "salary",
  "job-search",
  "career-growth",
  "workplace",
] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  resume: "Resume",
  interviews: "Interviews",
  salary: "Salary",
  "job-search": "Job Search",
  "career-growth": "Career Growth",
  workplace: "Workplace",
};

/**
 * A career-advice article.
 *
 * Articles are content, not data: they ship in the bundle as typed modules under
 * `src/content/blog/` rather than living in Supabase. That keeps every one of
 * them statically rendered and reviewable in the same diff as the code, and it
 * means the blog needs no migration, no admin CRUD screen and no request to the
 * database to render. The trade-off is that publishing requires a deploy —
 * acceptable for a page that changes weekly, unlike job listings.
 */
export interface Article {
  slug: string;
  title: string;
  /** Meta description and OG description. Kept under ~155 characters. */
  description: string;
  /** Longer summary shown on the index card; may restate the description. */
  excerpt: string;
  category: ArticleCategory;
  /** ISO date (YYYY-MM-DD). Drives ordering, `datePublished` and the sitemap. */
  publishedAt: string;
  /** ISO date, set only once an article has been materially revised. */
  updatedAt?: string;
  /** Displayed as "N min read"; estimated from the body at authoring time. */
  readingMinutes: number;
  /** Surfaced on the article page and fed to `keywords` in the metadata. */
  tags: string[];
  /**
   * Slugs of hand-picked follow-on reads. Short or missing lists are topped up
   * with same-category articles by `getRelatedArticles`.
   */
  related?: string[];
  body: React.ReactNode;
}

/** Everything except the rendered body — enough for cards, lists and metadata. */
export type ArticleSummary = Omit<Article, "body">;
