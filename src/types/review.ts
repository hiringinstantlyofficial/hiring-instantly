import type { Company } from "@/types/company";
import type { JobWithCompany } from "@/types/job";
import type { CompanyMember, Recruiter } from "@/types/recruiter";

export const REVIEW_ACTIONS = [
  "submitted",
  "approved",
  "changes-requested",
  "rejected",
  "resubmitted",
  "withdrawn",
] as const;
export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export const REVIEW_ACTION_LABELS: Record<ReviewAction, string> = {
  submitted: "Submitted",
  approved: "Approved",
  "changes-requested": "Changes requested",
  rejected: "Rejected",
  resubmitted: "Resubmitted",
  withdrawn: "Withdrawn",
};

/** A row of `public.job_review_events`. Type alias — see the note on `Job`. */
export type JobReviewEvent = {
  id: string;
  job_id: string;
  actor_id: string | null;
  action: ReviewAction;
  note: string | null;
  created_at: string;
};

/**
 * One auto-computed chip on a queue card. `tone` decides both the colour and
 * the queue sort: a card with any "warn" chip sorts ahead of an all-green one,
 * because warnings are what the admin's eyes are for.
 */
export interface TrustSignal {
  id:
    | "domain-verified"
    | "trusted-recruiter"
    | "free-email"
    | "first-submission"
    | "new-company"
    | "no-salary"
    | "offsite-apply"
    | "re-review";
  tone: "ok" | "warn" | "info";
  label: string;
}

/** The subset of the recruiter row the review queue renders. */
export type ReviewRecruiter = Pick<
  Recruiter,
  | "user_id"
  | "full_name"
  | "work_email"
  | "email_domain"
  | "phone"
  | "designation"
  | "linkedin_url"
  | "trust_level"
  | "status"
>;

/** A pending job with everything the queue card and preview panel need. */
export type ReviewQueueJob = JobWithCompany & {
  recruiter: ReviewRecruiter | null;
};

/** A pending join request with both ends embedded. */
export type ReviewQueueMembership = CompanyMember & {
  company: Pick<
    Company,
    "id" | "slug" | "name" | "logo_url" | "website" | "email_domain" | "status"
  > | null;
  recruiter: ReviewRecruiter | null;
};

/**
 * The discriminated union the queue renders. Companies are not a separate
 * entry: a pending company is reviewed (and activated) alongside its first
 * job, so it surfaces as the "New company" chip on that job's card.
 */
export type ReviewQueueItem =
  | { kind: "job"; job: ReviewQueueJob }
  | { kind: "membership"; membership: ReviewQueueMembership };
