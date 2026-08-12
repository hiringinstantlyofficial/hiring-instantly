import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CalendarClock, ChevronRight, Globe } from "lucide-react";

import { ApplyButton } from "@/components/jobs/apply-button";
// import { CapacityMeter } from "@/components/jobs/capacity-meter";
import { JobCard } from "@/components/jobs/job-card";
import { BreadcrumbJsonLd, JobPostingJsonLd } from "@/components/seo/json-ld";
import { CategoryBadge } from "@/components/ui/badge";
import { CompanyCover } from "@/components/ui/company-cover";
import { CompanyLogo } from "@/components/ui/company-logo";
import { getCompanyBySlug } from "@/lib/companies";
import { getAllActiveJobSlugs, getJobBySlug, getSimilarJobs } from "@/lib/jobs";
import { absoluteUrl, siteConfig } from "@/lib/site";
import {
  formatDate,
  formatSalaryRange,
  toISTISOString,
  truncate,
} from "@/lib/utils";
import {
  EXPERIENCE_LEVEL_LABELS,
  JOB_LEVEL_LABELS,
  JOB_TYPE_LABELS,
  type JobWithCompany,
} from "@/types/job";

/** Job pages are ISR: prerendered at build, refreshed without a redeploy. */
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const jobs = await getAllActiveJobSlugs();
  // Prerender the freshest listings; the rest render on first request.
  return jobs.slice(0, 200).map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return { title: "Job not found", robots: { index: false, follow: false } };
  }

  const salary = formatSalaryRange(
    job.salary_min,
    job.salary_max,
    job.salary_currency,
  );

  const title = `${job.title} at ${job.company_name} — ${job.location}`;
  const description = truncate(
    [
      `${JOB_TYPE_LABELS[job.job_type]} ${job.title} role at ${job.company_name} in ${job.location}.`,
      salary ? `Salary ${salary} per year.` : null,
      job.description,
    ]
      .filter(Boolean)
      .join(" "),
    155,
  );

  const canonical = `/jobs/${job.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: siteConfig.name,
      publishedTime: toISTISOString(job.posted_at),
      images: [
        {
          url: `/jobs/${job.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${job.title} at ${job.company_name}`,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
    other: {
      "job:posted_at": toISTISOString(job.posted_at),
      ...(job.valid_through
        ? { "job:valid_through": toISTISOString(job.valid_through) }
        : {}),
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) notFound();

  // The listing embed carries only what a card needs (name, logo, link). The
  // detail page also shows the company's description, which is now written
  // once on the company row rather than per listing, so it fetches the full
  // row — a cached read, and only on this route.
  const [similar, company] = await Promise.all([
    getSimilarJobs(job),
    job.company ? getCompanyBySlug(job.company.slug) : Promise.resolve(null),
  ]);

  const companyName = job.company?.name ?? job.company_name;
  const companyHref = job.company ? `/companies/${job.company.slug}` : null;
  const companyWebsite = company?.website ?? job.company?.website ?? null;

  const salary = formatSalaryRange(
    job.salary_min,
    job.salary_max,
    job.salary_currency,
  );

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Jobs", href: "/jobs" },
    { name: job.title, href: `/jobs/${job.slug}` },
  ];

  return (
    <>
      {/* --- header ---------------------------------------------------------- */}
      {/* The employer's banner backs this band, the same image their profile
          uses, so a role and the company behind it look like one place. With
          no banner set CompanyCover falls back to the site's hero-pattern —
          which is exactly what this header was before. */}
      <CompanyCover
        coverUrl={company?.cover_url}
        name={companyName}
        className="border-b border-line-soft"
      >
        <div className="container-page py-8 lg:py-10">
          <nav aria-label="Breadcrumb">
            <ol
              className={`flex flex-wrap items-center gap-1.5 text-sm ${
                company?.cover_url ? "text-white/70" : "text-slate-400"
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
                          company?.cover_url
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

          {/* A little more clearance than before, so the banner behind reads
              as a banner rather than a stripe peeking past the card. */}
          <div className="mt-6 flex flex-col gap-6 border border-line bg-white p-6 sm:flex-row sm:items-center lg:mt-8 lg:p-8">
            <CompanyLogo
              name={companyName}
              logoUrl={company?.logo_url ?? job.company?.logo_url}
              size={80}
              priority
            />

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{job.title}</h1>
              <p className="mt-2 text-base text-slate-400">
                {/* Points at the company profile rather than straight out to
                    the employer's site: the profile is ours, indexable, and
                    carries every other role they have open. */}
                {companyHref ? (
                  <Link
                    href={companyHref}
                    className="font-semibold text-navy-700 hover:text-primary"
                  >
                    {companyName}
                  </Link>
                ) : (
                  <span className="font-semibold text-navy-700">
                    {companyName}
                  </span>
                )}{" "}
                <span aria-hidden>•</span> {job.location}{" "}
                <span aria-hidden>•</span> {JOB_TYPE_LABELS[job.job_type]}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Posted{" "}
                <time dateTime={toISTISOString(job.posted_at)}>
                  {formatDate(job.posted_at)}
                </time>
                {job.valid_through
                  ? ` · Apply before ${formatDate(job.valid_through)}`
                  : ""}
              </p>
            </div>

            {/* <div className="w-full sm:w-56">
              <CapacityMeter
                applied={job.applicants_count}
                capacity={job.capacity}
              />
            </div> */}
          </div>
        </div>
      </CompanyCover>

      {/* --- body ------------------------------------------------------------ */}
      <div className="container-page py-12 lg:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <article className="min-w-0 flex-1">
            <section>
              <h2 className="text-h3">Description</h2>
              <div className="prose-legal mt-4 whitespace-pre-line">
                {job.description}
              </div>
            </section>

            <BulletSection title="Responsibilities" items={job.responsibilities} />
            <BulletSection title="Who You Are" items={job.requirements} />
            <BulletSection title="Nice-To-Haves" items={job.nice_to_haves} />

            {/* One description per company, read from the company row — the
                same copy every listing they own shows. Truncated here, with
                the profile carrying the full text. */}
            {company?.description ? (
              <section className="mt-10">
                <h2 className="text-h3">About {companyName}</h2>
                <p className="prose-legal mt-4 whitespace-pre-line">
                  {truncate(company.description, 600)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-5">
                  {companyHref ? (
                    <Link
                      href={companyHref}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      <Building2 className="size-4" aria-hidden />
                      View company profile
                    </Link>
                  ) : null}
                  {companyWebsite ? (
                    <a
                      href={companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      <Globe className="size-4" aria-hidden />
                      Visit website
                    </a>
                  ) : null}
                </div>
              </section>
            ) : null}

            <div className="mt-10 border border-line bg-surface-muted p-6">
              <h2 className="text-h4">Ready to apply?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Applications are handled directly by {companyName}.
              </p>
              <div className="mt-4 sm:max-w-xs">
                <ApplyButton job={job} />
              </div>
            </div>
          </article>

          {/* --- meta rail ---------------------------------------------------- */}
          <aside className="w-full shrink-0 lg:w-[320px]">
            <div className="border border-line p-6">
              <h2 className="text-h4">About this role</h2>

              <dl className="mt-5 space-y-4 text-sm">
                <MetaRow
                  label="Apply before"
                  value={
                    job.valid_through ? formatDate(job.valid_through) : "Open"
                  }
                  icon={<CalendarClock className="size-4" aria-hidden />}
                />
                <MetaRow label="Posted on" value={formatDate(job.posted_at)} />
                <MetaRow
                  label="Job type"
                  value={JOB_TYPE_LABELS[job.job_type]}
                />
                <MetaRow
                  label="Experience"
                  value={
                    job.min_experience_years
                      ? `${EXPERIENCE_LEVEL_LABELS[job.experience_level]} · ${job.min_experience_years}+ yrs`
                      : EXPERIENCE_LEVEL_LABELS[job.experience_level]
                  }
                />
                {job.job_level ? (
                  <MetaRow
                    label="Job level"
                    value={JOB_LEVEL_LABELS[job.job_level]}
                  />
                ) : null}
                <MetaRow
                  label="Salary"
                  value={salary ? `${salary} / year` : "Not disclosed"}
                />
              </dl>
            </div>

            {job.categories.length ? (
              <div className="mt-6 border border-line p-6">
                <h2 className="text-h4">Categories</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.categories.map((category) => (
                    <Link key={category} href={`/jobs?categories=${category}`}>
                      <CategoryBadge category={category} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {job.skills.length ? (
              <div className="mt-6 border border-line p-6">
                <h2 className="text-h4">Required skills</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <li key={`${index}-${skill}`}>
                      <Link
                        href={`/jobs?q=${encodeURIComponent(skill)}`}
                        className="inline-flex bg-primary-surface px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
                      >
                        {skill}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.benefits.length ? (
              <div className="mt-6 border border-line p-6">
                <h2 className="text-h4">Perks &amp; benefits</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {job.benefits.map((benefit, index) => (
                    <li key={`${index}-${benefit}`} className="flex gap-2">
                      <span aria-hidden className="text-accent-green">
                        ✓
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        {/* --- similar jobs -------------------------------------------------- */}
        {similar.length ? (
          <section className="mt-16 border-t border-line pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-h2">Similar Jobs</h2>
              <Link
                href="/jobs"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Show all jobs
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {similar.map((item: JobWithCompany) => (
                <JobCard key={item.id} job={item} view="grid" />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <JobPostingJsonLd job={job} company={company} />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </>
  );
}

function BulletSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-h3">{title}</h2>
      <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
        {/* Keyed by index: these are free-text lines an admin typed, so two of
            them can legitimately be identical, and the text alone is not a
            unique key. The list is static and never reordered. */}
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className="flex gap-3">
            <span aria-hidden className="mt-1 text-accent-green">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
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
