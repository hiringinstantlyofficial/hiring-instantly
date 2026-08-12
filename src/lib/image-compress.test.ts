import { describe, expect, it } from "vitest";

import {
  MEDIA_DIMENSIONS,
  TARGET_IMAGE_BYTES,
  fitWithin,
  renameForType,
} from "./image-compress";

/*
 * compressImage() itself needs a canvas and createImageBitmap, neither of which
 * exists in the Node test environment — it is exercised in the browser. What is
 * tested here is the geometry and naming it depends on, which is where an
 * off-by-one would silently produce a squashed logo or an unreadable extension.
 */

describe("fitWithin", () => {
  it("leaves an image already inside the box alone", () => {
    expect(fitWithin(400, 300, 1920, 1080)).toEqual({ width: 400, height: 300 });
  });

  // Upscaling a small logo would add bytes and no detail.
  it("never upscales", () => {
    expect(fitWithin(64, 64, 512, 512)).toEqual({ width: 64, height: 64 });
  });

  it("scales to the tighter of the two constraints", () => {
    // Width-bound: 4000/1920 is a harsher ratio than 1000/1080.
    expect(fitWithin(4000, 1000, 1920, 1080)).toEqual({
      width: 1920,
      height: 480,
    });
    // Height-bound.
    expect(fitWithin(1000, 4000, 1920, 1080)).toEqual({
      width: 270,
      height: 1080,
    });
  });

  it("preserves the aspect ratio of a square logo", () => {
    const { maxWidth, maxHeight } = MEDIA_DIMENSIONS.logo;
    expect(fitWithin(2048, 2048, maxWidth, maxHeight)).toEqual({
      width: 512,
      height: 512,
    });
  });

  // A canvas with a zero-length side is invalid, so an extreme ratio must not
  // round a dimension away.
  it("never rounds a side down to zero", () => {
    const result = fitWithin(10000, 3, 1920, 1080);
    expect(result.width).toBe(1920);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it("returns zeroes for a degenerate source rather than dividing by zero", () => {
    expect(fitWithin(0, 0, 512, 512)).toEqual({ width: 0, height: 0 });
  });
});

describe("renameForType", () => {
  it("swaps the extension for the encoded format", () => {
    expect(renameForType("acme-logo.png", "image/webp")).toBe("acme-logo.webp");
    expect(renameForType("banner.JPEG", "image/jpeg")).toBe("banner.jpg");
  });

  it("appends an extension when the original had none", () => {
    expect(renameForType("logo", "image/webp")).toBe("logo.webp");
  });

  it("only strips the final extension, not dots inside the name", () => {
    expect(renameForType("acme.v2.final.png", "image/webp")).toBe(
      "acme.v2.final.webp",
    );
  });

  it("falls back to a usable name when the original is only an extension", () => {
    expect(renameForType(".png", "image/webp")).toBe("image.webp");
  });
});

describe("TARGET_IMAGE_BYTES", () => {
  it("is the 200 KB ceiling uploads are compressed to", () => {
    expect(TARGET_IMAGE_BYTES).toBe(204800);
  });
});
