"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck, TriangleAlert } from "lucide-react";

import { requestMagicLink } from "@/app/actions/employers";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/form-state";

const fieldClass =
  "w-full border border-line bg-white px-4 py-3 text-base text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none";

/**
 * The whole sign-in surface: one email field, one button, and a "check your
 * inbox" state on the same page once the link is away. signInWithOtp with
 * shouldCreateUser is sign-up and sign-in in one call, so this form is also
 * the entire registration flow (D1).
 */
export function MagicLinkForm() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(
    requestMagicLink,
    initialFormState,
  );

  const expired = searchParams.get("error") === "expired";
  const prefill = searchParams.get("email") ?? "";

  if (state.status === "success") {
    return (
      <div className="mt-8 border border-accent-green/40 bg-accent-green/5 p-6">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 size-6 shrink-0 text-accent-green" aria-hidden />
          <div>
            <p className="font-semibold text-navy-700">Check your inbox</p>
            <p className="mt-1 text-sm text-slate-600">
              We sent a sign-in link. Open it on this device to continue — it
              expires after a short while.
            </p>
          </div>
        </div>
        {/* Resend re-runs the same action; the server-side rate limit (3 per
            hour per address) is what actually protects the mailbox. */}
        <form action={formAction} className="mt-4">
          <input type="hidden" name="email" value={prefill} />
          <p className="text-xs text-slate-400">
            Nothing arrived after a minute or two? Check spam, or head back and
            re-enter your address.
          </p>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {expired && state.status === "idle" ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-yellow/50 bg-accent-yellow/10 p-4 text-sm text-navy-700"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-accent-yellow" aria-hidden />
          <p>
            That link has expired or was already used. Enter your email and
            we&apos;ll send a fresh one.
          </p>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-red/40 bg-accent-red/5 p-4 text-sm text-accent-red"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="employer-email"
          className="mb-1.5 block text-sm font-semibold text-navy-700"
        >
          Work email
        </label>
        <input
          id="employer-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={prefill}
          placeholder="you@yourcompany.com"
          className={fieldClass}
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Use your company address if you have one — it verifies you faster.
        </p>
      </div>

      {/* Honeypot: real users never see or fill this. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="employer-website">Website</label>
        <input
          id="employer-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Sending the link…" : "Email me a sign-in link"}
      </Button>

      <p className="text-xs text-slate-400">
        No password to remember — the link signs you in, and creates your
        account the first time.
      </p>
    </form>
  );
}
