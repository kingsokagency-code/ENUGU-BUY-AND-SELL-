'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BuyerSidebar } from '@/components/buyer/BuyerSidebar';
import { MetricCard } from '@/components/ebs-ui/MetricCard';
import { OrderRow, OrderRowData } from '@/components/ebs-ui/OrderRow';
import { BottomNav } from '@/components/ebs-ui/BottomNav';
import {
  ShoppingBag, Heart, MessageCircle, CreditCard,
  Compass, Clock, Store, ChevronRight,
  Smartphone, Laptop, Shirt, Home as HomeIcon,
  BookOpen, LogOut, Menu, X, ArrowRight,
} from 'lucide-react';

const DEMO_BUYER_ORDERS: OrderRowData[] = [
  {
    id: 'ord_1',
    product: 'iPhone 13 Pro Max',
    amount: 780000,
    status: 'delivered',
    date: 'May 20, 2025',
    customer: 'Delivered',
  },
  {
    id: 'ord_2',
    product: 'Study Table',
    amount: 45000,
    status: 'processing',
    date: 'May 18, 2025',
    customer: 'Processing',
  },
];

const TOP_CATEGORIES = [
  { name: 'Phones & Tablets', icon: <Smartphone className="w-4 h-4" />, slug: 'phones-tablets', color: 'bg-blue-50 text-blue-600' },
  { name: 'Electronics',      icon: <Laptop     className="w-4 h-4" />, slug: 'electronics',    color: 'bg-purple-50 text-purple-600' },
  { name: 'Fashion',          icon: <Shirt      className="w-4 h-4" />, slug: 'fashion',        color: 'bg-pink-50 text-pink-600' },
  { name: 'Home & Living',    icon: <HomeIcon   className="w-4 h-4" />, slug: 'home-living',    color: 'bg-amber-50 text-amber-600' },
  { name: 'Books & Stationery',icon: <BookOpen  className="w-4 h-4" />, slug: 'books',          color: 'bg-green-50 text-green-600' },
];

const MOBILE_NAV_ITEMS = [
  { href: '/',          label: 'Home',       icon: <HomeIcon      className="w-5 h-5" /> },
  { href: '/browse',    label: 'Categories', icon: <Compass       className="w-5 h-5" /> },
  { href: '/create-shop', label: 'Sell',     icon: <Store         className="w-5 h-5" />, isCenter: true },
  { href: '/conversations', label: 'Messages', icon: <MessageCircle className="w-5 h-5" />, badge: 3 },
  { href: '/account',   label: 'Account',    icon: <ShoppingBag   className="w-5 h-5" /> },
];

