import { NextResponse, type NextRequest } from "next/server";

import { safeInternalRedirect } from "@/lib/safe-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The magic-link landing point: exchanges the emailed code for a session, then
 * routes by role. The password flow never needed this, which is why nothing
 * like it existed before the employer portal.
 *
 * Role resolution happens here, server-side — `?next=` is honoured only after
 * passing the same-origin validation in lib/safe-redirect.ts, and never
 * decides which dashboard the user is allowed into.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Expired or reused link. This screen is the difference between a
      // recovered session and a lost recruiter — the login page offers a
      // "send me a new link" path for exactly this case.
      return NextResponse.redirect(`${origin}/employers/login?error=expired`);
    }
  } else {
    return NextResponse.redirect(`${origin}/employers/login?error=expired`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/employers/login?error=expired`);
  }

  const [{ data: isAdmin }, { data: recruiter }] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase
      .from("recruiters")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (isAdmin) {
    return NextResponse.redirect(`${origin}/admin`);
  }

  if (!recruiter) {
    // Authenticated but no profile yet: onboarding is a wall, not a suggestion.
    return NextResponse.redirect(`${origin}/employers/onboarding`);
  }

  const next = safeInternalRedirect(
    searchParams.get("next"),
    ["/employers"],
    "/employers",
  );
  return NextResponse.redirect(`${origin}${next}`);
}
