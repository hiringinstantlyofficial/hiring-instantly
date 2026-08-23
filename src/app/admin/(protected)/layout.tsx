import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOut } from "@/app/actions/admin";
import { AdminNavLinks, MobileAdminNav } from "@/components/admin/admin-nav";
import { QueryProvider } from "@/components/providers/query-provider";
import { Logo } from "@/components/ui/logo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      {/* Desktop: the shell is exactly one viewport tall and never scrolls
          itself — the sidebar stays put and only the content pane scrolls.
          Mobile: one compact sticky top bar; the nav lives in a slide-in
          drawer, and the page scrolls as normal. */}
      <div className="flex min-h-screen flex-1 flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <Logo href="/admin" />
          <MobileAdminNav email={user.email ?? ""} signOutAction={signOut} />
        </header>

        <aside className="hidden shrink-0 border-r border-line bg-white lg:flex lg:h-full lg:w-64 lg:flex-col">
          <div className="p-6">
            <Logo href="/admin" />
          </div>

          <nav
            aria-label="Admin"
            className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 pt-0"
          >
            <AdminNavLinks />
          </nav>

          <div className="shrink-0 border-t border-line p-4">
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

        <div className="min-w-0 flex-1 bg-surface-muted lg:h-full lg:overflow-y-auto">
          {children}
        </div>
      </div>
    </QueryProvider>
  );
}
