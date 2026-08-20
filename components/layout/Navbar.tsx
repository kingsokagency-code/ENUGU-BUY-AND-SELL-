'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, User } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#087443] text-white font-black flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
            E
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#111111] group-hover:text-[#087443] transition-colors leading-tight">
              Enugu Buy &amp; Sell
            </span>
            <span className="text-[9px] font-bold tracking-[0.14em] text-[#087443] uppercase">
              Powered by KINGSOK
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/browse"
            className={`text-xs font-semibold transition-colors ${
              pathname === '/browse' ? 'text-[#087443]' : 'text-[#667085] hover:text-[#111111]'
            }`}
          >
            Browse Catalog
          </Link>
          <Link
            href="/shops"
            className={`text-xs font-semibold transition-colors ${
              pathname === '/shops' ? 'text-[#087443]' : 'text-[#667085] hover:text-[#111111]'
            }`}
          >
            Campus Stores
          </Link>
          <Link
            href="/conversations"
            className={`text-xs font-semibold transition-colors ${
              pathname.startsWith('/conversations') ? 'text-[#087443]' : 'text-[#667085] hover:text-[#111111]'
            }`}
          >
            Inbox
          </Link>
        </nav>

        {/* Action Button Group */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/create-shop"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#087443] hover:bg-[#065f37] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start Your Shop</span>
          </Link>

          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] bg-[#E8F5EF] hover:bg-[#087443] hover:text-white px-3 py-2 rounded-xl transition-all border border-[#087443]/15"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In / Account</span>
            <span className="sm:hidden">Account</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
