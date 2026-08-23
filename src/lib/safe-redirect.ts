/**
 * Validation for the `?next=` parameter the admin login honours after a
 * successful sign-in.
 *
 * A `startsWith("/admin")` prefix test is not enough: `/admin@evil.com` passes
 * it while resolving to a different origin in some URL parsers, `//evil.com`
 * is protocol-relative, and `/admin/../../x` normalises out of the admin area.
 * So the value is parsed against a throwaway base and judged on the *resolved*
 * pathname rather than on the raw string.
 */
const FALLBACK = "/admin";
const BASE = "http://redirect.invalid";

/**
 * Backslashes — browsers fold them to `/`, so `/\evil.com` would otherwise
 * become protocol-relative — and C0/C1 control characters, which URL parsers
 * disagree about (some strip them, some percent-encode them).
 *
 * Written as a code-point scan rather than a regex literal so the control
 * characters stay readable as names instead of raw bytes in the source.
 */
function hasUnsafeChar(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code === 0x5c) return true; // backslash
    if (code <= 0x1f) return true; // C0 controls
    if (code >= 0x7f && code <= 0x9f) return true; // DEL and C1 controls
  }
  return false;
}

/**
 * Percent-encoded `/` and `\`. `new URL` deliberately leaves these encoded, so
 * `/admin/..%2f..%2fevil` still looks like it lives under /admin/ to the check
 * below — while a proxy or router that decodes before matching would see the
 * traversal. No legitimate admin URL needs an encoded separator, so this is a
 * cheap way out of the disagreement.
 */
const ENCODED_SEPARATOR = /%(?:2f|5c)/i;

/**
 * The general form: same validation, parameterised over which path prefixes
 * are acceptable destinations. Each prefix admits itself and anything nested
 * under it (`/employers` admits `/employers` and `/employers/jobs/new`).
 */
export function safeInternalRedirect(
  raw: string | null | undefined,
  allowedPrefixes: readonly string[],
  fallback: string,
): string {
  if (!raw) return fallback;

  // Reject anything that isn't plainly a same-origin absolute path before it
  // ever reaches the parser.
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (hasUnsafeChar(raw)) return fallback;
  if (ENCODED_SEPARATOR.test(raw)) return fallback;

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return fallback;
  }

  // `new URL` has now resolved any `..` segments and percent-encoding, so the
  // test below sees the path a browser would actually navigate to.
  if (url.origin !== BASE) return fallback;

  const allowed = allowedPrefixes.some(
    (prefix) =>
      url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
  );
  if (!allowed) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}

export function safeAdminRedirect(raw: string | null | undefined): string {
  return safeInternalRedirect(raw, ["/admin"], FALLBACK);
}

/** The recruiter-side counterpart, used by the login page and the callback. */
export function safeEmployerRedirect(raw: string | null | undefined): string {
  return safeInternalRedirect(raw, ["/employers"], "/employers");
}
