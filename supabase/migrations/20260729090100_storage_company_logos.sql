-- =============================================================================
-- Storage bucket for company logos: public read, admin write.
--
-- Kept in its own migration because `storage.objects` is owned by
-- `supabase_storage_admin`. Depending on the role `supabase db push` connects
-- as, creating policies on it can fail with insufficient_privilege - and that
-- must not roll back the schema migration.
--
-- Permission errors are therefore downgraded to a NOTICE. If you see that
-- notice, create the bucket and its four policies from the dashboard
-- (Storage -> Policies) instead; nothing else in the app depends on this file.
-- =============================================================================

do $$
begin
  insert into storage.buckets (id, name, public)
  values ('company-logos', 'company-logos', true)
  on conflict (id) do nothing;

  execute 'drop policy if exists "company_logos_public_read" on storage.objects';
  execute $policy$
    create policy "company_logos_public_read"
      on storage.objects for select
      to anon, authenticated
      using (bucket_id = 'company-logos')
  $policy$;

  execute 'drop policy if exists "company_logos_admin_write" on storage.objects';
  execute $policy$
    create policy "company_logos_admin_write"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'company-logos' and public.is_admin())
  $policy$;

  execute 'drop policy if exists "company_logos_admin_update" on storage.objects';
  execute $policy$
    create policy "company_logos_admin_update"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'company-logos' and public.is_admin())
  $policy$;

  execute 'drop policy if exists "company_logos_admin_delete" on storage.objects';
  execute $policy$
    create policy "company_logos_admin_delete"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'company-logos' and public.is_admin())
  $policy$;

exception
  when insufficient_privilege then
    raise notice 'Skipped the company-logos bucket and its policies: the migration role lacks rights on the storage schema. Create the bucket and four policies from the Supabase dashboard (Storage -> Policies) if you plan to upload logos. Nothing else in the app depends on this.';
end;
$$;
