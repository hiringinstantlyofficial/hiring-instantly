"use client";

import type { ReactNode } from "react";
import type { UseFormRegister } from "react-hook-form";

import { Field, Fieldset, inputClass } from "@/components/admin/form-fields";
import { cn } from "@/lib/utils";
import type { RecruiterJobFormValues } from "@/lib/validations";
import {
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
  JOB_CATEGORIES,
  JOB_LEVELS,
  JOB_LEVEL_LABELS,
  JOB_TYPES,
  JOB_TYPE_LABELS,
} from "@/types/job";

/**
 * Every field group shared by the admin job form and the recruiter submission
 * form, lifted out of job-form.tsx so the two shells cannot drift (§6 of the
 * plan: extract shared field groups, do not fork the forms).
 *
 * Typed against RecruiterJobFormValues — the *shared* subset. The admin form's
 * register/errors are structurally assignable because JobFormValues is a
 * superset; the admin-only fields (slug, status, featured, dates, capacity)
 * stay in the admin shell and reach this component through the two slots.
 */
export interface JobFieldsProps {
  mode: "admin" | "recruiter";
  register: UseFormRegister<RecruiterJobFormValues>;
  errorFor: (field: keyof RecruiterJobFormValues) => string | undefined;
  /** The admin's slug field, rendered inside "The role"; absent for recruiters. */
  slugSlot?: ReactNode;
  /**
   * What fills the Company fieldset: the searchable CompanyPicker for admins,
   * a locked company card for recruiters (their company was chosen a step
   * earlier and a submission cannot wander across employers).
   */
  companySlot: ReactNode;
}

export function JobFields({
  mode,
  register,
  errorFor,
  slugSlot,
  companySlot,
}: JobFieldsProps) {
  return (
    <>
      <Fieldset legend="The role">
        <Field label="Job title" required error={errorFor("title")}>
          <input
            {...register("title")}
            className={inputClass}
            placeholder="Backend Engineer"
          />
        </Field>

        {slugSlot}

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

      <Fieldset legend="Company">{companySlot}</Fieldset>

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
          hint={
            mode === "recruiter"
              ? "Whole rupees, e.g. 600000. Listings with a salary range get reviewed and applied to faster."
              : "Whole rupees, e.g. 600000"
          }
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

        <Field
          label="Application phone"
          error={errorFor("application_phone")}
          hint="Used only when no URL or email is given."
        >
          <input
            {...register("application_phone")}
            type="tel"
            className={inputClass}
            placeholder="+91 98765 43210"
          />
        </Field>
      </Fieldset>
    </>
  );
}
