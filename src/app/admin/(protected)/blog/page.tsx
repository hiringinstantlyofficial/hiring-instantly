import type { Metadata } from "next";
import Link from "next/link";

import { ArticleTable } from "@/components/admin/article-table";

export const metadata: Metadata = { title: "Blog" };

export default function AdminBlogPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Blog</h1>
          <p className="mt-1 text-sm text-slate-600">
            Write, edit and schedule career-advice articles. A published article
            dated in the future stays hidden until that date.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Write an article
        </Link>
      </header>

      <div className="mt-8">
        <ArticleTable />
      </div>
    </div>
  );
}
