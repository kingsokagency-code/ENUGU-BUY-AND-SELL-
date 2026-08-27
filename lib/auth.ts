/**
 * lib/auth.ts
 * Phase 2 Authentication & Security Foundation
 * Supports Supabase Native Email Auth, Email Verification, Session Management,
 * Profile Operations, and Store/Seller Ownership Verification.
 */

import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import {
  emailSignupSchema,
  emailLoginSchema,
  phoneAuthSchema,
  otpVerifySchema,
  profileCompletionSchema,
  type ProfileCompletionInput,
} from './validations/auth';

export interface AuthState {
  user: User | null;
  session: Session | null;
}

export interface UserProfile {
  id: string;
  phone?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SellerStatus {
  isSeller: boolean;
  shops: Array<{
    id: string;
    name: string;
    slug: string;
    is_verified: boolean;
    location?: string;
  }>;
  count: number;
}

/**
 * Sign up a new user with Email, Password, and Full Name
 */
export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  try {
    const validated = emailSignupSchema.parse({
      email: input.email,
      password: input.password,
      full_name: input.fullName,
    });

    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.full_name,
        },
      },
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    const needsEmailVerification = !data.session && !!data.user;

    return {
      data: {
        user: data.user,
        session: data.session,
        needsEmailVerification,
      },
      error: null,
    };
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'errors' in err
        ? 'Please check your inputs and try again.'
        : err instanceof Error
        ? err.message
        : 'Sign up failed';
    return { data: null, error: { message: msg } };
  }
}

/**
 * Sign in an existing user with Email and Password
 */
export async function signInWithEmail(input: {
  email: string;
  password: string;
}) {
  try {
    const validated = emailLoginSchema.parse(input);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return {
          data: null,
          error: {
            message: 'Your email address is not verified yet. Please check your inbox for the confirmation link.',
            isUnverified: true,
          },
        };
      }
      return {
        data: null,
        error: { message: error.message || 'Invalid email or password' },
      };
    }

    return { data, error: null };
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'errors' in err
        ? 'Please enter a valid email and password.'
        : err instanceof Error
        ? err.message
        : 'Sign in failed';
    return { data: null, error: { message: msg } };
  }
}

/**
 * Sign in / Sign up with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://enugu-buy-sell.vercel.app';
    const targetUrl = redirectTo
      ? `${origin}/auth?redirect=${encodeURIComponent(redirectTo)}`
      : `${origin}/auth`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetUrl,
      },
    });

    if (error) {
      return { error: { message: error.message } };
    }
    return { data, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Google sign-in failed';
    return { error: { message: msg } };
  }
}

/**
 * Resend email verification link
 */
export async function resendVerificationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to resend confirmation email',
    };
  }
}

/**
 * Fetch profile data for an authenticated user
 */
export async function getUserProfile(userId: string): Promise<{
  profile: UserProfile | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { profile: null, error: error.message };
    }

    return { profile: data, error: null };
  } catch (err: unknown) {
    return {
      profile: null,
      error: err instanceof Error ? err.message : 'Error fetching user profile',
    };
  }
}

/**
 * Update user's profile record in public.profiles (respects RLS)
 */
export async function updateUserProfile(
  userId: string,
  input: ProfileCompletionInput
): Promise<{ success: boolean; profile?: UserProfile | null; error?: string | null }> {
  try {
    const validated = profileCompletionSchema.parse(input);

    const updatePayload: Record<string, unknown> = {
      full_name: validated.full_name,
      location: validated.location,
      updated_at: new Date().toISOString(),
    };

    if (validated.phone) {
      updatePayload.phone = validated.phone;
    }
    if (validated.avatar_url) {
      updatePayload.avatar_url = validated.avatar_url;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data, error: null };
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'errors' in err
        ? 'Invalid profile data provided.'
        : err instanceof Error
        ? err.message
        : 'Profile update failed';
    return { success: false, error: msg };
  }
}

/**
 * Check if the user is an authorized Seller (owns ≥ 1 shop in public.shops)
 */
export async function checkUserSellerStatus(userId: string): Promise<SellerStatus> {
  try {
    const { data: shops, error } = await supabase
      .from('shops')
      .select('id, name, slug, is_verified, location')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error || !shops) {
      return { isSeller: false, shops: [], count: 0 };
    }

    return {
      isSeller: shops.length > 0,
      shops,
      count: shops.length,
    };
  } catch {
    return { isSeller: false, shops: [], count: 0 };
  }
}

/**
 * Get current authenticated user session
 */
export async function getCurrentUser() {
  try {
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    if (session?.user) {
      return { user: session.user, session, error: null };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, session: null, error };
  } catch (err: unknown) {
    return { user: null, session: null, error: err as any };
  }
}

/**
 * Get current session object
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
}

/**
 * Sign out current user session
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Send OTP verification code via Termii SMS (Optional / Non-blocking legacy pathway)
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

  const isDevEnvironment = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SMS_DEV_MODE === 'true';

  if (isDevEnvironment) {
    return { data: { message: 'Dev mode OTP sent: 123456', pinId: 'dev-pin-id' }, error: null };
  }

  try {
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: validated.phone }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      if (typeof window !== 'undefined' && data.pinId) {
        sessionStorage.setItem('ebs_auth_pin_id', data.pinId);
        sessionStorage.setItem('ebs_auth_phone', validated.phone);
      }
      return { data, error: null };
    }

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
 * Verify OTP code entered by user & establish session (Optional / Non-blocking legacy pathway)
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

  const isDevEnvironment = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SMS_DEV_MODE === 'true';

  if (isDevEnvironment && validated.token === '123456') {
    return { data: { user: { id: 'dev-user-id', phone: validated.phone } as unknown as User }, error: null };
  }

  try {
    const pinId = typeof window !== 'undefined' ? sessionStorage.getItem('ebs_auth_pin_id') : null;

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
      if (data.tokenHash) {
        await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: 'magiclink',
        });
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ebs_auth_pin_id');
        sessionStorage.removeItem('ebs_auth_phone');
      }

      return { data, error: null };
    }

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
