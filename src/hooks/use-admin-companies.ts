"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { revalidateCompanyPaths } from "@/app/actions/admin";
import { containsPattern } from "@/lib/postgrest";
import { createClient } from "@/lib/supabase/client";
import type { Company, CompanyStatus } from "@/types/company";

export interface AdminCompanyFilters {
  search: string;
  status: CompanyStatus | "all";
  sort: "name" | "newest" | "jobs";
}

export const adminCompanyKeys = {
  all: ["admin", "companies"] as QueryKey,
  list: (filters: AdminCompanyFilters) =>
    ["admin", "companies", filters] as QueryKey,
  options: ["admin", "companies", "options"] as QueryKey,
};

/** A company row plus the number of listings attached to it. */
export type AdminCompany = Company & { jobCount: number };

type CompanyWithCount = Company & { jobs: { count: number }[] };

/**
 * Admin reads go through the browser client with the admin's own session, so
 * RLS (`companies_admin_read_all`) is what authorises seeing hidden rows.
 *
 * The job count is an aggregate embed rather than a second query: it decides
 * whether the delete button is allowed to do anything, so it has to be exact
 * and it has to be per row.
 */
export function useAdminCompanies(filters: AdminCompanyFilters) {
  return useQuery({
    queryKey: adminCompanyKeys.list(filters),
    queryFn: async (): Promise<AdminCompany[]> => {
      const supabase = createClient();
      let query = supabase.from("companies").select("*, jobs(count)");

      if (filters.status !== "all") query = query.eq("status", filters.status);

      const search = filters.search.trim();
      if (search) {
        // `.or()` takes a raw PostgREST filter string, so the term is both
        // LIKE-escaped and quoted — see src/lib/postgrest.ts for why both.
        const pattern = containsPattern(search);
        query = query.or(
          `name.ilike.${pattern},slug.ilike.${pattern},industry.ilike.${pattern}`,
        );
      }

      if (filters.sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("name", { ascending: true });
      }

      const { data, error } = await query.limit(500);
      if (error) throw new Error(error.message);

      const rows = ((data ?? []) as unknown as CompanyWithCount[]).map(
        ({ jobs, ...company }) => ({
          ...company,
          jobCount: jobs?.[0]?.count ?? 0,
        }),
      );

      // Postgres cannot order by the embedded aggregate, so this one sort is
      // applied client-side. The list is capped at 500 rows, so it is cheap.
      return filters.sort === "jobs"
        ? rows.sort((a, b) => b.jobCount - a.jobCount || a.name.localeCompare(b.name))
        : rows;
    },
  });
}

/**
 * The lightweight list behind the job form's company picker: every company,
 * name and logo only, cached for the session.
 */
export function useCompanyOptions() {
  return useQuery({
    queryKey: adminCompanyKeys.options,
    queryFn: async (): Promise<
      Pick<Company, "id" | "name" | "slug" | "logo_url" | "status">[]
    > => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, slug, logo_url, status")
        .order("name", { ascending: true })
        .limit(1000);

      if (error) throw new Error(error.message);
      return (data ?? []) as Pick<
        Company,
        "id" | "name" | "slug" | "logo_url" | "status"
      >[];
    },
    staleTime: 60_000,
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company: Pick<Company, "id" | "slug">) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", company.id);

      if (error) {
        // 23503 is the FK violation from `on delete restrict`. The UI blocks
        // this case up front, but a listing could have been added from another
        // tab between the read and the click.
        throw new Error(
          error.code === "23503"
            ? "This company still has job listings. Reassign or delete them first."
            : error.message,
        );
      }

      await revalidateCompanyPaths(company.slug);
      return company.id;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminCompanyKeys.all });
    },
  });
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      company,
      status,
    }: {
      company: Pick<Company, "id" | "slug">;
      status: CompanyStatus;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("companies")
        .update({ status })
        .eq("id", company.id);
      if (error) throw new Error(error.message);
      await revalidateCompanyPaths(company.slug);
    },
    // Optimistic: flip the badge immediately, restore it if the write fails.
    onMutate: async ({ company, status }) => {
      await queryClient.cancelQueries({ queryKey: adminCompanyKeys.all });
      const snapshot = queryClient.getQueriesData<AdminCompany[]>({
        queryKey: adminCompanyKeys.all,
      });

      queryClient.setQueriesData<AdminCompany[]>(
        { queryKey: adminCompanyKeys.all },
        (old) =>
          Array.isArray(old)
            ? old.map((row) =>
                row.id === company.id ? { ...row, status } : row,
              )
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
      void queryClient.invalidateQueries({ queryKey: adminCompanyKeys.all });
    },
  });
}
