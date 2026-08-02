import { ImageResponse } from "next/og";

import { getArticleBySlug, getArticleSlugs } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { ARTICLE_CATEGORY_LABELS } from "@/types/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Career advice";

/** Prerendered alongside the article pages, so sharing never waits on a render. */
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** Social card for each article, drawn in the site's palette. */
export default async function ArticleOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const title = article?.title ?? "Career advice";
  const category = article
    ? ARTICLE_CATEGORY_LABELS[article.category]
    : "Career Advice";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F8F8FD",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              backgroundColor: "#4640DE",
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 700, color: "#25324B" }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "#4640DE",
              color: "white",
              padding: "8px 22px",
              borderRadius: 999,
              fontSize: 26,
              fontWeight: 600,
              alignSelf: "flex-start",
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: title.length > 52 ? 56 : 64,
              fontWeight: 700,
              color: "#25324B",
              lineHeight: 1.15,
              display: "flex",
            }}
          >
            {title.length > 92 ? `${title.slice(0, 92)}…` : title}
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#515B6F", display: "flex" }}>
          {article ? `${article.reading_minutes} min read` : "Career advice"} ·
          Jobs and career guides for India
        </div>
      </div>
    ),
    size,
  );
}
