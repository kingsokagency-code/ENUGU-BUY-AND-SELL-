import React from 'react';
import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';

export function SellCTA() {
  return (
    <section className="w-full bg-[#053D24] py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Text */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-[#0A8A50] mb-2 uppercase tracking-widest">For Sellers</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              Turn what you sell into a<br />
              <span className="text-[#FBBF24]">digital storefront.</span>
            </h2>
            <p className="text-sm text-white/65 max-w-sm leading-relaxed">
              Students and campus business owners can create their own store, upload products, manage orders, and reach thousands of buyers on EBS.
            </p>

            <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
              <Link
                href="/create-shop"
                className="inline-flex items-center gap-2 bg-[#FBBF24] text-[#053D24] font-bold px-7 py-3.5 rounded-2xl hover:bg-[#F59E0B] transition-colors text-base"
              >
                <Store className="w-5 h-5" />
                Create Your Store
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl hover:border-white/60 transition-colors text-base"
              >
                Browse Marketplace <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="text-9xl select-none opacity-20 hidden md:block">🛍️</div>
        </div>
      </div>
    </section>
  );
}
