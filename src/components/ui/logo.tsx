import Link from "next/link";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

interface LogoProps {
  /** `dark` is for the navy footer, where the wordmark sits on a dark ground. */
  variant?: "light" | "dark";
  className?: string;
  href?: string;
}

/** Circular indigo mark + wordmark, as in the reference header. */
export function Logo({ variant = "light", className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <Image
        src="/logo.jpg"
        alt={`${siteConfig.name} logo`}
        width={32}
        height={32}
        className="shrink-0 object-contain"
      />
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          variant === "dark" ? "text-white" : "text-navy-700",
        )}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
