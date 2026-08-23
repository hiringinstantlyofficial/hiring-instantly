"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import {
  CompanyDetailFields,
  CompanyIdentityFields,
} from "@/components/admin/company-fields";
import { Fieldset } from "@/components/admin/form-fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  recruiterCompanySchema,
  type RecruiterCompanyOutput,
  type RecruiterCompanyValues,
} from "@/lib/validations";
import type { Company } from "@/types/company";

/**
 * Editing an owned company from the recruiter side. Writes go through the
 * browser client, so RLS (`companies_member_update` → approved members only)
 * is what actually authorises them, and the enforcement trigger pins status,
 * slug and verification whatever this form sends.
 */
export function CompanyEditForm({ company }: { company: Company }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState(company.logo_url);
  const [coverUrl, setCoverUrl] = useState(company.cover_url);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecruiterCompanyValues, unknown, RecruiterCompanyOutput>({
    resolver: zodResolver(recruiterCompanySchema),
    defaultValues: {
      name: company.name,
      website: company.website ?? "",
      linkedin_url: company.linkedin_url ?? "",
      tagline: company.tagline ?? "",
      description: company.description ?? "",
      industry: company.industry ?? "",
      headquarters: company.headquarters ?? "",
      founded_year: company.founded_year ?? "",
      size_range: company.size_range ?? "",
    },
  });

  const errorFor = (field: keyof RecruiterCompanyValues) =>
    (errors[field] as FieldError | undefined)?.message;

  const persistImage = async (column: "logo_url" | "cover_url", url: string | null) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("companies")
      // Spelled out rather than `{ [column]: url }`: a computed key widens to
      // an index signature, which the typed client rejects.
      .update(column === "logo_url" ? { logo_url: url } : { cover_url: url })
      .eq("id", company.id);
    if (error) setFormError(error.message);
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSaved(false);
    const supabase = createClient();

    const { error } = await supabase
      .from("companies")
      .update({
        name: values.name,
        website: values.website,
        linkedin_url: values.linkedin_url,
        tagline: values.tagline,
        description: values.description,
        industry: values.industry,
        headquarters: values.headquarters,
        founded_year: values.founded_year,
        size_range: values.size_range,
      })
      .eq("id", company.id);

    if (error) {
      setFormError(error.message);
      return;
    }

    setSaved(true);
    router.refresh();
  });

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

      {saved && !formError ? (
        <p className="border border-accent-green/40 bg-accent-green/5 p-4 text-sm text-accent-green" role="status">
          Saved. Changes show on your public profile within a few minutes.
        </p>
      ) : null}

      <CompanyIdentityFields mode="recruiter" register={register} errorFor={errorFor} />

      <Fieldset legend="Images">
        <ImageUploader
          kind="logo"
          companyId={company.id}
          value={logoUrl}
          onChange={(url) => {
            setLogoUrl(url);
            void persistImage("logo_url", url);
          }}
          label="Logo"
          hint="Square works best."
          aspect="square"
        />
        <ImageUploader
          kind="cover"
          companyId={company.id}
          value={coverUrl}
          onChange={(url) => {
            setCoverUrl(url);
            void persistImage("cover_url", url);
          }}
          label="Background image"
          hint="The banner behind the profile header."
          aspect="wide"
        />
      </Fieldset>

      <CompanyDetailFields register={register} errorFor={errorFor} />

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/employers")}
          disabled={isSubmitting}
        >
          Back to dashboard
        </Button>
      </div>
    </form>
  );
}
