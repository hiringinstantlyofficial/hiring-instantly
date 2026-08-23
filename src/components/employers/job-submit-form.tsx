"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { CheckCircle2, TriangleAlert } from "lucide-react";

import { submitJobForReview } from "@/app/actions/employers";
import { JobFields } from "@/components/admin/job-fields";
import { Field, inputClass } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
  recruiterJobFormSchema,
  type RecruiterJobFormOutput,
  type RecruiterJobFormValues,
} from "@/lib/validations";
import type { Job } from "@/types/job";

export interface PostableCompany {
  id: string;
  name: string;
  logo_url: string | null;
  membershipStatus: string;
}

function defaultsFrom(
  job: Job | undefined,
  companies: PostableCompany[],
): RecruiterJobFormValues {
  return {
    title: job?.title ?? "",
    company_id: job?.company_id ?? (companies.length === 1 ? companies[0]!.id : ""),
    location: job?.location ?? "",
    job_type: job?.job_type ?? "full-time",
    categories: job?.categories.join(", ") ?? "",
    experience_level: job?.experience_level ?? "fresher",
    job_level: job?.job_level ?? "",
    min_experience_years: job?.min_experience_years ?? "",
    salary_min: job?.salary_min ?? "",
    salary_max: job?.salary_max ?? "",
    salary_currency: job?.salary_currency ?? "INR",
    description: job?.description ?? "",
    responsibilities: job?.responsibilities.join("\n") ?? "",
    requirements: job?.requirements.join("\n") ?? "",
    nice_to_haves: job?.nice_to_haves.join("\n") ?? "",
    skills: job?.skills.join(", ") ?? "",
    benefits: job?.benefits.join("\n") ?? "",
    application_url: job?.application_url ?? "",
    application_email: job?.application_email ?? "",
    application_phone: job?.application_phone ?? "",
  };
}

/**
 * The recruiter shell around the shared JobFields (§6): no editorial fields,
 * a locked company slot, two submit intents and the D3 warning when the
 * listing being edited is currently live.
 *
 * Client-side validation runs the same recruiterJobFormSchema the server
 * action re-runs; the *raw* form values are what cross the wire, so the
 * schema's transforms execute exactly once, server-side.
 */
export function JobSubmitForm({
  job,
  companies,
}: {
  job?: Job;
  companies: PostableCompany[];
}) {
  const router = useRouter();
  const isEdit = Boolean(job);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"draft" | "submit" | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<RecruiterJobFormValues, unknown, RecruiterJobFormOutput>({
    resolver: zodResolver(recruiterJobFormSchema),
    defaultValues: defaultsFrom(job, companies),
  });

  const companyId = watch("company_id");
  const selectedCompany = companies.find((company) => company.id === companyId);

  // A listing that has ever been submitted can only move forward through
  // review — offering "save draft" on a live listing would silently pull it
  // off the site, which is a withdrawal, not a save.
  const canDraft = !job || job.status === "draft";

  const errorFor = (field: keyof RecruiterJobFormValues) =>
    (errors[field] as FieldError | undefined)?.message;

  const save = (intent: "draft" | "submit") =>
    handleSubmit(async () => {
      setFormError(null);
      setSubmitting(intent);

      const result = await submitJobForReview(getValues(), {
        jobId: job?.id,
        intent,
      });

      setSubmitting(null);

      if (!result.ok || !result.data) {
        if (result.errors) {
          for (const [field, message] of Object.entries(result.errors)) {
            setError(field as keyof RecruiterJobFormValues, { message });
          }
        }
        setFormError(result.message ?? "Couldn't save the listing.");
        return;
      }

      router.push(`/employers/jobs/${result.data.jobId}`);
      router.refresh();
    })();

  return (
    <form noValidate className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      {job?.status === "active" ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-yellow/50 bg-accent-yellow/10 p-4 text-sm text-navy-700"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-accent-yellow" aria-hidden />
          <p>
            <strong>This listing is live.</strong> Saving changes sends it back
            for a quick re-review — it comes off the site until we approve the
            new version, which is usually a same-day glance at what changed.
          </p>
        </div>
      ) : null}

      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-red/40 bg-accent-red/5 p-4 text-sm text-accent-red"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{formError}</p>
        </div>
      ) : null}

      {job?.status === "rejected" && job.review_note ? (
        <div className="border border-line bg-white p-4">
          <p className="text-sm font-semibold text-navy-700">
            What our reviewer asked for:
          </p>
          <p className="mt-1 text-sm text-slate-600">{job.review_note}</p>
        </div>
      ) : null}

      <JobFields
        mode="recruiter"
        register={register}
        errorFor={errorFor}
        companySlot={
          isEdit || companies.length === 1 ? (
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">
                Company
              </span>
              <div className="flex items-center gap-3 border border-line bg-slate-50 p-3">
                {selectedCompany ? (
                  <>
                    <CompanyLogo
                      name={selectedCompany.name}
                      logoUrl={selectedCompany.logo_url}
                      size={40}
                    />
                    <p className="font-semibold text-navy-700">
                      {selectedCompany.name}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    {job ? "Attached to its original company" : "No company yet"}
                  </p>
                )}
              </div>
              {!isEdit ? (
                <p className="mt-1.5 text-xs text-slate-400">
                  Need to hire for a different company?{" "}
                  <Link href="/employers/company/new" className="font-semibold text-primary hover:underline">
                    Add it first
                  </Link>
                  .
                </p>
              ) : null}
            </div>
          ) : (
            <Field
              label="Company"
              required
              error={errorFor("company_id")}
              full
            >
              <select
                value={companyId}
                onChange={(event) =>
                  setValue("company_id", event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={inputClass}
              >
                <option value="">Pick a company…</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </Field>
          )
        }
      />

      {/* What happens next — set the expectation before they hit submit. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-line bg-white p-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-4 text-accent-green" aria-hidden />
          Submitted for review
        </span>
        <span aria-hidden>→</span>
        <span>Checked by our team, usually within one working day</span>
        <span aria-hidden>→</span>
        <span>Live on the board — we email you the link</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button
          type="button"
          size="lg"
          disabled={submitting !== null}
          onClick={() => void save("submit")}
        >
          {submitting === "submit"
            ? "Submitting…"
            : job?.status === "active" || job?.status === "rejected"
              ? "Resubmit for review"
              : "Submit for review"}
        </Button>
        {canDraft ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={submitting !== null}
            onClick={() => void save("draft")}
          >
            {submitting === "draft" ? "Saving…" : "Save draft"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.push("/employers")}
          disabled={submitting !== null}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
