"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { ARTICLES_CACHE_TAG } from "@/lib/blog";
import { COMPANIES_CACHE_TAG } from "@/lib/companies";
import {
  changesRequestedEmail,
  jobApprovedEmail,
  jobNewsletterEmail,
  membershipApprovedEmail,
  sendEmail,
} from "@/lib/email";
import { JOBS_CACHE_TAG } from "@/lib/jobs";
import { captureError } from "@/lib/observability";
import { absoluteUrl } from "@/lib/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatSalaryRange } from "@/lib/utils";
import { reviewActionSchema } from "@/lib/validations";
import { JOB_TYPE_LABELS } from "@/types/job";

/**
 * Flushes every cached surface a job appears on. Called by the admin mutations
 * so an edit is live without waiting out a revalidate window.
 *
 * Two layers, and both are needed. revalidateTag drops the cached Supabase
 * reads in lib/jobs.ts — without it /jobs would keep serving the previous
 * listing from the data cache even though the route re-renders on every
 * request. revalidatePath then drops the rendered HTML for the routes that are
 * statically generated or ISR.
 */
export async function revalidateJobPaths(slug?: string, companySlug?: string) {
  revalidateTag(JOBS_CACHE_TAG);
  // Publishing or closing a listing changes the role count on its company's
  // profile and on the /companies directory, both of which are cached behind
  // their own tag.
  revalidateTag(COMPANIES_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/companies");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/jobs/${slug}`);
  if (companySlug) revalidatePath(`/companies/${companySlug}`);
}

/**
 * The same two layers for a company.
 *
 * /jobs is flushed too: a rename propagates to every listing's `company_name`
 * through a database trigger, so the cards would otherwise keep showing the old
 * name until the jobs cache expired on its own.
 */
export async function revalidateCompanyPaths(slug?: string) {
  revalidateTag(COMPANIES_CACHE_TAG);
  revalidateTag(JOBS_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/companies");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/companies/${slug}`);
}

/**
 * The same two layers for the blog. Scheduled posts still need the route's own
 * revalidate window to roll them in — nothing calls this when a post's moment
 * simply arrives, because no write happens at that instant.
 */
export async function revalidateArticlePaths(slug?: string) {
  revalidateTag(ARTICLES_CACHE_TAG);
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/*  Review-queue actions (§7 of docs/employer-portal-plan.md)                 */
/*                                                                            */
/*  A Server Action is a public HTTP endpoint, so each of these re-checks     */
/*  is_admin() server-side before doing anything. Job and company writes go   */
/*  through the admin's own session client — RLS authorises them, and the     */
/*  enforcement triggers wave admin writes through. Membership writes use the */
/*  service-role client because company_members deliberately has no client-   */
/*  side update policy at all.                                                */
/* -------------------------------------------------------------------------- */

interface ReviewActionResult {
  ok: boolean;
  message?: string;
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;

  return { supabase, user };
}

/** Bumps trust_level from the recruiter's approved-listing count. */
async function refreshTrustLevel(recruiterId: string): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    const { count } = await admin
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("submitted_by", recruiterId)
      .in("status", ["active", "closed", "expired"]);

    const approved = count ?? 0;
    const trust_level =
      approved >= 5 ? "trusted" : approved >= 1 ? "known" : "new";

    await admin
      .from("recruiters")
      .update({ trust_level })
      .eq("user_id", recruiterId);
  } catch (error) {
    captureError(error, { scope: "admin.refreshTrustLevel", severity: "warning" });
  }
}

/**
 * Approve: the job goes active with a fresh posted_at, the snapshot trigger
 * captures the diff base, a pending company goes active with it (a job cannot
 * be live under an invisible company), caches flush, and the recruiter gets
 * the live URL.
 */
export async function approveJob(jobId: string): Promise<ReviewActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { ok: false, message: "Not authorised." };

  const { data: job, error: readError } = await auth.supabase
    .from("jobs")
    .select(
      "id, slug, title, submitted_by, company:companies(id, slug, name, status), recruiter:recruiters(user_id, full_name, work_email)",
    )
    .eq("id", jobId)
    .maybeSingle();

  if (readError || !job) return { ok: false, message: "Job not found." };

  const company = job.company as {
    id: string;
    slug: string;
    name: string;
    status: string;
  } | null;
  const recruiter = job.recruiter as {
    user_id: string;
    full_name: string;
    work_email: string;
  } | null;

  const { error } = await auth.supabase
    .from("jobs")
    .update({
      status: "active",
      posted_at: new Date().toISOString(),
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
      review_note: null,
    })
    .eq("id", jobId);

  if (error) {
    captureError(error, { scope: "admin.approveJob" });
    return { ok: false, message: error.message };
  }

  if (company && company.status === "pending") {
    const { error: companyError } = await auth.supabase
      .from("companies")
      .update({ status: "active" })
      .eq("id", company.id);
    if (companyError) {
      captureError(companyError, { scope: "admin.approveJob.company" });
    }
  }

  await auth.supabase.from("job_review_events").insert({
    job_id: jobId,
    actor_id: auth.user.id,
    action: "approved",
  });

  await revalidateJobPaths(job.slug, company?.slug);

  if (recruiter) {
    await refreshTrustLevel(recruiter.user_id);
    await sendEmail({
      to: recruiter.work_email,
      ...jobApprovedEmail({
        recruiterName: recruiter.full_name,
        jobTitle: job.title,
        jobUrl: absoluteUrl(`/jobs/${job.slug}`),
      }),
    });
  }

  return { ok: true };
}

