import "server-only";

import { captureError } from "@/lib/observability";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * A thin ZeptoMail (Zoho) wrapper — the one genuinely new external dependency
 * of the employer portal, spoken to over plain HTTPS so no SDK is added.
 *
 * ZeptoMail carries the app's own transactional mail (submission received,
 * approved, changes requested, …). The magic-link emails are sent by Supabase
 * Auth and follow whatever SMTP is configured in its dashboard — point that at
 * ZeptoMail's SMTP relay too (see README §4) so nothing rides on Supabase's
 * team-only built-in sender.
 *
 * Two properties every call site relies on:
 *
 *  - A missing ZEPTOMAIL_TOKEN logs a warning and returns. Local dev and
 *    preview deploys must not require mail, and an email failure must never
 *    roll back the submission it was announcing. Delivery is best-effort,
 *    the same way the image uploader treats orphan cleanup.
 *  - Failures go through captureError with severity "warning" — visible in
 *    the logs without being pages.
 */

/**
 * ZeptoMail is region-locked: a token minted in the India data centre only
 * works against api.zeptomail.in, and a global-DC token only against
 * api.zeptomail.com. Defaults to the India DC to match this board's market;
 * override with ZEPTOMAIL_API_BASE if the Zoho account lives elsewhere.
 */
function apiBase(): string {
  return (
    process.env.ZEPTOMAIL_API_BASE?.replace(/\/+$/, "") ??
    "https://api.zeptomail.in"
  );
}

/**
 * EMAIL_FROM as `Name <addr@domain>` or a bare address, split into the
 * `{ address, name }` shape ZeptoMail wants. The domain must be verified in
 * ZeptoMail's Mail Agent — there is no unverified fallback sender, so the
 * default below only works once hiringinstantly.in is verified there.
 */
function fromParts(): { address: string; name: string } {
  const raw = process.env.EMAIL_FROM ?? `${siteConfig.name} <no-reply@hiringinstantly.in>`;
  const match = raw.match(/^\s*(.*?)\s*<\s*([^<>\s]+@[^<>\s]+)\s*>\s*$/);
  if (match) {
    return { address: match[2]!, name: match[1] || siteConfig.name };
  }
  return { address: raw.trim(), name: siteConfig.name };
}

/** Where "new submission" digests go. */
export function adminNotificationAddress(): string {
  return process.env.ADMIN_NOTIFICATION_EMAIL ?? siteConfig.contactEmail;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

/** Fire-and-forget send. Never throws. */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const token = process.env.ZEPTOMAIL_TOKEN;

  if (!token) {
    console.warn(
      `[email] ZEPTOMAIL_TOKEN is not set — skipped "${message.subject}" to ${message.to}`,
    );
    return;
  }

  try {
    const response = await fetch(`${apiBase()}/v1.1/email`, {
      method: "POST",
      headers: {
        // The token from ZeptoMail's Mail Agent → "Send Mail Token" already
        // starts with "Zoho-enczapikey "; accept it with or without the
        // scheme so a pasted value works either way.
        Authorization: token.startsWith("Zoho-enczapikey")
          ? token
          : `Zoho-enczapikey ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromParts(),
        to: [{ email_address: { address: message.to } }],
        subject: message.subject,
        htmlbody: message.html,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      captureError(
        new Error(`ZeptoMail responded ${response.status}: ${body}`),
        {
          scope: "email.send",
          severity: "warning",
          meta: { subject: message.subject },
        },
      );
    }
  } catch (error) {
    captureError(error, {
      scope: "email.send",
      severity: "warning",
      meta: { subject: message.subject },
    });
  }
}

/* -------------------------------------------------------------------------- */
/*  Templates — §8 of the plan. Plain, short, one clear link each.            */
/* -------------------------------------------------------------------------- */

function layout(body: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#25324b">
    <p style="font-size:18px;font-weight:bold;margin:0 0 20px">${siteConfig.name}</p>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#7c8493">
      You're receiving this because of activity on your ${siteConfig.name} employer account.
    </p>
  </div>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#4640de;color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:bold">${label}</a></p>`;
}

export function submissionReceivedEmail(input: {
  recruiterName: string;
  jobTitle: string;
  companyName: string;
}): Omit<EmailMessage, "to"> {
  return {
    subject: `We have your listing: ${input.jobTitle}`,
    html: layout(`
      <p>Hi ${input.recruiterName},</p>
      <p><strong>${input.jobTitle}</strong> at <strong>${input.companyName}</strong> is in our review queue.
      Most listings are reviewed within one working day — we'll email you the moment it's live.</p>
      ${button(absoluteUrl("/employers"), "Track your submission")}
    `),
  };
}

export function newSubmissionAdminEmail(input: {
  jobTitle: string;
  companyName: string;
  recruiterName: string;
  emailDomain: string;
  signals: string[];
}): Omit<EmailMessage, "to"> {
  const chips = input.signals.length
    ? `<p style="color:#7c8493;font-size:13px">${input.signals.join(" · ")}</p>`
    : "";
  return {
    subject: `Review queue: ${input.jobTitle} — ${input.companyName}`,
    html: layout(`
      <p><strong>${input.jobTitle}</strong> at <strong>${input.companyName}</strong>,
      submitted by ${input.recruiterName} (@${input.emailDomain}).</p>
      ${chips}
      ${button(absoluteUrl("/admin/review"), "Open the review queue")}
    `),
  };
}

export function jobApprovedEmail(input: {
  recruiterName: string;
  jobTitle: string;
  jobUrl: string;
}): Omit<EmailMessage, "to"> {
  return {
    subject: `Your listing is live: ${input.jobTitle}`,
    html: layout(`
      <p>Hi ${input.recruiterName},</p>
      <p><strong>${input.jobTitle}</strong> is now live. Share the link with your network —
      listings shared by the employer get noticeably more applicants.</p>
      ${button(input.jobUrl, "View the live listing")}
      <p>Have another role to fill? <a href="${absoluteUrl("/employers/jobs/new")}">Post another job</a>.</p>
    `),
  };
}

export function changesRequestedEmail(input: {
  recruiterName: string;
  jobTitle: string;
  note: string;
  editUrl: string;
}): Omit<EmailMessage, "to"> {
  return {
    subject: `One change needed: ${input.jobTitle}`,
    html: layout(`
      <p>Hi ${input.recruiterName},</p>
      <p>We reviewed <strong>${input.jobTitle}</strong> and need one thing from you before it goes live:</p>
      <blockquote style="border-left:3px solid #4640de;margin:16px 0;padding:8px 16px;color:#515b6f">${input.note}</blockquote>
      ${button(input.editUrl, "Edit and resubmit")}
    `),
  };
}

export function membershipApprovedEmail(input: {
  recruiterName: string;
  companyName: string;
  companyUrl: string;
}): Omit<EmailMessage, "to"> {
  return {
    subject: `You can now manage ${input.companyName}`,
    html: layout(`
      <p>Hi ${input.recruiterName},</p>
      <p>Your access to <strong>${input.companyName}</strong> is verified. You can now edit the
      company profile — logo, cover image and description — as well as post roles for it.</p>
      ${button(input.companyUrl, "Open the company profile")}
    `),
  };
}
