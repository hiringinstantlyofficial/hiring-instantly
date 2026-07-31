import Link from "next/link";

import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Logo } from "@/components/ui/logo";
import { footerNav, siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-white/70">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto_auto_1fr] lg:gap-16">
          <div className="max-w-xs">
            <Logo variant="dark" />
            <p className="mt-6 text-base leading-relaxed">
              India&apos;s job board for freshers and experienced
              professionals. Find your next role at companies that are actually
              hiring.
            </p>
          </div>

          {[footerNav.about, footerNav.resources].map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-lg font-semibold text-white">
                {column.title}
              </h2>
              <ul className="mt-6 space-y-4">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-base transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:max-w-sm">
            <h2 className="text-lg font-semibold text-white">
              Get job notifications
            </h2>
            <p className="mt-6 text-base leading-relaxed">
              The latest jobs, hiring news and articles, sent to your inbox
              weekly.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* No social icon row: it linked to facebook.com / instagram.com etc.
            rather than to real profiles, which reads as unfinished and fed a
            bogus `sameAs` into the Organization structured data. */}
        <div className="mt-16 border-t border-white/20 pt-6">
          <p className="text-sm">
            {year} © {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
