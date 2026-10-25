/*
# Sitemap Auto-Regeneration Triggers

## Changes
1. Creates sitemap_regeneration_log table
2. Creates notify_sitemap_regeneration() trigger function (SECURITY DEFINER)
3. Adds triggers on events, people, job_postings, goods_products tables
   - events: fires on is_published/status/slug/title change
   - people: fires on status/slug/name change
   - job_postings: fires on status/slug/title change (no is_published column)
   - goods_products: fires on status/slug/name change (no is_published column)

## Security
- Trigger function is SECURITY DEFINER with fixed search_path
- sitemap_regeneration_log: service_role full access, authenticated read only
*/

CREATE TABLE IF NOT EXISTS sitemap_regeneration_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table text NOT NULL,
  source_id uuid,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed boolean NOT NULL DEFAULT false
);

ALTER TABLE sitemap_regeneration_log ENABLE ROW LEVEL SECURITY;
GRANT ALL ON sitemap_regeneration_log TO service_role;
GRANT SELECT ON sitemap_regeneration_log TO authenticated;

CREATE INDEX IF NOT EXISTS idx_sitemap_reg_pending ON sitemap_regeneration_log (processed, requested_at) WHERE NOT processed;

CREATE OR REPLACE FUNCTION notify_sitemap_regeneration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO sitemap_regeneration_log (source_table, source_id)
  VALUES (TG_TABLE_NAME, NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sitemap_events ON events;
CREATE TRIGGER trg_sitemap_events
  AFTER INSERT OR UPDATE OF is_published, status, slug, title ON events
  FOR EACH ROW EXECUTE FUNCTION notify_sitemap_regeneration();

DROP TRIGGER IF EXISTS trg_sitemap_people ON people;
CREATE TRIGGER trg_sitemap_people
  AFTER INSERT OR UPDATE OF status, slug, name ON people
  FOR EACH ROW EXECUTE FUNCTION notify_sitemap_regeneration();

DROP TRIGGER IF EXISTS trg_sitemap_job_postings ON job_postings;
CREATE TRIGGER trg_sitemap_job_postings
  AFTER INSERT OR UPDATE OF status, slug, title ON job_postings
  FOR EACH ROW EXECUTE FUNCTION notify_sitemap_regeneration();

DROP TRIGGER IF EXISTS trg_sitemap_goods_products ON goods_products;
CREATE TRIGGER trg_sitemap_goods_products
  AFTER INSERT OR UPDATE OF status, slug, name ON goods_products
  FOR EACH ROW EXECUTE FUNCTION notify_sitemap_regeneration();
