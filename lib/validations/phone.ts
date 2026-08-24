/**
 * lib/validations/phone.ts
 * Nigerian Phone Number Normalization & Validation Utility
 *
 * Normalizes various Nigerian phone number formats to E.164 canonical format (+234XXXXXXXXXX).
 * Returns safe, user-friendly error messages rather than raw validation internals.
 */

export interface PhoneNormalizationResult {
  isValid: boolean;
  canonicalPhone: string | null;
  error: string | null;
}

const USER_FRIENDLY_ERROR = 'Please enter a valid Nigerian phone number.';

/**
 * Normalizes a raw phone number input into canonical Nigerian E.164 format (+234XXXXXXXXXX).
 *
 * Accepted input formats:
 * - 08012345678 -> +2348012345678 (11 digits with leading 0)
 * - 8012345678 -> +2348012345678 (10 digits without leading 0)
 * - 2348012345678 -> +2348012345678 (13 digits with 234 prefix)
 * - +2348012345678 -> +2348012345678 (14 characters with +234 prefix)
 * - Formatted strings: "+234 801 234 5678", "0801-234-5678", "(0801) 234 5678"
 *
 * @param input Raw phone number string
 * @returns PhoneNormalizationResult
 */
export function normalizeNigerianPhone(input: string | null | undefined): PhoneNormalizationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      canonicalPhone: null,
      error: USER_FRIENDLY_ERROR,
    };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      canonicalPhone: null,
      error: USER_FRIENDLY_ERROR,
    };
  }

  // Remove whitespace, dashes, parentheses, dots
  let sanitized = trimmed.replace(/[\s\-().]/g, '');

  // Check if starts with '+'
  const hasPlus = sanitized.startsWith('+');
  if (hasPlus) {
    sanitized = sanitized.slice(1);
  }

  // If there are non-digit characters remaining, it's invalid
  if (!/^\d+$/.test(sanitized)) {
    return {
      isValid: false,
      canonicalPhone: null,
      error: USER_FRIENDLY_ERROR,
    };
  }

  let local10Digits = '';

  // Case 1: Starts with 234 followed by 10 digits (13 digits total) -> e.g. 2348012345678 or 2348123456789
  if (sanitized.startsWith('234') && sanitized.length === 13) {
    local10Digits = sanitized.slice(3);
  }
  // Case 2: Starts with 0 followed by 10 digits (11 digits total) -> e.g. 08012345678 or 08123456789
  else if (sanitized.startsWith('0') && sanitized.length === 11) {
    local10Digits = sanitized.slice(1);
  }
  // Case 3: 10 digits without leading 0 -> e.g. 8012345678 or 8123456789
  else if (sanitized.length === 10) {
    local10Digits = sanitized;
  }
  else {
    return {
      isValid: false,
      canonicalPhone: null,
      error: USER_FRIENDLY_ERROR,
    };
  }

  // Validate that the 10-digit number starts with a valid Nigerian mobile prefix (70, 71, 80, 81, 90, 91)
  const prefix2 = local10Digits.slice(0, 2);
  const VALID_PREFIXES = ['70', '71', '80', '81', '90', '91'];
  if (!VALID_PREFIXES.includes(prefix2)) {
    return {
      isValid: false,
      canonicalPhone: null,
      error: USER_FRIENDLY_ERROR,
    };
  }

  const canonicalPhone = `+234${local10Digits}`;

  return {
    isValid: true,
    canonicalPhone,
    error: null,
  };
}

/**
 * Returns formatted display text for a phone number (e.g. 0801 234 5678 or +234 801 234 5678)
 */
export function formatNigerianPhoneDisplay(canonicalPhone: string): string {
  if (!canonicalPhone.startsWith('+234') || canonicalPhone.length !== 14) {
    return canonicalPhone;
  }
  const part1 = canonicalPhone.slice(0, 4); // +234
  const part2 = canonicalPhone.slice(4, 7); // 801
  const part3 = canonicalPhone.slice(7, 10); // 234
  const part4 = canonicalPhone.slice(10); // 5678
  return `${part1} ${part2} ${part3} ${part4}`;
}
