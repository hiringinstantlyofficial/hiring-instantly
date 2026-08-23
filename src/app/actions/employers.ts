"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { revalidateJobPaths } from "@/app/actions/admin";
import {
  adminNotificationAddress,
  newSubmissionAdminEmail,
  sendEmail,
  submissionReceivedEmail,
} from "@/lib/email";
import type { FormState } from "@/lib/form-state";
import { captureError } from "@/lib/observability";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { domainsMatch, getRecruiterProfile } from "@/lib/recruiters";
import { absoluteUrl } from "@/lib/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import {
  companyClaimSchema,
  magicLinkSchema,
  recruiterCompanySchema,
  recruiterJobFormSchema,
  recruiterProfileSchema,
} from "@/lib/validations";
import type { MembershipStatus, Recruiter } from "@/types/recruiter";

/*
 * Employer-portal Server Actions.
 *
 * A Server Action is a public HTTP endpoint (see the note in actions/jobs.ts),
 * so every function here re-validates its input with zod and re-resolves the
 * caller from the session cookie. Authorisation is then double-checked by RLS
 * and the database triggers — a forged payload cannot set a status, feature a
 * listing or approve its own membership even if a bug here let it through.
 */

/** Uniform result shape for the mutations the portal UI calls directly. */
export interface ActionResult<T = undefined> {
  ok: boolean;
  message?: string;
  /** Field-level errors keyed by input name, for form actions. */
  errors?: Record<string, string>;
  data?: T;
}

function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}

/** The signed-in, active recruiter, or null. */
async function requireRecruiter(): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  recruiter: Recruiter;
} | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const recruiter = await getRecruiterProfile(supabase, user.id);
  if (!recruiter || recruiter.status !== "active") return null;

  return { supabase, recruiter };
}

/* -------------------------------------------------------------------------- */
/*  Sign in                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Sends the magic link. `shouldCreateUser: true` makes this sign-up and
 * sign-in in one call — there is no separate registration form at all (D1).
 */
