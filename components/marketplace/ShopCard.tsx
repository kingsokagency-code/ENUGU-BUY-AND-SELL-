'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export interface ShopCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  is_verified?: boolean;
  productCount?: number;
}

export function ShopCard({
  name,
  slug,
  description,
  location = 'Enugu',
  is_verified = false,
  productCount,
}: ShopCardProps) {
  const initial = name.trim().charAt(0).toUpperCase() || 'S';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-[#087443]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full"
    >
      <Link href={`/shops/${slug}`} className="flex flex-col h-full justify-between space-y-4">
        <div className="space-y-3">
          {/* Header Row: Monogram + Verification Badge */}
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#087443] font-black text-lg flex items-center justify-center shadow-inner border border-[#087443]/15">
              {initial}
            </div>

            {is_verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#087443] bg-[#E8F5EF] px-2.5 py-1 rounded-md border border-[#087443]/15">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Shop Title & Description */}
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#111111] group-hover:text-[#087443] transition-colors leading-snug">
              {name}
            </h3>
            <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
              {description || 'Campus digital storefront in Enugu.'}
            </p>
          </div>
        </div>

        {/* Footer Meta Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#667085]">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 text-[#087443] shrink-0" />
            <span className="truncate max-w-[120px]">{location}</span>
          </div>

          <div className="flex items-center gap-1 text-[#087443] font-semibold text-xs group-hover:translate-x-0.5 transition-transform shrink-0">
            {typeof productCount === 'number' && (
              <span className="text-[#667085] font-normal mr-1">{productCount} items •</span>
            )}
            <span>Visit</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
