import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth cookie on every request and gates /admin.
 *
 * This is the first of three layers: middleware redirects anonymous visitors,
 * the admin layout re-checks the session and admin membership server-side, and
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
  const isLoginRoute = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  // Keep crawlers off the dashboard even if a link leaks.
  if (isAdminRoute) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  /*
   * Admin routes only.
   *
   * This middleware calls supabase.auth.getUser(), which is a network round
   * trip to Supabase's auth server. Running it site-wide put that round trip in
   * front of every public page load - hundreds of milliseconds before Next even
   * started rendering, on pages that have no session to refresh (the public site
   * has no user accounts at all).
   *
   * Scoping it here means public pages are served straight from the static/ISR
   * cache, and only /admin pays the auth check.
   */
  matcher: ["/admin/:path*"],
};
