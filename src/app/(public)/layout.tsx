import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

/**
 * Chrome for the public site. Lives in a route group so `/admin` — which sits
 * outside it — renders without the marketing header and footer.
 *
 * The group adds no URL segment: `(public)/about/page.tsx` is still `/about`.
 *
 * Analytics is mounted here rather than in the root layout for the same reason:
 * the root layout wraps /admin, and a single admin working in the dashboard all
 * day would be a visible share of the traffic on a site this new.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* First in the tree so the Consent Mode defaults are parsed early. */}
      <GoogleAnalytics />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <OrganizationJsonLd />
    </>
  );
}
