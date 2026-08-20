/**
 * lib/telemetry.ts
 * Lightweight event telemetry tracking for Mission 5 measurement loop.
 * Persists events to public.analytics_events via /api/telemetry or direct Supabase.
 */

import { supabase } from './supabase';

export interface TelemetryPayload {
  event_name: string;
  event_data?: Record<string, unknown>;
  user_id?: string;
}

/**
 * Log a telemetry event (client-side or server-side)
 */
export async function trackEvent(
  eventName: string,
  eventData: Record<string, unknown> = {},
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // If in browser context, use fetch API endpoint for consistent execution
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_name: eventName, event_data: eventData, user_id: userId }),
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    }

    // Direct database write if server-side
    const { error } = await supabase.from('analytics_events').insert({
      event_name: eventName,
      event_data: eventData,
      user_id: userId ?? null,
    });

    if (error) {
      console.warn('[TELEMETRY] Direct insert error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[TELEMETRY] Log error:', msg);
    return { success: false, error: msg };
  }
}
