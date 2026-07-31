import type { Metadata } from "next";
import Link from "next/link";

import { JobTable } from "@/components/admin/job-table";

export const metadata: Metadata = { title: "Jobs" };

export default function AdminJobsPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Jobs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Search, filter, edit status, or remove a listing.
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Add a job
        </Link>
      </header>

      <div className="mt-8">
        <JobTable />
      </div>
    </div>
  );
}
