/**
 * app/api/auth/otp/verify/route.ts
 * Server-Side Phone OTP Verification & Supabase Session Minting
 *
 * 1. Validates phone number and 6-digit token.
 * 2. Verifies OTP token against Termii verification gateway (or dev mode bypass).
 * 3. Upon successful verification:
 *    - Looks up or provisions the user in Supabase via Admin/Service-Role API.
 *    - Generates a verified Supabase authentication link/token.
 *    - Returns session data to client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { otpVerifySchema } from '@/lib/validations/auth';
import { verifyTermiiOtp } from '@/lib/termii';
import { createClient } from '@supabase/supabase-js';

// Admin Supabase client with service_role key to manage verified users
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone: phoneInput, token: tokenInput, pinId } = body || {};

    let validated: { phone: string; token: string };
    try {
      validated = otpVerifySchema.parse({ phone: phoneInput, token: tokenInput });
    } catch {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit verification code and phone number.' },
        { status: 400 }
      );
    }

    const canonicalPhone = validated.phone;
    const token = validated.token;

    // Check Dev mode bypass
    const isDev = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SMS_DEV_MODE === 'true';
    let isVerified = false;

    if (isDev && token === '123456') {
      isVerified = true;
    } else if (pinId) {
      // Verify via Termii
      const termiiCheck = await verifyTermiiOtp(pinId, token);
      if (!termiiCheck.verified) {
        return NextResponse.json(
          { error: termiiCheck.error || 'Verification code is invalid or has expired.' },
          { status: 400 }
        );
      }
      isVerified = true;
    } else {
      return NextResponse.json(
        { error: 'Missing verification session. Please request a new verification code.' },
        { status: 400 }
      );
    }

    if (!isVerified) {
      return NextResponse.json(
        { error: 'Verification code is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Provision or authenticate the user in Supabase Auth
    const adminClient = getAdminSupabase();
    if (!adminClient) {
      console.error('[API /api/auth/otp/verify] Supabase service role key is not configured.');
      return NextResponse.json(
        { error: 'Authentication infrastructure configuration error.' },
        { status: 500 }
      );
    }

    // 1. Generate an OTP token hash or sign-in link via Supabase Admin
    // Email-alias convention for phone users: +2348012345678 -> 2348012345678@phone.enugubuysell.app
    // Or direct admin user creation/lookup with phone
    const cleanDigits = canonicalPhone.replace(/^\+/, '');
    const virtualEmail = `${cleanDigits}@phone.enugubuysell.app`;

    // Check if user exists or create them
    const { data: existingUserList } = await adminClient.auth.admin.listUsers();
    let targetUser = existingUserList?.users?.find(
      (u) => u.phone === canonicalPhone || u.email === virtualEmail
    );

    if (!targetUser) {
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        phone: canonicalPhone,
        email: virtualEmail,
        phone_confirm: true,
        email_confirm: true,
        user_metadata: { phone: canonicalPhone },
      });

      if (createError || !newUser.user) {
        console.error('[API /api/auth/otp/verify] Failed to provision Supabase user:', createError?.message);
        // Fallback try with email if phone conflict
        const { data: fallbackUser, error: fallbackError } = await adminClient.auth.admin.createUser({
          email: virtualEmail,
          email_confirm: true,
          user_metadata: { phone: canonicalPhone },
        });

        if (fallbackError || !fallbackUser.user) {
          return NextResponse.json(
            { error: 'Failed to create user account session.' },
            { status: 500 }
          );
        }
        targetUser = fallbackUser.user;
      } else {
        targetUser = newUser.user;
      }
    }

    // Generate magic link / session token for the client to establish their browser session
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: virtualEmail,
    });

    if (linkError || !linkData.properties?.hashed_token) {
      console.error('[API /api/auth/otp/verify] Failed to generate login session link:', linkError?.message);
      return NextResponse.json({
        success: true,
        user: targetUser,
        phone: canonicalPhone,
        message: 'Phone verified successfully.',
      });
    }

    return NextResponse.json({
      success: true,
      user: targetUser,
      phone: canonicalPhone,
      tokenHash: linkData.properties.hashed_token,
      email: virtualEmail,
      message: 'Phone verified successfully.',
    });
  } catch (err: unknown) {
    console.error('[API /api/auth/otp/verify] Internal exception:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Internal server error while verifying code.' },
      { status: 500 }
    );
  }
}
