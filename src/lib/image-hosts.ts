/**
 * Which remote image hosts may go through the Next.js image optimiser.
 *
 * Must mirror `images.remotePatterns` in next.config.ts — both derive the list
 * from the same two env vars. next/image throws at render time on a src that
 * isn't covered by remotePatterns, so components check here first and fall back
 * to a plain <img> instead of taking the page down over a company logo.
 */

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? safeHostname(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const extraHosts = (process.env.NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * True when `url` is an https URL on an allowlisted host, i.e. safe to hand to
 * next/image. Anything else — http, a data URI, an unknown host — is not.
 */
export function isOptimizableImage(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase();
  if (supabaseHost && host === supabaseHost) {
    return parsed.pathname.startsWith("/storage/v1/object/public/");
  }
  return extraHosts.includes(host);
}
