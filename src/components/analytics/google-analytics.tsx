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
 * `config` deliberately keeps the default `send_page_view: true`. It previously
 * suppressed the page view and left it to a client effect, which meant the
 * property received nothing at all unless React hydrated — Google's tag
 * connection test never hydrates far enough, so it reported no data. GA4's
 * Enhanced measurement ("Page changes based on browser history events", on for
 * this stream) covers App Router navigations, which are history pushes.
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
gtag('config',${JSON.stringify(GA_MEASUREMENT_ID)});
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
      {/* A plain <script async>, not next/script. In the App Router,
          strategy="afterInteractive" leaves only a <link rel="preload"> in the
          server HTML and injects the real tag after hydration, so anything that
          reads the page without running the React bundle — Google's tag
          connection test, Tag Assistant's fetch, most verification crawlers —
          sees no Google tag. React hoists this to <head> and de-duplicates it. */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
    </>
  );
}
