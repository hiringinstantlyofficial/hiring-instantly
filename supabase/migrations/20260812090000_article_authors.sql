-- =============================================================================
-- Article bylines
--
-- Career advice sits inside what Google calls "Your Money or Your Life" —
-- guidance that affects someone's livelihood — where authorship is weighted
-- heavily and an anonymous Organization byline counts for very little. These two
-- columns put a named person on every article and feed a Person node in the
-- BlogPosting JSON-LD.
--
-- `author_name` is not null with a default so the existing rows and any future
-- insert that forgets it still render a byline rather than an empty line. The
-- bio is nullable: a name alone is already better than none, and the "About the
-- author" block is simply omitted when there is nothing to put in it.
--
-- Idempotent, like the rest of these migrations.
-- =============================================================================

alter table public.articles
  add column if not exists author_name text not null default 'Rakshith Gowda';

alter table public.articles
  add column if not exists author_bio text;

-- Backfill the nine articles that shipped before the columns existed. Scoped to
-- rows that have no bio yet, so a bio edited in the admin panel is never
-- overwritten by a replay of this migration.
update public.articles
set author_bio =
  'Rakshith Gowda is a software engineer at an MNC in India. He writes these '
  || 'guides in his own time — he went through the same resumes, interview '
  || 'rounds and offer conversations himself, and found most of the advice '
  || 'online was either generic or written for a different job market. He is '
  || 'not a recruiter; everything here is from the candidate''s side of the '
  || 'table, which is the side most readers are on.'
where author_bio is null;
