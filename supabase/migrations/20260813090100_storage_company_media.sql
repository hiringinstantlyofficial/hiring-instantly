-- =============================================================================
-- Storage bucket for company media: public read, admin write.
--
-- One bucket with two folder prefixes — `logos/<company-id>/…` and
-- `covers/<company-id>/…` — rather than a bucket each, so there are four
-- policies to keep in step instead of eight.
--
-- The older `company-logos` bucket is deliberately NOT dropped: logo URLs
-- backfilled onto public.companies still point into it, and both buckets are
-- covered by the same `/storage/v1/object/public/**` remotePattern in
-- next.config.ts, so nothing needs to be moved.
--
-- Kept in its own migration for the same reason as that one: `storage.objects`
-- is owned by `supabase_storage_admin`, so depending on the role `supabase db
-- push` connects as, creating policies on it can fail with
-- insufficient_privilege — and that must not roll back the schema migration.
-- Permission errors are therefore downgraded to a NOTICE.
-- =============================================================================

do $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'company-media',
    'company-media',
    true,
    5242880, -- 5 MB. A cover image larger than this is a mistake, not a choice.
    -- No image/svg+xml. An SVG is an executable document and a public bucket
    -- serves it inline; next/image will not optimise it either, so allowing it
    -- costs a stored-XSS surface and buys nothing.
    array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
  )
  on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

  execute 'drop policy if exists "company_media_public_read" on storage.objects';
  execute $policy$
    create policy "company_media_public_read"
      on storage.objects for select
      to anon, authenticated
      using (bucket_id = 'company-media')
  $policy$;

  execute 'drop policy if exists "company_media_admin_write" on storage.objects';
  execute $policy$
    create policy "company_media_admin_write"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'company-media' and public.is_admin())
  $policy$;

  execute 'drop policy if exists "company_media_admin_update" on storage.objects';
  execute $policy$
    create policy "company_media_admin_update"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'company-media' and public.is_admin())
  $policy$;

  execute 'drop policy if exists "company_media_admin_delete" on storage.objects';
  execute $policy$
    create policy "company_media_admin_delete"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'company-media' and public.is_admin())
  $policy$;

exception
  when insufficient_privilege then
    raise notice 'Skipped the company-media bucket and its policies: the migration role lacks rights on the storage schema. Create the bucket (public, 5 MB limit, png/jpeg/webp/avif) and its four policies from the Supabase dashboard (Storage -> Policies). Company images cannot be uploaded until that is done.';
end;
$$;
