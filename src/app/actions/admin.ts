"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { JOBS_CACHE_TAG } from "@/lib/jobs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Flushes every cached surface a job appears on. Called by the admin mutations
 * so an edit is live without waiting out a revalidate window.
 *
 * Two layers, and both are needed. revalidateTag drops the cached Supabase
 * reads in lib/jobs.ts — without it /jobs would keep serving the previous
 * listing from the data cache even though the route re-renders on every
 * request. revalidatePath then drops the rendered HTML for the routes that are
 * statically generated or ISR.
 */
export async function revalidateJobPaths(slug?: string) {
  revalidateTag(JOBS_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/companies");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/jobs/${slug}`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
