-- =========================================================================
-- Friends of Tech (FOT) - Supabase Zero-Trust Row-Level Security (RLS) Schema
-- =========================================================================
-- This script hardens all cloud tables against unauthorized data access.
-- Zero-Trust Rule: By default, NO anon / public client can read or write
-- sensitive registrant PII, payment receipts, passes, or check-in logs.
-- All privileged synchronization operations are performed strictly via
-- the backend using the Supabase Service Role Key (service_role).
-- =========================================================================

-- 1. Table Definitions (if not already existing)
CREATE TABLE IF NOT EXISTS public.event_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_url TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  genlab_logo_url TEXT NOT NULL DEFAULT '',
  date_text TEXT NOT NULL,
  time_text TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  price_per_person INTEGER NOT NULL DEFAULT 99,
  upi_id TEXT NOT NULL,
  upi_name TEXT NOT NULL,
  gpay_qr_url TEXT NOT NULL,
  guidelines_json TEXT NOT NULL DEFAULT '[]',
  schedule_json TEXT NOT NULL DEFAULT '[]',
  prizes_json TEXT NOT NULL DEFAULT '[]',
  faq_json TEXT NOT NULL DEFAULT '[]',
  contact_json TEXT NOT NULL DEFAULT '[]',
  google_sheet_url TEXT DEFAULT '',
  google_sheet_status TEXT DEFAULT 'Unconfigured',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  payer_name TEXT NOT NULL,
  payer_email TEXT NOT NULL,
  payer_phone TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  attendee_count INTEGER NOT NULL,
  payment_screenshot_url TEXT NOT NULL,
  utr_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.attendees (
  id TEXT PRIMARY KEY,
  ticket_code TEXT UNIQUE,
  registration_id TEXT NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  requested_category TEXT NOT NULL,
  assigned_category TEXT NOT NULL,
  team_identifier TEXT,
  signed_token TEXT,
  qr_data_url TEXT,
  id_card_url TEXT,
  email_sent INTEGER DEFAULT 0,
  email_sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.check_ins (
  id BIGSERIAL PRIMARY KEY,
  attendee_id TEXT NOT NULL REFERENCES public.attendees(id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL,
  scanned_by TEXT DEFAULT 'Main Gate Scanner',
  notes TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_to_sheets INTEGER DEFAULT 0
);

-- =========================================================================
-- 2. Enable Row Level Security (RLS) on all tables
-- =========================================================================
ALTER TABLE public.event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 3. Drop existing policies to ensure clean state
-- =========================================================================
DROP POLICY IF EXISTS "Public can view event config" ON public.event_config;
DROP POLICY IF EXISTS "Service role has full access to event config" ON public.event_config;

DROP POLICY IF EXISTS "Deny anon access to registrations" ON public.registrations;
DROP POLICY IF EXISTS "Service role has full access to registrations" ON public.registrations;

DROP POLICY IF EXISTS "Deny anon access to attendees" ON public.attendees;
DROP POLICY IF EXISTS "Service role has full access to attendees" ON public.attendees;

DROP POLICY IF EXISTS "Deny anon access to check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Service role has full access to check-ins" ON public.check_ins;

-- =========================================================================
-- 4. Apply Zero-Trust Security Policies
-- =========================================================================

-- TABLE: event_config
-- Public / Anon can only read event config (schedule, pricing, venue info)
CREATE POLICY "Public can view event config"
  ON public.event_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service_role can modify event configuration
CREATE POLICY "Service role has full access to event config"
  ON public.event_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: users
-- Public / Anon has ZERO read or write access to users table
-- Prevents harvesting user emails or password hashes
CREATE POLICY "Service role has full access to users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: registrations
-- Public / Anon has ZERO read or write access to registrations table
-- Prevents scraping of payer PII, payment receipts, phone numbers, and UTRs
CREATE POLICY "Service role has full access to registrations"
  ON public.registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: attendees
-- Public / Anon has ZERO read or write access to attendees table
-- Prevents harvesting attendee emails, ticket codes, or cryptographic tokens
CREATE POLICY "Service role has full access to attendees"
  ON public.attendees
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: check_ins
-- Public / Anon has ZERO access to check-in logs
-- Only service_role gate scanner operations can record and sync check-ins
CREATE POLICY "Service role has full access to check-ins"
  ON public.check_ins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
