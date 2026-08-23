import { formatSalaryRange } from "@/lib/utils";
import type { Job } from "@/types/job";

/**
 * Field-level diff of a re-review against the last approved snapshot (D3).
 * This is what keeps requiring re-review from making the admin's job worse: a
 * one-word salary fix should cost one glance, not a full re-read.
 */

interface DiffRow {
  field: string;
  before: string;
  after: string;
}

const SKIPPED_FIELDS = new Set([
  "id",
  "created_at",
  "updated_at",
  "reviewed_by",
  "reviewed_at",
  "review_note",
  "posted_at",
  "status",
  "submitted_by",
  "source",
  "company_name",
  "applicants_count",
  "is_featured",
]);

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  location: "Location",
  job_type: "Employment type",
  categories: "Categories",
  experience_level: "Experience level",
  job_level: "Job level",
  min_experience_years: "Minimum experience",
  salary_min: "Salary minimum",
  salary_max: "Salary maximum",
  salary_currency: "Currency",
  description: "Description",
  responsibilities: "Responsibilities",
  requirements: "Requirements",
  nice_to_haves: "Nice to have",
  skills: "Skills",
  benefits: "Benefits",
  application_url: "Application URL",
  application_email: "Application email",
  application_phone: "Application phone",
  capacity: "Capacity",
  valid_through: "Apply before",
  company_id: "Company",
};

function display(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (field === "description") {
    const text = String(value);
    return text.length > 140 ? `${text.slice(0, 140)}… (${text.length} chars)` : text;
  }
  return String(value);
}

export function diffAgainstSnapshot(job: Job): DiffRow[] {
  const snapshot = job.approved_snapshot;
  if (!snapshot) return [];

  const rows: DiffRow[] = [];
  const record = job as unknown as Record<string, unknown>;

  // Salary reads better as one formatted band than as two raw integers.
  const beforeSalary =
    formatSalaryRange(
      snapshot.salary_min == null ? null : Number(snapshot.salary_min),
      snapshot.salary_max == null ? null : Number(snapshot.salary_max),
    ) ?? "—";
  const afterSalary =
    formatSalaryRange(job.salary_min, job.salary_max) ?? "—";
  if (beforeSalary !== afterSalary) {
    rows.push({ field: "Salary", before: beforeSalary, after: afterSalary });
  }

  for (const [field, before] of Object.entries(snapshot)) {
    if (SKIPPED_FIELDS.has(field)) continue;
    if (field === "salary_min" || field === "salary_max") continue;
    if (!(field in record)) continue;

    const beforeText = display(field, before);
    const afterText = display(field, record[field]);
    if (beforeText === afterText) continue;

    rows.push({
      field: FIELD_LABELS[field] ?? field,
      before: beforeText,
      after: afterText,
    });
  }

  return rows;
}

export function ReviewDiff({ job }: { job: Job }) {
  const rows = diffAgainstSnapshot(job);

  if (!rows.length) {
    return (
      <p className="border border-line bg-slate-50 p-4 text-sm text-slate-500">
        Nothing differs from the approved version — the edit may have been
        reverted before resubmitting.
      </p>
    );
  }

  return (
    <div className="border border-line">
      <p className="border-b border-line bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Changed since last approval
      </p>
      <ul>
        {rows.map((row) => (
          <li key={row.field} className="border-b border-line-soft px-4 py-3 last:border-0">
            <p className="text-xs font-semibold text-slate-400">{row.field}</p>
            <p className="mt-1 text-sm text-slate-500 line-through decoration-accent-red/50">
              {row.before}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-navy-700">{row.after}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
