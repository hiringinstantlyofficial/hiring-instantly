import { cn } from "@/lib/utils";

interface CapacityMeterProps {
  applied: number;
  capacity: number | null;
  className?: string;
}

/** The thin green progress bar + "5 applied of 10 capacity" line on each card. */
export function CapacityMeter({
  applied,
  capacity,
  className,
}: CapacityMeterProps) {
  if (!capacity || capacity <= 0) return null;

  const percent = Math.min(Math.round((applied / capacity) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      <div
        className="h-1 w-full bg-line"
        role="progressbar"
        aria-valuenow={applied}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-label={`${applied} of ${capacity} applications received`}
      >
        <div
          className="h-full bg-accent-green"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        <span className="font-bold text-navy-700">{applied} applied</span> of{" "}
        {capacity} capacity
      </p>
    </div>
  );
}
