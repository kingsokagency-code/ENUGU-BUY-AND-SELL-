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
  originalPrice?: number;
  discount: number;
  rating: number;
  location: string;
  imageUrl: string;
  imageBg: string;
  seller: string;
  isVerified?: boolean;
}

const DEALS: DealCardItem[] = [
  {
    id: '1',
    name: 'iPhone 13 Pro Max',
    spec: '256GB · Graphite',
    price: 580000,
    originalPrice: 650000,
    discount: 11,
    rating: 4.8,
    location: 'Nsukka',
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&q=80',
    imageBg: '#0F172A',
    seller: 'Kingsok Gadgets',
    isVerified: true,
  },
  {
    id: '2',
    name: 'HP Pavilion 15',
    spec: 'Core i5 · 8GB RAM',
    price: 420000,
    discount: 8,
    rating: 4.6,
    location: 'Enugu',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    imageBg: '#1E293B',
    seller: 'TechZone Enugu',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Nike Air Force 1',
    spec: 'White · Size 42',
    price: 145000,
    originalPrice: 175000,
    discount: 17,
    rating: 4.7,
    location: 'Abakpa',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    imageBg: '#F8FAFC',
    seller: 'SneakerHub NG',
    isVerified: false,
  },
  {
    id: '4',
    name: 'Study Table',
    spec: 'Wooden · Premium',
    price: 28000,
    originalPrice: 35000,
    discount: 20,
    rating: 4.5,
    location: 'Ogui',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    imageBg: '#451A03',
    seller: 'Campus Furnish',
    isVerified: false,
  },
  {
    id: '5',
    name: 'Canon EOS M50 II',
    spec: 'Mirrorless · 15-45mm',
    price: 650000,
    originalPrice: 760000,
    discount: 15,
    rating: 4.6,
    location: 'Nsukka',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
    imageBg: '#0A2540',
    seller: 'GadgetHub NG',
    isVerified: true,
  },
  {
    id: '6',
    name: 'Samsung Galaxy A54',
    spec: '128GB · Awesome Black',
    price: 310000,
    originalPrice: 345000,
    discount: 10,
    rating: 4.4,
    location: 'Enugu',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
    imageBg: '#1E1B4B',
    seller: 'PhoneWorld NG',
    isVerified: true,
  },
];

export function HotDealsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -240 : 240;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  // Auto-scroll the strip
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => scroll('right'), 4500);
    return () => clearInterval(interval);
  }, [isPaused, scroll]);

  return (
    <section className="w-full bg-[#F8FAF9] py-8 border-b border-[#E5EDE9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base text-amber-500">🔥</span>
              <h2 className="text-sm sm:text-base font-black text-[#0D1F17]">More Hot Deals</h2>
              <span className="text-[10px] font-bold text-[#087443] bg-[#E8F8EF] px-2 py-0.5 rounded-full">
                Limited Time
              </span>
            </div>
            <p className="text-xs text-[#6B7C74] mt-0.5">Handpicked deals you don&apos;t want to miss</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/browse?filter=deals"
              className="text-xs sm:text-sm font-bold text-[#087443] hover:text-[#053D24] flex items-center gap-1 transition-colors"
            >
              <span>View all deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full border border-[#E5EDE9] bg-white hover:bg-[#F0FBF4] text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                aria-label="Previous deal"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full border border-[#E5EDE9] bg-white hover:bg-[#F0FBF4] text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
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
              className="w-[170px] sm:w-[200px] lg:w-[220px] shrink-0 bg-white rounded-2xl border border-[#E5EDE9] overflow-hidden hover:border-[#087443]/50 hover:shadow-md transition-all flex flex-col justify-between group snap-start cursor-pointer"
            >
              {/* Product Image Area */}
              <div
                className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center"
                style={{ background: deal.imageBg }}
              >
                <Image
                  src={deal.imageUrl}
                  alt={deal.name}
                  fill
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 170px, (max-width: 1024px) 200px, 220px"
                />
                {/* Discount badge */}
                <div className="absolute top-2 left-2 z-10">
                  <DiscountBadge percent={deal.discount} />
                </div>
              </div>

              {/* Product Details */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0D1F17] truncate group-hover:text-[#087443] transition-colors leading-tight">
                    {deal.name}
                  </h3>
                  <p className="text-[10px] text-[#9CB3AA] truncate mt-0.5">{deal.spec}</p>

                  <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
                    <span className="text-sm font-black text-[#087443]">
                      ₦{deal.price.toLocaleString()}
                    </span>
                    {deal.originalPrice && (
                      <span className="text-[10px] text-[#9CB3AA] line-through">
                        ₦{deal.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#6B7C74] mt-2.5 pt-2 border-t border-[#E5EDE9]">
                  {deal.isVerified ? (
                    <span className="flex items-center gap-0.5 text-[#087443] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{deal.rating}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-[#9CB3AA]">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{deal.location}</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
