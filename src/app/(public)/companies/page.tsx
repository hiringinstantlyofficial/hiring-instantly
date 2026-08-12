import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, ChevronRight, MapPin } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { CompanyCover } from "@/components/ui/company-cover";
import { CompanyLogo } from "@/components/ui/company-logo";
import { getCompanyDirectory } from "@/lib/companies";
import { siteConfig } from "@/lib/site";
import { truncate } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Browse Companies Hiring in India",
  description: `Every company with live openings on ${siteConfig.name}. See how many roles each is hiring for and where.`,
  alternates: { canonical: "/companies" },
};

export default async function CompaniesPage() {
  const companies = await getCompanyDirectory();

  return (
    <>
      <PageHeader
        title="Companies hiring right now"
        subtitle={
          companies.length
            ? `${companies.length} ${companies.length === 1 ? "company has" : "companies have"} live openings on the board.`
            : "Company listings appear here as soon as roles are published."
        }
        breadcrumb={[{ name: "Companies", href: "/companies" }]}
      />

      <div className="container-page py-8 sm:py-12 lg:py-16">
        {companies.length ? (
          // Below `sm` these are list rows, not cards: a single column of
          // compact taps with hairline separators. The card treatment (cover
          // strip, generous padding) only earns its space once the grid has
          // more than one column.
          <ul className="divide-y divide-line border-y border-line sm:grid sm:gap-4 sm:divide-y-0 sm:border-0 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.slug}`}
                  prefetch={true}
                  className="group flex h-full flex-col overflow-hidden bg-white transition-colors active:bg-surface-muted sm:border sm:border-line sm:active:bg-white sm:hover:border-primary/40"
                >
                  {/* A thin strip of the cover, so the card previews the
                      profile it opens rather than looking identical to it.
                      Hidden on phones, where 20 empty pattern bands read as
                      broken images rather than as design. */}
                  <CompanyCover
                    coverUrl={company.cover_url}
                    name={company.name}
                    className="hidden h-16 sm:block"
                  />

                  <div className="flex flex-1 flex-col px-4 py-3.5 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <CompanyLogo
                        name={company.name}
                        logoUrl={company.logo_url}
                        className="[--logo-size:40px] sm:[--logo-size:48px]"
                      />
                      <div className="min-w-0 flex-1">
                        <h2 className="flex items-center gap-1.5 text-base font-semibold sm:text-h4">
                          <span className="truncate group-hover:text-primary">
                            {company.name}
                          </span>
                          {company.is_verified ? (
                            <BadgeCheck
                              className="size-4 shrink-0 text-primary"
                              aria-label="Verified employer"
                            />
                          ) : null}
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-slate-400">
                          {company.jobCount}{" "}
                          {company.jobCount === 1 ? "opening" : "openings"}
                          {company.headquarters ? (
                            <span className="sm:hidden">
                              {" "}
                              <span aria-hidden>•</span>{" "}
                              {company.headquarters}
                            </span>
                          ) : null}
                        </p>
                      </div>

                      {/* Tap affordance: on a phone the row has no button and
                          no hover state to signal that it opens something. */}
                      <ChevronRight
                        aria-hidden
                        className="size-5 shrink-0 text-slate-300 sm:hidden"
                      />
                    </div>

                    {company.tagline ? (
                      <p className="mt-4 line-clamp-2 hidden text-sm leading-relaxed text-slate-600 sm:block">
                        {truncate(company.tagline, 120)}
                      </p>
                    ) : null}

                    {company.headquarters ? (
                      <p className="mt-auto hidden items-center gap-1.5 pt-4 text-sm text-slate-400 sm:flex">
                        <MapPin className="size-4 shrink-0" aria-hidden />
                        {company.headquarters}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center border border-line bg-surface-muted px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-surface text-primary">
              <Building2 className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-h3">No companies listed yet</h2>
            <p className="mt-2 max-w-md text-base text-slate-600">
              Once roles are published, the companies hiring for them show up
              here.
            </p>
            <ButtonLink href="/jobs" className="mt-6">
              Browse all jobs
            </ButtonLink>
          </div>
        )}
      </div>
    </>
  );
}
