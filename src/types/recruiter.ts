export const RECRUITER_STATUSES = ["pending", "active", "suspended"] as const;
export type RecruiterStatus = (typeof RECRUITER_STATUSES)[number];

export const RECRUITER_STATUS_LABELS: Record<RecruiterStatus, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
};

export const TRUST_LEVELS = ["new", "known", "trusted"] as const;
export type TrustLevel = (typeof TRUST_LEVELS)[number];

export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  new: "New",
  known: "Known",
  trusted: "Trusted",
};

export const MEMBERSHIP_STATUSES = ["pending", "approved", "rejected"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  pending: "Verification pending",
  approved: "Verified",
  rejected: "Declined",
};

export const MEMBERSHIP_ROLES = ["owner", "member"] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const APPROVED_VIA = ["domain-match", "admin", "owner"] as const;
export type ApprovedVia = (typeof APPROVED_VIA)[number];

/**
 * A row of `public.recruiters`, exactly as it comes back from Supabase.
 *
 * A type alias rather than an interface, for the same reason as `Job`:
 * supabase-js constrains table rows to `Record<string, unknown>`, and only
 * type aliases get TypeScript's implicit index signature. As an interface this
 * silently resolves every query to `never`.
 */
export type Recruiter = {
  user_id: string;
  full_name: string;
  /** Verified by the magic link; pinned to the auth email by a trigger. */
  work_email: string;
  /**
   * Private by design: read only through the admin-gated policy, shown in the
   * review panel as a tel: link, never rendered publicly.
   */
  phone: string;
  designation: string | null;
  linkedin_url: string | null;
  status: RecruiterStatus;
  trust_level: TrustLevel;
  /** Generated column: lower(host of work_email). Drives the D4 auto-approve. */
  email_domain: string;
  created_at: string;
  updated_at: string;
};

/** Fields the onboarding form writes. Everything else is server-managed. */
export type RecruiterInput = Pick<
  Recruiter,
  "full_name" | "phone" | "designation" | "linkedin_url"
>;

/** A row of `public.company_members`. */
export type CompanyMember = {
  id: string;
  company_id: string;
  recruiter_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  approved_via: ApprovedVia | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};
