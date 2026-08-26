'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck, Users, Store, Package, Clock,
  ArrowRight, Heart, Star, MapPin, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { DiscountBadge } from '@/components/ebs-ui/Badge';

/* ─────────────────────────────────────────────────────────────
   STATS ROW
───────────────────────────────────────────────────────────── */
const STATS = [
  { icon: <Users className="w-3.5 h-3.5" />, value: '10K+', label: 'Users' },
  { icon: <Store className="w-3.5 h-3.5" />, value: '500+', label: 'Stores' },
  { icon: <Package className="w-3.5 h-3.5" />, value: '50K+', label: 'Products' },
  { icon: <Clock className="w-3.5 h-3.5" />, value: '24/7', label: 'Support' },
];

/* ─────────────────────────────────────────────────────────────
   DATA MODEL — replace with Supabase query when deal engine is ready
───────────────────────────────────────────────────────────── */
export interface HotDealFeatured {
  id: string;
  name: string;
  spec: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  location: string;
  seller: string;
  isVerified: boolean;
  imageUrl: string;
  imageBg: string;
}

export interface HotDealSlide {
  id: string;
  featured: HotDealFeatured;
}

const HOT_DEALS_SLIDES: HotDealSlide[] = [
  {
    id: 'slide_1',
    featured: {
      id: '1',
      name: 'iPhone 13 Pro Max',
      spec: '256GB · Graphite · Unlocked',
      price: 580000,
      originalPrice: 650000,
      discount: 11,
      rating: 4.8,
      reviewCount: 32,
      location: 'Nsukka, Enugu',
      seller: 'Kingsok Gadgets',
      isVerified: true,
      imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&q=80',
      imageBg: '#0F172A',
    },
  },
  {
    id: 'slide_2',
    featured: {
      id: '5',
      name: 'MacBook Air M2',
      spec: '8GB RAM · 256GB · Space Gray',
      price: 1180000,
      originalPrice: 1350000,
      discount: 13,
      rating: 4.9,
      reviewCount: 48,
      location: 'UNEC Campus, Enugu',
      seller: 'TechZone Enugu',
      isVerified: true,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      imageBg: '#1E293B',
    },
  },
  {
    id: 'slide_3',
    featured: {
      id: '9',
      name: 'Canon EOS M50 Mark II',
      spec: 'Mirrorless · 15-45mm Lens Kit',
      price: 620000,
      originalPrice: 750000,
      discount: 17,
      rating: 4.7,
      reviewCount: 24,
      location: 'Ogui Road, Enugu',
      seller: 'GadgetHub NG',
      isVerified: true,
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
      imageBg: '#0A2540',
    },
  },
];

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function AboveTheFold() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideVisible, setSlideVisible] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState<Record<string, boolean>>({});

  // Read reduced-motion preference without calling setState inside effect body
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const touchStartX = useRef<number | null>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSlides = HOT_DEALS_SLIDES.length;

  // Listen for OS reduced-motion changes at runtime
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* Fade-out → swap → fade-in slide transition */
  const goToSlide = useCallback(
    (idx: number) => {
      if (prefersReducedMotion) {
        setCurrentSlide(idx);
        return;
      }
      setSlideVisible(false);
      setTimeout(() => {
        setCurrentSlide(idx);
        setSlideVisible(true);
      }, 250);
    },
    [prefersReducedMotion]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, [currentSlide, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }, [currentSlide, totalSlides, goToSlide]);

  // Autoplay — pauses on hover, resumes on leave
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    autoPlayRef.current = setInterval(nextSlide, 5000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [isPaused, nextSlide, prefersReducedMotion]);

  // Touch / swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  };

  const deal = HOT_DEALS_SLIDES[currentSlide].featured;

  return (
    <section className="w-full bg-white border-b border-[#E5EDE9]">

      {/*
        ══════════════════════════════════════════════════════
        MOBILE LAYOUT  (< lg)
        Own intentional mobile hierarchy — NOT a shrunken desktop.

        Order:
        1. Hero pill + headline
        2. Subtitle
        3. Shop Now / Start Selling  ← primary actions FIRST
        4. Hot Deals card            ← discovery SECOND
        5. Stats strip               ← trust signals LAST
        ══════════════════════════════════════════════════════
      */}
      <div className="lg:hidden">

        {/* ── 1 + 2 + 3: Hero + CTAs ─────────────────────────── */}
        <div className="px-4 pt-6 pb-5 space-y-4">
          {/* Pill */}
          <div className="inline-flex items-center gap-1.5 bg-[#E8F8EF] text-[#087443] text-xs font-bold px-3 py-1 rounded-full">
            <span className="text-amber-500">🔥</span>
            <span>#1 Campus Marketplace in Enugu</span>
          </div>

          {/* Headline — sized for mobile screens */}
          <h1 className="text-[2rem] leading-[1.1] font-black text-[#053D24] tracking-tight">
            Buy, Sell &amp; Discover<br />
            <span className="text-[#087443]">Anything</span> in Enugu
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-[#6B7C74] leading-relaxed">
            The trusted marketplace for students, residents and businesses in Enugu.{' '}
            <span className="font-bold text-[#0D1F17]">Safe. <span className="text-[#087443]">Fast.</span> <span className="text-[#FBBF24]">Local.</span></span>
          </p>

          {/* Primary CTAs — BEFORE Hot Deals on mobile */}
          <div className="flex flex-col gap-2.5 pt-1">
            <Link
              href="/browse"
              className="flex items-center justify-center gap-2 bg-[#053D24] hover:bg-[#032817] active:scale-[.98] text-white text-sm font-bold px-6 py-4 rounded-2xl transition-all shadow-md shadow-[#053D24]/20 w-full"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/create-shop"
              className="flex items-center justify-center gap-2 border-2 border-[#053D24] hover:bg-[#053D24] hover:text-white active:scale-[.98] text-[#053D24] text-sm font-bold px-6 py-4 rounded-2xl transition-all w-full"
            >
              <Store className="w-4 h-4" />
              <span>Start Selling</span>
            </Link>
          </div>
        </div>

        {/* ── 4: Hot Deals card ─────────────────────────────── */}
        <div className="px-4 pb-5">
          {/* Section label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base text-amber-500">🔥</span>
            <span className="text-sm font-black tracking-wide text-[#0D1F17] uppercase">
              Hot Deals
            </span>
            <span className="inline-flex items-center gap-1 bg-[#E8F8EF] text-[#087443] text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087443] animate-pulse shrink-0" />
              LIVE
            </span>
          </div>

          {/* Carousel card */}
          <div
            className="bg-[#053D24] rounded-3xl overflow-hidden shadow-xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Hot Deals Carousel"
          >
            {/* Animated content */}
            <div
              className={`transition-all duration-300 ease-out ${
                slideVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              {/* Product image — 16:9 on mobile so it's wide and clear */}
              <div
                className="relative w-full aspect-video overflow-hidden"
                style={{ background: deal.imageBg }}
              >
                {/* Discount badge */}
                <div className="absolute top-3 left-3 z-10">
                  <DiscountBadge percent={deal.discount} />
                </div>

                {/* Wishlist */}
                <button
                  onClick={() => setIsWishlisted(prev => ({ ...prev, [deal.id]: !prev[deal.id] }))}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Save deal"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted[deal.id] ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
                </button>

                <Image
                  src={deal.imageUrl}
                  alt={deal.name}
                  fill
                  className="object-contain p-4"
                  sizes="100vw"
                  priority={currentSlide === 0}
                />
              </div>

              {/* Product info */}
              <div className="p-4 text-white space-y-3">
                {/* Name */}
                <div>
                  <h3 className="text-base font-black text-white leading-tight">{deal.name}</h3>
                  <p className="text-xs text-emerald-300/80 mt-0.5">{deal.spec}</p>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-black text-[#FBBF24]">
                      ₦{deal.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-white/40 line-through">
                      ₦{deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">
                    Save ₦{(deal.originalPrice - deal.price).toLocaleString()} · {deal.discount}% off
                  </p>
                </div>

                {/* Seller / Location / Rating — horizontal on mobile */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    {deal.seller}
                    {deal.isVerified && (
                      <span className="text-[9px] bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 rounded font-black">✓</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-white/60">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {deal.location}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                    {deal.rating}
                    <span className="text-white/40 font-normal">({deal.reviewCount})</span>
                  </span>
                </div>

                {/* View Deal */}
                <Link
                  href={`/products/${deal.id}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#FBBF24] hover:bg-amber-400 active:scale-[.98] text-[#053D24] text-sm font-black py-3.5 rounded-xl transition-all shadow-md shadow-amber-500/20"
                >
                  View Deal →
                </Link>
              </div>
            </div>

            {/* Bottom bar: dots + viewers */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <span className="text-[11px] text-white/50">12 viewing now</span>

              {/* Dots */}
              <div className="flex items-center gap-1.5" role="tablist">
                {HOT_DEALS_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    role="tab"
                    aria-selected={currentSlide === idx}
                    aria-label={`Deal ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none ${
                      currentSlide === idx
                        ? 'w-6 h-2 bg-[#FBBF24]'
                        : 'w-2 h-2 bg-white/25'
                    }`}
                  />
                ))}
              </div>

              <Link href="/browse?filter=deals" className="text-[11px] font-bold text-amber-400">
                See all →
              </Link>
            </div>
          </div>
        </div>

        {/* ── 5: Stats strip — compact trust signals ────────── */}
        <div className="grid grid-cols-4 border-t border-[#E5EDE9] divide-x divide-[#E5EDE9]">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5 py-3">
              <span className="text-[#087443]">{s.icon}</span>
              <p className="text-xs font-black text-[#053D24] leading-none">{s.value}</p>
              <p className="text-[9px] text-[#9CB3AA]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/*
        ══════════════════════════════════════════════════════
        DESKTOP LAYOUT  (≥ lg)
        Two-column: Hero left | Hot Deals right
        ══════════════════════════════════════════════════════
      */}
      <div className="hidden lg:block py-10">
        <div className="max-w-[1440px] mx-auto px-12">
          <div className="grid grid-cols-12 gap-10 items-stretch">

            {/* LEFT: Hero messaging */}
            <div className="col-span-5 flex flex-col justify-between gap-6">
              <div className="space-y-5">
                {/* Pill */}
                <div className="inline-flex items-center gap-1.5 bg-[#E8F8EF] text-[#087443] text-xs font-bold px-3 py-1 rounded-full">
                  <span className="text-amber-500">🔥</span>
                  <span>#1 Campus Marketplace in Enugu</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl font-black text-[#053D24] leading-[1.08] tracking-tight">
                  Buy, Sell &<br />
                  <span className="text-[#053D24]">Discover</span><br />
                  <span className="text-[#087443]">Anything</span> in Enugu
                </h1>

                {/* Subtitle */}
                <p className="text-sm text-[#6B7C74] leading-relaxed max-w-md">
                  The trusted marketplace for students, residents and businesses in Enugu.
                </p>
                <p className="text-xs font-bold text-[#0D1F17]">
                  Safe. <span className="text-[#087443]">Fast.</span>{' '}
                  <span className="text-[#FBBF24]">Local.</span>
                </p>

                {/* CTAs */}
                <div className="flex gap-3 pt-2">
                  <Link
                    href="/browse"
                    className="inline-flex items-center justify-center gap-2 bg-[#053D24] hover:bg-[#032817] active:scale-[.98] text-white text-sm font-bold px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-[#053D24]/20"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/create-shop"
                    className="inline-flex items-center justify-center gap-2 border-2 border-[#053D24] hover:bg-[#053D24] hover:text-white active:scale-[.98] text-[#053D24] text-sm font-bold px-6 py-3.5 rounded-2xl transition-all"
                  >
                    <Store className="w-4 h-4" />
                    <span>Start Selling</span>
                  </Link>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 pt-4 border-t border-[#E5EDE9]">
                {STATS.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-[#087443] shrink-0">{s.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#053D24] leading-none">{s.value}</p>
                      <p className="text-[10px] text-[#9CB3AA] truncate mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Hot Deals carousel */}
            <div
              className="col-span-7"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="region"
              aria-label="Hot Deals Carousel"
            >
              <div className="bg-[#053D24] rounded-3xl overflow-hidden shadow-xl border border-[#0A8A50]/20 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="text-amber-400 text-base">🔥</span>
                    <span className="text-sm font-black tracking-wider uppercase text-white">
                      Hot Deals in Enugu
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      LIVE
                    </span>
                  </div>

                  {/* Arrow controls — desktop only */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevSlide}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
                      aria-label="Previous deal"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
                      aria-label="Next deal"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Featured deal */}
                <div
                  className={`transition-all duration-300 ease-out ${
                    slideVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                >
                  {/* Side-by-side: image left, info right */}
                  <div className="flex">
                    {/* Image — fills left 45% */}
                    <div
                      className="relative w-[45%] shrink-0 overflow-hidden"
                      style={{ background: deal.imageBg, minHeight: '280px' }}
                    >
                      <div className="absolute top-3 left-3 z-10">
                        <DiscountBadge percent={deal.discount} />
                      </div>
                      <button
                        onClick={() => setIsWishlisted(prev => ({ ...prev, [deal.id]: !prev[deal.id] }))}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Save deal"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted[deal.id] ? 'fill-red-500 text-red-500' : 'text-white/70'}`} />
                      </button>
                      <Image
                        src={deal.imageUrl}
                        alt={deal.name}
                        fill
                        className="object-contain p-6 transition-transform duration-500 hover:scale-105"
                        sizes="45vw"
                        priority={currentSlide === 0}
                      />
                    </div>

                    {/* Info — right 55% */}
                    <div className="flex-1 flex flex-col justify-between gap-4 p-5 text-white">
                      <div>
                        <h3 className="text-xl font-black text-white leading-tight">{deal.name}</h3>
                        <p className="text-xs text-emerald-300/80 mt-1">{deal.spec}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-black text-[#FBBF24]">
                            ₦{deal.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-white/40 line-through font-medium">
                            ₦{deal.originalPrice.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-emerald-400">
                          You save ₦{(deal.originalPrice - deal.price).toLocaleString()} ({deal.discount}% off)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-emerald-300">{deal.seller}</span>
                          {deal.isVerified && (
                            <span className="text-[9px] font-black bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-1.5 py-0.5 rounded">VERIFIED</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-white/50 shrink-0" />
                          <span className="text-xs text-white/70">{deal.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="text-xs font-bold text-amber-400">{deal.rating}</span>
                          <span className="text-xs text-white/40">({deal.reviewCount} reviews)</span>
                        </div>
                      </div>

                      <Link
                        href={`/products/${deal.id}`}
                        className="block w-full bg-[#FBBF24] hover:bg-amber-400 active:scale-[.98] text-[#053D24] text-sm font-black py-3 rounded-xl text-center transition-all shadow-md shadow-amber-500/20"
                      >
                        View Deal →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-[11px] text-white/60">
                    <span className="flex -space-x-1.5">
                      <span className="inline-block w-4 h-4 rounded-full bg-emerald-400 ring-1 ring-[#053D24]" />
                      <span className="inline-block w-4 h-4 rounded-full bg-amber-400 ring-1 ring-[#053D24]" />
                      <span className="inline-block w-4 h-4 rounded-full bg-blue-400 ring-1 ring-[#053D24]" />
                    </span>
                    <span>12 viewing now</span>
                  </div>

                  <div className="flex items-center gap-1.5" role="tablist" aria-label="Select deal">
                    {HOT_DEALS_SLIDES.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => goToSlide(idx)}
                        role="tab"
                        aria-selected={currentSlide === idx}
                        aria-label={`Deal ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                          currentSlide === idx ? 'w-6 h-2 bg-[#FBBF24]' : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>

                  <Link
                    href="/browse?filter=deals"
                    className="text-[11px] font-bold text-amber-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>All deals</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}
