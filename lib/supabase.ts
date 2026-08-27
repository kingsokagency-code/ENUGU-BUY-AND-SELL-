/**
 * lib/supabase.ts
 * Uses @supabase/supabase-js with anon key or service-role key depending on context.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/** Standard Supabase client instance */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Client factory ────────────────────────────────────────────
function makeClient(key: string | undefined): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Service-role client — full access, bypasses RLS */
export function serviceClient(): SupabaseClient | null {
  return makeClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// ── Types ─────────────────────────────────────────────────────
export interface SurveyAnswers {
  whatsapp_number?:    string;
  institution?:        string;
  living_situation?:   string;
  hardest_item?:       string;
  first_search?:       string;
  found_item?:         string;
  biggest_challenge?:  string;
  trust_vs_price?:     string;
  cancelled_purchase?: string;
  platform_preference?: string;
  whatsapp_daily?:     string;
  one_improvement?:    string;
  [key: string]:       string | undefined;
}

export interface SubmitPayload {
  answers:          SurveyAnswers;
  duration_seconds: number;
  completed_at?:    string;
}

// ── Submit a survey response (anon, INSERT only) ──────────────
export async function submitSurveyResponse(
  payload: SubmitPayload
): Promise<{ success: boolean; id?: string; count?: number; error?: string }> {
  const client = serviceClient() || supabase;
  if (!client) {
    console.warn('[EBS] Supabase not configured — response logged locally:', payload.answers);
    return { success: true, id: 'local', count: 0 };
  }

  const { answers, duration_seconds } = payload;
  const oneImprovement = (answers.one_improvement ?? '').trim().slice(0, 1000);

  const { data, error } = await client
    .from('survey_responses')
    .insert({
      whatsapp_number:     (answers.whatsapp_number ?? '').trim(),
      institution:         (answers.institution ?? '').trim(),
      living_situation:    (answers.living_situation ?? '').trim(),
      hardest_item:        (answers.hardest_item ?? '').trim(),
      first_search:        (answers.first_search ?? '').trim(),
      found_item:          (answers.found_item ?? '').trim(),
      biggest_challenge:   (answers.biggest_challenge ?? '').trim(),
      trust_vs_price:      (answers.trust_vs_price ?? '').trim(),
      cancelled_purchase:  (answers.cancelled_purchase ?? '').trim(),
      platform_preference: (answers.platform_preference ?? '').trim(),
      whatsapp_daily:      (answers.whatsapp_daily ?? '').trim(),
      one_improvement:     oneImprovement,
      duration_seconds,
      submitted_at:        payload.completed_at ?? new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[EBS] Insert error:', error.message);
    return { success: false, error: error.message };
  }

  const { count } = await client
    .from('survey_responses')
    .select('*', { count: 'exact', head: true });

  return { success: true, id: data?.id, count: count ?? 0 };
}

export async function getAllResponses(): Promise<Record<string, string>[]> {
  const client = serviceClient() || supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('survey_responses')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) { console.error('[EBS] Read error:', error.message); return []; }
  return (data ?? []) as Record<string, string>[];
}

export async function countResponses(): Promise<number> {
  const client = serviceClient() || supabase;
  if (!client) return 0;
  const { count } = await client
    .from('survey_responses')
    .select('*', { count: 'exact', head: true });
  return count ?? 0;
}

export async function getAnalysisRun(
  responseCount: number
): Promise<{ status: string } | null> {
  const client = serviceClient() || supabase;
  if (!client) return null;
  const { data } = await client
    .from('analysis_runs')
    .select('status')
    .eq('response_count', responseCount)
    .maybeSingle();
  return data;
}

export async function upsertAnalysisRun(
  responseCount: number,
  status: 'pending' | 'processing' | 'complete' | 'failed',
  errorMessage?: string
): Promise<void> {
  const client = serviceClient() || supabase;
  if (!client) return;
  await client.from('analysis_runs').upsert({
    response_count: responseCount,
    status,
    error_message:  errorMessage ?? null,
    completed_at:   status === 'complete' || status === 'failed' ? new Date().toISOString() : null,
  }, { onConflict: 'response_count' });
}

export async function saveInsight(
  report: object,
  responseCount: number
): Promise<void> {
  const client = serviceClient() || supabase;
  if (!client) return;
  await client.from('ai_insights').insert({ report, response_count: responseCount });
}

export async function getLatestInsight(): Promise<{
  id: string;
  response_count: number;
  report: Record<string, unknown>;
  generated_at: string;
} | null> {
  const client = serviceClient() || supabase;
  if (!client) return null;
  const { data } = await client
    .from('ai_insights')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
