/**
 * lib/error-utils.ts
 * Global Human-Friendly Error Sanitizer for Enugu Buy & Sell (EBS)
 * Ensures no raw JSON objects, Zod schemas, Postgres codes, or UUID errors ever reach user interfaces.
 */

export function sanitizeErrorMessage(rawError: unknown, defaultMessage = 'Something went wrong. Please try again.'): string {
  if (!rawError) return defaultMessage;

  // 1. If string
  if (typeof rawError === 'string') {
    const trimmed = rawError.trim();
    if (!trimmed || trimmed === '{}' || trimmed === 'null' || trimmed === 'undefined') {
      return defaultMessage;
    }

    // Common PostgREST / Postgres raw error mappings
    if (trimmed.includes('PGRST116') || trimmed.includes('0 rows')) {
      return 'Account profile is being created. Please save again.';
    }
    if (trimmed.includes('unique constraint') || trimmed.includes('23505')) {
      return 'This store name or URL is already taken. Please choose a slightly different name.';
    }
    if (trimmed.includes('violates row-level security')) {
      return 'Session expired. Please sign in again.';
    }
    if (trimmed.includes('Invalid product ID') || trimmed.includes('invalid_format')) {
      return 'Product listing not found or is no longer available.';
    }
    if (trimmed.includes('Failed to fetch') || trimmed.includes('NetworkError')) {
      return 'Network connection error. Please check your internet and try again.';
    }

    // If it looks like raw JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return sanitizeErrorMessage(parsed, defaultMessage);
      } catch {
        return defaultMessage;
      }
    }

    return trimmed;
  }

  // 2. If standard Error object
  if (rawError instanceof Error) {
    return sanitizeErrorMessage(rawError.message, defaultMessage);
  }

  // 3. If object (such as Zod errors, Supabase error objects, API responses)
  if (typeof rawError === 'object') {
    const obj = rawError as Record<string, unknown>;

    if (typeof obj.message === 'string' && obj.message.trim()) {
      return sanitizeErrorMessage(obj.message, defaultMessage);
    }
    if (typeof obj.error === 'string' && obj.error.trim()) {
      return sanitizeErrorMessage(obj.error, defaultMessage);
    }
    if (typeof obj.error_description === 'string' && obj.error_description.trim()) {
      return sanitizeErrorMessage(obj.error_description, defaultMessage);
    }
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const first = obj.errors[0];
      if (typeof first === 'object' && first?.message) {
        return sanitizeErrorMessage(first.message, defaultMessage);
      }
    }
    if (Array.isArray(obj.details) && obj.details.length > 0) {
      const first = obj.details[0];
      if (typeof first === 'object' && first?.message) {
        return sanitizeErrorMessage(first.message, defaultMessage);
      }
    }
  }

  return defaultMessage;
}
