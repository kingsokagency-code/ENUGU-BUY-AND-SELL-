import React from 'react';
import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';

export function SellCTA() {
  return (
    <section className="w-full max-w-full bg-[#053D24] py-10 sm:py-12 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Text */}
          <div className="text-center md:text-left">
            <p className="text-xs sm:text-sm font-semibold text-[#0A8A50] mb-1.5 uppercase tracking-widest">For Sellers</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2.5">
              Turn what you sell into a<br />
              <span className="text-[#FBBF24]">digital storefront.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/65 max-w-sm leading-relaxed">
              Students and campus business owners can create their own store, upload products, manage orders, and reach thousands of buyers on EBS.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 justify-center md:justify-start">
              <Link
                href="/create-shop"
                className="inline-flex items-center justify-center gap-2 bg-[#FBBF24] text-[#053D24] font-bold px-6 py-3.5 rounded-2xl hover:bg-[#F59E0B] transition-colors text-sm sm:text-base"
              >
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Your Store
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/30 text-white font-semibold px-6 py-3.5 rounded-2xl hover:border-white/60 transition-colors text-sm sm:text-base"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="text-7xl sm:text-9xl select-none opacity-20 hidden md:block">🛍️</div>
        </div>
      </div>
    </section>
  );
}

export default SellCTA;
