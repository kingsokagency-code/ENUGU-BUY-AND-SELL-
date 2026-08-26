'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone, Laptop, Shirt, BookOpen,
  Radio, Home as HomeIcon, Dumbbell, Car,
  Grid, ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Phones & Accessories', count: '1,250+ items', slug: 'phones-tablets', icon: <Smartphone className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
  { name: 'Laptops & Computers',  count: '850+ items',   slug: 'electronics',   icon: <Laptop     className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
  { name: 'Fashion & Wearables',  count: '2,100+ items', slug: 'fashion',       icon: <Shirt      className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
  { name: 'Books & Learning',     count: '950+ items',   slug: 'books',         icon: <BookOpen   className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
  { name: 'Electronics & Gadgets',count: '1,750+ items', slug: 'gadgets',       icon: <Radio      className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
  { name: 'Home & Living',        count: '1,100+ items', slug: 'home-living',   icon: <HomeIcon   className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
  { name: 'Sports & Fitness',     count: '620+ items',   slug: 'sports',        icon: <Dumbbell   className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
  { name: 'Vehicles',             count: '320+ items',   slug: 'vehicles',      icon: <Car        className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
  { name: 'More Categories',      count: 'See all',      slug: 'all',           icon: <Grid       className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
];

export function CategoryGrid() {
  return (
    <section className="w-full bg-[#F8FAF9] py-8 border-b border-[#E5EDE9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-bold text-[#0D1F17]">Shop by Category</h2>
          <Link
            href="/browse"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#087443] hover:text-[#053D24] transition-colors"
          >
            <span>View all categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 9 Category Cards Row */}
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] sm:grid sm:grid-cols-5 lg:grid-cols-9 sm:overflow-visible">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.slug === 'all' ? '/browse' : `/browse?category=${cat.slug}`}
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-[#E5EDE9] hover:border-[#087443]/50 hover:shadow-sm transition-all min-w-[105px] sm:min-w-0 group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center mb-2 group-hover:scale-108 transition-transform`}>
                {cat.icon}
              </div>
              <p className="text-[11px] font-bold text-[#0D1F17] leading-tight line-clamp-2 group-hover:text-[#087443] transition-colors">
                {cat.name}
              </p>
              <p className="text-[9px] text-[#9CB3AA] mt-1">
                {cat.count}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
