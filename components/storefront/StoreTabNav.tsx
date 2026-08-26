'use client';

import React from 'react';

export type StoreTab = 'home' | 'products' | 'categories' | 'reviews' | 'about';

interface StoreTabNavProps {
  activeTab: StoreTab;
  onTabChange: (tab: StoreTab) => void;
  productsCount?: number;
  reviewsCount?: number;
}

export function StoreTabNav({
  activeTab,
  onTabChange,
  productsCount = 36,
  reviewsCount = 128,
}: StoreTabNavProps) {
  const tabs: { key: StoreTab; label: string; count?: number }[] = [
    { key: 'home',       label: 'Store Home' },
    { key: 'products',   label: 'Products', count: productsCount },
    { key: 'categories', label: 'Categories' },
    { key: 'reviews',    label: 'Reviews', count: reviewsCount },
    { key: 'about',      label: 'About' },
  ];

  return (
    <div className="bg-white border-b border-[#E5EDE9] sticky top-0 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none [scrollbar-width:none]">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={`py-3.5 sm:py-4 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#087443] text-[#087443]'
                    : 'border-transparent text-[#6B7C74] hover:text-[#0D1F17]'
                }`}
              >
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#E8F8EF] text-[#087443]' : 'bg-gray-100 text-gray-500'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
