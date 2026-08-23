"use client";

import { useEffect, useRef } from "react";
import { Send, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Native <dialog> so focus trapping, Escape-to-close and inertness of the rest
 * of the page come from the platform rather than hand-rolled JS.
 *
 * `variant` follows the confirm button: "danger" (the default, red, for
 * deletes and blocks) or "send" (primary, for the newsletter broadcasts).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  variant = "danger",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "send";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] border border-line bg-white p-0 backdrop:bg-navy-900/40"
    >
      <div className="p-6">
        <div className="flex gap-4">
          {variant === "danger" ? (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-red/10 text-accent-red">
              <TriangleAlert className="size-5" aria-hidden />
            </span>
          ) : (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Send className="size-5" aria-hidden />
            </span>
          )}
          <div>
            <h2 id="confirm-title" className="text-h4">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
