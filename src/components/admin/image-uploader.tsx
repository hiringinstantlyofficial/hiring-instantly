"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { compressImage, TARGET_IMAGE_BYTES } from "@/lib/image-compress";
import {
  COMPANY_MEDIA_BUCKET,
  companyMediaPath,
  formatBytes,
  storagePathFromPublicUrl,
  uploadRejectionReason,
  uploadedSizeRejection,
  type MediaKind,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  kind: MediaKind;
  /** Owns the folder the object is written to. */
  companyId: string;
  /** The current public URL, or "" / null when nothing is set. */
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  hint?: string;
  /** Aspect of the preview box: a logo is square, a cover is a wide band. */
  aspect?: "square" | "wide";
}

/**
 * Upload / replace / remove for one image on a company.
 *
 * Writes go through the *browser* Supabase client, so the admin's own session
 * authorises them and the bucket's RLS policy is what actually gates the write.
 * The service-role key is deliberately nowhere near this component.
 *
 * Deleting the previous object is best-effort by design: an orphaned file in
 * the bucket is harmless, whereas a column left pointing at a deleted object
 * puts a broken image on the public profile. So the column write is what is
 * trusted, and a failed cleanup never blocks it.
 */
export function ImageUploader({
  kind,
  companyId,
  value,
  onChange,
  label,
  hint,
  aspect = "square",
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<
    "optimising" | "uploading" | "removing" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  /** Before/after byte counts from the last optimisation, shown once done. */
  const [savings, setSavings] = useState<{ from: number; to: number } | null>(
    null,
  );

  /**
   * A blob: URL for the file just compressed in this session.
   *
   * The preview renders this in preference to the stored URL, which avoids a
   * race the uploader would otherwise hit on every single upload: Supabase's
   * public CDN can briefly 404 an object that was written a moment ago, and
   * asking for it straight back makes that the browser's problem. Showing the
   * bytes we already hold in memory is also instant and costs no round trip.
   */
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Object URLs are held by the document until explicitly released.
  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    },
    [localPreview],
  );

  const current = value?.trim() ? value.trim() : null;

  /** Deletes an object we own. Never throws — see the note above. */
  const removeStoredObject = async (url: string | null) => {
    const path = storagePathFromPublicUrl(url);
    if (!path) return;

    try {
      await createClient().storage.from(COMPANY_MEDIA_BUCKET).remove([path]);
    } catch {
      // An orphan is acceptable; a failed cleanup must not surface as a form
      // error or roll back the column change the admin asked for.
    }
  };

  const upload = async (picked: File) => {
    const rejection = uploadRejectionReason(picked);
    if (rejection) {
      setError(rejection);
      return;
    }

    setError(null);
    setSavings(null);

    /*
     * Compress before anything leaves the page.
     *
     * What an admin picks is whatever the employer's press kit contained — a
     * 4 MB PNG export of a 200-pixel logo is the norm. Re-encoding here keeps
     * the bucket small and, more importantly, keeps the bytes off the public
     * profile: an externally hosted logo bypasses next/image entirely, so the
     * stored file is the file visitors download.
     */
    setBusy("optimising");

    let file: File;
    try {
      const compressed = await compressImage(picked, kind);
      file = compressed.file;

      const tooBig = uploadedSizeRejection(compressed.bytes);
      if (tooBig) {
        setBusy(null);
        setError(tooBig);
        return;
      }

      if (!compressed.skipped) {
        setSavings({ from: compressed.originalBytes, to: compressed.bytes });
      }

      // Shown immediately, so the admin sees the result of the compression
      // while the upload is still in flight.
      setLocalPreview(URL.createObjectURL(file));
    } catch (reason) {
      setBusy(null);
      setError(
        reason instanceof Error
          ? reason.message
          : "That image could not be processed.",
      );
      return;
    }

    setBusy("uploading");

    const previous = current;
    const supabase = createClient();
    const path = companyMediaPath(
      kind,
      companyId,
      file.type,
      crypto.randomUUID(),
    );

    const { error: uploadError } = await supabase.storage
      .from(COMPANY_MEDIA_BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: false });

    if (uploadError) {
      setBusy(null);
      // Nothing was stored, so drop the local preview — leaving it up would
      // show an image the form is not actually pointing at.
      setLocalPreview(null);
      setSavings(null);
      setError(
        /bucket not found/i.test(uploadError.message)
          ? "The company-media bucket doesn't exist yet — apply the storage migration or create it in the Supabase dashboard."
          : uploadError.message,
      );
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(COMPANY_MEDIA_BUCKET).getPublicUrl(path);

    onChange(publicUrl);
    setBusy(null);

    // Only after the field points at the new object.
    await removeStoredObject(previous);
  };

  const remove = async () => {
    setError(null);
    setSavings(null);
    setLocalPreview(null);
    setBusy("removing");
    const previous = current;
    onChange(null);
    await removeStoredObject(previous);
    setBusy(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const pending = busy !== null;

  /*
   * Deliberately NOT next/image.
   *
   * This is a ~200px box on an admin screen showing an image that is already
   * capped at 200 KB, so the optimiser buys nothing — and it costs something
   * real: it re-fetches the object server-side the instant it is written, and
   * surfaces any non-200 from Storage as a 500 on the preview. A plain <img>
   * against the blob we already hold sidesteps both.
   */
  const previewSrc = localPreview ?? current;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-semibold text-navy-700"
      >
        {label}
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
        className={cn(
          "relative flex items-center justify-center overflow-hidden border border-dashed bg-surface-muted",
          aspect === "wide" ? "aspect-[3/1]" : "aspect-square max-w-[200px]",
          dragging ? "border-primary bg-primary-surface" : "border-line",
        )}
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- see above
          <img
            src={previewSrc}
            alt=""
            className={cn(
              "absolute inset-0 size-full bg-white",
              aspect === "wide" ? "object-cover" : "object-contain",
            )}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-slate-400">
            <ImageUp className="size-7" aria-hidden />
            <p className="text-xs">Drop an image here, or choose a file</p>
          </div>
        )}

        {pending ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80">
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
            <p className="text-xs font-semibold text-slate-600" role="status">
              {busy === "optimising"
                ? "Optimising…"
                : busy === "uploading"
                  ? "Uploading…"
                  : "Removing…"}
            </p>
          </div>
        ) : null}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        disabled={pending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
        className="sr-only"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {current ? "Replace image" : "Upload image"}
        </Button>
        <span className="text-xs text-slate-400">
          Resized and re-encoded to under {formatBytes(TARGET_IMAGE_BYTES)}
        </span>
        {current ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => void remove()}
          >
            <Trash2 className="size-4" aria-hidden />
            Remove
          </Button>
        ) : null}
      </div>

      {savings && !error ? (
        <p className="mt-2 text-xs font-semibold text-accent-green">
          Optimised {formatBytes(savings.from)} → {formatBytes(savings.to)}
        </p>
      ) : null}

      {hint && !error ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-sm text-accent-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
