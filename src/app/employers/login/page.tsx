import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { MagicLinkForm } from "@/components/employers/magic-link-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Employer sign in",
  robots: { index: false, follow: false },
};

export default function EmployerLoginPage() {
  return (
    <div className="hero-pattern flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-line bg-white p-8">
        <Logo href="/" />
        <h1 className="mt-8 text-h3">Employer sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Post jobs, track their review status and manage your company profile.
        </p>

        <Suspense fallback={<div className="skeleton mt-8 h-56 w-full" />}>
          <MagicLinkForm />
        </Suspense>

        <p className="mt-8 border-t border-line pt-5 text-xs text-slate-400">
          New here?{" "}
          <Link href="/post-a-job" className="font-semibold text-primary hover:underline">
            See how posting works
          </Link>
          {" "}— it&apos;s free, and listings are reviewed within one working day.
        </p>
      </div>
    </div>
  );
}
