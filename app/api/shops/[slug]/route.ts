import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/shops/[slug]
 * Fetch shop details and active products by shop slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Shop slug required' }, { status: 400 });
    }

    const { data: shop, error: shopErr } = await supabase
      .from('shops')
      .select('*, profiles!inner(id, full_name, avatar_url, is_verified)')
      .eq('slug', slug)
      .single();

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
