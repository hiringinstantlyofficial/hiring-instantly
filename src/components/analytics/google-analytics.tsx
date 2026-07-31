import Script from "next/script";

import {
  CONSENT_REQUIRED_REGIONS,
  GA_MEASUREMENT_ID,
  isAnalyticsEnabled,
} from "@/lib/analytics";

/**
 * Consent Mode v2 defaults, then the GA4 config, queued onto `dataLayer` before
 * gtag.js arrives and drains it.
 *
 * This is a plain inline `<script>` rather than next/script deliberately.
 * Consent defaults must be set *before* gtag.js loads, and next/script's
 * `strategy="beforeInteractive"` only works from the root layout — which also
 * wraps /admin, where we do not want analytics at all. An inline script executes
 * while the HTML is parsed, comfortably ahead of the afterInteractive tag below.
 *
 * The region-specific `default` comes first because Google resolves the most
 * specific matching region, and `wait_for_update` gives a consent tool 500ms to
 * answer before tags fire.
 *
 * `send_page_view: false` because App Router navigations are history events, and
 * page views are sent explicitly by <PageViewTracker> instead — see the note
 * there about not double-counting.
 */
const bootstrap = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','region':${JSON.stringify(
  CONSENT_REQUIRED_REGIONS,
)},'wait_for_update':500});
gtag('consent','default',{'ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted','analytics_storage':'granted'});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);
gtag('js',new Date());
gtag('config',${JSON.stringify(GA_MEASUREMENT_ID)},{'send_page_view':false});
`.trim();

/**
 * Google Analytics 4.
 *
 * Mounted from `(public)/layout.tsx`, so the admin dashboard is never measured —
 * a single admin clicking around all day would otherwise be a visible share of
 * the traffic on a new site.
 */
export function GoogleAnalytics() {
  if (!isAnalyticsEnabled) return null;

  return (
    <>
      {/* The measurement ID is validated against /^G-[A-Z0-9]{6,}$/ in
          lib/analytics and serialised with JSON.stringify, so it cannot break
          out of the string literal it sits in. */}
      <script id="ga-bootstrap" dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <Script
        id="ga-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
