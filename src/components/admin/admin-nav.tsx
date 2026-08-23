"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  ClipboardCheck,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mails,
  Menu,
  Newspaper,
  Plus,
  Users,
  X,
} from "lucide-react";

import { ReviewBadge } from "@/components/admin/review-badge";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

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
  { href: "/admin/subscribers", label: "Subscribers", icon: Mails },
] as const;

/**
 * The nav list itself, shared by the desktop sidebar and the mobile drawer.
 * Client-side purely for the active-route highlight.
 */
export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm font-medium",
              active
                ? "bg-primary-surface font-semibold text-primary"
                : "text-slate-600 hover:bg-primary-surface hover:text-primary",
            )}
          >
            <item.icon className="size-5" aria-hidden />
            {item.label}
            {"badge" in item && item.badge ? <ReviewBadge /> : null}
          </Link>
        );
      })}
      <Link
        href="/admin/jobs/new"
        onClick={onNavigate}
        className="mt-4 flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        <Plus className="size-4" aria-hidden />
        New job
      </Link>
    </>
  );
}

/**
 * Hamburger + slide-in drawer for phones. The horizontal nav strip this
 * replaces clipped half its entries off-screen with nothing to hint the rest
 * existed — a drawer shows all eight, plus sign-out, at full tap size.
 */
export function MobileAdminNav({
  email,
  signOutAction,
}: {
  email: string;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The layout — and this drawer — persist across admin navigations, so the
  // drawer must close itself when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // The page behind the drawer must not scroll along with it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="-mr-2 p-2 text-slate-600 hover:text-primary"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-900/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-white">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Logo href="/admin" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="-mr-2 p-2 text-slate-600 hover:text-primary"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav
              aria-label="Admin"
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
            >
              <AdminNavLinks onNavigate={() => setOpen(false)} />
            </nav>

            <div className="shrink-0 border-t border-line p-4">
              <p className="truncate text-xs text-slate-400">{email}</p>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-accent-red"
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
