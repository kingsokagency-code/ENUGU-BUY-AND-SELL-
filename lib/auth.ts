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
 * Send OTP verification code to student phone number
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
    return { data: { message: 'Dev mode OTP sent: 123456' }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: validated.phone,
  });

  if (error) {
    const errorMsg = error.message.toLowerCase();
    const errorStatus = 'status' in error ? (error as { status?: number }).status : undefined;
    const errorCode = 'code' in error ? (error as { code?: string }).code : undefined;
    let friendlyMessage = "We couldn't send your verification code. Please check your number and try again.";

    if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests') || errorStatus === 429) {
      friendlyMessage = 'Too many attempts. Please wait a few minutes and try again.';
    } else if (errorMsg.includes('provider') || errorCode === 'phone_provider_disabled') {
      friendlyMessage = 'SMS verification is currently being configured for this network. Please try again shortly or contact support.';
    } else if (errorMsg.includes('invalid') && errorMsg.includes('phone')) {
      friendlyMessage = 'Please enter a valid Nigerian phone number.';
    }

    return {
      data: null,
      error: { message: friendlyMessage },
    };
  }

  return { data, error: null };
}

/**
 * Verify OTP code entered by user
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

  // Production Auth Execution
  const { data, error } = await supabase.auth.verifyOtp({
    phone: validated.phone,
    token: validated.token,
    type: 'sms',
  });

  if (error) {
    const errorMsg = error.message.toLowerCase();
    const errorStatus = 'status' in error ? (error as { status?: number }).status : undefined;
    let friendlyMessage = 'Verification code is invalid or has expired. Please check and try again.';

    if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests') || errorStatus === 429) {
      friendlyMessage = 'Too many attempts. Please wait a few minutes and try again.';
    } else if (errorMsg.includes('expired')) {
      friendlyMessage = 'Verification code has expired. Please request a new code.';
    }

    return {
      data: null,
      error: { message: friendlyMessage },
    };
  }

  return { data, error: null };
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
