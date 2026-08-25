'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { getCurrentUser, checkUserSellerStatus, signOut, type SellerStatus } from '@/lib/auth';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  BarChart2,
  Archive,
  Tag,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  ExternalLink,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Store,
  ShieldAlert,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [authState, setAuthState] = useState<{
    loading: boolean;
    isAuthenticated: boolean;
    isSeller: boolean;
    sellerData: SellerStatus | null;
  }>({
    loading: true,
    isAuthenticated: false,
    isSeller: false,
    sellerData: null,
  });

  useEffect(() => {
    let isMounted = true;
    async function verifySeller() {
      const { user, error } = await getCurrentUser();
      if (error || !user) {
        if (isMounted) {
          setAuthState({ loading: false, isAuthenticated: false, isSeller: false, sellerData: null });
        }
        return;
      }

      const sellerStatus = await checkUserSellerStatus(user.id);
      if (isMounted) {
        setAuthState({
          loading: false,
          isAuthenticated: true,
          isSeller: sellerStatus.isSeller,
          sellerData: sellerStatus,
        });
      }
    }
    verifySeller();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  // Realistic mock data reflecting the reference screenshot
  const stats = [
    {
      label: 'Total Sales',
      value: '₦2,450,000',
      change: '+18.8%',
      period: 'from last month',
      isPositive: true,
    },
    {
      label: 'Total Orders',
      value: '128',
      change: '+12.4%',
      period: 'from last month',
      isPositive: true,
    },
    {
      label: 'Total Products',
      value: '56',
      change: '+5',
      period: 'new this month',
      isPositive: true,
    },
    {
      label: 'Store Views',
      value: '1,245',
      change: '+32.7%',
      period: 'from last month',
      isPositive: true,
    },
  ];

  const recentOrders = [
    {
      id: '#ORD-5201',
      product: 'iPhone 13 (128GB)',
      amount: '₦420,000',
      status: 'Delivered',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: '#ORD-5202',
      product: 'HP Laptop 15',
      amount: '₦310,000',
      status: 'Processing',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: '#ORD-5203',
      product: 'Nike Air Force 1',
      amount: '₦84,000',
      status: 'Delivered',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: '#ORD-5204',
      product: 'Soundcore Headset',
      amount: '₦35,000',
      status: 'Cancelled',
      statusColor: 'bg-red-50 text-red-700 border-red-200',
    },
  ];

  const topSelling = [
    { name: 'iPhone 13 (128GB)', sold: '120 sold', price: '₦420,000' },
    { name: 'HP Laptop 15', sold: '45 sold', price: '₦310,000' },
    { name: 'Nike Air Force 1', sold: '85 sold', price: '₦84,000' },
  ];

  // 1. Loading State
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#087443] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Verifying seller permissions...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (BLOCKED)
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Seller Authentication Required
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              You must be signed in to your account to view or manage your store dashboard.
            </p>
          </div>
          <div className="pt-2 space-y-2.5">
            <Link
              href="/auth?redirect=/seller/dashboard"
              className="block w-full bg-[#087443] hover:bg-[#065f37] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs"
            >
              Sign In to Continue &rarr;
            </Link>
            <Link
              href="/"
              className="block text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but owns 0 stores (NON-SELLER BLOCKED)
  if (!authState.isSeller) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
            <Store className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Create Your Storefront First
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account is verified! To unlock seller tools and manage inventory, you need to register a campus storefront first.
            </p>
          </div>
          <div className="pt-2 space-y-2.5">
            <Link
              href="/create-shop"
              className="block w-full bg-[#087443] hover:bg-[#065f37] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs"
            >
              Register Campus Storefront &rarr;
            </Link>
            <Link
              href="/"
              className="block text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryShop = authState.sellerData?.shops?.[0];

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row text-slate-900">
      
      {/* ── SIDEBAR (DEEP EMERALD #032B19) ── */}
      <aside className="w-full md:w-64 bg-[#032B19] text-white flex flex-col justify-between p-5 shrink-0 border-r border-emerald-950">
        <div className="space-y-6">
          {/* Dashboard Logo */}
          <Link href="/" className="flex items-center">
            <Logo variant="compact" theme="light" size="sm" />
          </Link>

          {/* Navigation Items */}
          <div className="space-y-4">
            {/* Overview */}
            <div>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#087443] text-white text-xs font-bold shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-[#FBBF24]" />
                <span>Overview</span>
              </Link>
            </div>

            {/* Store Group */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/60 px-3 py-1">
                Store
              </div>
              <Link
                href="/seller/products"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Package className="w-4 h-4 text-[#FBBF24]" />
                <span>Products</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span>Orders</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Star className="w-4 h-4 text-emerald-300" />
                <span>Reviews</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <BarChart2 className="w-4 h-4 text-emerald-300" />
                <span>Analytics</span>
              </Link>
            </div>

            {/* Manage Group */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/60 px-3 py-1">
                Manage
              </div>
              <Link
                href="/seller/products"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Archive className="w-4 h-4 text-[#FBBF24]" />
                <span>Inventory</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Tag className="w-4 h-4 text-emerald-300" />
                <span>Coupons</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-emerald-300" />
                <span>Store Settings</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <CreditCard className="w-4 h-4 text-emerald-300" />
                <span>Payouts</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-emerald-900/60 space-y-1">
          <Link
            href="/conversations"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help &amp; Support</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-300 hover:bg-red-500/20 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {primaryShop ? primaryShop.name : 'Store Dashboard'}
            </h1>
            <p className="text-xs text-slate-500">
              Welcome back, monitor your campus store performance in {primaryShop?.location || 'Enugu'}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {primaryShop && (
              <Link
                href={`/shops/${primaryShop.slug}`}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#087443]" />
                <span>View Store</span>
              </Link>
            )}

            <Link
              href="/create-product"
              className="inline-flex items-center gap-1.5 bg-[#087443] hover:bg-[#065f37] text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Store Profile Identity Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#087443] via-[#053D24] to-[#087443] text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-emerald-700/30 shrink-0">
              {authState.sellerData?.shops[0]?.name
                ? authState.sellerData.shops[0].name.charAt(0).toUpperCase()
                : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  {authState.sellerData?.shops[0]?.name || 'My Storefront'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#E8F5EF] text-[#087443] px-2 py-0.5 rounded-md border border-[#087443]/15">
                  <CheckCircle2 className="w-3 h-3 text-[#087443]" />
                  <span>Verified Store</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {authState.sellerData?.shops[0]?.location || 'UNEC Campus, Enugu'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
            <div className="bg-[#FAFAF8] border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Level</span>
              <span>Pro Merchant</span>
            </div>
            <div className="bg-[#FAFAF8] border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Store Status</span>
              <span className="text-[#087443]">Active Merchant</span>
            </div>
          </div>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="text-xs font-bold text-slate-500">{item.label}</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3" />
                  {item.change}
                </span>
                <span className="text-slate-400 text-[11px]">{item.period}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Row: Sales Overview Chart + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sales Overview Area Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Sales Overview</h3>
                <p className="text-xs text-slate-500">Revenue trajectory over time</p>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 rounded-xl border border-slate-200 text-xs">
                {(['today', 'week', 'month', 'year'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      timeRange === r
                        ? 'bg-[#087443] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : 'This Year'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative h-60 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" fill="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#087443" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#087443" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#F1F5F9" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#F1F5F9" strokeDasharray="4 4" />

                {/* Area fill */}
                <path
                  d="M0 140 Q 60 110, 120 70 T 240 90 T 360 40 T 500 60 L 500 180 L 0 180 Z"
                  fill="url(#chartGrad)"
                />

                {/* Smooth Curve Line */}
                <path
                  d="M0 140 Q 60 110, 120 70 T 240 90 T 360 40 T 500 60"
                  stroke="#087443"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Data Points */}
                <circle cx="120" cy="70" r="5" fill="#FFFFFF" stroke="#087443" strokeWidth="3" />
                <circle cx="240" cy="90" r="5" fill="#FFFFFF" stroke="#087443" strokeWidth="3" />
                <circle cx="360" cy="40" r="6" fill="#FBBF24" stroke="#053D24" strokeWidth="3" />
                <circle cx="500" cy="60" r="5" fill="#FFFFFF" stroke="#087443" strokeWidth="3" />
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
                <span>Aug 1</span>
                <span>Aug 6</span>
                <span>Aug 11</span>
                <span>Aug 16</span>
                <span>Aug 21</span>
                <span>Aug 26</span>
                <span>Aug 31</span>
              </div>
            </div>
          </div>

          {/* Recent Orders Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Recent Orders</h3>
                <span className="text-xs font-bold text-[#087443] hover:underline cursor-pointer">View All</span>
              </div>
              <p className="text-xs text-slate-500">Latest buyer orders</p>
            </div>

            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400">{ord.id}</span>
                      <span className="text-xs font-bold text-slate-800 truncate">{ord.product}</span>
                    </div>
                    <div className="text-xs font-black text-[#087443] mt-0.5">{ord.amount}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ord.statusColor}`}>
                    {ord.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Row: Top Selling Products + Store Performance Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Selling Products */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Top Selling Products</h3>
              <Link href="/seller/products" className="text-xs font-bold text-[#087443] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {topSelling.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#087443] font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{prod.name}</div>
                      <div className="text-[11px] text-slate-400">{prod.sold}</div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-[#087443]">{prod.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Store Performance */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Store Performance</h3>

            {/* Radial Gauge Look */}
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#087443"
                    strokeWidth="3.5"
                    strokeDasharray="98, 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900 leading-none">98%</span>
                  <span className="text-[9px] font-bold text-slate-400 mt-0.5">Rating</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#087443] mt-2">Positive Feedback</span>
            </div>

            {/* Performance Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Response Rate</span>
                <span className="font-bold text-slate-800">98%</span>
              </div>
              <div className="flex justify-between">
                <span>Orders Completed</span>
                <span className="font-bold text-slate-800">124</span>
              </div>
              <div className="flex justify-between">
                <span>On-Time Delivery</span>
                <span className="font-bold text-slate-800">99%</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Rating</span>
                <span className="font-bold text-slate-800">4.9 / 5.0 ⭐</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
