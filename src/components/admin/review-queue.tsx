"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Inbox, ShieldOff } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RecruiterBlock, ReviewPreview } from "@/components/admin/review-preview";
import { TrustChips } from "@/components/admin/trust-chips";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  useReviewActions,
  useReviewQueue,
  type ScoredQueueItem,
} from "@/hooks/use-review-queue";
import { cn } from "@/lib/utils";

/** Anything older than this in the queue renders its age in amber. */
const AMBER_AGE_MS = 24 * 60 * 60 * 1000;

const CANNED_REASONS = [
  "Salary range missing — listings without one convert poorly and we prioritise complete ones.",
  "The apply link doesn't resolve. Please check the URL and resubmit.",
  "This reads as an advertisement rather than a role description. Please describe the actual position, responsibilities and requirements.",
  "The description is too thin to publish. Please add responsibilities and requirements.",
] as const;

function ageLabel(iso: string): { text: string; amber: boolean } {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return { text: "just now", amber: false };
  if (hours < 24) return { text: `${hours}h`, amber: false };
  return { text: `${Math.floor(hours / 24)}d`, amber: ms > AMBER_AGE_MS };
}

function typeChip(entry: ScoredQueueItem): string {
  if (entry.item.kind === "membership") return "Join request";
  if (entry.item.job.approved_snapshot !== null) return "Re-review";
  if (
    entry.item.job.company &&
    (entry.item.job.company as { status?: string }).status === "pending"
  ) {
    return "New company";
  }
  return "New job";
}

/**
 * The approval queue (§7): list left, preview right, keyboard first. The
 * design target is clearing twenty submissions in under three minutes without
 * ever approving something unread — the preview renders the full listing, and
 * a re-review opens on the diff.
 */
