'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Package,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

import { getConversationMessages, sendMessage, MessageRecord, ConversationProduct } from '@/lib/messaging-client';

interface ConversationData {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  products?: ConversationProduct;
}

export default function ActiveConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: conversationId } = use(params);

  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      try {
        const res = await getConversationMessages(conversationId);
        if (!res.success) {
          if (isMounted) setError(res.error || 'Failed to load messages');
          return;
        }

        if (isMounted && res.success) {
          setConversation(res.conversation as unknown as ConversationData);
          setMessages(res.messages ?? []);
          setCurrentUserId(res.current_user_id || null);
        }
      } catch {
        if (isMounted) setError('Failed to load message history');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMessages();

    // 4-second polling loop for live messaging
    const interval = setInterval(loadMessages, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    setSending(true);
    if (!textToSend) setInputText('');

    // Optimistic message append
    const optimisticMsg: MessageRecord = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId || '',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendMessage(conversationId, text);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? res.message! : m))
        );
      }
    } catch {
      console.warn('[CHAT] Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const promptChips = [
    'Is this item still available?',
    'Where on campus can we meet to inspect?',
    'Can we meet at UNEC Library?',
    'Is the price negotiable?',
  ];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#087443] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#667085]">Connecting to conversation thread...</p>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-lg font-bold text-[#111111]">{error || 'Conversation Not Found'}</h1>
        <p className="text-xs text-[#667085]">
          This chat may have expired or you may not be a participant.
        </p>
        <Link
          href="/conversations"
          className="inline-flex items-center gap-1.5 bg-[#087443] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inbox</span>
        </Link>
      </div>
    );
  }

  const product = conversation.products;
  const isBuyer = currentUserId === conversation.buyer_id;
  const counterpartyName = isBuyer
    ? product?.shops?.name || 'Campus Seller'
    : 'Campus Buyer';

  return (
    <div className="text-[#111111] px-4 py-4 max-w-2xl mx-auto flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)]">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
        <Link
          href="/conversations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Inbox</span>
        </Link>
        <div className="text-center">
          <h1 className="text-xs sm:text-sm font-bold text-[#111111] flex items-center gap-1 justify-center">
            <span>{counterpartyName}</span>
            {product?.shops?.is_verified && isBuyer && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#087443]" />
            )}
          </h1>
          <p className="text-[10px] text-[#667085]">Product Chat</p>
        </div>
        <span className="w-10" />
      </div>

      {/* Sticky Product Context Anchor Card */}
      {product && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 my-2 shadow-xs flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#E8F5EF] to-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-5 h-5 text-[#087443]/70" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-[#111111] truncate">{product.name}</h2>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-extrabold text-[#087443]">
                  ₦{Number(product.price).toLocaleString()}
                </span>
                <span className="text-[#667085]">• {product.condition}</span>
                <span className="text-[#667085] flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#087443]" />
                  {product.location}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/products/${product.id}`}
            className="text-[11px] font-bold text-[#087443] hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap bg-[#E8F5EF] px-2.5 py-1.5 rounded-lg border border-[#087443]/15"
          >
            <span>View Item</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Safety Notice Pill */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 text-[11px] text-amber-800 flex items-center justify-center gap-1.5 shrink-0 my-1">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>Meet in public campus areas (UNEC Library, SUB) and test item before paying.</span>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 px-1 no-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-xs text-[#667085]">
              No messages yet in this thread. Start the conversation below!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-[#087443] text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-[#111111] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                <span className="text-[9px] text-[#667085] mt-1 px-1 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar shrink-0">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="text-[10px] font-semibold text-[#087443] bg-white border border-[#087443]/25 hover:bg-[#E8F5EF] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="pt-2 border-t border-slate-200 bg-[#FAFAF8] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your message or inquiry..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white border border-slate-300 focus:border-[#087443] text-xs sm:text-sm text-[#111111] rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="bg-[#087443] hover:bg-[#065f37] disabled:opacity-40 text-white font-bold p-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
