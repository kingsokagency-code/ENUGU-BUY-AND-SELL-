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
import { BottomNav } from '@/components/ebs-ui/BottomNav';
import {
  Home, Grid, Plus, MessageCircle, User,
} from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { href: '/',            label: 'Home',       icon: <Home          className="w-5 h-5" /> },
  { href: '/browse',      label: 'Categories', icon: <Grid          className="w-5 h-5" /> },
  { href: '/create-shop', label: 'Sell',       icon: <Plus          className="w-5 h-5" />, isCenter: true },
  { href: '/conversations', label: 'Inbox',    icon: <MessageCircle className="w-5 h-5" />, badge: 0 },
  { href: '/account',     label: 'Account',    icon: <User          className="w-5 h-5" /> },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col w-full max-w-full overflow-x-hidden">
      {/* ── 1. Single Master Navbar ── */}
      <Navbar />

      {/* ── 2. Main Marketplace Flow (Static locked viewport, zero horizontal shift) ── */}
      <main className="flex-1 pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
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

      {/* ── 3. Sticky Mobile Navigation ── */}
      <BottomNav items={MOBILE_NAV_ITEMS} activePath="/" />
    </div>
  );
}
