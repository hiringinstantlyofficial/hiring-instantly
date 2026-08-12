import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { CompanyForm } from "@/components/admin/company-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Company } from "@/types/company";

export const metadata: Metadata = { title: "Edit company" };

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Read with the admin's session so RLS returns hidden companies too.
  const { data, error } = await supabase
    .from("companies")
    .select("*, jobs(count)")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("[admin] failed to load company:", error);
  if (!data) notFound();

  const { jobs, ...rest } = data as unknown as Company & {
    jobs: { count: number }[];
  };
  const company = rest as Company;
  const jobCount = jobs?.[0]?.count ?? 0;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to companies
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2">{company.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {jobCount} {jobCount === 1 ? "listing" : "listings"} · every one of
            them shows the description below.
          </p>
        </div>
        {company.status === "active" ? (
          <Link
            href={`/companies/${company.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View live
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        ) : null}
      </header>

      <div className="mt-8 max-w-4xl">
        <CompanyForm company={company} />
      </div>
    </div>
  );
}
