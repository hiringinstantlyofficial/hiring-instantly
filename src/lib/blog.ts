import { article as changingCareers } from "@/content/blog/changing-careers-without-starting-over";
import { article as ctcVsInHand } from "@/content/blog/ctc-vs-in-hand-salary";
import { article as firstJob } from "@/content/blog/first-job-without-experience";
import { article as remoteJobs } from "@/content/blog/genuine-remote-jobs-from-india";
import { article as interviewPrep } from "@/content/blog/interview-preparation-that-works";
import { article as negotiateSalary } from "@/content/blog/negotiate-salary-in-india";
import { article as noticePeriod } from "@/content/blog/notice-period-and-relieving-letter";
import { article as resumeGuide } from "@/content/blog/resume-that-gets-shortlisted";
import { article as fakeJobPosting } from "@/content/blog/spot-a-fake-job-posting";
import type { Article, ArticleCategory, ArticleSummary } from "@/types/blog";

/**
 * Every published article, in editorial order.
 *
 * New articles are added here — the import is what publishes them, so there is
 * no directory scan to keep in step and an unreferenced file simply is not live.
 * Order within the array breaks ties between articles sharing a publish date.
 */
const REGISTRY: Article[] = [
  resumeGuide,
  ctcVsInHand,
  fakeJobPosting,
  interviewPrep,
  negotiateSalary,
  firstJob,
  noticePeriod,
  remoteJobs,
  changingCareers,
];

/**
 * Newest first. `Array.prototype.sort` is stable, so same-day articles keep
 * their REGISTRY order rather than shuffling between builds — which matters
 * because a launch publishes several on one date.
 */
const articles: Article[] = [...REGISTRY].sort(
  (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
);

const bySlug = new Map(articles.map((article) => [article.slug, article]));

/** Drops `body` so callers that only need metadata cannot accidentally render it. */
function toSummary(article: Article): ArticleSummary {
  const { body, ...summary } = article;
  void body; // discarded deliberately — a summary must not carry renderable JSX
  return summary;
}

export function getAllArticles(): Article[] {
  return articles;
}

export function getArticleSummaries(): ArticleSummary[] {
  return articles.map(toSummary);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return bySlug.get(slug);
}

export function getArticleSlugs(): string[] {
  return articles.map((article) => article.slug);
}

/** Newest first within a category — used for the index page groupings. */
export function getArticlesByCategory(
  category: ArticleCategory,
): ArticleSummary[] {
  return articles.filter((a) => a.category === category).map(toSummary);
}

/** Categories that actually have an article, in the order they first appear. */
export function getUsedCategories(): ArticleCategory[] {
  return [...new Set(articles.map((article) => article.category))];
}

/**
 * Hand-picked related reads first, then same-category articles, then the newest
 * of whatever is left — so the foot of an article is never empty and never
 * repeats the article you are already on.
 */
export function getRelatedArticles(
  article: Article,
  limit = 3,
): ArticleSummary[] {
  const picked: Article[] = [];
  const seen = new Set([article.slug]);

  const take = (candidate: Article | undefined) => {
    if (!candidate || seen.has(candidate.slug) || picked.length >= limit) return;
    seen.add(candidate.slug);
    picked.push(candidate);
  };

  for (const slug of article.related ?? []) take(bySlug.get(slug));
  for (const candidate of articles) {
    if (candidate.category === article.category) take(candidate);
  }
  for (const candidate of articles) take(candidate);

  return picked.map(toSummary);
}
