"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, TriangleAlert } from "lucide-react";

import { submitContactForm } from "@/app/actions/public";
import { initialFormState } from "@/lib/form-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full border border-line bg-white px-4 py-3 text-base text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-sm text-accent-red" role="alert">
      {message}
    </p>
  );
}

/**
 * The `?intent=post-a-job` deep link from the header button prefills the
 * subject. It is read here rather than from the page's searchParams so
 * /contact stays a static route — reading searchParams on the server would opt
 * the whole page out of prerendering for one input's default value. The caller
 * wraps this in <Suspense>, which useSearchParams requires.
 */
export function ContactForm() {
  const searchParams = useSearchParams();
  const defaultSubject =
    searchParams.get("intent") === "post-a-job"
      ? "I'd like to post a job"
      : undefined;

  const [state, formAction] = useActionState(
    submitContactForm,
    initialFormState,
  );

  if (state.status === "success") {
    return (
      <div className="border border-accent-green/40 bg-accent-green/5 p-8 text-center">
        <CheckCircle2
          className="mx-auto size-10 text-accent-green"
          aria-hidden
        />
        <h2 className="mt-4 text-h3">Message sent</h2>
        <p className="mt-2 text-base text-slate-600">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-red/40 bg-accent-red/5 p-4 text-sm text-accent-red"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-semibold text-navy-700"
          >
            Your name <span className="text-accent-red">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={Boolean(state.errors?.name)}
            className={cn(fieldClass, state.errors?.name && "border-accent-red")}
            placeholder="Priya Sharma"
          />
          <FieldError message={state.errors?.name} />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-navy-700"
          >
            Email <span className="text-accent-red">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(state.errors?.email)}
            className={cn(fieldClass, state.errors?.email && "border-accent-red")}
            placeholder="you@example.com"
          />
          <FieldError message={state.errors?.email} />
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-1.5 block text-sm font-semibold text-navy-700"
        >
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          defaultValue={defaultSubject}
          className={fieldClass}
          placeholder="How can we help?"
        />
        <FieldError message={state.errors?.subject} />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-semibold text-navy-700"
        >
          Message <span className="text-accent-red">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          aria-invalid={Boolean(state.errors?.message)}
          className={cn(
            fieldClass,
            "resize-y",
            state.errors?.message && "border-accent-red",
          )}
          placeholder="Tell us a little about what you need…"
        />
        <FieldError message={state.errors?.message} />
      </div>

      {/* Honeypot: bots fill it, people never see it. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <SubmitButton />

      <p className="text-sm text-slate-400">
        By sending this message you agree to our{" "}
        <a href="/privacy-policy" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
