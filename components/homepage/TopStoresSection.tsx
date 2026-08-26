'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, MapPin } from 'lucide-react';

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
    <section className="w-full max-w-full bg-[#F8FAF9] py-6 sm:py-10 border-b border-[#E5EDE9] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {TOP_STORES_DATA.map((store) => {
            const isFollowing = !!followed[store.id];
            return (
              <Link
                key={store.id}
                href={`/shops/${store.slug}`}
                className="bg-white rounded-2xl border border-[#E5EDE9] p-4 flex flex-col justify-between hover:border-[#087443]/40 hover:shadow-md transition-all group cursor-pointer"
              >
                <div>
                  {/* Top Bar: Avatar & Follow Button */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-103 transition-transform"
                        style={{ background: store.bg }}
                      >
                        {store.initial}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="text-xs sm:text-sm font-bold text-[#0D1F17] truncate group-hover:text-[#087443] transition-colors">
                            {store.name}
                          </h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#087443] shrink-0" />
                        </div>
                        <p className="text-[10px] text-[#9CB3AA] truncate mt-0.5">{store.category}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleFollow(store.id, e)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                        isFollowing
                          ? 'bg-[#087443] text-white border-[#087443]'
                          : 'bg-white text-[#087443] border-[#087443]/30 hover:bg-[#E8F8EF]'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  {/* Store Location */}
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7C74] mb-3">
                    <MapPin className="w-3 h-3 text-[#9CB3AA] shrink-0" />
                    <span className="truncate">{store.location}</span>
                  </div>
                </div>

                {/* Bottom Row: Rating, Followers, Products */}
                <div className="flex items-center justify-between text-[10px] text-[#6B7C74] pt-2.5 border-t border-[#E5EDE9]">
                  <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{store.rating} ({store.reviews})</span>
                  </span>
                  <span className="text-[#9CB3AA]">
                    {store.productsCount} products
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

export default TopStoresSection;
