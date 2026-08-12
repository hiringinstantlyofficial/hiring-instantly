-- =============================================================================
-- Correction: the author bio seeded by the two migrations above was wrong.
--
-- It described Rakshith Gowda as having spent years screening applications and
-- coaching candidates, and as reviewing every listing on the site. None of that
-- is true. He is a software engineer at an MNC who writes these guides because
-- he went through the Indian job market himself and found the available advice
-- generic or written for another country.
--
-- This is worth a migration of its own rather than a quiet edit to the earlier
-- files, for two reasons. Those two migrations have already run in production,
-- so amending them changes nothing about the rows that exist — only a fresh
-- environment would ever see the corrected text. And the bio feeds the
-- `description` of the Person node in every article's JSON-LD, so the false
-- version was being asserted to Google as a credential, which is precisely the
-- thing a named byline on career advice is supposed to make trustworthy. An
-- invented credential is worth less than no byline at all.
--
-- Scoped to rows still carrying the incorrect text, so a bio edited by hand in
-- the admin panel is left alone and a replay of this migration is a no-op.
-- =============================================================================

update public.articles
set author_bio =
  'Rakshith Gowda is a software engineer at an MNC in India. He writes these '
  || 'guides in his own time — he went through the same resumes, interview '
  || 'rounds and offer conversations himself, and found most of the advice '
  || 'online was either generic or written for a different job market. He is '
  || 'not a recruiter; everything here is from the candidate''s side of the '
  || 'table, which is the side most readers are on.'
where author_bio like '%both sides of the table%'
   or author_bio like '%reviews every listing that goes live%';
