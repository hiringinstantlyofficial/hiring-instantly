"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useForm,
  type FieldError,
  type UseFormRegister,
} from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import { revalidateJobPaths } from "@/app/actions/admin";
import { CompanyPicker } from "@/components/admin/company-picker";
import { Field, Fieldset, inputClass } from "@/components/admin/form-fields";
import { JobFields } from "@/components/admin/job-fields";
import { Button } from "@/components/ui/button";
import { useCompanyOptions } from "@/hooks/use-admin-companies";
import { parseJobImport, type CompanyImportHint } from "@/lib/job-import";
import { createClient } from "@/lib/supabase/client";
import { cn, slugify, toISTDateInput } from "@/lib/utils";
import type { CompanyFormValues } from "@/lib/validations";
import {
  jobFormSchema,
  type JobFormOutput,
  type JobFormValues,
  type RecruiterJobFormValues,
} from "@/lib/validations";
import { JOB_STATUSES, type Job } from "@/types/job";

function defaultsFrom(job?: Job): JobFormValues {
  return {
    title: job?.title ?? "",
    slug: job?.slug ?? "",
    company_id: job?.company_id ?? "",
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
    capacity: job?.capacity ?? "",
    applicants_count: job?.applicants_count ?? 0,
    status: job?.status ?? "draft",
    is_featured: job?.is_featured ?? false,
    posted_at: toISTDateInput(job?.posted_at),
    valid_through: toISTDateInput(job?.valid_through),
  };
}

