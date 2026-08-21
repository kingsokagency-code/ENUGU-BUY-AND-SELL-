'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/telemetry';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { ReportModal } from '@/components/marketplace/ReportModal';
import {
  ArrowLeft,
  Store,
  MapPin,
  CheckCircle2,
  Share2,
  Check,
  Package,
  Search,
  Flag,
  Calendar,
} from 'lucide-react';

interface ShopDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  is_verified?: boolean;
  created_at?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  condition: string;
  location: string;
  category_id?: string;
  images?: string[];
}

export default function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function loadShop() {
      setLoading(true);
      try {
        const res = await fetch(`/api/shops/${slug}`);
        const data = await res.json();
        if (!res.ok || !data.shop) {
          setError(data.error || 'Shop not found');
        } else {
          setShop(data.shop);
          setProducts(data.products ?? []);
          // Telemetry
          trackEvent('shop_view', { shop_id: data.shop.id, slug: data.shop.slug });
        }
      } catch {
        setError('Failed to load shop details');
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [slug]);

  const handleShareShop = async () => {
    if (!shop) return;
    const shareUrl = window.location.href;

    trackEvent('share', { object_type: 'shop', object_id: shop.id });

    if (navigator.share) {
      try {
        await navigator.share({
          title: shop.name,
          text: `Check out ${shop.name} on Enugu Buy & Sell!`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-3 border-[#087443] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#667085]">Loading store catalog...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="p-4 py-16 flex items-center justify-center">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-base font-bold text-[#111111]">Store Not Found</h1>
          <p className="text-xs text-[#667085]">{error || 'This storefront does not exist or has been removed.'}</p>
          <Link href="/shops" className="inline-flex items-center gap-1.5 bg-[#087443] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stores</span>
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = shop.is_verified || shop.profiles?.is_verified;

  // Filter products by internal storefront search
  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="text-[#111111] px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/shops" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stores Directory</span>
          </Link>
          <span className="text-xs font-semibold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#087443]/15">
            Campus Storefront
          </span>
        </div>

        {/* Authoritative Emerald Storefront Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="h-28 sm:h-36 bg-gradient-to-r from-[#053D24] via-[#087443] to-[#0A8A50] relative p-4 flex items-end">
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleShareShop}
                className="bg-white/90 hover:bg-white text-[#111111] text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#087443]" /> : <Share2 className="w-3.5 h-3.5 text-[#667085]" />}
                <span>{copied ? 'Copied' : 'Share Store'}</span>
              </button>
            </div>
          </div>

          <div className="px-5 pb-6 pt-0 relative space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
              <div className="flex items-end gap-3.5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white text-[#087443] font-black text-3xl sm:text-4xl flex items-center justify-center shadow-md border-4 border-white shrink-0">
                  {shop.name.charAt(0)}
                </div>
                <div className="space-y-1 pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">{shop.name}</h1>
                    {isVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#E8F5EF] text-[#087443] px-2 py-0.5 rounded-md border border-[#087443]/15">
                        <CheckCircle2 className="w-3 h-3 text-[#087443]" />
                        <span>Verified Merchant</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#667085] flex-wrap">
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-[#087443]" />
                      <span>{shop.location || 'Enugu'}</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Package className="w-3 h-3 text-[#087443]" />
                      <span>{products.length} Active {products.length === 1 ? 'Listing' : 'Listings'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#344054] leading-relaxed border-t border-slate-100 pt-3">
              {shop.description || 'Welcome to our digital storefront on Enugu Buy & Sell! Browse our active catalog below.'}
            </p>

            <div className="flex items-center justify-between text-xs text-[#667085] pt-1">
              <span className="flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Merchant: <strong>{shop.profiles?.full_name || 'Student Entrepreneur'}</strong></span>
              </span>

              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Flag className="w-3 h-3" />
                <span>Report Storefront</span>
              </button>
            </div>
          </div>
        </div>

        {/* Store Catalog Search & Items */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#111111]">
              Catalog Inventory ({filteredProducts.length})
            </h2>

            {products.length > 3 && (
              <div className="relative w-full sm:w-64 flex items-center">
                <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search inside this store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-[#087443] text-xs text-[#111111] rounded-xl pl-8 pr-3 py-2 outline-none font-medium"
                />
              </div>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  condition={p.condition}
                  location={p.location}
                  imageUrl={p.images?.[0]}
                  shop={{ name: shop.name, slug: shop.slug, is_verified: isVerified }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="products"
              title={searchQuery ? `No items in this shop matching "${searchQuery}"` : 'Storefront Inventory is Empty'}
              description={
                searchQuery
                  ? 'Try searching with different item keywords.'
                  : 'This merchant currently has no active products listed in their catalog.'
              }
              actionText={searchQuery ? 'Reset Search' : 'Browse All Marketplace Items'}
              actionHref={searchQuery ? undefined : '/browse'}
              onActionClick={searchQuery ? () => setSearchQuery('') : undefined}
            />
          )}
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="seller"
        targetId={shop.id}
        targetName={shop.name}
      />
    </div>
  );
}
