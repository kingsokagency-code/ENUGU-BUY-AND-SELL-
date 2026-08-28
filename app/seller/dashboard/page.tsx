'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { SellerKPIGrid } from '@/components/seller/SellerKPIGrid';
import { RecentOrdersTable } from '@/components/seller/RecentOrdersTable';
import { MobileSellerNav } from '@/components/seller/MobileBottomNav';
import {
  ShieldCheck, ExternalLink, Plus, Package,
  TrendingUp, Users, ShoppingBag, Store,
} from 'lucide-react';
import { getCurrentUser, checkUserSellerStatus, type SellerStatus } from '@/lib/auth';
import { getOrders } from '@/lib/commerce-client';
import type { Order } from '@/lib/types/commerce';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const { user } = await getCurrentUser();
      if (!user) {
        router.push('/auth?redirect=/seller/dashboard');
        return;
      }

      const status = await checkUserSellerStatus(user.id);
      if (!status.isSeller || status.shops.length === 0) {
        router.push('/create-shop');
        return;
      }

      setSellerStatus(status);

      // Fetch Real Seller Orders
      const res = await getOrders('seller');
      if (res.success) {
        setOrders(res.orders);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A14] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0A8A50] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#6B9980]">Loading Seller Operating System...</p>
        </div>
      </div>
    );
  }

  const primaryShop = sellerStatus?.shops?.[0];
  const storeName = primaryShop?.name || 'My Campus Store';
  const storeSlug = primaryShop?.slug || 'store';
  const isVerified = primaryShop?.is_verified ?? false;

  const totalSales = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const totalOrders = orders.length;
  // Unique customers count derived from orders
  const uniqueCustomerIds = new Set(orders.map(o => o.buyer_id));
  const newCustomers = uniqueCustomerIds.size;

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white flex flex-col lg:flex-row">
      {/* Desktop Seller Sidebar */}
      <SellerSidebar
        storeName={storeName}
        storeSlug={storeSlug}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {/* Top Bar */}
        <header className="bg-[#111D17] border-b border-[#243320] px-4 sm:px-8 py-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            {/* Store Greeting & Verification */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#087443] flex items-center justify-center font-black text-sm shrink-0 border border-[#0A8A50]/40">
                {storeName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-sm sm:text-base font-bold text-white truncate">{storeName}</h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 bg-[#087443] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Merchant
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B9980]">{primaryShop?.location || 'UNN Main Campus'}</p>
              </div>
            </div>

            {/* Actions: Store Preview + New Product */}
            <div className="flex items-center gap-2.5">
              <Link
                href={`/shops/${storeSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-xs font-semibold text-[#9CB3AA] hover:text-white border border-[#243320] transition-colors"
              >
                <span>Store Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/create-product"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0A8A50] hover:bg-[#087443] text-xs font-bold text-white transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Real KPI Metrics */}
          <SellerKPIGrid
            totalSales={totalSales}
            totalOrders={totalOrders}
            newCustomers={newCustomers}
            rating={4.9}
            isDemo={false}
          />

          {/* 2-Column Section: Recent Orders & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Orders List */}
            <div className="lg:col-span-8">
              <RecentOrdersTable orders={orders} />
            </div>

            {/* Store Health & Actions Card */}
            <div className="lg:col-span-4 bg-[#1A2820] border border-[#243320] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white pb-3 border-b border-[#243320]">
                Quick Store Actions
              </h3>

              <div className="space-y-2">
                <Link
                  href="/seller/orders"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#111D17] hover:bg-[#243320] border border-[#243320] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-white">
                    <ShoppingBag className="w-4 h-4 text-[#0A8A50]" />
                    <span>Manage Orders ({orders.filter(o => o.order_status === 'pending').length} pending)</span>
                  </div>
                  <span className="text-[#0A8A50] text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>

                <Link
                  href="/seller/inventory"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#111D17] hover:bg-[#243320] border border-[#243320] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-white">
                    <Package className="w-4 h-4 text-[#0A8A50]" />
                    <span>Manage Stock &amp; Inventory</span>
                  </div>
                  <span className="text-[#0A8A50] text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>

                <Link
                  href="/seller/customers"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#111D17] hover:bg-[#243320] border border-[#243320] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-white">
                    <Users className="w-4 h-4 text-[#0A8A50]" />
                    <span>Customers CRM ({newCustomers} buyers)</span>
                  </div>
                  <span className="text-[#0A8A50] text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>

                <Link
                  href="/conversations"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#111D17] hover:bg-[#243320] border border-[#243320] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-white">
                    <Store className="w-4 h-4 text-[#0A8A50]" />
                    <span>Buyer Messages &amp; Inquiries</span>
                  </div>
                  <span className="text-[#0A8A50] text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileSellerNav />
    </div>
  );
}
