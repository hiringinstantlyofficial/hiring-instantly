import type { NextRequest } from "next/server";

import { captureError } from "@/lib/observability";
import { siteConfig } from "@/lib/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * One-click unsubscribe, straight from the footer of every newsletter email.
 * The token is the whole credential — the reader is not signed in — so this
 * resolves by token alone through the service-role client (the table has no
 * public update policy). Idempotent: a second click stays "unsubscribed".
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${title} — ${siteConfig.name}</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif;color:#25324b;margin:0">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px">
    <p style="font-size:18px;font-weight:bold;margin:0 0 20px">${siteConfig.name}</p>
    <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
    <p style="margin:0 0 24px;color:#515b6f">${body}</p>
    <a href="/" style="color:#4640de;font-weight:bold">Back to ${siteConfig.name}</a>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";

  if (!UUID_PATTERN.test(token)) {
    return page(
      "That link isn't valid",
      "This unsubscribe link is incomplete or has been mangled by your email client. Open the link from the email again, or reply to any of our emails and we'll remove you by hand.",
    );
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return page(
        "That link isn't valid",
        "We couldn't find a subscription for this link — it may already have been removed.",
      );
    }
  } catch (error) {
    captureError(error, { scope: "newsletter.unsubscribe" });
    return page(
      "Something went wrong",
      "We couldn't process the unsubscribe just now. Please try the link again in a minute.",
    );
  }

  return page(
    "You're unsubscribed",
    "You won't receive any more job alerts from us. Changed your mind? Subscribe again any time from the site footer.",
  );
}