/**
 * Request changes: the note is required, goes to the recruiter verbatim, and
 * the listing becomes editable + resubmittable. If the job was live (a D3
 * re-review being bounced), it is already off the site — flush caches.
 */
export async function requestJobChanges(input: {
  job_id: string;
  review_note: string;
}): Promise<ReviewActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { ok: false, message: "Not authorised." };

  const parsed = reviewActionSchema.safeParse({
    ...input,
    action: "changes-requested",
  });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "Tell the recruiter what needs to change.",
    };
  }

  const { data: job, error: readError } = await auth.supabase
    .from("jobs")
    .select(
      "id, slug, title, status, company:companies(slug), recruiter:recruiters(full_name, work_email)",
    )
    .eq("id", parsed.data.job_id)
    .maybeSingle();

  if (readError || !job) return { ok: false, message: "Job not found." };

  const { error } = await auth.supabase
    .from("jobs")
    .update({
      status: "rejected",
      review_note: parsed.data.review_note,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.job_id);

  if (error) {
    captureError(error, { scope: "admin.requestJobChanges" });
    return { ok: false, message: error.message };
  }

  await auth.supabase.from("job_review_events").insert({
    job_id: parsed.data.job_id,
    actor_id: auth.user.id,
    action: "changes-requested",
    note: parsed.data.review_note,
  });

  if (job.status === "active") {
    await revalidateJobPaths(
      job.slug,
      (job.company as { slug: string } | null)?.slug,
    );
  }

  const recruiter = job.recruiter as {
    full_name: string;
    work_email: string;
  } | null;
  if (recruiter && parsed.data.review_note) {
    await sendEmail({
      to: recruiter.work_email,
      ...changesRequestedEmail({
        recruiterName: recruiter.full_name,
        jobTitle: job.title,
        note: parsed.data.review_note,
        editUrl: absoluteUrl(`/employers/jobs/${job.id}/edit`),
      }),
    });
  }

  return { ok: true };
}

/**
 * Reject outright, optionally suspending the recruiter — which cuts off every
 * write at once via is_recruiter(), while their already-live jobs stay live.
 */
export async function rejectJob(input: {
  job_id: string;
  review_note?: string;
  block?: boolean;
}): Promise<ReviewActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { ok: false, message: "Not authorised." };

  const parsed = reviewActionSchema.safeParse({
    job_id: input.job_id,
    action: "reject",
    review_note: input.review_note,
  });
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { data: job, error: readError } = await auth.supabase
    .from("jobs")
    .select("id, slug, status, submitted_by, company:companies(slug)")
    .eq("id", parsed.data.job_id)
    .maybeSingle();

  if (readError || !job) return { ok: false, message: "Job not found." };

  const { error } = await auth.supabase
    .from("jobs")
    .update({
      status: "rejected",
      review_note: parsed.data.review_note,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.job_id);

  if (error) {
    captureError(error, { scope: "admin.rejectJob" });
    return { ok: false, message: error.message };
  }

  await auth.supabase.from("job_review_events").insert({
    job_id: parsed.data.job_id,
    actor_id: auth.user.id,
    action: "rejected",
    note: parsed.data.review_note,
  });

  if (job.status === "active") {
    await revalidateJobPaths(
      job.slug,
      (job.company as { slug: string } | null)?.slug,
    );
  }

  if (input.block && job.submitted_by) {
    await suspendRecruiter(job.submitted_by, true);
  }

  return { ok: true };
}