export function ReviewQueue() {
  const { data: entries, isPending, isError, error } = useReviewQueue();
  const actions = useReviewActions();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [changesFor, setChangesFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [rejectFor, setRejectFor] = useState<{ jobId: string; block: boolean } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const list = useMemo(() => entries ?? [], [entries]);
  const selected = list[Math.min(selectedIndex, Math.max(list.length - 1, 0))];

  const busy =
    actions.approve.isPending ||
    actions.requestChanges.isPending ||
    actions.reject.isPending ||
    actions.decideMembership.isPending;

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await fn();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Action failed");
    }
  };

  const approveSelected = () => {
    if (!selected || busy) return;
    if (selected.item.kind === "job") {
      const jobId = selected.item.job.id;
      void runAction(() => actions.approve.mutateAsync(jobId));
    } else {
      const membershipId = selected.item.membership.id;
      void runAction(() =>
        actions.decideMembership.mutateAsync({ membershipId, decision: "approved" }),
      );
    }
  };

  // ↓/↑ or J/K to move · A approve · R request changes · E full editor.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (changesFor || rejectFor) return;

      switch (event.key.toLowerCase()) {
        case "j":
        case "arrowdown":
          event.preventDefault();
          setSelectedIndex((index) => Math.min(index + 1, list.length - 1));
          break;
        case "k":
        case "arrowup":
          event.preventDefault();
          setSelectedIndex((index) => Math.max(index - 1, 0));
          break;
        case "a":
          event.preventDefault();
          approveSelected();
          break;
        case "r":
          event.preventDefault();
          if (selected?.item.kind === "job") {
            setNote("");
            setChangesFor(selected.item.job.id);
          }
          break;
        case "e":
          if (selected?.item.kind === "job") {
            event.preventDefault();
            window.location.href = `/admin/jobs/${selected.item.job.id}/edit`;
          }
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- approveSelected closes over the same state this effect lists
  }, [list.length, selected, changesFor, rejectFor, busy]);

  if (isPending) {
    return (
      <div className="space-y-3 p-6" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="p-6 text-sm text-accent-red" role="alert">
        Couldn&apos;t load the queue: {error.message}
      </p>
    );
  }

  if (list.length === 0) {
    return (
      <div className="p-16 text-center">
        <Inbox className="mx-auto size-10 text-slate-300" aria-hidden />
        <h2 className="mt-4 text-h4">Queue&apos;s clear</h2>
        <p className="mt-1 text-sm text-slate-500">
          New submissions land here the moment a recruiter hits submit.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Queue — sorted by risk, time as tiebreaker. */}
      <div className="w-full shrink-0 lg:w-[380px]">
        <p className="mb-2 text-xs text-slate-400">
          <kbd className="border border-line bg-white px-1">J</kbd>/
          <kbd className="border border-line bg-white px-1">K</kbd> move ·{" "}
          <kbd className="border border-line bg-white px-1">A</kbd> approve ·{" "}
          <kbd className="border border-line bg-white px-1">R</kbd> request changes ·{" "}
          <kbd className="border border-line bg-white px-1">E</kbd> full editor
        </p>
        <ul className="max-h-[75vh] overflow-y-auto border border-line bg-white">
          {list.map((entry, index) => {
            const isSelected = index === selectedIndex;
            const age = ageLabel(entry.createdAt);
            const title =
              entry.item.kind === "job"
                ? entry.item.job.title
                : `Wants to manage ${entry.item.membership.company?.name ?? "a company"}`;
            const companyName =
              entry.item.kind === "job"
                ? entry.item.job.company_name
                : entry.item.membership.company?.name ?? "";
            const logo =
              entry.item.kind === "job"
                ? entry.item.job.company?.logo_url
                : entry.item.membership.company?.logo_url;
            const recruiter =
              entry.item.kind === "job"
                ? entry.item.job.recruiter
                : entry.item.membership.recruiter;

            return (
              <li key={entry.item.kind === "job" ? entry.item.job.id : entry.item.membership.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-current={isSelected}
                  className={cn(
                    "w-full border-b border-line-soft px-4 py-3 text-left",
                    isSelected ? "bg-primary-surface" : "hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      {typeChip(entry)}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-semibold",
                        age.amber ? "text-accent-yellow" : "text-slate-400",
                      )}
                    >
                      {age.text}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <CompanyLogo name={companyName || "?"} logoUrl={logo} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-700">{title}</p>
                      <p className="truncate text-xs text-slate-400">
                        {recruiter
                          ? `${recruiter.full_name} · @${recruiter.email_domain}`
                          : companyName}
                      </p>
                    </div>
                  </div>
                  <TrustChips signals={entry.signals} className="mt-2" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Preview + actions. */}
      <div className="min-w-0 flex-1">
        {actionError ? (
          <p className="mb-4 border border-accent-red/40 bg-accent-red/5 p-3 text-sm text-accent-red" role="alert">
            {actionError}
          </p>
        ) : null}

        {selected ? (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Button size="sm" disabled={busy} onClick={approveSelected}>
                <CheckCircle2 className="size-4" aria-hidden />
                {selected.item.kind === "job" ? "Approve" : "Approve access"}
              </Button>
              {selected.item.kind === "job" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setNote("");
                      setChangesFor(selected.item.kind === "job" ? selected.item.job.id : null);
                    }}
                  >
                    Request changes
                  </Button>
                  <Link
                    href={`/admin/jobs/${selected.item.job.id}/edit`}
                    className="border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-surface"
                  >
                    Approve with edits
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    className="text-accent-red hover:bg-accent-red/5"
                    onClick={() =>
                      setRejectFor({
                        jobId: selected.item.kind === "job" ? selected.item.job.id : "",
                        block: true,
                      })
                    }
                  >
                    <ShieldOff className="size-4" aria-hidden />
                    Reject &amp; block
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    if (selected.item.kind !== "membership") return;
                    const membershipId = selected.item.membership.id;
                    void runAction(() =>
                      actions.decideMembership.mutateAsync({
                        membershipId,
                        decision: "rejected",
                      }),
                    );
                  }}
                >
                  Decline access
                </Button>
              )}
            </div>

            {selected.item.kind === "job" ? (
              <ReviewPreview job={selected.item.job} signals={selected.signals} />
            ) : (
              <div className="space-y-4">
                <div className="border border-line bg-white p-6">
                  <h2 className="text-h4">
                    Access request for {selected.item.membership.company?.name}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-slate-600">
                    Approving lets this recruiter edit the company profile —
                    logo, cover and description — on an indexed public page.
                    They can already post jobs (those come through this queue
                    anyway); this decision is only about profile control.
                  </p>
                </div>
                <RecruiterBlock
                  recruiter={selected.item.membership.recruiter}
                  signals={selected.signals}
                  submittedAt={selected.item.membership.created_at}
                />
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Request-changes dialog: canned reasons that fill an editable note —
          editable because a canned rejection with no specifics is why review
          loops stall. */}
      {changesFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 p-4">
          <div className="w-full max-w-lg border border-line bg-white p-6">
            <h2 className="text-h4">What needs to change?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Sent to the recruiter word for word, with an edit link.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CANNED_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setNote(reason)}
                  className="border border-line px-3 py-1.5 text-left text-xs text-slate-600 hover:border-primary hover:text-primary"
                >
                  {reason.split("—")[0]!.split(".")[0]}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              autoFocus
              placeholder="Be specific — the recruiter fixes exactly what this says."
              className="mt-4 w-full resize-y border border-line bg-white px-3.5 py-2.5 text-sm text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setChangesFor(null)} disabled={busy}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={busy || note.trim().length === 0}
                onClick={() => {
                  const jobId = changesFor;
                  void runAction(async () => {
                    await actions.requestChanges.mutateAsync({
                      job_id: jobId,
                      review_note: note.trim(),
                    });
                    setChangesFor(null);
                  });
                }}
              >
                {busy ? "Sending…" : "Send to recruiter"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(rejectFor)}
        title="Reject and block this recruiter?"
        description="The listing is rejected and the recruiter's account is suspended — every write they attempt is refused until you un-suspend them from the directory. Their already-live listings stay live."
        confirmLabel="Reject & block"
        pending={busy}
        onCancel={() => setRejectFor(null)}
        onConfirm={() => {
          if (!rejectFor) return;
          void runAction(async () => {
            await actions.reject.mutateAsync({
              job_id: rejectFor.jobId,
              review_note: "This listing doesn't meet our guidelines.",
              block: rejectFor.block,
            });
            setRejectFor(null);
          });
        }}
      />
    </div>
  );
}
