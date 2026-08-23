"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { ArrowRight, BadgeCheck, Clock3, TriangleAlert } from "lucide-react";

import { claimCompany, createCompany } from "@/app/actions/employers";
import {
  CompanyDetailFields,
  CompanyIdentityFields,
} from "@/components/admin/company-fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  CompanySearch,
  type CompanySearchHit,
} from "@/components/employers/company-search";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { createClient } from "@/lib/supabase/client";
import {
  recruiterCompanySchema,
  type RecruiterCompanyOutput,
  type RecruiterCompanyValues,
} from "@/lib/validations";
import type { MembershipStatus } from "@/types/recruiter";

type WizardStep =
  | { step: "choose" }
  | { step: "claimed"; company: CompanySearchHit; status: MembershipStatus }
  | { step: "identity"; typedName: string }
  | { step: "branding"; companyId: string; slug: string; name: string; tagline: string | null };

/**
 * Journey A step 2 — your company. Two paths, deliberately asymmetric (D4):
 * an existing company is *joined* (verification pending unless the email
 * domain proves ownership), a new one is created pending and owned outright.
 *
 * The create path is a two-step form on purpose (D5): step 2a inserts the
 * pending company row, and only then can step 2b upload branding — the
 * storage policy authorises writes against a real membership, so there is no
 * id to upload against before the insert. The row is also the autosave.
 */
export function CompanyWizard() {
  const router = useRouter();
  const [state, setState] = useState<WizardStep>({ step: "choose" });
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const pick = async (company: CompanySearchHit) => {
    setError(null);
    setClaiming(true);
    const result = await claimCompany({ company_id: company.id });
    setClaiming(false);

    if (!result.ok || !result.data) {
      setError(result.message ?? "Something went wrong. Please try again.");
      return;
    }
    setState({ step: "claimed", company, status: result.data.status });
  };

  if (state.step === "claimed") {
    const approved = state.status === "approved";
    return (
      <div className="border border-line bg-white p-8">
        <div className="flex items-start gap-4">
          <CompanyLogo name={state.company.name} logoUrl={state.company.logo_url} size={48} />
          <div>
            <h2 className="text-h4">{state.company.name}</h2>
            {approved ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-accent-green">
                <BadgeCheck className="size-4" aria-hidden />
                Verified — your work email matches their website.
              </p>
            ) : (
              <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-accent-yellow" aria-hidden />
                You can post for {state.company.name} right away. Editing their
                company profile needs our OK first — usually same day.
              </p>
            )}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => router.push("/employers/jobs/new")}>
            Post your first job
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setState({ step: "choose" })}>
            Pick a different company
          </Button>
        </div>
      </div>
    );
  }

  if (state.step === "identity") {
    return (
      <IdentityStep
        typedName={state.typedName}
        onBack={() => setState({ step: "choose" })}
        onCreated={(created) => setState({ step: "branding", ...created })}
      />
    );
  }

  if (state.step === "branding") {
    return (
      <BrandingStep
        companyId={state.companyId}
        slug={state.slug}
        name={state.name}
        tagline={state.tagline}
        onDone={() => router.push("/employers/jobs/new")}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-accent-red/40 bg-accent-red/5 p-4 text-sm text-accent-red"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : null}

      <CompanySearch
        onPick={(company) => void pick(company)}
        onCreate={(typedName) => setState({ step: "identity", typedName })}
      />

      {claiming ? (
        <p className="text-sm text-slate-400" role="status">
          Checking your access…
        </p>
      ) : null}
    </div>
  );
}

