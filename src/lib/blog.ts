import { cache } from "react";

import { captureError } from "@/lib/observability";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type {
  Article,
  ArticleCategory,
  ArticleSummary,
} from "@/types/blog";

/**
 * Cache tag shared by every read in this module. The admin mutations flush it
 * through revalidateArticlePaths(), so an edit is live immediately rather than
 * waiting out the route's revalidate window.
 */
export const ARTICLES_CACHE_TAG = "articles";

/** Every column except the body — enough for cards, lists and metadata. */
const SUMMARY_COLUMNS =
  "id, slug, title, description, excerpt, category, author_name, author_bio, reading_minutes, tags, related, status, published_at, revised_at, created_at, updated_at";

function reportError(context: string, error: { code?: string } | null): void {
  if (error?.code === "PGRST205" || error?.code === "42P01") {
    captureError(error, {
      scope: `blog.${context}`,
      severity: "warning",
      meta: {
        hint: "The 'articles' table is missing. Apply supabase/migrations in the Supabase SQL editor.",
      },
    });
    return;
  }
  captureError(error, { scope: `blog.${context}` });
}

/**
 * The publication gate, applied to every public read below as
 * `.eq("status", "published").lte("published_at", nowIso())`.
 *
 * Both halves matter: `status` is the editorial decision, `published_at` is the
 * schedule. A row dated in the future is a queued post — written, approved, and
 * deliberately not visible yet. RLS enforces the same pair, so a query that
 * forgot it would still not leak a draft; repeating it here means the failure
 * mode is an empty list rather than a policy violation.
 *
 * Read per call rather than hoisted to a module constant: these functions are
 * memoised per request, and a module-level timestamp would freeze the schedule
 * at the moment the server booted.
 */
function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Published articles, newest first.
 *
 * `cache` is React's per-request memo, so the index page and its JSON-LD block
 * share one round trip.
 */
export const getArticleSummaries = cache(async (): Promise<ArticleSummary[]> => {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("articles")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .lte("published_at", nowIso())
    .order("published_at", { ascending: false });

  if (error) {
    reportError("getArticleSummaries", error);
    return [];
  }

  return (data as ArticleSummary[] | null) ?? [];
});

export const getArticleBySlug = cache(
  async (slug: string): Promise<Article | null> => {
    const supabase = createSupabasePublicClient();

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", nowIso())
      .maybeSingle();

    if (error) {
      reportError(`getArticleBySlug(${slug})`, error);
      return null;
    }

    return (data as Article | null) ?? null;
  },
);

export async function getArticleSlugs(): Promise<string[]> {
  const articles = await getArticleSummaries();
  return articles.map((article) => article.slug);
}

/** Newest first within a category — used for the index page groupings. */
export async function getArticlesByCategory(
  category: ArticleCategory,
): Promise<ArticleSummary[]> {
  const articles = await getArticleSummaries();
  return articles.filter((article) => article.category === category);
}

/** Categories that actually have a published article, in publication order. */
export async function getUsedCategories(): Promise<ArticleCategory[]> {
  const articles = await getArticleSummaries();
  return [...new Set(articles.map((article) => article.category))];
}

/**
 * Hand-picked related reads first, then same-category articles, then the newest
 * of whatever is left — so the foot of an article is never empty and never
 * repeats the article you are already on.
 *
 * A `related` slug pointing at a draft or scheduled post simply does not match
 * anything in `published` and is skipped, which is why the column is not a
 * foreign key. Split from the fetch below so the ordering rules can be tested
 * without a database.
 */
export function pickRelated(
  published: ArticleSummary[],
  article: Pick<Article, "slug" | "category" | "related">,
  limit = 3,
): ArticleSummary[] {
  const articles = published;
  const bySlug = new Map(articles.map((entry) => [entry.slug, entry]));

  const picked: ArticleSummary[] = [];
  const seen = new Set([article.slug]);

  const take = (candidate: ArticleSummary | undefined) => {
    if (!candidate || seen.has(candidate.slug) || picked.length >= limit) return;
    seen.add(candidate.slug);
    picked.push(candidate);
  };

  for (const slug of article.related) take(bySlug.get(slug));
  for (const candidate of articles) {
    if (candidate.category === article.category) take(candidate);
  }
  for (const candidate of articles) take(candidate);

  return picked;
}

/** `pickRelated` over the published list. */
export async function getRelatedArticles(
  article: Pick<Article, "slug" | "category" | "related">,
  limit = 3,
): Promise<ArticleSummary[]> {
  return pickRelated(await getArticleSummaries(), article, limit);
}
