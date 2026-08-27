'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import {
  CheckCircle2, Clock, MapPin, Store, MessageCircle,
  ArrowLeft, ShieldCheck, Lock, Package, AlertCircle, Phone,
} from 'lucide-react';
import { getOrderById } from '@/lib/commerce-client';
import { initiateProductConversation } from '@/lib/messaging-client';
import type { Order, OrderStatus } from '@/lib/types/commerce';

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; desc: string }> = [
  { key: 'pending', label: 'Order Placed', desc: 'Awaiting store confirmation' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Store accepted your order' },
  { key: 'processing', label: 'Processing', desc: 'Preparing item for handover' },
  { key: 'ready_for_pickup', label: 'Ready for Handover', desc: 'Ready for campus meetup' },
  { key: 'delivered', label: 'Delivered', desc: 'Item handed over to buyer' },
  { key: 'completed', label: 'Completed', desc: 'Order verified & finalized' },
];

import { getCurrentUser } from '@/lib/auth';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleChatStore = async () => {
    const firstProductId = (order?.items?.[0] as unknown as { product_id?: string; product?: { id?: string } })?.product_id || (order?.items?.[0] as unknown as { product?: { id?: string } })?.product?.id;
    if (firstProductId) {
      const res = await initiateProductConversation(firstProductId);
      if (res.success && res.conversation?.id) {
        router.push(`/conversations/${res.conversation.id}`);
        return;
      }
    }
    router.push('/conversations');
  };

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError(null);
      const { user } = await getCurrentUser();
      if (!user) {
        router.push(`/auth?redirect=${encodeURIComponent(`/orders/${id}`)}`);
        return;
      }

      const res = await getOrderById(id);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError(res.error || 'Could not find order details');
      }
      setLoading(false);
    }
    loadOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#087443] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading order details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Order Not Found</h1>
          <p className="text-xs text-slate-500">{error || 'This order does not exist or you do not have permission to view it.'}</p>
          <div className="pt-4">
            <Link
              href="/account"
              className="bg-[#087443] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#065f35] transition-all"
            >
              Back to My Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Compute status step index
  const currentStatus = order.order_status;
  const isCancelled = currentStatus === 'cancelled';
  let activeStepIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
  if (activeStepIndex === -1) activeStepIndex = 0;

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Navigation & Success Header */}
        <div className="flex items-center justify-between">
          <Link href="/account" className="inline-flex items-center gap-1 text-xs font-bold text-[#087443] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Account &amp; Orders</span>
          </Link>
          <span className="text-xs font-bold text-[#087443] bg-[#E8F8EF] px-3 py-1 rounded-full border border-[#087443]/15">
            Order Confirmed
          </span>
        </div>

        {/* Order Banner */}
        <div className="bg-white rounded-3xl border border-[#E5EDE9] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EDE9]">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#0D1F17]">
                  Order #{order.order_number}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  order.order_status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.order_status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.order_status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">Total Paid / Due</p>
              <p className="text-xl font-black text-[#087443]">
                ₦{Number(order.total_amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status Timeline */}
          {!isCancelled ? (
            <div className="py-3">
              <p className="text-xs font-bold text-slate-900 mb-4">Order Progress</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                        isCurrent
                          ? 'bg-[#087443] text-white ring-4 ring-[#E8F8EF]'
                          : isDone
                          ? 'bg-[#087443] text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <p className={`text-[10px] font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-2xl text-red-700 text-xs">
              This order was cancelled. Any locked escrow funds are refunded to the buyer.
            </div>
          )}
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Ordered Line Items */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-[#E5EDE9] p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              Purchased Products ({(order.items ?? []).length})
            </h2>

            <div className="divide-y divide-slate-100 space-y-2">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image src={item.product.images[0]} alt={item.product?.name || ''} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.product?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        ₦{Number(item.unit_price).toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="font-black text-slate-900 shrink-0">
                    ₦{Number(item.subtotal).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Total Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">₦{Number(order.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow Safe Fee (1%)</span>
                <span className="font-bold text-slate-900">₦{Number(order.escrow_fee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-[#087443]">₦{(Number(order.total_amount) + Number(order.escrow_fee || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Store Info */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Store Information */}
            <div className="bg-white rounded-3xl border border-[#E5EDE9] p-5 space-y-3 shadow-xs">
              <h2 className="text-xs font-bold text-slate-900">Storefront Seller</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#087443]" />
                    <span>{order.shop?.name || 'Verified Merchant'}</span>
                    {order.shop?.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-[#087443]" />}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{order.shop?.location || 'Enugu'}</p>
                </div>

                <button
                  onClick={handleChatStore}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#087443] bg-[#E8F8EF] px-3 py-1.5 rounded-xl hover:bg-[#d5f3e2] transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat Store</span>
                </button>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-3xl border border-[#E5EDE9] p-5 space-y-3 shadow-xs text-xs">
              <h2 className="text-xs font-bold text-slate-900">Delivery &amp; Handover</h2>
              
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-[#087443] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{order.delivery_campus}</p>
                  {order.delivery_address && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{order.delivery_address}</p>
                  )}
                </div>
              </div>

              {order.contact_phone && (
                <div className="flex items-center gap-2 text-slate-600 pt-2 border-t border-slate-50">
                  <Phone className="w-3.5 h-3.5 text-[#087443] shrink-0" />
                  <span>Contact: <strong>{order.contact_phone}</strong></span>
                </div>
              )}

              {order.buyer_notes && (
                <div className="pt-2 border-t border-slate-50 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Buyer Notes: </span>
                  <span>{order.buyer_notes}</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
