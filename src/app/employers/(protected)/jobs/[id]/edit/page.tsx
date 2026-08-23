import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  JobSubmitForm,
  type PostableCompany,
} from "@/components/employers/job-submit-form";
import { getRecruiterJob, getRecruiterMemberships } from "@/lib/recruiters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit listing",
  robots: { index: false, follow: false },
};

export default async function EmployerJobEditPage({
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

  const job = await getRecruiterJob(supabase, user.id, id);
  if (!job) notFound();

  // A finished listing is not editable back into circulation — mirrors the
  // RLS update policy, which excludes closed and expired.
  if (job.status === "closed" || job.status === "expired") {
    redirect(`/employers/jobs/${job.id}`);
  }

  const memberships = await getRecruiterMemberships(supabase, user.id);
  const companies: PostableCompany[] = memberships
    .filter((m) => m.status !== "rejected" && m.company)
    .map((m) => ({
      id: m.company!.id,
      name: m.company!.name,
      logo_url: m.company!.logo_url,
      membershipStatus: m.status,
    }));

  return (
    <div className="container-page max-w-4xl py-10">
      <Link
        href={`/employers/jobs/${job.id}`}
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← Back to status
      </Link>
      <h1 className="mt-4 text-h2">Edit “{job.title}”</h1>

      <div className="mt-8">
        <JobSubmitForm job={job} companies={companies} />
      </div>
    </div>
  );
}
