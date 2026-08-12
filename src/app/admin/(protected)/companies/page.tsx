import type { Metadata } from "next";
import Link from "next/link";

import { CompanyTable } from "@/components/admin/company-table";

export const metadata: Metadata = { title: "Companies" };

export default function AdminCompaniesPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Companies</h1>
          <p className="mt-1 text-sm text-slate-600">
            One profile per employer. The logo, background image, website and
            description here are what every listing that company owns shows.
          </p>
        </div>
        <Link
          href="/admin/companies/new"
          className="bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Add a company
        </Link>
      </header>

      <div className="mt-8">
        <CompanyTable />
      </div>
    </div>
  );
}