/** Step 2a — identity. Submitting inserts the pending company row. */
function IdentityStep({
  typedName,
  onBack,
  onCreated,
}: {
  typedName: string;
  onBack: () => void;
  onCreated: (created: {
    companyId: string;
    slug: string;
    name: string;
    tagline: string | null;
  }) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecruiterCompanyValues, unknown, RecruiterCompanyOutput>({
    resolver: zodResolver(recruiterCompanySchema),
    defaultValues: {
      name: typedName,
      website: "",
      linkedin_url: "",
      tagline: "",
      description: "",
      industry: "",
      headquarters: "",
      founded_year: "",
      size_range: "",
    },
  });

  const errorFor = (field: keyof RecruiterCompanyValues) =>
    (errors[field] as FieldError | undefined)?.message;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await createCompany(values);

    if (!result.ok || !result.data) {
      if (result.errors) {
        for (const [field, message] of Object.entries(result.errors)) {
          setError(field as keyof RecruiterCompanyValues, { message });
        }
      }
      setFormError(result.message ?? "Couldn't save the company.");
      return;
    }

    onCreated({
      companyId: result.data.companyId,
      slug: result.data.slug,
      name: values.name,
      tagline: values.tagline || null,
    });
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

      <CompanyIdentityFields mode="recruiter" register={register} errorFor={errorFor} />
      <CompanyDetailFields register={register} errorFor={errorFor} />

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save and add branding"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={isSubmitting}>
          Back to search
        </Button>
      </div>
    </form>
  );
}

/**
 * Step 2b — branding, against the real company id. The uploads go through the
 * unchanged admin ImageUploader (D5): the recruiter's own session authorises
 * the write, and the storage policy checks their membership on the folder.
 */
function BrandingStep({
  companyId,
  slug,
  name,
  tagline,
  onDone,
}: {
  companyId: string;
  slug: string;
  name: string;
  tagline: string | null;
  onDone: () => void;
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  /** Persist a branding column as soon as its upload lands — the row is the autosave. */
  const persist = async (column: "logo_url" | "cover_url", url: string | null) => {
    setSaveError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("companies")
      // Spelled out rather than `{ [column]: url }`: a computed key widens to
      // an index signature, which the typed client rejects.
      .update(column === "logo_url" ? { logo_url: url } : { cover_url: url })
      .eq("id", companyId);
    if (error) setSaveError(error.message);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6 border border-line bg-white p-6">
        <ImageUploader
          kind="logo"
          companyId={companyId}
          value={logoUrl}
          onChange={(url) => {
            setLogoUrl(url);
            void persist("logo_url", url);
          }}
          label="Logo"
          hint="Square works best. Anything larger than 512px is scaled down automatically."
          aspect="square"
        />

        <ImageUploader
          kind="cover"
          companyId={companyId}
          value={coverUrl}
          onChange={(url) => {
            setCoverUrl(url);
            void persist("cover_url", url);
          }}
          label="Background image"
          hint="The banner behind your profile header. Wide crops read best."
          aspect="wide"
        />

        {saveError ? (
          <p className="text-sm text-accent-red" role="alert">
            {saveError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Button size="lg" onClick={onDone}>
            Continue to your first job
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="lg" onClick={onDone}>
            Skip for now
          </Button>
        </div>
      </div>

      {/* They are drawing a page, so show them the page: a live preview of the
          /companies/<slug> hero beside the uploaders. */}
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Preview · /companies/{slug}
        </p>
        <div className="overflow-hidden border border-line bg-white">
          <div className="relative h-32 bg-primary-surface">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview of a just-uploaded image
              <img src={coverUrl} alt="" className="size-full object-cover" />
            ) : null}
          </div>
          <div className="p-5">
            <div className="-mt-12 mb-3">
              <CompanyLogo
                name={name}
                logoUrl={logoUrl}
                size={72}
                className="border-4 border-white bg-white"
              />
            </div>
            <h3 className="text-h4">{name}</h3>
            {tagline ? (
              <p className="mt-1 text-sm text-slate-600">{tagline}</p>
            ) : null}
            <p className="mt-3 text-xs text-slate-400">
              Your profile goes live with your first approved listing.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          You can come back to this any time from{" "}
          <Link href="/employers" className="font-semibold text-primary hover:underline">
            your dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
