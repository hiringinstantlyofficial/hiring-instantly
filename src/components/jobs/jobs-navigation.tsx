"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

interface JobsNavigation {
  /** True from the moment a query is applied until the new results commit. */
  pending: boolean;
  navigate: (href: string, options?: { scroll?: boolean }) => void;
}

const JobsNavigationContext = createContext<JobsNavigation | null>(null);

/**
 * One pending flag shared by everything that re-queries the listing.
 *
 * Results live in the URL and are rendered on the server, so a search is a
 * navigation. React holds the current page on screen while that request is in
 * flight — correct, but silent: without this the listing simply sits there
 * looking finished. (`loading.tsx` does not cover it either; it belongs to
 * entering the route, not to changing its query.)
 *
 * Wrapping every push in one transition means the control that was used can
 * show a spinner and the results can dim from the same flag, instead of each
 * control knowing only about its own click.
 */
export function JobsNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      startTransition(() => router.push(href, options));
    },
    [router],
  );

  const value = useMemo(() => ({ pending, navigate }), [pending, navigate]);

  return (
    <JobsNavigationContext.Provider value={value}>
      {children}
    </JobsNavigationContext.Provider>
  );
}

/**
 * The shared transition when inside <JobsNavigationProvider>, and a private one
 * otherwise — the search bar also runs on the homepage, where there are no
 * results on screen to keep in step.
 */
export function useJobsNavigation(): JobsNavigation {
  const context = useContext(JobsNavigationContext);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      startTransition(() => router.push(href, options));
    },
    [router],
  );

  const fallback = useMemo(() => ({ pending, navigate }), [pending, navigate]);

  return context ?? fallback;
}

/**
 * Dims the results while the next set is being fetched, so the numbers and
 * cards on screen are visibly stale rather than quietly wrong.
 */
export function PendingResults({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useJobsNavigation();

  return (
    <div
      aria-busy={pending || undefined}
      className={cn(
        "transition-opacity duration-200 motion-reduce:transition-none",
        pending && "pointer-events-none opacity-40",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Screen-reader announcement plus the spinner shown inside the controls. */
export function PendingSpinner({ className }: { className?: string }) {
  return (
    <>
      <span role="status" className="sr-only">
        Loading jobs…
      </span>
      <Loader2
        aria-hidden
        className={cn("animate-spin motion-reduce:animate-none", className)}
      />
    </>
  );
}
