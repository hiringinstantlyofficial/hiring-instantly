/** A GA4 measurement ID, as opposed to a Universal Analytics or GTM container ID. */
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,}$/;

/**
 * Normalises the configured measurement ID, returning "" for anything unusable.
 *
 * Pulled out as a pure function because the failure it guards against is silent:
 * a pasted `UA-…` property or `GTM-…` container looks plausible in the
 * environment, loads a script that never reports, and is only noticed weeks
 * later when the reports are empty.
 */
export function parseMeasurementId(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? "";
  return MEASUREMENT_ID_PATTERN.test(trimmed) ? trimmed : "";
}

const rawMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

export const GA_MEASUREMENT_ID = parseMeasurementId(rawMeasurementId);

/**
 * Analytics loads only in a production build with a valid measurement ID, so
 * `next dev` never writes to the property.
 *
 * Note that Vercel preview deployments are also NODE_ENV=production: leave
 * NEXT_PUBLIC_GA_MEASUREMENT_ID unset on the preview environment if you do not
 * want preview traffic mixed into your reports.
 */
export const isAnalyticsEnabled =
  GA_MEASUREMENT_ID !== "" && process.env.NODE_ENV === "production";

// Server-side only: this module is in the client bundle too, and there is no
// reason to put a configuration warning in every visitor's console.
if (
  typeof window === "undefined" &&
  rawMeasurementId !== "" &&
  GA_MEASUREMENT_ID === ""
) {
  console.warn(
    `[analytics] NEXT_PUBLIC_GA_MEASUREMENT_ID is set to "${rawMeasurementId}", ` +
      "which is not a GA4 measurement ID. It must look like G-XXXXXXXXXX — a " +
      "UA-… property or a GTM-… container will not work here. Analytics is " +
      "disabled until this is corrected.",
  );
}

/**
 * EEA, UK and Switzerland.
 *
 * Google's EU user consent policy requires consent before analytics or
 * advertising cookies are set for visitors in these regions, and our privacy
 * policy states that this is what happens. Consent Mode defaults them to
 * `denied`, so GA4 sends cookieless pings until a consent tool calls
 * `gtag('consent', 'update', …)`.
 */
export const CONSENT_REQUIRED_REGIONS = [
  // EU 27
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
  "SE", "SI", "SK",
  // Rest of the EEA
  "IS", "LI", "NO",
  // United Kingdom and Switzerland
  "GB", "CH",
] as const;
