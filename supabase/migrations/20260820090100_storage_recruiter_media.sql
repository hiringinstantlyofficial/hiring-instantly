-- =============================================================================
-- Widen the company-media write policies to approved company members (D5).
--
-- The path convention src/lib/storage.ts already produces —
-- `logos/<companyId>/<uuid>.webp` / `covers/<companyId>/…` — carries the
-- company id as the second folder segment, so the policy question becomes
-- "admin, or an approved member of the company that owns this folder". The
-- uploader component needs no change.
--
-- The `::uuid` parse happens inside public.can_manage_company(text), so a
-- malformed path fails the membership check rather than erroring the
-- statement. Public read is unchanged.
--
-- Same insufficient_privilege wrapper as 20260813090100 and for the same
-- reason: storage.objects is owned by supabase_storage_admin, and a permission
-- failure must not roll back the schema migration that precedes this file.
-- =============================================================================

do $$
begin
  execute 'drop policy if exists "company_media_admin_write" on storage.objects';
  execute 'drop policy if exists "company_media_admin_update" on storage.objects';
  execute 'drop policy if exists "company_media_admin_delete" on storage.objects';

  execute 'drop policy if exists "company_media_write" on storage.objects';
  execute $policy$
    create policy "company_media_write"
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'company-media'
        and (
          public.is_admin()
          or public.can_manage_company((storage.foldername(name))[2])
        )
      )
  $policy$;

  execute 'drop policy if exists "company_media_update" on storage.objects';
  execute $policy$
    create policy "company_media_update"
      on storage.objects for update
      to authenticated
      using (
        bucket_id = 'company-media'
        and (
          public.is_admin()
          or public.can_manage_company((storage.foldername(name))[2])
        )
      )
  $policy$;

  execute 'drop policy if exists "company_media_delete" on storage.objects';
  execute $policy$
    create policy "company_media_delete"
      on storage.objects for delete
      to authenticated
      using (
        bucket_id = 'company-media'
        and (
          public.is_admin()
          or public.can_manage_company((storage.foldername(name))[2])
        )
      )
  $policy$;

exception
  when insufficient_privilege then
    raise notice 'Skipped the company-media member-write policies: the migration role lacks rights on the storage schema. Recreate the three write policies from the Supabase dashboard (Storage -> Policies) using: bucket_id = ''company-media'' and (public.is_admin() or public.can_manage_company((storage.foldername(name))[2])). Recruiter image uploads cannot work until that is done.';
end;
$$;
