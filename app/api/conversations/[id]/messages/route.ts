import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/conversations/[id]/messages
 * Retrieve chronological message history for an authorized conversation participant
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user is buyer or seller in this conversation
    const { data: conversation, error: convErr } = await supabase
      .from('conversations')
      .select(`
        id,
        buyer_id,
        seller_id,
        product_id,
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
        )
      `)
      .eq('id', conversationId)
      .single();

    if (convErr || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this conversation' }, { status: 403 });
    }

    // Fetch messages in chronological order
    const { data: messages, error: msgErr } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        image_url,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      conversation,
      messages: messages ?? [],
      current_user_id: user.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a new message inside an active conversation thread
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    // Verify user is buyer or seller
    const { data: conversation, error: convErr } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id, product_id')
      .eq('id', conversationId)
      .single();

    if (convErr || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to post to this conversation' }, { status: 403 });
    }

    // Insert message
    const { data: message, error: insertErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Log telemetry event
    try {
      await supabase.from('analytics_events').insert({
        event_name: 'message_sent',
        event_data: {
          conversation_id: conversationId,
          product_id: conversation.product_id,
          recipient_id: user.id === conversation.buyer_id ? conversation.seller_id : conversation.buyer_id,
        },
        user_id: user.id,
      });
    } catch {}

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
