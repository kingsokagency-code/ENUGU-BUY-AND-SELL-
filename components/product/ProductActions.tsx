'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, ShieldCheck, ShoppingCart, MessageCircle,
  Heart, Share2, Plus, Minus, Check, Lock, Shield, Award, AlertCircle,
} from 'lucide-react';
import { DiscountBadge } from '@/components/ebs-ui/Badge';
import { addToCart } from '@/lib/commerce-client';
import { initiateProductConversation } from '@/lib/messaging-client';
import { getCurrentUser } from '@/lib/auth';

interface ProductActionsProps {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  inStock?: boolean;
  storeName?: string;
  storeSlug?: string;
  storeRating?: number;
  storeReviews?: number;
  isVerified?: boolean;
}

export function ProductActions({
  productId,
  name,
  price,
  originalPrice,
  inStock = true,
  storeName = 'Campus Verified Merchant',
  storeSlug = 'store',
  storeRating = 4.8,
  storeReviews = 42,
  isVerified = true,
}: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [initiatingChat, setInitiatingChat] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChatWithSeller = async () => {
    try {
      setInitiatingChat(true);
      setErrorMessage(null);
      const { user } = await getCurrentUser();
      if (!user) {
        router.push(`/auth?redirect=${encodeURIComponent(`/products/${productId}`)}`);
        return;
      }

      const res = await initiateProductConversation(productId);
      if (!res.success || !res.conversation?.id) {
        setErrorMessage(res.error || 'Failed to start chat with seller');
        return;
      }

      router.push(`/conversations/${res.conversation.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Chat connection error';
      setErrorMessage(msg);
    } finally {
      setInitiatingChat(false);
    }
  };

  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    setErrorMessage(null);
    setAddingToCart(true);

    const { user } = await getCurrentUser();
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      setAddingToCart(false);
      return;
    }

    const res = await addToCart(productId, quantity);
    setAddingToCart(false);

    if (res.success) {
      setAddedToCart(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart_updated'));
      }
      setTimeout(() => setAddedToCart(false), 2500);
    } else {
      setErrorMessage(res.error || 'Could not add to cart');
    }
  };

  const handleBuyNow = async () => {
    setErrorMessage(null);
    setAddingToCart(true);

    const { user } = await getCurrentUser();
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      setAddingToCart(false);
      return;
    }

    const res = await addToCart(productId, quantity);
    setAddingToCart(false);

    if (res.success) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart_updated'));
      }
      router.push('/checkout');
    } else {
      setErrorMessage(res.error || 'Could not initiate checkout');
    }
  };

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Title & Reviews */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0D1F17] leading-tight">
          {name}
        </h1>

        <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{storeRating}</span>
            <span className="text-[#6B7C74] font-normal">({storeReviews} reviews)</span>
          </div>
          <span className="text-[#9CB3AA]">•</span>
          <span className="text-[#6B7C74]">Verified on campus</span>
          <span className="text-[#9CB3AA]">•</span>
          <span className={`font-bold ${inStock ? 'text-[#087443]' : 'text-red-500'}`}>
            {inStock ? '● In Stock' : '● Out of Stock'}
          </span>
        </div>
      </div>

      {/* Price Section */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5EDE9] flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-black text-[#087443]">
              ₦{price.toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-[#9CB3AA] line-through font-semibold">
                ₦{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B7C74] mt-0.5">Price protected by Enugu Escrow &amp; Return Guarantee</p>
        </div>

        {discountPercent > 0 && (
          <DiscountBadge percent={discountPercent} />
        )}
      </div>

      {/* Store Info Card */}
      <Link
        href={`/shops/${storeSlug}`}
        className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E5EDE9] hover:border-[#087443]/50 transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#087443] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {storeName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#0D1F17] group-hover:text-[#087443] transition-colors truncate">
                {storeName}
              </span>
              {isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#087443] shrink-0" />}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#6B7C74]">
              <span className="text-amber-500 font-bold">★ {storeRating}</span>
              <span>({storeReviews} reviews)</span>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-[#087443] group-hover:underline shrink-0">
          Visit Store →
        </span>
      </Link>

      {/* Highlights Checklist */}
      <div className="bg-white border border-[#E5EDE9] rounded-2xl p-4 space-y-2 text-xs">
        <p className="font-bold text-[#0D1F17] mb-2">Highlights &amp; Guarantees</p>
        <div className="flex items-center gap-2 text-[#0D1F17]">
          <Check className="w-4 h-4 text-[#087443] shrink-0" />
          <span>Verified Authentic Campus Listing</span>
        </div>
        <div className="flex items-center gap-2 text-[#0D1F17]">
          <Check className="w-4 h-4 text-[#087443] shrink-0" />
          <span>Campus Escrow Safe Exchange Guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-[#0D1F17]">
          <Check className="w-4 h-4 text-[#087443] shrink-0" />
          <span>Direct Meetup / Handover in Enugu</span>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quantity Stepper & Main CTAs */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#0D1F17]">Quantity:</span>
          <div className="flex items-center border border-[#E5EDE9] rounded-xl bg-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-[#6B7C74] hover:text-[#0D1F17] cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-bold text-xs text-[#0D1F17]">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-[#6B7C74] hover:text-[#0D1F17] cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Add to Cart & Buy Now Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              addedToCart
                ? 'bg-[#053D24] text-white'
                : 'bg-[#087443] hover:bg-[#065f35] active:scale-[0.98] text-white shadow-[#087443]/20'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{addedToCart ? 'Added to Cart ✓' : addingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={addingToCart}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-[#053D24] hover:bg-[#032817] active:scale-[0.98] text-white flex items-center justify-center gap-2 transition-all text-center cursor-pointer shadow-md"
          >
            <span>Buy Now →</span>
          </button>
        </div>
      </div>

      {/* Secondary Actions (Chat / Wishlist / Share) */}
      <div className="flex items-center justify-around py-3 border-y border-[#E5EDE9] text-xs text-[#6B7C74]">
        <button
          onClick={handleChatWithSeller}
          disabled={initiatingChat}
          className="flex items-center gap-1.5 hover:text-[#087443] transition-colors cursor-pointer disabled:opacity-50"
        >
          <MessageCircle className="w-4 h-4 text-[#087443]" />
          <span>{initiatingChat ? 'Connecting...' : 'Chat with Seller'}</span>
        </button>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
            isWishlisted ? 'text-red-500 font-bold' : 'hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-[#087443] transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-[#087443]" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* 3 Trust Badges Footer */}
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[#6B7C74]">
        <div className="p-2.5 rounded-xl bg-white border border-[#E5EDE9] flex flex-col items-center gap-1">
          <Lock className="w-4 h-4 text-[#087443]" />
          <span className="font-bold text-[#0D1F17]">Escrow Safe</span>
          <span className="text-[9px] text-[#9CB3AA]">Funds Protected</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E5EDE9] flex flex-col items-center gap-1">
          <Shield className="w-4 h-4 text-[#087443]" />
          <span className="font-bold text-[#0D1F17]">Verified Stores</span>
          <span className="text-[9px] text-[#9CB3AA]">Enugu Merchants</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E5EDE9] flex flex-col items-center gap-1">
          <Award className="w-4 h-4 text-[#087443]" />
          <span className="font-bold text-[#0D1F17]">Quality First</span>
          <span className="text-[9px] text-[#9CB3AA]">Authentic Goods</span>
        </div>
      </div>
    </div>
  );
}

export default ProductActions;
