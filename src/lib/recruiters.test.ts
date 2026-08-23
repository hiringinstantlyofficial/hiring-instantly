import { describe, expect, it } from "vitest";

import {
  domainFromWebsite,
  domainsMatch,
  freeEmailDomain,
} from "@/lib/recruiters";

describe("freeEmailDomain", () => {
  it("flags the major free providers", () => {
    expect(freeEmailDomain("gmail.com")).toBe(true);
    expect(freeEmailDomain("yahoo.co.in")).toBe(true);
    expect(freeEmailDomain("rediffmail.com")).toBe(true);
    expect(freeEmailDomain("outlook.com")).toBe(true);
    expect(freeEmailDomain("proton.me")).toBe(true);
  });

  it("is case- and whitespace-insensitive", () => {
    expect(freeEmailDomain(" GMail.com ")).toBe(true);
  });

  it("does not flag near-misses — matching is exact", () => {
    // Nobody's provider, and treating it as free would mislabel a corporate
    // domain that merely resembles one.
    expect(freeEmailDomain("gmail.co.in")).toBe(false);
    // A corporate mail subdomain is corporate, not free.
    expect(freeEmailDomain("mail.acme.com")).toBe(false);
    expect(freeEmailDomain("acme.com")).toBe(false);
  });

  it("treats a missing domain as not-free rather than throwing", () => {
    expect(freeEmailDomain(null)).toBe(false);
    expect(freeEmailDomain("")).toBe(false);
  });
});

describe("domainFromWebsite", () => {
  it("extracts the host from a full URL", () => {
    expect(domainFromWebsite("https://acme.com")).toBe("acme.com");
    expect(domainFromWebsite("http://acme.com")).toBe("acme.com");
  });

  it("strips www. and lowercases", () => {
    expect(domainFromWebsite("https://WWW.Acme.COM")).toBe("acme.com");
  });

  it("drops paths, query strings and ports", () => {
    expect(domainFromWebsite("https://acme.com/careers?ref=x")).toBe("acme.com");
    expect(domainFromWebsite("https://acme.com:8443/jobs")).toBe("acme.com");
  });

  it("accepts a bare domain with no scheme", () => {
    expect(domainFromWebsite("acme.com")).toBe("acme.com");
    expect(domainFromWebsite("www.acme.in/about")).toBe("acme.in");
  });

  it("keeps a real subdomain — careers.acme.com is not acme.com", () => {
    expect(domainFromWebsite("https://careers.acme.com")).toBe(
      "careers.acme.com",
    );
  });

  it("returns null for garbage and non-domains", () => {
    expect(domainFromWebsite("not a url")).toBeNull();
    expect(domainFromWebsite("localhost")).toBeNull();
    expect(domainFromWebsite("")).toBeNull();
    expect(domainFromWebsite(null)).toBeNull();
  });
});

describe("domainsMatch", () => {
  it("matches a corporate email against the company site", () => {
    expect(domainsMatch("acme.com", "acme.com")).toBe(true);
  });

  it("never matches a free provider — that carve-out is the whole point", () => {
    // Even if a company's website were somehow gmail.com, a Gmail address
    // proves nothing about ownership.
    expect(domainsMatch("gmail.com", "gmail.com")).toBe(false);
  });

  it("does not match across different domains", () => {
    expect(domainsMatch("acme.com", "acme.in")).toBe(false);
    expect(domainsMatch(null, "acme.com")).toBe(false);
    expect(domainsMatch("acme.com", null)).toBe(false);
  });
});
