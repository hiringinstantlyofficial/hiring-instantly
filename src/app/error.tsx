"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  // Header only, no footer: this file is a Client Component, and SiteFooter is
  // a Server Component that would be pulled into the client bundle by importing
  // it here.
  return (
    <>
      <SiteHeader />
      <main className="hero-pattern flex-1">
        <div className="container-page flex flex-col items-center py-28 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-accent-red/10 text-accent-red">
          <TriangleAlert className="size-8" aria-hidden />
        </span>
        <h1 className="mt-6 text-h2">Something went wrong</h1>
        <p className="mt-3 max-w-lg text-base text-slate-600">
          This one is on us. Try again in a moment — if it keeps happening, let
          us know and we&apos;ll take a look.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-slate-400">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}>
            <RotateCcw className="size-5" aria-hidden />
            Try again
          </Button>
          <ButtonLink href="/contact" variant="outline" size="lg">
            Report the problem
          </ButtonLink>
          </div>
        </div>
      </main>
    </>
  );
}
