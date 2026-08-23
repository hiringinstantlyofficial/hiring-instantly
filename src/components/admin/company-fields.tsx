"use client";

import type { ReactNode } from "react";
import type { UseFormRegister } from "react-hook-form";

import { Field, Fieldset, inputClass } from "@/components/admin/form-fields";
import { cn } from "@/lib/utils";
import type { RecruiterCompanyValues } from "@/lib/validations";
import { COMPANY_SIZE_LABELS, COMPANY_SIZE_RANGES } from "@/types/company";

/**
 * The company field groups shared by the admin form and the recruiter wizard,
 * lifted out of company-form.tsx (§6: extract shared field groups, do not fork
 * the forms). Typed against RecruiterCompanyValues — the shared subset — so
 * the admin form's superset register is structurally assignable. The
 * admin-only fields (slug, legal name, verification, status) stay in the admin
 * shell and reach the identity group through `identityExtras`.
 */
export interface CompanyFieldsProps {
  mode: "admin" | "recruiter";
  register: UseFormRegister<RecruiterCompanyValues>;
  errorFor: (field: keyof RecruiterCompanyValues) => string | undefined;
  /** Admin-only fields rendered inside the Identity fieldset (slug, legal name). */
  identityExtras?: ReactNode;
}

export function CompanyIdentityFields({
  mode,
  register,
  errorFor,
  identityExtras,
}: CompanyFieldsProps) {
  return (
    <Fieldset legend="Identity">
      <Field label="Company name" required error={errorFor("name")}>
        <input
          {...register("name")}
          className={inputClass}
          placeholder="Acme Labs"
        />
      </Field>

      {identityExtras}

      <Field
        label="Website"
        error={errorFor("website")}
        hint={
          mode === "recruiter"
            ? "If it matches your work email's domain, you're verified automatically."
            : undefined
        }
      >
        <input
          {...register("website")}
          className={inputClass}
          placeholder="https://example.com"
        />
      </Field>

      <Field label="LinkedIn" error={errorFor("linkedin_url")}>
        <input
          {...register("linkedin_url")}
          className={inputClass}
          placeholder="https://www.linkedin.com/company/…"
        />
      </Field>

      <Field
        label="Tagline"
        error={errorFor("tagline")}
        hint="One line. Shown on the company card and used as the meta description."
      >
        <input
          {...register("tagline")}
          className={inputClass}
          placeholder="Payments infrastructure for Indian businesses"
        />
      </Field>

      <Field
        label="About the company"
        error={errorFor("description")}
        full
        hint="Written once here — every listing this company owns shows this same text."
      >
        <textarea
          {...register("description")}
          rows={8}
          className={cn(inputClass, "resize-y")}
        />
      </Field>
    </Fieldset>
  );
}

export function CompanyDetailFields({
  register,
  errorFor,
}: Pick<CompanyFieldsProps, "register" | "errorFor">) {
  return (
    <Fieldset legend="Details">
      <Field label="Industry" error={errorFor("industry")}>
        <input
          {...register("industry")}
          className={inputClass}
          placeholder="Fintech"
        />
      </Field>

      <Field label="Headquarters" error={errorFor("headquarters")}>
        <input
          {...register("headquarters")}
          className={inputClass}
          placeholder="Bengaluru, Karnataka"
        />
      </Field>

      <Field label="Company size" error={errorFor("size_range")}>
        <select {...register("size_range")} className={inputClass}>
          <option value="">Not specified</option>
          {COMPANY_SIZE_RANGES.map((range) => (
            <option key={range} value={range}>
              {COMPANY_SIZE_LABELS[range]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Founded" error={errorFor("founded_year")}>
        <input
          type="number"
          min={1800}
          max={2100}
          {...register("founded_year")}
          className={inputClass}
          placeholder="2016"
        />
      </Field>
    </Fieldset>
  );
}
