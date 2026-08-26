'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Star, ShieldCheck } from 'lucide-react';

interface RecentProduct {
  id: string;
  name: string;
  spec: string;
  price: number;
  timeAgo: string;
  location: string;
  seller: string;
  isVerified: boolean;
  rating: number;
  bg: string;
  initial: string;
}

const RECENT_PRODUCTS: RecentProduct[] = [
  { id: 'rec_1', name: 'Dell Inspiron 14 Laptop', spec: 'Core i7 • 16GB RAM • 512GB SSD', price: 420000, timeAgo: '5m ago', location: 'UNN Main Campus', seller: 'TechHub NG', isVerified: true, rating: 4.9, bg: '#0F172A', initial: 'DELL' },
  { id: 'rec_2', name: 'AirPods Pro 2nd Gen', spec: 'USB-C Case • Brand New Sealed', price: 120000, timeAgo: '15m ago', location: 'UNEC Campus', seller: 'Kingsok Gadgets', isVerified: true, rating: 4.8, bg: '#1E293B', initial: 'AP2' },
  { id: 'rec_3', name: 'Female Luxury Handbag', spec: 'Genuine Leather • Brown', price: 25000, timeAgo: '28m ago', location: 'New Haven', seller: 'Trendy Wears', isVerified: true, rating: 4.7, bg: '#451A03', initial: 'BAG' },
  { id: 'rec_4', name: 'Advanced Engineering Maths', spec: 'Hardcover • 10th Edition (K. Stroud)', price: 8500, timeAgo: '35m ago', location: 'UNN Franco', seller: 'BookHub UNN', isVerified: true, rating: 4.9, bg: '#064E3B', initial: 'MATH' },
  { id: 'rec_5', name: 'Samsung Galaxy Buds 2 Pro', spec: 'Graphite • Wireless Charging', price: 95000, timeAgo: '42m ago', location: 'Ogui Road', seller: 'GadgetZone', isVerified: false, rating: 4.6, bg: '#1E1B4B', initial: 'BUDS' },
  { id: 'rec_6', name: 'Student Ergonomic Mesh Chair', spec: 'Adjustable Lumbar • Breathable', price: 38000, timeAgo: '1h ago', location: 'Hilltop UNN', seller: 'Campus Essentials', isVerified: true, rating: 4.8, bg: '#1A2E05', initial: 'CHAIR' },
];

export function RecentlyListedSection() {
  return (
    <section className="w-full max-w-full bg-white py-6 sm:py-10 border-b border-[#E5EDE9] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-black text-base">⚡</span>
              <h2 className="text-sm sm:text-base font-bold text-[#0D1F17]">Recently Listed</h2>
            </div>
            <p className="text-xs text-[#6B7C74] mt-0.5">Fresh items posted by students and verified local sellers right now</p>
          </div>

          <Link
            href="/browse?sort=recent"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#087443] hover:text-[#053D24] transition-colors"
          >
            <span>See all recent listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6-Card Grid on Desktop, 2-Col Grid on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {RECENT_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-[#F8FAF9] rounded-2xl border border-[#E5EDE9] p-2.5 sm:p-3 flex flex-col justify-between hover:bg-white hover:border-[#087443]/40 hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                {/* Product Visual Container & Time Ago Badge */}
                <div
                  className="relative aspect-square w-full rounded-xl flex items-center justify-center text-white font-black text-sm p-3 mb-2.5 group-hover:scale-101 transition-transform"
                  style={{ background: product.bg }}
                >
                  <span>{product.initial}</span>
                  <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {product.timeAgo}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#0D1F17] truncate group-hover:text-[#087443] transition-colors">
                  {product.name}
                </h3>
                <p className="text-[10px] text-[#9CB3AA] truncate mt-0.5">{product.spec}</p>
                <p className="text-xs sm:text-sm font-black text-[#087443] mt-1.5">
                  ₦{product.price.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#6B7C74] mt-2.5 pt-2 border-t border-[#E5EDE9]">
                <span className="flex items-center gap-0.5 truncate max-w-[80px] sm:max-w-[90px]">
                  {product.isVerified && <ShieldCheck className="w-3 h-3 text-[#087443] shrink-0" />}
                  <span className="truncate">{product.seller}</span>
                </span>
                <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{product.rating}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecentlyListedSection;
