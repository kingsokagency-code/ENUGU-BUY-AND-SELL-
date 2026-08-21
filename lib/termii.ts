/**
 * lib/termii.ts
 * Termii SMS Delivery Integration for Nigerian Phone Authentication
 * 
 * Interacts with the official Termii REST API endpoints strictly on the server-side.
 * All API keys are loaded via process.env.TERMII_API_KEY (never exposed to client bundle).
 */

const TERMII_BASE_URL = process.env.TERMII_BASE_URL || 'https://api.ng.termii.com';
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'EnuguBuy';

export interface TermiiSendTokenResponse {
  pinId?: string;
  to?: string;
  smsStatus?: string;
  status?: string | number;
  message?: string;
}

export interface TermiiVerifyTokenResponse {
  pinId?: string;
  verified?: boolean | string;
  msisdn?: string;
  status?: string | number;
  message?: string;
}

export interface TermiiDirectSmsResponse {
  message_id?: string;
  message?: string;
  balance?: number;
  user?: string;
}

/**
 * Dispatches a transactional OTP SMS to a normalized Nigerian phone number using Termii Token API.
 * 
 * @param canonicalPhone E.164 phone string (e.g. "+2348012345678" or "2348012345678")
 * @returns Result with pinId for subsequent verification
 */
export async function sendTermiiOtp(canonicalPhone: string): Promise<{ success: boolean; pinId?: string; error?: string }> {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    console.warn('[TERMII] Missing TERMII_API_KEY environment variable.');
    return { success: false, error: 'SMS service configuration is incomplete.' };
  }

  // Format destination without leading plus for Termii (e.g. 2348012345678)
  const destination = canonicalPhone.replace(/^\+/, '');

  try {
    const response = await fetch(`${TERMII_BASE_URL}/api/sms/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        message_type: 'NUMERIC',
        to: destination,
        from: TERMII_SENDER_ID,
        channel: 'dnd', // DND channel routes through Nigerian telecom priority queues
        pin_attempts: 5,
        pin_time_to_live: 10, // 10 minutes expiry
        pin_length: 6,
        pin_placeholder: '< 123456 >',
        message_text: 'Your ENUGU BUY & SELL verification code is: < 123456 >. Valid for 10 mins. Do not share this code.',
      }),
    });

    const data: TermiiSendTokenResponse = await response.json();

    if (response.ok && data.pinId) {
      return { success: true, pinId: data.pinId };
    }

    // Handle Termii error response
    console.error('[TERMII] Send OTP failed:', data.message || data.status || response.statusText);
    return {
      success: false,
      error: data.message || "We couldn't send your verification code. Please check your number and try again.",
    };
  } catch (err: unknown) {
    console.error('[TERMII] Network/Exception during send OTP:', err instanceof Error ? err.message : err);
    return { success: false, error: 'Connection error while contacting SMS gateway.' };
  }
}

/**
 * Verifies the user-entered OTP against Termii's verification gateway.
 * 
 * @param pinId The pinId returned when the OTP was sent
 * @param pin The 6-digit code entered by the student
 * @returns boolean indicating if the token is valid
 */
export async function verifyTermiiOtp(pinId: string, pin: string): Promise<{ verified: boolean; error?: string }> {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    return { verified: false, error: 'SMS service configuration is incomplete.' };
  }

  try {
    const response = await fetch(`${TERMII_BASE_URL}/api/sms/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        pin_id: pinId,
        pin: pin.trim(),
      }),
    });

    const data: TermiiVerifyTokenResponse = await response.json();

    const isVerified = data.verified === true || data.verified === 'True' || data.verified === 'true';

    if (response.ok && isVerified) {
      return { verified: true };
    }

    return {
      verified: false,
      error: data.message || 'Verification code is invalid or has expired.',
    };
  } catch (err: unknown) {
    console.error('[TERMII] Network error during verify OTP:', err instanceof Error ? err.message : err);
    return { verified: false, error: 'Connection error while verifying code.' };
  }
}
