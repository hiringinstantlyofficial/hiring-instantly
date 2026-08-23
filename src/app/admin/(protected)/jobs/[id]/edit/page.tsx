import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { JobForm } from "@/components/admin/job-form";
import { StatusBadge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Job } from "@/types/job";

export const metadata: Metadata = { title: "Edit job" };

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Read with the admin's session so RLS returns drafts too.
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("[admin] failed to load job:", error);
  if (!data) notFound();

  const job = data as Job;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to jobs
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2">{job.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {job.company_name} · {job.location}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={job.status} />
          {job.status === "active" ? (
            <Link
              href={`/jobs/${job.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              View live
              <ExternalLink className="size-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </header>

      <div className="mt-8 max-w-4xl">
        <JobForm job={job} />
      </div>
    </div>
  );
}
