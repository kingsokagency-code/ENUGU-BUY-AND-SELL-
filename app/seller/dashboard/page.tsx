'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { SellerKPIGrid } from '@/components/seller/SellerKPIGrid';
import { SalesChart } from '@/components/seller/SalesChart';
import { RecentOrdersTable } from '@/components/seller/RecentOrdersTable';
import { MobileSellerNav } from '@/components/seller/MobileBottomNav';
import {
  ShieldCheck, ExternalLink, ChevronDown, Package,
  AlertTriangle, Eye, Wallet, Crown, ArrowUpRight,
  TrendingUp, BarChart3, Users, ShoppingBag, Megaphone,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const [timeRange, setTimeRange] = useState('Last 7 days');

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white flex flex-col lg:flex-row">
      {/* Desktop Seller Sidebar */}
      <SellerSidebar
        storeName="Kingsok Gadgets"
        storeSlug="kingsok-gadgets"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {/* Top Bar for Desktop & Mobile */}
        <header className="bg-[#111D17] border-b border-[#243320] px-4 sm:px-8 py-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            {/* Store Greeting & Verification */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#087443] flex items-center justify-center font-black text-sm shrink-0 border border-[#0A8A50]/40">
                KG
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-sm sm:text-base font-bold text-white truncate">Kingsok Gadgets</h1>
                  <span className="inline-flex items-center gap-1 bg-[#087443] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Merchant
                  </span>
                </div>
                <p className="text-[11px] text-[#6B9980]">Campus Storefront · UNN Main Campus</p>
              </div>
            </div>

            {/* Actions: Store Preview + Date Range Filter */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/shops/kingsok-gadgets"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-xs font-semibold text-[#9CB3AA] hover:text-white border border-[#243320] transition-colors"
              >
                <span>Store Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A2820] text-xs font-semibold text-white border border-[#243320] hover:bg-[#243320] transition-colors cursor-pointer"
              >
                <span>{timeRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B9980]" />
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#087443] hover:bg-[#0A8A50] text-xs font-bold text-white transition-colors"
              >
                <span>Shop Mode</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Quick KPI Row (Image 2 - Mobile Reference) */}
        <div className="lg:hidden px-4 pt-4">
          <div className="grid grid-cols-3 gap-2 bg-[#1A2820] border border-[#243320] rounded-2xl p-3 text-center">
            <div>
              <p className="text-[10px] text-[#6B9980]">Total Sales</p>
              <p className="text-xs sm:text-sm font-black text-white mt-0.5">₦1.25M</p>
              <span className="text-[9px] text-emerald-400 font-bold">↑ 23.5%</span>
            </div>
            <div className="border-x border-[#243320]">
              <p className="text-[10px] text-[#6B9980]">Orders</p>
              <p className="text-xs sm:text-sm font-black text-white mt-0.5">56</p>
              <span className="text-[9px] text-emerald-400 font-bold">↑ 18.2%</span>
            </div>
            <div>
              <p className="text-[10px] text-[#6B9980]">Rating</p>
              <p className="text-xs sm:text-sm font-black text-white mt-0.5">4.8</p>
              <span className="text-[9px] text-amber-400 font-bold">★ Verified</span>
            </div>
          </div>
        </div>

        {/* Inner Content Grid */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full">
          {/* Desktop 4 KPI Cards */}
          <div className="hidden lg:block">
            <SellerKPIGrid />
          </div>

          {/* Charts & Recent Orders Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
            <SalesChart />
            <RecentOrdersTable />
          </div>

          {/* Mobile 3x2 Action Grid (Image 2 - Mobile Reference) */}
          <div className="lg:hidden">
            <h3 className="text-xs font-bold text-[#6B9980] uppercase tracking-wider mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-3 gap-2.5">
              <Link href="/seller/products" className="p-3 rounded-xl bg-[#1A2820] border border-[#243320] flex flex-col items-center text-center gap-1.5 hover:bg-[#243320]">
                <Package className="w-5 h-5 text-[#0A8A50]" />
                <span className="text-[11px] font-semibold text-white">Products</span>
              </Link>
              <Link href="/seller/orders" className="p-3 rounded-xl bg-[#1A2820] border border-[#243320] flex flex-col items-center text-center gap-1.5 hover:bg-[#243320]">
                <ShoppingBag className="w-5 h-5 text-[#0A8A50]" />
                <span className="text-[11px] font-semibold text-white">Orders</span>
              </Link>
              <Link href="/seller/customers" className="p-3 rounded-xl bg-[#1A2820] border border-[#243320] flex flex-col items-center text-center gap-1.5 hover:bg-[#243320]">
                <Users className="w-5 h-5 text-[#0A8A50]" />
                <span className="text-[11px] font-semibold text-white">Customers</span>
              </Link>
              <Link href="/seller/analytics" className="p-3 rounded-xl bg-[#1A2820] border border-[#243320] flex flex-col items-center text-center gap-1.5 hover:bg-[#243320]">
                <BarChart3 className="w-5 h-5 text-[#0A8A50]" />
                <span className="text-[11px] font-semibold text-white">Analytics</span>
              </Link>
              <Link href="/seller/payouts" className="p-3 rounded-xl bg-[#1A2820] border border-[#243320] flex flex-col items-center text-center gap-1.5 hover:bg-[#243320]">
                <Wallet className="w-5 h-5 text-[#0A8A50]" />
                <span className="text-[11px] font-semibold text-white">Payouts</span>
              </Link>
              <Link href="/seller/marketing" className="p-3 rounded-xl bg-[#1A2820] border border-[#243320] flex flex-col items-center text-center gap-1.5 hover:bg-[#243320]">
                <Megaphone className="w-5 h-5 text-[#0A8A50]" />
                <span className="text-[11px] font-semibold text-white">Marketing</span>
              </Link>
            </div>
          </div>

          {/* Secondary 4 Metric Cards Row (Products / Low Stock / Views / Payouts) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Active Products */}
            <div className="p-4 rounded-2xl bg-[#1A2820] border border-[#243320] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#6B9980]">Products</p>
                  <p className="text-2xl font-bold text-white mt-1">36</p>
                  <p className="text-[10px] text-[#9CB3AA] mt-0.5">Active products</p>
                </div>
                <div className="p-2 rounded-xl bg-[#243320] text-[#0A8A50]">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <Link href="/seller/products" className="text-xs font-semibold text-[#0A8A50] hover:underline mt-3 pt-3 border-t border-[#243320] flex items-center justify-between">
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Low Stock Alert */}
            <div className="p-4 rounded-2xl bg-[#1A2820] border border-[#243320] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#6B9980]">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">5</p>
                  <p className="text-[10px] text-amber-400/80 mt-0.5">Products need restock</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <Link href="/seller/products?filter=low-stock" className="text-xs font-semibold text-amber-400 hover:underline mt-3 pt-3 border-t border-[#243320] flex items-center justify-between">
                <span>View</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Store Views */}
            <div className="p-4 rounded-2xl bg-[#1A2820] border border-[#243320] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#6B9980]">Store Views</p>
                  <p className="text-2xl font-bold text-white mt-1">2,453</p>
                  <span className="inline-flex items-center text-[10px] text-emerald-400 font-semibold mt-0.5">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />+12.5% this week
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#243320] text-[#0A8A50]">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <Link href="/seller/analytics" className="text-xs font-semibold text-[#0A8A50] hover:underline mt-3 pt-3 border-t border-[#243320] flex items-center justify-between">
                <span>View analytics</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Payout Balance */}
            <div className="p-4 rounded-2xl bg-[#1A2820] border border-[#243320] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#6B9980]">Payout Balance</p>
                  <p className="text-2xl font-bold text-white mt-1">₦320,000</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Available for transfer</p>
                </div>
                <div className="p-2 rounded-xl bg-[#243320] text-[#0A8A50]">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <Link href="/seller/payouts" className="text-xs font-bold text-white hover:text-[#0A8A50] mt-3 pt-3 border-t border-[#243320] flex items-center justify-between">
                <span>Withdraw</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Purple Go Premium banner on mobile & desktop */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#7C3AED]/30 via-[#5B21B6]/30 to-[#4C1D95]/40 border border-[#7C3AED]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shrink-0">
                <Crown className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Unlock Advanced EBS Seller Tools</p>
                <p className="text-xs text-white/70 mt-0.5">Get verified badge boost, WhatsApp auto-responder, and automated invoice generation.</p>
              </div>
            </div>
            <Link
              href="/seller/subscriptions"
              className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-bold text-white transition-all shadow-md shrink-0 w-full sm:w-auto text-center"
            >
              Go Premium →
            </Link>
          </div>
        </main>
      </div>

      {/* Mobile Seller Bottom Navigation */}
      <MobileSellerNav />
    </div>
  );
}
