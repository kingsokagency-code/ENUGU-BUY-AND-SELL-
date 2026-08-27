/**
 * lib/messaging-client.ts
 * Client-side Authenticated Messaging SDK for Enugu Buy & Sell (EBS)
 * Automatically injects Supabase JWT access tokens for secure messaging requests.
 */

import { supabase } from './supabase';

async function getAuthHeader(): Promise<HeadersInit> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    try {
      const { data: refreshData } = await supabase.auth.refreshSession();
      session = refreshData.session;
    } catch {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export interface ConversationProduct {
  id: string;
  name: string;
  price: number;
  condition: string;
  location: string;
  images?: string[];
  status: string;
  shops?: {
    id: string;
    name: string;
    slug: string;
    is_verified?: boolean;
  };
}

export interface LastMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  product: ConversationProduct;
  last_message: LastMessage | null;
  is_buyer: boolean;
  partner_name?: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export interface ConversationDetailsResponse {
  success: boolean;
  error?: string;
  conversation?: {
    id: string;
    buyer_id: string;
    seller_id: string;
    product_id: string;
    products?: ConversationProduct;
    buyer?: { id: string; full_name: string };
    seller?: { id: string; full_name: string };
  };
  messages?: MessageRecord[];
  current_user_id?: string;
}

/**
 * Fetch all conversations for the authenticated user (as buyer or seller)
 */
export async function getConversations(): Promise<{ success: boolean; conversations: ConversationSummary[]; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch('/api/conversations', {
      method: 'GET',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, conversations: [], error: data.error || 'Failed to fetch conversations' };
    }
    return { success: true, conversations: data.conversations || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, conversations: [], error: msg };
  }
}

/**
 * Initiate or retrieve an existing conversation tied to a specific product
 */
export async function initiateProductConversation(productId: string): Promise<{ success: boolean; conversation?: { id: string }; isExisting?: boolean; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers,
      body: JSON.stringify({ product_id: productId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to initiate conversation' };
    }
    return { success: true, conversation: data.conversation, isExisting: data.isExisting };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Fetch messages for an active conversation thread
 */
export async function getConversationMessages(conversationId: string): Promise<ConversationDetailsResponse> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to load messages' };
    }
    return data as ConversationDetailsResponse;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Send a new message inside an active conversation thread
 */
export async function sendMessage(conversationId: string, content: string): Promise<{ success: boolean; message?: MessageRecord; error?: string }> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to send message' };
    }
    return { success: true, message: data.message };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}
