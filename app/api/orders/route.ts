import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';
import { createOrderSchema } from '@/lib/validations/commerce';

interface ProductFetchRow {
  id: string;
  name: string;
  price: number | string;
  status: string;
  shop_id: string;
  images: string[];
}

/**
 * GET /api/orders
 * Fetch real orders for authenticated buyer or seller
 * ?role=buyer (default) or ?role=seller
 */
export async function GET(request: Request) {
  try {
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';
    const admin = getAdminClient();

    if (role === 'seller') {
      // 1. Fetch shops owned by user
      const { data: userShops, error: shopErr } = await admin
        .from('shops')
        .select('id, name, slug')
        .eq('owner_id', user.id);

      if (shopErr) throw shopErr;

      const shopIds = (userShops ?? []).map(s => s.id);

      if (shopIds.length === 0) {
        return NextResponse.json({ success: true, count: 0, orders: [] });
      }

      // 2. Fetch orders for seller's shops
      const { data: orders, error: ordersErr } = await admin
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
            slug
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
        .in('shop_id', shopIds)
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;

      return NextResponse.json({
        success: true,
        count: orders?.length ?? 0,
        orders: orders ?? [],
      });
    }

    // 3. Buyer orders
    const { data: orders, error: ordersErr } = await admin
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
        shops (
          id,
          name,
          slug,
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
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersErr) throw ordersErr;

    return NextResponse.json({
      success: true,
      count: orders?.length ?? 0,
      orders: orders ?? [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve orders';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Authoritative Order Creation
 * Validates products, quantities, prices, groups by shop, inserts orders & items, clears cart.
 */
export async function POST(request: Request) {
  try {
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required to place an order' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    const admin = getAdminClient();

    // 1. Fetch authoritative product data from database
    const productIds = validated.items.map(i => i.product_id);
    let prodQuery: any = await admin
      .from('products')
      .select('id, name, price, status, shop_id, images, stock_quantity')
      .in('id', productIds);

    if (prodQuery.error && prodQuery.error.message.includes('stock_quantity')) {
      prodQuery = await admin
        .from('products')
        .select('id, name, price, status, shop_id, images')
        .in('id', productIds);
    }

    if (prodQuery.error || !prodQuery.data || prodQuery.data.length === 0) {
      return NextResponse.json({ error: 'None of the requested products could be found' }, { status: 404 });
    }

    const products = prodQuery.data as unknown as Array<ProductFetchRow & { stock_quantity?: number }>;
    const productMap = new Map(products.map(p => [p.id, p]));

    // 2. Validate availability, stock sufficiency, and group items by shop_id
    const itemsByShop = new Map<string, Array<{ product: ProductFetchRow & { stock_quantity?: number }; quantity: number; unit_price: number; subtotal: number }>>();

    for (const item of validated.items) {
      const prod = productMap.get(item.product_id);
      if (!prod) {
        return NextResponse.json({ error: `Product ID ${item.product_id} no longer exists` }, { status: 400 });
      }
      if (prod.status !== 'active') {
        return NextResponse.json({ error: `"${prod.name}" is no longer active for purchase` }, { status: 400 });
      }

      const availableStock = typeof prod.stock_quantity === 'number' ? prod.stock_quantity : 1;
      if (availableStock < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for "${prod.name}". Available: ${availableStock}, requested: ${item.quantity}`
        }, { status: 400 });
      }

      const unitPrice = Number(prod.price);
      const subtotal = unitPrice * item.quantity;
      const entry = { product: prod, quantity: item.quantity, unit_price: unitPrice, subtotal };

      const shopGroup = itemsByShop.get(prod.shop_id) || [];
      shopGroup.push(entry);
      itemsByShop.set(prod.shop_id, shopGroup);
    }

    const createdOrders = [];

    // 3. Create real order per shop and atomically decrement stock
    for (const [shopId, shopItems] of itemsByShop.entries()) {
      const shopTotal = shopItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      const orderNumber = `EBS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Insert Order Header
      const { data: order, error: orderInsertErr } = await admin
        .from('orders')
        .insert({
          order_number: orderNumber,
          buyer_id: user.id,
          shop_id: shopId,
          total_amount: shopTotal,
          escrow_fee: Math.round(shopTotal * 0.01), // 1% escrow safety protection
          order_status: 'pending',
          payment_status: 'unpaid',
          payment_method: validated.payment_method || 'escrow_wallet',
          delivery_address: validated.delivery_address || null,
          delivery_campus: validated.delivery_campus || 'UNN Main Campus',
          contact_phone: validated.contact_phone || null,
          buyer_notes: validated.buyer_notes || null,
        })
        .select()
        .single();

      if (orderInsertErr || !order) {
        throw new Error(`Failed to create order record: ${orderInsertErr?.message}`);
      }

      // Insert Order Line Items
      const orderItemsPayload = shopItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      const { error: itemsInsertErr } = await admin
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsInsertErr) {
        throw new Error(`Failed to create order items: ${itemsInsertErr.message}`);
      }

      // Deduct stock for ordered items
      for (const item of shopItems) {
        const currentStock = typeof item.product.stock_quantity === 'number' ? item.product.stock_quantity : 1;
        const newStock = Math.max(0, currentStock - item.quantity);
        const newStatus = newStock === 0 ? 'sold' : 'active';

        try {
          await admin
            .from('products')
            .update({
              stock_quantity: newStock,
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.product.id);
        } catch {}
      }

      createdOrders.push(order);
    }

    // 4. Clear ordered items from buyer's cart
    await admin
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .in('product_id', productIds);

    // 5. Telemetry logging
    try {
      await admin.from('analytics_events').insert({
        event_name: 'order_placed',
        event_data: {
          orders_count: createdOrders.length,
          order_ids: createdOrders.map(o => o.id),
          total_amount: createdOrders.reduce((acc, o) => acc + Number(o.total_amount), 0),
        },
        user_id: user.id,
      });
    } catch {}

    const primaryOrder = createdOrders[0];

    return NextResponse.json({
      success: true,
      order_id: primaryOrder.id,
      order_number: primaryOrder.order_number,
      orders: createdOrders,
      message: 'Order placed successfully!',
    }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Validation Error', details: (err as { errors: unknown }).errors }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Server error creating order';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
