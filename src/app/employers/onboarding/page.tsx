import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/employers/onboarding-form";
import { Logo } from "@/components/ui/logo";
import { getRecruiterProfile } from "@/lib/recruiters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "About you",
  robots: { index: false, follow: false },
};

/**
 * Deliberately outside the (protected) route group: that layout redirects any
 * profile-less session here, so this page carrying the same layout would loop.
 * Middleware has already turned away anonymous visitors; the check below
 * handles the remaining cases.
 */
export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/employers/login");

  const profile = await getRecruiterProfile(supabase, user.id);
  if (profile) redirect("/employers");

  return (
    <div className="hero-pattern flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-line bg-white p-8">
        <Logo href="/" />
        <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Step 1 of 3 · About you
        </p>
        <h1 className="mt-2 text-h3">Tell us who&apos;s hiring</h1>
        <p className="mt-2 text-sm text-slate-600">
          This takes about twenty seconds, and none of it appears on the public
          site.
        </p>

        <OnboardingForm workEmail={user.email} />
      </div>
    </div>
  );
}
