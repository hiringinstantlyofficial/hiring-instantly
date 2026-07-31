"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { safeAdminRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full border border-line bg-white px-4 py-3 text-base text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      // Deliberately vague: don't confirm whether an email exists.
      setFormError(
        error.message === "Invalid login credentials"
          ? "That email and password combination doesn't match our records."
          : error.message,
      );
      return;
    }

    router.replace(safeAdminRedirect(searchParams.get("next")));
    // Re-run the server components so the new session cookie is picked up.
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-red/40 bg-accent-red/5 p-4 text-sm text-accent-red"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{formError}</p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-navy-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          aria-invalid={Boolean(errors.email)}
          className={cn(fieldClass, errors.email && "border-accent-red")}
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-1.5 text-sm text-accent-red" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-semibold text-navy-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          className={cn(fieldClass, errors.password && "border-accent-red")}
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-1.5 text-sm text-accent-red" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
