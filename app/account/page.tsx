'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import {
  ShoppingBag, Heart, MessageCircle, Clock,
  Store, ChevronRight, Package, ShieldCheck,
  CheckCircle2, ArrowRight, AlertCircle, LogOut,
} from 'lucide-react';
import { getCurrentUser, getUserProfile, signOut, checkUserSellerStatus, type UserProfile, type SellerStatus } from '@/lib/auth';
import { getOrders } from '@/lib/commerce-client';
import type { Order } from '@/lib/types/commerce';

export default function BuyerAccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadAccountData() {
      setLoading(true);
      const { user } = await getCurrentUser();
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Load Profile
      const { profile: userProfile } = await getUserProfile(user.id);
      setProfile(userProfile);

      // Load Seller Status
      const status = await checkUserSellerStatus(user.id);
      setSellerStatus(status);

      // Load Real Buyer Orders
      const orderRes = await getOrders('buyer');
      if (orderRes.success) {
        setOrders(orderRes.orders);
      }

      setLoading(false);
    }

    loadAccountData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // 1. Unauthenticated View
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E8F8EF] text-[#087443] flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#0D1F17]">My Account &amp; Orders</h1>
          <p className="text-xs text-slate-500">Sign in to track your campus purchases, saved storefronts, and manage your profile.</p>
          <div className="pt-2">
            <Link
              href="/auth?redirect=/account"
              className="bg-[#087443] hover:bg-[#065f35] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all inline-block shadow-sm"
            >
              Sign In to Your Account
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-4">
          <div className="h-28 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        </main>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const activeOrdersCount = orders.filter(o => !['completed', 'cancelled'].includes(o.order_status)).length;

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-[#E5EDE9] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-[#087443] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
              {(profile?.full_name || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-[#0D1F17] truncate">
                  {profile?.full_name || 'Campus Buyer'}
                </h1>
                {profile?.is_verified && <ShieldCheck className="w-4 h-4 text-[#087443] shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{profile?.location || 'Enugu, Nigeria'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {sellerStatus?.isSeller ? (
              <Link
                href="/seller/dashboard"
                className="bg-[#053D24] hover:bg-[#032817] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Seller Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/create-shop"
                className="bg-[#E8F8EF] hover:bg-[#d5f3e2] text-[#087443] text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-[#087443]/20 flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Open a Store</span>
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="text-slate-500 hover:text-red-600 text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Real Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-[#E5EDE9] p-4 text-center shadow-2xs">
            <p className="text-[11px] text-slate-500 font-bold">Total Orders</p>
            <p className="text-base sm:text-xl font-black text-[#0D1F17] mt-1">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5EDE9] p-4 text-center shadow-2xs">
            <p className="text-[11px] text-slate-500 font-bold">Active Orders</p>
            <p className="text-base sm:text-xl font-black text-[#087443] mt-1">{activeOrdersCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5EDE9] p-4 text-center shadow-2xs">
            <p className="text-[11px] text-slate-500 font-bold">Total Spent</p>
            <p className="text-base sm:text-xl font-black text-[#0D1F17] mt-1">₦{totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Real Orders History */}
        <div className="bg-white rounded-3xl border border-[#E5EDE9] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EDE9]">
            <h2 className="text-sm font-bold text-[#0D1F17]">Order History &amp; Tracking</h2>
            <span className="text-xs text-slate-400">{orders.length} orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No Orders Placed Yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                When you buy from verified campus merchants, your purchases will appear here with live progress tracking.
              </p>
              <div className="pt-2">
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#087443] hover:underline"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((ord) => {
                const firstItem = ord.items?.[0];
                const itemsCount = ord.items?.length || 1;
                const isFinished = ['completed', 'delivered'].includes(ord.order_status);
                const isCancelled = ord.order_status === 'cancelled';

                return (
                  <Link
                    key={ord.id}
                    href={`/orders/${ord.id}`}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 -mx-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] text-[#087443] flex items-center justify-center font-bold text-xs shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#087443] transition-colors truncate">
                            #{ord.order_number}
                          </p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isFinished
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.order_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {ord.shop?.name || 'Verified Store'} • {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          {firstItem?.product?.name ? ` (${firstItem.product.name})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          ₦{Number(ord.total_amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(ord.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
