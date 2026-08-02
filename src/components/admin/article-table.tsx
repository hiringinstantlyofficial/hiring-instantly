"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Pencil, Search, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  useAdminArticles,
  useDeleteArticle,
  useUpdateArticleStatus,
  type AdminArticleFilters,
} from "@/hooks/use-admin-articles";
import { formatDate } from "@/lib/utils";
import {
  ARTICLE_CATEGORY_LABELS,
  ARTICLE_STATUSES,
  ARTICLE_STATUS_LABELS,
  type ArticleStatus,
  type ArticleSummary,
} from "@/types/blog";

const selectClass =
  "border border-line bg-white px-3 py-2 text-sm text-navy-700 focus:border-primary focus:outline-none";

/** Published, but dated ahead of now — queued rather than live. */
function isScheduled(article: ArticleSummary): boolean {
  return (
    article.status === "published" &&
    new Date(article.published_at).getTime() > Date.now()
  );
}

export function ArticleTable({ limit }: { limit?: number }) {
  const [filters, setFilters] = useState<AdminArticleFilters>({
    search: "",
    status: "all",
    sort: "newest",
  });
  const [pendingDelete, setPendingDelete] = useState<ArticleSummary | null>(null);

  const { data, isPending, isError, error } = useAdminArticles(filters);
  const deleteArticle = useDeleteArticle();
  const updateStatus = useUpdateArticleStatus();

  const rows = useMemo(
    () => (limit ? (data ?? []).slice(0, limit) : (data ?? [])),
    [data, limit],
  );

  return (
    <div className="border border-line bg-white">
      {limit ? null : (
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <label htmlFor="admin-article-search" className="sr-only">
              Search articles
            </label>
            <input
              id="admin-article-search"
              type="search"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder="Search title, description or slug"
              className="w-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-article-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="admin-article-status"
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as AdminArticleFilters["status"],
                }))
              }
              className={selectClass}
            >
              <option value="all">All statuses</option>
              {ARTICLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ARTICLE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="admin-article-sort" className="sr-only">
              Sort
            </label>
            <select
              id="admin-article-sort"
              value={filters.sort}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sort: event.target.value as AdminArticleFilters["sort"],
                }))
              }
              className={selectClass}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>
      )}

      {isError ? (
        <p className="p-6 text-sm text-accent-red" role="alert">
          Couldn&apos;t load articles: {error.message}
        </p>
      ) : null}

      {isPending ? (
        <div className="space-y-3 p-4" aria-busy="true">
          {Array.from({ length: limit ?? 6 }, (_, index) => (
            <div key={index} className="skeleton h-14 w-full" />
          ))}
        </div>
      ) : null}

      {!isPending && !isError && rows.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-base text-slate-600">
            No articles match those filters.
          </p>
          <Link
            href="/admin/blog/new"
            className="mt-4 inline-block bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Write your first article
          </Link>
        </div>
      ) : null}

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <caption className="sr-only">Blog articles</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-slate-400">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Article
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Publish date
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Length
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((article) => {
                const scheduled = isScheduled(article);

                return (
                  <tr
                    key={article.id}
                    className="border-b border-line-soft last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy-700">
                          {article.title}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          /blog/{article.slug}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {ARTICLE_CATEGORY_LABELS[article.category]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        {scheduled ? (
                          <CalendarClock
                            className="size-4 text-primary"
                            aria-hidden
                          />
                        ) : null}
                        {formatDate(article.published_at)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {article.reading_minutes} min
                    </td>
                    <td className="px-4 py-3">
                      <label className="sr-only" htmlFor={`status-${article.id}`}>
                        Status for {article.title}
                      </label>
                      <select
                        id={`status-${article.id}`}
                        value={article.status}
                        disabled={updateStatus.isPending}
                        onChange={(event) =>
                          updateStatus.mutate({
                            article,
                            status: event.target.value as ArticleStatus,
                          })
                        }
                        className="border border-line bg-white px-2 py-1 text-xs text-navy-700 focus:border-primary focus:outline-none"
                      >
                        {ARTICLE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {ARTICLE_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                      {scheduled ? (
                        <p className="mt-1 text-xs text-primary">Scheduled</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {article.status === "published" && !scheduled ? (
                          <Link
                            href={`/blog/${article.slug}`}
                            target="_blank"
                            aria-label={`View ${article.title} on the public site`}
                            className="p-2 text-slate-400 hover:text-primary"
                          >
                            <ExternalLink className="size-4" aria-hidden />
                          </Link>
                        ) : null}
                        <Link
                          href={`/admin/blog/${article.id}/edit`}
                          aria-label={`Edit ${article.title}`}
                          className="p-2 text-slate-400 hover:text-primary"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(article)}
                          aria-label={`Delete ${article.title}`}
                          className="p-2 text-slate-400 hover:text-accent-red"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {rows.length ? (
        <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-xs text-slate-400">
          <span>
            Showing {rows.length}
            {limit && (data?.length ?? 0) > limit ? ` of ${data?.length}` : ""}{" "}
            {rows.length === 1 ? "article" : "articles"}
          </span>
          {limit ? (
            <Link
              href="/admin/blog"
              className="font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this article?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed, along with its public page at /blog/${pendingDelete.slug}. Anything linking to it will 404. This cannot be undone.`
            : ""
        }
        pending={deleteArticle.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteArticle.mutate(
            { id: pendingDelete.id, slug: pendingDelete.slug },
            { onSettled: () => setPendingDelete(null) },
          );
        }}
      />
    </div>
  );
}
