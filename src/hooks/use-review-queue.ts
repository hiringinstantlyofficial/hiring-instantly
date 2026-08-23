"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import {
  approveJob,
  approveMembership,
  rejectJob,
  requestJobChanges,
  suspendRecruiter,
} from "@/app/actions/admin";
import { riskScore, trustSignals } from "@/lib/review-signals";
import { createClient } from "@/lib/supabase/client";
import type { Recruiter } from "@/types/recruiter";
import type {
  ReviewQueueItem,
  ReviewQueueJob,
  ReviewQueueMembership,
  TrustSignal,
} from "@/types/review";

export const reviewQueueKeys = {
  all: ["admin", "review"] as QueryKey,
  queue: ["admin", "review", "queue"] as QueryKey,
  count: ["admin", "review", "count"] as QueryKey,
  recruiters: ["admin", "review", "recruiters"] as QueryKey,
};

const RECRUITER_COLUMNS =
  "user_id, full_name, work_email, email_domain, phone, designation, linkedin_url, trust_level, status";

/** A queue entry with its precomputed chips and sort score. */
export interface ScoredQueueItem {
  item: ReviewQueueItem;
  signals: TrustSignal[];
  score: number;
  createdAt: string;
}

/**
 * The admin review queue: pending jobs and pending join requests, sorted by
 * risk first (warnings up top, trusted recruiters last), age as tiebreaker.
 * Reads run as the admin through RLS, same as every other admin hook.
 */
