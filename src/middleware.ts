import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth cookie on every matched request and gates the
 * two dashboards: /admin (password) and /employers (magic link).
 *
 * This is the first of three layers: middleware redirects anonymous visitors,
 * each protected layout re-checks the session and role server-side, and
 * Row-Level Security is the final authority on every query. Middleware alone is
 * never the security boundary.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the token with Supabase; getSession() would trust
  // whatever is in the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isEmployerRoute = pathname.startsWith("/employers");
  const isAdminLogin = pathname === "/admin/login";
  const isEmployerLogin = pathname === "/employers/login";
  const isLoginRoute = isAdminLogin || isEmployerLogin;

  if (!user && !isLoginRoute && (isAdminRoute || isEmployerRoute)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = isAdminRoute ? "/admin/login" : "/employers/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginRoute) {
    // Route by role, not by which login page they landed on: a recruiter who
    // wanders onto /admin/login should end up on their own dashboard, not on
    // a screen telling them they aren't an administrator. The lookups run
    // only on the two login routes, so the extra round trips never sit in
    // front of a dashboard page load.
    const [{ data: isAdmin }, { data: recruiter }] = await Promise.all([
      supabase.rpc("is_admin"),
      supabase
        .from("recruiters")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = isAdmin
      ? "/admin"
      : recruiter
        ? "/employers"
        : "/employers/onboarding";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  // Keep crawlers off both dashboards even if a link leaks.
  if (isAdminRoute || isEmployerRoute) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  /*
   * Dashboard routes only.
   *
   * This middleware calls supabase.auth.getUser(), which is a network round
   * trip to Supabase's auth server. Running it site-wide put that round trip in
   * front of every public page load - hundreds of milliseconds before Next even
   * started rendering, on pages that have no session to refresh.
   *
   * Scoping it here means public pages — /post-a-job included, which must stay
   * statically served (D9) — come straight from the static/ISR cache, and only
   * the dashboards pay the auth check. /auth/callback also stays outside: it
   * does its own session work.
   */
  matcher: ["/admin/:path*", "/employers/:path*"],
};
