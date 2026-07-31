import Link from "next/link";
import { FileSearch } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export default function JobNotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-surface text-primary">
        <FileSearch className="size-8" aria-hidden />
      </span>
      <h1 className="mt-6 text-h2">This job is no longer available</h1>
      <p className="mt-3 max-w-lg text-base text-slate-600">
        The listing may have been filled, closed by the employer, or its link may
        have changed. Plenty of other roles are still open.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/jobs">Browse all jobs</ButtonLink>
        <Link
          href="/contact"
          className="border border-line px-6 py-3 text-base font-semibold text-navy-700 hover:border-primary hover:text-primary"
        >
          Report a problem
        </Link>
      </div>
    </div>
  );
}