export async function requestMagicLink(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  // Honeypot tripped — behave like a success so bots don't learn anything.
  if (parsed.data.website) {
    return { status: "success", message: "Check your inbox for the link." };
  }

  const email = parsed.data.email.toLowerCase();
  const requestHeaders = await headers();

  const [byEmail, byIp] = await Promise.all([
    rateLimit(`magic-link:email:${email}`, {
      limit: 3,
      windowMs: 60 * 60 * 1000,
    }),
    rateLimit(`magic-link:ip:${clientIpFrom(requestHeaders)}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    }),
  ]);

  if (!byEmail.allowed || !byIp.allowed) {
    const wait = Math.max(byEmail.retryAfterSeconds, byIp.retryAfterSeconds);
    return {
      status: "error",
      message: `Too many link requests. Try again in ${Math.max(1, Math.ceil(wait / 60))} minute(s).`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: absoluteUrl("/auth/callback?next=/employers"),
    },
  });

  if (error) {
    captureError(error, { scope: "employers.requestMagicLink" });
    return {
      status: "error",
      message: "We couldn't send the link just now. Please try again shortly.",
    };
  }

  return { status: "success", message: "Check your inbox for the link." };
}

/* -------------------------------------------------------------------------- */
/*  Onboarding                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Journey A step 1: writes the recruiter profile. The work email is taken from
 * the verified session, never from the form — and a trigger pins it besides.
 */
export async function completeOnboarding(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = recruiterProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    designation: formData.get("designation"),
    linkedin_url: formData.get("linkedin_url"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: zodFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/employers/login");
  }

  const { error } = await supabase.from("recruiters").upsert({
    user_id: user.id,
    work_email: user.email.toLowerCase(),
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    designation: parsed.data.designation,
    linkedin_url: parsed.data.linkedin_url,
  });

  if (error) {
    captureError(error, { scope: "employers.completeOnboarding" });
    return {
      status: "error",
      message: "We couldn't save your details. Please try again.",
    };
  }

  redirect("/employers/company/new");
}

/* -------------------------------------------------------------------------- */
/*  Companies: create or claim (D4)                                           */
/* -------------------------------------------------------------------------- */

/**
 * Creates a pending company and makes the recruiter its owner. The trigger
 * forces status = 'pending', so the row is publicly invisible until an admin
 * approves the first job attached to it; the owner membership is what lets
 * step 2 of the wizard upload branding against the real id (D5).
 */
export async function createCompany(
  values: unknown,
): Promise<ActionResult<{ companyId: string; slug: string }>> {
  const auth = await requireRecruiter();
  if (!auth) return { ok: false, message: "Sign in to continue." };

  const parsed = recruiterCompanySchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: zodFieldErrors(parsed.error.issues),
    };
  }

  const limit = await rateLimit(`create-company:${auth.recruiter.user_id}`, {
    limit: 1,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return {
      ok: false,
      message:
        "You can add one new company per day. If you manage several, contact us and we'll set them up.",
    };
  }

  const baseSlug = slugify(parsed.data.name) || "company";

  // Two tries: the plain slug, then one with a short suffix. A recruiter
  // re-creating an existing company usually means they should claim it
  // instead, which is what the error message says.
  for (const slug of [baseSlug, `${baseSlug}-${crypto.randomUUID().slice(0, 4)}`]) {
    const { data, error } = await auth.supabase
      .from("companies")
      .insert({
        slug,
        name: parsed.data.name,
        website: parsed.data.website,
        linkedin_url: parsed.data.linkedin_url,
        tagline: parsed.data.tagline,
        description: parsed.data.description,
        industry: parsed.data.industry,
        headquarters: parsed.data.headquarters,
        founded_year: parsed.data.founded_year,
        size_range: parsed.data.size_range,
        status: "pending",
      })
      .select("id, slug")
      .single();

    if (!error && data) {
      // The owner membership is a server-granted fact, so it goes through the
      // service-role client — RLS deliberately only lets a recruiter insert
      // *pending* memberships (no self-approval path).
      try {
        const admin = createSupabaseAdminClient();
        const { error: memberError } = await admin.from("company_members").insert({
          company_id: data.id,
          recruiter_id: auth.recruiter.user_id,
          role: "owner",
          status: "approved",
          approved_via: "owner",
        });
        if (memberError) throw memberError;
      } catch (memberError) {
        captureError(memberError, { scope: "employers.createCompany.member" });
        return {
          ok: false,
          message: "We couldn't finish setting up the company. Please try again.",
        };
      }

      return { ok: true, data: { companyId: data.id, slug: data.slug } };
    }

    if (error && error.code !== "23505") {
      captureError(error, { scope: "employers.createCompany" });
      return { ok: false, message: error.message };
    }

    // 23505 on the *name* means the company exists — claiming is the answer.
    if (error?.message.includes("companies_name_lower_idx")) {
      return {
        ok: false,
        message:
          "A company with that name is already on the board. Search for it and request access instead.",
      };
    }
  }

  return {
    ok: false,
    message: "That company name is already in use. Search for it and request access instead.",
  };
}

/**
 * Requests to act for an existing company. Auto-approved when the recruiter's
 * work-email domain matches the company's website host and is not a free
 * provider — a genuine ownership proof (D4). Otherwise the membership sits
 * pending: they can post jobs right away, but not touch the profile.
 */
export async function claimCompany(
  values: unknown,
): Promise<ActionResult<{ status: MembershipStatus }>> {
  const auth = await requireRecruiter();
  if (!auth) return { ok: false, message: "Sign in to continue." };

  const parsed = companyClaimSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Pick a company first." };

  const admin = createSupabaseAdminClient();

  // A recruiter fanning out across many companies is a signal, not a feature.
  const { count: pendingCount } = await admin
    .from("company_members")
    .select("id", { count: "exact", head: true })
    .eq("recruiter_id", auth.recruiter.user_id)
    .eq("status", "pending");

  if ((pendingCount ?? 0) >= 5) {
    return {
      ok: false,
      message:
        "You already have 5 access requests waiting for review. We'll get to them shortly.",
    };
  }

  const { data: company, error: companyError } = await admin
    .from("companies")
    .select("id, name, status, email_domain")
    .eq("id", parsed.data.company_id)
    .maybeSingle();

  if (companyError || !company || company.status !== "active") {
    return { ok: false, message: "That company isn't available to join." };
  }

  const { data: existing } = await auth.supabase
    .from("company_members")
    .select("id, status")
    .eq("company_id", company.id)
    .eq("recruiter_id", auth.recruiter.user_id)
    .maybeSingle();

  if (existing) {
    return { ok: true, data: { status: existing.status as MembershipStatus } };
  }

  if (domainsMatch(auth.recruiter.email_domain, company.email_domain)) {
    const { error } = await admin.from("company_members").insert({
      company_id: company.id,
      recruiter_id: auth.recruiter.user_id,
      role: "member",
      status: "approved",
      approved_via: "domain-match",
    });
    if (error) {
      captureError(error, { scope: "employers.claimCompany.autoApprove" });
      return { ok: false, message: "Something went wrong. Please try again." };
    }
    return { ok: true, data: { status: "approved" } };
  }

  // No proof — a pending row, written as the recruiter so RLS enforces that
  // pending is the only state they can create.
  const { error } = await auth.supabase.from("company_members").insert({
    company_id: company.id,
    recruiter_id: auth.recruiter.user_id,
    role: "member",
    status: "pending",
  });

  if (error) {
    captureError(error, { scope: "employers.claimCompany" });
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  return { ok: true, data: { status: "pending" } };
}

/* -------------------------------------------------------------------------- */
/*  Job submission                                                            */
/* -------------------------------------------------------------------------- */

export interface SubmitJobOptions {
  /** Present when editing an existing listing. */
  jobId?: string;
  /** "draft" saves privately; "submit" queues it for review. */
  intent: "draft" | "submit";
}

/**
 * Creates or updates a recruiter listing. The database trigger — not this
 * function — is what guarantees the row lands on 'draft'/'pending' with the
 * editorial columns pinned; this function's job is validation, rate limiting,
 * slugging, the audit event and the notification emails.
 */
export async function submitJobForReview(
  values: unknown,
  options: SubmitJobOptions,
): Promise<ActionResult<{ jobId: string }>> {
  const auth = await requireRecruiter();
  if (!auth) return { ok: false, message: "Sign in to continue." };

  const parsed = recruiterJobFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: zodFieldErrors(parsed.error.issues),
    };
  }

  if (options.intent === "submit") {
    const limit = await rateLimit(`submit-job:${auth.recruiter.user_id}`, {
      limit: 5,
      windowMs: 24 * 60 * 60 * 1000,
    });
    if (!limit.allowed) {
      return {
        ok: false,
        message:
          "You've submitted 5 listings today — that's the daily limit while your account is new.",
      };
    }
  }

  const fields = {
    title: parsed.data.title,
    company_id: parsed.data.company_id,
    location: parsed.data.location,
    job_type: parsed.data.job_type,
    categories: parsed.data.categories,
    experience_level: parsed.data.experience_level,
    job_level: parsed.data.job_level,
    min_experience_years: parsed.data.min_experience_years,
    salary_min: parsed.data.salary_min,
    salary_max: parsed.data.salary_max,
    salary_currency: parsed.data.salary_currency,
    description: parsed.data.description,
    responsibilities: parsed.data.responsibilities,
    requirements: parsed.data.requirements,
    nice_to_haves: parsed.data.nice_to_haves,
    skills: parsed.data.skills,
    benefits: parsed.data.benefits,
    application_url: parsed.data.application_url,
    application_email: parsed.data.application_email,
    application_phone: parsed.data.application_phone,
    status: options.intent === "draft" ? ("draft" as const) : ("pending" as const),
  };

  let jobId = options.jobId ?? null;
  let resubmission = false;
  let cameOffTheLiveSite: { slug: string; companySlug?: string } | null = null;

  if (jobId) {
    const { data: existing, error: readError } = await auth.supabase
      .from("jobs")
      .select("id, slug, status, approved_snapshot, company:companies(slug)")
      .eq("id", jobId)
      .eq("submitted_by", auth.recruiter.user_id)
      .maybeSingle();

    if (readError || !existing) {
      return { ok: false, message: "That listing no longer exists." };
    }

    // A listing that has entered review only moves forward: "save draft" on a
    // pending or live listing would be a silent withdrawal, not a save.
    if (options.intent === "draft" && existing.status !== "draft") {
      return {
        ok: false,
        message:
          "This listing has already been submitted — resubmit it for review instead of saving a draft.",
      };
    }

    resubmission =
      existing.status === "rejected" || existing.approved_snapshot !== null;
    if (existing.status === "active") {
      cameOffTheLiveSite = {
        slug: existing.slug,
        companySlug: (existing.company as { slug: string } | null)?.slug,
      };
    }

    const { error } = await auth.supabase
      .from("jobs")
      .update(fields)
      .eq("id", jobId);

    if (error) {
      captureError(error, { scope: "employers.submitJob.update" });
      return { ok: false, message: error.message };
    }
  } else {
    const baseSlug = slugify(parsed.data.title) || "job";

    let inserted: { id: string } | null = null;
    for (const slug of [
      baseSlug,
      `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`,
    ]) {
      const { data, error } = await auth.supabase
        .from("jobs")
        .insert({ ...fields, slug })
        .select("id")
        .single();

      if (!error && data) {
        inserted = data;
        break;
      }
      if (error && error.code !== "23505") {
        captureError(error, { scope: "employers.submitJob.insert" });
        return { ok: false, message: error.message };
      }
    }

    if (!inserted) {
      return { ok: false, message: "Couldn't save the listing. Please try again." };
    }
    jobId = inserted.id;
  }

  if (options.intent === "submit") {
    await recordSubmission(jobId, auth.recruiter, resubmission);
  }

  // Editing a live listing pulls it back to 'pending' (D3), which is a change
  // to the public site — flush the caches so it drops off /jobs promptly
  // rather than waiting out the revalidate window.
  if (cameOffTheLiveSite) {
    await revalidateJobPaths(
      cameOffTheLiveSite.slug,
      cameOffTheLiveSite.companySlug,
    );
  }

  return { ok: true, data: { jobId } };
}

/** The audit event plus both notification emails. All best-effort. */
async function recordSubmission(
  jobId: string,
  recruiter: Recruiter,
  resubmission: boolean,
): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();

    await admin.from("job_review_events").insert({
      job_id: jobId,
      actor_id: recruiter.user_id,
      action: resubmission ? "resubmitted" : "submitted",
    });

    const { data: job } = await admin
      .from("jobs")
      .select("title, company_name")
      .eq("id", jobId)
      .maybeSingle();
    if (!job) return;

    await sendEmail({
      to: recruiter.work_email,
      ...submissionReceivedEmail({
        recruiterName: recruiter.full_name,
        jobTitle: job.title,
        companyName: job.company_name,
      }),
    });

    // One digest per window, however many roles arrive in it — the admin's
    // badge in /admin is the real queue; this is just the nudge.
    const digest = await rateLimit("review-digest:admin", {
      limit: 1,
      windowMs: 15 * 60 * 1000,
    });
    if (digest.allowed) {
      await sendEmail({
        to: adminNotificationAddress(),
        ...newSubmissionAdminEmail({
          jobTitle: job.title,
          companyName: job.company_name,
          recruiterName: recruiter.full_name,
          emailDomain: recruiter.email_domain,
          signals: resubmission ? ["Re-review"] : [],
        }),
      });
    }
  } catch (error) {
    captureError(error, {
      scope: "employers.recordSubmission",
      severity: "warning",
    });
  }
}

/** Pulls a pending submission back to a private draft. */
export async function withdrawSubmission(
  jobId: string,
): Promise<ActionResult> {
  const auth = await requireRecruiter();
  if (!auth) return { ok: false, message: "Sign in to continue." };

  if (typeof jobId !== "string" || !jobId) {
    return { ok: false, message: "Missing listing." };
  }

  const { data, error } = await auth.supabase
    .from("jobs")
    .update({ status: "draft" })
    .eq("id", jobId)
    .eq("submitted_by", auth.recruiter.user_id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "Only a listing that's in review can be withdrawn." };
  }

  try {
    const admin = createSupabaseAdminClient();
    await admin.from("job_review_events").insert({
      job_id: jobId,
      actor_id: auth.recruiter.user_id,
      action: "withdrawn",
    });
  } catch (eventError) {
    captureError(eventError, {
      scope: "employers.withdrawSubmission",
      severity: "warning",
    });
  }

  return { ok: true };
}

export async function employerSignOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/employers/login");
}
