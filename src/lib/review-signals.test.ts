import { describe, expect, it } from "vitest";

import { riskScore, trustSignals, type ReviewSignalInput } from "@/lib/review-signals";

/** A clean, unremarkable submission: corporate email, active company, salary. */
function baseInput(overrides: Partial<ReviewSignalInput> = {}): ReviewSignalInput {
  return {
    recruiter: {
      email_domain: "acme.com",
      trust_level: "new",
      hasApprovedJob: true,
    },
    company: {
      status: "active",
      email_domain: "acme.com",
      website: "https://acme.com",
    },
    job: {
      salary_min: 600000,
      salary_max: 1200000,
      application_url: "https://acme.com/careers/123",
      approved_snapshot: null,
    },
    ...overrides,
  };
}

const ids = (input: ReviewSignalInput) => trustSignals(input).map((s) => s.id);

describe("trustSignals", () => {
  it("marks a matching corporate domain as verified", () => {
    expect(ids(baseInput())).toContain("domain-verified");
  });

  it("never domain-verifies a free email, even when the hosts match", () => {
    const input = baseInput({
      recruiter: { email_domain: "gmail.com", trust_level: "new", hasApprovedJob: true },
      company: { status: "active", email_domain: "gmail.com", website: null },
    });
    const result = ids(input);
    expect(result).not.toContain("domain-verified");
    expect(result).toContain("free-email");
  });

  it("warns on a first submission and clears once one is approved", () => {
    const first = baseInput({
      recruiter: { email_domain: "acme.com", trust_level: "new", hasApprovedJob: false },
    });
    expect(ids(first)).toContain("first-submission");
    expect(ids(baseInput())).not.toContain("first-submission");
  });

  it("warns on a pending company", () => {
    const input = baseInput({
      company: { status: "pending", email_domain: "acme.com", website: null },
    });
    expect(ids(input)).toContain("new-company");
  });

  it("warns when both salary bounds are missing, not when one is set", () => {
    const none = baseInput();
    none.job = { ...none.job, salary_min: null, salary_max: null };
    expect(ids(none)).toContain("no-salary");

    const oneBound = baseInput();
    oneBound.job = { ...oneBound.job, salary_min: null, salary_max: 900000 };
    expect(ids(oneBound)).not.toContain("no-salary");
  });

  it("flags an apply URL on an unknown third-party host", () => {
    const offsite = baseInput();
    offsite.job = { ...offsite.job, application_url: "https://bit.ly/abc" };
    expect(ids(offsite)).toContain("offsite-apply");
  });

  it("does not flag the company's own site or a known ATS", () => {
    const own = baseInput();
    own.job = { ...own.job, application_url: "https://careers.acme.com/role/1" };
    expect(ids(own)).not.toContain("offsite-apply");

    const ats = baseInput();
    ats.job = { ...ats.job, application_url: "https://boards.greenhouse.io/acme/1" };
    expect(ids(ats)).not.toContain("offsite-apply");
  });

  it("marks a re-review when an approved snapshot exists", () => {
    const rereview = baseInput();
    rereview.job = { ...rereview.job, approved_snapshot: { title: "Old" } };
    expect(ids(rereview)).toContain("re-review");
  });

  it("marks a trusted recruiter", () => {
    const trusted = baseInput({
      recruiter: { email_domain: "acme.com", trust_level: "trusted", hasApprovedJob: true },
    });
    expect(ids(trusted)).toContain("trusted-recruiter");
  });
});

describe("riskScore", () => {
  it("sorts warning-laden submissions above clean ones", () => {
    const risky = trustSignals(
      baseInput({
        recruiter: { email_domain: "gmail.com", trust_level: "new", hasApprovedJob: false },
        company: { status: "pending", email_domain: null, website: null },
      }),
    );
    const clean = trustSignals(baseInput());
    expect(riskScore(risky)).toBeGreaterThan(riskScore(clean));
  });

  it("sinks a trusted recruiter below a merely clean one", () => {
    const trusted = trustSignals(
      baseInput({
        recruiter: { email_domain: "acme.com", trust_level: "trusted", hasApprovedJob: true },
      }),
    );
    const clean = trustSignals(baseInput());
    expect(riskScore(trusted)).toBeLessThan(riskScore(clean));
  });
});
