"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import { revalidateJobPaths } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";
import {
  jobFormSchema,
  type JobFormOutput,
  type JobFormValues,
} from "@/lib/validations";
import {
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
  JOB_CATEGORIES,
  JOB_LEVELS,
  JOB_LEVEL_LABELS,
  JOB_STATUSES,
  JOB_TYPES,
  JOB_TYPE_LABELS,
  type Job,
} from "@/types/job";

const inputClass =
  "w-full border border-line bg-white px-3.5 py-2.5 text-sm text-navy-700 placeholder:text-slate-400 focus:border-primary focus:outline-none";

/** ISO timestamp -> the `yyyy-MM-dd` a date input expects. */
function toDateInput(value: string | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function defaultsFrom(job?: Job): JobFormValues {
  return {
    title: job?.title ?? "",
    slug: job?.slug ?? "",
    company_name: job?.company_name ?? "",
    company_logo_url: job?.company_logo_url ?? "",
    company_website: job?.company_website ?? "",
    company_description: job?.company_description ?? "",
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
    capacity: job?.capacity ?? "",
    applicants_count: job?.applicants_count ?? 0,
    status: job?.status ?? "draft",
    is_featured: job?.is_featured ?? false,
    posted_at: toDateInput(job?.posted_at ?? null),
    valid_through: toDateInput(job?.valid_through ?? null),
  };
}

export function JobForm({ job }: { job?: Job }) {
  const router = useRouter();
  const isEdit = Boolean(job);
  const [formError, setFormError] = useState<string | null>(null);

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
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<JobFormValues, unknown, JobFormOutput>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: defaultsFrom(job),
  });

  const title = watch("title");
  const slug = watch("slug");

  // Auto-fill the slug from the title until the admin edits it by hand. On an
  // existing job the slug is left alone — changing it breaks the live URL.
  useEffect(() => {
    if (isEdit || dirtyFields.slug) return;
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
      company_name: values.company_name,
      company_logo_url: values.company_logo_url,
      company_website: values.company_website,
      company_description: values.company_description,
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

    await revalidateJobPaths(payload.slug);
    router.push("/admin/jobs");
    router.refresh();
  });

  const errorFor = (field: keyof JobFormValues) =>
    (errors[field] as FieldError | undefined)?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-red/40 bg-accent-red/5 p-4 text-sm text-accent-red"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{formError}</p>
        </div>
      ) : null}

      <Fieldset legend="The role">
        <Field label="Job title" required error={errorFor("title")}>
          <input
            {...register("title")}
            className={inputClass}
            placeholder="Backend Engineer"
          />
        </Field>

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

        <Field label="Location" required error={errorFor("location")}>
          <input
            {...register("location")}
            className={inputClass}
            placeholder="Bengaluru, Karnataka"
          />
        </Field>

        <Field label="Employment type" required error={errorFor("job_type")}>
          <select {...register("job_type")} className={inputClass}>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>
                {JOB_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Categories"
          error={errorFor("categories")}
          hint={`Comma-separated. Allowed: ${JOB_CATEGORIES.join(", ")}`}
        >
          <input
            {...register("categories")}
            className={inputClass}
            placeholder="engineering, technology"
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Company">
        <Field label="Company name" required error={errorFor("company_name")}>
          <input {...register("company_name")} className={inputClass} />
        </Field>

        <Field label="Website" error={errorFor("company_website")}>
          <input
            {...register("company_website")}
            className={inputClass}
            placeholder="https://example.com"
          />
        </Field>

        <Field
          label="Logo URL"
          error={errorFor("company_logo_url")}
          hint="Leave blank to show initials instead."
        >
          <input
            {...register("company_logo_url")}
            className={inputClass}
            placeholder="https://…/logo.png"
          />
        </Field>

        <Field
          label="About the company"
          error={errorFor("company_description")}
          full
        >
          <textarea
            {...register("company_description")}
            rows={3}
            className={cn(inputClass, "resize-y")}
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Seniority and pay">
        <Field
          label="Experience level"
          required
          error={errorFor("experience_level")}
        >
          <select {...register("experience_level")} className={inputClass}>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {EXPERIENCE_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Job level" error={errorFor("job_level")}>
          <select {...register("job_level")} className={inputClass}>
            <option value="">Not specified</option>
            {JOB_LEVELS.map((level) => (
              <option key={level} value={level}>
                {JOB_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Minimum experience (years)"
          error={errorFor("min_experience_years")}
        >
          <input
            type="number"
            min={0}
            {...register("min_experience_years")}
            className={inputClass}
          />
        </Field>

        <Field label="Currency" error={errorFor("salary_currency")}>
          <input
            {...register("salary_currency")}
            className={inputClass}
            maxLength={3}
          />
        </Field>

        <Field
          label="Salary minimum (per year)"
          error={errorFor("salary_min")}
          hint="Whole rupees, e.g. 600000"
        >
          <input type="number" min={0} {...register("salary_min")} className={inputClass} />
        </Field>

        <Field label="Salary maximum (per year)" error={errorFor("salary_max")}>
          <input type="number" min={0} {...register("salary_max")} className={inputClass} />
        </Field>
      </Fieldset>

      <Fieldset legend="Listing content">
        <Field
          label="Description"
          required
          error={errorFor("description")}
          full
          hint="Shown in full on the job page and used for the JobPosting structured data."
        >
          <textarea
            {...register("description")}
            rows={6}
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field
          label="Responsibilities"
          error={errorFor("responsibilities")}
          full
          hint="One per line."
        >
          <textarea
            {...register("responsibilities")}
            rows={4}
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field
          label="Requirements"
          error={errorFor("requirements")}
          full
          hint="One per line."
        >
          <textarea
            {...register("requirements")}
            rows={4}
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field
          label="Nice to have"
          error={errorFor("nice_to_haves")}
          full
          hint="One per line."
        >
          <textarea
            {...register("nice_to_haves")}
            rows={3}
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field
          label="Perks and benefits"
          error={errorFor("benefits")}
          full
          hint="One per line."
        >
          <textarea
            {...register("benefits")}
            rows={3}
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field
          label="Skills"
          error={errorFor("skills")}
          full
          hint="Comma-separated, e.g. Node.js, PostgreSQL, AWS"
        >
          <input {...register("skills")} className={inputClass} />
        </Field>
      </Fieldset>

      <Fieldset legend="How to apply">
        <Field
          label="Application URL"
          error={errorFor("application_url")}
          hint="Where the Apply button sends candidates."
        >
          <input
            {...register("application_url")}
            className={inputClass}
            placeholder="https://company.com/careers/123"
          />
        </Field>

        <Field
          label="Application email"
          error={errorFor("application_email")}
          hint="Used only when no URL is given."
        >
          <input
            {...register("application_email")}
            className={inputClass}
            placeholder="jobs@company.com"
          />
        </Field>
      </Fieldset>

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

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border border-line bg-white p-6">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {legend}
      </legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  children,
  error,
  hint,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="mb-1.5 block text-sm font-semibold text-navy-700">
        {label}
        {required ? <span className="text-accent-red"> *</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-sm text-accent-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
