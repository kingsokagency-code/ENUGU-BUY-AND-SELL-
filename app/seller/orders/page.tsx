'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { MobileSellerNav } from '@/components/seller/MobileBottomNav';
import {
  ShoppingBag, CheckCircle2, Clock, MapPin,
  Phone, ArrowLeft, AlertCircle, ChevronDown, Package,
} from 'lucide-react';
import { getCurrentUser, checkUserSellerStatus, type SellerStatus } from '@/lib/auth';
import { getOrders, updateOrderStatus } from '@/lib/commerce-client';
import type { Order, OrderStatus } from '@/lib/types/commerce';

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready_for_pickup', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function SellerOrdersPage() {
  const router = useRouter();
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSellerOrders = useCallback(async () => {
    setLoading(true);
    const { user } = await getCurrentUser();
    if (!user) {
      router.push('/auth?redirect=/seller/orders');
      return;
    }

    const status = await checkUserSellerStatus(user.id);
    if (!status.isSeller || status.shops.length === 0) {
      router.push('/create-shop');
      return;
    }

    setSellerStatus(status);

    const res = await getOrders('seller');
    if (res.success) {
      setOrders(res.orders);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadSellerOrders();
  }, [loadSellerOrders]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setErrorMessage(null);

    const res = await updateOrderStatus(orderId, nextStatus);
    setUpdatingOrderId(null);

    if (res.success) {
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, order_status: nextStatus } : o))
      );
    } else {
      setErrorMessage(res.error || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (selectedFilter === 'all') return true;
    return o.order_status === selectedFilter;
  });

  const primaryShop = sellerStatus?.shops?.[0];
  const storeName = primaryShop?.name || 'My Store';
  const storeSlug = primaryShop?.slug || 'store';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A14] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0A8A50] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#6B9980]">Loading store orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white flex flex-col lg:flex-row">
      <SellerSidebar storeName={storeName} storeSlug={storeSlug} />

      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {/* Top Header */}
        <header className="bg-[#111D17] border-b border-[#243320] px-4 sm:px-8 py-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">Store Orders &amp; Fulfillment</h1>
              <p className="text-[11px] text-[#6B9980]">{orders.length} total orders across your storefront</p>
            </div>

            <Link
              href="/seller/dashboard"
              className="text-xs font-bold text-[#6B9980] hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {STATUS_FILTERS.map((tab) => {
              const count = tab.key === 'all'
                ? orders.length
                : orders.filter(o => o.order_status === tab.key).length;

              const isActive = selectedFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedFilter(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0A8A50] text-white shadow-sm'
                      : 'bg-[#1A2820] text-[#9CB3AA] hover:bg-[#243320] border border-[#243320]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20' : 'bg-black/30'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-[#1A2820] border border-[#243320] rounded-3xl p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-[#6B9980]/40 mx-auto" />
              <h2 className="text-sm font-bold text-white">No Orders in this Status</h2>
              <p className="text-xs text-[#6B9980] max-w-sm mx-auto">
                Orders received from campus buyers will appear here with instant status update controls.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => {
                const isUpdating = updatingOrderId === ord.id;
                const buyerName = ord.buyer?.full_name || 'Campus Student';
                const itemsCount = ord.items?.length || 0;

                return (
                  <div
                    key={ord.id}
                    className={`bg-[#1A2820] border border-[#243320] rounded-2xl p-5 space-y-4 transition-all ${
                      isUpdating ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {/* Header Row: Order Number, Customer, Amount, Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#243320]">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm font-black text-white">#{ord.order_number}</h2>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            ord.order_status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ord.order_status === 'cancelled'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {ord.order_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B9980] mt-0.5">
                          Buyer: <strong className="text-white">{buyerName}</strong> • Placed {new Date(ord.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-[#6B9980]">Order Value</p>
                        <p className="text-base font-black text-[#0A8A50]">
                          ₦{Number(ord.total_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Items & Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                      {/* Products */}
                      <div className="md:col-span-7 space-y-2">
                        <p className="text-[11px] font-bold text-[#6B9980] uppercase tracking-wider">
                          Ordered Items ({itemsCount})
                        </p>
                        <div className="divide-y divide-[#243320] pr-2">
                          {(ord.items ?? []).map((item) => (
                            <div key={item.id} className="py-1.5 first:pt-0 flex items-center justify-between gap-2">
                              <span className="text-white truncate">
                                {item.product?.name || 'Product'} × <strong className="text-[#0A8A50]">{item.quantity}</strong>
                              </span>
                              <span className="text-[#9CB3AA] shrink-0">
                                ₦{Number(item.subtotal).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Contact Info */}
                      <div className="md:col-span-5 bg-[#111D17] border border-[#243320] rounded-xl p-3 space-y-2">
                        <p className="text-[11px] font-bold text-[#6B9980] uppercase tracking-wider">
                          Delivery &amp; Handover
                        </p>
                        <div className="flex items-start gap-1.5 text-white text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-[#0A8A50] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">{ord.delivery_campus}</p>
                            {ord.delivery_address && (
                              <p className="text-[#6B9980] text-[10px]">{ord.delivery_address}</p>
                            )}
                          </div>
                        </div>
                        {ord.contact_phone && (
                          <div className="flex items-center gap-1.5 text-[#9CB3AA] text-[11px] pt-1 border-t border-[#243320]">
                            <Phone className="w-3.5 h-3.5 text-[#0A8A50] shrink-0" />
                            <span>Contact: <strong className="text-white">{ord.contact_phone}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Workflow Action Stepper for Seller */}
                    <div className="pt-3 border-t border-[#243320] flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-[11px] text-[#6B9980]">
                        Update status:
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        {ord.order_status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-xl bg-[#0A8A50] hover:bg-[#087443] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Accept &amp; Confirm Order ✓
                          </button>
                        )}

                        {ord.order_status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'processing')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Start Processing Order
                          </button>
                        )}

                        {ord.order_status === 'processing' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'ready_for_pickup')}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Mark Ready for Meetup
                          </button>
                        )}

                        {ord.order_status === 'ready_for_pickup' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'delivered')}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Mark Handed Over / Delivered
                          </button>
                        )}

                        {ord.order_status === 'delivered' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'completed')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Mark Finalized &amp; Completed ✓
                          </button>
                        )}

                        {ord.order_status !== 'completed' && ord.order_status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(ord.id, 'cancelled')}
                            className="px-2.5 py-1.5 rounded-xl bg-[#111D17] hover:bg-red-500/20 text-red-400 border border-[#243320] text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <MobileSellerNav />
    </div>
  );
}
