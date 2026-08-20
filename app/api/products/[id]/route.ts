import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/products/[id]
 * Fetch single product details with shop & seller profile information
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*, shops(*, profiles!inner(id, full_name, avatar_url, is_verified))')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Telemetry logging
    try {
      await supabase.from('analytics_events').insert({
        event_name: 'product_view',
        event_data: { product_id: product.id, shop_id: product.shop_id },
      });
    } catch {}

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
