import type { Metadata } from "next";

import { CompanyWizard } from "@/components/employers/company-wizard";

export const metadata: Metadata = {
  title: "Your company",
  robots: { index: false, follow: false },
};

export default function EmployerCompanyNewPage() {
  return (
    <div className="container-page max-w-4xl py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Step 2 of 3 · Your company
      </p>
      <h1 className="mt-2 text-h2">Which company are you hiring for?</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Search first — if the company is already on the board, you&apos;ll post
        under its existing profile instead of creating a duplicate.
      </p>

      <div className="mt-8">
        <CompanyWizard />
      </div>
    </div>
  );
}
