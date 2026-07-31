import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Catches URLs that match no route at all, so it sits outside the (public)
 * group and has to bring its own header and footer.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="hero-pattern flex-1">
      <div className="container-page flex flex-col items-center py-28 text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-h2">We couldn&apos;t find that page</h1>
        <p className="mt-3 max-w-lg text-base text-slate-600">
          The link may be broken, or the page may have moved. Let&apos;s get you
          back to the job listings.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/jobs" size="lg">
            Browse jobs
          </ButtonLink>
          <Link
            href="/"
            className="border border-line bg-white px-8 py-3.5 text-base font-semibold text-navy-700 hover:border-primary hover:text-primary"
          >
            Go home
          </Link>
        </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
