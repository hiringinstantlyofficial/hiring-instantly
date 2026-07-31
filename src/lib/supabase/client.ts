"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Browser Supabase client. Only ever sees the anon key, so every query it makes
 * is subject to Row-Level Security.
 *
 * Memoised into a module-level singleton, which is what @supabase/ssr expects:
 * the admin hooks call this on every query and mutation, and a fresh client per
 * call means a fresh auth-state listener, a fresh token-refresh timer and a
 * fresh realtime connection each time — they accumulate for the life of the
 * page. The module is per-tab, so there is no cross-request leakage to worry
 * about the way there would be on the server.
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export function createClient() {
  browserClient ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return browserClient;
}
