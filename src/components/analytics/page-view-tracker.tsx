"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { GA_MEASUREMENT_ID, isAnalyticsEnabled } from "@/lib/analytics";

/**
 * Sends one GA4 `page_view` per App Router navigation.
 *
 * Client-side navigation never reloads the document, so gtag.js's own initial
 * page view fires once and then nothing — hence `send_page_view: false` in the
 * config and explicit events here. The effect also runs on mount, which covers
 * the first page of a visit.
 *
 * IMPORTANT: turn off **Enhanced measurement → Page changes based on browser
 * history events** in the GA4 admin (Admin → Data streams → your stream). That
 * setting fires its own `page_view` on history changes and would double-count
 * every navigation against the events sent here.
 *
 * `window.gtag` is defined by the inline bootstrap in <GoogleAnalytics/>, which
 * runs during HTML parse — well before this effect — so events queue on
 * `dataLayer` and are picked up when gtag.js finishes loading. Nothing is lost
 * if the network is slow.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAnalyticsEnabled) return;

    const gtag = window.gtag;
    if (typeof gtag !== "function") return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    gtag("event", "page_view", {
      send_to: GA_MEASUREMENT_ID,
      page_path: path,
      page_location: `${window.location.origin}${path}`,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
