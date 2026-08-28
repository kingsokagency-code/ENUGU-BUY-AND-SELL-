'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Plus, MessageCircle, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, exact: true },
    { label: 'Categories', href: '/browse', icon: LayoutGrid },
    { label: 'Sell', href: '/create-shop', icon: Plus, isCenter: true },
    { label: 'Inbox', href: '/conversations', icon: MessageCircle },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group"
                aria-label="Sell something"
              >
                <div className="w-12 h-12 rounded-full bg-[#087443] text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform border-2 border-white ring-2 ring-[#087443]/20">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] font-black text-[#087443] mt-0.5">
                  Sell
                </span>
              </Link>
            );
          }

          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive ? 'text-[#087443]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black' : 'font-semibold'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

