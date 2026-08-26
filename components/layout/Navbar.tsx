'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  ShoppingBag,
  Menu,
  ChevronDown,
  Bell,
  Store,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = [
    'All Categories',
    'Phones & Tablets',
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Beauty & Health',
    'Vehicles',
    'Property',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const catQuery = selectedCategory !== 'All Categories' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
    router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}${catQuery}`);
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/browse' },
    { label: 'Hot Deals', href: '/browse?filter=deals', badge: 'HOT' },
    { label: 'Stores', href: '/shops' },
    { label: 'Recently Listed', href: '/browse?sort=recent' },
    { label: 'About EBS', href: '/about' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-2xs select-none">
        
        {/* ── 1. DESKTOP & TABLET TOP BAR (md and up) ── */}
        <div className="hidden md:flex w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 items-center justify-between gap-4 lg:gap-8">
          {/* LEFT: Official Brand Logo on White */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="inline-flex items-center" aria-label="Enugu Buy & Sell Home">
              <Logo size="md" />
            </Link>
          </div>

          {/* CENTER: Large Marketplace Search Bar with Dropdown */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 max-w-2xl items-center rounded-full border border-slate-200 bg-slate-50/70 hover:border-slate-300 focus-within:border-[#087443] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#087443]/10 transition-all p-1"
          >
            {/* Category Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#087443] border-r border-slate-200 transition-colors cursor-pointer"
              >
                <span>{selectedCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {categoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-xl bg-white p-1.5 shadow-xl border border-slate-100 z-50">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#E8F5EF] text-[#087443] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search for anything in Enugu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            {/* Green Search Button */}
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-[#087443] hover:bg-[#065F37] text-white flex items-center justify-center transition-colors shrink-0 shadow-xs cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* RIGHT: Wishlist, Cart (2), Account, and Sell on EBS */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Wishlist */}
            <Link
              href="/browse"
              className="hidden lg:flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#087443] transition-colors"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[11px] font-medium tracking-tight">Wishlist</span>
            </Link>

            {/* Cart with Dynamic Badge (2) */}
            <Link
              href="/conversations"
              className="hidden sm:flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#087443] transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#087443] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
              </div>
              <span className="text-[11px] font-medium tracking-tight">Cart</span>
            </Link>

            {/* Account */}
            <Link
              href="/account"
              className="hidden sm:flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#087443] transition-colors"
            >
              <User className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[11px] font-medium tracking-tight">Account</span>
            </Link>

            {/* Primary CTA: "Sell on EBS" */}
            <Link
              href="/create-product"
              className="inline-flex items-center gap-2 bg-[#087443] hover:bg-[#065F37] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              <span>Sell on EBS</span>
            </Link>
          </div>
        </div>

        {/* ── 2. MOBILE TOP BAR (< md) ── */}
        <div className="md:hidden px-4 pt-3 pb-2 flex items-center justify-between gap-2">
          {/* LEFT: Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#087443] transition-colors shrink-0"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* CENTER: Official Brand Logo */}
          <Link href="/" className="inline-flex items-center" aria-label="Enugu Buy & Sell Home">
            <Logo size="sm" />
          </Link>

          {/* RIGHT: Notification Bell + Sell on EBS */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/conversations"
              className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#087443] transition-colors relative"
              aria-label="Inbox & Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#087443] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                2
              </span>
            </Link>

            <Link
              href="/create-shop"
              className="inline-flex items-center gap-1.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-2xs"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sell on EBS</span>
            </Link>
          </div>
        </div>

        {/* ── 3. MOBILE SEARCH BAR (< md) ── */}
        <div className="md:hidden px-4 pb-3 pt-0.5">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-full border border-slate-200 bg-slate-50/90 pl-3.5 pr-1 py-1 focus-within:border-[#087443] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#087443]/10 transition-all shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search in Enugu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
            />
            <button
              type="submit"
              className="bg-[#053D24] hover:bg-[#087443] text-white rounded-full px-4 py-1.5 text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* ── 4. SUB-NAVIGATION ROW (md and up only) ── */}
        <nav className="hidden md:flex border-t border-slate-100 bg-white">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center gap-8 text-xs font-semibold text-slate-600">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`py-3 transition-colors relative flex items-center gap-1.5 ${
                    isActive ? 'text-[#087443] font-bold' : 'hover:text-[#087443]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-[#EF4444] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#087443] rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

      </header>

      {/* Slide-out Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

export default Navbar;
