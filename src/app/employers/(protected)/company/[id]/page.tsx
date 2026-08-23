import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock3, ExternalLink } from "lucide-react";

import { CompanyEditForm } from "@/components/employers/company-edit-form";
import { CompanyLogo } from "@/components/ui/company-logo";
import { getRecruiterMemberships } from "@/lib/recruiters";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Company } from "@/types/company";

export const metadata: Metadata = {
  title: "Edit company",
  robots: { index: false, follow: false },
};

export default async function EmployerCompanyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/employers/login");

  const memberships = await getRecruiterMemberships(supabase, user.id);
  const membership = memberships.find((m) => m.company_id === id);
  if (!membership?.company) notFound();

  const approved = membership.status === "approved";

  // The full row is only readable (and only needed) when the membership is
  // approved; a pending member sees the read-only card below instead.
  const { data: company } = approved
    ? await supabase.from("companies").select("*").eq("id", id).maybeSingle()
    : { data: null };

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2">{membership.company.name}</h1>
        {membership.company.status === "active" ? (
          <Link
            href={`/companies/${membership.company.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View public profile
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>

      {approved && company ? (
        <div className="mt-8">
          <CompanyEditForm company={company as Company} />
        </div>
      ) : (
        <div className="mt-8 border border-line bg-white p-8">
          <div className="flex items-start gap-4">
            <CompanyLogo
              name={membership.company.name}
              logoUrl={membership.company.logo_url}
              size={48}
            />
            <div>
              <p className="flex items-center gap-2 font-semibold text-navy-700">
                <Clock3 className="size-4 text-accent-yellow" aria-hidden />
                Verification pending
              </p>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                You can post jobs for {membership.company.name} right now.
                Editing the company profile — logo, cover, description — needs
                our OK first, which usually lands the same day. We&apos;ll email
                you at the address you signed in with.
              </p>
              <Link
                href="/employers/jobs/new"
                className="mt-5 inline-block bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Post a job instead
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
