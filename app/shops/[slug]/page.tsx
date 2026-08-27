'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { StoreHero } from '@/components/storefront/StoreHero';
import { StoreTabNav, StoreTab } from '@/components/storefront/StoreTabNav';
import { StoreTrustBar } from '@/components/storefront/StoreTrustBar';
import { ProductCard, ProductCardData } from '@/components/ebs-ui/ProductCard';
import { EmptyState } from '@/components/ebs-ui/EmptyState';
import { ReportModal } from '@/components/marketplace/ReportModal';
import { trackEvent } from '@/lib/telemetry';
import {
  Search, Flag, Share2, Check, Package,
  ArrowLeft, Star, Phone, MessageSquare,
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
    whatsapp_number?: string;
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

const DEMO_FALLBACK_PRODUCTS: ProductCardData[] = [
  { id: '1', name: 'iPhone 14 Pro Max 256GB Deep Purple', price: 980000, originalPrice: 1050000, rating: 4.9, reviewCount: 128, seller: { name: 'Kingsok Gadgets', slug: 'kingsok-gadgets', is_verified: true } },
  { id: '2', name: 'Samsung Galaxy S23 Ultra 512GB', price: 720000, originalPrice: 800000, rating: 4.8, reviewCount: 84, seller: { name: 'Kingsok Gadgets', slug: 'kingsok-gadgets', is_verified: true } },
  { id: '3', name: 'MacBook Air M2 8GB/256GB Space Gray', price: 1250000, originalPrice: 1350000, rating: 5.0, reviewCount: 42, seller: { name: 'Kingsok Gadgets', slug: 'kingsok-gadgets', is_verified: true } },
  { id: '4', name: 'AirPods Pro 2nd Gen with MagSafe', price: 180000, originalPrice: 220000, rating: 4.7, reviewCount: 95, seller: { name: 'Kingsok Gadgets', slug: 'kingsok-gadgets', is_verified: true } },
  { id: '5', name: 'Apple Watch Series 8 GPS 45mm', price: 450000, originalPrice: 500000, rating: 4.8, reviewCount: 31, seller: { name: 'Kingsok Gadgets', slug: 'kingsok-gadgets', is_verified: true } },
];

export default function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<StoreTab>('home');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function loadShop() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/shops/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          if (res.status === 404) {
            // Demo fallback if shop not found in database
            setShop({
              id: 'demo_shop_1',
              name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              slug,
              description: 'Official verified student and merchant storefront on Enugu Buy & Sell. Fast campus delivery and certified authentic products.',
              location: 'UNN Main Campus, Nsukka',
              is_verified: true,
              created_at: new Date().toISOString(),
            });
            setProducts([]);
            setLoading(false);
            return;
          }
          throw new Error('Failed to load shop details');
        }
        const data = await res.json();
        setShop(data.shop);
        setProducts(data.products || []);

        trackEvent('shop_view', {
          shop_id: data.shop?.id,
          slug,
          page_url: window.location.href,
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading shop');
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, [slug]);

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayProducts: ProductCardData[] = products.length > 0
    ? products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        images: p.images,
        condition: p.condition,
        location: p.location,
        seller: { name: shop?.name || 'Store', slug, is_verified: shop?.is_verified },
      }))
    : DEMO_FALLBACK_PRODUCTS;

  const filteredProducts = displayProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <Navbar />

      {/* Store Hero Banner */}
      <StoreHero
        id={shop?.id}
        name={shop?.name || 'Kingsok Gadgets'}
        category="Electronics · Phones · Accessories"
        description={shop?.description}
        location={shop?.location}
        isVerified={shop?.is_verified ?? true}
        slug={slug}
        featuredProductId={products[0]?.id}
      />

      {/* Sticky Tab Navigation */}
      <StoreTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        productsCount={filteredProducts.length}
      />

      {/* Store Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CB3AA]" />
            <input
              type="text"
              placeholder={`Search in ${shop?.name || 'store'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5EDE9] bg-white text-xs text-[#0D1F17] focus:outline-none focus:border-[#087443] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5EDE9] text-xs font-semibold text-[#0D1F17] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#087443]" /> : <Share2 className="w-3.5 h-3.5 text-[#6B7C74]" />}
              <span>{copied ? 'Link Copied' : 'Share Store'}</span>
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Store Home & Featured Products */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Featured Products Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0D1F17]">Featured Products</h2>
                  <p className="text-xs text-[#6B7C74]">Top recommendations from this merchant</p>
                </div>
                <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-[#087443] hover:underline">
                  View all ({filteredProducts.length}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {filteredProducts.slice(0, 5).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>

            {/* 4-Pillar Trust Bar */}
            <StoreTrustBar />

            {/* All Store Inventory Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#0D1F17]">All Products</h2>
                <span className="text-xs text-[#6B7C74]">{filteredProducts.length} items available</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Products Catalog */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#0D1F17]">Products ({filteredProducts.length})</h2>
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Package className="w-12 h-12 text-[#9CB3AA]" />}
                title="No products found"
                description="Try clearing your search query."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Categories */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['Phones & Tablets (18)', 'Laptops & Computers (8)', 'Audio & Accessories (10)'].map((c) => (
              <div key={c} className="p-5 rounded-2xl bg-white border border-[#E5EDE9] hover:border-[#087443] transition-colors cursor-pointer">
                <p className="font-bold text-sm text-[#0D1F17]">{c}</p>
                <p className="text-xs text-[#087443] font-semibold mt-1">Browse Category →</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-[#E5EDE9] p-6 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#E5EDE9]">
              <div className="text-center">
                <p className="text-3xl font-black text-[#0D1F17]">4.8</p>
                <div className="flex text-amber-400 text-xs my-1 justify-center">★★★★★</div>
                <p className="text-[11px] text-[#6B7C74]">Based on 2,315 reviews</p>
              </div>
              <div className="h-12 w-px bg-[#E5EDE9]" />
              <p className="text-xs text-[#6B7C74]">
                99% of campus buyers would recommend this verified merchant for fast delivery and genuine items.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Chukwuebuka N.', review: 'Got my iPhone 14 Pro Max delivered right to Franco Hostel in less than 2 hours. Very clean device!', rating: 5, date: '2 days ago' },
                { name: 'Amarachi O.', review: 'Original AirPods verified with Apple serial check. Smooth WhatsApp communication too.', rating: 5, date: '1 week ago' },
              ].map((r, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#F8FAF9] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0D1F17]">{r.name}</span>
                    <span className="text-[#9CB3AA]">{r.date}</span>
                  </div>
                  <div className="text-amber-400 text-xs">{'★'.repeat(r.rating)}</div>
                  <p className="text-xs text-[#6B7C74]">{r.review}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: About */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-[#E5EDE9] p-6 space-y-4 max-w-2xl">
            <h2 className="text-base font-bold text-[#0D1F17]">About {shop?.name}</h2>
            <p className="text-xs text-[#6B7C74] leading-relaxed">
              {shop?.description || 'Kingsok Gadgets is a verified electronics provider on Enugu Buy & Sell. We specialize in flagship mobile phones, laptops, and student tech accessories with guaranteed quality and campus delivery.'}
            </p>
            <div className="pt-4 border-t border-[#E5EDE9] space-y-2 text-xs text-[#6B7C74]">
              <p><strong className="text-[#0D1F17]">Location:</strong> {shop?.location || 'UNN Main Campus, Nsukka'}</p>
              <p><strong className="text-[#0D1F17]">Seller Status:</strong> Verified Merchant (EBS Certified)</p>
              <p><strong className="text-[#0D1F17]">Member Since:</strong> 2024</p>
            </div>
          </div>
        )}
      </main>

      {/* Report Store Modal */}
      {shop && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="seller"
          targetId={shop.id}
          targetName={shop.name}
        />
      )}
    </div>
  );
}
