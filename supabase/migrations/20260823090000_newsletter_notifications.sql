-- Newsletter notifications: a welcome email on signup, and per-job broadcasts
-- the admin explicitly triggers ("email this listing to the subscribers?").
--
-- Two additions:
--
--  1. Subscribers gain an unsubscribe token and an unsubscribed_at timestamp.
--     Every newsletter email now carries an unsubscribe link, and the link must
--     work without a login — the token is the whole credential, which is why it
--     is a generated uuid and not the email address.
--  2. jobs.newsletter_sent_at records when a listing was last emailed to the
--     list. It is informational (the admin may deliberately re-send after an
--     edit); the UI uses it to warn before a duplicate send.

alter table public.newsletter_subscribers
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists unsubscribed_at timestamptz;

comment on column public.newsletter_subscribers.unsubscribe_token is
  'Bearer credential for the one-click unsubscribe link; never shown in any UI.';
comment on column public.newsletter_subscribers.unsubscribed_at is
  'Set when the unsubscribe link is used. Broadcasts skip rows where this is not null; signing up again clears it without re-sending the welcome email.';

-- The unsubscribe route resolves by token alone.
create unique index if not exists newsletter_subscribers_unsubscribe_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

alter table public.jobs
  add column if not exists newsletter_sent_at timestamptz;

comment on column public.jobs.newsletter_sent_at is
  'When this listing was last emailed to the newsletter list; null = never sent.';
