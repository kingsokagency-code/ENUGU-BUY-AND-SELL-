'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3,
  Megaphone, Settings, Wallet, Crown, HelpCircle,
  ExternalLink, ArrowLeft,
} from 'lucide-react';

interface SellerSidebarProps {
  storeName?: string;
  storeSlug?: string;
}

const NAV_ITEMS = [
  { href: '/seller/dashboard',   label: 'Overview',       icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/seller/products',    label: 'Products',       icon: <Package         className="w-4 h-4" /> },
  { href: '/seller/orders',      label: 'Orders',         icon: <ShoppingBag     className="w-4 h-4" />, badge: 6 },
  { href: '/seller/customers',   label: 'Customers',      icon: <Users           className="w-4 h-4" /> },
  { href: '/seller/analytics',   label: 'Analytics',      icon: <BarChart3       className="w-4 h-4" /> },
  { href: '/seller/marketing',   label: 'Marketing',      icon: <Megaphone       className="w-4 h-4" /> },
  { href: '/seller/settings',    label: 'Store Settings', icon: <Settings        className="w-4 h-4" /> },
  { href: '/seller/payouts',     label: 'Payouts',        icon: <Wallet          className="w-4 h-4" /> },
  { href: '/seller/subscriptions',label: 'Subscriptions', icon: <Crown           className="w-4 h-4" /> },
  { href: '/seller/support',     label: 'Support',        icon: <HelpCircle      className="w-4 h-4" /> },
];

export function SellerSidebar({
  storeName = 'Kingsok Gadgets',
  storeSlug = 'kingsok-gadgets',
}: SellerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#111D17] border-r border-[#243320] shrink-0">
      {/* Brand Top */}
      <div className="px-5 py-5 border-b border-[#243320] flex items-center justify-between">
        <Logo size="sm" />
      </div>

      {/* Switch Mode to Buyer */}
      <div className="px-3 pt-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#6B9980] hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch to Marketplace</span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#087443] text-white shadow-sm'
                  : 'text-[#9CB3AA] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-[#6B9980]'}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Premium Card & Store Preview Link */}
      <div className="p-3 border-t border-[#243320] space-y-2">
        <Link
          href={`/shops/${storeSlug}`}
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#6B9980] hover:text-white bg-white/5 transition-colors"
        >
          <span>View Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="p-3 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#4C1D95]/40 border border-[#7C3AED]/30 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-[#FBBF24]" />
            <span className="text-xs font-bold">Upgrade to Premium</span>
          </div>
          <p className="text-[10px] text-white/70 mb-2 leading-tight">
            Unlock AI analytics, verified boosts & priority payouts.
          </p>
          <Link
            href="/seller/subscriptions"
            className="block text-center py-1.5 px-3 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-[11px] font-bold text-white transition-colors"
          >
            Go Premium →
          </Link>
        </div>
      </div>
    </aside>
  );
}
