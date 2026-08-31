/**
 * lib/validations/recruitment.ts
 * Validation schemas for EBS Volunteer Recruitment Funnel & Candidate Evaluation Engine
 */

import { z } from 'zod';

export const TEAM_AREAS = [
  'technology_development',
  'business_strategy',
  'sales_seller_community',
  'buyer_community_experience',
  'marketing_publicity',
  'operations_field_support',
] as const;

export type TeamArea = (typeof TEAM_AREAS)[number];

export const TEAM_AREA_LABELS: Record<TeamArea, { title: string; subtitle: string; icon: string }> = {
  technology_development: {
    title: 'Technology & Development',
    subtitle: 'Programming, Web/Mobile Dev, APIs, Database, UI/UX, DevOps',
    icon: 'Code',
  },
  business_strategy: {
    title: 'Business & Strategy',
    subtitle: 'Business Development, Partnerships, Market Research, Strategy',
    icon: 'Briefcase',
  },
  sales_seller_community: {
    title: 'Sales & Seller Community',
    subtitle: 'Seller Acquisition, Merchant Onboarding, Sales, Community Building',
    icon: 'Megaphone',
  },
  buyer_community_experience: {
    title: 'Buyer Community & Experience',
    subtitle: 'Buyer Engagement, Customer Experience, User Feedback, Campus Outreach',
    icon: 'Users',
  },
  marketing_publicity: {
    title: 'Marketing & Publicity',
    subtitle: 'Content Writing, Graphic Design, Social Media, PR, Growth Campaigns',
    icon: 'Palette',
  },
  operations_field_support: {
    title: 'Operations & Field Support',
    subtitle: 'Field Verification, Shop Auditing, Moderation, Event Coordination',
    icon: 'ShieldCheck',
  },
};

export const APPLICATION_STATUSES = [
  'new',
  'reviewing',
  'shortlisted',
  'interview',
  'accepted',
  'rejected',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const EVIDENCE_LEVELS = ['E0', 'E1', 'E2', 'E3', 'E4'] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export const EVIDENCE_LEVEL_DESCRIPTIONS: Record<EvidenceLevel, string> = {
  E0: 'Unsupported claim (no practical context provided)',
  E1: 'General explanation (descriptive but lacking specific proof)',
  E2: 'Concrete example (clear personal participation described)',
  E3: 'Specific evidence (measurable outcome / verifiable results)',
  E4: 'Documented proof (portfolio, links, metrics, or verifiable artifact)',
};

/**
 * Public Applicant Submission Schema
 */
export const teamApplicationSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name (at least 2 characters)').max(100, 'Name too long'),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  whatsapp_number: z
    .string()
    .min(10, 'Please enter a valid WhatsApp phone number (at least 10 digits)')
    .max(16, 'Phone number too long')
    .trim(),
  school_institution: z.string().min(2, 'Please enter your institution or affiliation (e.g. UNEC, UNN, ESUT, IMT, etc.)').max(100),
  location: z.string().min(2, 'Please specify your location in or around Enugu').max(100),
  team_area: z.enum(TEAM_AREAS, {
    message: 'Please select one of the six team areas',
  }),
  skills: z.string().min(3, 'Please summarize your skills or areas of competence').max(1000),
  previous_experience: z.string().min(10, 'Please describe any relevant background or experience').max(2000),
  practical_accomplishment: z
    .string()
    .min(20, 'Please describe something you have actually built, sold, managed, organized, or accomplished in at least a few sentences')
    .max(3000),
  portfolio_link: z
    .string()
    .url('Please enter a valid URL (starting with http:// or https://)')
    .optional()
    .or(z.literal(''))
    .nullable(),
  why_join_ebs: z.string().min(10, 'Please tell us why you are interested in joining the EBS startup movement').max(2000),
  what_can_you_contribute: z.string().min(10, 'Please tell us how you can contribute to EBS').max(2000),
  weekly_hours_commitment: z.string().min(1, 'Please specify your realistic weekly commitment'),
  comfortable_with_team: z.boolean().default(true),
  anything_else: z.string().max(1000).optional().or(z.literal('')).nullable(),
});

export type TeamApplicationInput = z.infer<typeof teamApplicationSchema>;

/**
 * Stage 1 Candidate Evaluation Schema (100 pts)
 */
export const stage1ScoringSchema = z.object({
  score_experience: z.number().int().min(0).max(25, 'Max 25 points for Relevant Experience'),
  score_accomplishment: z.number().int().min(0).max(25, 'Max 25 points for Practical Accomplishment'),
  score_initiative: z.number().int().min(0).max(15, 'Max 15 points for Initiative & Problem Solving'),
  score_commitment: z.number().int().min(0).max(15, 'Max 15 points for Commitment & Availability'),
  score_vision: z.number().int().min(0).max(10, 'Max 10 points for EBS Vision Alignment'),
  score_communication: z.number().int().min(0).max(10, 'Max 10 points for Communication & Clarity'),
  evidence_level_experience: z.enum(EVIDENCE_LEVELS).default('E0'),
  evidence_level_accomplishment: z.enum(EVIDENCE_LEVELS).default('E0'),
  reviewer_notes: z.string().max(3000).optional().nullable(),
  application_status: z.enum(APPLICATION_STATUSES).optional(),
});

export type Stage1ScoringInput = z.infer<typeof stage1ScoringSchema>;

/**
 * Stage 2 Interview Evaluation Schema (100 pts)
 */
export const stage2ScoringSchema = z.object({
  interview_competence: z.number().int().min(0).max(30, 'Max 30 points for Practical Competence'),
  interview_problem_solving: z.number().int().min(0).max(20, 'Max 20 points for Problem Solving'),
  interview_ownership: z.number().int().min(0).max(15, 'Max 15 points for Ownership / Initiative'),
  interview_communication: z.number().int().min(0).max(15, 'Max 15 points for Communication'),
  interview_ebs_understanding: z.number().int().min(0).max(10, 'Max 10 points for EBS Understanding'),
  interview_teamwork: z.number().int().min(0).max(10, 'Max 10 points for Teamwork / Reliability'),
  claim_validation: z.enum(['unvalidated', 'validated', 'partially_validated', 'not_validated']).default('unvalidated'),
  interview_notes: z.string().max(3000).optional().nullable(),
  final_recommendation: z.string().max(1000).optional().nullable(),
  application_status: z.enum(APPLICATION_STATUSES).optional(),
});

export type Stage2ScoringInput = z.infer<typeof stage2ScoringSchema>;

/**
 * Helper to calculate Stage 1 classification
 */
export function calculateApplicationClassification(score: number): string {
  if (score >= 90) return 'Exceptional candidate';
  if (score >= 80) return 'Strong candidate';
  if (score >= 70) return 'Interview consideration';
  if (score >= 60) return 'Developing / reserve';
  return 'Low priority';
}

/**
 * Helper to calculate Final classification (40% App + 60% Interview)
 */
export function calculateFinalClassification(finalScore: number): string {
  if (finalScore >= 90) return 'Exceptional';
  if (finalScore >= 80) return 'Strong';
  if (finalScore >= 70) return 'Suitable';
  if (finalScore >= 60) return 'Developing';
  return 'Not currently suitable';
}
