-- ====================================================================
-- ENUGU BUY & SELL — PHASE 6 RECRUITMENT SYSTEM & EVALUATION ENGINE
-- Migration: 005_recruitment_system.sql
-- Table: public.team_applications
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.team_applications (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name                   text NOT NULL,
  email                       text NOT NULL,
  whatsapp_number             text NOT NULL,
  school_institution          text NOT NULL,
  location                    text NOT NULL,
  team_area                   text NOT NULL CHECK (team_area IN (
                                'technology_development',
                                'business_strategy',
                                'sales_seller_community',
                                'buyer_community_experience',
                                'marketing_publicity',
                                'operations_field_support'
                              )),
  skills                      text NOT NULL,
  previous_experience         text NOT NULL,
  practical_accomplishment    text NOT NULL,
  portfolio_link              text,
  why_join_ebs                text NOT NULL,
  what_can_you_contribute     text NOT NULL,
  weekly_hours_commitment     text NOT NULL,
  comfortable_with_team       boolean NOT NULL DEFAULT true,
  anything_else               text,

  -- STAGE 1 — Application Evidence Scoring (Total 100)
  application_status          text NOT NULL DEFAULT 'new' CHECK (application_status IN (
                                'new', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'
                              )),
  score_experience            integer DEFAULT 0 CHECK (score_experience >= 0 AND score_experience <= 25),
  score_accomplishment        integer DEFAULT 0 CHECK (score_accomplishment >= 0 AND score_accomplishment <= 25),
  score_initiative            integer DEFAULT 0 CHECK (score_initiative >= 0 AND score_initiative <= 15),
  score_commitment            integer DEFAULT 0 CHECK (score_commitment >= 0 AND score_commitment <= 15),
  score_vision                integer DEFAULT 0 CHECK (score_vision >= 0 AND score_vision <= 10),
  score_communication         integer DEFAULT 0 CHECK (score_communication >= 0 AND score_communication <= 10),
  application_score           integer DEFAULT 0,
  evidence_levels             jsonb DEFAULT '{"experience": "E0", "accomplishment": "E0"}'::jsonb,
  application_classification  text DEFAULT 'Low priority',
  application_score_breakdown jsonb DEFAULT '{}'::jsonb,
  reviewer_notes              text,
  reviewed_by                 uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at                 timestamptz,

  -- STAGE 2 — Interview Validation Scoring (Total 100)
  interview_date              timestamptz,
  interview_competence        integer DEFAULT 0 CHECK (interview_competence >= 0 AND interview_competence <= 30),
  interview_problem_solving   integer DEFAULT 0 CHECK (interview_problem_solving >= 0 AND interview_problem_solving <= 20),
  interview_ownership         integer DEFAULT 0 CHECK (interview_ownership >= 0 AND interview_ownership <= 15),
  interview_communication     integer DEFAULT 0 CHECK (interview_communication >= 0 AND interview_communication <= 15),
  interview_ebs_understanding integer DEFAULT 0 CHECK (interview_ebs_understanding >= 0 AND interview_ebs_understanding <= 10),
  interview_teamwork          integer DEFAULT 0 CHECK (interview_teamwork >= 0 AND interview_teamwork <= 10),
  interview_score             integer DEFAULT 0,
  interview_score_breakdown   jsonb DEFAULT '{}'::jsonb,
  claim_validation            text DEFAULT 'unvalidated' CHECK (claim_validation IN (
                                'unvalidated', 'validated', 'partially_validated', 'not_validated'
                              )),
  interview_notes             text,

  -- FINAL EVALUATION (40% App + 60% Interview = 100)
  final_score                 numeric(5, 2) DEFAULT 0,
  final_classification        text DEFAULT 'Not currently suitable',
  final_recommendation        text,

  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;

-- 1. Public can insert new applications
DROP POLICY IF EXISTS "Public insert team application" ON public.team_applications;
CREATE POLICY "Public insert team application" ON public.team_applications 
  FOR INSERT WITH CHECK (true);

-- 2. Public SELECT is disabled (no SELECT policy for anon/authenticated non-admins)
-- Only Service Client / Authorized Admin can view, update, score, or delete records.

-- Indexes for Admin Filtering, Sorting, and Fast Ranking
CREATE INDEX IF NOT EXISTS idx_team_app_status ON public.team_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_team_app_area ON public.team_applications(team_area);
CREATE INDEX IF NOT EXISTS idx_team_app_email ON public.team_applications(email);
CREATE INDEX IF NOT EXISTS idx_team_app_app_score ON public.team_applications(application_score DESC);
CREATE INDEX IF NOT EXISTS idx_team_app_final_score ON public.team_applications(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_team_app_created ON public.team_applications(created_at DESC);
