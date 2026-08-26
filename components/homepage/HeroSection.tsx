'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, Package, Clock, ShoppingBag, Store } from 'lucide-react';

const stats = [
  { icon: <Users className="w-4 h-4" />, value: '10K+',  label: 'Happy Users' },
  { icon: <Store className="w-4 h-4" />,  value: '500+',  label: 'Verified Stores' },
  { icon: <Package className="w-4 h-4" />, value: '50K+', label: 'Products' },
  { icon: <Clock className="w-4 h-4" />,   value: '24/7',  label: 'Support' },
];

/** Floating product tile for the hero right panel */
function FloatingProductTile({
  name, price, rating, color,
}: {
  name: string; price: string; rating: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(5,61,36,0.14)] p-3.5 flex items-center gap-3 w-full transition-transform hover:scale-101">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <ShoppingBag className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#0D1F17] truncate">{name}</p>
        <p className="text-sm font-black text-[#087443]">{price}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[11px] text-amber-500 font-bold">⭐ {rating}</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="w-full bg-white border-b border-[#E5EDE9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* LEFT — Copy */}
          <div className="flex flex-col gap-4 sm:gap-5 text-left">
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#087443] bg-[#E8F8EF] px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4" />
              Enugu&apos;s #1 Campus Marketplace
            </span>

            <h1 className="text-2.5xl sm:text-4xl lg:text-5xl font-black text-[#053D24] leading-[1.12] tracking-tight">
              Discover.{' '}
              <span className="text-[#FBBF24]">Buy.</span>{' '}
              <span className="text-[#F97316]">Sell.</span>
              <br />
              Grow on Campus.
            </h1>

            <p className="text-sm sm:text-base text-[#6B7C74] leading-relaxed max-w-md">
              Find trusted products, verified campus stores and amazing deals around you. Safe, fast, and 100% local.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-[#E5EDE9]/70 my-1">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-[#087443] shrink-0">{s.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#053D24] leading-none">{s.value}</p>
                    <p className="text-[10px] text-[#9CB3AA] truncate mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 bg-[#087443] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#065f35] active:scale-98 transition-all shadow-lg shadow-[#087443]/20 text-sm sm:text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Link>
              <Link
                href="/create-shop"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-[#087443] text-[#087443] font-bold px-7 py-3.5 rounded-2xl hover:bg-[#087443] hover:text-white active:scale-98 transition-all text-sm sm:text-base"
              >
                <Store className="w-5 h-5" />
                Sell on EBS
              </Link>
            </div>
          </div>

          {/* RIGHT — Floating product cards showcase */}
          <div className="relative flex flex-col gap-3 lg:pl-4">
            {/* Decorative background container */}
            <div className="bg-gradient-to-br from-[#F0FBF4] via-[#E8F8EF] to-[#DEF3E7] rounded-3xl p-4 sm:p-6 border border-[#C5DDD2]/50 shadow-sm flex flex-col gap-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#053D24] uppercase tracking-wider">Campus Showcase</span>
                <span className="text-[10px] bg-[#087443] text-white px-2 py-0.5 rounded-full font-bold">Live</span>
              </div>

              <FloatingProductTile name="iPhone 14 Pro Max" price="₦980,000" rating="4.8" color="bg-[#1A1A2E]" />
              <FloatingProductTile name="Sony WH-1000XM5" price="₦330,000" rating="4.9" color="bg-[#16213E]" />
              <FloatingProductTile name="Canon EOS M50" price="₦650,000" rating="4.6" color="bg-[#0F3460]" />

              {/* Trust badge footer within right card */}
              <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-[#C5DDD2]/60 mt-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#087443]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#087443]" />
                  <span>Secure Payment · 100% Protected</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-4 h-1.5 bg-[#087443] rounded-full" />
                  <span className="w-1.5 h-1.5 bg-[#C5DDD2] rounded-full" />
                  <span className="w-1.5 h-1.5 bg-[#C5DDD2] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
