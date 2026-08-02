import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";

import { ArticleBody } from "@/components/blog/article-body";
import { ArticleCard } from "@/components/blog/article-card";
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ArticleCategoryBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getArticleBySlug, getArticleSlugs, getRelatedArticles } from "@/lib/blog";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { formatDate, truncate } from "@/lib/utils";

/**
 * ISR, like the job pages: prerendered at build, refreshed without a redeploy.
 *
 * `dynamicParams` has to be true now that articles live in the database. It was
 * false while they were compiled in, because the build knew every slug that
 * could exist; a post published or scheduled after the build would 404 under
 * that rule until someone redeployed. An unknown slug still 404s properly —
 * getArticleBySlug returns null and the page calls notFound().
 */
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }

  const canonical = `/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: absoluteUrl(canonical),
      siteName: siteConfig.name,
      publishedTime: article.published_at,
      modifiedTime: article.revised_at ?? article.published_at,
      images: [
        {
          url: `${canonical}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const related = await getRelatedArticles(article);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Career Advice", href: "/blog" },
    { name: article.title, href: `/blog/${article.slug}` },
  ];

  return (
    <>
      <div className="hero-pattern border-b border-line-soft">
        <div className="container-page py-10 lg:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.href} className="flex items-center gap-1.5">
                    {isLast ? (
                      <span
                        aria-current="page"
                        className="font-semibold text-navy-700"
                      >
                        {truncate(crumb.name, 48)}
                      </span>
                    ) : (
                      <>
                        <Link href={crumb.href} className="hover:text-primary">
                          {crumb.name}
                        </Link>
                        <ChevronRight className="size-4" aria-hidden />
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mt-6 max-w-3xl">
            <ArticleCategoryBadge category={article.category} />
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              {article.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-400">
              <span>
                By the {siteConfig.name} team
              </span>
              <span aria-hidden>•</span>
              <time dateTime={article.published_at}>
                {formatDate(article.published_at)}
              </time>
              {article.revised_at ? (
                <>
                  <span aria-hidden>•</span>
                  <span>
                    Updated{" "}
                    <time dateTime={article.revised_at}>
                      {formatDate(article.revised_at)}
                    </time>
                  </span>
                </>
              ) : null}
              <span aria-hidden>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {article.reading_minutes} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-12 lg:py-16">
        {/*
          Grid rather than flex with a fixed-width aside. `w-full shrink-0` plus a
          `lg:w-[300px]` override degrades catastrophically if that one rule is
          ever missing — the aside claims 100% and refuses to shrink, collapsing
          the article to a one-word-per-line column and overflowing the page. A
          grid falls back to a single stacked column instead, and `minmax(0, 1fr)`
          stops wide content (the salary tables) from blowing the column out.
        */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <article className="prose-legal min-w-0 max-w-3xl">
            <ArticleBody markdown={article.body_markdown} />
          </article>

          <aside className="min-w-0">
            <div className="space-y-6 lg:sticky lg:top-[98px]">
              <div className="border border-line bg-surface-muted p-6">
                <h2 className="text-h4">Looking for a role?</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Every listing is reviewed by a person before it goes live, and
                  applying is always free.
                </p>
                <ButtonLink href="/jobs" className="mt-5" fullWidth>
                  Browse jobs
                </ButtonLink>
              </div>

              {article.tags.length ? (
                <div className="border border-line p-6">
                  <h2 className="text-h4">Topics</h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <li
                        key={tag}
                        className="bg-primary-surface px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="mt-16 border-t border-line pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-h2">Read next</h2>
              <Link
                href="/blog"
                className="text-sm font-semibold text-primary hover:underline"
              >
                All career advice
              </Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <BlogPostingJsonLd article={article} />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </>
  );
}
