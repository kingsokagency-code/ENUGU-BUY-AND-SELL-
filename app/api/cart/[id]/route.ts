import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';
import { updateCartItemSchema } from '@/lib/validations/commerce';

/**
 * PATCH /api/cart/[id]
 * Update quantity of a specific cart item
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
    const validated = updateCartItemSchema.parse(body);

    const admin = getAdminClient();

    // Verify ownership
    const { data: existing, error: findErr } = await admin
      .from('cart_items')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this cart item' }, { status: 403 });
    }

    const { data: updated, error: updateErr } = await admin
      .from('cart_items')
      .update({
        quantity: validated.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, item: updated });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Invalid quantity', details: (err as { errors: unknown }).errors }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/cart/[id]
 * Remove an item from the authenticated buyer's cart
 */
export async function DELETE(
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

    // Verify ownership
    const { data: existing, error: findErr } = await admin
      .from('cart_items')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this cart item' }, { status: 403 });
    }

    const { error: deleteErr } = await admin
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
