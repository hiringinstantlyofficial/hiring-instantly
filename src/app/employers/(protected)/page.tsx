import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  CircleCheck,
  Clock3,
  FileEdit,
  Pencil,
  Plus,
} from "lucide-react";

import { StatusChip } from "@/components/employers/status-chip";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  getRecruiterJobs,
  getRecruiterMemberships,
} from "@/lib/recruiters";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { MEMBERSHIP_STATUS_LABELS } from "@/types/recruiter";

export const metadata: Metadata = {
  title: "Employer dashboard",
  robots: { index: false, follow: false },
};

export default async function EmployerDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/employers/login");

  const [jobs, memberships] = await Promise.all([
    getRecruiterJobs(supabase, user.id),
    getRecruiterMemberships(supabase, user.id),
  ]);

  const counts = {
    active: jobs.filter((job) => job.status === "active").length,
    pending: jobs.filter((job) => job.status === "pending").length,
    rejected: jobs.filter((job) => job.status === "rejected").length,
    draft: jobs.filter((job) => job.status === "draft").length,
  };

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Your listings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Everything you post goes live after a quick review — usually within
            one working day.
          </p>
        </div>
        <Link
          href="/employers/jobs/new"
          className="flex items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="size-4" aria-hidden />
          Post a job
        </Link>
      </div>

      {/* Band 1 — the status strip. */}
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            { key: "active", label: "Live", icon: CircleCheck },
            { key: "pending", label: "In review", icon: Clock3 },
            { key: "rejected", label: "Need changes", icon: Pencil },
            { key: "draft", label: "Drafts", icon: FileEdit },
          ] as const
        ).map((card) => (
          <div key={card.key} className="border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-slate-400">{card.label}</dt>
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-surface text-primary">
                <card.icon className="size-4" aria-hidden />
              </span>
            </div>
            <dd className="mt-3 text-3xl font-bold text-navy-700">
              {counts[card.key]}
            </dd>
          </div>
        ))}
      </dl>

      {/* Band 2 — the job list. The empty state is the onboarding CTA. */}
      <section className="mt-8 border border-line bg-white">
        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <h2 className="text-h4">Post your first job</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {memberships.length === 0
                ? "Start by adding your company — it takes a minute — then describe the role."
                : "Your company is set up. Describe the role and submit it for review."}
            </p>
            <Link
              href={
                memberships.length === 0
                  ? "/employers/company/new"
                  : "/employers/jobs/new"
              }
              className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Plus className="size-4" aria-hidden />
              {memberships.length === 0 ? "Add your company" : "Post a job"}
            </Link>
          </div>
        ) : (
          <ul>
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center gap-4 border-b border-line-soft p-4 last:border-0"
              >
                <CompanyLogo
                  name={job.company_name}
                  logoUrl={job.company?.logo_url}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/employers/jobs/${job.id}`}
                    className="truncate font-semibold text-navy-700 hover:text-primary"
                  >
                    {job.title}
                  </Link>
                  <p className="truncate text-xs text-slate-400">
                    {job.company_name} · {job.location} · updated{" "}
                    {formatDate(job.updated_at)}
                  </p>
                  {job.status === "rejected" && job.review_note ? (
                    <p className="mt-1 truncate text-xs text-accent-red">
                      Reviewer: {job.review_note}
                    </p>
                  ) : null}
                </div>
                <StatusChip status={job.status} />
                {job.status === "active" ? (
                  <Link
                    href={`/jobs/${job.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View live
                  </Link>
                ) : (
                  <Link
                    href={`/employers/jobs/${job.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Details
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Band 3 — the company card(s) with verification state. */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your companies
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {memberships.map((membership) =>
            membership.company ? (
              <div
                key={membership.id}
                className="flex items-center gap-4 border border-line bg-white p-4"
              >
                <CompanyLogo
                  name={membership.company.name}
                  logoUrl={membership.company.logo_url}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy-700">
                    {membership.company.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {membership.status === "approved"
                      ? membership.company.status === "pending"
                        ? "Goes live with your first approved job"
                        : "You can edit this profile"
                      : MEMBERSHIP_STATUS_LABELS[membership.status]}
                  </p>
                </div>
                {membership.status === "approved" ? (
                  <Link
                    href={`/employers/company/${membership.company.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit
                  </Link>
                ) : (
                  <span className="rounded-full bg-accent-yellow/15 px-3 py-1 text-xs font-semibold text-accent-yellow">
                    {MEMBERSHIP_STATUS_LABELS[membership.status]}
                  </span>
                )}
              </div>
            ) : null,
          )}

          <Link
            href="/employers/company/new"
            className="flex items-center justify-center gap-2 border border-dashed border-line bg-white p-4 text-sm font-semibold text-slate-500 hover:border-primary hover:text-primary"
          >
            <Building2 className="size-4" aria-hidden />
            Add another company
          </Link>
        </div>
      </section>
    </div>
  );
}
