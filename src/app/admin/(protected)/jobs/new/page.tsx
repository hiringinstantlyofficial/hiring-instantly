import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { JobForm } from "@/components/admin/job-form";

export const metadata: Metadata = { title: "Add a job" };

export default function NewJobPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to jobs
      </Link>

      <header className="mt-4">
        <h1 className="text-h2">Add a job</h1>
        <p className="mt-1 text-sm text-slate-600">
          Save it as a draft first if you&apos;re still waiting on details — only
          active listings appear publicly.
        </p>
      </header>

      <div className="mt-8 max-w-4xl">
        <JobForm />
      </div>
    </div>
  );
}
