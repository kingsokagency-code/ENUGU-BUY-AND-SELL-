'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Flame,
  Users,
  ArrowRight,
  Smartphone,
  Laptop,
  Shirt,
  Armchair,
  Headphones,
} from 'lucide-react';

interface DealItem {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent?: number;
  sellerName: string;
  isVerifiedSeller: boolean;
  location: string;
  viewersCount: number;
  imageUrl?: string;
}

const DEFAULT_DEALS: DealItem[] = [
  {
    id: 'd1',
    name: 'iPhone 13 Pro (Alpine Green, 128GB)',
    category: 'Phones & Tablets',
    originalPrice: 620000,
    dealPrice: 580000,
    discountPercent: 6,
    sellerName: "Kingsley's Tech Hub",
    isVerifiedSeller: true,
    location: 'Nsukka, Enugu',
    viewersCount: 14,
  },
  {
    id: 'd2',
    name: 'MacBook Pro 14" (M1 Pro / 16GB)',
    category: 'Electronics',
    originalPrice: 950000,
    dealPrice: 880000,
    discountPercent: 7,
    sellerName: 'Prime Gadgets Enugu',
    isVerifiedSeller: true,
    location: 'Independence Layout, Enugu',
    viewersCount: 21,
  },
  {
    id: 'd3',
    name: 'Samsung Galaxy S23 Ultra',
    category: 'Phones & Tablets',
    originalPrice: 780000,
    dealPrice: 710000,
    discountPercent: 9,
    sellerName: 'Emeka Mobile Hub',
    isVerifiedSeller: true,
    location: 'UNEC Campus, Enugu',
    viewersCount: 18,
  },
  {
    id: 'd4',
    name: 'Sony WH-1000XM5 ANC Headphones',
    category: 'Electronics',
    originalPrice: 240000,
    dealPrice: 210000,
    discountPercent: 12,
    sellerName: 'SoundWave Audio',
    isVerifiedSeller: true,
    location: 'New Haven, Enugu',
    viewersCount: 11,
  },
];

const SIDEBAR_DEALS = [
  {
    id: 'sb1',
    name: 'HP Pavilion Laptop',
    price: 420000,
    icon: Laptop,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'sb2',
    name: 'Nike Air Force 1',
    price: 45000,
    icon: Shirt,
    color: 'bg-pink-50 text-pink-600',
  },
  {
    id: 'sb3',
    name: 'Study Table',
    price: 28000,
    icon: Armchair,
    color: 'bg-amber-50 text-amber-600',
  },
];

