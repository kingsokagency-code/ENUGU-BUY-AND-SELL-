-- ====================================================================
-- ENUGU BUY & SELL — PHASE 2 ADDITIVE TELEMETRY SCHEMA (HARDENED)
-- Supports Mission 5 Telemetry Events & Measurement Loop
-- Write-only for public/anon clients; privileged read via service-role
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name  text NOT NULL,
  event_data  jsonb DEFAULT '{}'::jsonb,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public/anon telemetry logging (INSERT only)
CREATE POLICY "Public insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Explicitly NO public SELECT policy.
-- analytics_events is write-only for anon/public users.
-- Only Service Role / Admin can read analytics events.

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);

