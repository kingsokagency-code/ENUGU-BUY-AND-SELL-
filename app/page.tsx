'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { AboveTheFold } from '@/components/homepage/AboveTheFold';
import { CategoryGrid } from '@/components/homepage/CategoryGrid';
import { RecentlyListedSection } from '@/components/homepage/RecentlyListedSection';
import { TopStoresSection } from '@/components/homepage/TopStoresSection';
import { HotDealsCarousel } from '@/components/homepage/HotDealsCarousel';
import { TrustStrip } from '@/components/homepage/TrustStrip';
import { SellCTA } from '@/components/homepage/SellCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col w-full max-w-full overflow-x-hidden">
      {/* ── 1. Single Master Navbar ── */}
      <Navbar />

      {/* ── 2. Main Marketplace Flow (Static locked viewport, zero horizontal shift) ── */}
      <main className="flex-1 pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
        {/* 1. Hero Area: Left Intro + Right Live Hot Deals Centerpiece Carousel */}
        <AboveTheFold />

        {/* 2. Shop by Category: 9 Cards */}
        <CategoryGrid />

        {/* 3. Recently Listed: Dedicated Section with Timestamps */}
        <RecentlyListedSection />

        {/* 4. Top Stores: Dedicated Section with Verified Merchants */}
        <TopStoresSection />

        {/* 5. Hot Deals: Dedicated Discovery Strip */}
        <HotDealsCarousel />

        {/* 6. Trust Strip: 4 Pillars */}
        <TrustStrip />

        {/* 7. Sell CTA: Digital Storefront Banner */}
        <SellCTA />
      </main>
    </div>
  );
}
