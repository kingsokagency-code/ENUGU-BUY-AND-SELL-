'use client';

import React from 'react';
import Link from 'next/link';

export interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number;
  isCenter?: boolean;
}

interface BottomNavProps {
  items: BottomNavItem[];
  activePath?: string;
  dark?: boolean;
}

export function BottomNav({ items, activePath = '/', dark = false }: BottomNavProps) {
  const bg      = dark ? 'bg-[#111D17] border-[#243320]' : 'bg-white border-[#E5EDE9]';
  const active  = dark ? 'text-[#0A8A50]' : 'text-[#087443]';
  const inactive = dark ? 'text-[#6B9980]' : 'text-[#9CB3AA]';

  return (
    <nav className={`fixed bottom-0 inset-x-0 z-50 border-t ${bg} safe-area-inset-bottom md:hidden`}>
      <div className="flex items-center justify-around h-16">
        {items.map(item => {
          const isActive = activePath === item.href || activePath.startsWith(item.href + '/');

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-6"
              >
                <span className="w-12 h-12 bg-[#087443] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#087443]/40">
                  {item.icon}
                </span>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? active : inactive}`}>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 relative transition-colors ${isActive ? active : inactive}`}
            >
              <span className="relative">
                {isActive ? (item.activeIcon ?? item.icon) : item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
