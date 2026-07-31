import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="hero-pattern flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-line bg-white p-8">
        <Logo href="/admin" />
        <h1 className="mt-8 text-h3">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          This area is restricted to the site administrator.
        </p>

        <Suspense fallback={<div className="skeleton mt-8 h-72 w-full" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
