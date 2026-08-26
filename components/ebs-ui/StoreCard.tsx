'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Package } from 'lucide-react';
import { Avatar } from './Avatar';

export interface StoreCardData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  productCount?: number;
  followerCount?: number;
  is_verified?: boolean;
  logo_url?: string;
}

interface StoreCardProps {
  store: StoreCardData;
  compact?: boolean;
  showFollow?: boolean;
  dark?: boolean;
  className?: string;
}

export function StoreCard({ store, compact = false, showFollow = true, dark = false, className = '' }: StoreCardProps) {
  const {
    name, slug, description, location, category,
    rating, reviewCount, productCount, is_verified, logo_url,
  } = store;

  const bg     = dark ? 'bg-[#1A2820] border-[#243320]' : 'bg-white border-[#E5EDE9]';
  const muted  = dark ? 'text-[#6B9980]' : 'text-[#6B7C74]';
  const text   = dark ? 'text-white' : 'text-[#0D1F17]';

  return (
    <Link
      href={`/shops/${slug}`}
      className={`flex ${compact ? 'flex-row items-center gap-3' : 'flex-col'} rounded-2xl border p-3 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(5,61,36,0.12)] hover:-translate-y-0.5 ${bg} ${className}`}
    >
      <Avatar name={name} src={logo_url} size={compact ? 'md' : 'lg'} dark={dark} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={`font-semibold text-sm leading-snug truncate ${text}`}>{name}</span>
          {is_verified && <ShieldCheck className="w-3.5 h-3.5 text-[#087443] shrink-0" />}
        </div>

        {category && <p className={`text-xs ${muted} truncate`}>{category}</p>}

        {!compact && description && (
          <p className={`text-xs ${muted} mt-1 line-clamp-2`}>{description}</p>
        )}

        <div className={`flex items-center gap-2 mt-1.5 flex-wrap`}>
          {rating !== undefined && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-current" />
              {rating.toFixed(1)}
              {reviewCount && <span className={`font-normal ${muted}`}>({reviewCount})</span>}
            </span>
          )}
          {productCount !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs ${muted}`}>
              <Package className="w-3 h-3" />
              {productCount} products
            </span>
          )}
          {location && <span className={`text-xs ${muted} truncate`}>{location}</span>}
        </div>
      </div>

      {showFollow && !compact && (
        <button
          onClick={e => { e.preventDefault(); }}
          className="mt-2 self-start text-xs font-semibold text-[#087443] border border-[#087443] px-3 py-1.5 rounded-lg hover:bg-[#087443] hover:text-white transition-colors"
        >
          Follow
        </button>
      )}
    </Link>
  );
}
