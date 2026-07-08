-- Add short slug column for SEO-friendly URLs: /listings/{title-region-slug}-{slug}
-- The slug stores the first 8 hex chars of the UUID (e.g. "8fddfc40")
ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS listings_slug_idx ON listings (slug);

-- Auto-set slug on every INSERT when not provided
CREATE OR REPLACE FUNCTION listings_set_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := LEFT(NEW.id::text, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_set_slug ON listings;
CREATE TRIGGER trg_listings_set_slug
  BEFORE INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION listings_set_slug();

-- Backfill existing rows: take first 8 chars of UUID (before first dash)
UPDATE listings SET slug = LEFT(id::text, 8) WHERE slug IS NULL;
