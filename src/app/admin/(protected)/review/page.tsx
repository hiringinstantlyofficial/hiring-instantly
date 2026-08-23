import type { Metadata } from "next";

import { ReviewQueue } from "@/components/admin/review-queue";

export const metadata: Metadata = { title: "Review queue" };

export default function AdminReviewPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-h2">Review queue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Recruiter submissions and access requests. Nothing here is public
          until you approve it.
        </p>
      </header>

      <div className="mt-8">
        <ReviewQueue />
      </div>
    </div>
  );
}
