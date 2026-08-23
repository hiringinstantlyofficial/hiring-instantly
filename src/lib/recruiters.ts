import type { SupabaseClient } from "@supabase/supabase-js";

import { captureError } from "@/lib/observability";
import type { Database } from "@/types/database";
import type { CompanyRef } from "@/types/company";
import type { JobWithCompany } from "@/types/job";
import type { CompanyMember, Recruiter } from "@/types/recruiter";
import type { JobReviewEvent } from "@/types/review";

/**
 * Reads for the employer portal.
 *
 * Unlike lib/companies.ts these are all per-user — the caller's own session is
 * what authorises seeing a draft or a pending row — so there is no
 * unstable_cache anywhere here, and the Supabase client is a *parameter*
 * rather than created inside: the same helpers serve Server Components (with
 * the cookie-bound server client) and stay importable from tests and Client
 * Components without dragging next/headers along.
 */

type PortalClient = SupabaseClient<Database>;

/**
 * Domains whose ownership proves nothing about a company (D4): a match against
 * these must never auto-approve a membership, and their presence flags the
 * submission in the review queue. Exact matches only — `mail.acme.com` is a
 * corporate host and `gmail.co.in` is nobody's provider.
 */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.in",
  "ymail.com",
  "rocketmail.com",
  "outlook.com",
  "outlook.in",
  "hotmail.com",
  "hotmail.co.in",
  "live.com",
  "live.in",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "zoho.com",
  "zohomail.com",
  "zohomail.in",
  "rediffmail.com",
  "rediff.com",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "email.com",
  "yandex.com",
  "yandex.ru",
  "fastmail.com",
  "tutanota.com",
  "mailinator.com",
]);

/** True when the domain belongs to a free / throwaway email provider. */
export function freeEmailDomain(domain: string | null | undefined): boolean {
  if (!domain) return false;
  return FREE_EMAIL_DOMAINS.has(domain.trim().toLowerCase());
}

/**
 * The host a website URL points at, normalised the same way the SQL trigger
 * `companies_derive_email_domain` normalises it: lowercase, scheme and `www.`
 * stripped, path/port dropped. `null` for anything that is not plainly a
 * domain — the two sides are compared with `===`, so both must agree.
 */
export function domainFromWebsite(url: string | null | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;

  let host: string;
  try {
    host = new URL(withScheme).hostname.toLowerCase();
  } catch {
    return null;
  }

  const stripped = host.replace(/^www\./, "");
  // A bare word ("localhost", a typo) is not a domain anyone's email lives on.
  return stripped.includes(".") ? stripped : null;
}

/**
 * True when the recruiter's work-email domain is a genuine ownership proof for
 * this company: it matches the company's website host and is not a free
 * provider. This one predicate is what the D4 auto-approve hangs on.
 */
export function domainsMatch(
  recruiterDomain: string | null | undefined,
  companyDomain: string | null | undefined,
): boolean {
  if (!recruiterDomain || !companyDomain) return false;
  if (freeEmailDomain(recruiterDomain)) return false;
  return recruiterDomain.trim().toLowerCase() === companyDomain.trim().toLowerCase();
}

/* -------------------------------------------------------------------------- */
/*  Per-user reads                                                            */
/* -------------------------------------------------------------------------- */

function report(context: string, error: unknown): void {
  captureError(error, { scope: `recruiters.${context}` });
}

/** The signed-in user's recruiter profile, or null before onboarding. */
export async function getRecruiterProfile(
  supabase: PortalClient,
  userId: string,
): Promise<Recruiter | null> {
  const { data, error } = await supabase
    .from("recruiters")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    report("getRecruiterProfile", error);
    return null;
  }
  return (data as Recruiter | null) ?? null;
}

/** A membership together with the company it points at. */
export type MembershipWithCompany = CompanyMember & {
  company:
    | (CompanyRef & {
        tagline: string | null;
        cover_url: string | null;
        headquarters: string | null;
        status: string;
        email_domain: string | null;
      })
    | null;
};

/** Every company the recruiter is attached to, with the membership state. */
export async function getRecruiterMemberships(
  supabase: PortalClient,
  userId: string,
): Promise<MembershipWithCompany[]> {
  const { data, error } = await supabase
    .from("company_members")
    .select(
      "*, company:companies(id, slug, name, logo_url, website, is_verified, tagline, cover_url, headquarters, status, email_domain)",
    )
    .eq("recruiter_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    report("getRecruiterMemberships", error);
    return [];
  }
  return (data ?? []) as unknown as MembershipWithCompany[];
}

/** The recruiter's own listings, freshest edit first. */
export async function getRecruiterJobs(
  supabase: PortalClient,
  userId: string,
): Promise<JobWithCompany[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(id, slug, name, logo_url, website, is_verified)")
    .eq("submitted_by", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    report("getRecruiterJobs", error);
    return [];
  }
  return (data ?? []) as unknown as JobWithCompany[];
}

/**
 * One of the recruiter's own jobs. RLS makes "own" true by construction, but
 * the explicit filter keeps the query's intent readable and its plan indexed.
 */
export async function getRecruiterJob(
  supabase: PortalClient,
  userId: string,
  jobId: string,
): Promise<JobWithCompany | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(id, slug, name, logo_url, website, is_verified)")
    .eq("id", jobId)
    .eq("submitted_by", userId)
    .maybeSingle();

  if (error) {
    report("getRecruiterJob", error);
    return null;
  }
  return (data as unknown as JobWithCompany | null) ?? null;
}

/** The review timeline for one job, oldest first. */
export async function getJobReviewEvents(
  supabase: PortalClient,
  jobId: string,
): Promise<JobReviewEvent[]> {
  const { data, error } = await supabase
    .from("job_review_events")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) {
    report("getJobReviewEvents", error);
    return [];
  }
  return (data ?? []) as JobReviewEvent[];
}
