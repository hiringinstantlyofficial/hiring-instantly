import type { MetadataRoute } from "next";

import { getArticleSummaries } from "@/lib/blog";
import { getAllActiveJobSlugs } from "@/lib/jobs";
import { absoluteUrl } from "@/lib/site";

/** Regenerated on the same cadence as the listing pages. */
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/jobs"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/companies"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: absoluteUrl("/privacy-policy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms-and-conditions"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Articles are compiled in, so this needs no database round trip and cannot
  // fail — unlike the job listings below it.
  const articleRoutes: MetadataRoute.Sitemap = getArticleSummaries().map(
    (article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  const jobs = await getAllActiveJobSlugs();

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: absoluteUrl(`/jobs/${job.slug}`),
    lastModified: new Date(job.updated_at),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes, ...jobRoutes];
}
