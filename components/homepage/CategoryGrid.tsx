'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone, Laptop, Shirt, BookOpen,
  Headphones, Home as HomeIcon, Dumbbell, Car,
  Grid, ArrowRight,
} from 'lucide-react';

interface CategoryItem {
  name: string;
  count: string;
  slug: string;
  icon: React.ReactNode;
  bg: string;
  iconColor: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    name: 'Phones & Tablets',
    count: '1,250 items',
    slug: 'phones-tablets',
    icon: <Smartphone className="w-5 h-5" />,
    bg: 'bg-emerald-50 border-emerald-100/80',
    iconColor: 'text-[#087443]',
  },
  {
    name: 'Laptops & Computers',
    count: '850 items',
    slug: 'electronics',
    icon: <Laptop className="w-5 h-5" />,
    bg: 'bg-blue-50 border-blue-100/80',
    iconColor: 'text-blue-700',
  },
  {
    name: 'Fashion & Wear',
    count: '2,100 items',
    slug: 'fashion',
    icon: <Shirt className="w-5 h-5" />,
    bg: 'bg-amber-50 border-amber-100/80',
    iconColor: 'text-amber-700',
  },
  {
    name: 'Books & Notes',
    count: '950 items',
    slug: 'books',
    icon: <BookOpen className="w-5 h-5" />,
    bg: 'bg-indigo-50 border-indigo-100/80',
    iconColor: 'text-indigo-700',
  },
  {
    name: 'Audio & Gadgets',
    count: '1,750 items',
    slug: 'gadgets',
    icon: <Headphones className="w-5 h-5" />,
    bg: 'bg-purple-50 border-purple-100/80',
    iconColor: 'text-purple-700',
  },
  {
    name: 'Home & Hostel',
    count: '1,100 items',
    slug: 'home-living',
    icon: <HomeIcon className="w-5 h-5" />,
    bg: 'bg-rose-50 border-rose-100/80',
    iconColor: 'text-rose-700',
  },
  {
    name: 'Sports & Fitness',
    count: '620 items',
    slug: 'sports',
    icon: <Dumbbell className="w-5 h-5" />,
    bg: 'bg-teal-50 border-teal-100/80',
    iconColor: 'text-teal-700',
  },
  {
    name: 'Vehicles & Rides',
    count: '320 items',
    slug: 'vehicles',
    icon: <Car className="w-5 h-5" />,
    bg: 'bg-orange-50 border-orange-100/80',
    iconColor: 'text-orange-700',
  },
  {
    name: 'All Categories',
    count: 'Explore 50K+',
    slug: 'all',
    icon: <Grid className="w-5 h-5" />,
    bg: 'bg-slate-100 border-slate-200',
    iconColor: 'text-slate-800',
  },
];

export function CategoryGrid() {
  return (
    <section className="w-full max-w-full bg-[#F8FAF9] py-6 sm:py-8 border-b border-[#E5EDE9] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3.5 sm:mb-5 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base text-emerald-600 font-bold">🏷️</span>
              <h2 className="text-sm sm:text-base font-black text-[#0D1F17] tracking-tight">
                Shop by Category
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6B7C74] mt-0.5">
              Browse thousands of student and campus products by department
            </p>
          </div>

          <Link
            href="/browse"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#087443] hover:text-[#053D24] transition-colors shrink-0"
          >
            <span>View all categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Cards: Horizontal Snap Scroll on Mobile (<sm), 9-Col Grid on Desktop (sm+) */}
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] sm:grid sm:grid-cols-5 lg:grid-cols-9 sm:overflow-visible snap-x snap-mandatory">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.slug === 'all' ? '/browse' : `/browse?category=${cat.slug}`}
              className="flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E5EDE9] hover:border-[#087443]/50 hover:shadow-md transition-all min-w-[100px] w-[100px] sm:w-auto sm:min-w-0 shrink-0 group cursor-pointer shadow-2xs snap-start active:scale-[0.98]"
            >
              {/* Category Icon Pill */}
              <div
                className={`w-11 h-11 rounded-2xl ${cat.bg} ${cat.iconColor} border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shrink-0 shadow-2xs`}
              >
                {cat.icon}
              </div>

              {/* Title & Count */}
              <p className="text-[11px] sm:text-xs font-bold text-[#0D1F17] leading-tight line-clamp-2 group-hover:text-[#087443] transition-colors">
                {cat.name}
              </p>
              <span className="text-[9.5px] font-semibold text-[#9CB3AA] mt-1 bg-slate-50 px-1.5 py-0.5 rounded-md">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
