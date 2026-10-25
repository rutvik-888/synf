/*
# Database improvements batch: indexes, full-text search, soft delete, webhooks, scheduled jobs

## Summary
This migration adds performance indexes on commonly searched columns, sets up
Postgres full-text search with tsvector columns and GIN indexes, adds soft-delete
(deleted_at) columns to events/people/goods, creates webhook subscription and
delivery tables for outbound integrations, and a scheduled_jobs table for
cron-like recurring tasks.

## 1. Performance Indexes (#61)
Adds B-tree indexes on events.slug, events.venue_city, events.status,
events.is_published, events.start_at, events.created_at, people.slug,
people.status, people.created_at, job_postings.slug, job_postings.status,
enquiries.status, enquiries.created_at, and goods_products indexes if the
table exists.

## 2. Full-Text Search (#66)
- Adds fts tsvector columns to events and people.
- Creates GIN indexes on those columns.
- Creates triggers to keep fts columns updated on insert/update.
- Creates a SECURITY DEFINER RPC `search_site` that searches events, people,
  and jobs simultaneously and returns unified results.

## 3. Soft Delete (#29/#69)
- Adds deleted_at timestamptz columns to events, people, and goods_products.
- The frontend will filter by deleted_at IS NULL. This is non-destructive.

## 4. Webhook Subscriptions (#74)
- Creates webhook_subscriptions and webhook_deliveries tables.
- RLS enabled, admin-only (authenticated) access.

## 5. Scheduled Jobs (#75)
- Creates scheduled_jobs table for cron-like recurring tasks.
- RLS enabled, admin-only (authenticated) access.

## Security
- RLS enabled on webhook_subscriptions, webhook_deliveries, scheduled_jobs.
- Grants: authenticated + service_role CRUD on admin tables.
- search_site RPC granted to anon + authenticated (public search).
*/

-- ============================================================
-- 1. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_events_slug ON events (slug);
CREATE INDEX IF NOT EXISTS idx_events_venue_city ON events (venue_city);
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events (is_published);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON events (start_at);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at);

CREATE INDEX IF NOT EXISTS idx_people_slug ON people (slug);
CREATE INDEX IF NOT EXISTS idx_people_status ON people (status);
CREATE INDEX IF NOT EXISTS idx_people_created_at ON people (created_at);

CREATE INDEX IF NOT EXISTS idx_job_postings_slug ON job_postings (slug);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goods_products') THEN
    CREATE INDEX IF NOT EXISTS idx_goods_products_slug ON goods_products (slug);
    CREATE INDEX IF NOT EXISTS idx_goods_products_created_at ON goods_products (created_at);
  END IF;
END $$;

-- ============================================================
-- 2. SOFT DELETE (before FTS so search_site can reference deleted_at)
-- ============================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE people ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goods_products') THEN
    ALTER TABLE goods_products ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
  END IF;
END $$;

-- ============================================================
-- 3. FULL-TEXT SEARCH
-- ============================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS fts tsvector;
ALTER TABLE people ADD COLUMN IF NOT EXISTS fts tsvector;

CREATE INDEX IF NOT EXISTS idx_events_fts ON events USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_people_fts ON people USING GIN (fts);