export function useReviewQueue() {
  return useQuery({
    queryKey: reviewQueueKeys.queue,
    queryFn: async (): Promise<ScoredQueueItem[]> => {
      const supabase = createClient();

      const [jobsResult, membershipsResult] = await Promise.all([
        supabase
          .from("jobs")
          .select(
            `*, company:companies(id, slug, name, logo_url, website, is_verified, status, email_domain), recruiter:recruiters!jobs_submitted_by_fkey(${RECRUITER_COLUMNS})`,
          )
          .eq("status", "pending")
          .order("created_at", { ascending: true }),
        supabase
          .from("company_members")
          .select(
            `*, company:companies(id, slug, name, logo_url, website, email_domain, status), recruiter:recruiters!company_members_recruiter_id_fkey(${RECRUITER_COLUMNS})`,
          )
          .eq("status", "pending")
          .order("created_at", { ascending: true }),
      ]);

      const firstError = jobsResult.error ?? membershipsResult.error;
      if (firstError) throw new Error(firstError.message);

      const jobs = (jobsResult.data ?? []) as unknown as ReviewQueueJob[];
      const memberships = (membershipsResult.data ??
        []) as unknown as ReviewQueueMembership[];

      // "Has this recruiter had anything approved?" feeds the
      // first-submission chip; one query covers every card.
      const recruiterIds = [
        ...new Set(
          jobs
            .map((job) => job.submitted_by)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const approvedBy = new Set<string>();
      if (recruiterIds.length) {
        const { data: approvedRows } = await supabase
          .from("jobs")
          .select("submitted_by")
          .in("submitted_by", recruiterIds)
          .in("status", ["active", "closed", "expired"]);
        for (const row of approvedRows ?? []) {
          if (row.submitted_by) approvedBy.add(row.submitted_by);
        }
      }

      const scored: ScoredQueueItem[] = [
        ...jobs.map((job) => {
          const signals = trustSignals({
            recruiter: {
              email_domain: job.recruiter?.email_domain ?? null,
              trust_level: job.recruiter?.trust_level ?? "new",
              hasApprovedJob: job.submitted_by
                ? approvedBy.has(job.submitted_by)
                : false,
            },
            company: job.company
              ? {
                  status:
                    (job.company as { status?: string }).status ?? "active",
                  email_domain:
                    (job.company as { email_domain?: string | null })
                      .email_domain ?? null,
                  website: job.company.website,
                }
              : null,
            job: {
              salary_min: job.salary_min,
              salary_max: job.salary_max,
              application_url: job.application_url,
              approved_snapshot: job.approved_snapshot,
            },
          });
          return {
            item: { kind: "job" as const, job },
            signals,
            score: riskScore(signals),
            createdAt: job.created_at,
          };
        }),
        ...memberships.map((membership) => {
          const signals: TrustSignal[] = [];
          return {
            item: { kind: "membership" as const, membership },
            signals,
            score: 0,
            createdAt: membership.created_at,
          };
        }),
      ];

      return scored.sort(
        (a, b) =>
          b.score - a.score ||
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    },
  });
}

/** The nav badge: pending jobs + pending memberships, polled cheaply. */
export function useReviewCount() {
  return useQuery({
    queryKey: reviewQueueKeys.count,
    refetchInterval: 60_000,
    queryFn: async (): Promise<number> => {
      const supabase = createClient();
      const [jobs, memberships] = await Promise.all([
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("company_members")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);
      const firstError = jobs.error ?? memberships.error;
      if (firstError) throw new Error(firstError.message);
      return (jobs.count ?? 0) + (memberships.count ?? 0);
    },
  });
}

/** One mutation per §7 action, all invalidating the queue on settle. */
export function useReviewActions() {
  const queryClient = useQueryClient();

  const settle = {
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: reviewQueueKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    },
  };

  const wrap = async (promise: Promise<{ ok: boolean; message?: string }>) => {
    const result = await promise;
    if (!result.ok) throw new Error(result.message ?? "Action failed");
    return result;
  };

  return {
    approve: useMutation({
      mutationFn: (jobId: string) => wrap(approveJob(jobId)),
      ...settle,
    }),
    requestChanges: useMutation({
      mutationFn: (input: { job_id: string; review_note: string }) =>
        wrap(requestJobChanges(input)),
      ...settle,
    }),
    reject: useMutation({
      mutationFn: (input: { job_id: string; review_note?: string; block?: boolean }) =>
        wrap(rejectJob(input)),
      ...settle,
    }),
    decideMembership: useMutation({
      mutationFn: (input: { membershipId: string; decision: "approved" | "rejected" }) =>
        wrap(approveMembership(input.membershipId, input.decision)),
      ...settle,
    }),
  };
}

/** A recruiter with the rollups the directory shows. */
export interface RecruiterDirectoryRow extends Recruiter {
  submitted: number;
  approved: number;
  rejected: number;
  companies: string[];
}

export function useRecruiterDirectory() {
  return useQuery({
    queryKey: reviewQueueKeys.recruiters,
    queryFn: async (): Promise<RecruiterDirectoryRow[]> => {
      const supabase = createClient();

      const [recruitersResult, jobsResult, membershipsResult] =
        await Promise.all([
          supabase
            .from("recruiters")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500),
          supabase
            .from("jobs")
            .select("submitted_by, status")
            .not("submitted_by", "is", null)
            .limit(5000),
          supabase
            .from("company_members")
            .select("recruiter_id, status, company:companies(name)")
            .limit(2000),
        ]);

      const firstError =
        recruitersResult.error ?? jobsResult.error ?? membershipsResult.error;
      if (firstError) throw new Error(firstError.message);

      const stats = new Map<
        string,
        { submitted: number; approved: number; rejected: number }
      >();
      for (const row of jobsResult.data ?? []) {
        if (!row.submitted_by) continue;
        const entry = stats.get(row.submitted_by) ?? {
          submitted: 0,
          approved: 0,
          rejected: 0,
        };
        entry.submitted += 1;
        if (["active", "closed", "expired"].includes(row.status)) {
          entry.approved += 1;
        }
        if (row.status === "rejected") entry.rejected += 1;
        stats.set(row.submitted_by, entry);
      }

      const companiesByRecruiter = new Map<string, string[]>();
      for (const row of (membershipsResult.data ?? []) as unknown as {
        recruiter_id: string;
        status: string;
        company: { name: string } | null;
      }[]) {
        if (!row.company) continue;
        const list = companiesByRecruiter.get(row.recruiter_id) ?? [];
        list.push(row.company.name);
        companiesByRecruiter.set(row.recruiter_id, list);
      }

      return ((recruitersResult.data ?? []) as Recruiter[]).map((recruiter) => ({
        ...recruiter,
        ...(stats.get(recruiter.user_id) ?? {
          submitted: 0,
          approved: 0,
          rejected: 0,
        }),
        companies: companiesByRecruiter.get(recruiter.user_id) ?? [],
      }));
    },
  });
}

export function useSuspendRecruiter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { recruiterId: string; suspended: boolean }) => {
      const result = await suspendRecruiter(input.recruiterId, input.suspended);
      if (!result.ok) throw new Error(result.message ?? "Action failed");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: reviewQueueKeys.all });
    },
  });
}
