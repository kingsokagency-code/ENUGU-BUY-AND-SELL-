'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Star, ShieldCheck, MapPin, Tag } from 'lucide-react';

interface RecentProduct {
  id: string;
  name: string;
  spec: string;
  price: number;
  originalPrice?: number;
  timeAgo: string;
  location: string;
  seller: string;
  isVerified: boolean;
  rating: number;
  reviews: number;
  imageUrl: string;
}

const RECENT_PRODUCTS: RecentProduct[] = [
  {
    id: 'rec_1',
    name: 'Dell Inspiron 15 (2024)',
    spec: 'Core i7 • 16GB RAM • 512GB SSD',
    price: 420000,
    originalPrice: 480000,
    timeAgo: '5m ago',
    location: 'UNN Main Campus',
    seller: 'TechHub NG',
    isVerified: true,
    rating: 4.9,
    reviews: 28,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80',
  },
  {
    id: 'rec_2',
    name: 'AirPods Pro (2nd Gen)',
    spec: 'USB-C MagSafe Case • Sealed',
    price: 120000,
    originalPrice: 145000,
    timeAgo: '14m ago',
    location: 'UNEC Campus, Enugu',
    seller: 'Kingsok Gadgets',
    isVerified: true,
    rating: 4.8,
    reviews: 42,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80',
  },
  {
    id: 'rec_3',
    name: 'Women Luxury Tote Bag',
    spec: 'Genuine Calfskin Leather • Brown',
    price: 28500,
    originalPrice: 35000,
    timeAgo: '28m ago',
    location: 'New Haven, Enugu',
    seller: 'Trendy Wears Campus',
    isVerified: true,
    rating: 4.7,
    reviews: 19,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
  },
  {
    id: 'rec_4',
    name: 'Higher Engineering Mathematics',
    spec: 'Hardcover • 10th Edition (K. Stroud)',
    price: 9500,
    timeAgo: '35m ago',
    location: 'UNN Franco, Nsukka',
    seller: 'BookHub UNN',
    isVerified: true,
    rating: 4.9,
    reviews: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
  },
  {
    id: 'rec_5',
    name: 'Samsung Galaxy Buds 2 Pro',
    spec: 'Graphite • Wireless Charging Case',
    price: 85000,
    originalPrice: 105000,
    timeAgo: '42m ago',
    location: 'Ogui Road, Enugu',
    seller: 'GadgetZone Express',
    isVerified: false,
    rating: 4.6,
    reviews: 31,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80',
  },
  {
    id: 'rec_6',
    name: 'Ergonomic Mesh Study Chair',
    spec: 'Adjustable Lumbar Support • Breathable',
    price: 38000,
    originalPrice: 45000,
    timeAgo: '1h ago',
    location: 'Hilltop UNN, Nsukka',
    seller: 'Campus Essentials',
    isVerified: true,
    rating: 4.8,
    reviews: 22,
    imageUrl: 'https://images.unsplash.com/photo-1580481077197-251f28b49e1e?w=500&q=80',
  },
];

export function RecentlyListedSection() {
  return (
    <section className="w-full max-w-full bg-white py-6 sm:py-10 border-b border-[#E5EDE9] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-black text-base">⚡</span>
              <h2 className="text-sm sm:text-base font-black text-[#0D1F17] tracking-tight">
                Recently Listed
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6B7C74] mt-0.5">
              Fresh items posted by students and verified local sellers right now
            </p>
          </div>

          <Link
            href="/browse?sort=recent"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#087443] hover:text-[#053D24] transition-colors shrink-0"
          >
            <span>See all recent listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6-Card Grid: 2-Col on Mobile (<sm), 3-Col on Tablet (sm-lg), 6-Col on Desktop (lg+) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {RECENT_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-[#F8FAF9] rounded-2xl border border-[#E5EDE9] overflow-hidden flex flex-col justify-between hover:bg-white hover:border-[#087443]/40 hover:shadow-md transition-all group cursor-pointer shadow-2xs"
            >
              {/* Product Visual Container & Time Ago Badge */}
              <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />

                {/* Time Ago Live Pill */}
                <div className="absolute top-2 left-2 z-10 bg-black/65 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                  <Clock className="w-2.5 h-2.5 text-amber-300" />
                  <span>{product.timeAgo}</span>
                </div>

                {/* Discount Tag if available */}
                {product.originalPrice && (
                  <div className="absolute bottom-2 right-2 z-10 bg-red-600 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded shadow-xs">
                    SAVE ₦{(product.originalPrice - product.price).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0D1F17] truncate group-hover:text-[#087443] transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-[#9CB3AA] truncate mt-0.5">
                    {product.spec}
                  </p>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-[#087443]">
                      ₦{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[9.5px] text-[#9CB3AA] line-through">
                        ₦{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Seller, Location, and Rating Footer */}
                <div className="mt-2.5 pt-2 border-t border-[#E5EDE9] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#6B7C74]">
                    <span className="flex items-center gap-0.5 truncate max-w-[80px] sm:max-w-[90px] font-medium">
                      {product.isVerified && <ShieldCheck className="w-3 h-3 text-[#087443] shrink-0" />}
                      <span className="truncate">{product.seller}</span>
                    </span>

                    <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{product.rating}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-[9px] text-[#9CB3AA] truncate">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{product.location}</span>
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

export default RecentlyListedSection;
