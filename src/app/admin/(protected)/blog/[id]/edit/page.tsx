import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { ArticleForm } from "@/components/admin/article-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ARTICLE_CATEGORY_LABELS, type Article } from "@/types/blog";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Read with the admin's session so RLS returns drafts and scheduled posts too.
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("[admin] failed to load article:", error);
  if (!data) notFound();

  const article = data as Article;
  const isLive =
    article.status === "published" &&
    new Date(article.published_at).getTime() <= Date.now();

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to blog
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2">{article.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {ARTICLE_CATEGORY_LABELS[article.category]} ·{" "}
            {isLive ? "Published" : article.status === "published" ? "Scheduled for" : "Draft dated"}{" "}
            {formatDate(article.published_at)}
          </p>
        </div>
        {isLive ? (
          <Link
            href={`/blog/${article.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View live
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        ) : null}
      </header>

      <div className="mt-8 max-w-4xl">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