export function JobForm({ job }: { job?: Job }) {
  const router = useRouter();
  const isEdit = Boolean(job);
  const [formError, setFormError] = useState<string | null>(null);

  // Also feeds the import's "match or create" step and the company slug passed
  // to revalidateJobPaths; the picker reads the same cached query.
  const { data: companyOptions } = useCompanyOptions();

  // The schema transforms textareas and CSV fields into arrays, so what the
  // form holds (JobFormValues) is not what validation produces (JobFormOutput).
  // react-hook-form models exactly that with its third type parameter, which is
  // what the old `as never` cast on the resolver was papering over: name both
  // and the types line up, handleSubmit receives the transformed data, and the
  // resolver stays type-checked.
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<JobFormValues, unknown, JobFormOutput>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: defaultsFrom(job),
  });

  const title = watch("title");
  const slug = watch("slug");
  const companyId = watch("company_id");

  // Set when an import names a company we have no row for; hands the picker a
  // seeded "New company" dialog rather than an empty one.
  const [companyPrefill, setCompanyPrefill] =
    useState<Partial<CompanyFormValues> | null>(null);

  // An import supplies its own slug, which is often deliberately different from
  // the title (`backend-engineer-acme`). A ref rather than dirty state because
  // reset() clears dirtyFields, and this has to hold across that.
  const slugFromImport = useRef(false);

  // Auto-fill the slug from the title until the admin edits it by hand. On an
  // existing job the slug is left alone — changing it breaks the live URL.
  useEffect(() => {
    if (isEdit || dirtyFields.slug || slugFromImport.current) return;
    setValue("slug", slugify(title ?? ""));
  }, [title, isEdit, dirtyFields.slug, setValue]);

  // `values` is already the schema's parsed output — handleSubmit only runs
  // once the resolver has validated and transformed, so the second safeParse
  // that used to live here was re-doing work the resolver had just done.
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const supabase = createClient();

    const payload = {
      slug: values.slug || slugify(values.title),
      title: values.title,
      // company_name is deliberately absent: a database trigger derives it
      // from company_id, so it is not the app's to write.
      company_id: values.company_id,
      location: values.location,
      job_type: values.job_type,
      categories: values.categories,
      experience_level: values.experience_level,
      job_level: values.job_level,
      min_experience_years: values.min_experience_years,
      salary_min: values.salary_min,
      salary_max: values.salary_max,
      salary_currency: values.salary_currency,
      description: values.description,
      responsibilities: values.responsibilities,
      requirements: values.requirements,
      nice_to_haves: values.nice_to_haves,
      skills: values.skills,
      benefits: values.benefits,
      application_url: values.application_url,
      application_email: values.application_email,
      application_phone: values.application_phone,
      capacity: values.capacity,
      applicants_count: values.applicants_count ?? 0,
      status: values.status,
      is_featured: values.is_featured,
      posted_at: values.posted_at ?? new Date().toISOString(),
      valid_through: values.valid_through,
    };

    const { error } = job
      ? await supabase.from("jobs").update(payload).eq("id", job.id)
      : await supabase.from("jobs").insert(payload);

    if (error) {
      setFormError(
        error.code === "23505"
          ? "That slug is already in use. Give this listing a different one."
          : error.message,
      );
      return;
    }

    await revalidateJobPaths(
      payload.slug,
      companyOptions?.find((option) => option.id === payload.company_id)?.slug,
    );
    router.push("/admin/jobs");
    router.refresh();
  });

  const errorFor = (field: keyof JobFormValues) =>
    (errors[field] as FieldError | undefined)?.message;

  /**
   * Merges imported values over whatever is already typed. Returns any extra
   * warnings the panel should show alongside the parser's own.
   */
  const applyImport = (
    values: Partial<JobFormValues>,
    companyHint: CompanyImportHint | null,
  ) => {
    const extra: string[] = [];
    const next = { ...values };

    // On an existing job the slug is the live URL, so an import never moves it.
    if (isEdit && next.slug && next.slug !== getValues("slug")) {
      delete next.slug;
      extra.push("Slug left unchanged — editing it would break the live URL");
    }

    if (next.slug) slugFromImport.current = true;
    reset({ ...getValues(), ...next });

    /*
     * The company half of an import never writes into a company row.
     *
     * A company is shared by every listing it owns, so letting a scrape
     * overwrite its description is precisely how the same employer used to end
     * up with a different "About us" on each job. A name we already know
     * selects that company and leaves its profile untouched; one we don't opens
     * the create dialog prefilled, for the admin to review before saving.
     */
    if (companyHint?.name) {
      const match = companyOptions?.find(
        (option) =>
          option.name.toLowerCase() === companyHint.name!.trim().toLowerCase(),
      );

      if (match) {
        setValue("company_id", match.id, {
          shouldDirty: true,
          shouldValidate: true,
        });
        extra.push(
          `Matched the existing company “${match.name}” — its profile was not overwritten`,
        );
      } else {
        setCompanyPrefill({
          name: companyHint.name,
          website: companyHint.website ?? "",
          logo_url: companyHint.logoUrl ?? "",
          description: companyHint.description ?? "",
        });
        extra.push(
          `No company named “${companyHint.name}” yet — review and save the new profile that just opened`,
        );
      }
    }

    return extra;
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <ImportPanel onApply={applyImport} />

      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-red/40 bg-accent-red/5 p-4 text-sm text-accent-red"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{formError}</p>
        </div>
      ) : null}

      {/* Every shared field group lives in JobFields (also used by the
          recruiter submission form); this shell contributes the admin-only
          pieces — the slug, the searchable company picker and Publishing. */}
      <JobFields
        mode="admin"
        // JobFields is typed against the shared recruiter subset; the admin
        // form's values are a strict superset, but react-hook-form's generics
        // aren't covariant, so the relationship is asserted here.
        register={register as unknown as UseFormRegister<RecruiterJobFormValues>}
        errorFor={errorFor}
        slugSlot={
          <Field
            label="Slug"
            error={errorFor("slug")}
            hint={
              isEdit
                ? "Changing this breaks the existing public URL and any links to it."
                : `Public URL: /jobs/${slug || "your-job-title"}`
            }
          >
            <input {...register("slug")} className={inputClass} />
          </Field>
        }
        companySlot={
          <CompanyPicker
            value={companyId ?? ""}
            onChange={(id) =>
              setValue("company_id", id, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            error={errorFor("company_id")}
            createPrefill={companyPrefill}
            onCreateHandled={() => setCompanyPrefill(null)}
          />
        }
      />

      <Fieldset legend="Publishing">
        <Field label="Status" required error={errorFor("status")}>
          <select {...register("status")} className={inputClass}>
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Posted on" error={errorFor("posted_at")}>
          <input type="date" {...register("posted_at")} className={inputClass} />
        </Field>

        <Field
          label="Apply before"
          error={errorFor("valid_through")}
          hint="Feeds validThrough in the structured data."
        >
          <input
            type="date"
            {...register("valid_through")}
            className={inputClass}
          />
        </Field>

        <Field label="Capacity" error={errorFor("capacity")} hint="Openings available.">
          <input type="number" min={1} {...register("capacity")} className={inputClass} />
        </Field>

        <Field label="Applicants so far" error={errorFor("applicants_count")}>
          <input
            type="number"
            min={0}
            {...register("applicants_count")}
            className={inputClass}
          />
        </Field>

        <div className="flex items-center gap-3 pt-6">
          <input
            id="is_featured"
            type="checkbox"
            {...register("is_featured")}
            className="size-5 accent-[#4640DE]"
          />
          <label htmlFor="is_featured" className="text-sm text-slate-600">
            Feature this listing at the top of results
          </label>
        </div>
      </Fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Create job"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/jobs")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

/**
 * Paste-JSON shortcut for the scrape prompt in docs/job-scrape-prompt.md.
 * Collapsed by default so it stays out of the way of manual entry.
 */
function ImportPanel({
  onApply,
}: {
  onApply: (
    values: Partial<JobFormValues>,
    company: CompanyImportHint | null,
  ) => string[];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [filled, setFilled] = useState<number | null>(null);

  const apply = () => {
    const result = parseJobImport(text);

    if (!result.ok) {
      setError(result.error);
      setWarnings([]);
      setFilled(null);
      return;
    }

    const extra = onApply(result.values, result.company);
    setError(null);
    setWarnings([...result.warnings, ...extra]);
    setFilled(Object.keys(result.values).length);
  };

  const reset = () => {
    setText("");
    setError(null);
    setWarnings([]);
    setFilled(null);
  };

  return (
    <section className="border border-line bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Import from JSON
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Paste the JSON from the scrape prompt to fill every field below.
            Nothing is saved until you submit.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
          {open ? "Hide" : "Paste JSON"}
        </Button>
      </div>

      {open ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            spellCheck={false}
            placeholder='{ "title": "Backend Engineer", … }'
            className={cn(inputClass, "resize-y font-mono text-xs")}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={apply} disabled={!text.trim()}>
              Fill the form
            </Button>
            <Button variant="ghost" size="sm" onClick={reset} disabled={!text}>
              Clear
            </Button>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-accent-red">
              {error}
            </p>
          ) : null}

          {filled !== null ? (
            <div className="space-y-2 border border-line bg-slate-50 p-3">
              <p className="text-sm text-navy-700">
                Filled {filled} field{filled === 1 ? "" : "s"}. Review everything
                below before saving.
              </p>
              {warnings.length ? (
                <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

