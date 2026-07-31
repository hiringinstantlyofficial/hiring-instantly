"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { revalidateJobPaths } from "@/app/actions/admin";
import { containsPattern } from "@/lib/postgrest";
import { createClient } from "@/lib/supabase/client";
import type { Job, JobStatus } from "@/types/job";

export interface AdminJobFilters {
  search: string;
  status: JobStatus | "all";
  sort: "newest" | "oldest" | "title";
}

export const adminJobKeys = {
  all: ["admin", "jobs"] as QueryKey,
  list: (filters: AdminJobFilters) => ["admin", "jobs", filters] as QueryKey,
  detail: (id: string) => ["admin", "jobs", "detail", id] as QueryKey,
  stats: ["admin", "jobs", "stats"] as QueryKey,
};

/**
 * Admin reads go through the browser client with the admin's own session, so
 * RLS (`jobs_admin_read_all`) is what actually authorises seeing drafts.
 */
export function useAdminJobs(filters: AdminJobFilters) {
  return useQuery({
    queryKey: adminJobKeys.list(filters),
    queryFn: async (): Promise<Job[]> => {
      const supabase = createClient();
      let query = supabase.from("jobs").select("*");

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const search = filters.search.trim();
      if (search) {
        // `.or()` is a raw PostgREST filter string, so the term is both
        // LIKE-escaped and quoted: stripping `%,()` (the previous approach)
        // left `.` free to be read as an operator separator, and mangled
        // legitimate searches for names like "Node.js" or "Bengaluru, KA".
        const pattern = containsPattern(search);
        query = query.or(
          `title.ilike.${pattern},company_name.ilike.${pattern},location.ilike.${pattern}`,
        );
      }

      switch (filters.sort) {
        case "oldest":
          query = query.order("posted_at", { ascending: true });
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
        default:
          query = query.order("posted_at", { ascending: false });
      }

      const { data, error } = await query.limit(200);
      if (error) throw new Error(error.message);
      return (data ?? []) as Job[];
    },
  });
}

export interface AdminStats {
  total: number;
  active: number;
  draft: number;
  postedThisWeek: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminJobKeys.stats,
    queryFn: async (): Promise<AdminStats> => {
      const supabase = createClient();
      const weekAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      // Four HEAD counts in parallel — no rows transferred.
      const [total, active, draft, thisWeek] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .gte("posted_at", weekAgo),
      ]);

      const firstError =
        total.error ?? active.error ?? draft.error ?? thisWeek.error;
      if (firstError) throw new Error(firstError.message);

      return {
        total: total.count ?? 0,
        active: active.count ?? 0,
        draft: draft.count ?? 0,
        postedThisWeek: thisWeek.count ?? 0,
      };
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: Pick<Job, "id" | "slug">) => {
      const supabase = createClient();
      const { error } = await supabase.from("jobs").delete().eq("id", job.id);
      if (error) throw new Error(error.message);
      await revalidateJobPaths(job.slug);
      return job.id;
    },
    // Optimistic: drop the row immediately, restore it if the delete fails.
    onMutate: async (job) => {
      await queryClient.cancelQueries({ queryKey: adminJobKeys.all });
      const snapshot = queryClient.getQueriesData<Job[]>({
        queryKey: adminJobKeys.all,
      });

      queryClient.setQueriesData<Job[]>({ queryKey: adminJobKeys.all }, (old) =>
        Array.isArray(old) ? old.filter((row) => row.id !== job.id) : old,
      );

      return { snapshot };
    },
    onError: (_error, _job, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminJobKeys.all });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      job,
      status,
    }: {
      job: Pick<Job, "id" | "slug">;
      status: JobStatus;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("jobs")
        .update({ status })
        .eq("id", job.id);
      if (error) throw new Error(error.message);
      await revalidateJobPaths(job.slug);
    },
    onMutate: async ({ job, status }) => {
      await queryClient.cancelQueries({ queryKey: adminJobKeys.all });
      const snapshot = queryClient.getQueriesData<Job[]>({
        queryKey: adminJobKeys.all,
      });

      queryClient.setQueriesData<Job[]>({ queryKey: adminJobKeys.all }, (old) =>
        Array.isArray(old)
          ? old.map((row) => (row.id === job.id ? { ...row, status } : row))
          : old,
      );

      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminJobKeys.all });
    },
  });
}
