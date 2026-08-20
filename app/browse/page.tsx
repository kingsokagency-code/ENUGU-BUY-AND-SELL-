'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ProductGridSkeleton } from '@/components/marketplace/SkeletonCard';
import { CategoryPills } from '@/components/marketplace/CategoryPills';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { Search, ArrowLeft, X } from 'lucide-react';

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

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentQuery = searchParams.get('q') ?? '';

  const [inputQuery, setInputQuery] = useState(currentQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultCount, setResultCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const url = currentQuery ? `/api/products?q=${encodeURIComponent(currentQuery)}` : '/api/products';
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products ?? []);
        setResultCount(data.count ?? 0);
      } catch {
        console.warn('[BROWSE] Error fetching products');
        setProducts([]);
        setResultCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(inputQuery.trim() ? `/browse?q=${encodeURIComponent(inputQuery.trim())}` : '/browse');
  };

  const handleCategorySelect = (categorySlug: string) => {
    if (categorySlug === 'all') {
      setInputQuery('');
      router.push('/browse');
    } else {
      setInputQuery(categorySlug);
      router.push(`/browse?q=${encodeURIComponent(categorySlug)}`);
    }
  };

  const clearSearch = () => {
    setInputQuery('');
    router.push('/browse');
  };

  return (
    <div className="space-y-6">
      {/* Search Header Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-[#667085] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, phones, textbooks, electronics..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-9 py-2.5 outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all"
            />
            {inputQuery && (
              <button
                type="button"
                onClick={clearSearch}
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

        {/* Category Pill Filters */}
        <CategoryPills
          selectedCategory={currentQuery || 'all'}
          onSelectCategory={handleCategorySelect}
        />

        {currentQuery && resultCount !== null && (
          <div className="flex items-center justify-between text-xs text-[#667085] pt-1 border-t border-slate-100">
            <span>
              Showing {resultCount} {resultCount === 1 ? 'result' : 'results'} for &ldquo;
              <strong className="text-[#111111]">{currentQuery}</strong>&rdquo;
            </span>
            <button
              type="button"
              onClick={clearSearch}
              className="text-[#087443] font-semibold hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

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
          title={currentQuery ? `No items found matching "${currentQuery}"` : 'No active listings in catalog yet'}
          description={
            currentQuery
              ? 'Try searching with broader keywords like "phone", "laptop", or "textbook" in Enugu.'
              : 'Be the first student seller to list a product in Enugu Buy & Sell!'
          }
          actionText={currentQuery ? 'Reset Search' : '+ List a Product'}
          actionHref={currentQuery ? undefined : '/create-product'}
          onActionClick={currentQuery ? clearSearch : undefined}
          secondaryActionText={currentQuery ? '+ List this Item' : undefined}
          secondaryActionHref={currentQuery ? '/create-product' : undefined}
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

