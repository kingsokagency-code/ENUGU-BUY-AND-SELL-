'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductActions } from '@/components/product/ProductActions';
import { ProductHighlights } from '@/components/product/ProductHighlights';
import { ReportModal } from '@/components/marketplace/ReportModal';
import { trackEvent } from '@/lib/telemetry';
import {
  ChevronRight, ArrowLeft, Flag,
} from 'lucide-react';

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  shop_id?: string;
  images?: string[];
  category_id?: string;
  shops?: {
    id: string;
    name: string;
    slug: string;
    location: string;
    is_verified?: boolean;
    profiles?: {
      id: string;
      full_name: string;
      is_verified?: boolean;
    };
  };
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('This product listing could not be found. It may have been removed or sold.');
            setLoading(false);
            return;
          }
          throw new Error('Product not found');
        }
        const data = await res.json();
        setProduct(data.product);

        trackEvent('product_view', {
          product_id: id,
          name: data.product?.name,
          page_url: window.location.href,
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading product');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <Navbar />

      {/* Loading State */}
      {loading && (
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#087443] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      )}

      {/* Error / Not Found State */}
      {!loading && error && (
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 text-center space-y-4">
          <p className="text-2xl font-bold text-[#0D1F17]">Product Not Found</p>
          <p className="text-sm text-[#6B7C74]">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#087443] text-white text-sm font-bold rounded-xl hover:bg-[#053D24] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Browse
            </Link>
          </div>
        </main>
      )}

      {/* Product Detail */}
      {!loading && !error && product && (
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#6B7C74] flex-wrap">
          <Link href="/" className="hover:text-[#087443] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CB3AA]" />
          <Link href="/browse" className="hover:text-[#087443] transition-colors">Phones & Tablets</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CB3AA]" />
          {product?.shops && (
            <>
              <Link href={`/shops/${product.shops.slug}`} className="hover:text-[#087443] transition-colors">
                {product.shops.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#9CB3AA]" />
            </>
          )}
          <span className="font-semibold text-[#0D1F17] truncate max-w-xs">{product?.name || 'Product Details'}</span>
        </nav>

        {/* Main Product Layout: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 sm:gap-12 items-start">
          {/* Left: Interactive Image Gallery */}
          <div>
            <ProductGallery
              images={product?.images}
              productName={product?.name}
            />
          </div>

          {/* Right: Product Details, Pricing, CTAs & Guarantees */}
          <div>
            {product && (
              <ProductActions
                productId={id}
                name={product.name}
                price={product.price}
                originalPrice={Math.round(product.price * 1.1)}
                inStock={true}
                storeName={product.shops?.name ?? ''}
                storeSlug={product.shops?.slug ?? ''}
                storeRating={4.8}
                storeReviews={0}
                isVerified={product.shops?.is_verified ?? false}
              />
            )}
          </div>
        </div>

        {/* Highlights, Condition, Verification Section */}
        <div className="pt-4 border-t border-[#E5EDE9]">
          <ProductHighlights
            description={product?.description}
            condition={product?.condition}
            location={product?.location}
          />
        </div>

        {/* Report Product Footer Link */}
        <div className="flex justify-end pt-4">
          <button
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-[#9CB3AA] hover:text-red-500 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report this listing to EBS Moderation</span>
          </button>
        </div>
      </main>
      )}

      {/* Report Modal */}
      {product && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="listing"
          targetId={product.id}
          targetName={product.name}
        />
      )}
    </div>
  );
}
