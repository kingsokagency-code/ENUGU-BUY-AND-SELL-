'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Laptop,
  BookOpen,
  Shirt,
  Utensils,
  Tv,
  Wrench,
  Armchair,
  Package,
  Store,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  condition?: string;
  location?: string;
  categorySlug?: string;
  imageUrl?: string | null;
  shop?: {
    name: string;
    slug: string;
    is_verified?: boolean;
  };
}

/**
 * Category-aware fallback icon mapping
 */
function getCategoryIcon(slug?: string) {
  const normalized = (slug || '').toLowerCase();
  if (normalized.includes('phone')) return <Smartphone className="w-8 h-8 text-[#087443]/60" />;
  if (normalized.includes('laptop')) return <Laptop className="w-8 h-8 text-[#087443]/60" />;
  if (normalized.includes('book')) return <BookOpen className="w-8 h-8 text-[#087443]/60" />;
  if (normalized.includes('fashion') || normalized.includes('cloth')) return <Shirt className="w-8 h-8 text-[#087443]/60" />;
  if (normalized.includes('food') || normalized.includes('kitchen')) return <Utensils className="w-8 h-8 text-[#087443]/60" />;
  if (normalized.includes('appliance') || normalized.includes('electronic')) return <Tv className="w-8 h-8 text-[#087443]/60" />;
  if (normalized.includes('furniture')) return <Armchair className="w-8 h-8 text-[#087443]/60" />;
  if (normalized.includes('service')) return <Wrench className="w-8 h-8 text-[#087443]/60" />;
  return <Package className="w-8 h-8 text-[#087443]/60" />;
}

export function ProductCard({
  id,
  name,
  price,
  condition = 'Used',
  location = 'Enugu',
  categorySlug,
  imageUrl,
  shop,
}: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-[#087443]/40 hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      <Link href={`/products/${id}`} className="flex flex-col h-full">
        {/* Media / Fallback Area (4:3 Aspect Ratio) */}
        <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-[#E8F5EF]/70 via-[#F2F4F7] to-[#E8F5EF]/40 overflow-hidden flex items-center justify-center border-b border-slate-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5 select-none">
              <div className="w-12 h-12 rounded-xl bg-white/80 shadow-xs flex items-center justify-center">
                {getCategoryIcon(categorySlug || name)}
              </div>
              <span className="text-[10px] font-semibold text-[#667085] tracking-tight">
                Listing photo preview
              </span>
            </div>
          )}

          {/* Floating Condition Tag (Top Left) */}
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-white/95 backdrop-blur-xs text-[#087443] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-100/60">
              {condition}
            </span>
          </div>

          {/* Floating Location Tag (Top Right) */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#111111]/75 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            <MapPin className="w-2.5 h-2.5" />
            <span className="truncate max-w-[80px]">{location}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between space-y-2.5">
          <div className="space-y-1">
            {/* Bold Price Hierarchy */}
            <div className="text-[17px] sm:text-[18px] font-black text-[#087443] tracking-tight leading-tight">
              ₦{Number(price).toLocaleString()}
            </div>

            {/* Product Title */}
            <h3 className="text-[13px] sm:text-[14px] font-bold text-[#111111] line-clamp-2 leading-snug group-hover:text-[#087443] transition-colors">
              {name}
            </h3>
          </div>

          {/* Seller Trust Footnote */}
          {shop && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#667085]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Store className="w-3.5 h-3.5 text-[#087443] shrink-0" />
                <span className="text-[11px] font-semibold text-[#475467] truncate">
                  {shop.name}
                </span>
              </div>

              {shop.is_verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#087443] bg-[#E8F5EF] px-1.5 py-0.5 rounded-md shrink-0 border border-[#087443]/15">
                  <CheckCircle2 className="w-3 h-3 text-[#087443]" />
                  <span>Verified</span>
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
