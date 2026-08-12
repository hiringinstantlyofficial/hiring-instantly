import type { MetadataRoute } from "next";

import { getArticleSummaries } from "@/lib/blog";
import { getIndexableCompanySlugs } from "@/lib/companies";
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

  // Published articles only, and only those whose publish date has arrived —
  // getArticleSummaries applies both, so a scheduled post stays out of the
  // sitemap until it is actually readable.
  const articles = await getArticleSummaries();

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}`),
    lastModified: new Date(article.revised_at ?? article.published_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const jobs = await getAllActiveJobSlugs();

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: absoluteUrl(`/jobs/${job.slug}`),
    lastModified: new Date(job.updated_at),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Only companies with a live opening — getIndexableCompanySlugs applies
  // that, matching the `noindex` the profile page sets on an empty one. A
  // profile with no roles is thin content and does not belong in here.
  const companies = await getIndexableCompanySlugs();

  const companyRoutes: MetadataRoute.Sitemap = companies.map((company) => ({
    url: absoluteUrl(`/companies/${company.slug}`),
    lastModified: new Date(company.updated_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...jobRoutes,
    ...companyRoutes,
  ];
}
