"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { revalidateArticlePaths } from "@/app/actions/admin";
import { containsPattern } from "@/lib/postgrest";
import { createClient } from "@/lib/supabase/client";
import type { ArticleStatus, ArticleSummary } from "@/types/blog";

export interface AdminArticleFilters {
  search: string;
  status: ArticleStatus | "all";
  sort: "newest" | "oldest" | "title";
}

export const adminArticleKeys = {
  all: ["admin", "articles"] as QueryKey,
  list: (filters: AdminArticleFilters) =>
    ["admin", "articles", filters] as QueryKey,
};

/** Every column but the body — the table never renders 1,600 words of markdown. */
const SUMMARY_COLUMNS =
  "id, slug, title, description, excerpt, category, reading_minutes, tags, related, status, published_at, revised_at, created_at, updated_at";

/**
 * Admin reads go through the browser client with the admin's own session, so
 * RLS (`articles_admin_read_all`) is what authorises seeing drafts and posts
 * whose publish date has not arrived.
 */
export function useAdminArticles(filters: AdminArticleFilters) {
  return useQuery({
    queryKey: adminArticleKeys.list(filters),
    queryFn: async (): Promise<ArticleSummary[]> => {
      const supabase = createClient();
      let query = supabase.from("articles").select(SUMMARY_COLUMNS);

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const search = filters.search.trim();
      if (search) {
        const pattern = containsPattern(search);
        query = query.or(
          `title.ilike.${pattern},description.ilike.${pattern},slug.ilike.${pattern}`,
        );
      }

      switch (filters.sort) {
        case "oldest":
          query = query.order("published_at", { ascending: true });
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
        default:
          query = query.order("published_at", { ascending: false });
      }

      const { data, error } = await query.limit(200);
      if (error) throw new Error(error.message);
      return (data ?? []) as ArticleSummary[];
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: Pick<ArticleSummary, "id" | "slug">) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);
      if (error) throw new Error(error.message);
      await revalidateArticlePaths(article.slug);
      return article.id;
    },
    // Optimistic: drop the row immediately, restore it if the delete fails.
    onMutate: async (article) => {
      await queryClient.cancelQueries({ queryKey: adminArticleKeys.all });
      const snapshot = queryClient.getQueriesData<ArticleSummary[]>({
        queryKey: adminArticleKeys.all,
      });

      queryClient.setQueriesData<ArticleSummary[]>(
        { queryKey: adminArticleKeys.all },
        (old) =>
          Array.isArray(old) ? old.filter((row) => row.id !== article.id) : old,
      );

      return { snapshot };
    },
    onError: (_error, _article, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminArticleKeys.all });
    },
  });
}

export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      article,
      status,
    }: {
      article: Pick<ArticleSummary, "id" | "slug">;
      status: ArticleStatus;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("articles")
        .update({ status })
        .eq("id", article.id);
      if (error) throw new Error(error.message);
      await revalidateArticlePaths(article.slug);
    },
    onMutate: async ({ article, status }) => {
      await queryClient.cancelQueries({ queryKey: adminArticleKeys.all });
      const snapshot = queryClient.getQueriesData<ArticleSummary[]>({
        queryKey: adminArticleKeys.all,
      });

      queryClient.setQueriesData<ArticleSummary[]>(
        { queryKey: adminArticleKeys.all },
        (old) =>
          Array.isArray(old)
            ? old.map((row) =>
                row.id === article.id ? { ...row, status } : row,
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
      void queryClient.invalidateQueries({ queryKey: adminArticleKeys.all });
    },
  });
}
