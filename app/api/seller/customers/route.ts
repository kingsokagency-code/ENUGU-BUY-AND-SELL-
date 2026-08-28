import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';

/**
 * GET /api/seller/customers
 * Retrieves real CRM customer list for authenticated seller's shops
 */
export async function GET(request: Request) {
  try {
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Seller authentication required' }, { status: 401 });
    }

    const admin = getAdminClient();

    // 1. Fetch shops owned by seller
    const { data: userShops, error: shopErr } = await admin
      .from('shops')
      .select('id, name, slug')
      .eq('owner_id', user.id);

    if (shopErr) {
      return NextResponse.json({ error: shopErr.message }, { status: 400 });
    }

    const shopIds = (userShops ?? []).map(s => s.id);
    if (shopIds.length === 0) {
      return NextResponse.json({ success: true, count: 0, customers: [] });
    }

    // 2. Fetch customers for these shops joined with user profiles
    const { data: customers, error: custErr } = await admin
      .from('customers')
      .select(`
        id,
        shop_id,
        user_id,
        total_orders,
        total_spent,
        first_order_at,
        last_order_at,
        notes,
        created_at,
        updated_at,
        shops (
          id,
          name,
          slug
        ),
        profiles (
          id,
          full_name,
          avatar_url,
          location,
          phone,
          is_verified
        )
      `)
      .in('shop_id', shopIds)
      .order('last_order_at', { ascending: false });

    if (custErr) {
      return NextResponse.json({ error: custErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: customers?.length ?? 0,
      customers: customers ?? [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve customers';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/seller/customers
 * Update notes on a customer record by verified shop owner
 */
export async function PATCH(request: Request) {
  try {
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Seller authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { customer_id, notes } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Verify shop ownership of this customer record
    const { data: customer, error: fetchErr } = await admin
      .from('customers')
      .select('id, shop_id, shops!inner(owner_id)')
      .eq('id', customer_id)
      .single();

    if (fetchErr || !customer) {
      return NextResponse.json({ error: 'Customer record not found' }, { status: 404 });
    }

    const shopOwner = (customer as any).shops?.owner_id;
    if (shopOwner !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own the store for this customer' }, { status: 403 });
    }

    const { data: updated, error: updateErr } = await admin
      .from('customers')
      .update({
        notes: typeof notes === 'string' ? notes.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer_id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, customer: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update customer notes';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
