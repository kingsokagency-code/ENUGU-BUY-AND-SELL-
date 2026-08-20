import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_name, event_data, user_id } = body;

    if (!event_name || typeof event_name !== 'string') {
      return NextResponse.json({ error: 'event_name is required' }, { status: 400 });
    }

    const { data: event, error: dbErr } = await supabase
      .from('analytics_events')
      .insert({
        event_name: event_name.trim(),
        event_data: event_data ?? {},
        user_id: user_id ?? null,
      })
      .select('id')
      .single();

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: event?.id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
