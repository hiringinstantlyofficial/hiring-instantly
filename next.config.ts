import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

/*
 * Extra logo hosts, comma separated, from NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS.
 *
 * This list must stay in sync with isOptimizableImage() in
 * src/lib/image-hosts.ts, which decides at render time whether a logo goes
 * through next/image or falls back to a plain <img>. Both read the same env
 * vars; next.config cannot import from src/ (no path aliases here).
 */
const extraImageHosts = (process.env.NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  /*
   * Pin the workspace root to this project.
   *
   * A stray, empty package-lock.json in C:\Users\Chowl made Next infer the
   * whole user profile as the root, so build-time file tracing walked Desktop,
   * Documents, AppData and OneDrive. Pinning it keeps tracing inside the repo.
   */
  outputFileTracingRoot: process.cwd(),

  images: {
    /*
     * Company logos live in Supabase Storage; admins may also paste an
     * external URL.
     *
     * There is deliberately NO `hostname: "**"` entry here. A wildcard turns
     * the built-in image optimiser into an open proxy for any HTTPS URL on the
     * internet — an SSRF primitive and a trivial way to make the server fetch
     * and resize arbitrarily large files. Logos on hosts outside this list
     * still display; they just render unoptimised (see src/lib/image-hosts.ts).
     */
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      ...extraImageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
    ],
  },

  poweredByHeader: false,

  experimental: {
    /*
     * Client-side router cache lifetimes.
     *
     * Next 15 ships `dynamic: 0`, which means a server-rendered route is
     * refetched on *every* navigation to it — including pressing Back. /jobs is
     * dynamic (it reads searchParams), so the common loop of scanning the list,
     * opening a role and coming back paid a full server round trip each way.
     *
     * 30s keeps that loop instant while staying short enough that a returning
     * visitor still sees fresh listings; the cache is per-tab and in-memory, so
     * a reload always bypasses it. Job data itself is revalidated on write via
     * revalidateJobPaths(), which is what guarantees correctness here.
     */
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },

  // Long-lived immutable caching for the hashed static chunks.
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
