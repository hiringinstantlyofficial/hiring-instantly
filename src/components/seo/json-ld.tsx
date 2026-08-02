import { absoluteUrl, siteConfig } from "@/lib/site";
import { toPlainText } from "@/lib/utils";
import { ARTICLE_CATEGORY_LABELS, type ArticleSummary } from "@/types/blog";
import type { Job, JobType } from "@/types/job";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Serialising with JSON.stringify escapes the payload; `<` is additionally
      // escaped so a stray tag in job copy cannot break out of the script.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        email: siteConfig.contactEmail,
        areaServed: { "@type": "Country", name: "India" },
        // `sameAs` is omitted on purpose: it asserts that a profile is the same
        // entity as this organisation, so listing one that doesn't exist yet is
        // worse than listing none. Add the real profile URLs here once they do.
      }}
    />
  );
}

/** Enables the sitelinks search box in Google results. */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: absoluteUrl("/jobs?q={search_term_string}"),
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.href),
        })),
      }}
    />
  );
}

/**
 * schema.org/BlogPosting for a career article.
 *
 * `author` and `publisher` are both the organisation rather than a person: the
 * articles are written by the editorial team, and naming an individual who does
 * not have a real, verifiable byline is worse for E-E-A-T than naming none.
 */
export function BlogPostingJsonLd({ article }: { article: ArticleSummary }) {
  const url = absoluteUrl(`/blog/${article.slug}`);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": url,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: article.title,
        description: article.description,
        articleSection: ARTICLE_CATEGORY_LABELS[article.category],
        keywords: article.tags.join(", "),
        datePublished: article.published_at,
        dateModified: article.revised_at ?? article.published_at,
        inLanguage: "en-IN",
        image: absoluteUrl(`/blog/${article.slug}/opengraph-image`),
        author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      }}
    />
  );
}

/** The /blog index, as a Blog carrying its posts in order. */
export function BlogJsonLd({ articles }: { articles: ArticleSummary[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": absoluteUrl("/blog"),
        url: absoluteUrl("/blog"),
        name: `${siteConfig.name} Career Advice`,
        description:
          "Practical guides on resumes, interviews, salary and careers for the Indian job market.",
        inLanguage: "en-IN",
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        blogPost: articles.map((article) => ({
          "@type": "BlogPosting",
          "@id": absoluteUrl(`/blog/${article.slug}`),
          url: absoluteUrl(`/blog/${article.slug}`),
          headline: article.title,
          description: article.description,
          datePublished: article.published_at,
          dateModified: article.revised_at ?? article.published_at,
        })),
      }}
    />
  );
}

const EMPLOYMENT_TYPES: Record<JobType, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  internship: "INTERN",
  contract: "CONTRACTOR",
  remote: "FULL_TIME",
};

/** "Bengaluru, Karnataka, India" -> structured PostalAddress. */
function toPostalAddress(location: string) {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  // Drop a trailing "India" so it isn't repeated as the locality or region.
  const hasCountrySuffix = /^(india|in)$/i.test(parts.at(-1) ?? "");
  const localityParts = hasCountrySuffix ? parts.slice(0, -1) : parts;

  return {
    "@type": "PostalAddress",
    addressLocality: localityParts[0] ?? location,
    ...(localityParts[1] ? { addressRegion: localityParts[1] } : {}),
    addressCountry: "IN",
  };
}

/**
 * schema.org/JobPosting — the payload Google Jobs reads. Required-by-Google
 * fields (title, description, datePosted, hiringOrganization, jobLocation) are
 * always emitted; optional ones only when we actually have the data, since
 * empty values trigger Search Console warnings.
 */
export function JobPostingJsonLd({ job }: { job: Job }) {
  const descriptionHtml = [
    `<p>${toPlainText(job.description)}</p>`,
    job.responsibilities.length
      ? `<p><strong>Responsibilities</strong></p><ul>${job.responsibilities
          .map((item) => `<li>${toPlainText(item)}</li>`)
          .join("")}</ul>`
      : "",
    job.requirements.length
      ? `<p><strong>Requirements</strong></p><ul>${job.requirements
          .map((item) => `<li>${toPlainText(item)}</li>`)
          .join("")}</ul>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const isRemote = job.job_type === "remote";

  const baseSalary =
    job.salary_min !== null || job.salary_max !== null
      ? {
          "@type": "MonetaryAmount",
          currency: job.salary_currency,
          value: {
            "@type": "QuantitativeValue",
            ...(job.salary_min !== null ? { minValue: job.salary_min } : {}),
            ...(job.salary_max !== null ? { maxValue: job.salary_max } : {}),
            unitText: "YEAR",
          },
        }
      : undefined;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "@id": absoluteUrl(`/jobs/${job.slug}`),
        url: absoluteUrl(`/jobs/${job.slug}`),
        title: job.title,
        description: descriptionHtml,
        datePosted: job.posted_at,
        ...(job.valid_through ? { validThrough: job.valid_through } : {}),
        employmentType: EMPLOYMENT_TYPES[job.job_type],
        hiringOrganization: {
          "@type": "Organization",
          name: job.company_name,
          ...(job.company_website ? { sameAs: job.company_website } : {}),
          ...(job.company_logo_url ? { logo: job.company_logo_url } : {}),
        },
        jobLocation: {
          "@type": "Place",
          address: toPostalAddress(job.location),
        },
        ...(isRemote
          ? {
              jobLocationType: "TELECOMMUTE",
              applicantLocationRequirements: {
                "@type": "Country",
                name: "India",
              },
            }
          : {}),
        ...(baseSalary ? { baseSalary } : {}),
        ...(job.min_experience_years !== null
          ? {
              experienceRequirements: {
                "@type": "OccupationalExperienceRequirements",
                monthsOfExperience: job.min_experience_years * 12,
              },
            }
          : {}),
        ...(job.skills.length ? { skills: job.skills.join(", ") } : {}),
        directApply: Boolean(job.application_url ?? job.application_email),
        identifier: {
          "@type": "PropertyValue",
          name: siteConfig.name,
          value: job.id,
        },
      }}
    />
  );
}
