import Image from "next/image";

import { isOptimizableImage } from "@/lib/image-hosts";
import { cn, initialsOf } from "@/lib/utils";

const TINTS = [
  "bg-primary/10 text-primary",
  "bg-accent-green/15 text-accent-green",
  "bg-accent-yellow/20 text-accent-yellow",
  "bg-accent-blue/15 text-accent-blue",
  "bg-accent-purple/15 text-accent-purple",
  "bg-accent-red/10 text-accent-red",
] as const;

/** Stable per-company tint so the fallback never changes between renders. */
function tintFor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 997;
  }
  return TINTS[hash % TINTS.length]!;
}

interface CompanyLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
  /** Set on the LCP candidate (first card / detail header) only. */
  priority?: boolean;
}

export function CompanyLogo({
  name,
  logoUrl,
  size = 48,
  className,
  priority = false,
}: CompanyLogoProps) {
  // Explicit width/height on a fixed-size box keeps CLS at zero whether or not
  // the remote logo resolves.
  if (logoUrl) {
    // next/image throws on a host that isn't in remotePatterns, and that list
    // is now an allowlist rather than a wildcard. An admin-pasted logo on some
    // other CDN renders as a plain <img>: unoptimised, but it renders, and the
    // optimiser stays closed to arbitrary URLs.
    const optimizable = isOptimizableImage(logoUrl);

    return (
      <div
        className={cn("relative shrink-0 overflow-hidden bg-white", className)}
        style={{ width: size, height: size }}
      >
        {optimizable ? (
          <Image
            src={logoUrl}
            alt={`${name} logo`}
            width={size}
            height={size}
            priority={priority}
            className="size-full object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- see above
          <img
            src={logoUrl}
            alt={`${name} logo`}
            width={size}
            height={size}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            className="size-full object-contain"
          />
        )}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        tintFor(name),
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initialsOf(name)}
    </div>
  );
}
