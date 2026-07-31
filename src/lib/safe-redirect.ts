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

export function safeAdminRedirect(raw: string | null | undefined): string {
  if (!raw) return FALLBACK;

  // Reject anything that isn't plainly a same-origin absolute path before it
  // ever reaches the parser.
  if (!raw.startsWith("/")) return FALLBACK;
  if (raw.startsWith("//")) return FALLBACK;
  if (hasUnsafeChar(raw)) return FALLBACK;
  if (ENCODED_SEPARATOR.test(raw)) return FALLBACK;

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return FALLBACK;
  }

  // `new URL` has now resolved any `..` segments and percent-encoding, so the
  // test below sees the path a browser would actually navigate to.
  if (url.origin !== BASE) return FALLBACK;
  if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) {
    return FALLBACK;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
