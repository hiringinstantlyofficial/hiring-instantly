"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { withdrawSubmission } from "@/app/actions/employers";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";

/** Pulls a pending submission back to a private draft, with a confirm step. */
export function WithdrawButton({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
        Withdraw from review
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-accent-red" role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title="Withdraw this submission?"
        description={`"${jobTitle}" will leave the review queue and go back to being a private draft. You can resubmit it any time.`}
        confirmLabel="Withdraw"
        pending={pending}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          setPending(true);
          setError(null);
          const result = await withdrawSubmission(jobId);
          setPending(false);
          setConfirming(false);
          if (!result.ok) {
            setError(result.message ?? "Couldn't withdraw the submission.");
            return;
          }
          router.refresh();
        }}
      />
    </>
  );
}
