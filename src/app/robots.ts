import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The dashboard and API surface hold nothing a crawler should index.
        // Facet permutations are blocked by parameter rather than blanket
        // `/jobs?*`, so numbered pagination (`/jobs?page=2`) stays crawlable and
        // deep listings remain reachable.
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/jobs?*q=",
          "/jobs?*location=",
          "/jobs?*jobTypes=",
          "/jobs?*categories=",
          "/jobs?*jobLevels=",
          "/jobs?*experienceLevel=",
          "/jobs?*salaryBands=",
          "/jobs?*sort=",
          "/jobs?*view=",
        ],
      },
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
