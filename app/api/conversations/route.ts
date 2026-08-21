import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/conversations
 * List all conversations where authenticated user is buyer or seller
 */
export async function GET() {
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        buyer_id,
        seller_id,
        product_id,
        created_at,
        updated_at,
        products (
          id,
          name,
          price,
          condition,
          location,
          images,
          status,
          shops (
            id,
            name,
            slug,
            is_verified
          )
        ),
        messages (
          id,
          content,
          sender_id,
          created_at
        )
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Format conversations with latest message
    const formatted = (conversations ?? []).map((conv) => {
      const msgs = Array.isArray(conv.messages) ? conv.messages : [];
      // Sort messages by created_at descending to get the latest
      const sortedMsgs = [...msgs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastMessage = sortedMsgs[0] || null;

      return {
        id: conv.id,
        buyer_id: conv.buyer_id,
        seller_id: conv.seller_id,
        product_id: conv.product_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        product: conv.products,
        last_message: lastMessage,
        is_buyer: conv.buyer_id === user.id,
      };
    });

    return NextResponse.json({ success: true, conversations: formatted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 * Initiates or retrieves a Product-Context Conversation
 * Preserves buyer_id + seller_id + product_id relationship & trigger constraints
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate buyer session
    const { data: { user: buyer }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !buyer) {
      return NextResponse.json({ error: 'Authentication required to message seller' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id || typeof product_id !== 'string') {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    // 2. Fetch product and seller_id (shop.owner_id)
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, name, shop_id, shops!inner(owner_id, name)')
      .eq('id', product_id)
      .single();

    if (prodErr || !product) {
      return NextResponse.json({ error: 'Target product not found' }, { status: 404 });
    }

    const shopData = product.shops as unknown as { owner_id: string; name: string };
    const seller_id = shopData?.owner_id;

    if (!seller_id) {
      return NextResponse.json({ error: 'Product owner not found' }, { status: 404 });
    }

    if (buyer.id === seller_id) {
      return NextResponse.json({ error: 'You cannot initiate a conversation with your own shop' }, { status: 400 });
    }

    // 3. Check for existing conversation or insert new
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('buyer_id', buyer.id)
      .eq('seller_id', seller_id)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, conversation: existing, isExisting: true });
    }

    // 4. Insert new conversation (Triggers verify_conversation_seller execution)
    const { data: conversation, error: dbErr } = await supabase
      .from('conversations')
      .insert({
        buyer_id: buyer.id,
        seller_id: seller_id,
        product_id: product_id,
      })
      .select()
      .single();

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 400 });
    }

    // Log telemetry event
    try {
      await supabase.from('analytics_events').insert({
        event_name: 'conversation_started',
        event_data: { product_id, seller_id, buyer_id: buyer.id },
        user_id: buyer.id,
      });
    } catch {}

    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

