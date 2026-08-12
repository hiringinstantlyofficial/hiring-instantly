import { ImageResponse } from "next/og";

import { getCompanyBySlug, getJobsByCompany } from "@/lib/companies";
import { siteConfig } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Company profile";

/**
 * Social card for a company profile, drawn in the site's palette.
 *
 * The uploaded cover is deliberately not composited in. Satori fetches remote
 * images at render time, and a 5 MB photograph on a cold cache would make this
 * route the slowest thing on the site — the card is generated from text alone,
 * exactly like the job card beside it.
 */
export default async function CompanyOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  const { total } = company
    ? await getJobsByCompany(company.id, 1)
    : { total: 0 };

  const name = company?.name ?? "Company";
  const tagline =
    company?.tagline ??
    company?.headquarters ??
    `Careers and open roles on ${siteConfig.name}`;

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

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#25324B",
              lineHeight: 1.15,
              display: "flex",
            }}
          >
            {name.length > 48 ? `${name.slice(0, 48)}…` : name}
          </div>
          <div style={{ fontSize: 32, color: "#515B6F", display: "flex" }}>
            {tagline.length > 90 ? `${tagline.slice(0, 90)}…` : tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "#4640DE",
              color: "white",
              padding: "10px 24px",
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {total} open {total === 1 ? "role" : "roles"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
