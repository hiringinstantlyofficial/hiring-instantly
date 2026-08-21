import { z } from "zod";

import { istDateInputToISO } from "@/lib/utils";
import { ARTICLE_CATEGORIES, ARTICLE_STATUSES } from "@/types/blog";
import { COMPANY_SIZE_RANGES, COMPANY_STATUSES } from "@/types/company";
import {
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  JOB_LEVELS,
  JOB_STATUSES,
  JOB_TYPES,
} from "@/types/job";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(120, "That name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Enter a valid email address")
    .max(200),
  subject: z
    .string()
    .trim()
    .max(200, "Keep the subject under 200 characters")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Please give us at least 20 characters so we can help")
    .max(4000, "Please keep the message under 4000 characters"),
  /** Honeypot: real users never see or fill this. */
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email address")
    .max(200),
  website: z.string().max(0).optional().or(z.literal("")),
});

/** Splits a textarea of one-per-line entries into a clean string array. */
const linesToArray = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? "")
      .split("\n")
      .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
      .filter(Boolean),
  );

/** Splits a comma-separated field (skills, categories) into an array. */
const commaToArray = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : null))
  .refine(
    (value) => value === null || /^https?:\/\/.+/.test(value),
    "Enter a full URL starting with http:// or https://",
  );

/**
 * A free-text field that is allowed to be empty, normalised so the column gets
 * `null` rather than an empty string. An empty string reads as "the admin
 * wrote nothing here", which is exactly what `null` means, and only one of the
 * two needs handling at render time.
 */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null));

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : null))
  .refine(
    (value) => value === null || z.string().email().safeParse(value).success,
    "Enter a valid email address",
  );

/**
 * A contact number, kept deliberately loose: listings carry anything from
 * `+91 98765 43210` to `080-4567-8900 ext 12`, and a stricter pattern would
 * reject real numbers an admin copied straight off the employer's site. The
 * check only rules out strings with no plausible number in them at all.
 */
const optionalPhone = z
  .string()
  .trim()
  .max(40)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : null))
  .refine(
    (value) =>
      value === null ||
      (/^[+\d][\d\s().+-]*(?:\s?(?:ext|x)\.?\s?\d+)?$/i.test(value) &&
        (value.match(/\d/g)?.length ?? 0) >= 7),
    "Enter a valid phone number, e.g. +91 98765 43210",
  );

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "" || value === null) return null;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  });

/**
 * A `yyyy-MM-dd` date input, normalised to an ISO timestamp.
 *
 * The day is read as an *IST* calendar day, so 12-08-2026 is stored as that
 * day's IST midnight (`2026-08-11T18:30:00Z`) rather than UTC midnight. Without
 * this, picking a date and reading it back landed a day early for anyone on the
 * IST side of the clock, and scheduled posts went live at 05:30 IST.
 *
 * The validity check has to happen *before* the transform: `new Date("garbage")`
 * is an Invalid Date and `.toISOString()` on it throws a RangeError, which would
 * blow up the whole parse instead of producing a field error.
 */
const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || !Number.isNaN(new Date(value).getTime()),
    "Enter a valid date",
  )
  .transform((value) => (value ? istDateInputToISO(value) : null));

/**
 * The admin job form. Coerces the textarea/CSV inputs into the array columns
 * the database expects, and enforces the same invariants as the SQL CHECKs so
 * the user sees a field error instead of a Postgres error.
 */
