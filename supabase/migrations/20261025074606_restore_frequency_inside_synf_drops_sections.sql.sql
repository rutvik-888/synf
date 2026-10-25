/*
# Restore Frequency, Inside Synf, and Secret Drops as active site sections

These sections are being re-enabled on the public website. Re-inserting their
site_sections rows so they appear in Admin → Site Sections and can be
shown/hidden like the other sections.

Routes for /frequency, /frequency/:slug, /inside-synf, /inside-synf/:slug,
/drops, /drops/:slug are now wired to their real page components and guarded
by RouteVisibilityGuard, which checks site_sections visibility.

1. Changes
   - INSERT rows for frequency, inside_synf, drops (ON CONFLICT DO NOTHING)
   - Default is_visible = true so they appear immediately
*/

INSERT INTO site_sections (key, label, sort_order, is_visible) VALUES
  ('frequency', 'Frequency (Magazine)', 10, true),
  ('inside_synf', 'Inside Synf (Stories)', 11, true),
  ('drops', 'Secret Drops', 14, true)
ON CONFLICT (key) DO NOTHING;
