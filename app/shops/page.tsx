'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShopCard } from '@/components/marketplace/ShopCard';
import { ShopCardSkeleton } from '@/components/marketplace/SkeletonCard';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { Plus, ArrowLeft, Search, CheckCircle2, X } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  is_verified?: boolean;
  profiles?: {
    full_name: string;
    is_verified?: boolean;
  };
}

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShops() {
      setLoading(true);
      try {
        const url = searchQuery
          ? `/api/shops?q=${encodeURIComponent(searchQuery)}`
          : '/api/shops';
        const res = await fetch(url);
        const data = await res.json();
        setShops(data.shops ?? []);
      } catch {
        console.warn('[SHOPS] Error fetching shops directory');
      } finally {
        setLoading(false);
      }
    }
    fetchShops();
  }, [searchQuery]);

  const filteredShops = verifiedOnly
    ? shops.filter((s) => s.is_verified || s.profiles?.is_verified)
    : shops;

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
            Campus Merchants ({filteredShops.length})
          </span>
        </div>

        <main className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                Campus &amp; Local Stores Directory
              </h1>
              <p className="text-xs sm:text-sm text-[#667085]">
                Discover verified student businesses, tech vendors, salon stylists, and campus merchants across Enugu.
              </p>
            </div>
            <Link
              href="/create-shop"
              className="inline-flex items-center justify-center gap-1.5 bg-[#087443] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs hover:bg-[#065f37] transition-all whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Storefront</span>
            </Link>
          </div>

          {/* Search & Verified Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-[#667085] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search stores by name, service (e.g. hair, tech, books), or campus location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-9 py-2.5 outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-[#667085] hover:text-[#111111]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  verifiedOnly
                    ? 'bg-[#087443] text-white border-[#087443]'
                    : 'bg-[#FAFAF8] text-[#344054] border-slate-300 hover:border-[#087443]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Stores Only</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShopCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  id={shop.id}
                  name={shop.name}
                  slug={shop.slug}
                  description={shop.description}
                  location={shop.location}
                  is_verified={shop.is_verified || shop.profiles?.is_verified}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="shops"
              title={searchQuery ? `No stores found matching "${searchQuery}"` : 'No Campus Stores Found'}
              description={
                searchQuery
                  ? 'Try searching with different keywords like "phone", "hair", or "books".'
                  : 'Be the first student entrepreneur or merchant to launch your storefront on Enugu Buy & Sell!'
              }
              actionText={searchQuery ? 'Reset Search' : '+ Launch Your Storefront'}
              actionHref={searchQuery ? undefined : '/create-shop'}
              onActionClick={searchQuery ? () => setSearchQuery('') : undefined}
            />
          )}
        </main>
      </div>
    </div>
  );
}


