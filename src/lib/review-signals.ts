import { domainsMatch, freeEmailDomain, domainFromWebsite } from "@/lib/recruiters";
import type { TrustSignal } from "@/types/review";

/**
 * The auto-computed trust chips on a review-queue card (§7 of the plan).
 *
 * Pure functions over plain shapes, deliberately: these rules decide which
 * submissions the admin skims and which they scrutinise, so an inverted
 * condition here would quietly turn a warning into a green tick. The unit
 * tests in review-signals.test.ts pin each rule down.
 */

/** Hosts that are someone's ATS, not the employer's own site. */
const KNOWN_ATS_HOSTS = [
  "greenhouse.io",
  "lever.co",
  "myworkdayjobs.com",
  "workable.com",
  "smartrecruiters.com",
  "ashbyhq.com",
  "bamboohr.com",
  "jobvite.com",
  "icims.com",
  "zohorecruit.com",
  "zohorecruit.in",
  "keka.com",
  "darwinbox.com",
  "darwinbox.in",
  "freshteam.com",
  "skillate.com",
  "turing.com",
  "instahyre.com",
  "naukri.com",
  "linkedin.com",
  "wellfound.com",
];

/** True for `boards.greenhouse.io` as well as `greenhouse.io` itself. */
function isKnownAtsHost(host: string): boolean {
  return KNOWN_ATS_HOSTS.some(
    (ats) => host === ats || host.endsWith(`.${ats}`),
  );
}

export interface ReviewSignalInput {
  recruiter: {
    email_domain: string | null;
    trust_level: string;
    /** Whether this recruiter has any previously approved listing. */
    hasApprovedJob: boolean;
  };
  company: {
    status: string;
    email_domain: string | null;
    website: string | null;
  } | null;
  job: {
    salary_min: number | null;
    salary_max: number | null;
    application_url: string | null;
    approved_snapshot: Record<string, unknown> | null;
  };
}

export function trustSignals(input: ReviewSignalInput): TrustSignal[] {
  const { recruiter, company, job } = input;
  const signals: TrustSignal[] = [];

  // Re-review first: this chip changes what the preview panel opens on.
  if (job.approved_snapshot !== null) {
    signals.push({ id: "re-review", tone: "info", label: "Re-review" });
  }

  if (domainsMatch(recruiter.email_domain, company?.email_domain)) {
    signals.push({ id: "domain-verified", tone: "ok", label: "Domain verified" });
  }

  if (recruiter.trust_level === "trusted") {
    signals.push({
      id: "trusted-recruiter",
      tone: "ok",
      label: "5 approved before",
    });
  }

  if (freeEmailDomain(recruiter.email_domain)) {
    signals.push({ id: "free-email", tone: "warn", label: "Free email" });
  }

  if (!recruiter.hasApprovedJob) {
    signals.push({
      id: "first-submission",
      tone: "warn",
      label: "First submission",
    });
  }

  if (company?.status === "pending") {
    signals.push({ id: "new-company", tone: "warn", label: "New company" });
  }

  if (job.salary_min === null && job.salary_max === null) {
    signals.push({ id: "no-salary", tone: "warn", label: "No salary" });
  }

  // Off-site apply: the URL's host is neither the company's own site nor a
  // known ATS. An unknown third-party host is where "apply" turns into a
  // phishing form, so it earns a warning.
  if (job.application_url) {
    const applyHost = domainFromWebsite(job.application_url);
    const companyHost =
      company?.email_domain ?? domainFromWebsite(company?.website);

    const onCompanySite =
      applyHost !== null &&
      companyHost !== null &&
      (applyHost === companyHost || applyHost.endsWith(`.${companyHost}`));

    if (applyHost !== null && !onCompanySite && !isKnownAtsHost(applyHost)) {
      signals.push({ id: "offsite-apply", tone: "warn", label: "Off-site apply" });
    }
  }

  return signals;
}

/**
 * Queue order: risk first, not time first (§7). Higher = riskier. Warnings
 * add, green ticks subtract, and a trusted recruiter sinks to the bottom.
 * Time is the caller's tiebreaker.
 */
export function riskScore(signals: TrustSignal[]): number {
  let score = 0;
  for (const signal of signals) {
    if (signal.tone === "warn") score += 2;
    if (signal.id === "domain-verified") score -= 1;
    if (signal.id === "trusted-recruiter") score -= 3;
  }
  return score;
}
