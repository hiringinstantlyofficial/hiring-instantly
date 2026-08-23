"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus, Search } from "lucide-react";

import { CompanyLogo } from "@/components/ui/company-logo";
import { escapeLike } from "@/lib/postgrest";
import { createClient } from "@/lib/supabase/client";

export interface CompanySearchHit {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  headquarters: string | null;
  /** Live listings, shown so the recruiter recognises "their" company. */
  jobCount: number;
}

interface CompanySearchRow extends Omit<CompanySearchHit, "jobCount"> {
  jobs: { count: number }[];
}

/**
 * The search-or-create fork of the company step (D4). The two outcomes are
 * deliberately different in the UI: picking an existing company *requests
 * access* (an admin or a domain match approves it), while the tail item
 * creates a fresh, pending company the recruiter owns outright.
 *
 * Reads run as the signed-in recruiter through RLS: only active companies are
 * visible, so someone else's pending company can neither be found nor claimed.
 */
export function CompanySearch({
  onPick,
  onCreate,
}: {
  onPick: (company: CompanySearchHit) => void;
  onCreate: (typedName: string) => void;
}) {
  const [input, setInput] = useState("");
  const [term, setTerm] = useState("");

  // Debounce: query 300ms after the last keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setTerm(input.trim()), 300);
    return () => clearTimeout(handle);
  }, [input]);

  const { data: hits, isFetching } = useQuery({
    queryKey: ["employers", "company-search", term],
    enabled: term.length >= 2,
    queryFn: async (): Promise<CompanySearchHit[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, slug, logo_url, headquarters, jobs(count)")
        .ilike("name", `%${escapeLike(term)}%`)
        .eq("status", "active")
        .eq("jobs.status", "active")
        .order("name", { ascending: true })
        .limit(8);

      if (error) throw new Error(error.message);
      return ((data ?? []) as unknown as CompanySearchRow[]).map(
        ({ jobs, ...company }) => ({
          ...company,
          jobCount: jobs?.[0]?.count ?? 0,
        }),
      );
    },
  });

  return (
    <div className="border border-line bg-white">
      <div className="relative border-b border-line">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <label htmlFor="employer-company-search" className="sr-only">
          Search companies
        </label>
        <input
          id="employer-company-search"
          type="search"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your company's name…"
          autoFocus
          className="w-full bg-white py-3 pl-9 pr-3 text-sm text-navy-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {term.length >= 2 ? (
        <ul className="max-h-72 overflow-y-auto" aria-busy={isFetching}>
          {(hits ?? []).map((company) => (
            <li key={company.id}>
              <button
                type="button"
                onClick={() => onPick(company)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-primary-surface"
              >
                <CompanyLogo name={company.name} logoUrl={company.logo_url} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-navy-700">
                    {company.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {[
                      company.headquarters,
                      company.jobCount
                        ? `${company.jobCount} live ${company.jobCount === 1 ? "role" : "roles"}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "On the board"}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-primary">
                  Request access
                </span>
              </button>
            </li>
          ))}

          {!isFetching && (hits ?? []).length === 0 ? (
            <li className="px-3 py-3 text-sm text-slate-400">
              Nothing on the board matches “{term}”.
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="px-3 py-4 text-sm text-slate-400">
          Start typing — if your company is already on the board you&apos;ll
          join it instead of re-creating it.
        </p>
      )}

      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={() => onCreate(input.trim())}
          className="flex w-full items-center gap-3 px-1 py-1 text-left"
        >
          <span className="flex size-8 items-center justify-center bg-primary-surface text-primary">
            {term ? <Plus className="size-4" aria-hidden /> : <Building2 className="size-4" aria-hidden />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-primary">
              {term ? `None of these — create “${term}”` : "Create a new company"}
            </span>
            <span className="block text-xs text-slate-400">
              A fresh profile you own. It stays private until your first job is
              approved.
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
