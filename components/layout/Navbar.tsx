'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { getCart } from '@/lib/commerce-client';
import { getCurrentUser } from '@/lib/auth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    const { user } = await getCurrentUser();
    if (!user) {
      setCartCount(0);
      return;
    }
    const res = await getCart();
    if (res.success) {
      setCartCount(res.count);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cart_updated', handleCartUpdate);
    return () => window.removeEventListener('cart_updated', handleCartUpdate);
  }, [fetchCartCount]);

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
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-2xs select-none w-full max-w-full overflow-hidden">
        
        {/* ── 1. DESKTOP & TABLET TOP BAR (md and up) ── */}
        <div className="hidden md:flex w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 items-center justify-between gap-4 lg:gap-8">
          
          {/* LEFT: Official Master Brand Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="inline-flex items-center" aria-label="Enugu Buy & Sell Home">
              <Logo size="md" width={135} height={71} />
            </Link>
          </div>

          {/* CENTER: Search Bar with Integrated Category Selector */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl flex items-center rounded-full border-2 border-[#087443] bg-white p-1 pl-4 shadow-xs focus-within:shadow-md transition-shadow relative"
          >
            {/* Category Dropdown Toggle */}
            <div className="relative shrink-0 border-r border-slate-200 pr-3 mr-1">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#087443] transition-colors py-1 cursor-pointer"
              >
                <span>{selectedCategory}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180 text-[#087443]' : ''}`} />
              </button>

              {/* Category Dropdown Menu */}
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-[#E8F8EF] hover:text-[#087443] ${
                        selectedCategory === cat ? 'font-bold text-[#087443] bg-[#E8F8EF]/50' : 'text-slate-600'
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

          {/* RIGHT: Wishlist, Cart, Account, and Sell on EBS */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Wishlist */}
            <Link
              href="/browse"
              className="hidden lg:flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#087443] transition-colors"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[11px] font-medium tracking-tight">Wishlist</span>
            </Link>

            {/* Live Cart with Dynamic Badge */}
            <Link
              href="/cart"
              className="hidden sm:flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#087443] transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#087443] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
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
        <div className="md:hidden px-3 sm:px-4 pt-2.5 pb-2 flex items-center justify-between gap-1.5 sm:gap-2 w-full max-w-full">
          {/* LEFT: Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#087443] transition-colors shrink-0"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* CENTER: Exact Proportional Master Logo */}
          <div className="flex items-center justify-center shrink-0">
            <Link href="/" className="inline-flex items-center" aria-label="Enugu Buy & Sell Home">
              <Logo size="sm" width={95} height={50} />
            </Link>
          </div>

          {/* RIGHT: Cart + Sell on EBS Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/cart"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#087443] transition-colors relative shrink-0"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 bg-[#087443] text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/create-shop"
              className="inline-flex items-center gap-1 bg-[#087443] hover:bg-[#065F37] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all shadow-2xs shrink-0"
            >
              <Store className="w-3 h-3 shrink-0" />
              <span>Sell on EBS</span>
            </Link>
          </div>
        </div>

        {/* ── 3. MOBILE SEARCH BAR (< md) ── */}
        <div className="md:hidden px-3 sm:px-4 pb-2.5 pt-0.5 w-full max-w-full">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-full border border-slate-200 bg-slate-50/90 pl-3 pr-1 py-1 focus-within:border-[#087443] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#087443]/10 transition-all shadow-2xs w-full"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search in Enugu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
            />
            <button
              type="submit"
              className="bg-[#053D24] hover:bg-[#087443] text-white rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer"
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
