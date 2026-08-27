/**
 * lib/server-auth.ts
 * Authoritative Server-side Authentication & Session Extraction Helper
 * Extracts and verifies JWT access token from incoming Next.js requests.
 */

import { User } from '@supabase/supabase-js';
import { supabase, serviceClient } from './supabase';

export interface ServerAuthResult {
  user: User | null;
  token: string | null;
  error: string | null;
}

/**
 * Extract Bearer token from Request headers or cookies and verify with Supabase Auth
 */
export async function getAuthenticatedUser(request: Request): Promise<ServerAuthResult> {
  try {
    let token: string | null = null;

    // 1. Check Authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Check cookies if header is absent
    if (!token) {
      const cookieHeader = request.headers.get('cookie') || '';
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [k, ...v] = c.trim().split('=');
          return [k, v.join('=')];
        })
      );

      // Common Supabase cookie names
      token = cookies['sb-access-token'] || cookies['supabase-auth-token'] || null;

      // Handle JSON-encoded Supabase auth cookies
      if (!token) {
        for (const [key, value] of Object.entries(cookies)) {
          if (key.includes('auth-token') && value) {
            try {
              const decoded = decodeURIComponent(value);
              if (decoded.startsWith('[') || decoded.startsWith('{')) {
                const parsed = JSON.parse(decoded);
                if (typeof parsed === 'string') token = parsed;
                else if (parsed.access_token) token = parsed.access_token;
                else if (Array.isArray(parsed) && parsed[0]) token = parsed[0];
              } else {
                token = decoded;
              }
              if (token) break;
            } catch {
              // continue checking
            }
          }
        }
      }
    }

    if (!token) {
      // Fallback check on standard client (works in same-process environments)
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        return { user, token: null, error: null };
      }
      return { user: null, token: null, error: 'No authentication credentials provided' };
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, token: null, error: error?.message || 'Invalid or expired session token' };
    }

    return { user, token, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication verification failed';
    return { user: null, token: null, error: msg };
  }
}

/**
 * Get Service-role database client for authoritative backend transactions
 */
export function getAdminClient() {
  const client = serviceClient();
  if (!client) {
    throw new Error('Supabase service role client is not configured');
  }
  return client;
}
