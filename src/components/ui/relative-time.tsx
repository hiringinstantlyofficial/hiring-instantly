"use client";

import { useEffect, useState } from "react";

import { relativeTime } from "@/lib/utils";

/**
 * "Posted 2 days ago", rendered without a hydration mismatch.
 *
 * relativeTime() reads the clock, so the server and the client can legitimately
 * disagree — a job posted 59 seconds before the response is "just now" in the
 * HTML and "1 minute ago" by the time React hydrates. These pages are also ISR
 * (revalidate 600), so the server's copy can be up to ten minutes stale.
 *
 * The server string is emitted as-is for crawlers and for the no-JS case, the
 * mismatch is explicitly suppressed on this one text node, and an effect
 * recomputes against the visitor's actual clock after mount. The wrapping
 * <time dateTime> keeps the exact timestamp machine-readable regardless.
 */
export function RelativeTime({
  date,
  className,
}: {
  date: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() => relativeTime(date));

  useEffect(() => {
    setLabel(relativeTime(date));
  }, [date]);

  return (
    <time dateTime={date} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
