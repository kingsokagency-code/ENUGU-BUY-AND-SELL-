'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Avatar } from '@/components/ebs-ui/Avatar';
import { VerifiedBadge } from '@/components/ebs-ui/Badge';
import {
  LayoutDashboard, Inbox, ShoppingBag, Heart,
  Eye, MapPin, CreditCard, Settings, HelpCircle,
  LogOut, Store, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/account',             label: 'Account Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/conversations',       label: 'Inbox',            icon: <Inbox            className="w-4 h-4" />, badge: 3 },
  { href: '/account/orders',      label: 'Orders',           icon: <ShoppingBag      className="w-4 h-4" /> },
  { href: '/account/saved',       label: 'Saved Items',      icon: <Heart            className="w-4 h-4" /> },
  { href: '/account/recent',      label: 'Recently Viewed',  icon: <Eye              className="w-4 h-4" /> },
  { href: '/account/addresses',   label: 'Addresses',        icon: <MapPin           className="w-4 h-4" /> },
  { href: '/account/payments',    label: 'Payment Methods',  icon: <CreditCard       className="w-4 h-4" /> },
  { href: '/account/settings',    label: 'Settings',         icon: <Settings         className="w-4 h-4" /> },
  { href: '/account/help',        label: 'Help & Support',   icon: <HelpCircle       className="w-4 h-4" /> },
];

interface BuyerSidebarProps {
  userName?: string;
  campus?: string;
  hasStore?: boolean;
  storeName?: string;
  storeSlug?: string;
}

export function BuyerSidebar({
  userName = 'Campus User',
  campus   = 'University of Nigeria, Nsukka',
  hasStore = false,
  storeName,
  storeSlug,
}: BuyerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#0D1F17] shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <Logo size="sm" />
      </div>

      {/* User info */}
      <div className="px-5 py-5 border-b border-white/8 flex items-start gap-3">
        <Avatar name={userName} size="lg" dark />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{userName}</p>
          <p className="text-[10px] text-white/50 truncate mt-0.5">{campus}</p>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-[#0A8A50] bg-[#0A8A50]/15 px-2 py-0.5 rounded-full">
              Campus Buyer
            </span>
            {hasStore && <VerifiedBadge />}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-[#087443]/25 text-[#0A8A50] border-l-2 border-[#087443]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-[#0A8A50]' : 'group-hover:text-white/80'}>{item.icon}</span>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Seller section */}
        <div className="mt-4 pt-4 border-t border-white/8">
          {hasStore ? (
            <Link
              href={`/seller/dashboard`}
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#087443]/20 hover:bg-[#087443]/30 transition-colors group"
            >
              <Store className="w-4 h-4 text-[#0A8A50]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#0A8A50]">Open Seller Dashboard</p>
                <p className="text-[10px] text-white/40 truncate">{storeName}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0A8A50]" />
            </Link>
          ) : (
            <Link
              href="/create-shop"
              className="flex items-center gap-3 px-3 py-3 rounded-xl border border-dashed border-white/15 hover:border-[#087443] hover:bg-[#087443]/10 transition-colors group"
            >
              <Store className="w-4 h-4 text-white/40 group-hover:text-[#0A8A50]" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-white/50 group-hover:text-[#0A8A50]">Want to sell on campus?</p>
                <p className="text-[10px] text-white/30">Create your storefront</p>
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/8">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