/** Approve or reject a company join request (D4). */
export async function approveMembership(
  membershipId: string,
  decision: "approved" | "rejected",
): Promise<ReviewActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { ok: false, message: "Not authorised." };

  if (typeof membershipId !== "string" || !membershipId) {
    return { ok: false, message: "Missing membership." };
  }

  const admin = createSupabaseAdminClient();

  const { data: membership, error } = await admin
    .from("company_members")
    .update(
      decision === "approved"
        ? {
            status: "approved",
            approved_via: "admin",
            approved_by: auth.user.id,
          }
        : { status: "rejected" },
    )
    .eq("id", membershipId)
    .select(
      "id, company:companies(slug, name), recruiter:recruiters(full_name, work_email)",
    )
    .maybeSingle();

  if (error || !membership) {
    captureError(error, { scope: "admin.approveMembership" });
    return { ok: false, message: "Membership not found." };
  }

  const company = membership.company as { slug: string; name: string } | null;
  const recruiter = membership.recruiter as {
    full_name: string;
    work_email: string;
  } | null;

  if (decision === "approved" && company && recruiter) {
    await sendEmail({
      to: recruiter.work_email,
      ...membershipApprovedEmail({
        recruiterName: recruiter.full_name,
        companyName: company.name,
        companyUrl: absoluteUrl(`/companies/${company.slug}`),
      }),
    });
  }

  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/*  Newsletter broadcast                                                      */
/* -------------------------------------------------------------------------- */

interface NewsletterSendResult {
  ok: boolean;
  /** How many subscribers were emailed (0 when the list is empty). */
  sent?: number;
  message?: string;
}

/** How many ZeptoMail calls run at once during a broadcast. */
const BROADCAST_CONCURRENCY = 8;

/**
 * Emails a live listing to every active newsletter subscriber. Only ever runs
 * because an admin explicitly confirmed the "email the subscribers?" prompt —
 * nothing sends this automatically.
 *
 * Sends are sequential chunks of BROADCAST_CONCURRENCY: sendEmail never
 * throws, so a bad address costs one warning in the logs, not the broadcast.
 * newsletter_sent_at is stamped afterwards so the admin UI can warn before a
 * duplicate send — deliberately re-sending after an edit stays possible.
 */
export async function sendJobNewsletter(
  jobId: string,
): Promise<NewsletterSendResult> {
  const auth = await requireAdmin();
  if (!auth) return { ok: false, message: "Not authorised." };

  if (typeof jobId !== "string" || !jobId) {
    return { ok: false, message: "Missing job." };
  }

  const admin = createSupabaseAdminClient();

  const { data: job, error: jobError } = await admin
    .from("jobs")
    .select(
      "id, slug, title, company_name, location, job_type, salary_min, salary_max, salary_currency, status",
    )
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) return { ok: false, message: "Job not found." };
  if (job.status !== "active") {
    return {
      ok: false,
      message: "Only live listings can be emailed to subscribers.",
    };
  }

  const { data: subscribers, error: subsError } = await admin
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .is("unsubscribed_at", null);

  if (subsError) {
    captureError(subsError, { scope: "admin.sendJobNewsletter" });
    return { ok: false, message: "Couldn't load the subscriber list." };
  }

  const list = subscribers ?? [];
  if (list.length === 0) {
    return { ok: true, sent: 0, message: "No active subscribers yet." };
  }

  const jobUrl = absoluteUrl(`/jobs/${job.slug}`);
  const salary = formatSalaryRange(
    job.salary_min,
    job.salary_max,
    job.salary_currency,
  );

  for (let i = 0; i < list.length; i += BROADCAST_CONCURRENCY) {
    await Promise.all(
      list.slice(i, i + BROADCAST_CONCURRENCY).map((subscriber) =>
        sendEmail({
          to: subscriber.email,
          ...jobNewsletterEmail({
            jobTitle: job.title,
            companyName: job.company_name,
            location: job.location,
            jobTypeLabel: JOB_TYPE_LABELS[job.job_type],
            salary,
            jobUrl,
            unsubscribeUrl: absoluteUrl(
              `/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`,
            ),
          }),
        }),
      ),
    );
  }

  const { error: stampError } = await admin
    .from("jobs")
    .update({ newsletter_sent_at: new Date().toISOString() })
    .eq("id", jobId);
  if (stampError) {
    captureError(stampError, {
      scope: "admin.sendJobNewsletter.stamp",
      severity: "warning",
    });
  }

  return { ok: true, sent: list.length };
}

/** The kill switch. Suspension refuses every write; live jobs stay live. */
export async function suspendRecruiter(
  recruiterId: string,
  suspended: boolean,
): Promise<ReviewActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { ok: false, message: "Not authorised." };

  if (typeof recruiterId !== "string" || !recruiterId) {
    return { ok: false, message: "Missing recruiter." };
  }

  const { error } = await auth.supabase
    .from("recruiters")
    .update({ status: suspended ? "suspended" : "active" })
    .eq("user_id", recruiterId);

  if (error) {
    captureError(error, { scope: "admin.suspendRecruiter" });
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
