import { ImageResponse } from "next/og";

import { getJobBySlug } from "@/lib/jobs";
import { siteConfig } from "@/lib/site";
import { formatSalaryRange } from "@/lib/utils";
import { JOB_TYPE_LABELS } from "@/types/job";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Job opening";

/** Social card for each job, drawn in the site's palette. */
export default async function JobOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  const title = job?.title ?? "Job opening";
  const company = job?.company?.name ?? job?.company_name ?? siteConfig.name;
  const location = job?.location ?? "India";
  const jobType = job ? JOB_TYPE_LABELS[job.job_type] : "Full-Time";
  const salary = job
    ? formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency)
    : null;

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
            {title.length > 70 ? `${title.slice(0, 70)}…` : title}
          </div>
          <div style={{ fontSize: 34, color: "#515B6F", display: "flex" }}>
            {company} • {location}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(86,205,173,0.15)",
              color: "#3A9C82",
              padding: "10px 24px",
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {jobType}
          </div>
          {salary ? (
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
              {salary} / year
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
