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
        
        {/* ── TOP BAR: Logo, Search, Actions ── */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between gap-4 lg:gap-8">
          
          {/* LEFT: Official Brand Logo on White */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="inline-flex items-center" aria-label="Enugu Buy & Sell Home">
              <Logo size="md" />
            </Link>
          </div>

          {/* CENTER: Large Marketplace Search Bar with Dropdown */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl items-center rounded-full border border-slate-200 bg-slate-50/70 hover:border-slate-300 focus-within:border-[#087443] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#087443]/10 transition-all p-1"
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

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:text-[#087443] transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* ── SUB-NAVIGATION ROW: Home (Active), Categories, Hot Deals [HOT], Stores, Recently Listed, About EBS ── */}
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

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3 pt-1">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search in Enugu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button type="submit" className="bg-[#087443] text-white rounded-full px-3 py-1 text-xs font-bold">
              Search
            </button>
          </form>
        </div>

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
