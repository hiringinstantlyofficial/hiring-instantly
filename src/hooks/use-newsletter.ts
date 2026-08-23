"use client";

import { useMutation, useQuery, type QueryKey } from "@tanstack/react-query";

import { sendJobNewsletter } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/client";

export const newsletterKeys = {
  count: ["admin", "newsletter", "count"] as QueryKey,
};

/**
 * How many people a broadcast would reach — shown in the "email the
 * subscribers?" prompts. Reads as the admin through RLS (newsletter_admin_read)
 * with a HEAD count, so no addresses ever reach the browser.
 */
export function useNewsletterSubscriberCount() {
  return useQuery({
    queryKey: newsletterKeys.count,
    staleTime: 60_000,
    queryFn: async (): Promise<number> => {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .is("unsubscribed_at", null);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });
}

/** Fires the broadcast; resolves to how many subscribers were emailed. */
export function useSendJobNewsletter() {
  return useMutation({
    mutationFn: async (jobId: string): Promise<number> => {
      const result = await sendJobNewsletter(jobId);
      if (!result.ok) {
        throw new Error(result.message ?? "Couldn't email the subscribers.");
      }
      return result.sent ?? 0;
    },
  });
}