export const jobFormSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required").max(200),
    slug: z
      .string()
      .trim()
      .max(120)
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
        "Use lowercase letters, numbers and hyphens only",
      ),

    // The listing points at a company row; the logo, website and description
    // it used to carry per-listing now live there, written once.
    company_id: z.string().uuid("Pick a company for this listing"),

    location: z.string().trim().min(2, "Location is required").max(160),
    job_type: z.enum(JOB_TYPES),
    categories: commaToArray.pipe(
      z.array(z.enum(JOB_CATEGORIES)).max(4, "Pick at most 4 categories"),
    ),

    experience_level: z.enum(EXPERIENCE_LEVELS),
    // Union rather than a refined string, so the parsed output is the JobLevel
    // literal type the database column expects.
    job_level: z
      .union([z.enum(JOB_LEVELS), z.literal("")])
      .optional()
      .transform((value) => (value ? value : null)),
    min_experience_years: optionalNumber,

    salary_min: optionalNumber,
    salary_max: optionalNumber,
    salary_currency: z.string().trim().length(3).default("INR"),

    description: z
      .string()
      .trim()
      .min(50, "Write at least 50 characters — Google Jobs needs real content"),
    responsibilities: linesToArray,
    requirements: linesToArray,
    nice_to_haves: linesToArray,
    skills: commaToArray,
    benefits: linesToArray,

    application_url: optionalUrl,
    application_email: optionalEmail,
    application_phone: optionalPhone,

    capacity: optionalNumber,
    applicants_count: optionalNumber,

    status: z.enum(JOB_STATUSES),
    is_featured: z.coerce.boolean().default(false),
    posted_at: optionalDate,
    valid_through: optionalDate,
  })
  .refine(
    (data) =>
      Boolean(
        data.application_url ?? data.application_email ?? data.application_phone,
      ),
    {
      message: "Add an application URL, email or phone number",
      path: ["application_url"],
    },
  )
  .refine(
    (data) =>
      data.salary_min === null ||
      data.salary_max === null ||
      data.salary_max >= data.salary_min,
    { message: "Maximum salary must be at least the minimum", path: ["salary_max"] },
  )
  .refine(
    (data) =>
      data.capacity === null ||
      data.applicants_count === null ||
      data.applicants_count <= data.capacity,
    { message: "Applicants cannot exceed capacity", path: ["applicants_count"] },
  );

export type JobFormValues = z.input<typeof jobFormSchema>;
export type JobFormOutput = z.output<typeof jobFormSchema>;

/**
 * The admin company form — the single place a company's identity is written.
 *
 * `description` is the one field worth calling out: it replaces the per-listing
 * `jobs.company_description`, so it is written once and read by every job page
 * that company owns. That is the whole point of the table, and it is why this
 * schema is generous with the length limit.
 */
export const companyFormSchema = z.object({
  name: z.string().trim().min(2, "Company name is required").max(160),
  slug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "Use lowercase letters, numbers and hyphens only",
    ),
  legal_name: optionalText(200),

  logo_url: optionalUrl,
  cover_url: optionalUrl,

  website: optionalUrl,
  linkedin_url: optionalUrl,

  // Bounded at 200 rather than left open: this is the card blurb and the meta
  // description, and Google truncates it well before that.
  tagline: optionalText(200),
  description: optionalText(8000),

  industry: optionalText(120),
  headquarters: optionalText(160),
  founded_year: optionalNumber.refine(
    (value) => value === null || (value >= 1800 && value <= 2100),
    "Enter a four-digit year",
  ),
  size_range: z
    .union([z.enum(COMPANY_SIZE_RANGES), z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),

  is_verified: z.coerce.boolean().default(false),
  status: z.enum(COMPANY_STATUSES),
});

export type CompanyFormValues = z.input<typeof companyFormSchema>;
export type CompanyFormOutput = z.output<typeof companyFormSchema>;

/**
 * The admin article form.
 *
 * The one rule worth spelling out is `published_at`: a date in the future is
 * legal and meaningful. It schedules the post — the row is written now and
 * stays invisible until the date arrives — so nothing here rejects it.
 */
export const articleFormSchema = z.object({
  title: z.string().trim().min(8, "Give the article a title").max(200),
  slug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "Use lowercase letters, numbers and hyphens only",
    ),

  // Bounded at 160 rather than left open: this is the meta description, and
  // Google truncates it around there.
  description: z
    .string()
    .trim()
    .min(50, "Write a meta description of at least 50 characters")
    .max(160, "Keep the meta description under 160 characters"),
  excerpt: z
    .string()
    .trim()
    .min(50, "Write an excerpt of at least 50 characters")
    .max(500, "Keep the excerpt under 500 characters"),

  category: z.enum(ARTICLE_CATEGORIES),

  body_markdown: z
    .string()
    .trim()
    .min(
      1000,
      "An article this short will not rank and will not help anyone — write at least ~1000 characters",
    ),

  // Required, unlike most of this form. An article about salaries or notice
  // periods with no named writer is exactly the page Google discounts, so the
  // byline is not something to leave for later.
  author_name: z
    .string()
    .trim()
    .min(2, "Name the person who wrote this")
    .max(120, "That name is too long"),
  author_bio: z
    .string()
    .trim()
    .max(600, "Keep the author bio under 600 characters")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),

  reading_minutes: optionalNumber,
  tags: commaToArray,
  related: commaToArray,

  status: z.enum(ARTICLE_STATUSES),
  published_at: optionalDate,
  revised_at: optionalDate,
});

export type ArticleFormValues = z.input<typeof articleFormSchema>;
export type ArticleFormOutput = z.output<typeof articleFormSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(8, "Passwords are at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
