import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { ArticleCategoryBadge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import type { ArticleSummary } from "@/types/blog";

/**
 * Index card for one article. `featured` widens it into the lead slot at the top
 * of /blog; the border-and-square-corner treatment matches JobCard so the two
 * card types sit together without a second visual language.
 */
export function ArticleCard({
  article,
  featured = false,
  className,
}: {
  article: ArticleSummary;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col border border-line bg-white p-6 transition-colors hover:border-primary",
        featured && "sm:p-8",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <ArticleCategoryBadge category={article.category} />
        <span className="flex items-center gap-1.5 text-sm text-slate-400">
          <Clock className="size-4" aria-hidden />
          {article.reading_minutes} min read
        </span>
      </div>

      <h3
        className={cn(
          "mt-4 font-semibold text-navy-700",
          featured ? "text-h3 sm:text-h2" : "text-h4",
        )}
      >
        <Link href={`/blog/${article.slug}`} className="hover:text-primary">
          {/* The whole card is the click target; the anchor keeps the accessible
              name on the heading where a screen reader expects to find it. */}
          <span className="absolute inset-0" aria-hidden />
          {article.title}
        </Link>
      </h3>

      <p
        className={cn(
          "mt-3 flex-1 leading-relaxed text-slate-600",
          featured ? "text-base sm:text-lg" : "text-base",
        )}
      >
        {featured ? article.excerpt : article.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
        <time
          dateTime={article.published_at}
          className="text-sm text-slate-400"
        >
          {formatDate(article.published_at)}
        </time>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          Read article
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </article>
  );
}
