import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Globe,
  MapPin,
  Users,
} from "lucide-react";

import { JobCard } from "@/components/jobs/job-card";
import { BreadcrumbJsonLd, CompanyJsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { CompanyCover } from "@/components/ui/company-cover";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  getCompanyBySlug,
  getIndexableCompanySlugs,
  getJobsByCompany,
} from "@/lib/companies";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { truncate } from "@/lib/utils";
import { COMPANY_SIZE_LABELS, type Company } from "@/types/company";

/** Profiles are ISR, on the same cadence as the listings they summarise. */
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const companies = await getIndexableCompanySlugs();
  return companies.slice(0, 200).map((company) => ({ slug: company.slug }));
}

/** The blurb used for the meta description, in descending order of quality. */
function describeCompany(company: Company, jobCount: number): string {
  const roles = `${jobCount} open ${jobCount === 1 ? "role" : "roles"}`;
  const lead =
    company.tagline ??
    (company.description ? truncate(company.description, 110) : null) ??
    `${company.name} is hiring on ${siteConfig.name}`;

  return truncate(`${lead} — ${roles} at ${company.name}.`, 155);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return { title: "Company not found", robots: { index: false, follow: false } };
  }

  const { total } = await getJobsByCompany(company.id, 1);
  const canonical = `/companies/${company.slug}`;
  const title = `${company.name} — Jobs, Careers and Company Profile`;
  const description = describeCompany(company, total);

  return {
    title,
    description,
    alternates: { canonical },
    // A profile with no live roles is thin content. It still renders — direct
    // links and admin previews need it — but it stays out of the index until
    // the company is actually hiring.
    robots: total === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "profile",
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: siteConfig.name,
      images: [
        {
          url: `/companies/${company.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${company.name} on ${siteConfig.name}`,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) notFound();

  const { jobs, total } = await getJobsByCompany(company.id);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Companies", href: "/companies" },
    { name: company.name, href: `/companies/${company.slug}` },
  ];

  return (
    <>
      {/* --- hero ------------------------------------------------------------ */}
      <CompanyCover
        coverUrl={company.cover_url}
        name={company.name}
        className="border-b border-line-soft"
      >
        <div className="container-page py-8 lg:py-12">
          <nav aria-label="Breadcrumb">
            <ol
              className={`flex flex-wrap items-center gap-1.5 text-sm ${
                company.cover_url ? "text-white/70" : "text-slate-400"
              }`}
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.href} className="flex items-center gap-1.5">
                    {isLast ? (
                      <span
                        aria-current="page"
                        className={
                          company.cover_url
                            ? "font-semibold text-white"
                            : "font-semibold text-navy-700"
                        }
                      >
                        {truncate(crumb.name, 48)}
                      </span>
                    ) : (
                      <>
                        <Link href={crumb.href} className="hover:text-primary">
                          {crumb.name}
                        </Link>
                        <ChevronRight className="size-4" aria-hidden />
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Logo and detail sit side by side at every width. On a phone the
              detail column stacks name → open roles → button beside the logo,
              which reads as one block; stacking the logo above it instead left
              a wide empty gutter and pushed the button off the fold. */}
          <div className="mt-8 flex items-start gap-4 sm:items-end sm:gap-6">
            <CompanyLogo
              name={company.name}
              logoUrl={company.logo_url}
              size={96}
              priority
              className="border border-line bg-white p-2 shadow-sm [--logo-size:72px] sm:[--logo-size:96px]"
            />

            <div className="min-w-0 flex-1 sm:flex sm:items-end sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <h1
                  className={`flex flex-wrap items-center gap-2 text-xl font-bold sm:text-4xl ${
                    company.cover_url ? "text-white" : ""
                  }`}
                >
                  {company.name}
                  {company.is_verified ? (
                    <BadgeCheck
                      className="size-5 shrink-0 text-primary sm:size-6"
                      aria-label="Verified employer"
                    />
                  ) : null}
                </h1>

                {company.tagline ? (
                  <p
                    className={`mt-2 max-w-2xl text-sm sm:text-base ${
                      company.cover_url ? "text-white/80" : "text-slate-600"
                    }`}
                  >
                    {company.tagline}
                  </p>
                ) : null}

                <p
                  className={`mt-2 text-sm sm:mt-3 ${
                    company.cover_url ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {total} open {total === 1 ? "role" : "roles"}
                  {company.headquarters ? ` · ${company.headquarters}` : ""}
                </p>
              </div>

              {/* Full width inside the narrow column on a phone, back to its
                  natural width once it sits beside the heading. */}
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  // nofollow, as with every outbound employer link on the site.
                  rel="noopener noreferrer nofollow"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover sm:mt-0 sm:w-auto sm:shrink-0 sm:px-6 sm:py-3 sm:text-base"
                >
                  <Globe className="size-4 sm:size-5" aria-hidden />
                  Visit website
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </CompanyCover>

      {/* --- body ------------------------------------------------------------ */}
      <div className="container-page py-12 lg:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="min-w-0 flex-1">
            {company.description ? (
              <section>
                <h2 className="text-h3">About {company.name}</h2>
                <div className="prose-legal mt-4 whitespace-pre-line">
                  {company.description}
                </div>
              </section>
            ) : null}

            <section className={company.description ? "mt-12" : undefined}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-h3">
                  Open roles at {truncate(company.name, 40)}
                </h2>
                {total > jobs.length ? (
                  <Link
                    href={`/jobs?company=${company.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    See all {total} roles
                  </Link>
                ) : null}
              </div>

              {jobs.length ? (
                <div className="mt-6 space-y-4">
                  {jobs.map((job, index) => (
                    <JobCard key={job.id} job={job} priority={index === 0} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center border border-line bg-surface-muted px-6 py-12 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary-surface text-primary">
                    <Building2 className="size-6" aria-hidden />
                  </span>
                  <p className="mt-4 max-w-md text-base text-slate-600">
                    {company.name} has no live openings on {siteConfig.name}
                    &nbsp;right now. New roles appear here as soon as they are
                    published.
                  </p>
                  <ButtonLink href="/jobs" className="mt-6">
                    Browse all jobs
                  </ButtonLink>
                </div>
              )}

              {total > jobs.length ? (
                <div className="mt-8">
                  <ButtonLink
                    href={`/jobs?company=${company.slug}`}
                    variant="outline"
                  >
                    See all {total} roles at {truncate(company.name, 30)}
                  </ButtonLink>
                </div>
              ) : null}
            </section>
          </div>

          {/* --- meta rail ---------------------------------------------------- */}
          <aside className="w-full shrink-0 lg:w-[320px]">
            <div className="border border-line p-6">
              <h2 className="text-h4">At a glance</h2>
              <dl className="mt-5 space-y-4 text-sm">
                {company.industry ? (
                  <MetaRow
                    label="Industry"
                    value={company.industry}
                    icon={<Building2 className="size-4" aria-hidden />}
                  />
                ) : null}
                {company.headquarters ? (
                  <MetaRow
                    label="Headquarters"
                    value={company.headquarters}
                    icon={<MapPin className="size-4" aria-hidden />}
                  />
                ) : null}
                {company.size_range ? (
                  <MetaRow
                    label="Company size"
                    value={COMPANY_SIZE_LABELS[company.size_range]}
                    icon={<Users className="size-4" aria-hidden />}
                  />
                ) : null}
                {company.founded_year ? (
                  <MetaRow
                    label="Founded"
                    value={String(company.founded_year)}
                    icon={<CalendarDays className="size-4" aria-hidden />}
                  />
                ) : null}
                <MetaRow
                  label="Open roles"
                  value={String(total)}
                  icon={<Building2 className="size-4" aria-hidden />}
                />
              </dl>

              {company.website || company.linkedin_url ? (
                <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      <Globe className="size-4" aria-hidden />
                      Company website
                    </a>
                  ) : null}
                  {company.linkedin_url ? (
                    <a
                      href={company.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      {/* lucide dropped its brand icons, so the generic
                          outbound-link glyph stands in for LinkedIn. */}
                      <ExternalLink className="size-4" aria-hidden />
                      LinkedIn
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-6 border border-line bg-surface-muted p-6">
              <h2 className="text-h4">Hiring at {truncate(company.name, 24)}?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Listings are published by {siteConfig.name}. Get in touch to add
                or correct a role.
              </p>
              <ButtonLink href="/contact" variant="outline" className="mt-4">
                Contact us
              </ButtonLink>
            </div>
          </aside>
        </div>
      </div>

      <CompanyJsonLd company={company} jobs={jobs} jobCount={total} />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </>
  );
}

function MetaRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft pb-3 last:border-0 last:pb-0">
      <dt className="flex items-center gap-2 text-slate-400">
        {icon}
        {label}
      </dt>
      <dd className="text-right font-semibold text-navy-700">{value}</dd>
    </div>
  );
}
