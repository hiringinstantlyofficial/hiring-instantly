"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Plus, Search, X } from "lucide-react";

import {
  CompanyForm,
  type SavedCompany,
} from "@/components/admin/company-form";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useCompanyOptions } from "@/hooks/use-admin-companies";
import { cn } from "@/lib/utils";
import type { CompanyFormValues } from "@/lib/validations";

/**
 * Picks the company a listing belongs to, with an inline escape hatch for
 * creating one that doesn't exist yet.
 *
 * This replaces the four free-text company fields the job form used to carry.
 * That is the whole point of the change: a listing now *references* a company
 * instead of restating it, so the same employer cannot end up with a different
 * description on every role.
 */
export function CompanyPicker({
  value,
  onChange,
  error,
  /** Seeds the create dialog when an import mentions an unknown company. */
  createPrefill,
  onCreateHandled,
}: {
  value: string;
  onChange: (companyId: string) => void;
  error?: string;
  createPrefill?: Partial<CompanyFormValues> | null;
  onCreateHandled?: () => void;
}) {
  const { data: companies, isPending, isError, error: loadError } =
    useCompanyOptions();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  /**
   * The dialog is portalled to <body>.
   *
   * This component renders inside the job form's <form>, and the create dialog
   * contains a <form> of its own. Nested forms are invalid HTML — the browser
   * discards the inner one, and the company form would submit the job form
   * instead. Portalling moves it out of that subtree.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // An import that named an unknown company opens the dialog prefilled, so the
  // admin lands on a mostly-complete form rather than an empty one.
  useEffect(() => {
    if (createPrefill) setCreating(true);
  }, [createPrefill]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (creating && !dialog.open) dialog.showModal();
    if (!creating && dialog.open) dialog.close();
  }, [creating]);

  const selected = useMemo(
    () => companies?.find((company) => company.id === value) ?? null,
    [companies, value],
  );

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = companies ?? [];
    if (!term) return list.slice(0, 8);
    return list
      .filter((company) => company.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [companies, search]);

  const closeDialog = () => {
    setCreating(false);
    onCreateHandled?.();
  };

  return (
    <div className="sm:col-span-2">
      <span className="mb-1.5 block text-sm font-semibold text-navy-700">
        Company <span className="text-accent-red">*</span>
      </span>

      {selected ? (
        <div className="flex flex-wrap items-center gap-3 border border-line bg-white p-3">
          <CompanyLogo
            name={selected.name}
            logoUrl={selected.logo_url}
            size={40}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-navy-700">
              {selected.name}
            </p>
            <p className="truncate text-xs text-slate-400">
              /companies/{selected.slug}
              {selected.status === "hidden" ? " · hidden" : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("");
              setSearch("");
            }}
          >
            <X className="size-4" aria-hidden />
            Change
          </Button>
          <a
            href={`/admin/companies/${selected.id}/edit`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Edit profile
          </a>
        </div>
      ) : (
        <div className="border border-line bg-white">
          <div className="relative border-b border-line">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <label htmlFor="company-picker-search" className="sr-only">
              Search companies
            </label>
            <input
              id="company-picker-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                isPending ? "Loading companies…" : "Search for a company"
              }
              disabled={isPending}
              className="w-full bg-white py-2.5 pl-9 pr-3 text-sm text-navy-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {isError ? (
            <p className="p-3 text-sm text-accent-red" role="alert">
              Couldn&apos;t load companies: {loadError.message}
            </p>
          ) : null}

          <ul className="max-h-64 overflow-y-auto">
            {matches.map((company) => (
              <li key={company.id}>
                <button
                  type="button"
                  onClick={() => onChange(company.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-primary-surface"
                >
                  <CompanyLogo
                    name={company.name}
                    logoUrl={company.logo_url}
                    size={28}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-navy-700">
                    {company.name}
                  </span>
                  {company.status === "hidden" ? (
                    <span className="text-xs text-slate-400">hidden</span>
                  ) : null}
                </button>
              </li>
            ))}
            {!isPending && matches.length === 0 ? (
              <li className="px-3 py-3 text-sm text-slate-400">
                No company matches “{search.trim()}”.
              </li>
            ) : null}
          </ul>

          <div className="border-t border-line p-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreating(true)}
            >
              <Plus className="size-4" aria-hidden />
              New company
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-1.5 text-sm text-accent-red" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-slate-400">
          The logo, website and description all come from the company profile —
          edit them there and every listing updates at once.
        </p>
      )}

      {mounted
        ? createPortal(
            <dialog
              ref={dialogRef}
              onCancel={(event) => {
                event.preventDefault();
                closeDialog();
              }}
              aria-labelledby="new-company-title"
              className={cn(
                "m-auto w-[min(52rem,calc(100vw-2rem))] border border-line bg-white p-0 backdrop:bg-navy-900/40",
              )}
            >
              <div className="max-h-[85vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="new-company-title" className="text-h3">
                      New company
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Saved straight away, then selected for this listing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeDialog}
                    aria-label="Close"
                    className="text-slate-400 hover:text-navy-700"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>

                <div className="mt-6">
                  {/* Mounted with content only while open, so the inner form
                      resets between opens rather than keeping stale prefill. */}
                  {creating ? (
                    <CompanyForm
                      prefill={createPrefill ?? undefined}
                      onSaved={(saved: SavedCompany) => {
                        onChange(saved.id);
                        closeDialog();
                      }}
                      onCancel={closeDialog}
                    />
                  ) : null}
                </div>
              </div>
            </dialog>,
            document.body,
          )
        : null}

      {selected ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-accent-green">
          <Check className="size-3.5" aria-hidden />
          Listing will be attached to {selected.name}
        </p>
      ) : null}
    </div>
  );
}
