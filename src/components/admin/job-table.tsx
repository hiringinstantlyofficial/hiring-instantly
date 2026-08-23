"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardCheck, ExternalLink, Pencil, Search, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  useAdminJobs,
  useDeleteJob,
  useUpdateJobStatus,
  type AdminJobFilters,
} from "@/hooks/use-admin-jobs";
import {
  useNewsletterSubscriberCount,
  useSendJobNewsletter,
} from "@/hooks/use-newsletter";
import { formatDate } from "@/lib/utils";
import { JOB_STATUSES, JOB_TYPE_LABELS, type Job, type JobStatus } from "@/types/job";

const selectClass =
  "border border-line bg-white px-3 py-2 text-sm text-navy-700 focus:border-primary focus:outline-none";

/** Review / view / edit / delete icons, shared by desktop rows and mobile cards. */
function JobActions({ job, onDelete }: { job: Job; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {job.status === "pending" ? (
        <Link
          href="/admin/review"
          aria-label={`Review ${job.title}`}
          className="p-2 text-primary hover:text-primary-hover"
        >
          <ClipboardCheck className="size-4" aria-hidden />
        </Link>
      ) : null}
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
        onClick={onDelete}
        aria-label={`Delete ${job.title}`}
        className="p-2 text-slate-400 hover:text-accent-red"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function JobStatusSelect({
  id,
  job,
  disabled,
  onChange,
}: {
  id: string;
  job: Job;
  disabled: boolean;
  onChange: (status: JobStatus) => void;
}) {
  return (
    <>
      <label className="sr-only" htmlFor={id}>
        Status for {job.title}
      </label>
      <select
        id={id}
        value={job.status}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as JobStatus)}
        className="border border-line bg-white px-2 py-1 text-xs text-navy-700 focus:border-primary focus:outline-none"
      >
        {JOB_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </>
  );
}

export function JobTable({ limit }: { limit?: number }) {
  const [filters, setFilters] = useState<AdminJobFilters>({
    search: "",
    status: "all",
    sort: "newest",
  });
  const [pendingDelete, setPendingDelete] = useState<Job | null>(null);
  // Set when the status select just took a job live: "email the subscribers?"
  const [notifyJob, setNotifyJob] = useState<Job | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const { data, isPending, isError, error } = useAdminJobs(filters);
  const deleteJob = useDeleteJob();
  const updateStatus = useUpdateJobStatus();
  const sendNewsletter = useSendJobNewsletter();
  const { data: subscriberCount } = useNewsletterSubscriberCount();

  const rows = useMemo(
    () => (limit ? (data ?? []).slice(0, limit) : (data ?? [])),
    [data, limit],
  );

  const changeStatus = (job: Job, status: JobStatus) => {
    updateStatus.mutate(
      { job, status },
      {
        // A listing that just went live is the moment the newsletter
        // question makes sense — ask, don't send.
        onSuccess: () => {
          if (status === "active" && job.status !== "active") {
            setNotifyJob(job);
          }
        },
      },
    );
  };

  return (
    <div className="border border-line bg-white">
      {limit ? null : (
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <div className="relative sm:min-w-0 sm:flex-1">
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

          <div className="grid grid-cols-2 gap-3 sm:flex">
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
                className={`${selectClass} w-full sm:w-auto`}
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
                className={`${selectClass} w-full sm:w-auto`}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {isError ? (
        <p className="p-6 text-sm text-accent-red" role="alert">
          Couldn&apos;t load jobs: {error.message}
        </p>
      ) : null}

      {notice ? (
        <p
          className={`border-b border-line p-4 text-sm ${notice.ok ? "text-accent-green" : "text-accent-red"}`}
          role={notice.ok ? "status" : "alert"}
        >
          {notice.text}
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

      {/* Phones get stacked cards — the 960px table would clip six of its
          seven columns off the viewport with no hint they exist. */}
      {rows.length ? (
        <ul className="divide-y divide-line-soft md:hidden">
          {rows.map((job) => (
            <li key={job.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <CompanyLogo
                    name={job.company_name}
                    logoUrl={job.company?.logo_url}
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
                <div className="-mr-2 -mt-1 shrink-0">
                  <JobActions job={job} onDelete={() => setPendingDelete(job)} />
                </div>
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-600">
                {job.source === "recruiter" ? (
                  <span className="rounded-full bg-accent-blue/10 px-2 py-0.5 font-semibold text-accent-blue">
                    Recruiter
                  </span>
                ) : null}
                {JOB_TYPE_LABELS[job.job_type]} · {formatDate(job.posted_at)} ·{" "}
                {job.applicants_count}
                {job.capacity ? ` / ${job.capacity}` : ""} applicants
              </p>
              <div className="mt-2">
                <JobStatusSelect
                  id={`status-m-${job.id}`}
                  job={job}
                  disabled={updateStatus.isPending}
                  onChange={(status) => changeStatus(job, status)}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {rows.length ? (
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px] text-left text-sm">
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
                  Source
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
                        logoUrl={job.company?.logo_url}
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
                  <td className="px-4 py-3">
                    {/* Permanent, surviving approval (D8): this is what lets
                        "everything a recruiter sent us" be filtered a month
                        later when a pattern surfaces. */}
                    {job.source === "recruiter" ? (
                      <span className="rounded-full bg-accent-blue/10 px-2 py-0.5 text-xs font-semibold text-accent-blue">
                        Recruiter
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Admin</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(job.posted_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {job.applicants_count}
                    {job.capacity ? ` / ${job.capacity}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <JobStatusSelect
                      id={`status-${job.id}`}
                      job={job}
                      disabled={updateStatus.isPending}
                      onChange={(status) => changeStatus(job, status)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <JobActions job={job} onDelete={() => setPendingDelete(job)} />
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
        open={Boolean(notifyJob)}
        variant="send"
        title="Email this job to subscribers?"
        description={
          notifyJob
            ? `"${notifyJob.title}" at ${notifyJob.company_name} is now live. Send it to ${
                subscriberCount === undefined
                  ? "all"
                  : subscriberCount.toLocaleString("en-IN")
              } newsletter subscriber${subscriberCount === 1 ? "" : "s"}?${
                notifyJob.newsletter_sent_at
                  ? ` It was already emailed on ${formatDate(notifyJob.newsletter_sent_at)} — sending again emails everyone twice.`
                  : ""
              }`
            : ""
        }
        confirmLabel="Send the email"
        pending={sendNewsletter.isPending}
        onCancel={() => setNotifyJob(null)}
        onConfirm={() => {
          if (!notifyJob) return;
          setNotice(null);
          sendNewsletter.mutate(notifyJob.id, {
            onSuccess: (sent) =>
              setNotice({
                ok: true,
                text:
                  sent === 0
                    ? "No active subscribers yet — nothing was sent."
                    : `Emailed ${sent.toLocaleString("en-IN")} subscriber${sent === 1 ? "" : "s"}.`,
              }),
            onError: (sendError) => setNotice({ ok: false, text: sendError.message }),
            onSettled: () => setNotifyJob(null),
          });
        }}
      />

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
