import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Briefcase,
  Building2,
  ClipboardCheck,
  Inbox,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Plus,
  Users,
} from "lucide-react";

import { signOut } from "@/app/actions/admin";
import { ReviewBadge } from "@/components/admin/review-badge";
import { QueryProvider } from "@/components/providers/query-provider";
import { Logo } from "@/components/ui/logo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Review sits above Jobs on purpose: it is the one entry with a
// service-level expectation attached ("reviewed within one working day"),
// so it belongs first in the eye line. Its badge is the admin's whole
// notification system for recruiter submissions.
const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/review", label: "Review", icon: ClipboardCheck, badge: true },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/recruiters", label: "Recruiters", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
] as const;

/**
 * Second gate after middleware: re-checks the session server-side and confirms
 * the account is in the admins table. RLS is still the final authority on data.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("[admin] is_admin check failed:", error);
  }

  if (!isAdmin) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-h2">This account isn&apos;t an administrator</h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-600">
          You&apos;re signed in as {user.email}, but that account has no admin
          rights. Add it to the <code>admins</code> table in Supabase, then
          reload.
        </p>
        <form action={signOut} className="mt-8">
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
      <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-line bg-white lg:w-64 lg:border-r lg:border-b-0">
          {/* On mobile this row is the only chrome, so it carries the wordmark
              and sign-out that the desktop sidebar keeps at its foot. */}
          <div className="flex items-center justify-between border-b border-line p-4 lg:block lg:border-b-0 lg:p-6">
            <Logo href="/admin" />
            <form action={signOut} className="lg:hidden">
              <button
                type="submit"
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-accent-red"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>

          <nav aria-label="Admin" className="flex gap-1 p-3 lg:flex-col lg:p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-primary-surface hover:text-primary"
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
                {"badge" in item && item.badge ? <ReviewBadge /> : null}
              </Link>
            ))}
            <Link
              href="/admin/jobs/new"
              className="ml-auto flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover lg:ml-0 lg:mt-4 lg:justify-center"
            >
              <Plus className="size-4" aria-hidden />
              New job
            </Link>
          </nav>

          <div className="hidden border-t border-line p-4 lg:block">
            <p className="truncate text-xs text-slate-400">{user.email}</p>
            <form action={signOut}>
              <button
                type="submit"
                className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-accent-red"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-surface-muted">{children}</div>
      </div>
    </QueryProvider>
  );
}
