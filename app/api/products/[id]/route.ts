import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';

interface ProductWithShop {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  condition: string;
  location: string;
  images: string[];
  status: string;
  stock_quantity?: number;
  shops: {
    id: string;
    owner_id: string;
    name: string;
  } | null;
}

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
      .select('*, shops(*, profiles(id, full_name, avatar_url, is_verified))')
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

/**
 * PATCH /api/products/[id]
 * Authenticated Product & Inventory Mutation for Verified Shop Owner
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // 1. Authenticate user
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized: Seller sign-in required' }, { status: 401 });
    }

    const admin = getAdminClient();

    // 2. Fetch product & verify shop ownership
    const { data: rawProduct, error: fetchErr } = await admin
      .from('products')
      .select('id, shop_id, shops!inner(id, owner_id)')
      .eq('id', id)
      .single();

    if (fetchErr || !rawProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = rawProduct as unknown as ProductWithShop;
    if (!product.shops || product.shops.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own the shop for this product' }, { status: 403 });
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
    if (typeof body.price === 'number' && body.price >= 0) {
      updatePayload.price = body.price;
    }
    if (typeof body.category_id === 'string' || body.category_id === null) {
      updatePayload.category_id = body.category_id;
    }
    if (typeof body.condition === 'string') {
      updatePayload.condition = body.condition;
    }
    if (typeof body.location === 'string') {
      updatePayload.location = body.location;
    }
    if (Array.isArray(body.images)) {
      updatePayload.images = body.images;
    }
    if (typeof body.stock_quantity === 'number') {
      if (body.stock_quantity < 0) {
        return NextResponse.json({ error: 'Stock quantity cannot be negative' }, { status: 400 });
      }
      updatePayload.stock_quantity = body.stock_quantity;
      if (body.stock_quantity === 0) {
        updatePayload.status = body.status === 'archived' ? 'archived' : 'sold';
      } else if (body.stock_quantity > 0 && body.status !== 'archived') {
        updatePayload.status = 'active';
      }
    }
    if (typeof body.status === 'string') {
      const validStatuses = ['active', 'sold', 'archived'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status. Must be active, sold, or archived' }, { status: 400 });
      }
      updatePayload.status = body.status;
      if (body.status === 'sold' && typeof body.stock_quantity !== 'number') {
        updatePayload.stock_quantity = 0;
      }
    }

    let updateResult = await admin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select('*, shops(id, name, slug, is_verified, location)')
      .single();

    if (updateResult.error && updateResult.error.message.includes('stock_quantity')) {
      delete updatePayload.stock_quantity;
      updateResult = await admin
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select('*, shops(id, name, slug, is_verified, location)')
        .single();
    }

    if (updateResult.error) {
      return NextResponse.json({ error: updateResult.error.message }, { status: 400 });
    }

    const updatedProduct = updateResult.data;

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]
 * Safe archiving of a product by verified shop owner (preserves historical order_items)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // 1. Authenticate user
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized: Seller sign-in required' }, { status: 401 });
    }

    const admin = getAdminClient();

    // 2. Fetch product & verify shop ownership
    const { data: rawProduct, error: fetchErr } = await admin
      .from('products')
      .select('id, shop_id, shops!inner(id, owner_id)')
      .eq('id', id)
      .single();

    if (fetchErr || !rawProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = rawProduct as unknown as ProductWithShop;
    if (!product.shops || product.shops.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own the shop for this product' }, { status: 403 });
    }

    // 3. Safe Archiving: update status to archived
    const { error: archiveErr } = await admin
      .from('products')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (archiveErr) {
      return NextResponse.json({ error: archiveErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product archived successfully without breaking historical orders',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
