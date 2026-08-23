import type { Metadata } from "next";
import Link from "next/link";

import { JobTable } from "@/components/admin/job-table";
import { StatsCards } from "@/components/admin/stats-cards";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Everything on the board at a glance.
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
        <StatsCards />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-h4">Recently posted</h2>
        </div>
        <JobTable limit={5} />
      </section>
    </div>
  );
}
