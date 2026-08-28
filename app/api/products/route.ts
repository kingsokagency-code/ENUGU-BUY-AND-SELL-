import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';
import { createProductSchema } from '@/lib/validations/product';

/**
 * GET /api/products
 * Search and browse active products in Enugu Buy & Sell catalog
 * Supports: ?seller=true (authenticated seller products) or public browse (?q=query &category=id &shop_id=id)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isSellerQuery = searchParams.get('seller') === 'true';

    // 1. Seller-scoped query: Return all products for shops owned by authenticated user
    if (isSellerQuery) {
      const { user, error: authErr } = await getAuthenticatedUser(request);
      if (authErr || !user) {
        return NextResponse.json({ error: 'Seller authentication required' }, { status: 401 });
      }

      const admin = getAdminClient();
      const { data: userShops, error: shopErr } = await admin
        .from('shops')
        .select('id, name, slug')
        .eq('owner_id', user.id);

      if (shopErr) {
        return NextResponse.json({ error: shopErr.message }, { status: 400 });
      }

      const shopIds = (userShops ?? []).map(s => s.id);
      if (shopIds.length === 0) {
        return NextResponse.json({ success: true, count: 0, products: [] });
      }

      const { data: sellerProducts, error: prodErr } = await admin
        .from('products')
        .select('*, shops(id, name, slug, is_verified, location), categories(id, name, slug)')
        .in('shop_id', shopIds)
        .order('created_at', { ascending: false });

      if (prodErr) {
        return NextResponse.json({ error: prodErr.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        count: sellerProducts?.length ?? 0,
        products: sellerProducts ?? [],
      });
    }

    // 2. Public marketplace catalog browse
    const q = searchParams.get('q')?.trim() ?? '';
    const categoryId = searchParams.get('category_id') || searchParams.get('category');
    const shopId = searchParams.get('shop_id');
    const condition = searchParams.get('condition');
    const location = searchParams.get('location');
    const sort = searchParams.get('sort') ?? 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 50);

    let query = supabase
      .from('products')
      .select('*, shops(id, name, slug, is_verified, location)')
      .eq('status', 'active');

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (categoryId && categoryId !== 'all') {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      if (isUUID) {
        query = query.eq('category_id', categoryId);
      } else {
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoryId.toLowerCase()).maybeSingle();
        if (cat) {
          query = query.eq('category_id', cat.id);
        }
      }
    }

    if (shopId) {
      query = query.eq('shop_id', shopId);
    }

    if (condition && condition !== 'all') {
      query = query.ilike('condition', `%${condition}%`);
    }

    if (location && location !== 'all') {
      query = query.ilike('location', `%${location}%`);
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    let matchingShops: unknown[] = [];
    if (q) {
      const { data: sData } = await supabase
        .from('shops')
        .select('id, name, slug, description, location, is_verified')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
        .limit(4);
      matchingShops = sData ?? [];
    }

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const productList = products ?? [];

    if (q) {
      try {
        await supabase.from('analytics_events').insert({
          event_name: 'search',
          event_data: { query: q },
        });

        await supabase.from('analytics_events').insert({
          event_name: 'search_results',
          event_data: { query: q, count: productList.length, matching_shops_count: matchingShops.length },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      count: productList.length,
      products: productList,
      matching_shops: matchingShops,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Authenticated Product Creation for Sellers (Verifies Shop Ownership)
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate user session
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized seller authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // 2. Server-side Zod Validation
    const validated = createProductSchema.parse(body);

    const admin = getAdminClient();

    // 3. Verify Seller Shop Ownership
    const { data: shop, error: shopErr } = await admin
      .from('shops')
      .select('owner_id')
      .eq('id', validated.shop_id)
      .single();

    if (shopErr || !shop) {
      return NextResponse.json({ error: 'Target shop does not exist' }, { status: 404 });
    }

    if (shop.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this shop' }, { status: 403 });
    }

    // 4. Insert Product (with graceful fallback if stock_quantity column is pending schema reload)
    const basePayload: Record<string, unknown> = {
      shop_id: validated.shop_id,
      name: validated.name,
      description: validated.description,
      price: validated.price,
      category_id: validated.category_id,
      condition: validated.condition ?? 'Used',
      location: validated.location ?? 'Enugu',
      images: validated.images ?? [],
      status: 'active',
    };

    let insertResult = await admin
      .from('products')
      .insert({
        ...basePayload,
        stock_quantity: typeof body.stock_quantity === 'number' && body.stock_quantity >= 0 ? body.stock_quantity : 1,
      })
      .select()
      .single();

    if (insertResult.error && insertResult.error.message.includes('stock_quantity')) {
      insertResult = await admin
        .from('products')
        .insert(basePayload)
        .select()
        .single();
    }

    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 400 });
    }

    const product = insertResult.data;

    // Log telemetry events
    try {
      await admin.from('analytics_events').insert({
        event_name: 'product_created',
        event_data: { product_id: product.id, shop_id: product.shop_id },
        user_id: user.id,
      });

      await admin.from('analytics_events').insert({
        event_name: 'product_published',
        event_data: { product_id: product.id, shop_id: product.shop_id },
        user_id: user.id,
      });
    } catch {}

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Validation Error', details: (err as { errors: unknown }).errors }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
