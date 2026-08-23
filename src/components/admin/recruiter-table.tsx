"use client";

import { useState } from "react";
import { BadgeCheck, ExternalLink } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  useRecruiterDirectory,
  useSuspendRecruiter,
  type RecruiterDirectoryRow,
} from "@/hooks/use-review-queue";
import { freeEmailDomain } from "@/lib/recruiters";
import { cn, formatDate } from "@/lib/utils";
import { TRUST_LEVEL_LABELS } from "@/types/recruiter";

/** Name, LinkedIn, email and designation — shared by desktop rows and mobile cards. */
function RecruiterIdentity({ recruiter }: { recruiter: RecruiterDirectoryRow }) {
  return (
    <>
      <p className="font-semibold text-navy-700">
        {recruiter.full_name}
        {recruiter.linkedin_url ? (
          <a
            href={recruiter.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="ml-1.5 inline-block align-middle text-slate-400 hover:text-primary"
            aria-label={`${recruiter.full_name} on LinkedIn`}
          >
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : null}
      </p>
      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        {recruiter.work_email}
        {freeEmailDomain(recruiter.email_domain) ? (
          <span className="rounded-full bg-accent-yellow/15 px-1.5 text-[10px] font-semibold text-accent-yellow">
            free email
          </span>
        ) : (
          <span title="Corporate domain">
            <BadgeCheck className="size-3.5 text-accent-green" aria-hidden />
          </span>
        )}
      </p>
      {recruiter.designation ? (
        <p className="text-xs text-slate-400">{recruiter.designation}</p>
      ) : null}
    </>
  );
}

function RecruiterStatusButton({
  recruiter,
  disabled,
  onToggle,
}: {
  recruiter: RecruiterDirectoryRow;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        recruiter.status === "suspended"
          ? "bg-accent-red/10 text-accent-red hover:bg-accent-red/20"
          : "bg-accent-green/10 text-accent-green hover:bg-accent-yellow/20 hover:text-accent-yellow",
      )}
    >
      {recruiter.status === "suspended" ? "Suspended — restore" : "Active"}
    </button>
  );
}

/**
 * The recruiter directory: who has an account, what they've sent, and the
 * suspend toggle — the one kill switch, enforced by is_recruiter() across
 * every policy at once.
 */
export function RecruiterTable() {
  const { data, isPending, isError, error } = useRecruiterDirectory();
  const suspend = useSuspendRecruiter();
  const [confirming, setConfirming] = useState<RecruiterDirectoryRow | null>(null);

  // Restoring is safe to do in one tap; suspending goes through the dialog.
  const toggleStatus = (recruiter: RecruiterDirectoryRow) => {
    if (recruiter.status === "suspended") {
      suspend.mutate({ recruiterId: recruiter.user_id, suspended: false });
    } else {
      setConfirming(recruiter);
    }
  };

  return (
    <div className="border border-line bg-white">
      {isError ? (
        <p className="p-6 text-sm text-accent-red" role="alert">
          Couldn&apos;t load recruiters: {error.message}
        </p>
      ) : null}

      {isPending ? (
        <div className="space-y-3 p-4" aria-busy="true">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="skeleton h-14 w-full" />
          ))}
        </div>
      ) : null}

      {!isPending && !isError && (data ?? []).length === 0 ? (
        <p className="p-10 text-center text-base text-slate-600">
          No recruiter accounts yet. The first sign-ups appear here.
        </p>
      ) : null}

      {/* Phones get stacked cards — the 900px table would clip six of its
          seven columns off the viewport with no hint they exist. */}
      {(data ?? []).length ? (
        <ul className="divide-y divide-line-soft md:hidden">
          {(data ?? []).map((recruiter) => (
            <li key={recruiter.user_id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <RecruiterIdentity recruiter={recruiter} />
                </div>
                <div className="shrink-0">
                  <RecruiterStatusButton
                    recruiter={recruiter}
                    disabled={suspend.isPending}
                    onToggle={() => toggleStatus(recruiter)}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                <a
                  href={`tel:${recruiter.phone}`}
                  className="text-primary hover:underline"
                >
                  {recruiter.phone}
                </a>{" "}
                · joined {formatDate(recruiter.created_at)}
              </p>
              <p className="mt-1 truncate text-xs text-slate-600">
                {recruiter.companies.join(", ") || "No companies yet"}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Sent / live / bounced: {recruiter.submitted} /{" "}
                {recruiter.approved} / {recruiter.rejected} ·{" "}
                {TRUST_LEVEL_LABELS[recruiter.trust_level]}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {(data ?? []).length ? (
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left text-sm">
            <caption className="sr-only">Recruiters</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-slate-400">
                <th scope="col" className="px-4 py-3 font-semibold">Recruiter</th>
                <th scope="col" className="px-4 py-3 font-semibold">Phone</th>
                <th scope="col" className="px-4 py-3 font-semibold">Companies</th>
                <th scope="col" className="px-4 py-3 font-semibold">Sent / live / bounced</th>
                <th scope="col" className="px-4 py-3 font-semibold">Trust</th>
                <th scope="col" className="px-4 py-3 font-semibold">Joined</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((recruiter) => (
                <tr key={recruiter.user_id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3">
                    <RecruiterIdentity recruiter={recruiter} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a href={`tel:${recruiter.phone}`} className="text-primary hover:underline">
                      {recruiter.phone}
                    </a>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                    {recruiter.companies.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {recruiter.submitted} / {recruiter.approved} / {recruiter.rejected}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {TRUST_LEVEL_LABELS[recruiter.trust_level]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(recruiter.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RecruiterStatusButton
                      recruiter={recruiter}
                      disabled={suspend.isPending}
                      onToggle={() => toggleStatus(recruiter)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Suspend this recruiter?"
        description={
          confirming
            ? `${confirming.full_name} (${confirming.work_email}) will be unable to submit, edit or withdraw anything until restored. Their live listings stay live.`
            : ""
        }
        confirmLabel="Suspend"
        pending={suspend.isPending}
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          if (!confirming) return;
          suspend.mutate(
            { recruiterId: confirming.user_id, suspended: true },
            { onSettled: () => setConfirming(null) },
          );
        }}
      />
    </div>
  );
}