export default function BuyerAccountPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasStore] = useState(true); // Toggle to true to demo hybrid user with verified merchant

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col md:flex-row">
      {/* Desktop Buyer Sidebar */}
      <BuyerSidebar
        userName="Kingsley Okoye"
        campus="University of Nigeria, Nsukka"
        hasStore={hasStore}
        storeName="Kingsok Gadgets"
        storeSlug="kingsok-gadgets"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-12">
        {/* Top Header Mobile / Tablet Bar */}
        <div className="bg-white border-b border-[#E5EDE9] px-4 py-3.5 flex items-center justify-between md:hidden sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#053D24] hover:bg-[#F0FBF4]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-sm text-[#053D24]">Account Hub</span>
          </div>
          <Link
            href="/conversations"
            className="relative p-2 text-[#087443] hover:bg-[#F0FBF4] rounded-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
        </div>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0D1F17] text-white p-5 border-b border-white/10 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-[#087443] flex items-center justify-center font-bold text-white">
                KO
              </div>
              <div>
                <p className="font-bold text-sm">Kingsley Okoye</p>
                <p className="text-xs text-white/50">Campus Buyer · UNN</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/account" className="p-2.5 rounded-xl bg-white/5 font-semibold text-[#0A8A50]">Account Overview</Link>
              <Link href="/conversations" className="p-2.5 rounded-xl bg-white/5">Inbox (3)</Link>
              <Link href="/account/orders" className="p-2.5 rounded-xl bg-white/5">My Orders</Link>
              <Link href="/account/saved" className="p-2.5 rounded-xl bg-white/5">Saved Items</Link>
              <Link href="/account/settings" className="p-2.5 rounded-xl bg-white/5">Settings</Link>
              <Link href="/seller/dashboard" className="p-2.5 rounded-xl bg-[#087443]/30 text-[#0A8A50] font-bold">Seller Dashboard →</Link>
            </div>
          </div>
        )}

        {/* Inner Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0D1F17] flex items-center gap-2">
                Welcome back, Kingsley Okoye <span className="text-xl">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7C74] mt-0.5">
                Campus Buyer • University of Nigeria, Nsukka
              </p>
            </div>

            {hasStore && (
              <Link
                href="/seller/dashboard"
                className="inline-flex items-center gap-2 bg-[#053D24] text-[#FBBF24] hover:bg-[#032a18] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
              >
                <Store className="w-4 h-4" />
                <span>Switch to Seller Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* 4 Metric / KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              label="Orders"
              value="12"
              subValue="View all orders"
              icon={<ShoppingBag className="w-4 h-4" />}
              isDemo={true}
            />
            <MetricCard
              label="Saved Items"
              value="8"
              subValue="View favorites"
              icon={<Heart className="w-4 h-4" />}
              isDemo={true}
            />
            <MetricCard
              label="Active Chats"
              value="3"
              subValue="Go to inbox"
              icon={<MessageCircle className="w-4 h-4" />}
              isDemo={true}
            />
            <MetricCard
              label="Total Spent"
              value="₦24,500"
              subValue="View breakdown"
              icon={<CreditCard className="w-4 h-4" />}
              isDemo={true}
            />
          </div>

          {/* Quick Access Grid */}
          <div>
            <h2 className="text-sm font-bold text-[#0D1F17] mb-3">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/browse"
                className="p-4 rounded-2xl bg-white border border-[#E5EDE9] hover:border-[#087443]/40 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0D1F17]">Browse Catalog</p>
                  <p className="text-[10px] text-[#9CB3AA]">Explore products</p>
                </div>
              </Link>

              <Link
                href="/conversations"
                className="p-4 rounded-2xl bg-white border border-[#E5EDE9] hover:border-[#087443]/40 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0D1F17]">Inbox</p>
                  <p className="text-[10px] text-[#9CB3AA]">Message sellers</p>
                </div>
              </Link>

              <Link
                href="/account/orders"
                className="p-4 rounded-2xl bg-white border border-[#E5EDE9] hover:border-[#087443]/40 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0D1F17]">Track Orders</p>
                  <p className="text-[10px] text-[#9CB3AA]">View order status</p>
                </div>
              </Link>

              {hasStore ? (
                <Link
                  href="/seller/dashboard"
                  className="p-4 rounded-2xl bg-[#087443] text-white border border-[#087443] hover:bg-[#065f35] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">My Store</p>
                    <p className="text-[10px] text-white/80">Command Center</p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/create-shop"
                  className="p-4 rounded-2xl bg-[#087443] text-white border border-[#087443] hover:bg-[#065f35] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Sell on EBS</p>
                    <p className="text-[10px] text-white/80">Start your store</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Two Columns: Recent Orders + Top Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            {/* Left: Recent Orders */}
            <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0D1F17]">Recent Orders</h3>
                <Link href="/account/orders" className="text-xs font-semibold text-[#087443] hover:underline">
                  View All
                </Link>
              </div>

              <div className="divide-y divide-[#E5EDE9]">
                {DEMO_BUYER_ORDERS.map((ord) => (
                  <div key={ord.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#087443]/10 flex items-center justify-center text-[#087443] font-black shrink-0">
                        {ord.product[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0D1F17] truncate">{ord.product}</p>
                        <p className="text-xs font-semibold text-[#087443] mt-0.5">₦{ord.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-[#9CB3AA]">{ord.status === 'delivered' ? 'Delivered' : 'Processing'} • {ord.date}</p>
                      </div>
                    </div>

                    <Link
                      href={`/account/orders`}
                      className="px-3 py-1.5 rounded-lg border border-[#E5EDE9] text-[11px] font-semibold text-[#0D1F17] hover:bg-[#F8FAF9] shrink-0"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Top Categories */}
            <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0D1F17]">Top Categories</h3>
                <Link href="/browse" className="text-xs font-semibold text-[#087443] hover:underline">
                  Explore
                </Link>
              </div>

              <div className="flex flex-col gap-2">
                {TOP_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/browse?category=${cat.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAF9] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
                        {cat.icon}
                      </div>
                      <span className="text-xs font-semibold text-[#0D1F17] group-hover:text-[#087443] transition-colors">
                        {cat.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9CB3AA] group-hover:text-[#087443] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <BottomNav items={MOBILE_NAV_ITEMS} activePath="/account" />
    </div>
  );
}
