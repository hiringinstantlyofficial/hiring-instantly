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
  company_name: string;
  company_logo_url?: string | null;
  company_website?: string | null;
  company_description?: string | null;
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
