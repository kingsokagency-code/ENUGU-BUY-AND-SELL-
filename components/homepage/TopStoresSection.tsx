'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Users, Package, MapPin } from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  followers: number;
  productsCount: number;
  slug: string;
  initial: string;
  bg: string;
}

const TOP_STORES_DATA: StoreItem[] = [
  { id: 'st_1', name: 'Kingsok Gadgets', category: 'Phones & Electronics', location: 'UNN Main Campus', rating: 4.8, reviews: 2315, followers: 1245, productsCount: 36, slug: 'kingsok-gadgets', initial: 'KG', bg: '#087443' },
  { id: 'st_2', name: 'TechZone Enugu', category: 'Laptops & Computers', location: 'UNEC Campus', rating: 4.9, reviews: 1420, followers: 1180, productsCount: 48, slug: 'techzone-enugu', initial: 'TZ', bg: '#053D24' },
  { id: 'st_3', name: 'Trendy Wears Campus', category: 'Fashion & Footwear', location: 'New Haven, Enugu', rating: 4.7, reviews: 890, followers: 940, productsCount: 76, slug: 'trendy-wears', initial: 'TW', bg: '#1E293B' },
  { id: 'st_4', name: 'Campus Essentials & Living', category: 'Student Furniture & Decor', location: 'Hilltop UNN', rating: 4.8, reviews: 670, followers: 820, productsCount: 52, slug: 'campus-essentials', initial: 'CE', bg: '#B45309' },
];

export function TopStoresSection() {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="w-full bg-[#F8FAF9] py-8 sm:py-10 border-b border-[#E5EDE9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-base">🏆</span>
              <h2 className="text-sm sm:text-base font-bold text-[#0D1F17]">Top Stores Around You</h2>
            </div>
            <p className="text-xs text-[#6B7C74] mt-0.5">Verified campus storefronts with top reviews and guaranteed fast delivery</p>
          </div>

          <Link
            href="/shops"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#087443] hover:text-[#053D24] transition-colors"
          >
            <span>See all stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Store Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOP_STORES_DATA.map((store) => {
            const isFollowing = followed[store.id];
            return (
              <Link
                key={store.id}
                href={`/shops/${store.slug}`}
                className="bg-white rounded-2xl border border-[#E5EDE9] p-4 flex flex-col justify-between hover:border-[#087443]/40 hover:shadow-md transition-all group cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0"
                      style={{ background: store.bg }}
                    >
                      {store.initial}
                    </div>

                    <button
                      onClick={(e) => toggleFollow(store.id, e)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isFollowing
                          ? 'bg-[#E8F8EF] text-[#087443]'
                          : 'border border-[#087443] text-[#087443] hover:bg-[#087443] hover:text-white'
                      }`}
                    >
                      {isFollowing ? 'Following ✓' : '+ Follow'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#0D1F17] group-hover:text-[#087443] transition-colors truncate">
                      {store.name}
                    </h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#087443] shrink-0" />
                  </div>

                  <p className="text-[11px] text-[#6B7C74] truncate mt-0.5">{store.category}</p>
                  <p className="text-[10px] text-[#9CB3AA] flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-[#9CB3AA]" />
                    <span>{store.location}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6B7C74] mt-4 pt-3 border-t border-[#E5EDE9]">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{store.rating} ({store.reviews})</span>
                  </span>
                  <span className="text-[10px] text-[#9CB3AA]">
                    {store.productsCount} Products
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
