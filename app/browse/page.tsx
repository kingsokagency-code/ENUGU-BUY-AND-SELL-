'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ShopCard } from '@/components/marketplace/ShopCard';
import { ProductGridSkeleton } from '@/components/marketplace/SkeletonCard';
import { CategoryPills } from '@/components/marketplace/CategoryPills';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { Search, ArrowLeft, X, SlidersHorizontal, Store } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  category_id?: string;
  images?: string[];
  shops?: {
    id: string;
    name: string;
    slug: string;
    is_verified?: boolean;
  };
}

interface MatchingShop {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  is_verified?: boolean;
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentQuery = searchParams.get('q') ?? '';
  const currentCategory = searchParams.get('category') ?? searchParams.get('category_id') ?? '';
  const currentSort = searchParams.get('sort') ?? 'newest';
  const currentCondition = searchParams.get('condition') ?? 'all';
  const currentLocation = searchParams.get('location') ?? 'all';

  const [inputQuery, setInputQuery] = useState(currentQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [matchingShops, setMatchingShops] = useState<MatchingShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultCount, setResultCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentQuery) params.set('q', currentQuery);
        if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory);
        if (currentSort && currentSort !== 'newest') params.set('sort', currentSort);
        if (currentCondition && currentCondition !== 'all') params.set('condition', currentCondition);
        if (currentLocation && currentLocation !== 'all') params.set('location', currentLocation);

        const url = `/api/products?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products ?? []);
        setMatchingShops(data.matching_shops ?? []);
        setResultCount(data.count ?? 0);
      } catch {
        console.warn('[BROWSE] Error fetching products');
        setProducts([]);
        setMatchingShops([]);
        setResultCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentQuery, currentCategory, currentSort, currentCondition, currentLocation]);

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === 'all') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    router.push(`/browse?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: inputQuery.trim() });
  };

  const handleCategorySelect = (categorySlug: string) => {
    if (categorySlug === 'all') {
      updateFilters({ category: '' });
    } else {
      updateFilters({ category: categorySlug });
    }
  };

  const clearAllFilters = () => {
    setInputQuery('');
    router.push('/browse');
  };

  const hasActiveFilters = currentQuery || currentCategory || currentSort !== 'newest' || currentCondition !== 'all' || currentLocation !== 'all';

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-[#667085] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, phones, sneakers, hair stylist..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-9 py-2.5 outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium"
            />
            {inputQuery && (
              <button
                type="button"
                onClick={() => { setInputQuery(''); updateFilters({ q: '' }); }}
                className="absolute right-3 text-[#667085] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#087443] hover:bg-[#065f37] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs shrink-0"
          >
            Search
          </button>
        </form>

        {/* Category Discovery Pills */}
        <CategoryPills
          selectedCategory={currentCategory || 'all'}
          onSelectCategory={handleCategorySelect}
        />

        {/* Quick Filter Bar: Sort, Condition, Location */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            {/* Condition Filter */}
            <select
              value={currentCondition}
              onChange={(e) => updateFilters({ condition: e.target.value })}
              className="bg-[#FAFAF8] border border-slate-200 text-[#111111] rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#087443] font-medium"
            >
              <option value="all">All Conditions</option>
              <option value="New">Brand New</option>
              <option value="Used">Used</option>
              <option value="Refurbished">Refurbished</option>
            </select>

            {/* Campus Location Filter */}
            <select
              value={currentLocation}
              onChange={(e) => updateFilters({ location: e.target.value })}
              className="bg-[#FAFAF8] border border-slate-200 text-[#111111] rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#087443] font-medium"
            >
              <option value="all">All Locations</option>
              <option value="UNEC">UNEC Campus</option>
              <option value="UNN">UNN Nsukka</option>
              <option value="New Haven">New Haven</option>
              <option value="Independence">Independence Layout</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-[#FAFAF8] border border-slate-200 text-[#111111] rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#087443] font-semibold text-[#087443]"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && resultCount !== null && (
          <div className="flex items-center justify-between text-xs text-[#667085] pt-1">
            <span>
              Found <strong>{resultCount}</strong> {resultCount === 1 ? 'item' : 'items'}
              {currentQuery && <> for &ldquo;<strong className="text-[#111111]">{currentQuery}</strong>&rdquo;</>}
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[#087443] font-semibold hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Matching Campus Stores & Services Section (if search matches shops) */}
      {matchingShops.length > 0 && (
        <div className="bg-[#E8F5EF]/60 border border-[#087443]/20 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#087443]" />
              <h2 className="text-sm font-bold text-[#111111]">
                Matching Campus Stores &amp; Vendors ({matchingShops.length})
              </h2>
            </div>
            <Link href="/shops" className="text-xs font-bold text-[#087443] hover:underline">
              View All Stores &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matchingShops.map((shop) => (
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
        </div>
      )}

      {/* Main Catalog Grid */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111111]">
              Available Campus Items ({products.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {products.map((p) => (
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
        </div>
      ) : (
        /* Zero Result State */
        <EmptyState
          type="search"
          title={currentQuery ? `No items found matching "${currentQuery}"` : 'No active listings found in this filter'}
          description={
            currentQuery
              ? 'Try searching with broader keywords like "phone", "laptop", or "textbook" in Enugu.'
              : 'Be the first student seller to list a product in Enugu Buy & Sell!'
          }
          actionText={hasActiveFilters ? 'Reset Filters' : '+ List a Product'}
          actionHref={hasActiveFilters ? undefined : '/create-product'}
          onActionClick={hasActiveFilters ? clearAllFilters : undefined}
          secondaryActionText={hasActiveFilters ? '+ List this Item' : undefined}
          secondaryActionHref={hasActiveFilters ? '/create-product' : undefined}
        />
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <div className="text-[#111111] px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-semibold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#087443]/15">
            Campus Catalog
          </span>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={6} />}>
          <BrowseContent />
        </Suspense>
      </div>
    </div>
  );
}

