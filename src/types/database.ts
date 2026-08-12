import type {
  Article,
  ArticleCategory,
  ArticleStatus,
} from "@/types/blog";
import type {
  Company,
  CompanySizeRange,
  CompanyStatus,
} from "@/types/company";
import type {
  ExperienceLevel,
  Job,
  JobCategory,
  JobLevel,
  JobStatus,
  JobType,
} from "@/types/job";

/**
 * Hand-written schema types for the Supabase client. Mirrors
 * supabase/migrations/0001_init.sql - keep the two in step. (Swap for
 * `supabase gen types typescript` output once the CLI is linked.)
 *
 * Two constraints from supabase-js drive the shape of this file:
 *  1. Every Row/Insert must satisfy `Record<string, unknown>`, so these are
 *     type aliases rather than interfaces (only aliases get TypeScript's
 *     implicit index signature).
 *  2. Insert shapes are written out longhand; derived `Omit`/`Partial`
 *     intersections resolve to `never` inside the client's generics.
 * Get either wrong and queries silently type as `never` instead of erroring.
 */

type JobRow = Job & { search_vector: unknown | null };

type JobInsert = {
  id?: string;
  slug: string;
  title: string;
  company_id: string;
  // Not accepted from the app: a BEFORE trigger overwrites it from
  // companies.name on every insert and every change of company_id.
  company_name?: string;
  location: string;
  job_type: JobType;
  categories?: JobCategory[];
  experience_level: ExperienceLevel;
  job_level?: JobLevel | null;
  min_experience_years?: number | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  nice_to_haves?: string[];
  skills?: string[];
  benefits?: string[];
  application_url?: string | null;
  application_email?: string | null;
  capacity?: number | null;
  applicants_count?: number;
  status?: JobStatus;
  is_featured?: boolean;
  posted_at?: string;
  valid_through?: string | null;
  created_at?: string;
  updated_at?: string;
};

type CompanyInsert = {
  id?: string;
  slug: string;
  name: string;
  legal_name?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  website?: string | null;
  description?: string | null;
  tagline?: string | null;
  industry?: string | null;
  headquarters?: string | null;
  founded_year?: number | null;
  size_range?: CompanySizeRange | null;
  linkedin_url?: string | null;
  is_verified?: boolean;
  status?: CompanyStatus;
  created_at?: string;
  updated_at?: string;
};

type ArticleInsert = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: ArticleCategory;
  body_markdown: string;
  author_name?: string;
  author_bio?: string | null;
  reading_minutes?: number;
  tags?: string[];
  related?: string[];
  status?: ArticleStatus;
  published_at?: string;
  revised_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};

type ContactSubmissionInsert = {
  id?: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  created_at?: string;
};

type NewsletterSubscriberRow = {
  id: string;
  email: string;
  created_at: string;
};

type NewsletterSubscriberInsert = {
  id?: string;
  email: string;
  created_at?: string;
};

type AdminRow = {
  user_id: string;
  email: string | null;
  created_at: string;
};

type AdminInsert = {
  user_id: string;
  email?: string | null;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: JobRow;
        Insert: JobInsert;
        Update: Partial<JobInsert>;
        // Declared, unlike every other table here, because the listing reads
        // embed the company (`select("*, company:companies(...)")`). Without
        // this entry supabase-js cannot resolve the embedded shape and types
        // the whole row as `never`.
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: Company;
        Insert: CompanyInsert;
        Update: Partial<CompanyInsert>;
        Relationships: [];
      };
      articles: {
        Row: Article;
        Insert: ArticleInsert;
        Update: Partial<ArticleInsert>;
        Relationships: [];
      };
      contact_submissions: {
        Row: ContactSubmissionRow;
        Insert: ContactSubmissionInsert;
        Update: Partial<ContactSubmissionInsert>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriberRow;
        Insert: NewsletterSubscriberInsert;
        Update: Partial<NewsletterSubscriberInsert>;
        Relationships: [];
      };
      admins: {
        Row: AdminRow;
        Insert: AdminInsert;
        Update: Partial<AdminInsert>;
        Relationships: [];
      };
    };
    // `Record<string, never>`, not `Record<never, never>`: supabase-js
    // constrains these to `Record<string, ...>`, and an empty object type has
    // no index signature to satisfy it.
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
