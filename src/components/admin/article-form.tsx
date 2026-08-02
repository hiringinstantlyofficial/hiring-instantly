"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import { revalidateArticlePaths } from "@/app/actions/admin";
import { Field, Fieldset, inputClass } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";
import {
  articleFormSchema,
  type ArticleFormOutput,
  type ArticleFormValues,
} from "@/lib/validations";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  ARTICLE_STATUSES,
  ARTICLE_STATUS_LABELS,
  estimateReadingMinutes,
  type Article,
} from "@/types/blog";

/** ISO timestamp -> the `yyyy-MM-dd` a date input expects. */
function toDateInput(value: string | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function defaultsFrom(article?: Article): ArticleFormValues {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    description: article?.description ?? "",
    excerpt: article?.excerpt ?? "",
    category: article?.category ?? "job-search",
    body_markdown: article?.body_markdown ?? "",
    reading_minutes: article?.reading_minutes ?? "",
    tags: article?.tags.join(", ") ?? "",
    related: article?.related.join(", ") ?? "",
    status: article?.status ?? "draft",
    published_at: toDateInput(article?.published_at ?? null),
    revised_at: toDateInput(article?.revised_at ?? null),
  };
}

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const isEdit = Boolean(article);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ArticleFormValues, unknown, ArticleFormOutput>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: defaultsFrom(article),
  });

  const title = watch("title");
  const slug = watch("slug");
  const body = watch("body_markdown");
  const status = watch("status");
  const publishedAt = watch("published_at");

  // Same rule as the job form: auto-slug from the title until it is edited by
  // hand, and never on an existing article, where the slug is the live URL.
  useEffect(() => {
    if (isEdit || dirtyFields.slug) return;
    setValue("slug", slugify(title ?? ""));
  }, [title, isEdit, dirtyFields.slug, setValue]);

  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = estimateReadingMinutes(body ?? "");

  // A published post dated ahead of today is queued, not live. Worth saying
  // plainly on the form — it is the one behaviour here that looks like a bug if
  // you do not know about it.
  const isScheduled =
    status === "published" &&
    Boolean(publishedAt) &&
    new Date(`${publishedAt}T00:00:00`).getTime() > Date.now();

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const supabase = createClient();

    const payload = {
      slug: values.slug || slugify(values.title),
      title: values.title,
      description: values.description,
      excerpt: values.excerpt,
      category: values.category,
      body_markdown: values.body_markdown,
      // Left blank, the estimate stands in — one less number to keep honest by
      // hand every time a paragraph is added.
      reading_minutes:
        values.reading_minutes ?? estimateReadingMinutes(values.body_markdown),
      tags: values.tags,
      related: values.related,
      status: values.status,
      published_at: values.published_at ?? new Date().toISOString(),
      revised_at: values.revised_at,
    };

    const { error } = article
      ? await supabase.from("articles").update(payload).eq("id", article.id)
      : await supabase.from("articles").insert(payload);

    if (error) {
      setFormError(
        error.code === "23505"
          ? "That slug is already in use. Give this article a different one."
          : error.message,
      );
      return;
    }

    await revalidateArticlePaths(payload.slug);
    router.push("/admin/blog");
    router.refresh();
  });

  const errorFor = (field: keyof ArticleFormValues) =>
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

      <Fieldset legend="The article">
        <Field label="Title" required error={errorFor("title")} full>
          <input
            {...register("title")}
            className={inputClass}
            placeholder="How to read an Indian salary offer"
          />
        </Field>

        <Field
          label="Slug"
          error={errorFor("slug")}
          hint={
            isEdit
              ? "Changing this breaks the existing public URL and any links to it."
              : `Public URL: /blog/${slug || "your-article-title"}`
          }
        >
          <input {...register("slug")} className={inputClass} />
        </Field>

        <Field label="Category" required error={errorFor("category")}>
          <select {...register("category")} className={inputClass}>
            {ARTICLE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {ARTICLE_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Meta description"
          required
          error={errorFor("description")}
          full
          hint="Shown in search results and on the index cards. Under 160 characters."
        >
          <textarea
            {...register("description")}
            rows={2}
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field
          label="Excerpt"
          required
          error={errorFor("excerpt")}
          full
          hint="The longer standfirst under the headline. May restate the description."
        >
          <textarea
            {...register("excerpt")}
            rows={3}
            className={cn(inputClass, "resize-y")}
          />
        </Field>
      </Fieldset>

      <Fieldset legend="Body">
        <Field
          label="Markdown"
          required
          error={errorFor("body_markdown")}
          full
          hint="GitHub-flavoured markdown: ## headings, - lists, **bold**, tables, > quotes. Raw HTML is ignored. Internal links like /jobs work."
        >
          <textarea
            {...register("body_markdown")}
            rows={24}
            spellCheck
            className={cn(inputClass, "resize-y font-mono text-xs leading-relaxed")}
          />
        </Field>

        <div className="sm:col-span-2 -mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
          <span>{words.toLocaleString("en-IN")} words</span>
          <span>≈ {estimatedMinutes} min read</span>
        </div>
      </Fieldset>

      <Fieldset legend="Publishing">
        <Field label="Status" required error={errorFor("status")}>
          <select {...register("status")} className={inputClass}>
            {ARTICLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ARTICLE_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Publish on"
          error={errorFor("published_at")}
          hint="A future date schedules the article — it stays hidden until then."
        >
          <input
            type="date"
            {...register("published_at")}
            className={inputClass}
          />
        </Field>

        <Field
          label="Updated on"
          error={errorFor("revised_at")}
          hint="Set this only after a material revision. It shows on the article and feeds dateModified."
        >
          <input type="date" {...register("revised_at")} className={inputClass} />
        </Field>

        <Field
          label="Reading time (minutes)"
          error={errorFor("reading_minutes")}
          hint={`Leave blank to use the estimate (${estimatedMinutes} min).`}
        >
          <input
            type="number"
            min={1}
            {...register("reading_minutes")}
            className={inputClass}
          />
        </Field>

        <Field
          label="Tags"
          error={errorFor("tags")}
          full
          hint="Comma-separated, e.g. Salary, CTC, Provident Fund"
        >
          <input {...register("tags")} className={inputClass} />
        </Field>

        <Field
          label="Read next"
          error={errorFor("related")}
          full
          hint="Comma-separated slugs of hand-picked follow-on reads. Unknown or unpublished slugs are skipped."
        >
          <input
            {...register("related")}
            className={inputClass}
            placeholder="negotiate-salary-in-india, ctc-vs-in-hand-salary"
          />
        </Field>

        {isScheduled ? (
          <p className="sm:col-span-2 border border-line bg-slate-50 p-3 text-sm text-navy-700">
            Scheduled. This article will appear on the blog, in the sitemap and
            to search engines on{" "}
            {new Date(`${publishedAt}T00:00:00`).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            , without anyone touching it.
          </p>
        ) : null}
      </Fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Create article"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/blog")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
