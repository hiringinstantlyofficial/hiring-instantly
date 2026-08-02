import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ArticleForm } from "@/components/admin/article-form";

export const metadata: Metadata = { title: "New article" };

export default function NewArticlePage() {
  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to blog
      </Link>

      <header className="mt-4">
        <h1 className="text-h2">Write an article</h1>
        <p className="mt-1 text-sm text-slate-600">
          Saves as a draft unless you set the status to published. Give it a
          future publish date to queue it.
        </p>
      </header>

      <div className="mt-8 max-w-4xl">
        <ArticleForm />
      </div>
    </div>
  );
}
