/**
 * app/api/submit/route.ts
 * Accepts survey submissions, validates, and saves to Supabase.
 * Remediated under Codex Audit Finding H5 (AI Auto-trigger removed).
 */

import { NextResponse } from 'next/server';
import { submitSurveyResponse } from '@/lib/supabase';
import type { SubmitPayload, SurveyAnswers } from '@/lib/supabase';

// ── In-memory rate limiter (per IP, 3 submissions/hour) ───────
const limiter = new Map<string, { count: number; resetAt: number }>();
const LIMIT   = 3;
const WINDOW  = 60 * 60 * 1_000; // 1 hour

function limited(ip: string): boolean {
  const now   = Date.now();
  const entry = limiter.get(ip);
  if (!entry || now > entry.resetAt) {
    limiter.set(ip, { count: 1, resetAt: now + WINDOW });
    return false;
  }
  if (entry.count >= LIMIT) return true;
  entry.count++;
  return false;
}

// ── WhatsApp number validation ────────────────────────────────
function validPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

// ── Required survey fields ────────────────────────────────────
const REQUIRED_FIELDS: (keyof SurveyAnswers)[] = [
  'institution', 'living_situation', 'hardest_item',
  'first_search', 'found_item', 'biggest_challenge',
  'trust_vs_price', 'cancelled_purchase',
  'platform_preference', 'whatsapp_daily', 'one_improvement',
];

function validate(answers: SurveyAnswers): string[] {
  const errs: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!answers[field]?.trim()) errs.push(`${field} is required`);
  }
  if ((answers.one_improvement?.length ?? 0) > 1000) {
    errs.push('one_improvement must be 1 000 characters or fewer');
  }
  return errs;
}

// ── POST /api/submit ──────────────────────────────────────────
export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (limited(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions from this device. Please try again later.' },
      { status: 429 }
    );
  }

  // Parse body
  let body: Partial<SubmitPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const answers = (body.answers ?? {}) as SurveyAnswers;

  // Validate WhatsApp number
  if (!answers.whatsapp_number || !validPhone(answers.whatsapp_number)) {
    return NextResponse.json(
      { error: 'Please enter a valid WhatsApp number (at least 10 digits).' },
      { status: 400 }
    );
  }

  // Validate all required fields
  const errors = validate(answers);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Some answers are missing. Please complete the survey.', details: errors },
      { status: 400 }
    );
  }

  // Persist to Supabase
  const result = await submitSurveyResponse({
    answers,
    duration_seconds: body.duration_seconds ?? 0,
    completed_at:     body.completed_at,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'We could not save your response. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, count: result.count ?? 0 });
}
