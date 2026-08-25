'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/marketplace/EmptyState';
import {
  ArrowLeft,
  Clock,
  Package,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ProductContext {
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

interface LastMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ConversationItem {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  product: ProductContext;
  last_message: LastMessage | null;
  is_buyer: boolean;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchInbox() {
      try {
        const res = await fetch('/api/conversations');
        if (res.status === 401) {
          if (isMounted) {
            setAuthError(true);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (isMounted && data.success) {
          setConversations(data.conversations ?? []);
        }
      } catch {
        console.warn('[INBOX] Failed to fetch conversations');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInbox();

    // 5-second lightweight polling
    const interval = setInterval(fetchInbox, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-[#111111]">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-200 animate-shimmer rounded-md" />
          <div className="h-6 w-20 bg-slate-200 animate-shimmer rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 flex gap-4 animate-shimmer"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5 text-[#111111]">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-[#087443]" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-[#111111]">Sign In to View Messages</h1>
          <p className="text-xs text-[#667085]">
            Sign in to access your buyer conversations and merchant inquiries.
          </p>
        </div>
        <Link
          href="/auth?redirect=/conversations"
          className="inline-flex items-center justify-center bg-[#087443] hover:bg-[#065f37] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-all w-full"
        >
          Sign In to Your Account &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="text-[#111111] px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-semibold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#087443]/15">
            Student Inbox ({conversations.length})
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">
            Messages &amp; Inquiries
          </h1>
          <p className="text-xs text-[#667085]">
            Direct product-anchored chat threads with campus sellers and student buyers.
          </p>
        </div>

        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const product = conv.product;
              const isSold = product?.status === 'sold';

              return (
                <Link
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="bg-white border border-slate-200/90 hover:border-[#087443]/40 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4 group block"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Product Thumbnail / Fallback */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E8F5EF] to-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                      {product?.images && product.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-[#087443]/70" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#087443] bg-[#E8F5EF] px-2 py-0.5 rounded-md border border-[#087443]/15 shrink-0">
                          {conv.is_buyer ? 'Seller:' : 'Buyer:'}{' '}
                          {conv.is_buyer
                            ? product?.shops?.name || 'Store Merchant'
                            : 'Campus Buyer'}
                        </span>
                        {isSold && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            SOLD
                          </span>
                        )}
                        <span className="text-[11px] text-[#667085] flex items-center gap-1 ml-auto shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(conv.updated_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      </div>

                      <h2 className="text-sm font-bold text-[#111111] group-hover:text-[#087443] transition-colors truncate">
                        {product?.name || 'Campus Listing'}
                      </h2>

                      <p className="text-xs text-[#667085] line-clamp-1">
                        {conv.last_message ? (
                          <span>{conv.last_message.content}</span>
                        ) : (
                          <span className="italic text-slate-400">
                            Conversation established. Tap to send message.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-[#087443] tracking-tight">
                      ₦{Number(product?.price || 0).toLocaleString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#087443] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            type="conversations"
            title="Your inbox is empty"
            description="When you message a merchant about a listing or receive an inquiry on your items, your active chats will appear here."
            actionText="Explore Campus Catalog"
            actionHref="/browse"
          />
        )}
      </div>
    </div>
  );
}
