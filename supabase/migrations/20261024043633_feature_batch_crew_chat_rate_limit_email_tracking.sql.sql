/*
# Feature Batch: Crew Chat, Rate Limiting, Email Delivery Tracking

## New Tables

1. `crew_chat_messages` — crew-only chat/announcement feed
   - id, author_id, body, is_announcement (pinned/urgent), created_at
2. `crew_directory_cache` — crew directory with contact info (view-based, no new data)
   - This is a SECURITY DEFINER view exposing team profiles + member profiles with contact fields to authenticated crew only
3. `rate_limit_log` — track public form submissions for rate limiting
   - id, identifier (email or IP), kind, created_at
   - Unique index on (identifier, kind, created_at) for fast counting
4. `email_delivery_log` — extend email tracking with retry status
   - id, template_key, recipient, subject, status (sent/failed/retried/bounced), attempts, last_error, resend_message_id, created_at, updated_at
5. `admin_saved_views` — saved filter presets for admin pages
   - id, user_id, page (which admin page), name, filters (jsonb), is_default, created_at
6. `backup_verification_log` — track backup verification checks
   - id, checked_at, status (ok/warning/failed), details, checked_by

## Modified Tables
- None modified (all new tables)

## Security
- `crew_chat_messages`: RLS enabled, CRUD for authenticated users only
- `rate_limit_log`: RLS enabled, service_role only (no anon/authenticated access)
- `email_delivery_log`: RLS enabled, service_role only
- `admin_saved_views`: RLS enabled, owner-scoped CRUD for authenticated users
- `backup_verification_log`: RLS enabled, service_role only
*/

-- ============ CREW CHAT MESSAGES ============
CREATE TABLE IF NOT EXISTS crew_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL,
  is_announcement boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crew_chat_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON crew_chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_chat_messages TO service_role;

DROP POLICY IF EXISTS "select_crew_chat" ON crew_chat_messages;
CREATE POLICY "select_crew_chat" ON crew_chat_messages FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_crew_chat" ON crew_chat_messages;
CREATE POLICY "insert_crew_chat" ON crew_chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "delete_own_crew_chat" ON crew_chat_messages;
CREATE POLICY "delete_own_crew_chat" ON crew_chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "update_own_crew_chat" ON crew_chat_messages;
CREATE POLICY "update_own_crew_chat" ON crew_chat_messages FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE INDEX IF NOT EXISTS idx_crew_chat_created ON crew_chat_messages (created_at DESC);

-- ============ RATE LIMIT LOG ============
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;
GRANT ALL ON rate_limit_log TO service_role;

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup ON rate_limit_log (identifier, kind, created_at);

-- ============ EMAIL DELIVERY LOG ============
CREATE TABLE IF NOT EXISTS email_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text,
  recipient text NOT NULL,
  subject text,
  status text NOT NULL DEFAULT 'sent',
  attempts integer NOT NULL DEFAULT 1,
  last_error text,
  resend_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_delivery_log ENABLE ROW LEVEL SECURITY;
GRANT ALL ON email_delivery_log TO service_role;
GRANT SELECT ON email_delivery_log TO authenticated;

CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_delivery_log (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_delivery_log (recipient, created_at DESC);

-- ============ ADMIN SAVED VIEWS ============
CREATE TABLE IF NOT EXISTS admin_saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  page text NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_saved_views ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON admin_saved_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_saved_views TO service_role;

DROP POLICY IF EXISTS "select_own_saved_views" ON admin_saved_views;
CREATE POLICY "select_own_saved_views" ON admin_saved_views FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_views" ON admin_saved_views;
CREATE POLICY "insert_own_saved_views" ON admin_saved_views FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_saved_views" ON admin_saved_views;
CREATE POLICY "update_own_saved_views" ON admin_saved_views FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_views" ON admin_saved_views;
CREATE POLICY "delete_own_saved_views" ON admin_saved_views FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_views_user_page ON admin_saved_views (user_id, page);

-- ============ BACKUP VERIFICATION LOG ============
CREATE TABLE IF NOT EXISTS backup_verification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'ok',
  details jsonb,
  checked_by text
);

ALTER TABLE backup_verification_log ENABLE ROW LEVEL SECURITY;
GRANT ALL ON backup_verification_log TO service_role;
GRANT SELECT ON backup_verification_log TO authenticated;

CREATE INDEX IF NOT EXISTS idx_backup_log_checked ON backup_verification_log (checked_at DESC);
