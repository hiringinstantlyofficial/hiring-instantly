import type { Metadata } from "next";

import { RecruiterTable } from "@/components/admin/recruiter-table";

export const metadata: Metadata = { title: "Recruiters" };

export default function AdminRecruitersPage() {
  return (
    <div className="p-6 lg:p-8">
      <header>
        <h1 className="text-h2">Recruiters</h1>
        <p className="mt-1 text-sm text-slate-600">
          Every employer account, their track record, and the suspend switch.
        </p>
      </header>

      <div className="mt-8">
        <RecruiterTable />
      </div>
    </div>
  );
}
