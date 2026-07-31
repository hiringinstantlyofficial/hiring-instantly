"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Pencil, Search, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  useAdminJobs,
  useDeleteJob,
  useUpdateJobStatus,
  type AdminJobFilters,
} from "@/hooks/use-admin-jobs";
import { formatDate } from "@/lib/utils";
import { JOB_STATUSES, JOB_TYPE_LABELS, type Job, type JobStatus } from "@/types/job";

const selectClass =
  "border border-line bg-white px-3 py-2 text-sm text-navy-700 focus:border-primary focus:outline-none";

export function JobTable({ limit }: { limit?: number }) {
  const [filters, setFilters] = useState<AdminJobFilters>({
    search: "",
    status: "all",
    sort: "newest",
  });
  const [pendingDelete, setPendingDelete] = useState<Job | null>(null);

  const { data, isPending, isError, error } = useAdminJobs(filters);
  const deleteJob = useDeleteJob();
  const updateStatus = useUpdateJobStatus();

  const rows = useMemo(
    () => (limit ? (data ?? []).slice(0, limit) : (data ?? [])),
    [data, limit],
  );

  return (
    <div className="border border-line bg-white">
      {limit ? null : (
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <label htmlFor="admin-job-search" className="sr-only">
              Search jobs
            </label>
            <input
              id="admin-job-search"
              type="search"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder="Search title, company or location"
              className="w-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="admin-status"
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as AdminJobFilters["status"],
                }))
              }
              className={selectClass}
            >
              <option value="all">All statuses</option>
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="admin-sort" className="sr-only">
              Sort
            </label>
            <select
              id="admin-sort"
              value={filters.sort}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sort: event.target.value as AdminJobFilters["sort"],
                }))
              }
              className={selectClass}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>
      )}

      {isError ? (
        <p className="p-6 text-sm text-accent-red" role="alert">
          Couldn&apos;t load jobs: {error.message}
        </p>
      ) : null}

      {isPending ? (
        <div className="space-y-3 p-4" aria-busy="true">
          {Array.from({ length: limit ?? 6 }, (_, index) => (
            <div key={index} className="skeleton h-14 w-full" />
          ))}
        </div>
      ) : null}

      {!isPending && !isError && rows.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-base text-slate-600">No jobs match those filters.</p>
          <Link
            href="/admin/jobs/new"
            className="mt-4 inline-block bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Add your first job
          </Link>
        </div>
      ) : null}

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <caption className="sr-only">Job listings</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-slate-400">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Posted
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Applicants
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((job) => (
                <tr key={job.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        name={job.company_name}
                        logoUrl={job.company_logo_url}
                        size={36}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy-700">
                          {job.title}
                          {job.is_featured ? (
                            <span className="ml-2 rounded-full bg-accent-yellow/20 px-2 py-0.5 text-xs font-semibold text-accent-yellow">
                              Featured
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {job.company_name} · {job.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {JOB_TYPE_LABELS[job.job_type]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(job.posted_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {job.applicants_count}
                    {job.capacity ? ` / ${job.capacity}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`status-${job.id}`}>
                      Status for {job.title}
                    </label>
                    <select
                      id={`status-${job.id}`}
                      value={job.status}
                      disabled={updateStatus.isPending}
                      onChange={(event) =>
                        updateStatus.mutate({
                          job,
                          status: event.target.value as JobStatus,
                        })
                      }
                      className="border border-line bg-white px-2 py-1 text-xs text-navy-700 focus:border-primary focus:outline-none"
                    >
                      {JOB_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {job.status === "active" ? (
                        <Link
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          aria-label={`View ${job.title} on the public site`}
                          className="p-2 text-slate-400 hover:text-primary"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </Link>
                      ) : null}
                      <Link
                        href={`/admin/jobs/${job.id}/edit`}
                        aria-label={`Edit ${job.title}`}
                        className="p-2 text-slate-400 hover:text-primary"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(job)}
                        aria-label={`Delete ${job.title}`}
                        className="p-2 text-slate-400 hover:text-accent-red"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {rows.length ? (
        <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-xs text-slate-400">
          <span>
            Showing {rows.length}
            {limit && (data?.length ?? 0) > limit
              ? ` of ${data?.length}`
              : ""}{" "}
            {rows.length === 1 ? "job" : "jobs"}
          </span>
          {limit ? (
            <Link
              href="/admin/jobs"
              className="font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this job?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" at ${pendingDelete.company_name} will be permanently removed, along with its public page. This cannot be undone.`
            : ""
        }
        pending={deleteJob.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteJob.mutate(
            { id: pendingDelete.id, slug: pendingDelete.slug },
            { onSettled: () => setPendingDelete(null) },
          );
        }}
      />
    </div>
  );
}
