'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductActions } from '@/components/product/ProductActions';
import { ProductHighlights } from '@/components/product/ProductHighlights';
import { ReportModal } from '@/components/marketplace/ReportModal';
import { trackEvent } from '@/lib/telemetry';
import {
  ChevronRight, ArrowLeft, ShieldCheck, Flag,
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
  const router = useRouter();

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
            // Fallback demo product for rich preview
            setProduct({
              id,
              name: 'iPhone 14 Pro Max (256GB • Deep Purple)',
              description: 'Factory unlocked pristine condition Apple iPhone 14 Pro Max. Battery health 98%, includes original fast charger and tempered glass pre-installed. Inspected and backed by Kingsok Gadgets 1-year merchant warranty.',
              price: 980000,
              condition: 'Brand New (Sealed)',
              location: 'UNN Main Campus, Nsukka',
              images: [],
              shops: {
                id: 'shop_1',
                name: 'Kingsok Gadgets',
                slug: 'kingsok-gadgets',
                location: 'UNN Main Campus, Nsukka',
                is_verified: true,
              },
            });
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
            <ProductActions
              productId={id}
              name={product?.name || 'iPhone 14 Pro Max'}
              price={product?.price || 980000}
              originalPrice={product?.price ? Math.round(product.price * 1.1) : 1050000}
              inStock={true}
              storeName={product?.shops?.name || 'Kingsok Gadgets'}
              storeSlug={product?.shops?.slug || 'kingsok-gadgets'}
              storeRating={4.8}
              storeReviews={256}
              isVerified={product?.shops?.is_verified ?? true}
            />
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
