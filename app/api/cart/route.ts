import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';
import { addToCartSchema } from '@/lib/validations/commerce';

interface ProductWithShop {
  id: string;
  name: string;
  price: number | string;
  status: string;
  images: string[];
  condition: string;
  location: string;
  shop_id: string;
  shops: {
    id: string;
    name: string;
    slug: string;
    is_verified: boolean;
    location: string;
  } | null;
}

interface CartItemRow {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: ProductWithShop | null;
}

/**
 * GET /api/cart
 * Retrieve authenticated buyer's live cart with real product data and authoritative totals
 */
export async function GET(request: Request) {
  try {
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required to view cart' }, { status: 401 });
    }

    const admin = getAdminClient();

    const { data: rows, error: dbErr } = await admin
      .from('cart_items')
      .select(`
        id,
        user_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          name,
          price,
          status,
          images,
          condition,
          location,
          shop_id,
          shops (
            id,
            name,
            slug,
            is_verified,
            location
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 400 });
    }

    const rawItems = (rows ?? []) as unknown as CartItemRow[];

    // Format items and compute authoritative subtotals
    let totalAmount = 0;
    let totalItemsCount = 0;

    const formattedItems = rawItems.map((item) => {
      const product = item.products;
      const unitPrice = product ? Number(product.price) : 0;
      const subtotal = unitPrice * item.quantity;
      const isAvailable = product?.status === 'active';

      if (isAvailable) {
        totalAmount += subtotal;
        totalItemsCount += item.quantity;
      }

      return {
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal,
        is_available: isAvailable,
        product: product
          ? {
              id: product.id,
              name: product.name,
              price: unitPrice,
              images: product.images || [],
              condition: product.condition,
              location: product.location,
              shop: product.shops || null,
            }
          : null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: totalItemsCount,
      unique_items_count: formattedItems.length,
      total_amount: totalAmount,
      items: formattedItems,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch cart';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Add a product to the authenticated buyer's cart (or increment quantity)
 */
export async function POST(request: Request) {
  try {
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required to add items to cart' }, { status: 401 });
    }

    const body = await request.json();
    const validated = addToCartSchema.parse(body);

    const admin = getAdminClient();

    // 1. Verify product exists and is active
    const { data: product, error: prodErr } = await admin
      .from('products')
      .select('id, name, price, status, shop_id')
      .eq('id', validated.product_id)
      .maybeSingle();

    if (prodErr || !product) {
      return NextResponse.json({ error: 'Target product does not exist' }, { status: 404 });
    }

    if (product.status !== 'active') {
      return NextResponse.json({ error: 'This product is no longer active or in stock' }, { status: 400 });
    }

    // 2. Check if product is already in buyer's cart
    const { data: existingItem } = await admin
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', validated.product_id)
      .maybeSingle();

    let resultItem;

    if (existingItem) {
      // Increment quantity
      const newQty = existingItem.quantity + validated.quantity;
      const { data: updated, error: updateErr } = await admin
        .from('cart_items')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      resultItem = updated;
    } else {
      // Insert new cart item
      const { data: inserted, error: insertErr } = await admin
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: validated.product_id,
          quantity: validated.quantity,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      resultItem = inserted;
    }

    // Get total items count in cart
    const { data: allItems } = await admin
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id);

    const totalCount = (allItems ?? []).reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    return NextResponse.json({
      success: true,
      item: resultItem,
      total_items_count: totalCount,
      message: `Added ${product.name} to cart`,
    }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Invalid cart input', details: (err as { errors: unknown }).errors }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Server error adding to cart';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/cart
 * Clear all items in authenticated buyer's cart
 */
export async function DELETE(request: Request) {
  try {
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { error } = await admin.from('cart_items').delete().eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to clear cart';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
