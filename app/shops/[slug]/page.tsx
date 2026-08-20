'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/telemetry';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { EmptyState } from '@/components/marketplace/EmptyState';
import {
  ArrowLeft,
  Store,
  MapPin,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';

interface ShopDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  is_verified?: boolean;
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
  images?: string[];
}

export default function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
          <p className="text-xs font-semibold text-[#667085]">Loading store details...</p>
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

        {/* Shop Profile Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F5EF] text-[#087443] font-black text-2xl flex items-center justify-center shadow-inner border border-[#087443]/15">
                {shop.name.charAt(0)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">{shop.name}</h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#E8F5EF] text-[#087443] px-2.5 py-0.5 rounded-md border border-[#087443]/15">
                      <CheckCircle2 className="w-3 h-3 text-[#087443]" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#667085] flex items-center gap-1.5">
                  <span>Owner: <strong>{shop.profiles?.full_name || 'Campus Merchant'}</strong></span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-[#087443]" />
                    <span>{shop.location || 'Enugu'}</span>
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleShareShop}
              className="bg-white border border-slate-300 hover:border-slate-400 text-[#111111] text-xs font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#087443]" /> : <Share2 className="w-3.5 h-3.5 text-[#667085]" />}
              <span>{copied ? 'Store URL Copied!' : 'Share Store'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#344054] leading-relaxed border-t border-slate-100 pt-3.5">
            {shop.description || 'Welcome to our digital storefront on Enugu Buy & Sell! Browse our products below.'}
          </p>
        </div>

        {/* Shop Product Catalog */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111111]">
              Available Store Items ({products.length})
            </h2>
          </div>

          {products.length > 0 ? (
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
                  shop={{ name: shop.name, slug: shop.slug, is_verified: isVerified }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="products"
              title="No active listings in this shop yet"
              description="This campus store is setting up their catalog. Check back soon for new items!"
            />
          )}
        </div>

      </div>
    </div>
  );
}
