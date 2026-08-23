import { cn } from "@/lib/utils";
import type { TrustSignal } from "@/types/review";

const TONES: Record<TrustSignal["tone"], string> = {
  ok: "bg-accent-green/10 text-accent-green",
  warn: "bg-accent-yellow/15 text-accent-yellow",
  info: "bg-accent-blue/10 text-accent-blue",
};

const PREFIX: Record<TrustSignal["tone"], string> = {
  ok: "✓",
  warn: "!",
  info: "↻",
};

/**
 * The auto-computed chips on a queue card — the queue's real intelligence
 * (§7): they let the admin skim the 80% that is obviously fine and spend the
 * attention on the cards that earned a warning.
 */
export function TrustChips({
  signals,
  className,
}: {
  signals: TrustSignal[];
  className?: string;
}) {
  if (!signals.length) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {signals.map((signal) => (
        <li
          key={signal.id}
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            TONES[signal.tone],
          )}
        >
          <span aria-hidden>{PREFIX[signal.tone]}</span> {signal.label}
        </li>
      ))}
    </ul>
  );
}
