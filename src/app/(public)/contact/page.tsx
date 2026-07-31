import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with the ${siteConfig.name} team — post a job, report a listing, or ask a question. We reply within two working days.`,
  alternates: { canonical: "/contact" },
};

/**
 * Fully static. The `?intent=` prefill is read inside <ContactForm> so this
 * page prerenders and can be prefetched from the header's "Post a Job" button,
 * rather than being server-rendered on every visit for one default value.
 */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact us"
        subtitle="Questions about a listing, want to post a role, or spotted something wrong? Send us a note and a human will get back to you."
        breadcrumb={[{ name: "Contact", href: "/contact" }]}
      />

      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div>
            <h2 className="sr-only">Contact form</h2>
            <Suspense fallback={<div className="skeleton h-[560px] w-full" />}>
              <ContactForm />
            </Suspense>
          </div>

          <aside className="space-y-6">
            <div className="border border-line p-6">
              <h2 className="text-h4">Reach us directly</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="font-semibold text-navy-700">Email</p>
                    <a
                      href={`mailto:${siteConfig.contactEmail}`}
                      className="text-slate-600 hover:text-primary"
                    >
                      {siteConfig.contactEmail}
                    </a>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="font-semibold text-navy-700">Response time</p>
                    <p className="text-slate-600">
                      Within 2 working days, Mon–Fri
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="font-semibold text-navy-700">Based in</p>
                    <p className="text-slate-600">India — we operate remotely</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border border-line bg-surface-muted p-6">
              <h2 className="text-h4">Employers</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Listings are reviewed before they go live. Send the role title,
                location, compensation range and an application link, and we
                will publish it or come back with questions.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
