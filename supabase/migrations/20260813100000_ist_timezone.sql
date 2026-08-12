-- Put the database on an IST clock.
--
-- Every timestamp column here is `timestamptz`, which stores an absolute instant
-- and is therefore *not* wrong today — but it is rendered and parsed in the
-- session timezone, which Supabase leaves at UTC. Two things follow from that:
--
--   1. The dashboard, psql and any raw SQL show every row 5h30m behind the wall
--      clock everyone running this site actually reads.
--   2. A cast like `'2026-08-12'::timestamptz` in a seed file resolves to UTC
--      midnight, i.e. 05:30 IST on the 12th — close enough to look right and
--      wrong enough to schedule a post for the wrong moment.
--
-- Setting the default timezone fixes both. It does not move a single stored
-- value: the instants are unchanged, only their presentation.
--
-- PostgREST inherits this too, so the API starts returning
-- `2026-08-12T00:00:00+05:30` rather than `2026-08-11T18:30:00Z`. Same instant,
-- and `new Date()` parses both identically, so the app is indifferent — it reads
-- every timestamp through the IST helpers in src/lib/utils.ts regardless.

do $$
begin
  execute format(
    'alter database %I set timezone to %L',
    current_database(),
    'Asia/Kolkata'
  );
exception
  -- Managed environments may not grant the current role ALTER DATABASE. The
  -- role-level settings below are the ones that actually govern API responses,
  -- so a failure here is not worth aborting the migration over.
  when insufficient_privilege then
    raise notice 'Skipping ALTER DATABASE timezone: insufficient privilege';
end
$$;

-- Role-level settings override the database default, so the roles PostgREST
-- connects as have to be set explicitly or they keep answering in UTC.
do $$
declare
  target text;
begin
  foreach target in array array[
    'authenticator', 'anon', 'authenticated', 'service_role', 'postgres'
  ]
  loop
    if exists (select 1 from pg_roles where rolname = target) then
      begin
        execute format('alter role %I set timezone to %L', target, 'Asia/Kolkata');
      exception
        when insufficient_privilege then
          raise notice 'Skipping ALTER ROLE % timezone: insufficient privilege', target;
      end;
    end if;
  end loop;
end
$$;
