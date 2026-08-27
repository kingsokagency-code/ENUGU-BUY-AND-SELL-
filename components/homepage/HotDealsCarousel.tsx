'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Star, MapPin,
  ShieldCheck, ArrowRight,
} from 'lucide-react';
import { DiscountBadge } from '@/components/ebs-ui/Badge';

interface DealCardItem {
  id: string;
  name: string;
  spec: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  location: string;
  imageUrl: string;
  imageBg: string;
  seller: string;
  isVerified: boolean;
}

const DEALS: DealCardItem[] = [
  {
    id: 'deal_1',
    name: 'iPhone 13 Pro Max',
    spec: '256GB • Graphite • 92% Battery',
    price: 580000,
    originalPrice: 650000,
    discount: 11,
    rating: 4.8,
    reviews: 32,
    location: 'Nsukka, Enugu',
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&q=80',
    imageBg: '#F8FAFC',
    seller: 'Kingsok Gadgets',
    isVerified: true,
  },
  {
    id: 'deal_2',
    name: 'HP Pavilion 15 Gaming',
    spec: 'Core i5 12th Gen • 16GB • RTX 3050',
    price: 520000,
    originalPrice: 600000,
    discount: 13,
    rating: 4.9,
    reviews: 45,
    location: 'UNEC Campus, Enugu',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
    imageBg: '#F8FAFC',
    seller: 'TechZone Enugu',
    isVerified: true,
  },
  {
    id: 'deal_3',
    name: 'Nike Air Jordan 1 Low',
    spec: 'Black Toe • Size 42 • Brand New',
    price: 85000,
    originalPrice: 110000,
    discount: 22,
    rating: 4.7,
    reviews: 28,
    location: 'UNN Franco, Nsukka',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    imageBg: '#F8FAFC',
    seller: 'SneakerHub NG',
    isVerified: true,
  },
  {
    id: 'deal_4',
    name: 'Solid Wood Student Desk',
    spec: 'Double Drawer • Modern Teak Finish',
    price: 32000,
    originalPrice: 42000,
    discount: 24,
    rating: 4.6,
    reviews: 17,
    location: 'Hilltop UNN, Nsukka',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80',
    imageBg: '#F8FAFC',
    seller: 'Campus Furnish',
    isVerified: false,
  },
  {
    id: 'deal_5',
    name: 'Sony WH-1000XM4',
    spec: 'Industry Leading Noise Canceling',
    price: 210000,
    originalPrice: 260000,
    discount: 19,
    rating: 4.9,
    reviews: 54,
    location: 'New Haven, Enugu',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    imageBg: '#F8FAFC',
    seller: 'SoundZone NG',
    isVerified: true,
  },
  {
    id: 'deal_6',
    name: 'Samsung Galaxy S22 Ultra',
    spec: '256GB • Phantom Black • Dual SIM',
    price: 490000,
    originalPrice: 560000,
    discount: 12,
    rating: 4.8,
    reviews: 36,
    location: 'Ogui Road, Enugu',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
    imageBg: '#F8FAFC',
    seller: 'PhoneWorld NG',
    isVerified: true,
  },
];

export function HotDealsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  // Auto-scroll the strip gently
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => scroll('right'), 5000);
    return () => clearInterval(interval);
  }, [isPaused, scroll]);

  return (
    <section className="w-full max-w-full bg-[#F8FAF9] py-6 sm:py-10 border-b border-[#E5EDE9] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base text-amber-500">🔥</span>
              <h2 className="text-sm sm:text-base font-black text-[#0D1F17] tracking-tight">
                More Hot Deals
              </h2>
              <span className="text-[10px] font-bold text-[#087443] bg-[#E8F8EF] px-2 py-0.5 rounded-full border border-[#087443]/15">
                Limited Time
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6B7C74] mt-0.5">
              Handpicked deals with verified discounts from top Enugu campus sellers
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/browse?filter=deals"
              className="text-xs sm:text-sm font-bold text-[#087443] hover:text-[#053D24] flex items-center gap-1 transition-colors shrink-0"
            >
              <span>View all deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full border border-[#E5EDE9] bg-white hover:bg-[#F0FBF4] text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                aria-label="Previous deal"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full border border-[#E5EDE9] bg-white hover:bg-[#F0FBF4] text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                aria-label="Next deal"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] snap-x snap-mandatory"
        >
          {DEALS.map((deal) => (
            <Link
              key={deal.id}
              href={`/products/${deal.id}`}
              className="w-[170px] xs:w-[185px] sm:w-[210px] lg:w-[230px] shrink-0 bg-white rounded-2xl border border-[#E5EDE9] overflow-hidden hover:border-[#087443]/50 hover:shadow-md transition-all flex flex-col justify-between group snap-start cursor-pointer shadow-2xs"
            >
              {/* Product Image Area */}
              <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-50 flex items-center justify-center">
                <Image
                  src={deal.imageUrl}
                  alt={deal.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 185px, (max-width: 1024px) 210px, 230px"
                />

                {/* Discount Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <DiscountBadge percent={deal.discount} />
                </div>
              </div>

              {/* Product Details */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0D1F17] truncate group-hover:text-[#087443] transition-colors leading-snug">
                    {deal.name}
                  </h3>
                  <p className="text-[10px] text-[#9CB3AA] truncate mt-0.5">
                    {deal.spec}
                  </p>

                  <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-[#087443]">
                      ₦{deal.price.toLocaleString()}
                    </span>
                    <span className="text-[9.5px] text-[#9CB3AA] line-through">
                      ₦{deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#E5EDE9] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#6B7C74]">
                    <span className="flex items-center gap-0.5 truncate max-w-[85px] font-medium">
                      {deal.isVerified && <ShieldCheck className="w-3 h-3 text-[#087443] shrink-0" />}
                      <span className="truncate">{deal.seller}</span>
                    </span>

                    <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{deal.rating}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-[9px] text-[#9CB3AA] truncate">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{deal.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HotDealsCarousel;
