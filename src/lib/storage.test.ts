import { describe, expect, it } from "vitest";

import {
  COMPANY_MEDIA_BUCKET,
  MAX_IMAGE_BYTES,
  MAX_SOURCE_BYTES,
  companyMediaPath,
  formatBytes,
  storagePathFromPublicUrl,
  uploadRejectionReason,
  uploadedSizeRejection,
} from "./storage";

const SUPABASE_HOST = "https://project.supabase.co";
const publicUrl = (path: string) =>
  `${SUPABASE_HOST}/storage/v1/object/public/${COMPANY_MEDIA_BUCKET}/${path}`;

const UUID = "8b1f2c3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d";
const COMPANY = "11111111-2222-3333-4444-555555555555";

describe("companyMediaPath", () => {
  it("files an upload under its kind and company", () => {
    expect(companyMediaPath("logo", COMPANY, "image/png", UUID)).toBe(
      `logos/${COMPANY}/${UUID}.png`,
    );
    expect(companyMediaPath("cover", COMPANY, "image/webp", UUID)).toBe(
      `covers/${COMPANY}/${UUID}.webp`,
    );
  });

  it("maps jpeg to the conventional extension", () => {
    expect(companyMediaPath("logo", COMPANY, "image/jpeg", UUID)).toMatch(
      /\.jpg$/,
    );
  });
});

describe("storagePathFromPublicUrl", () => {
  it("recovers the object path from a URL in our bucket", () => {
    expect(storagePathFromPublicUrl(publicUrl(`logos/${COMPANY}/${UUID}.png`))).toBe(
      `logos/${COMPANY}/${UUID}.png`,
    );
  });

  it("decodes a percent-encoded path", () => {
    expect(
      storagePathFromPublicUrl(publicUrl("covers/a%20b/logo%20final.png")),
    ).toBe("covers/a b/logo final.png");
  });

  /*
   * The whole point of returning null: this value drives a delete. Anything we
   * do not own must not be deletable, and the legacy company-logos bucket is
   * still serving backfilled URLs, so it counts as "not ours to remove".
   */
  it("returns null for a different bucket, including the legacy one", () => {
    expect(
      storagePathFromPublicUrl(
        `${SUPABASE_HOST}/storage/v1/object/public/company-logos/acme.png`,
      ),
    ).toBeNull();
    expect(
      storagePathFromPublicUrl(
        `${SUPABASE_HOST}/storage/v1/object/public/avatars/acme.png`,
      ),
    ).toBeNull();
  });

  it("returns null for an external URL", () => {
    expect(storagePathFromPublicUrl("https://cdn.example.com/logo.png")).toBeNull();
  });

  it("returns null for an unparseable or empty value", () => {
    expect(storagePathFromPublicUrl("not a url")).toBeNull();
    expect(storagePathFromPublicUrl("")).toBeNull();
    expect(storagePathFromPublicUrl(null)).toBeNull();
  });

  it("returns null when the bucket prefix has no object after it", () => {
    expect(
      storagePathFromPublicUrl(
        `${SUPABASE_HOST}/storage/v1/object/public/${COMPANY_MEDIA_BUCKET}/`,
      ),
    ).toBeNull();
  });
});

describe("uploadRejectionReason", () => {
  it("accepts the mime types the bucket allows", () => {
    expect(uploadRejectionReason({ type: "image/png", size: 1024 })).toBeNull();
    expect(uploadRejectionReason({ type: "image/avif", size: 1024 })).toBeNull();
  });

  // SVG is excluded deliberately: it is an executable document served inline
  // from a public bucket.
  it("rejects SVG and other types outside the allowlist", () => {
    expect(uploadRejectionReason({ type: "image/svg+xml", size: 1024 })).toMatch(
      /PNG, JPEG, WebP or AVIF/,
    );
    expect(uploadRejectionReason({ type: "application/pdf", size: 1024 })).not.toBeNull();
  });

  /*
   * The source is judged against MAX_SOURCE_BYTES, not the bucket's 5 MB limit:
   * compression runs between this check and the upload, so a 12 MB press-kit
   * PNG is a perfectly reasonable thing to pick.
   */
  it("accepts a source above the bucket limit but below the decode ceiling", () => {
    expect(
      uploadRejectionReason({ type: "image/png", size: MAX_IMAGE_BYTES * 2 }),
    ).toBeNull();
  });

  it("rejects a source too large to decode in the browser", () => {
    expect(
      uploadRejectionReason({ type: "image/png", size: MAX_SOURCE_BYTES + 1 }),
    ).toMatch(/limit is 25\.0 MB/);
    expect(
      uploadRejectionReason({ type: "image/png", size: MAX_SOURCE_BYTES }),
    ).toBeNull();
  });

  it("rejects an empty file", () => {
    expect(uploadRejectionReason({ type: "image/png", size: 0 })).toBe(
      "That file is empty.",
    );
  });
});

describe("uploadedSizeRejection", () => {
  it("passes a compressed result inside the bucket limit", () => {
    expect(uploadedSizeRejection(180 * 1024)).toBeNull();
    expect(uploadedSizeRejection(MAX_IMAGE_BYTES)).toBeNull();
  });

  it("blocks a result the bucket would reject with a 413", () => {
    expect(uploadedSizeRejection(MAX_IMAGE_BYTES + 1)).toMatch(
      /over the 5\.0 MB limit/,
    );
  });
});

describe("formatBytes", () => {
  it("scales the unit to the magnitude", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(200 * 1024)).toBe("200 KB");
    expect(formatBytes(3.25 * 1024 * 1024)).toBe("3.3 MB");
  });
});
