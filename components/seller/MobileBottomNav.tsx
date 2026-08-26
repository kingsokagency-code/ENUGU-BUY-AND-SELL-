'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Plus, Inbox, MoreHorizontal,
} from 'lucide-react';

export function MobileSellerNav() {
  const pathname = usePathname();

  const items = [
    { href: '/seller/dashboard', label: 'Home',    icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/seller/orders',    label: 'Orders',  icon: <ShoppingBag     className="w-5 h-5" />, badge: 6 },
    { href: '/create-product',   label: 'Add',     icon: <Plus            className="w-6 h-6" />, isCenter: true },
    { href: '/conversations',    label: 'Inbox',   icon: <Inbox            className="w-5 h-5" />, badge: 1 },
    { href: '/seller/settings',  label: 'More',    icon: <MoreHorizontal  className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#111D17] border-t border-[#243320] lg:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-6 group"
              >
                <span className="w-12 h-12 bg-[#087443] hover:bg-[#0A8A50] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#087443]/50 active:scale-95 transition-all">
                  {item.icon}
                </span>
                <span className="text-[10px] mt-1 font-semibold text-[#6B9980] group-hover:text-white">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 relative transition-colors ${
                isActive ? 'text-[#0A8A50]' : 'text-[#6B9980] hover:text-white'
              }`}
            >
              <span className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
