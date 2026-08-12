/**
 * Supabase Storage helpers for the company logo and cover images.
 *
 * Deliberately free of any Supabase client import: everything here is pure
 * string/File work, so it unit-tests without a mock and can be called from both
 * the browser uploader and a server route.
 */

export const COMPANY_MEDIA_BUCKET = "company-media";

/** Folder prefixes inside the bucket, one per image slot. */
export const MEDIA_KINDS = {
  logo: "logos",
  cover: "covers",
} as const;

export type MediaKind = keyof typeof MEDIA_KINDS;

/**
 * Must mirror the bucket's own `allowed_mime_types` and `file_size_limit` (see
 * supabase/migrations/20260813090100_storage_company_media.sql). Checking here
 * first turns a silent 413 or a mime rejection into a readable field error.
 *
 * SVG is absent on purpose — it is an executable document served inline from a
 * public bucket, and next/image will not optimise it anyway.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
] as const;

/** The bucket's own hard ceiling. Nothing may be uploaded above this. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * The largest source file worth decoding in the browser.
 *
 * Uploads are re-encoded down to TARGET_IMAGE_BYTES before they leave the page
 * (see lib/image-compress.ts), so the bucket's 5 MB limit is not what the admin
 * should be held to — a 12 MB press-kit PNG compresses to a fraction of it and
 * is a perfectly reasonable thing to pick. This ceiling exists only so that
 * decoding a pathologically large file cannot lock up the tab.
 */
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** "148 KB" / "3.2 MB", for size messages and the before/after readout. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Returns an error message when the *picked* file cannot be used, or `null`
 * when it can. A message rather than a thrown error: the caller renders it
 * inline.
 *
 * Only the source is judged here. Its size is checked against MAX_SOURCE_BYTES,
 * not the bucket limit, because compression runs between this check and the
 * upload; uploadedSizeRejection() is the guard on what actually goes up.
 */
export function uploadRejectionReason(file: {
  type: string;
  size: number;
}): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Use a PNG, JPEG, WebP or AVIF image.";
  }
  if (file.size === 0) {
    return "That file is empty.";
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return `That image is ${formatBytes(file.size)}, which is too large to process in the browser. The limit is ${formatBytes(
      MAX_SOURCE_BYTES,
    )}.`;
  }
  return null;
}

/**
 * Final guard on the compressed result, mirroring the bucket's own
 * `file_size_limit`. Reaching this means compression could not get an image
 * under 5 MB, which should not happen — better a clear message than a 413.
 */
export function uploadedSizeRejection(bytes: number): string | null {
  if (bytes > MAX_IMAGE_BYTES) {
    return `Even after optimising, this image is ${formatBytes(
      bytes,
    )} — over the ${formatBytes(MAX_IMAGE_BYTES)} limit. Try a smaller crop.`;
  }
  return null;
}

/**
 * Object path for a new upload: `logos/<companyId>/<uuid>.<ext>`.
 *
 * The name is a fresh UUID rather than the company slug or the original
 * filename, so replacing an image always produces a new URL. A stable name
 * would keep being served from the CDN's cache of the old bytes.
 */
export function companyMediaPath(
  kind: MediaKind,
  companyId: string,
  mimeType: string,
  uuid: string,
): string {
  const extension = EXTENSIONS[mimeType] ?? "bin";
  return `${MEDIA_KINDS[kind]}/${companyId}/${uuid}.${extension}`;
}

/**
 * The object path inside COMPANY_MEDIA_BUCKET for a stored public URL, or
 * `null` when the URL points somewhere we must not delete from — an external
 * CDN, a different bucket, or the legacy `company-logos` bucket.
 *
 * This is what makes "replace" and "remove" able to clean up the old object
 * without storing the path in a second column.
 */
export function storagePathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const marker = `/storage/v1/object/public/${COMPANY_MEDIA_BUCKET}/`;
  const index = parsed.pathname.indexOf(marker);
  if (index === -1) return null;

  const path = parsed.pathname.slice(index + marker.length);
  if (!path) return null;

  // Storage paths are percent-encoded in the URL; the SDK wants them raw.
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
