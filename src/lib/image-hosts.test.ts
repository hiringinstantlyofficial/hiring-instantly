import { describe, expect, it } from "vitest";

import { isOptimizableImage } from "@/lib/image-hosts";

// Hosts come from vitest.config.ts: the Supabase project is
// test-project.supabase.co, plus cdn.example.com and logos.example.org.

describe("isOptimizableImage", () => {
  it("allows public objects in the project's Supabase Storage bucket", () => {
    expect(
      isOptimizableImage(
        "https://test-project.supabase.co/storage/v1/object/public/company-logos/acme.png",
      ),
    ).toBe(true);
  });

  it("rejects non-public paths on the Supabase host", () => {
    expect(
      isOptimizableImage(
        "https://test-project.supabase.co/rest/v1/jobs?select=*",
      ),
    ).toBe(false);
  });

  it("allows explicitly allowlisted hosts", () => {
    expect(isOptimizableImage("https://cdn.example.com/logo.png")).toBe(true);
    expect(isOptimizableImage("https://logos.example.org/a/b.svg")).toBe(true);
  });

  it("is case-insensitive about the host", () => {
    expect(isOptimizableImage("https://CDN.EXAMPLE.COM/logo.png")).toBe(true);
  });

  // The point of the change: the optimiser must not be reachable for arbitrary
  // URLs, or it becomes an open image proxy and an SSRF primitive.
  it("rejects arbitrary hosts", () => {
    expect(isOptimizableImage("https://evil.example/huge.png")).toBe(false);
    expect(isOptimizableImage("https://169.254.169.254/latest/meta-data")).toBe(
      false,
    );
  });

  it("rejects a subdomain of an allowlisted host", () => {
    expect(isOptimizableImage("https://evil.cdn.example.com/logo.png")).toBe(
      false,
    );
  });

  it("rejects non-https and unparseable URLs", () => {
    expect(isOptimizableImage("http://cdn.example.com/logo.png")).toBe(false);
    expect(isOptimizableImage("data:image/png;base64,iVBOR")).toBe(false);
    expect(isOptimizableImage("not a url")).toBe(false);
    expect(isOptimizableImage("")).toBe(false);
  });
});
