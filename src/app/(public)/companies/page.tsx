import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { getCompanies } from "@/lib/jobs";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Browse Companies Hiring in India",
  description: `Every company with live openings on ${siteConfig.name}. See how many roles each is hiring for and where.`,
  alternates: { canonical: "/companies" },
};

export default async function CompaniesPage() {
  const companies = await getCompanies();

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

      <div className="container-page py-12 lg:py-16">
        {companies.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <li key={company.name}>
                <Link
                  href={`/jobs?q=${encodeURIComponent(company.name)}`}
                  prefetch={true}
                  className="flex h-full flex-col border border-line bg-white p-6 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-4">
                    <CompanyLogo
                      name={company.name}
                      logoUrl={company.logoUrl}
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-h4">{company.name}</h2>
                      <p className="text-sm text-slate-400">
                        {company.jobCount}{" "}
                        {company.jobCount === 1 ? "opening" : "openings"}
                      </p>
                    </div>
                  </div>

                  {company.locations.length ? (
                    <p className="mt-4 text-sm text-slate-600">
                      {company.locations.join(" · ")}
                    </p>
                  ) : null}
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
