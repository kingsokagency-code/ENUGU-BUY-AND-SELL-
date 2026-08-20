'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShopCard } from '@/components/marketplace/ShopCard';
import { ShopCardSkeleton } from '@/components/marketplace/SkeletonCard';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { Plus, ArrowLeft } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShops() {
      setLoading(true);
      try {
        const res = await fetch('/api/shops');
        const data = await res.json();
        setShops(data.shops ?? []);
      } catch {
        console.warn('[SHOPS] Error fetching shops directory');
      } finally {
        setLoading(false);
      }
    }
    fetchShops();
  }, []);

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
            Campus Merchants
          </span>
        </div>

        <main className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                Campus &amp; Local Stores Directory
              </h1>
              <p className="text-xs sm:text-sm text-[#667085]">
                Explore persistent digital storefronts created by UNEC student sellers and local merchants across Enugu.
              </p>
            </div>
            <Link
              href="/create-shop"
              className="inline-flex items-center justify-center gap-1.5 bg-[#087443] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:bg-[#065f37] transition-all whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your Shop</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShopCardSkeleton key={i} />
              ))}
            </div>
          ) : shops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => (
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
              title="No Campus Stores Created Yet"
              description="Be the first student entrepreneur or merchant to launch your storefront on Enugu Buy & Sell!"
              actionText="+ Launch Your Storefront"
              actionHref="/create-shop"
            />
          )}
        </main>
      </div>
    </div>
  );
}

