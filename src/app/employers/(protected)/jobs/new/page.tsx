import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  JobSubmitForm,
  type PostableCompany,
} from "@/components/employers/job-submit-form";
import { getRecruiterMemberships } from "@/lib/recruiters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Post a job",
  robots: { index: false, follow: false },
};

export default async function EmployerJobNewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/employers/login");

  const memberships = await getRecruiterMemberships(supabase, user.id);
  const companies: PostableCompany[] = memberships
    .filter((m) => m.status !== "rejected" && m.company)
    .map((m) => ({
      id: m.company!.id,
      name: m.company!.name,
      logo_url: m.company!.logo_url,
      membershipStatus: m.status,
    }));

  if (companies.length === 0) {
    // No company to post for — the wizard is the missing step, not this form.
    redirect("/employers/company/new");
  }

  return (
    <div className="container-page max-w-4xl py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Step 3 of 3 · The role
      </p>
      <h1 className="mt-2 text-h2">Describe the role</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        The more specific the listing, the faster it clears review and the
        better it ranks. Salary ranges get measurably more applicants.{" "}
        <Link href="/employers" className="font-semibold text-primary hover:underline">
          Back to dashboard
        </Link>
        .
      </p>

      <div className="mt-8">
        <JobSubmitForm companies={companies} />
      </div>
    </div>
  );
}
