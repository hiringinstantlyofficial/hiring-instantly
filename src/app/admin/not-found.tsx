import Link from "next/link";
import { FileQuestion } from "lucide-react";

/**
 * Not-found boundary for everything under /admin.
 *
 * Without this, Next falls back to the root not-found — which carries the
 * public header and footer, both visually wrong here and serialised into every
 * admin route's payload as the boundary's fallback element.
 */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-line bg-white p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-surface text-primary">
          <FileQuestion className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-h3">Not found</h1>
        <p className="mt-2 text-base text-slate-600">
          That record doesn&apos;t exist, or it was deleted from another tab.
        </p>
        <Link
          href="/admin/jobs"
          className="mt-6 inline-block bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary-hover"
        >
          Back to jobs
        </Link>
      </div>
    </div>
  );
}
