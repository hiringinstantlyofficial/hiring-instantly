import { describe, expect, it } from "vitest";

import {
  articleFormSchema,
  contactSchema,
  jobFormSchema,
  loginSchema,
} from "@/lib/validations";

/** A minimal article payload that passes every required field. */
function validArticle(overrides: Record<string, unknown> = {}) {
  return {
    title: "How to read an Indian salary offer",
    slug: "how-to-read-an-indian-salary-offer",
    description: "x".repeat(60),
    excerpt: "x".repeat(60),
    category: "salary",
    body_markdown: "word ".repeat(400),
    reading_minutes: "",
    tags: "Salary, CTC",
    related: "",
    status: "draft",
    published_at: "",
    revised_at: "",
    ...overrides,
  };
}

describe("articleFormSchema", () => {
  it("accepts a publish date in the future — that is a scheduled post", () => {
    const nextYear = "2027-01-15";
    const result = articleFormSchema.safeParse(
      validArticle({ status: "published", published_at: nextYear }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Date.parse(result.data.published_at!)).toBeGreaterThan(Date.now());
    }
  });

  it("splits tags and related slugs into arrays", () => {
    const result = articleFormSchema.safeParse(
      validArticle({ tags: "Salary, CTC ,  PF", related: "a-slug, b-slug" }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["Salary", "CTC", "PF"]);
      expect(result.data.related).toEqual(["a-slug", "b-slug"]);
    }
  });

  it("rejects a meta description Google would truncate", () => {
    const result = articleFormSchema.safeParse(
      validArticle({ description: "x".repeat(161) }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects a body too short to be worth publishing", () => {
    const result = articleFormSchema.safeParse(
      validArticle({ body_markdown: "Too short to rank." }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects a slug that is not URL-safe", () => {
    const result = articleFormSchema.safeParse(
      validArticle({ slug: "Not A Slug" }),
    );

    expect(result.success).toBe(false);
  });

  it("leaves reading_minutes null when blank, for the estimate to fill", () => {
    const result = articleFormSchema.safeParse(validArticle());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reading_minutes).toBeNull();
    }
  });
});

/** A minimal job payload that passes every required field. */
function validJob(overrides: Record<string, unknown> = {}) {
  return {
    title: "Backend Engineer",
    slug: "backend-engineer",
    company_name: "Acme Corp",
    company_logo_url: "",
    company_website: "",
    company_description: "",
    location: "Bengaluru, Karnataka",
    job_type: "full-time",
    categories: "engineering",
    experience_level: "experienced",
    job_level: "",
    min_experience_years: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "INR",
    description: "x".repeat(60),
    responsibilities: "",
    requirements: "",
    nice_to_haves: "",
    skills: "",
    benefits: "",
    application_url: "https://example.com/apply",
    application_email: "",
    capacity: "",
    applicants_count: 0,
    status: "draft",
    is_featured: false,
    posted_at: "",
    valid_through: "",
    ...overrides,
  };
}

describe("jobFormSchema — date fields", () => {
  it("normalises a date input to an ISO timestamp", () => {
    const result = jobFormSchema.safeParse(validJob({ posted_at: "2026-07-12" }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.posted_at).toBe("2026-07-12T00:00:00.000Z");
    }
  });

  it("maps an empty date to null", () => {
    const result = jobFormSchema.safeParse(validJob());
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.posted_at).toBeNull();
  });

  // Before the refine, new Date("garbage").toISOString() threw a RangeError out
  // of the transform, taking down the whole parse instead of failing one field.
  it("reports a field error on an invalid date rather than throwing", () => {
    expect(() => jobFormSchema.safeParse(validJob({ posted_at: "garbage" }))).not.toThrow();

    const result = jobFormSchema.safeParse(validJob({ posted_at: "garbage" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("posted_at")),
      ).toBe(true);
    }
  });

  it("rejects an invalid valid_through the same way", () => {
    const result = jobFormSchema.safeParse(validJob({ valid_through: "31/02/2026" }));
    expect(result.success).toBe(false);
  });
});

describe("jobFormSchema — transforms", () => {
  it("splits comma-separated categories into an array", () => {
    const result = jobFormSchema.safeParse(
      validJob({ categories: "engineering, design" }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categories).toEqual(["engineering", "design"]);
    }
  });

  it("splits one-per-line textareas and strips bullet prefixes", () => {
    const result = jobFormSchema.safeParse(
      validJob({ responsibilities: "- Ship features\n• Review code\n\n" }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.responsibilities).toEqual([
        "Ship features",
        "Review code",
      ]);
    }
  });

  it("rejects more than four categories", () => {
    const result = jobFormSchema.safeParse(
      validJob({ categories: "engineering, design, marketing, finance, technology" }),
    );
    expect(result.success).toBe(false);
  });
});

describe("jobFormSchema — invariants", () => {
  it("requires an application route", () => {
    const result = jobFormSchema.safeParse(
      validJob({ application_url: "", application_email: "" }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts an email-only application route", () => {
    const result = jobFormSchema.safeParse(
      validJob({ application_url: "", application_email: "jobs@acme.com" }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects a maximum salary below the minimum", () => {
    const result = jobFormSchema.safeParse(
      validJob({ salary_min: 900000, salary_max: 500000 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects more applicants than capacity", () => {
    const result = jobFormSchema.safeParse(
      validJob({ capacity: 5, applicants_count: 9 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a slug that is not URL-safe", () => {
    expect(jobFormSchema.safeParse(validJob({ slug: "Not A Slug" })).success).toBe(
      false,
    );
  });

  it("rejects a description too thin for Google Jobs", () => {
    expect(jobFormSchema.safeParse(validJob({ description: "Too short" })).success).toBe(
      false,
    );
  });
});

describe("contactSchema", () => {
  const valid = {
    name: "Asha",
    email: "asha@example.com",
    subject: "Hello",
    message: "x".repeat(25),
    website: "",
  };

  it("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a short message", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(
      contactSchema.safeParse({ ...valid, website: "http://spam.example" }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a valid email and an 8-character password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "longenough" }).success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({ email: "nope", password: "longenough" }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "short" }).success,
    ).toBe(false);
  });
});
