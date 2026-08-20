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
  const validated = phoneAuthSchema.parse({ phone: phoneInput });

  // Dev bypass ONLY allowed in explicit non-production NODE_ENV
  const isDevEnvironment = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SMS_DEV_MODE === 'true';

  if (isDevEnvironment) {
    console.log(`[AUTH DEV MODE] OTP Code sent to ${validated.phone}: 123456`);
    return { data: { message: 'Dev mode OTP sent: 123456' }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: validated.phone,
  });

  return { data, error };
}

/**
 * Verify OTP code entered by user
 */
export async function verifyPhoneOtp(phoneInput: string, tokenInput: string) {
  const validated = otpVerifySchema.parse({ phone: phoneInput, token: tokenInput });

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

  return { data, error };
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
