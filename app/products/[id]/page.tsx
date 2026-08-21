'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { trackEvent } from '@/lib/telemetry';
import { ReportModal } from '@/components/marketplace/ReportModal';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  MessageCircle,
  Share2,
  AlertTriangle,
  Package,
  Check,
  ShieldCheck,
  Flag,
} from 'lucide-react';

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  shop_id: string;
  images?: string[];
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
  const searchParams = useSearchParams();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat initiation states
  const [messaging, setMessaging] = useState(false);
  const [chatSuccess, setChatSuccess] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // Share state & Report Modal
  const [copied, setCopied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // share_landing telemetry: fire once on mount if ?ref=share is present
  useEffect(() => {
    if (searchParams.get('ref') === 'share') {
      trackEvent('share_landing', { object_type: 'product', object_id: id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (!res.ok || !data.product) {
          setError(data.error || 'Product not found');
        } else {
          setProduct(data.product);
          // Telemetry
          trackEvent('product_view', { product_id: data.product.id, shop_id: data.product.shop_id });
        }
      } catch {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleMessageSeller = async () => {
    if (!product) return;
    setMessaging(true);
    setChatError(null);
    setChatSuccess(null);

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setChatError('Please sign in with your phone number to message the seller.');
      } else if (!res.ok) {
        setChatError(data.error || 'Failed to initiate conversation');
      } else if (data.conversation?.id) {
        trackEvent('conversation_started', {
          product_id: product.id,
          seller_id: product.shops?.profiles?.id,
        });
        // Route directly into the active product chat thread
        router.push(`/conversations/${data.conversation.id}`);
      }
    } catch {
      setChatError('Connection error while initiating conversation');
    } finally {
      setMessaging(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = window.location.href;

    trackEvent('share', { object_type: 'product', object_id: product.id });

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} for ₦${Number(product.price).toLocaleString()} on Enugu Buy & Sell!`,
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
          <p className="text-xs font-semibold text-[#667085]">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 py-16 flex items-center justify-center">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-base font-bold text-[#111111]">Product Not Found</h1>
          <p className="text-xs text-[#667085]">{error || 'This listing does not exist or has been archived.'}</p>
          <Link href="/browse" className="inline-flex items-center gap-1.5 bg-[#087443] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Browse</span>
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = product.shops?.is_verified || product.shops?.profiles?.is_verified;

  return (
    <div className="text-[#111111] px-4 py-6 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <span className="text-xs font-semibold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#087443]/15">
            Campus Listing
          </span>
        </div>

        <main className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          {/* Image Area */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gradient-to-br from-[#E8F5EF]/70 via-[#F2F4F7] to-[#E8F5EF]/40 flex items-center justify-center border-b border-slate-200/90 overflow-hidden">
            {product.images && product.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 text-center p-6 select-none">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xs flex items-center justify-center border border-[#087443]/15">
                  <Package className="w-9 h-9 text-[#087443]/70" />
                </div>
                <span className="text-xs font-semibold text-[#667085]">
                  Verified campus item listing
                </span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* Title & Price Header */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#087443] bg-[#E8F5EF] px-2.5 py-1 rounded-md border border-[#087443]/15">
                  Condition: {product.condition || 'Used'}
                </span>
                <div className="flex items-center gap-1 text-xs text-[#667085]">
                  <MapPin className="w-3.5 h-3.5 text-[#087443]" />
                  <span>{product.location || 'Enugu'}</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#111111] leading-snug">
                {product.name}
              </h1>

              <div className="text-2xl sm:text-3xl font-black text-[#087443] tracking-tight">
                ₦{Number(product.price).toLocaleString()}
              </div>
            </div>

            {/* Shop & Seller Identity (Trust Card) */}
            {product.shops && (
              <div className="bg-[#FAFAF8] border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5EF] text-[#087443] font-black flex items-center justify-center text-lg shrink-0 border border-[#087443]/15">
                    {product.shops.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-[#111111] truncate">{product.shops.name}</h3>
                      {isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#E8F5EF] text-[#087443] px-2 py-0.5 rounded-md shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[#087443]" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-[#087443] shrink-0" />
                      <span>{product.shops.location || 'Enugu'}</span>
                    </p>
                  </div>
                </div>

                <Link
                  href={`/shops/${product.shops.slug}`}
                  className="text-xs font-bold text-[#087443] hover:underline shrink-0 whitespace-nowrap"
                >
                  Visit Store &rarr;
                </Link>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Description</h2>
              <p className="text-sm text-[#344054] leading-relaxed whitespace-pre-line">
                {product.description || 'No additional description provided for this listing.'}
              </p>
            </div>

            {/* Campus Safety & Inspection Checklist Card */}
            <div className="bg-[#FAFAF8] border border-slate-200/90 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                <ShieldCheck className="w-4 h-4 text-[#087443]" />
                <span>Campus Inspection &amp; Safety Guidelines</span>
              </div>
              <ul className="text-xs text-[#667085] space-y-1 pl-6 list-disc">
                <li>Meet in public campus areas (UNEC Library, SUB, Faculty buildings).</li>
                <li>Inspect and test the item thoroughly before making payment.</li>
                <li>Never send advance deposits or wire transfers before inspecting.</li>
              </ul>
            </div>

            {/* Action Feedback Messages */}
            {chatSuccess && (
              <div className="bg-[#E8F5EF] border border-[#087443]/30 text-[#087443] text-xs p-4 rounded-xl font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-[#087443]" />
                <span>{chatSuccess}</span>
              </div>
            )}

            {chatError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl font-medium flex items-center justify-between gap-2">
                <span>{chatError}</span>
                {chatError.includes('sign in') && (
                  <Link
                    href={`/auth?redirect=/products/${product.id}`}
                    className="bg-[#087443] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                  >
                    Sign In Now
                  </Link>
                )}
              </div>
            )}

            {/* Primary Action Buttons (Desktop / In-Flow) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleMessageSeller}
                disabled={messaging}
                className="flex-1 bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{messaging ? 'Connecting to Merchant...' : 'Message Merchant'}</span>
              </button>

              <button
                onClick={handleShare}
                className="bg-white border border-slate-300 hover:border-slate-400 text-[#111111] font-semibold text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-[#667085]" />
                <span>{copied ? 'Link Copied!' : 'Share Item'}</span>
              </button>
            </div>

            {/* Report Listing Trigger */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Flag className="w-3 h-3" />
                <span>Report this listing</span>
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* Sticky Mobile Bottom Contact CTA Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-20 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 px-4 flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#667085] truncate">Price</div>
          <div className="text-base font-black text-[#087443] tracking-tight">
            ₦{Number(product.price).toLocaleString()}
          </div>
        </div>

        <button
          onClick={handleMessageSeller}
          disabled={messaging}
          className="bg-[#087443] hover:bg-[#065f37] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{messaging ? 'Connecting...' : 'Message Merchant'}</span>
        </button>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="listing"
        targetId={product.id}
        targetName={product.name}
      />
    </div>
  );
}

