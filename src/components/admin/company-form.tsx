"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import { revalidateCompanyPaths } from "@/app/actions/admin";
import { Field, Fieldset, inputClass } from "@/components/admin/form-fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";
import {
  companyFormSchema,
  type CompanyFormOutput,
  type CompanyFormValues,
} from "@/lib/validations";
import {
  COMPANY_SIZE_LABELS,
  COMPANY_SIZE_RANGES,
  COMPANY_STATUSES,
  COMPANY_STATUS_LABELS,
  type Company,
} from "@/types/company";

/** What the caller gets back when a company is saved from a dialog. */
export interface SavedCompany {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

function defaultsFrom(
  company?: Company,
  prefill?: Partial<CompanyFormValues>,
): CompanyFormValues {
  return {
    name: company?.name ?? prefill?.name ?? "",
    slug: company?.slug ?? "",
    legal_name: company?.legal_name ?? "",
    logo_url: company?.logo_url ?? prefill?.logo_url ?? "",
    cover_url: company?.cover_url ?? "",
    website: company?.website ?? prefill?.website ?? "",
    linkedin_url: company?.linkedin_url ?? "",
    tagline: company?.tagline ?? "",
    description: company?.description ?? prefill?.description ?? "",
    industry: company?.industry ?? "",
    headquarters: company?.headquarters ?? "",
    founded_year: company?.founded_year ?? "",
    size_range: company?.size_range ?? "",
    is_verified: company?.is_verified ?? false,
    status: company?.status ?? "active",
  };
}

export function CompanyForm({
  company,
  prefill,
  onSaved,
  onCancel,
}: {
  company?: Company;
  /** Seed values, used when the job form's import opens this in a dialog. */
  prefill?: Partial<CompanyFormValues>;
  /** Supplied by the dialog host; without it the form navigates on save. */
  onSaved?: (saved: SavedCompany) => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(company);
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * The id is decided here rather than by the database default.
   *
   * The image uploader writes to `logos/<companyId>/…`, so it needs an id
   * before the row exists. Generating one up front keeps saving a single
   * insert instead of a save-then-upload-then-save dance. The column has a
   * default, not a constraint against supplying a value.
   */
  const companyId = useMemo(
    () => company?.id ?? crypto.randomUUID(),
    [company?.id],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<CompanyFormValues, unknown, CompanyFormOutput>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: defaultsFrom(company, prefill),
  });

  const name = watch("name");
  const slug = watch("slug");
  const logoUrl = watch("logo_url");
  const coverUrl = watch("cover_url");

  // Auto-fill the slug from the name until the admin edits it by hand. On an
  // existing company the slug is left alone — changing it breaks the live URL
  // and every link to it.
  useEffect(() => {
    if (isEdit || dirtyFields.slug) return;
    setValue("slug", slugify(name ?? ""));
  }, [name, isEdit, dirtyFields.slug, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const supabase = createClient();

    const payload = {
      id: companyId,
      slug: values.slug || slugify(values.name),
      name: values.name,
      legal_name: values.legal_name,
      logo_url: values.logo_url,
      cover_url: values.cover_url,
      website: values.website,
      linkedin_url: values.linkedin_url,
      tagline: values.tagline,
      description: values.description,
      industry: values.industry,
      headquarters: values.headquarters,
      founded_year: values.founded_year,
      size_range: values.size_range,
      is_verified: values.is_verified,
      status: values.status,
    };

    const { error } = company
      ? await supabase.from("companies").update(payload).eq("id", company.id)
      : await supabase.from("companies").insert(payload);

    if (error) {
      setFormError(
        error.code === "23505"
          ? "A company with that name or slug already exists. Edit the existing one instead of creating a second."
          : error.message,
      );
      return;
    }

    await revalidateCompanyPaths(payload.slug);

    if (onSaved) {
      onSaved({
        id: companyId,
        name: payload.name,
        slug: payload.slug,
        logo_url: payload.logo_url,
      });
      return;
    }

    router.push("/admin/companies");
    router.refresh();
  });

  const errorFor = (field: keyof CompanyFormValues) =>
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

      <Fieldset legend="Identity">
        <Field label="Company name" required error={errorFor("name")}>
          <input
            {...register("name")}
            className={inputClass}
            placeholder="Acme Labs"
          />
        </Field>

        <Field
          label="Slug"
          error={errorFor("slug")}
          hint={
            isEdit
              ? "Changing this breaks the existing public URL and any links to it."
              : `Public URL: /companies/${slug || "company-name"}`
          }
        >
          <input {...register("slug")} className={inputClass} />
        </Field>

        <Field
          label="Legal name"
          error={errorFor("legal_name")}
          hint="Only if it differs from the trading name."
        >
          <input
            {...register("legal_name")}
            className={inputClass}
            placeholder="Acme Labs Private Limited"
          />
        </Field>

        <Field label="Website" error={errorFor("website")}>
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

      <Fieldset legend="Images">
        <ImageUploader
          kind="logo"
          companyId={companyId}
          value={logoUrl ?? null}
          onChange={(url) =>
            setValue("logo_url", url ?? "", { shouldDirty: true })
          }
          label="Logo"
          hint="Square works best. Anything larger than 512px is scaled down automatically."
          aspect="square"
        />

        <ImageUploader
          kind="cover"
          companyId={companyId}
          value={coverUrl ?? null}
          onChange={(url) =>
            setValue("cover_url", url ?? "", { shouldDirty: true })
          }
          label="Background image"
          hint="The banner behind the profile header. Wide crops read best; anything over 1920×1080 is scaled down."
          aspect="wide"
        />

        {errorFor("logo_url") ? (
          <p className="text-sm text-accent-red" role="alert">
            {errorFor("logo_url")}
          </p>
        ) : null}
        {errorFor("cover_url") ? (
          <p className="text-sm text-accent-red" role="alert">
            {errorFor("cover_url")}
          </p>
        ) : null}
      </Fieldset>

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

      <Fieldset legend="Publishing">
        <Field label="Status" required error={errorFor("status")}>
          <select {...register("status")} className={inputClass}>
            {COMPANY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {COMPANY_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center gap-3 pt-6">
          <input
            id="is_verified"
            type="checkbox"
            {...register("is_verified")}
            className="size-5 accent-[#4640DE]"
          />
          <label htmlFor="is_verified" className="text-sm text-slate-600">
            Mark as a verified employer
          </label>
        </div>

        <p className="text-xs text-slate-400 sm:col-span-2">
          Hiding a company removes its profile from the site. Its listings stay
          published — hide or close those separately if that is the intent.
        </p>
      </Fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Create company"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/companies"))}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
