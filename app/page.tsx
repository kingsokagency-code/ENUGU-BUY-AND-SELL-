'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/telemetry';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ShopCard } from '@/components/marketplace/ShopCard';
import { CategoryPills } from '@/components/marketplace/CategoryPills';
import { ProductGridSkeleton } from '@/components/marketplace/SkeletonCard';
import { ArrowRight, Search } from 'lucide-react';

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredShops, setFeaturedShops] = useState<ShopItem[]>([]);
  const [popularProducts, setPopularProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [shopsRes, prodRes] = await Promise.all([
          fetch('/api/shops').then(r => r.json()).catch(() => ({ shops: [] })),
          fetch('/api/products?limit=8').then(r => r.json()).catch(() => ({ products: [] })),
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const term = searchQuery.trim();
    trackEvent('search', { query: term, source: 'homepage' });
    router.push(`/browse?q=${encodeURIComponent(term)}`);
  };

  const handleCategorySelect = (categorySlug: string) => {
    if (categorySlug === 'all') {
      router.push('/browse');
    } else {
      router.push(`/browse?q=${encodeURIComponent(categorySlug)}`);
    }
  };

  // Static fallback mock data if database has 0 items during initial setup
  const fallbackShops = [
    { id: '1', name: "Kingsley's Tech Hub", slug: 'kingsley-tech', description: 'Laptops, phones, and quality accessories in Enugu.', location: 'UNN Campus, Enugu', is_verified: true },
    { id: '2', name: 'Grace Kitchen & Pastries', slug: 'grace-kitchen', description: 'Fresh food, meat pies, and snacks for students.', location: 'New Haven, Enugu', is_verified: true },
    { id: '3', name: 'Campus Books', slug: 'campus-books', description: 'Engineering and medical textbooks at affordable rates.', location: 'Independence Layout', is_verified: false },
  ];

  const fallbackProducts: ProductItem[] = [
    { id: 'p1', name: 'HP EliteBook 840 G5 (16GB RAM / 256GB SSD)', price: 280000, shops: { name: "Kingsley's Tech Hub", slug: 'kingsley-tech', is_verified: true }, location: 'UNN Campus', condition: 'Used' },
    { id: 'p2', name: 'iPhone 13 (128GB, Factory Unlocked)', price: 350000, shops: { name: 'Emeka Mobile', slug: 'emeka-mobile', is_verified: true }, location: 'Independence Layout', condition: 'Used' },
    { id: 'p3', name: 'Double-Burner Gas Cooker + Regulator', price: 18500, shops: { name: 'Grace Kitchen', slug: 'grace-kitchen', is_verified: false }, location: 'New Haven', condition: 'Used' },
    { id: 'p4', name: 'Organic Chemistry 4th Edition Textbook', price: 4500, shops: { name: 'Campus Books', slug: 'campus-books', is_verified: false }, location: 'UNN Campus', condition: 'Used' },
  ];

  const displayShops = featuredShops.length > 0 ? featuredShops : fallbackShops;
  const displayProducts = popularProducts.length > 0 ? popularProducts : fallbackProducts;

  return (
    <div className="text-[#111111] space-y-8">
      {/* ── HERO SECTION ── */}
      <section className="px-4 pt-8 pb-4 max-w-4xl mx-auto text-center space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#E8F5EF] text-[#087443] px-3 py-1 rounded-full text-xs font-bold border border-[#087443]/15 shadow-xs">
            <span>🏛️</span>
            <span>Hyperlocal Marketplace for Enugu &amp; UNEC</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#111111] leading-tight">
            Find what you need. <br />
            <span className="text-[#087443]">Sell what you have.</span>
          </h1>
          <p className="text-[#667085] text-sm sm:text-base max-w-lg mx-auto font-normal">
            Discover verified campus storefronts, student electronics, textbooks, and quality gear across Enugu.
          </p>
        </div>

        {/* Functional Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#667085] absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, shops, or categories in Enugu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-[#087443] text-[#111111] text-sm rounded-xl pl-11 pr-24 py-3.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#087443]/20 transition-all placeholder:text-[#667085]"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-[#087443] text-white px-4 rounded-lg text-xs font-bold hover:bg-[#065f37] transition-all shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Discovery Pills */}
        <div className="pt-2">
          <CategoryPills onSelectCategory={handleCategorySelect} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/browse"
            className="w-full sm:w-auto bg-[#087443] hover:bg-[#065f37] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-xs transition-all text-center"
          >
            Explore All Listings
          </Link>
          <Link
            href="/create-shop"
            className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 text-[#111111] font-semibold text-sm px-8 py-3.5 rounded-xl transition-all text-center"
          >
            Start Your Shop
          </Link>
        </div>
      </section>

      {/* ── FEATURED SHOPS ── */}
      <section className="max-w-5xl mx-auto px-4 py-6 space-y-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">Campus &amp; Local Stores</h2>
            <p className="text-xs text-[#667085]">Verified student entrepreneurs and local merchants in Enugu.</p>
          </div>
          <Link href="/shops" className="inline-flex items-center gap-1 text-xs font-bold text-[#087443] hover:underline">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* ── POPULAR / LIVE PRODUCTS ── */}
      <section className="max-w-5xl mx-auto px-4 py-6 space-y-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">
              Fresh Campus Drops
            </h2>
            <p className="text-xs text-[#667085]">Recently published listings in Enugu.</p>
          </div>
          <Link href="/browse" className="inline-flex items-center gap-1 text-xs font-bold text-[#087443] hover:underline">
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {displayProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                condition={p.condition}
                location={p.location}
                imageUrl={p.images?.[0]}
                shop={p.shops}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 py-8 px-4 text-center text-xs text-[#667085]">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="font-semibold text-[#111111]">Enugu Buy &amp; Sell — Powered by KINGSOK</p>
          <p>Connecting students, campus entrepreneurs, and local buyers across Enugu.</p>
        </div>
      </footer>
    </div>
  );
}

