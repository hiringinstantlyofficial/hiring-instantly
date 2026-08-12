import { describe, expect, it } from "vitest";

import { parseJobImport } from "./job-import";

/** A minimal listing; individual tests override the fields they care about. */
function payload(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    title: "Backend Engineer",
    slug: "backend-engineer-acme",
    company_name: "Acme",
    location: "Bengaluru, Karnataka",
    job_type: "full-time",
    categories: ["engineering", "technology"],
    experience_level: "experienced",
    description: "A long description.",
    responsibilities: ["Own the API", "Review code"],
    skills: ["Node.js", "PostgreSQL"],
    application_url: "https://acme.test/apply",
    ...overrides,
  });
}

function ok(input: string) {
  const result = parseJobImport(input);
  if (!result.ok) throw new Error(`expected success, got: ${result.error}`);
  return result;
}

describe("parseJobImport", () => {
  it("maps arrays onto the textarea and CSV formats the form expects", () => {
    const { values } = ok(payload());

    expect(values.responsibilities).toBe("Own the API\nReview code");
    expect(values.skills).toBe("Node.js, PostgreSQL");
    expect(values.categories).toBe("engineering, technology");
  });

  it("strips bullet characters models leave on list items", () => {
    const { values } = ok(
      payload({ requirements: ["- Five years of Go", "• Strong SQL"] }),
    );

    expect(values.requirements).toBe("Five years of Go\nStrong SQL");
  });

  it("reads JSON out of a markdown fence and surrounding chatter", () => {
    const { values } = ok(`Here you go!\n\`\`\`json\n${payload()}\n\`\`\``);

    expect(values.title).toBe("Backend Engineer");
  });

  it("unwraps a single-element array", () => {
    const { company } = ok(`[${payload()}]`);

    expect(company?.name).toBe("Acme");
  });

  it("normalises formatted salaries to whole numbers", () => {
    const { values } = ok(payload({ salary_min: "₹6,00,000", salary_max: 900000 }));

    expect(values.salary_min).toBe(600000);
    expect(values.salary_max).toBe(900000);
  });

  it("converts dates to the yyyy-MM-dd a date input needs", () => {
    const { values } = ok(payload({ posted_at: "2026-07-12T09:30:00.000Z" }));

    expect(values.posted_at).toBe("2026-07-12");
  });

  it("reads the day on the IST clock", () => {
    // 20:00Z is already 01:30 the next morning in India.
    const { values } = ok(payload({ posted_at: "2026-07-12T20:00:00.000Z" }));

    expect(values.posted_at).toBe("2026-07-13");
  });

  it("drops categories the form does not offer", () => {
    const result = ok(payload({ categories: ["Engineering", "logistics"] }));

    expect(result.values.categories).toBe("engineering");
    expect(result.warnings).toContain("Dropped unsupported category: logistics");
  });

  it("keeps at most four categories", () => {
    const result = ok(
      payload({
        categories: ["design", "sales", "marketing", "business", "finance"],
      }),
    );

    expect(result.values.categories).toBe("design, sales, marketing, business");
    expect(result.warnings).toContain(
      "Kept the first 4 categories — the form allows no more",
    );
  });

  it("skips a value outside the allowed enum instead of applying it", () => {
    const result = ok(payload({ job_type: "freelance" }));

    expect(result.values.job_type).toBeUndefined();
    expect(result.warnings).toContain(
      "Employment type: could not read the value, left unchanged",
    );
  });

  it("omits fields that are absent or null", () => {
    const { values, company } = ok(
      payload({ company_website: null, capacity: undefined }),
    );

    expect(company?.website).toBeUndefined();
    expect("capacity" in values).toBe(false);
  });

  /*
   * The company half of an import is reported separately from the job values
   * and never lands in the form's fields. A company row is shared by every
   * listing it owns, so a scrape must not be able to rewrite its description —
   * the form matches the hint against the existing companies instead.
   */
  it("reports company fields apart from the job values", () => {
    const { values, company } = ok(
      payload({
        company_website: "https://acme.test",
        company_description: "Acme builds things.",
        company_logo_url: "https://acme.test/logo.png",
      }),
    );

    expect(company).toEqual({
      name: "Acme",
      website: "https://acme.test",
      logoUrl: "https://acme.test/logo.png",
      description: "Acme builds things.",
    });
    expect("company_name" in values).toBe(false);
    expect("company_description" in values).toBe(false);
  });

  it("returns a null company when the JSON names none", () => {
    const { company } = ok(
      JSON.stringify({
        title: "Backend Engineer",
        location: "Bengaluru, Karnataka",
        description: "A long description.",
      }),
    );

    expect(company).toBeNull();
  });

  it("accepts JSON that carries only company fields", () => {
    const result = parseJobImport(
      JSON.stringify({ company_name: "Acme", company_website: "https://acme.test" }),
    );

    expect(result.ok).toBe(true);
  });

  it("warns when the listing is under the word target", () => {
    const result = ok(payload());

    expect(result.warnings.some((w) => w.includes("under the 600-word target"))).toBe(
      true,
    );
  });

  it("stays quiet about the word target once the listing is long enough", () => {
    const result = ok(payload({ description: "word ".repeat(600) }));

    expect(result.warnings.some((w) => w.includes("600-word target"))).toBe(false);
  });

  it("reports keys it does not recognise", () => {
    const result = ok(payload({ department: "Platform" }));

    expect(result.warnings).toContain("Ignored unknown field(s): department");
  });

  it("rejects input that is not JSON", () => {
    const result = parseJobImport("I could not find that job posting.");

    expect(result.ok).toBe(false);
  });

  it("rejects JSON with no job fields in it", () => {
    const result = parseJobImport('{ "foo": "bar" }');

    expect(result.ok).toBe(false);
  });
});