UPDATE events SET fts = to_tsvector('english',
  coalesce(title, '') || ' ' ||
  coalesce(subtitle, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(venue_name, '') || ' ' ||
  coalesce(venue_city, '') || ' ' ||
  coalesce(array_to_string(music_genres, ' '), '')
) WHERE fts IS NULL;

UPDATE people SET fts = to_tsvector('english',
  coalesce(name, '') || ' ' ||
  coalesce(role, '') || ' ' ||
  coalesce(bio, '') || ' ' ||
  coalesce(category, '')
) WHERE fts IS NULL;

CREATE OR REPLACE FUNCTION events_fts_update() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.subtitle, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.venue_name, '') || ' ' ||
    coalesce(NEW.venue_city, '') || ' ' ||
    coalesce(array_to_string(NEW.music_genres, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_fts ON events;
CREATE TRIGGER trg_events_fts BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION events_fts_update();

CREATE OR REPLACE FUNCTION people_fts_update() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.role, '') || ' ' ||
    coalesce(NEW.bio, '') || ' ' ||
    coalesce(NEW.category, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_people_fts ON people;
CREATE TRIGGER trg_people_fts BEFORE INSERT OR UPDATE ON people
FOR EACH ROW EXECUTE FUNCTION people_fts_update();

-- Unified search RPC (public)
CREATE OR REPLACE FUNCTION search_site(p_query text, p_limit int DEFAULT 20)
RETURNS TABLE(
  result_type text,
  id uuid,
  title text,
  subtitle text,
  slug text,
  image_url text,
  url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'event'::text, e.id, e.title, e.subtitle, e.slug, e.cover_image_url, '/events/' || e.slug
  FROM events e
  WHERE e.is_published = true
    AND e.deleted_at IS NULL
    AND e.fts @@ plainto_tsquery('english', p_query)
  UNION ALL
  SELECT 'person'::text, p.id, p.name, p.role, p.slug, p.portrait_url, '/people/' || p.slug
  FROM people p
  WHERE p.status = 'approved'
    AND p.deleted_at IS NULL
    AND p.fts @@ plainto_tsquery('english', p_query)
  UNION ALL
  SELECT 'job'::text, j.id, j.title, j.department, j.slug, NULL::text, '/jobs/' || j.slug
  FROM job_postings j
  WHERE j.status = 'published'
    AND to_tsvector('english', coalesce(j.title,'') || ' ' || coalesce(j.description,'') || ' ' || coalesce(j.department,'')) @@ plainto_tsquery('english', p_query)
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION search_site(text, int) TO anon, authenticated;

-- ============================================================
-- 4. WEBHOOK SUBSCRIPTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  event_triggers text[] NOT NULL DEFAULT '{}',
  secret text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_subscriptions TO service_role;

DROP POLICY IF EXISTS "webhook_subs_admin_select" ON webhook_subscriptions;
CREATE POLICY "webhook_subs_admin_select" ON webhook_subscriptions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "webhook_subs_admin_insert" ON webhook_subscriptions;
CREATE POLICY "webhook_subs_admin_insert" ON webhook_subscriptions
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "webhook_subs_admin_update" ON webhook_subscriptions;
CREATE POLICY "webhook_subs_admin_update" ON webhook_subscriptions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "webhook_subs_admin_delete" ON webhook_subscriptions;
CREATE POLICY "webhook_subs_admin_delete" ON webhook_subscriptions
  FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  response_code int,
  response_body text,
  attempts int NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  created_at timestamptz DEFAULT now(),
  delivered_at timestamptz
);

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_deliveries TO service_role;

DROP POLICY IF EXISTS "webhook_del_admin_select" ON webhook_deliveries;
CREATE POLICY "webhook_del_admin_select" ON webhook_deliveries FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "webhook_del_admin_insert" ON webhook_deliveries;
CREATE POLICY "webhook_del_admin_insert" ON webhook_deliveries
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "webhook_del_admin_update" ON webhook_deliveries;
CREATE POLICY "webhook_del_admin_update" ON webhook_deliveries
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "webhook_del_admin_delete" ON webhook_deliveries;
CREATE POLICY "webhook_del_admin_delete" ON webhook_deliveries
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 5. SCHEDULED JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cron_expression text NOT NULL,
  edge_function_slug text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  is_enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_jobs TO service_role;

DROP POLICY IF EXISTS "scheduled_jobs_admin_select" ON scheduled_jobs;
CREATE POLICY "scheduled_jobs_admin_select" ON scheduled_jobs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "scheduled_jobs_admin_insert" ON scheduled_jobs;
CREATE POLICY "scheduled_jobs_admin_insert" ON scheduled_jobs
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "scheduled_jobs_admin_update" ON scheduled_jobs;
CREATE POLICY "scheduled_jobs_admin_update" ON scheduled_jobs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "scheduled_jobs_admin_delete" ON scheduled_jobs;
CREATE POLICY "scheduled_jobs_admin_delete" ON scheduled_jobs
  FOR DELETE TO authenticated USING (true);
