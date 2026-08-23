import { describe, expect, it } from "vitest";

import { formatDate } from "@/lib/utils";
import {
  articleFormSchema,
  companyFormSchema,
  contactSchema,
  indianPhone,
  jobFormSchema,
  loginSchema,
  recruiterJobFormSchema,
  reviewActionSchema,
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
    author_name: "Rakshith Gowda",
    author_bio: "",
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

  it("rejects an article with no byline", () => {
    const result = articleFormSchema.safeParse(validArticle({ author_name: "" }));

    expect(result.success).toBe(false);
  });

  it("nulls a blank author bio so the block is dropped rather than empty", () => {
    const result = articleFormSchema.safeParse(validArticle({ author_bio: "  " }));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author_bio).toBeNull();
    }
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
    company_id: "3f1c2b7e-9a44-4c1d-8f2e-6b0d5a1c7e93",
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
    application_phone: "",
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
  it("normalises a date input to the ISO timestamp of that day's IST midnight", () => {
    const result = jobFormSchema.safeParse(validJob({ posted_at: "2026-07-12" }));
    expect(result.success).toBe(true);
    if (result.success) {
      // 00:00 IST on the 12th, not 00:00 UTC — otherwise the admin picks a day
      // and the site shows the one before it.
      expect(result.data.posted_at).toBe("2026-07-11T18:30:00.000Z");
      expect(formatDate(result.data.posted_at!)).toBe("12-07-2026");
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
      validJob({
        application_url: "",
        application_email: "",
        application_phone: "",
      }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts an email-only application route", () => {
    const result = jobFormSchema.safeParse(
      validJob({ application_url: "", application_email: "jobs@acme.com" }),
    );
    expect(result.success).toBe(true);
  });

  // Walk-in and field roles often publish a number and nothing else, so a phone
  // on its own has to be a complete listing.
  it("accepts a phone-only application route", () => {
    const result = jobFormSchema.safeParse(
      validJob({ application_url: "", application_phone: "+91 98765 43210" }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.application_phone).toBe("+91 98765 43210");
    }
  });

  it("maps an empty phone to null rather than an empty string", () => {
    const result = jobFormSchema.safeParse(validJob());
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.application_phone).toBeNull();
  });

  it("rejects a phone number that carries no plausible digits", () => {
    const result = jobFormSchema.safeParse(
      validJob({ application_phone: "call us" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that is too short to dial", () => {
    const result = jobFormSchema.safeParse(
      validJob({ application_phone: "12345" }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts a landline with an extension", () => {
    const result = jobFormSchema.safeParse(
      validJob({ application_phone: "080-4567-8900 ext 12" }),
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

/** A minimal company payload that passes every required field. */
function validCompany(overrides: Record<string, unknown> = {}) {
  return {
    name: "Acme Labs",
    slug: "acme-labs",
    legal_name: "",
    logo_url: "",
    cover_url: "",
    website: "",
    linkedin_url: "",
    tagline: "",
    description: "",
    industry: "",
    headquarters: "",
    founded_year: "",
    size_range: "",
    is_verified: false,
    status: "active",
    ...overrides,
  };
}

describe("companyFormSchema", () => {
  it("accepts a company with nothing but a name and status", () => {
    const result = companyFormSchema.safeParse(validCompany({ slug: "" }));
    expect(result.success).toBe(true);
  });

  it("normalises empty optional text to null rather than an empty string", () => {
    const result = companyFormSchema.safeParse(validCompany());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.tagline).toBeNull();
      expect(result.data.website).toBeNull();
      expect(result.data.size_range).toBeNull();
      expect(result.data.founded_year).toBeNull();
    }
  });

  it("requires a full URL on the link fields", () => {
    expect(
      companyFormSchema.safeParse(validCompany({ website: "acme.test" })).success,
    ).toBe(false);
    expect(
      companyFormSchema.safeParse(validCompany({ website: "https://acme.test" }))
        .success,
    ).toBe(true);
  });

  it("rejects a slug that is not URL-safe", () => {
    expect(
      companyFormSchema.safeParse(validCompany({ slug: "Acme Labs" })).success,
    ).toBe(false);
  });

  it("bounds the founding year to a plausible four-digit year", () => {
    expect(
      companyFormSchema.safeParse(validCompany({ founded_year: "1799" })).success,
    ).toBe(false);
    expect(
      companyFormSchema.safeParse(validCompany({ founded_year: "2016" })).success,
    ).toBe(true);
  });

  it("rejects a size range outside the enum", () => {
    expect(
      companyFormSchema.safeParse(validCompany({ size_range: "loads" })).success,
    ).toBe(false);
  });
});

describe("jobFormSchema — company reference", () => {
  // The listing points at a company row; it no longer restates the company's
  // details, which is what kept the descriptions in sync.
  it("requires a company id", () => {
    expect(jobFormSchema.safeParse(validJob({ company_id: "" })).success).toBe(
      false,
    );
    expect(
      jobFormSchema.safeParse(validJob({ company_id: "not-a-uuid" })).success,
    ).toBe(false);
  });

  it("does not carry the old per-listing company fields through", () => {
    const result = jobFormSchema.safeParse(
      validJob({ company_description: "Should be ignored" }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect("company_description" in result.data).toBe(false);
      expect("company_logo_url" in result.data).toBe(false);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  Employer portal                                                           */
/* -------------------------------------------------------------------------- */

/** The recruiter form's field set: validJob minus everything editorial. */
function validRecruiterJob(overrides: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = validJob();
  delete base.slug;
  delete base.status;
  delete base.is_featured;
  delete base.capacity;
  delete base.applicants_count;
  delete base.posted_at;
  delete base.valid_through;
  return { ...base, ...overrides };
}

describe("indianPhone", () => {
  it("prepends +91 to a bare 10-digit mobile", () => {
    const result = indianPhone.safeParse("98765 43210");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("+919876543210");
  });

  it("accepts an already-+91 string unchanged", () => {
    const result = indianPhone.safeParse("+91 98765-43210");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("+919876543210");
  });

  it("accepts the common written variants and normalises them all", () => {
    // 0-prefixed, as people copy it off their own phone.
    const zeroPrefixed = indianPhone.safeParse("098765 43210");
    expect(zeroPrefixed.success).toBe(true);
    if (zeroPrefixed.success) expect(zeroPrefixed.data).toBe("+919876543210");

    // 91 without the plus.
    const bare91 = indianPhone.safeParse("91 98765 43210");
    expect(bare91.success).toBe(true);
    if (bare91.success) expect(bare91.data).toBe("+919876543210");
  });

  it("rejects a 10-digit number starting with 5 — not an Indian mobile", () => {
    expect(indianPhone.safeParse("5876543210").success).toBe(false);
    // The same rule holds behind a +91 prefix.
    expect(indianPhone.safeParse("+91 58765 43210").success).toBe(false);
  });

  it("rejects foreign numbers — the field is Indian mobiles only", () => {
    expect(indianPhone.safeParse("+1 415 555 2671").success).toBe(false);
    expect(indianPhone.safeParse("+44 20 7946 0958").success).toBe(false);
  });

  it("rejects strings with no plausible number at all", () => {
    expect(indianPhone.safeParse("call me").success).toBe(false);
    expect(indianPhone.safeParse("").success).toBe(false);
  });
});

describe("recruiterJobFormSchema", () => {
  it("accepts the recruiter field set", () => {
    expect(recruiterJobFormSchema.safeParse(validRecruiterJob()).success).toBe(
      true,
    );
  });

  it("rejects a smuggled status field — the schema is strict", () => {
    expect(
      recruiterJobFormSchema.safeParse(
        validRecruiterJob({ status: "active" }),
      ).success,
    ).toBe(false);
  });

  it("rejects a smuggled is_featured field", () => {
    expect(
      recruiterJobFormSchema.safeParse(
        validRecruiterJob({ is_featured: true }),
      ).success,
    ).toBe(false);
  });

  it("still enforces the shared apply-route rule", () => {
    expect(
      recruiterJobFormSchema.safeParse(
        validRecruiterJob({
          application_url: "",
          application_email: "",
          application_phone: "",
        }),
      ).success,
    ).toBe(false);
  });
});

describe("reviewActionSchema", () => {
  const jobId = "3f1c2b7e-9a44-4c1d-8f2e-6b0d5a1c7e93";

  it("requires a note when requesting changes", () => {
    expect(
      reviewActionSchema.safeParse({
        job_id: jobId,
        action: "changes-requested",
        review_note: "",
      }).success,
    ).toBe(false);

    expect(
      reviewActionSchema.safeParse({
        job_id: jobId,
        action: "changes-requested",
        review_note: "Salary range missing.",
      }).success,
    ).toBe(true);
  });

  it("approves without a note", () => {
    const result = reviewActionSchema.safeParse({
      job_id: jobId,
      action: "approve",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.review_note).toBeNull();
  });
});
