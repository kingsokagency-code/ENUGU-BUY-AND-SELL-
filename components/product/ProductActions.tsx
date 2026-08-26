'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star, ShieldCheck, ShoppingCart, MessageCircle,
  Heart, Share2, Plus, Minus, Check, Lock, Shield, Award,
} from 'lucide-react';
import { DiscountBadge } from '@/components/ebs-ui/Badge';

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
  onAddToCart?: (qty: number) => void;
  onBuyNow?: (qty: number) => void;
}

export function ProductActions({
  productId,
  name,
  price,
  originalPrice = 1050000,
  inStock = true,
  storeName = 'Kingsok Gadgets',
  storeSlug = 'kingsok-gadgets',
  storeRating = 4.8,
  storeReviews = 256,
  isVerified = true,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discountPercent = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
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
            <span>4.9</span>
            <span className="text-[#6B7C74] font-normal">(128 reviews)</span>
          </div>
          <span className="text-[#9CB3AA]">•</span>
          <span className="text-[#6B7C74]">162 sold on campus</span>
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
          <p className="text-[11px] text-[#6B7C74] mt-0.5">Price inclusive of campus escrow protection</p>
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
        <p className="font-bold text-[#0D1F17] mb-2">Highlights & Guarantees</p>
        <div className="flex items-center gap-2 text-[#0D1F17]">
          <Check className="w-4 h-4 text-[#087443] shrink-0" />
          <span>100% Original Certified Device</span>
        </div>
        <div className="flex items-center gap-2 text-[#0D1F17]">
          <Check className="w-4 h-4 text-[#087443] shrink-0" />
          <span>1 Year Warranty & Official Support</span>
        </div>
        <div className="flex items-center gap-2 text-[#0D1F17]">
          <Check className="w-4 h-4 text-[#087443] shrink-0" />
          <span>Fast Delivery within Enugu & UNN/IMT Campuses</span>
        </div>
        <div className="flex items-center gap-2 text-[#0D1F17]">
          <Check className="w-4 h-4 text-[#087443] shrink-0" />
          <span>7 Days Return Policy (Full Money Back)</span>
        </div>
      </div>

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
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              addedToCart
                ? 'bg-[#053D24] text-white'
                : 'bg-[#087443] hover:bg-[#065f35] text-white shadow-[#087443]/20'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}</span>
          </button>

          <Link
            href={`/conversations`}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-[#053D24] hover:bg-[#032817] text-white flex items-center justify-center gap-2 transition-all text-center"
          >
            <span>Buy Now</span>
          </Link>
        </div>
      </div>

      {/* Secondary Actions (Chat / Wishlist / Share) */}
      <div className="flex items-center justify-around py-3 border-y border-[#E5EDE9] text-xs text-[#6B7C74]">
        <Link href={`/conversations`} className="flex items-center gap-1.5 hover:text-[#087443] transition-colors">
          <MessageCircle className="w-4 h-4 text-[#087443]" />
          <span>Chat with Seller</span>
        </Link>
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
          <span className="font-bold text-[#0D1F17]">Secure Payments</span>
          <span className="text-[9px] text-[#9CB3AA]">Protected Escrow</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E5EDE9] flex flex-col items-center gap-1">
          <Shield className="w-4 h-4 text-[#087443]" />
          <span className="font-bold text-[#0D1F17]">Buyer Protection</span>
          <span className="text-[9px] text-[#9CB3AA]">Full refund policy</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E5EDE9] flex flex-col items-center gap-1">
          <Award className="w-4 h-4 text-[#087443]" />
          <span className="font-bold text-[#0D1F17]">Quality Assured</span>
          <span className="text-[9px] text-[#9CB3AA]">Verified Seller</span>
        </div>
      </div>
    </div>
  );
}
