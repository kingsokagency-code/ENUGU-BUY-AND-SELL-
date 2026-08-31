/**
 * app/api/recruitment/apply/route.ts
 * Public Application Endpoint for EBS Volunteer Recruitment
 */

import { NextResponse } from 'next/server';
import { submitTeamApplication } from '@/lib/recruitment';
import { sanitizeErrorMessage } from '@/lib/error-utils';

// Rate Limiter: max 3 submissions per IP per 30 minutes
const ipLimiter = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 3;
const WINDOW_MS = 30 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    ipLimiter.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= LIMIT) {
    return true;
  }
  entry.count++;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions from this device. Please wait a bit before trying again.' },
        { status: 429 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid application payload' }, { status: 400 });
    }

    const res = await submitTeamApplication(body);

    if (!res.success) {
      return NextResponse.json(
        { error: res.error || 'Failed to submit application. Please check your answers.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      id: res.id,
      message: 'Application received successfully. Thank you for stepping forward to build with EBS.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, 'An unexpected error occurred during submission.') },
      { status: 500 }
    );
  }
}
