import Link from "next/link";
import { Building2 } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export default function CompanyNotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-surface text-primary">
        <Building2 className="size-8" aria-hidden />
      </span>
      <h1 className="mt-6 text-h2">We don&apos;t have a profile for this company</h1>
      <p className="mt-3 max-w-lg text-base text-slate-600">
        It may have been removed, or its link may have changed. Plenty of other
        employers are hiring right now.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/companies">Browse all companies</ButtonLink>
        <Link
          href="/jobs"
          className="border border-line px-6 py-3 text-base font-semibold text-navy-700 hover:border-primary hover:text-primary"
        >
          Browse all jobs
        </Link>
      </div>
    </div>
  );
}
