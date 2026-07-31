import type { Metadata } from "next";

import { ArticleCard } from "@/components/blog/article-card";
import { PageHeader } from "@/components/layout/page-header";
import { BlogJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { getArticleSummaries, getUsedCategories } from "@/lib/blog";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { ARTICLE_CATEGORY_LABELS } from "@/types/blog";

const TITLE = "Career Advice";
const DESCRIPTION =
  "Practical guides to resumes, interviews, salary and careers in India — written for people actually job hunting, not for search engines.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    url: absoluteUrl("/blog"),
  },
};

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Career Advice", href: "/blog" },
];

export default function BlogIndexPage() {
  const articles = getArticleSummaries();
  const [lead, ...rest] = articles;
  const categories = getUsedCategories();

  return (
    <>
      <PageHeader
        title="Career advice worth the time it takes to read"
        subtitle="Guides to the parts of an Indian job search that nobody explains properly — what a CTC break-up actually means, how notice periods work, and why your resume is being rejected before anyone reads it."
        breadcrumb={[{ name: "Career Advice", href: "/blog" }]}
      />

      <div className="container-page py-12 lg:py-16">
        {lead ? (
          <>
            {/*
              Topics are labels, not links. Six categories over nine articles
              would mean per-topic pages carrying one or two entries each —
              exactly the thin, duplicated content this section exists to avoid.
              The badge on each card already carries the same signal.
            */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-400">
              <span className="font-semibold uppercase tracking-wide text-navy-700">
                {articles.length} guides
              </span>
              <span aria-hidden>•</span>
              <span>
                {categories
                  .map((category) => ARTICLE_CATEGORY_LABELS[category])
                  .join(" · ")}
              </span>
            </div>

            <div className="mt-8">
              <ArticleCard article={lead} featured />
            </div>

            {rest.length ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-base text-slate-600">
            No articles published yet. Check back shortly.
          </p>
        )}

        <section className="mt-16 border border-line bg-surface-muted px-6 py-12 text-center">
          <h2 className="text-h2">Now go and use it</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
            Advice only pays once it is applied. Every listing here is reviewed by
            a person before it is published, and applying is always free.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/jobs" size="lg">
              Browse jobs
            </ButtonLink>
            <ButtonLink
              href="/jobs?experienceLevel=fresher"
              variant="outline"
              size="lg"
            >
              Fresher jobs
            </ButtonLink>
          </div>
        </section>
      </div>

      <BlogJsonLd articles={articles} />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </>
  );
}
