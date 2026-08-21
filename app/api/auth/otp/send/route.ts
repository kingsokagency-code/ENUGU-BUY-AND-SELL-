/**
 * app/api/auth/otp/send/route.ts
 * Server-Side Phone OTP Dispatch via Termii & Supabase
 *
 * 1. Normalizes Nigerian phone numbers (E.164 +234XXXXXXXXXX).
 * 2. Applies server-side in-memory rate limiting (max 4 OTP requests / 15 mins per IP/phone).
 * 3. Integrates with Termii SMS Gateway on the server.
 * 4. Never exposes API keys, secrets, or internal errors to client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { phoneAuthSchema } from '@/lib/validations/auth';
import { sendTermiiOtp } from '@/lib/termii';

// In-memory rate limiter: max 4 attempts per phone number per 15 minutes
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX = 4;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneInput = body?.phone;

    let validated: { phone: string };
    try {
      validated = phoneAuthSchema.parse({ phone: phoneInput });
    } catch {
      return NextResponse.json(
        { error: 'Please enter a valid Nigerian phone number.' },
        { status: 400 }
      );
    }

    const canonicalPhone = validated.phone;

    // Client IP or phone key for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const rateLimitKey = `${ip}:${canonicalPhone}`;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    // Dev bypass for explicit non-production testing environment
    const isDev = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SMS_DEV_MODE === 'true';
    if (isDev) {
      console.log(`[AUTH DEV] Termii bypass OTP for ${canonicalPhone}: 123456`);
      return NextResponse.json({
        success: true,
        devMode: true,
        message: 'Development mode active. Verification code: 123456',
      });
    }

    // Dispatch via Termii SMS
    const termiiRes = await sendTermiiOtp(canonicalPhone);

    if (!termiiRes.success) {
      return NextResponse.json(
        { error: termiiRes.error || "We couldn't send your verification code. Please check your number and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      pinId: termiiRes.pinId,
      message: 'Verification code sent successfully via SMS.',
    });
  } catch (err: unknown) {
    console.error('[API /api/auth/otp/send] Internal error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Internal server error while dispatching verification code.' },
      { status: 500 }
    );
  }
}
