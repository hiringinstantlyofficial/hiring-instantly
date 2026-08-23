"use server";

import { headers } from "next/headers";

import { newsletterWelcomeEmail, sendEmail } from "@/lib/email";
import type { FormState } from "@/lib/form-state";
import { captureError } from "@/lib/observability";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { contactSchema, newsletterSchema } from "@/lib/validations";

// NOTE: this module may only export async functions. `FormState` is a type (so
// it is erased at compile time) and `initialFormState` lives in
// @/lib/form-state — exporting the object from here is a runtime error.

/**
 * Contact form submission. Three layers of spam control: a honeypot field, an
 * IP rate limit, and server-side validation. Writes go through the service-role
 * client because RLS grants the public insert-only — the anon key would work
 * too, but this keeps a single audited write path.
 */
export async function submitContactForm(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      errors[field] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors,
    };
  }

  // Honeypot tripped — behave like a success so bots don't learn anything.
  if (parsed.data.website) {
    return { status: "success", message: "Thanks — we'll be in touch shortly." };
  }

  const requestHeaders = await headers();
  const { allowed, retryAfterSeconds } = await rateLimit(
    `contact:${clientIpFrom(requestHeaders)}`,
    { limit: 3, windowMs: 10 * 60 * 1000 },
  );

  if (!allowed) {
    return {
      status: "error",
      message: `Too many messages. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });

    if (error) {
      captureError(error, { scope: "contact.insert" });
      return {
        status: "error",
        message:
          "We couldn't send that just now. Please try again, or email us directly.",
      };
    }
  } catch (error) {
    captureError(error, { scope: "contact.unexpected" });
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again shortly.",
    };
  }

  return {
    status: "success",
    message: "Thanks — your message is in. We usually reply within 2 working days.",
  };
}

/** Footer newsletter signup. Duplicate emails are treated as success. */
export async function subscribeToNewsletter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  if (parsed.data.website) {
    return { status: "success", message: "You're subscribed." };
  }

  const requestHeaders = await headers();
  const { allowed } = await rateLimit(
    `newsletter:${clientIpFrom(requestHeaders)}`,
    { limit: 5, windowMs: 10 * 60 * 1000 },
  );

  if (!allowed) {
    return { status: "error", message: "Too many attempts. Try again later." };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: inserted, error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.email.toLowerCase() })
      .select("unsubscribe_token")
      .single();

    // 23505 = unique violation: already subscribed, which is a success here.
    if (error && error.code !== "23505") {
      captureError(error, { scope: "newsletter.insert" });
      return { status: "error", message: "Couldn't subscribe. Try again later." };
    }

    // An existing row may belong to someone who unsubscribed and is now
    // signing up again — reactivate them, without a second welcome email.
    if (error?.code === "23505") {
      await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: null })
        .eq("email", parsed.data.email.toLowerCase());
    }

    // Only a genuinely new row (no duplicate error) gets the welcome email —
    // re-subscribing must not re-mail. Best-effort: sendEmail never throws.
    if (inserted) {
      await sendEmail({
        to: parsed.data.email.toLowerCase(),
        ...newsletterWelcomeEmail({
          unsubscribeUrl: absoluteUrl(
            `/api/newsletter/unsubscribe?token=${inserted.unsubscribe_token}`,
          ),
        }),
      });
    }
  } catch (error) {
    captureError(error, { scope: "newsletter.unexpected" });
    return { status: "error", message: "Couldn't subscribe. Try again later." };
  }

  return { status: "success", message: "You're on the list." };
}
