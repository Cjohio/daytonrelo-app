-- ─────────────────────────────────────────────────────────────────────────────
--  Dayton Relo — New Dynamic Content Tables
--  Run this in Supabase SQL Editor → New Query
--  These tables let Chris update content without app updates.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Local Services Directory ──────────────────────────────────────────────────
--  Chris curates this list. Category options:
--  mover | plumber | electrician | hvac | landscaper | cleaner | handyman | contractor | painter | roofer
CREATE TABLE IF NOT EXISTS local_services (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  category     TEXT        NOT NULL,
  phone        TEXT,
  website      TEXT,
  neighborhood TEXT,
  description  TEXT,
  is_featured  BOOLEAN     DEFAULT false,
  sort_order   INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE local_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view local_services"
  ON local_services FOR SELECT USING (true);

-- ── Temporary Housing ─────────────────────────────────────────────────────────
--  Extended stays, furnished apartments, etc. for relocators mid-transition.
CREATE TABLE IF NOT EXISTS temp_housing (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT        NOT NULL,
  address          TEXT,
  city             TEXT        NOT NULL,
  housing_type     TEXT        NOT NULL, -- 'extended_stay' | 'furnished_apt' | 'corporate_housing'
  nightly_rate_min INTEGER,
  nightly_rate_max INTEGER,
  amenities        TEXT[]      DEFAULT '{}',  -- e.g. {'WiFi','Kitchen','Parking','Pet Friendly'}
  booking_url      TEXT,
  phone            TEXT,
  description      TEXT,
  is_featured      BOOLEAN     DEFAULT false,
  sort_order       INTEGER     DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE temp_housing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view temp_housing"
  ON temp_housing FOR SELECT USING (true);

-- ── Seed: Local Services (starter data — edit/add more in Supabase Table Editor)
INSERT INTO local_services (name, category, phone, website, neighborhood, description, is_featured, sort_order) VALUES
  ('Two Men and a Truck – Dayton', 'mover',       '(937) 291-7161', 'https://www.twomenandatruck.com', 'Citywide',   'Full-service local and long-distance moving. Trusted by Chris for PCS and corporate moves.', true, 1),
  ('Dayton Moving & Storage',     'mover',       '(937) 254-3636', 'https://daytonmoving.com',        'Citywide',   'Family-owned. Specializes in military and corporate relocations.',                        true, 2),
  ('Roto-Rooter Dayton',          'plumber',     '(937) 222-3030', 'https://www.rotorooter.com',      'Citywide',   '24/7 plumbing and drain service. Reliable and widely available.',                         false, 3),
  ('ARS / Rescue Rooter Dayton',  'hvac',        '(937) 401-5050', 'https://www.ars.com',             'Citywide',   'Heating, cooling, and plumbing. Good for new homeowners getting systems inspected.',      false, 4),
  ('Merry Maids Dayton',          'cleaner',     '(937) 277-9993', 'https://www.merrymaids.com',      'Citywide',   'Move-in/move-out cleaning and recurring service. Bonded and insured.',                    false, 5),
  ('Mr. Electric of Dayton',      'electrician', '(937) 401-0037', 'https://www.mrelectric.com',      'Citywide',   'Licensed electricians for panel upgrades, outlets, and inspections.',                     false, 6)
ON CONFLICT DO NOTHING;

-- ── Seed: Temp Housing (starter data)
INSERT INTO temp_housing (name, address, city, housing_type, nightly_rate_min, nightly_rate_max, amenities, booking_url, description, is_featured, sort_order) VALUES
  ('Homewood Suites Beavercreek',    '2750 Fairfield Commons Blvd', 'Beavercreek',  'extended_stay',    129, 179, ARRAY['WiFi','Kitchen','Parking','Pool','Breakfast'], 'https://www.hilton.com', 'Close to WPAFB and L3Harris. Full kitchen suites available by the week or month.', true, 1),
  ('Extended Stay America – Dayton', '7571 Brandt Pike',            'Huber Heights', 'extended_stay',    79,  109, ARRAY['WiFi','Kitchen','Parking','Pet Friendly'],     'https://www.extendedstayamerica.com', 'Budget-friendly weekly rates. Pet-friendly. Good for 30-90 day stays.', true, 2),
  ('Residence Inn Dayton Beavercreek','2779 Fairfield Commons Blvd','Beavercreek',  'extended_stay',    149, 199, ARRAY['WiFi','Kitchen','Parking','Pool','Gym','Breakfast'], 'https://www.marriott.com', 'Marriott property. Full kitchens, weekly rates, close to WPAFB.', false, 3),
  ('Corporate Stays Kettering',      'Contact for address',         'Kettering',     'corporate_housing', 95, 145, ARRAY['WiFi','Kitchen','Parking','Laundry','Fully Furnished'], 'https://www.corporatestays.com', 'Fully furnished apartments by the month. Great for corporate relocators.', false, 4)
ON CONFLICT DO NOTHING;
