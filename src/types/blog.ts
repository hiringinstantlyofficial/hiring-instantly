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

export const ARTICLE_STATUSES = ["draft", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draft",
  published: "Published",
};

/**
 * A row of `public.articles`, exactly as it comes back from Supabase.
 *
 * Articles used to be typed modules compiled into the bundle. They live in the
 * database now so they can be written and corrected from the admin panel
 * without a deploy; the body is markdown, rendered through react-markdown.
 *
 * Publication is two conditions, not one: `status` must be `published` **and**
 * `published_at` must have passed. A future date is a scheduled post — invisible
 * until its moment, then live without anyone touching it. Both conditions are
 * enforced in RLS as well as in the queries below.
 *
 * A type alias rather than an interface, for the same reason as `Job`: only
 * aliases get TypeScript's implicit index signature, and supabase-js resolves
 * table rows to `never` without one.
 */
export type Article = {
  id: string;
  slug: string;
  title: string;

  /** Meta description and OG description. Kept under ~155 characters. */
  description: string;
  /** Longer summary shown on the index card; may restate the description. */
  excerpt: string;

  category: ArticleCategory;
  body_markdown: string;

  /**
   * The byline. Career advice is "Your Money or Your Life" territory, where a
   * named author counts for considerably more than an organisation — so this is
   * not null, and the column carries a default rather than allowing a blank.
   */
  author_name: string;
  /**
   * Two or three sentences of credentials, shown under the article. Nullable:
   * the "About the author" block is dropped when there is nothing to say.
   */
  author_bio: string | null;

  /** Displayed as "N min read". Estimated from the body on save. */
  reading_minutes: number;
  /** Surfaced on the article page and fed to `keywords` in the metadata. */
  tags: string[];
  /**
   * Slugs of hand-picked follow-on reads. Short, missing or unpublished entries
   * are topped up with same-category articles by `getRelatedArticles`.
   */
  related: string[];

  status: ArticleStatus;
  published_at: string;
  /**
   * The visible "Updated on" stamp, set by hand only when an article has been
   * materially revised — unlike `updated_at`, which moves on every save.
   */
  revised_at: string | null;

  created_at: string;
  updated_at: string;
};

/** Everything except the body — enough for cards, lists and metadata. */
export type ArticleSummary = Omit<Article, "body_markdown">;

/** Fields the admin form writes. Server-managed columns are omitted. */
export type ArticleInput = Omit<Article, "id" | "created_at" | "updated_at">;

/**
 * Average adult reading speed for non-fiction, rounded down to a number that
 * survives being wrong by a paragraph or two.
 */
const WORDS_PER_MINUTE = 220;

/** Minutes to read a markdown body, floored at 1. */
export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
