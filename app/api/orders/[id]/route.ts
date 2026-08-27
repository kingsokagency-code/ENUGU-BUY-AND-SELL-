import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';
import { updateOrderStatusSchema } from '@/lib/validations/commerce';

interface ShopOwnerRow {
  owner_id: string;
}

interface OrderDetailRow {
  id: string;
  order_number: string;
  buyer_id: string;
  shop_id: string;
  total_amount: number | string;
  escrow_fee: number | string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  delivery_address: string | null;
  delivery_campus: string;
  contact_phone: string | null;
  buyer_notes: string | null;
  created_at: string;
  updated_at: string;
  shops: ShopOwnerRow | null;
}

/**
 * GET /api/orders/[id]
 * Fetch single order details with full item breakdown and participant verification
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const admin = getAdminClient();

    const { data: rawOrder, error: orderErr } = await admin
      .from('orders')
      .select(`
        id,
        order_number,
        buyer_id,
        shop_id,
        total_amount,
        escrow_fee,
        order_status,
        payment_status,
        payment_method,
        delivery_address,
        delivery_campus,
        contact_phone,
        buyer_notes,
        created_at,
        updated_at,
        profiles:buyer_id (
          id,
          full_name,
          phone,
          avatar_url,
          location
        ),
        shops (
          id,
          name,
          slug,
          owner_id,
          is_verified,
          location
        ),
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          products (
            id,
            name,
            images,
            condition
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (orderErr || !rawOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = rawOrder as unknown as OrderDetailRow;

    // Participant verification: user must be buyer OR shop owner
    const shopOwnerId = order.shops?.owner_id;
    const isBuyer = order.buyer_id === user.id;
    const isSeller = shopOwnerId === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view this order' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: rawOrder,
      is_buyer: isBuyer,
      is_seller: isSeller,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve order';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order status (Seller only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateOrderStatusSchema.parse(body);

    const admin = getAdminClient();

    // 1. Fetch order and verify seller shop ownership
    const { data: rawOrder, error: orderErr } = await admin
      .from('orders')
      .select('id, shop_id, buyer_id, order_status, shops(owner_id)')
      .eq('id', id)
      .maybeSingle();

    if (orderErr || !rawOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = rawOrder as unknown as { id: string; shop_id: string; buyer_id: string; order_status: string; shops: ShopOwnerRow | null };
    const shopOwnerId = order.shops?.owner_id;

    if (shopOwnerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the store owner can update this order status' }, { status: 403 });
    }

    // 2. Update order status
    const { data: updated, error: updateErr } = await admin
      .from('orders')
      .update({
        order_status: validated.order_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Order status updated to ${validated.order_status}`,
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Invalid order status', details: (err as { errors: unknown }).errors }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Failed to update order status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
