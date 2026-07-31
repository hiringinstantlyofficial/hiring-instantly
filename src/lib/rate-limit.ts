import "server-only";

import { captureError } from "@/lib/observability";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

/*
 * Fixed-window rate limiting for the public forms.
 *
 * Two backends. When UPSTASH_REDIS_REST_URL/_TOKEN are set the counter lives in
 * Redis and is therefore shared by every serverless instance and survives cold
 * starts — the limit actually holds. Without them it falls back to an in-memory
 * Map, which on Vercel is per-isolate and resets constantly: enough to blunt a
 * naive script locally, trivial to walk past in production. Set the Upstash
 * vars before launch; see .env.example.
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, "");
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_ENABLED = Boolean(REDIS_URL && REDIS_TOKEN);

/** Upstash rejects a few characters in keys; namespace and normalise here. */
function redisKey(key: string): string {
  return `ratelimit:${key.replace(/\s+/g, "_")}`;
}

interface UpstashReply {
  result?: number | null;
  error?: string;
}

/**
 * INCR the counter, set its TTL only on creation (NX), read the TTL back —
 * one round trip, and no window-extension bug from re-arming the expiry on
 * every hit.
 */
async function redisRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const k = redisKey(key);

  const response = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", k],
      ["PEXPIRE", k, String(windowMs), "NX"],
      ["PTTL", k],
    ]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash responded ${response.status}`);
  }

  const replies = (await response.json()) as UpstashReply[];
  const failure = replies.find((reply) => reply.error);
  if (failure) throw new Error(failure.error);

  const count = Number(replies[0]?.result ?? 0);
  const ttlMs = Number(replies[2]?.result ?? windowMs);
  // PTTL returns -1 (no expiry) or -2 (missing) in edge cases; treat both as a
  // fresh full window rather than reporting a negative retry-after.
  const remainingMs = ttlMs > 0 ? ttlMs : windowMs;

  if (count > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil(remainingMs / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

// --- in-memory fallback -----------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

function memoryRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size > MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function rateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  if (REDIS_ENABLED) {
    try {
      return await redisRateLimit(key, options);
    } catch (error) {
      // Degrade to the in-memory limiter rather than failing the submission or
      // leaving the endpoint entirely unprotected.
      captureError(error, {
        scope: "rateLimit.upstash",
        severity: "warning",
        meta: { fallback: "in-memory" },
      });
    }
  }

  return memoryRateLimit(key, options);
}

/** Best-effort client IP from proxy headers. */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
