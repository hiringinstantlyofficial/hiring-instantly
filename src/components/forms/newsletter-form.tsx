"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { subscribeToNewsletter } from "@/app/actions/public";
import { initialFormState } from "@/lib/form-state";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Subscribing…" : "Subscribe"}
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(
    subscribeToNewsletter,
    initialFormState,
  );

  return (
    <form action={formAction} className="mt-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email Address"
          className="min-w-0 flex-1 bg-white px-4 py-3 text-sm text-navy-700 placeholder:text-slate-400 focus:outline-none"
        />
        {/* Honeypot — hidden from users and assistive tech alike. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />
        <SubmitButton />
      </div>

      {state.message ? (
        <p
          role="status"
          className={
            state.status === "error"
              ? "mt-3 text-sm text-accent-red"
              : "mt-3 text-sm text-accent-green"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
