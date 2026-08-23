"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { completeOnboarding } from "@/app/actions/employers";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/form-state";

const fieldClass =
  "w-full border border-line bg-white px-4 py-3 text-base text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-sm text-accent-red" role="alert">
      {message}
    </p>
  );
}

/**
 * Journey A step 1 — about you. ~20 seconds of typing. The work email is
 * shown locked: it was verified by the magic link and the server ignores any
 * other value.
 */
export function OnboardingForm({ workEmail }: { workEmail: string }) {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialFormState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.status === "error" && !state.errors ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-red/40 bg-accent-red/5 p-4 text-sm text-accent-red"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div>
        <label htmlFor="ob-email" className="mb-1.5 block text-sm font-semibold text-navy-700">
          Work email
        </label>
        <input
          id="ob-email"
          type="email"
          value={workEmail}
          readOnly
          disabled
          className={`${fieldClass} bg-slate-50 text-slate-500`}
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Verified by the link you just clicked.
        </p>
      </div>

      <div>
        <label htmlFor="ob-name" className="mb-1.5 block text-sm font-semibold text-navy-700">
          Full name <span className="text-accent-red">*</span>
        </label>
        <input
          id="ob-name"
          name="full_name"
          autoComplete="name"
          required
          placeholder="Rahul Sharma"
          className={fieldClass}
        />
        <FieldError message={state.errors?.full_name} />
      </div>

      <div>
        <label htmlFor="ob-phone" className="mb-1.5 block text-sm font-semibold text-navy-700">
          Mobile number <span className="text-accent-red">*</span>
        </label>
        <input
          id="ob-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          inputMode="tel"
          placeholder="98765 43210"
          className={fieldClass}
        />
        <p className="mt-1.5 text-xs text-slate-400">
          An Indian mobile number (+91). Never shown publicly — our team may
          call to verify a listing.
        </p>
        <FieldError message={state.errors?.phone} />
      </div>

      <div>
        <label htmlFor="ob-designation" className="mb-1.5 block text-sm font-semibold text-navy-700">
          Your role
        </label>
        <input
          id="ob-designation"
          name="designation"
          autoComplete="organization-title"
          placeholder="Talent Acquisition Lead"
          className={fieldClass}
        />
        <FieldError message={state.errors?.designation} />
      </div>

      <div>
        <label htmlFor="ob-linkedin" className="mb-1.5 block text-sm font-semibold text-navy-700">
          LinkedIn profile
        </label>
        <input
          id="ob-linkedin"
          name="linkedin_url"
          type="url"
          placeholder="https://www.linkedin.com/in/…"
          className={fieldClass}
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Optional, but it speeds up your first review.
        </p>
        <FieldError message={state.errors?.linkedin_url} />
      </div>

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Saving…" : "Continue to your company"}
      </Button>
    </form>
  );
}
