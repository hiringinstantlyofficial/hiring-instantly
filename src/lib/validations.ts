import { z } from "zod";

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
  .transform((value) => (value ? new Date(value).toISOString() : null));

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

    company_name: z.string().trim().min(2, "Company name is required").max(160),
    company_logo_url: optionalUrl,
    company_website: optionalUrl,
    company_description: z
      .string()
      .trim()
      .max(4000)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : null)),

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

    capacity: optionalNumber,
    applicants_count: optionalNumber,

    status: z.enum(JOB_STATUSES),
    is_featured: z.coerce.boolean().default(false),
    posted_at: optionalDate,
    valid_through: optionalDate,
  })
  .refine(
    (data) => Boolean(data.application_url ?? data.application_email),
    {
      message: "Add an application URL or an application email",
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

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(8, "Passwords are at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
