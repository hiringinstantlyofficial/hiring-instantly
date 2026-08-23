"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/companies", label: "Browse Companies" },
  { href: "/blog", label: "Career Advice" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile sheet on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/jobs"
      ? pathname === "/" || pathname.startsWith("/jobs")
      : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-white">
      <div className="container-page flex h-[74px] items-center justify-between gap-8">
        <div className="flex items-center gap-10">
          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "relative flex h-[74px] items-center text-base transition-colors",
                  isActive(link.href)
                    ? "font-semibold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-primary"
                    : "text-slate-600 hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/contact"
            prefetch={true}
            className="px-2 text-base font-semibold text-primary hover:text-primary-hover"
          >
            Contact
          </Link>
          <span aria-hidden className="h-8 w-px bg-line" />
          <Link
            href="/post-a-job"
            prefetch={true}
            className="bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Post a Job
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 p-2 text-navy-700 lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line-soft bg-white lg:hidden"
        >
          <nav aria-label="Mobile" className="container-page flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "border-b border-line-soft py-3.5 text-base",
                  isActive(link.href)
                    ? "font-semibold text-primary"
                    : "text-slate-600",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              prefetch={true}
              className="border-b border-line-soft py-3.5 text-base text-slate-600"
            >
              Contact
            </Link>
            <Link
              href="/post-a-job"
              prefetch={true}
              className="my-4 bg-primary px-6 py-3 text-center text-base font-semibold text-white"
            >
              Post a Job
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
