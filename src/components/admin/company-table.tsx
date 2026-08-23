"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, ExternalLink, Pencil, Search, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  useAdminCompanies,
  useDeleteCompany,
  useUpdateCompanyStatus,
  type AdminCompany,
  type AdminCompanyFilters,
} from "@/hooks/use-admin-companies";
import {
  COMPANY_STATUSES,
  COMPANY_STATUS_LABELS,
  type CompanyStatus,
} from "@/types/company";

const selectClass =
  "border border-line bg-white px-3 py-2 text-sm text-navy-700 focus:border-primary focus:outline-none";

const statusStyles: Record<CompanyStatus, string> = {
  pending: "bg-accent-yellow/15 text-accent-yellow",
  active: "bg-accent-green/10 text-accent-green",
  hidden: "bg-slate-400/10 text-slate-600",
};

export function CompanyTable() {
  const [filters, setFilters] = useState<AdminCompanyFilters>({
    search: "",
    status: "all",
    sort: "name",
  });
  const [pendingDelete, setPendingDelete] = useState<AdminCompany | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isPending, isError, error } = useAdminCompanies(filters);
  const deleteCompany = useDeleteCompany();
  const updateStatus = useUpdateCompanyStatus();

  const rows = data ?? [];

  return (
    <div className="border border-line bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <label htmlFor="admin-company-search" className="sr-only">
            Search companies
          </label>
          <input
            id="admin-company-search"
            type="search"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder="Search name, slug or industry"
            className="w-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="admin-company-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="admin-company-status"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as AdminCompanyFilters["status"],
              }))
            }
            className={selectClass}
          >
            <option value="all">All statuses</option>
            {COMPANY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {COMPANY_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="admin-company-sort" className="sr-only">
            Sort
          </label>
          <select
            id="admin-company-sort"
            value={filters.sort}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sort: event.target.value as AdminCompanyFilters["sort"],
              }))
            }
            className={selectClass}
          >
            <option value="name">Name A–Z</option>
            <option value="jobs">Most listings</option>
            <option value="newest">Newest first</option>
          </select>
        </div>
      </div>

      {isError ? (
        <p className="p-6 text-sm text-accent-red" role="alert">
          Couldn&apos;t load companies: {error.message}
        </p>
      ) : null}

      {deleteError ? (
        <p className="border-b border-line p-4 text-sm text-accent-red" role="alert">
          {deleteError}
        </p>
      ) : null}

      {isPending ? (
        <div className="space-y-3 p-4" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeleton h-14 w-full" />
          ))}
        </div>
      ) : null}

      {!isPending && !isError && rows.length === 0 ? (
        <p className="p-6 text-sm text-slate-600">
          No companies yet. Add one, then attach listings to it from the job
          form.
        </p>
      ) : null}

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Listings</th>
                <th className="px-4 py-3 font-semibold">Industry</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((company) => (
                <tr key={company.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        name={company.name}
                        logoUrl={company.logo_url}
                        size={36}
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-semibold text-navy-700">
                          <span className="truncate">{company.name}</span>
                          {company.is_verified ? (
                            <BadgeCheck
                              className="size-4 shrink-0 text-primary"
                              aria-label="Verified"
                            />
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          /companies/{company.slug}
                          {/* created_by is only set on recruiter-created rows —
                              the admin's own forms never populate it. */}
                          {company.created_by ? (
                            <span className="ml-1.5 rounded-full bg-accent-blue/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent-blue">
                              Recruiter-created
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {company.jobCount ? (
                      <span className="font-semibold text-navy-700">
                        {company.jobCount}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {company.industry ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`status-${company.id}`}>
                      Status for {company.name}
                    </label>
                    <select
                      id={`status-${company.id}`}
                      value={company.status}
                      onChange={(event) =>
                        updateStatus.mutate({
                          company,
                          status: event.target.value as CompanyStatus,
                        })
                      }
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${statusStyles[company.status]}`}
                    >
                      {COMPANY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {COMPANY_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/companies/${company.id}/edit`}
                        className="text-slate-400 hover:text-primary"
                        aria-label={`Edit ${company.name}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      {company.status === "active" ? (
                        <Link
                          href={`/companies/${company.slug}`}
                          target="_blank"
                          className="text-slate-400 hover:text-primary"
                          aria-label={`View ${company.name} live`}
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(company);
                        }}
                        className="text-slate-400 hover:text-accent-red"
                        aria-label={`Delete ${company.name}`}
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={
          pendingDelete?.jobCount
            ? "This company still has listings"
            : `Delete ${pendingDelete?.name ?? "this company"}?`
        }
        // A company is referenced by its jobs with `on delete restrict`, so
        // deleting one that still has listings would fail at the database
        // anyway. Saying so up front beats surfacing a foreign-key error.
        description={
          pendingDelete?.jobCount
            ? `${pendingDelete.name} is attached to ${pendingDelete.jobCount} listing${
                pendingDelete.jobCount === 1 ? "" : "s"
              }. Move those to another company or delete them first. To take the profile off the site without touching the listings, set its status to Hidden instead.`
            : "This removes the company and its profile page. Uploaded images are not deleted from storage."
        }
        confirmLabel={pendingDelete?.jobCount ? "Close" : "Delete"}
        pending={deleteCompany.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.jobCount) {
            setPendingDelete(null);
            return;
          }
          deleteCompany.mutate(pendingDelete, {
            onError: (mutationError) => setDeleteError(mutationError.message),
            onSettled: () => setPendingDelete(null),
          });
        }}
      />
    </div>
  );
}
