import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Plus } from "lucide-react";

import { employerSignOut } from "@/app/actions/employers";
import { QueryProvider } from "@/components/providers/query-provider";
import { Logo } from "@/components/ui/logo";
import { getRecruiterProfile } from "@/lib/recruiters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/employers", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employers/company/new", label: "Companies", icon: Building2 },
] as const;

/**
 * Second gate after middleware, mirroring admin/(protected)/layout.tsx:
 * re-checks the session server-side, requires a recruiter profile (or walls
 * the user into onboarding), and surfaces suspension. RLS remains the final
 * authority on every query the pages below make.
 */
export default async function ProtectedEmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/employers/login");

  const recruiter = await getRecruiterProfile(supabase, user.id);

  // Onboarding is a wall, not a suggestion.
  if (!recruiter) redirect("/employers/onboarding");

  if (recruiter.status === "suspended") {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-h2">This account is paused</h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-600">
          Posting from this account is currently disabled. If you think this is
          a mistake, reply to any of our emails or write to us via the contact
          page and we&apos;ll take a look.
        </p>
        <form action={employerSignOut} className="mt-8">
          <button
            type="submit"
            className="bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary-hover"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-line bg-white">
          <div className="container-page flex h-[74px] items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <Logo href="/employers" />
              <nav aria-label="Employer" className="hidden items-center gap-6 sm:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary"
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/employers/jobs/new"
                className="flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                <Plus className="size-4" aria-hidden />
                Post a job
              </Link>
              <form action={employerSignOut}>
                <button
                  type="submit"
                  title={`Signed in as ${recruiter.work_email}`}
                  className="flex items-center gap-2 p-2 text-sm font-semibold text-slate-600 hover:text-accent-red"
                >
                  <LogOut className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="min-w-0 flex-1 bg-surface-muted">{children}</div>
      </div>
    </QueryProvider>
  );
}
