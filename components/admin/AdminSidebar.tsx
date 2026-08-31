'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import {
  LayoutDashboard, Users, Store, Package, Grid,
  ShoppingBag, Flame, AlertOctagon, BarChart3,
  Settings, ShieldAlert, ArrowLeft, UserPlus,
} from 'lucide-react';

const ADMIN_NAV = [
  { section: 'MARKETPLACE' },
  { href: '/admin',          label: 'Overview',      icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/users',    label: 'Users & Roles', icon: <Users           className="w-4 h-4" /> },
  { href: '/admin/stores',   label: 'Store Approvals',icon: <Store           className="w-4 h-4" />, badge: 3 },
  { href: '/admin/deals',    label: 'Hot Deals Mgr', icon: <Flame           className="w-4 h-4" /> },

  { section: 'RECRUITMENT' },
  { href: '/admin/applications', label: 'Team Applications', icon: <UserPlus className="w-4 h-4" /> },

  { section: 'OPERATIONS' },
  { href: '/admin/reports',  label: 'Moderation Queue', icon: <AlertOctagon  className="w-4 h-4" />, badge: 7 },
  { href: '/admin/settings', label: 'Platform Settings', icon: <Settings     className="w-4 h-4" /> },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0A1410] border-r border-[#1D2B22] shrink-0">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-[#1D2B22] flex items-center justify-between">
        <Logo size="sm" />
        <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Admin
        </span>
      </div>

      {/* Switch to Marketplace */}
      <div className="px-3 pt-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#6B9980] hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Marketplace</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ADMIN_NAV.map((item, idx) => {
          if ('section' in item && item.section) {
            return (
              <p key={idx} className="text-[10px] font-bold text-[#4E6B5A] px-3 pt-3 pb-1 tracking-wider">
                {item.section}
              </p>
            );
          }

          if ('href' in item && item.href) {
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
          }
          return null;
        })}
      </nav>

      {/* Admin Status Footer */}
      <div className="p-4 border-t border-[#1D2B22] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs shrink-0">
          AD
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">EBS Super Admin</p>
          <p className="text-[10px] text-emerald-400 font-semibold">● Platform Live</p>
        </div>
      </div>
    </aside>
  );
}
