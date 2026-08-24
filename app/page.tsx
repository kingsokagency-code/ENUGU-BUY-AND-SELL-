'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ShopCard } from '@/components/marketplace/ShopCard';
import { HotDealsWidget } from '@/components/marketplace/HotDealsWidget';
import { ProductGridSkeleton } from '@/components/marketplace/SkeletonCard';
import {
  ArrowRight,
  ShieldCheck,
  Tag,
  Users,
  CheckCircle2,
  Lock,
  Truck,
  RotateCcw,
  Smartphone,
  Laptop,
  Shirt,
  Armchair,
  Sparkles,
  Car,
  Home as HomeIcon,
  Grid,
  Store,
} from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  is_verified?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  condition: string;
  location: string;
  category_id?: string;
  images?: string[];
  shops?: { name: string; slug: string; is_verified?: boolean };
}

export default function Home() {
  const [featuredShops, setFeaturedShops] = useState<ShopItem[]>([]);
  const [popularProducts, setPopularProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [shopsRes, prodRes] = await Promise.all([
          fetch('/api/shops').then((r) => r.json()).catch(() => ({ shops: [] })),
          fetch('/api/products?limit=8').then((r) => r.json()).catch(() => ({ products: [] })),
        ]);
        setFeaturedShops(shopsRes.shops ?? []);
        setPopularProducts(prodRes.products ?? []);
      } catch {
        console.warn('[EBS] Error fetching homepage data');
      } finally {
        setLoading(false);
      }
    }
    loadLiveData();
  }, []);

  const categories = [
    { name: 'Phones & Tablets', icon: Smartphone, color: 'text-emerald-600 bg-emerald-50', count: 'Active listings' },
    { name: 'Electronics', icon: Laptop, color: 'text-blue-600 bg-blue-50', count: 'Popular tech' },
    { name: 'Fashion', icon: Shirt, color: 'text-pink-600 bg-pink-50', count: 'Clothing & shoes' },
    { name: 'Home & Kitchen', icon: Armchair, color: 'text-amber-600 bg-amber-50', count: 'Appliances & decor' },
    { name: 'Beauty & Health', icon: Sparkles, color: 'text-purple-600 bg-purple-50', count: 'Care & cosmetics' },
    { name: 'Vehicles', icon: Car, color: 'text-teal-600 bg-teal-50', count: 'Cars & bikes' },
    { name: 'Property', icon: HomeIcon, color: 'text-indigo-600 bg-indigo-50', count: 'Rentals & sales' },
    { name: 'More', icon: Grid, color: 'text-slate-600 bg-slate-100', count: 'Explore all' },
  ];

  const fallbackShops = [
    {
      id: '1',
      name: "Kingsley's Tech Hub",
      slug: 'kingsley-tech',
      description: 'Laptops, phones, and quality accessories in Enugu.',
      location: 'UNEC Campus, Enugu',
      is_verified: true,
    },
    {
      id: '2',
      name: 'Grace Kitchen & Pastries',
      slug: 'grace-kitchen',
      description: 'Fresh food, meat pies, and snacks for students.',
      location: 'New Haven, Enugu',
      is_verified: true,
    },
    {
      id: '3',
      name: 'Campus Books & Stationery',
      slug: 'campus-books',
      description: 'Engineering and medical textbooks at affordable rates.',
      location: 'Independence Layout, Enugu',
      is_verified: false,
    },
  ];

  const fallbackProducts: ProductItem[] = [
    {
      id: 'p1',
      name: 'iPhone 13 128GB (Green, Unlocked)',
      price: 420000,
      shops: { name: "Kingsley's Tech Hub", slug: 'kingsley-tech', is_verified: true },
      location: 'UNEC Campus, Enugu',
      condition: 'Used',
    },
    {
      id: 'p2',
      name: 'HP Laptop 15 (16GB RAM / 512GB SSD)',
      price: 310000,
      shops: { name: 'Emeka Mobile', slug: 'emeka-mobile', is_verified: true },
      location: 'Independence Layout',
      condition: 'Used',
    },
    {
      id: 'p3',
      name: 'Nike Air Force 1 (White / Size 43)',
      price: 84000,
      shops: { name: 'Grace Kitchen', slug: 'grace-kitchen', is_verified: false },
      location: 'New Haven',
      condition: 'Brand New',
    },
    {
      id: 'p4',
      name: 'Double-Burner Gas Cooker + Regulator',
      price: 18500,
      shops: { name: 'Campus Books', slug: 'campus-books', is_verified: false },
      location: 'UNN Campus',
      condition: 'Used',
    },
  ];

  const displayShops = featuredShops.length > 0 ? featuredShops : fallbackShops;
  const displayProducts = popularProducts.length > 0 ? popularProducts : fallbackProducts;

  return (
    <div className="bg-[#F8FAF9] text-[#111827] min-h-screen space-y-12 sm:space-y-16">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION: TWO-COLUMN PRODUCTION MARKETPLACE HERO  */}
      {/* ======================================================== */}
      <section className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 lg:pt-14 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── LEFT COLUMN (6 COLS): Headline, Action, Proof ── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
            
            {/* Small Trust Label Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E8F5EF] text-[#087443] border border-[#087443]/15 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight">
              <CheckCircle2 className="w-4 h-4 text-[#087443]" />
              <span>The trusted marketplace in Enugu</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-black text-[#111827] tracking-tight leading-[1.05]">
              Buy, Sell &amp; Discover <br />
              Anything in <span className="text-[#087443]">Enugu</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-xl">
              The trusted marketplace for everyone. <br />
              <span className="text-[#087443] font-bold">Safe.</span>{' '}
              <span className="text-[#F97316] font-bold">Fast.</span>{' '}
              <span className="text-[#087443] font-bold">Local.</span>
            </p>

            {/* CTA Buttons: Shop Now & Start Selling */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 bg-[#087443] hover:bg-[#065F37] text-white text-base font-bold px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
              </Link>

              <Link
                href="/create-product"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#087443] border border-[#087443]/30 hover:border-[#087443] text-base font-bold px-7 py-3.5 rounded-full transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <Store className="w-4.5 h-4.5" />
                <span>Start Selling</span>
              </Link>
            </div>

            {/* 3 Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
              
              {/* Badge 1: Verified Deals */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8F5EF] text-[#087443] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">Verified Deals</h5>
                  <p className="text-[11px] font-medium text-slate-500">Safe &amp; secure</p>
                </div>
              </div>

              {/* Badge 2: Local Sellers */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8F5EF] text-[#087443] flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">Local Sellers</h5>
                  <p className="text-[11px] font-medium text-slate-500">From your community</p>
                </div>
              </div>

              {/* Badge 3: Quality Listings */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8F5EF] text-[#087443] flex items-center justify-center shrink-0 mt-0.5">
                  <Tag className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">Quality Listings</h5>
                  <p className="text-[11px] font-medium text-slate-500">Top products &amp; services</p>
                </div>
              </div>

            </div>

          </div>

          {/* ── RIGHT COLUMN (6 COLS): Interactive Hot Deals Live Showcase ── */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
            <HotDealsWidget />
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CATEGORIES: "BROWSE TOP CATEGORIES"                   */}
      {/* ======================================================== */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black tracking-wider text-[#087443] uppercase">
                — BROWSE TOP CATEGORIES —
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
                Find what you need
              </h2>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#087443] hover:text-[#065F37] transition-colors"
            >
              <span>View all categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 8 Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/browse?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#F8FAF9] hover:bg-[#E8F5EF] border border-slate-100 hover:border-[#087443]/20 transition-all duration-150 group cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${cat.color}`}>
                    <IconComp className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#087443] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-medium text-slate-500 mt-1">
                    {cat.count}
                  </span>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. RECENT / POPULAR MARKETPLACE LISTINGS                 */}
      {/* ======================================================== */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Featured Listings in Enugu
            </h2>
            <p className="text-sm text-slate-500 font-medium">Explore verified items from trusted student &amp; local sellers</p>
          </div>
          <Link
            href="/browse"
            className="text-sm font-bold text-[#087443] hover:text-[#065F37] inline-flex items-center gap-1"
          >
            <span>See more</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                condition={p.condition}
                location={p.location}
                shop={p.shops}
                imageUrl={p.images && p.images.length > 0 ? p.images[0] : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 4. VERIFIED ENUGU STORES                                 */}
      {/* ======================================================== */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Verified Campus &amp; Local Stores
            </h2>
            <p className="text-sm text-slate-500 font-medium">Shop directly from registered shops across Enugu</p>
          </div>
          <Link
            href="/shops"
            className="text-sm font-bold text-[#087443] hover:text-[#065F37] inline-flex items-center gap-1"
          >
            <span>View all stores</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayShops.map((shop) => (
            <ShopCard
              key={shop.id}
              id={shop.id}
              name={shop.name}
              slug={shop.slug}
              description={shop.description}
              location={shop.location}
              is_verified={shop.is_verified}
            />
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. VALUE PROPOSITION STRIP: 4 PILLARS OF TRUST           */}
      {/* ======================================================== */}
      <section className="w-full bg-white border-y border-slate-100 py-8 select-none">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Pillar 1: Verified Sellers */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#087443] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Verified Sellers</h4>
                <p className="text-xs text-slate-500 font-medium">All sellers are verified</p>
              </div>
            </div>

            {/* Pillar 2: Secure Payments */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#087443] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Secure Payments</h4>
                <p className="text-xs text-slate-500 font-medium">Your money is protected</p>
              </div>
            </div>

            {/* Pillar 3: Fast Delivery */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#087443] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Fast Delivery</h4>
                <p className="text-xs text-slate-500 font-medium">Quick delivery across Enugu</p>
              </div>
            </div>

            {/* Pillar 4: Easy Returns */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#087443] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Easy Returns</h4>
                <p className="text-xs text-slate-500 font-medium">Hassle-free returns</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
