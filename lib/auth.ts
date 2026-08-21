/**
 * lib/auth.ts
 * Phase 1 Authentication Foundation (Phone Number Verification)
 * Remediated under Codex Audit Finding H2 & M4 (ESLint TypeScript types)
 */

import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { phoneAuthSchema, otpVerifySchema } from './validations/auth';

export interface AuthState {
  user: User | null;
  session: Session | null;
}

/**
 * Send OTP verification code to student phone number via Termii SMS Gateway
 */
export async function sendPhoneOtp(phoneInput: string) {
  let validated: { phone: string };
  try {
    validated = phoneAuthSchema.parse({ phone: phoneInput });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Please enter a valid Nigerian phone number.';
    return {
      data: null,
      error: { message: message.includes('ZodError') ? 'Please enter a valid Nigerian phone number.' : message },
    };
  }

  // Dev bypass ONLY allowed in explicit non-production NODE_ENV
  const isDevEnvironment = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SMS_DEV_MODE === 'true';

  if (isDevEnvironment) {
    console.log(`[AUTH DEV MODE] OTP Code sent to ${validated.phone}: 123456`);
    return { data: { message: 'Dev mode OTP sent: 123456', pinId: 'dev-pin-id' }, error: null };
  }

  try {
    // 1. First attempt through our dedicated Termii SMS server route
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: validated.phone }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Save pinId in session storage for verification step
      if (typeof window !== 'undefined' && data.pinId) {
        sessionStorage.setItem('ebs_auth_pin_id', data.pinId);
        sessionStorage.setItem('ebs_auth_phone', validated.phone);
      }
      return { data, error: null };
    }

    // 2. Fallback to Supabase native signInWithOtp if custom route is unavailable
    if (res.status === 404) {
      const { data: sbData, error: sbError } = await supabase.auth.signInWithOtp({
        phone: validated.phone,
      });
      if (sbError) throw sbError;
      return { data: sbData, error: null };
    }

    return {
      data: null,
      error: { message: data.error || "We couldn't send your verification code. Please check your number and try again." },
    };
  } catch (err: unknown) {
    console.error('[AUTH] sendPhoneOtp exception:', err);
    return {
      data: null,
      error: { message: "We couldn't send your verification code. Please check your number and try again." },
    };
  }
}

/**
 * Verify OTP code entered by user & establish Supabase session
 */
export async function verifyPhoneOtp(phoneInput: string, tokenInput: string) {
  let validated: { phone: string; token: string };
  try {
    validated = otpVerifySchema.parse({ phone: phoneInput, token: tokenInput });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Please enter a valid Nigerian phone number.';
    return {
      data: null,
      error: { message: message.includes('ZodError') ? 'Please enter a valid Nigerian phone number.' : message },
    };
  }

  // Dev bypass ONLY allowed in explicit non-production NODE_ENV
  const isDevEnvironment = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SMS_DEV_MODE === 'true';

  if (isDevEnvironment && validated.token === '123456') {
    console.log(`[AUTH DEV MODE] OTP Verified for ${validated.phone}`);
    return { data: { user: { id: 'dev-user-id', phone: validated.phone } as unknown as User }, error: null };
  }

  try {
    const pinId = typeof window !== 'undefined' ? sessionStorage.getItem('ebs_auth_pin_id') : null;

    // 1. Verify through our Termii verification route
    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: validated.phone,
        token: validated.token,
        pinId: pinId || undefined,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // If a magic link tokenHash is returned, verify it with the client Supabase instance to set session cookies
      if (data.tokenHash) {
        await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: 'magiclink',
        });
      }

      // Cleanup session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ebs_auth_pin_id');
        sessionStorage.removeItem('ebs_auth_phone');
      }

      return { data, error: null };
    }

    // 2. Fallback to Supabase verifyOtp if custom route is unavailable
    if (res.status === 404) {
      const { data: sbData, error: sbError } = await supabase.auth.verifyOtp({
        phone: validated.phone,
        token: validated.token,
        type: 'sms',
      });
      if (sbError) throw sbError;
      return { data: sbData, error: null };
    }

    return {
      data: null,
      error: { message: data.error || 'Verification code is invalid or has expired.' },
    };
  } catch (err: unknown) {
    console.error('[AUTH] verifyPhoneOtp exception:', err);
    return {
      data: null,
      error: { message: 'Verification code is invalid or has expired. Please try again.' },
    };
  }
}

/**
 * Get current authenticated user session
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Sign out current user session
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
