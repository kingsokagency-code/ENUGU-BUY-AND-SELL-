import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/reports
 * Submit a community safety report for a listing, seller, or user
 */
export async function POST(request: Request) {
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required to submit report' }, { status: 401 });
    }

    const body = await request.json();
    const { target_type, target_id, reason, details } = body;

    if (!target_type || !['listing', 'seller', 'user'].includes(target_type)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    if (!target_id || typeof target_id !== 'string') {
      return NextResponse.json({ error: 'Target ID required' }, { status: 400 });
    }

    const validReasons = ['scam', 'fake_product', 'harassment', 'prohibited_item', 'spam', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid report reason' }, { status: 400 });
    }

    const { data: report, error: dbErr } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_type,
        target_id,
        reason,
        details: details?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 400 });
    }

    // Telemetry
    try {
      await supabase.from('analytics_events').insert({
        event_name: 'report_submitted',
        event_data: { target_type, target_id, reason },
        user_id: user.id,
      });
    } catch {}

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
