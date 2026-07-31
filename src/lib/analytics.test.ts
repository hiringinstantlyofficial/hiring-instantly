import { describe, expect, it } from "vitest";

import { CONSENT_REQUIRED_REGIONS, parseMeasurementId } from "@/lib/analytics";

/*
 * A misconfigured measurement ID fails silently — the tag loads, reports nothing,
 * and the gap is only noticed when someone opens GA4 weeks later. Since the
 * whole point of installing early is to have history by the time AdSense
 * reviews the site, that gap is expensive.
 */
describe("parseMeasurementId", () => {
  it("accepts a GA4 measurement ID", () => {
    expect(parseMeasurementId("G-ABC1234567")).toBe("G-ABC1234567");
    expect(parseMeasurementId("G-XXXXXX")).toBe("G-XXXXXX");
  });

  it("tolerates surrounding whitespace from a pasted value", () => {
    expect(parseMeasurementId("  G-ABC1234567 \n")).toBe("G-ABC1234567");
  });

  it("rejects the ID formats people paste by mistake", () => {
    // Universal Analytics property, retired but still in old documentation.
    expect(parseMeasurementId("UA-12345678-1")).toBe("");
    // Tag Manager container, which needs an entirely different embed.
    expect(parseMeasurementId("GTM-ABC1234")).toBe("");
    // AdSense publisher ID, easy to confuse while setting both up at once.
    expect(parseMeasurementId("ca-pub-1234567890123456")).toBe("");
    // A GA4 *stream* or measurement protocol secret, not the measurement ID.
    expect(parseMeasurementId("1234567890")).toBe("");
  });

  it("rejects malformed and empty values", () => {
    expect(parseMeasurementId(undefined)).toBe("");
    expect(parseMeasurementId("")).toBe("");
    expect(parseMeasurementId("   ")).toBe("");
    expect(parseMeasurementId("G-")).toBe("");
    expect(parseMeasurementId("G-SHORT")).toBe("");
    expect(parseMeasurementId("g-abc1234567")).toBe("");
    expect(parseMeasurementId("G-ABC 1234567")).toBe("");
  });

  it("rejects anything that could break out of the inline script literal", () => {
    // The ID is interpolated into the Consent Mode bootstrap. JSON.stringify is
    // the actual defence there, but nothing hostile should get that far.
    expect(parseMeasurementId("G-ABC123','x');alert(1);//")).toBe("");
    expect(parseMeasurementId("G-ABC123</script>")).toBe("");
  });
});

describe("CONSENT_REQUIRED_REGIONS", () => {
  it("uses two-letter uppercase country codes, as Consent Mode expects", () => {
    for (const region of CONSENT_REQUIRED_REGIONS) {
      expect(region, region).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("lists no duplicates", () => {
    expect(new Set(CONSENT_REQUIRED_REGIONS).size).toBe(
      CONSENT_REQUIRED_REGIONS.length,
    );
  });

  it("covers the EEA, the UK and Switzerland", () => {
    // 27 EU + IS/LI/NO + GB + CH.
    expect(CONSENT_REQUIRED_REGIONS).toHaveLength(32);

    for (const required of ["DE", "FR", "IE", "IS", "LI", "NO", "GB", "CH"]) {
      expect(CONSENT_REQUIRED_REGIONS).toContain(required);
    }
  });

  it("does not deny consent outside those regions", () => {
    // India is the site's primary market; denying storage there by default would
    // silently halve the analytics data the AdSense application depends on.
    expect(CONSENT_REQUIRED_REGIONS).not.toContain("IN");
    expect(CONSENT_REQUIRED_REGIONS).not.toContain("US");
  });
});
