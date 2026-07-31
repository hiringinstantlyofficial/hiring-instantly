const DEV_ORIGIN = "http://localhost:3000";

/**
 * Absolute origin behind every canonical tag, sitemap entry, OG image URL and
 * JSON-LD `@id`. Getting this wrong in production means Google indexes
 * `localhost` URLs, so it resolves in three steps:
 *
 *   1. NEXT_PUBLIC_SITE_URL — the explicit answer, inlined into the client
 *      bundle at build time. Set this on the host for the production domain.
 *   2. Vercel's own deployment host — a correct-by-construction fallback for
 *      preview deployments where nobody set (1). Server-side only; the browser
 *      never sees VERCEL_* vars, which is why (1) still matters for prod.
 *   3. localhost, for `next dev`.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost.replace(/\/+$/, "")}`;

  return DEV_ORIGIN;
}

const resolvedUrl = resolveSiteUrl();

// A production build that still points at localhost would publish localhost
// canonicals. Fail loudly at build time rather than silently tanking SEO.
if (
  process.env.NODE_ENV === "production" &&
  resolvedUrl.startsWith("http://localhost")
) {
  console.warn(
    "[site] NEXT_PUBLIC_SITE_URL is unset — canonical URLs, the sitemap and OG " +
      "images will all point at localhost. Set it to the production origin " +
      "(e.g. https://hiringinstantly.in) in the deployment environment.",
  );
}

export const siteConfig = {
  name: "HiringInstantly",
  tagline: "Find your dream job",
  description:
    "Browse fresher and experienced job openings across India. Verified listings in engineering, design, marketing, finance and more — updated daily.",
  /** Absolute origin, used for canonicals, sitemap entries and OG images. */
  url: resolvedUrl,
  contactEmail: "hello@hiringinstantly.in",
  locale: "en_IN",
} as const;

export const mainNav = [
  { href: "/", label: "Find Jobs" },
  { href: "/companies", label: "Browse Companies" },
] as const;

export const footerNav = {
  about: {
    title: "About",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/companies", label: "Companies" },
      { href: "/terms-and-conditions", label: "Terms" },
      { href: "/privacy-policy", label: "Privacy Policy" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { href: "/jobs", label: "All Jobs" },
      { href: "/jobs?experienceLevel=fresher", label: "Fresher Jobs" },
      { href: "/jobs?jobTypes=internship", label: "Internships" },
      { href: "/blog", label: "Career Advice" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
} as const;

/** Chips under the hero search bar. */
export const popularSearches = [
  "UI Designer",
  "Backend Developer",
  "Data Analyst",
  "Sales Executive",
] as const;

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
