import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/shops/[slug]
 * Fetch shop details and active products by shop slug or UUID ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Shop slug or ID required' }, { status: 400 });
    }

    const isUUID = UUID_REGEX.test(slug);

    let query = supabase
      .from('shops')
      .select('*, profiles(id, full_name, avatar_url, is_verified)');

    if (isUUID) {
      query = query.eq('id', slug);
    } else {
      query = query.eq('slug', slug);
    }

    const { data: shop, error: shopErr } = await query.single();

    if (shopErr || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shop.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (prodErr) {
      return NextResponse.json({ error: prodErr.message }, { status: 400 });
    }

    // Telemetry logging
    try {
      await supabase.from('analytics_events').insert({
        event_name: 'shop_view',
        event_data: { shop_id: shop.id, slug: shop.slug },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      shop,
      products: products ?? [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/shops/[slug]
 * Update store settings (name, description, logo_url, location) by verified owner (slug or UUID)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Shop ID or slug required' }, { status: 400 });
    }

    // 1. Authenticate user
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized: Seller sign-in required' }, { status: 401 });
    }

    const admin = getAdminClient();
    const isUUID = UUID_REGEX.test(slug);

    // 2. Fetch & verify shop ownership
    let shopQuery = admin.from('shops').select('id, owner_id');
    if (isUUID) {
      shopQuery = shopQuery.eq('id', slug);
    } else {
      shopQuery = shopQuery.eq('slug', slug);
    }

    const { data: shop, error: fetchErr } = await shopQuery.single();

    if (fetchErr || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (shop.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this shop' }, { status: 403 });
    }

    const body = await request.json();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.name === 'string' && body.name.trim().length >= 2) {
      updatePayload.name = body.name.trim();
    }
    if (typeof body.description === 'string') {
      updatePayload.description = body.description.trim();
    }
    if (typeof body.location === 'string') {
      updatePayload.location = body.location.trim();
    }
    if (typeof body.logo_url === 'string' && (body.logo_url.startsWith('http') || body.logo_url.startsWith('/'))) {
      updatePayload.logo_url = body.logo_url;
    }

    const { data: updatedShop, error: updateErr } = await admin
      .from('shops')
      .update(updatePayload)
      .eq('id', shop.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      shop: updatedShop,
      message: 'Store settings updated successfully',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
