"use client";

import { useReviewCount } from "@/hooks/use-review-queue";

/**
 * The live count on the Review nav entry — the whole notification system for
 * the admin side. Polls once a minute via useReviewCount.
 */
export function ReviewBadge() {
  const { data: count } = useReviewCount();

  if (!count) return null;

  return (
    <span
      aria-label={`${count} awaiting review`}
      className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
