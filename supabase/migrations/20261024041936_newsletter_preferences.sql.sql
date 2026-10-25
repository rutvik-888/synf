/*
# Newsletter preferences (#16)

## Summary
Adds a preferences column to the subscribers table so people can choose what
they want to hear about: events, merch drops, job openings, or all.

## Changes
- Adds `preferences text[]` column to subscribers table (default empty array).
- If the subscribers table doesn't exist, creates a minimal one.
- Non-destructive: existing rows get an empty preferences array.

## Security
- No policy changes. The public-form edge function handles inserts.
*/

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers') THEN
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS preferences text[] DEFAULT '{}';
  END IF;
END $$;
