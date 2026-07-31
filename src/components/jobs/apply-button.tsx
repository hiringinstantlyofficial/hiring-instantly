import { ArrowUpRight, Mail } from "lucide-react";

import { ButtonAnchor } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { absoluteUrl } from "@/lib/site";
import type { Job } from "@/types/job";

/**
 * Applications happen off-site: either the employer's ATS link or a mailto with
 * the subject prefilled. `application_url` wins when both are present.
 */
export function ApplyButton({
  job,
  size = "lg",
  fullWidth = true,
}: {
  job: Job;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}) {
  if (job.application_url) {
    return (
      <ButtonAnchor
        href={job.application_url}
        target="_blank"
        // nofollow: outbound ATS links shouldn't leak PageRank or get crawled.
        rel="noopener noreferrer nofollow"
        size={size}
        fullWidth={fullWidth}
      >
        Apply Now
        <ArrowUpRight className="size-5" aria-hidden />
        <span className="sr-only">(opens in a new tab)</span>
      </ButtonAnchor>
    );
  }

  if (job.application_email) {
    const subject = encodeURIComponent(
      `Application: ${job.title} (${job.company_name})`,
    );
    const body = encodeURIComponent(
      `Hello ${job.company_name} team,\n\nI'd like to apply for the ${job.title} role listed on ${siteConfig.name}.\n\nRole: ${absoluteUrl(`/jobs/${job.slug}`)}\n\nMy resume is attached.\n\nThank you,\n`,
    );

    return (
      <ButtonAnchor
        href={`mailto:${job.application_email}?subject=${subject}&body=${body}`}
        size={size}
        fullWidth={fullWidth}
      >
        <Mail className="size-5" aria-hidden />
        Apply by Email
      </ButtonAnchor>
    );
  }

  return (
    <p className="border border-line bg-surface-muted px-4 py-3 text-sm text-slate-600">
      Applications for this role are currently closed.
    </p>
  );
}
