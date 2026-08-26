'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck } from 'lucide-react';
import { DiscountBadge } from './Badge';

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  condition?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  discount?: number;
  seller?: { name: string; slug: string; is_verified?: boolean };
  inStock?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  compact?: boolean;
  dark?: boolean;
  className?: string;
}

function formatNaira(n: number) {
  return `₦${n.toLocaleString('en-NG')}`;
}

export function ProductCard({ product, compact = false, dark = false, className = '' }: ProductCardProps) {
  const {
    id, name, price, originalPrice, images, rating, reviewCount,
    discount, seller, inStock = true,
  } = product;

  const img = images?.[0];
  const discountPct = discount ?? (originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : undefined);

  const bg     = dark ? 'bg-[#1A2820] border-[#243320] text-white' : 'bg-white border-[#E5EDE9] text-[#0D1F17]';
  const muted  = dark ? 'text-[#6B9980]' : 'text-[#6B7C74]';
  const shadow = 'shadow-[0_1px_4px_rgba(5,61,36,0.08)] hover:shadow-[0_4px_16px_rgba(5,61,36,0.12)]';

  return (
    <Link href={`/products/${id}`} className={`block rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${bg} ${shadow} ${className}`}>
      {/* Image */}
      <div className="relative aspect-square bg-[#F0FBF4] overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#087443]/20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm0 12H4V9h16v10zM12 6a3 3 0 100-6 3 3 0 000 6z"/>
            </svg>
          </div>
        )}
        {discountPct && (
          <div className="absolute top-2 left-2">
            <DiscountBadge percent={discountPct} />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-lg">Out of stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`p-3 ${compact ? 'p-2' : 'p-3'}`}>
        <p className="text-sm font-medium leading-snug line-clamp-2 mb-1">{name}</p>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-base font-bold text-[#087443]">{formatNaira(price)}</span>
          {originalPrice && (
            <span className={`text-xs line-through ${muted}`}>{formatNaira(originalPrice)}</span>
          )}
        </div>

        {!compact && (
          <div className="flex items-center justify-between">
            {rating !== undefined ? (
              <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                <Star className="w-3 h-3 fill-current" />
                {rating.toFixed(1)}
                {reviewCount && <span className={`font-normal ${muted}`}>({reviewCount})</span>}
              </span>
            ) : <span />}

            {seller && (
              <span className={`text-[10px] flex items-center gap-0.5 ${muted}`}>
                {seller.is_verified && <ShieldCheck className="w-3 h-3 text-[#087443]" />}
                {seller.name}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
