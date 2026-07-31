/**
 * One choke point for runtime error reporting.
 *
 * Scattered `console.error` calls end up in Vercel's function logs, which are
 * ephemeral and hard to search — the analysis's point. Routing everything
 * through here means wiring a real error tracker is a change to *one* file:
 *
 *   1. `npm install @sentry/nextjs` and run `npx @sentry/wizard@latest -i nextjs`
 *      (it needs a DSN from your own Sentry project).
 *   2. Import `captureException` here and call it inside `captureError` below.
 *
 * Until then the payload is emitted as a single structured JSON line, which is
 * at least greppable in the log drain and parses cleanly into any collector.
 */

export type Severity = "warning" | "error";

interface ReportContext {
  /** Where it happened, e.g. "jobs.getJobs" or "contact.insert". */
  scope: string;
  severity?: Severity;
  /** Anything useful for triage. Must not contain PII or secrets. */
  meta?: Record<string, unknown>;
}

/** Pulls a loggable shape out of whatever was thrown. */
function describe(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  if (error && typeof error === "object") {
    // Supabase/PostgREST errors are plain objects: { code, message, details }.
    return { ...(error as Record<string, unknown>) };
  }
  return { message: String(error) };
}

export function captureError(
  error: unknown,
  { scope, severity = "error", meta }: ReportContext,
): void {
  const payload = {
    level: severity,
    scope,
    ...(meta ? { meta } : {}),
    error: describe(error),
  };

  // TODO: forward to Sentry here once a DSN is configured — see the note above.
  const line = safeStringify(payload);
  if (severity === "warning") console.warn(line);
  else console.error(line);
}

/** Never let a logging call be the thing that throws. */
function safeStringify(payload: unknown): string {
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}
