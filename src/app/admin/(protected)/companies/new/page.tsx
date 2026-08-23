import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { CompanyForm } from "@/components/admin/company-form";

export const metadata: Metadata = { title: "New company" };

export default function NewCompanyPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to companies
      </Link>

      <header className="mt-4">
        <h1 className="text-h2">Add a company</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create the profile first, then attach listings to it from the job
          form. Images can be uploaded before saving.
        </p>
      </header>

      <div className="mt-8 max-w-4xl">
        <CompanyForm />
      </div>
    </div>
  );
}
