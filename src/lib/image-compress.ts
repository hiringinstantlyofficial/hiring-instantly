/**
 * Browser-side image compression, run before anything reaches Supabase Storage.
 *
 * Company logos and profile banners are uploaded by hand from whatever the
 * employer's press kit happened to contain — routinely a 4 MB PNG export of a
 * 200-pixel logo. Storing that costs bucket space forever and, more to the
 * point, ships it to every visitor: `next/image` only re-encodes what it is
 * asked for, and an unoptimizable host (an admin-pasted external URL) bypasses
 * the optimiser entirely. Shrinking at the source fixes both.
 *
 * Everything here is decode → draw → re-encode on a canvas, so there is no
 * dependency to add and nothing to run server-side. The DOM is touched only
 * inside functions, never at module scope, so the pure helpers below stay
 * unit-testable under Node.
 */

import type { MediaKind } from "@/lib/storage";

/** What an upload has to fit into once compressed. */
export const TARGET_IMAGE_BYTES = 200 * 1024;

/**
 * Pixel ceilings per slot.
 *
 * A logo is never rendered above 96 CSS px on this site, so 512 leaves room for
 * a 3× display and nothing more. The banner is full-bleed, so it gets a
 * standard desktop width.
 */
export const MEDIA_DIMENSIONS: Record<
  MediaKind,
  { maxWidth: number; maxHeight: number }
> = {
  logo: { maxWidth: 512, maxHeight: 512 },
  cover: { maxWidth: 1920, maxHeight: 1080 },
};

/**
 * Scale/quality pairs, tried in order and stopping at the first result under
 * the target. Quality is spent before pixels: a slightly softer banner reads
 * better than a crisp quarter-size one blown back up by the browser.
 */
const ATTEMPTS: { scale: number; quality: number }[] = [
  { scale: 1, quality: 0.85 },
  { scale: 1, quality: 0.7 },
  { scale: 1, quality: 0.55 },
  { scale: 0.75, quality: 0.7 },
  { scale: 0.75, quality: 0.5 },
  { scale: 0.5, quality: 0.6 },
  { scale: 0.5, quality: 0.42 },
  { scale: 0.35, quality: 0.5 },
];

export interface CompressionResult {
  file: File;
  originalBytes: number;
  bytes: number;
  width: number;
  height: number;
  /** True when the source was already small enough and was passed through. */
  skipped: boolean;
  /** True when every attempt still came out over TARGET_IMAGE_BYTES. */
  overTarget: boolean;
}

/**
 * Fits `width`×`height` inside the given box, preserving aspect ratio and
 * never upscaling — enlarging a small logo would add bytes and no detail.
 */
export function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };

  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    // Math.max(1, …) so an extreme aspect ratio cannot round a side to zero,
    // which would make the canvas invalid.
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

/** Swaps the extension on the original filename for the encoded one. */
export function renameForType(fileName: string, mimeType: string): string {
  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  const stem = fileName.replace(/\.[^./\\]+$/, "") || "image";
  return `${stem}.${extension}`;
}

let webpSupport: boolean | null = null;

/**
 * Whether canvas can encode WebP.
 *
 * WebP is the format worth having: it is the only one of the bucket's allowed
 * types that carries both an alpha channel (logos are routinely transparent
 * PNGs) and a quality dial. Every evergreen browser has encoded it since 2020,
 * so the JPEG fallback below is close to dead code — it exists so an old
 * browser degrades to a working upload rather than a broken one.
 */
function supportsWebp(): boolean {
  if (webpSupport !== null) return webpSupport;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    webpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpSupport = false;
  }

  return webpSupport;
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * Decodes the file, honouring EXIF orientation where the browser supports it.
 *
 * Without `imageOrientation` a photo shot on a phone draws sideways, and since
 * the canvas bakes the result in, the banner would be stored rotated.
 */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

/**
 * Re-encodes `file` to fit both the pixel ceiling for its slot and
 * TARGET_IMAGE_BYTES.
 *
 * A file already inside both limits is returned untouched — re-encoding a
 * hand-optimised 12 KB logo would only throw away quality.
 *
 * Throws only when the image cannot be decoded at all. If every attempt
 * overshoots the target the smallest one is returned with `overTarget` set,
 * because a large upload is a worse outcome than a failed one only up to a
 * point — the caller still enforces the bucket's own hard limit.
 */
export async function compressImage(
  file: File,
  kind: MediaKind,
): Promise<CompressionResult> {
  const { maxWidth, maxHeight } = MEDIA_DIMENSIONS[kind];

  let bitmap: ImageBitmap;
  try {
    bitmap = await decode(file);
  } catch {
    throw new Error("That file could not be read as an image.");
  }

  // Captured up front: close() zeroes the bitmap's dimensions, and both of the
  // pass-through branches below report the source size after releasing it.
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;

  const fitted = fitWithin(sourceWidth, sourceHeight, maxWidth, maxHeight);

  const passThrough = (): CompressionResult => ({
    file,
    originalBytes: file.size,
    bytes: file.size,
    width: sourceWidth,
    height: sourceHeight,
    skipped: true,
    overTarget: false,
  });

  const alreadySmallEnough =
    file.size <= TARGET_IMAGE_BYTES &&
    fitted.width === sourceWidth &&
    fitted.height === sourceHeight;

  if (alreadySmallEnough) {
    bitmap.close();
    return passThrough();
  }

  const type = supportsWebp() ? "image/webp" : "image/jpeg";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("This browser could not process the image.");
  }

  let best: { blob: Blob; width: number; height: number } | null = null;

  for (const attempt of ATTEMPTS) {
    const width = Math.max(1, Math.round(fitted.width * attempt.scale));
    const height = Math.max(1, Math.round(fitted.height * attempt.scale));

    canvas.width = width;
    canvas.height = height;

    // Cleared, not filled, so a transparent logo stays transparent. JPEG has
    // no alpha channel and would render those pixels black, so that fallback
    // gets an explicit white ground first.
    context.clearRect(0, 0, width, height);
    if (type === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await toBlob(canvas, type, attempt.quality);
    if (!blob) continue;

    if (!best || blob.size < best.blob.size) best = { blob, width, height };
    if (blob.size <= TARGET_IMAGE_BYTES) break;
  }

  bitmap.close();

  if (!best) throw new Error("The image could not be re-encoded.");

  // Some already-efficient sources (a small WebP, a flat PNG) survive a
  // round-trip larger than they started. Keeping the original is both smaller
  // and lossless, so the re-encode is discarded.
  if (best.blob.size >= file.size && file.size <= TARGET_IMAGE_BYTES) {
    return passThrough();
  }

  return {
    file: new File([best.blob], renameForType(file.name, best.blob.type), {
      type: best.blob.type,
      lastModified: file.lastModified,
    }),
    originalBytes: file.size,
    bytes: best.blob.size,
    width: best.width,
    height: best.height,
    skipped: false,
    overTarget: best.blob.size > TARGET_IMAGE_BYTES,
  };
}
