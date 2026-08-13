# DATABASE_ACCESS Fix Plan

## Changes

- None — no database present.

## New files

- None

## Verification goals

After implementation, ALL of these must be true:

- [x] No database client, schema, or migration files in the product tree
- [x] No RLS/`USING (true)` policies to harden (none exist)
- [x] Documented as N/A with architecture evidence

## Manual verification (for the human)

- Confirm Vercel project has no attached Postgres / Supabase / Neon resources for SPECTOR
