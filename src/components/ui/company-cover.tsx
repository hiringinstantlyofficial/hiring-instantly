import Image from "next/image";

import { isOptimizableImage } from "@/lib/image-hosts";
import { cn } from "@/lib/utils";

/**
 * The background band at the top of a company profile.
 *
 * Two things it has to get right. First, an unset cover must look deliberate
 * rather than broken — the fallback is the same `hero-pattern` band the rest of
 * the site uses for its page headers, so a company with no image still reads as
 * a designed page. Second, whatever sits on top of it has to stay readable over
 * an arbitrary photograph an admin uploaded, which is what the scrim is for.
 */
export function CompanyCover({
  coverUrl,
  name,
  className,
  children,
}: {
  coverUrl?: string | null;
  name: string;
  className?: string;
  children?: React.ReactNode;
}) {
  // next/image throws on a host outside remotePatterns, so an admin-pasted URL
  // on some other CDN falls back to a plain <img> — unoptimised, but it
  // renders, and the optimiser stays closed to arbitrary URLs. Same call the
  // logo makes; see src/lib/image-hosts.ts.
  const optimizable = coverUrl ? isOptimizableImage(coverUrl) : false;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        coverUrl ? "bg-navy-900" : "hero-pattern",
        className,
      )}
    >
      {coverUrl ? (
        <>
          {optimizable ? (
            <Image
              src={coverUrl}
              alt=""
              fill
              // The band is full-bleed at every breakpoint, so the optimiser
              // should pick by viewport width rather than a layout column.
              sizes="100vw"
              priority
              className="object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- see above
            <img
              src={coverUrl}
              alt=""
              decoding="async"
              referrerPolicy="no-referrer"
              className="absolute inset-0 size-full object-cover"
            />
          )}

          {/* Decorative: the alt text above is empty because the company name
              is already the heading rendered over this image. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/55 to-navy-900/30"
          />
          <span className="sr-only">{`Cover image for ${name}`}</span>
        </>
      ) : null}

      <div className="relative">{children}</div>
    </div>
  );
}
