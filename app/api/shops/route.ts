import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createShopSchema } from '@/lib/validations/shop';

/**
 * GET /api/shops
 * List active shops or user's owned shops (?owner=true)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerOnly = searchParams.get('owner') === 'true';
    const q = searchParams.get('q')?.trim() ?? '';

    if (ownerOnly) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: userShops, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, shops: userShops ?? [] });
    }

    let query = supabase
      .from('shops')
      .select('*, profiles!inner(full_name, avatar_url, is_verified)')
      .order('created_at', { ascending: false })
      .limit(40);

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`);
    }

    const { data: shops, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: shops?.length ?? 0, shops: shops ?? [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/shops
 * Authenticated Shop Creation for Sellers
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate seller user session
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized seller authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // 2. Server-side Zod Validation
    const validated = createShopSchema.parse(body);

    // 3. Database Mutation
    const { data: shop, error: dbErr } = await supabase
      .from('shops')
      .insert({
        owner_id: user.id,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        location: validated.location ?? 'Enugu',
      })
      .select()
      .single();

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 400 });
    }

    // Log telemetry event
    try {
      await supabase.from('analytics_events').insert({
        event_name: 'shop_created',
        event_data: { shop_id: shop.id, slug: shop.slug },
        user_id: user.id,
      });
    } catch {}

    return NextResponse.json({ success: true, shop }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Validation Error', details: (err as { errors: unknown }).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