export function HotDealsWidget() {
  const [deals, setDeals] = useState<DealItem[]>(DEFAULT_DEALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live deals from backend
  useEffect(() => {
    async function loadDeals() {
      try {
        const res = await fetch('/api/deals');
        const data = await res.json();
        if (data.success && data.deals && data.deals.length > 0) {
          setDeals(data.deals);
        }
      } catch {
        // Fallback to DEFAULT_DEALS
      }
    }
    loadDeals();
  }, []);

  // Continuous Auto-Play Motion Timer (Advances every 4.5 seconds)
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % deals.length);
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [deals.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? deals.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % deals.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentDeal = deals[currentIndex] || DEFAULT_DEALS[0];
  const formatPrice = (val: number) => `₦${val.toLocaleString()}`;

  return (
    <div className="w-full max-w-xl bg-gradient-to-br from-[#053D24] via-[#064e2e] to-[#04331e] rounded-3xl p-5 sm:p-6 text-white shadow-2xl border border-emerald-800/50 select-none relative overflow-hidden group">
      
      {/* Ambient Animated Radial Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/20 blur-3xl rounded-full pointer-events-none"
      />

      {/* ── HEADER ROW: LIVE ON EBS + TITLE + CAROUSEL ARROWS ── */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        
        {/* Left: Pulse Live Indicator & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-sm" />
            </span>
            <span className="text-[11px] font-extrabold tracking-wider text-emerald-300 uppercase">
              LIVE ON EBS
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-base sm:text-lg font-black tracking-tight text-white">
            <Flame className="w-5 h-5 text-[#FBBF24] fill-[#FBBF24] animate-pulse" />
            <span>HOT DEALS IN ENUGU</span>
          </div>
        </div>

        {/* Right: Carousel Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-md"
            aria-label="Previous Deal"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-md"
            aria-label="Next Deal"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── MAIN CONTENT: FEATURED CARD WITH VIVID HOVER & FLOATING MOTION + SIDEBAR STACK ── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 mb-4 relative z-10">
        
        {/* 1. LEFT: FEATURED SPOTLIGHT DEAL CARD (7 COLS) */}
        <div className="sm:col-span-7 bg-white text-[#111827] rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[185px] relative overflow-hidden group/card border border-slate-100 hover:border-[#087443]/30">
          
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentDeal.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -28 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between h-full space-y-3"
            >
              {/* Top Row: Visual Icon with Floating Micro-Motion */}
              <div className="flex items-center gap-3.5">
                
                {/* 3D Floating Image Container with Shimmer on Hover */}
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-[#053D24] flex items-center justify-center shrink-0 shadow-md p-2 border border-emerald-600/40 relative overflow-hidden cursor-pointer"
                >
                  {(() => {
                    const norm = (currentDeal.category + ' ' + currentDeal.name).toLowerCase();
                    if (norm.includes('laptop') || norm.includes('macbook')) {
                      return <Laptop className="w-10 h-10 text-emerald-200 drop-shadow-md" />;
                    }
                    if (norm.includes('headphone') || norm.includes('audio') || norm.includes('sony')) {
                      return <Headphones className="w-10 h-10 text-emerald-200 drop-shadow-md" />;
                    }
                    if (norm.includes('shirt') || norm.includes('shoe') || norm.includes('nike')) {
                      return <Shirt className="w-10 h-10 text-emerald-200 drop-shadow-md" />;
                    }
                    if (norm.includes('table') || norm.includes('chair')) {
                      return <Armchair className="w-10 h-10 text-emerald-200 drop-shadow-md" />;
                    }
                    return <Smartphone className="w-10 h-10 text-emerald-200 drop-shadow-md" />;
                  })()}
                  
                  {/* Subtle Light Beam Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>

                {/* Deal Titles & Discount Price */}
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate group-hover/card:text-[#087443] transition-colors">
                    {currentDeal.name}
                  </h4>
                  
                  {/* Original Strikethrough & Bold Deal Price */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through font-semibold">
                        {formatPrice(currentDeal.originalPrice)}
                      </span>
                      {currentDeal.discountPercent ? (
                        <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-sm">
                          -{currentDeal.discountPercent}% OFF
                        </span>
                      ) : null}
                    </div>
                    <span className="text-base sm:text-lg font-black text-[#087443] block leading-none">
                      {formatPrice(currentDeal.dealPrice)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Badges: Verified Seller & Location */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1 text-[#087443] font-bold bg-[#E8F5EF] px-2.5 py-1 rounded-md shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Verified Seller</span>
                </motion.div>

                <div className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[110px]">{currentDeal.location}</span>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

        {/* 2. RIGHT: QUICK-PICK SIDEBAR STACK (5 COLS) */}
        <div className="sm:col-span-5 flex flex-col gap-2 justify-between">
          {SIDEBAR_DEALS.map((deal) => {
            const IconComponent = deal.icon;
            return (
              <Link
                key={deal.id}
                href="/browse?filter=deals"
                className="bg-white hover:bg-slate-50 text-[#111827] rounded-xl p-2.5 px-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-2 group/side cursor-pointer border border-transparent hover:border-[#087443]/20"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${deal.color} flex items-center justify-center shrink-0 group-hover/side:scale-110 transition-transform`}>
                    <IconComponent className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-slate-900 truncate leading-tight group-hover/side:text-[#087443] transition-colors">
                      {deal.name}
                    </h5>
                    <span className="text-xs font-black text-[#087443] block">
                      {formatPrice(deal.price)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      {/* ── FOOTER: LIVE AUDIENCE TICKER + WHITE CAROUSEL DOTS + VIEW ALL DEALS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs text-emerald-100 font-medium relative z-10">
        
        {/* Left: Viewers Count */}
        <div className="flex items-center gap-1.5 text-emerald-200/90 shrink-0">
          <Users className="w-4 h-4 text-emerald-300" />
          <span>{currentDeal.viewersCount} people viewing deals</span>
        </div>

        {/* Center: White Carousel Dots / Pagination Pills with Rolling Glow */}
        <div className="flex items-center gap-1.5 py-1">
          {deals.map((deal, idx) => (
            <button
              key={deal.id}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to deal ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 h-2 bg-white shadow-md shadow-white/40'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* Right: View All Deals Link */}
        <Link
          href="/browse?filter=deals"
          className="inline-flex items-center gap-1 text-white font-bold hover:text-[#FBBF24] transition-colors group shrink-0"
        >
          <span>View all deals</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

      </div>

    </div>
  );
}

export default HotDealsWidget;
