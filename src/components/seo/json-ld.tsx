import { absoluteUrl, editorialAuthor, siteConfig } from "@/lib/site";
import { toISTISOString, toPlainText, truncate } from "@/lib/utils";
import { ARTICLE_CATEGORY_LABELS, type ArticleSummary } from "@/types/blog";
import type { Company } from "@/types/company";
import type { JobType, JobWithCompany } from "@/types/job";

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
 * `author` is a Person, not the organisation. Career advice is squarely inside
 * Google's "Your Money or Your Life" territory — guidance that affects
 * someone's livelihood — where a named, verifiable writer is weighted heavily.
 * The `url` on the Person is the point of "verifiable": it resolves to the
 * editorial section of the About page, so the byline is an identity the site
 * stands behind rather than a name in a field. `publisher` stays the
 * organisation, which is what it is.
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
        datePublished: toISTISOString(article.published_at),
        dateModified: toISTISOString(article.revised_at ?? article.published_at),
        inLanguage: "en-IN",
        image: absoluteUrl(`/blog/${article.slug}/opengraph-image`),
        author: {
          "@type": "Person",
          name: article.author_name,
          url: absoluteUrl(editorialAuthor.path),
          ...(article.author_bio ? { description: article.author_bio } : {}),
          worksFor: { "@type": "Organization", name: siteConfig.name },
        },
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
          datePublished: toISTISOString(article.published_at),
          dateModified: toISTISOString(
            article.revised_at ?? article.published_at,
          ),
        })),
      }}
    />
  );
}

/**
 * schema.org/Organization for a company profile, with its open roles attached
 * as an ItemList.
 *
 * The `@id` is the profile URL and is the same identifier every JobPosting on
 * the site points its `hiringOrganization` at, which is what ties the listings
 * and the profile together as one entity rather than N unrelated employers
 * that happen to share a name. `sameAs` carries only URLs the admin actually
 * entered — asserting a profile that doesn't exist is worse than asserting
 * none, the same reasoning as the omitted `sameAs` on OrganizationJsonLd.
 */
export function CompanyJsonLd({
  company,
  jobs,
  jobCount,
}: {
  company: Company;
  jobs: JobWithCompany[];
  jobCount: number;
}) {
  const url = absoluteUrl(`/companies/${company.slug}`);
  const sameAs = [company.website, company.linkedin_url].filter(
    (link): link is string => Boolean(link),
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": url,
          url,
          name: company.name,
          ...(company.legal_name ? { legalName: company.legal_name } : {}),
          ...(company.description
            ? { description: truncate(toPlainText(company.description), 500) }
            : company.tagline
              ? { description: company.tagline }
              : {}),
          ...(company.logo_url ? { logo: company.logo_url } : {}),
          ...(company.cover_url ? { image: company.cover_url } : {}),
          ...(sameAs.length ? { sameAs } : {}),
          ...(company.industry ? { industry: company.industry } : {}),
          ...(company.founded_year
            ? { foundingDate: String(company.founded_year) }
            : {}),
          ...(company.headquarters
            ? {
                address: {
                  "@type": "PostalAddress",
                  addressLocality: company.headquarters,
                  addressCountry: "IN",
                },
              }
            : {}),
          ...(company.size_range
            ? {
                numberOfEmployees: {
                  "@type": "QuantitativeValue",
                  name: company.size_range,
                },
              }
            : {}),
        }}
      />

      {jobs.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Open roles at ${company.name}`,
            numberOfItems: jobCount,
            itemListElement: jobs.map((job, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/jobs/${job.slug}`),
              name: job.title,
            })),
          }}
        />
      ) : null}
    </>
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
export function JobPostingJsonLd({
  job,
  company,
}: {
  job: JobWithCompany;
  /** The full company row, when the page has already loaded it. */
  company?: Company | null;
}) {
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

  // Company identity comes from the company row now, so every listing an
  // employer owns asserts the same hiringOrganization instead of whatever was
  // typed into that one listing. `sameAs` prefers the website and falls back to
  // the profile page, which is a URL we control and can vouch for.
  const companyName = company?.name ?? job.company?.name ?? job.company_name;
  const companyWebsite = company?.website ?? job.company?.website ?? null;
  const companySlug = company?.slug ?? job.company?.slug ?? null;
  const companyLogo = company?.logo_url ?? job.company?.logo_url ?? null;

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
        datePosted: toISTISOString(job.posted_at),
        ...(job.valid_through
          ? { validThrough: toISTISOString(job.valid_through) }
          : {}),
        employmentType: EMPLOYMENT_TYPES[job.job_type],
        hiringOrganization: {
          "@type": "Organization",
          name: companyName,
          ...(companySlug
            ? { "@id": absoluteUrl(`/companies/${companySlug}`) }
            : {}),
          ...(companyWebsite
            ? { sameAs: companyWebsite, url: companyWebsite }
            : {}),
          ...(companyLogo ? { logo: companyLogo } : {}),
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
        directApply: Boolean(
          job.application_url ?? job.application_email ?? job.application_phone,
        ),
        identifier: {
          "@type": "PropertyValue",
          name: siteConfig.name,
          value: job.id,
        },
      }}
    />
  );
}
