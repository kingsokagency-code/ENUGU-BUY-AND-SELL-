'use client';

import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProductGalleryProps {
  images?: string[];
  productName?: string;
}

export function ProductGallery({
  images = [],
  productName = 'Product',
}: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const demoPlaceholders = [
    '#1A1A2E',
    '#16213E',
    '#0F3460',
    '#2E0854',
  ];

  const hasRealImages = images.length > 0;
  const currentImage = hasRealImages ? images[selectedIdx] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display */}
      <div className="relative aspect-square w-full rounded-3xl bg-white border border-[#E5EDE9] overflow-hidden flex items-center justify-center p-6 sm:p-10 shadow-sm">
        {currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImage}
            alt={productName}
            className="w-full h-full object-contain transition-all duration-300"
          />
        ) : (
          <div
            className="w-full h-full rounded-2xl flex flex-col items-center justify-center text-white transition-colors duration-300"
            style={{ background: demoPlaceholders[selectedIdx % demoPlaceholders.length] }}
          >
            <ShoppingBag className="w-16 h-16 opacity-40 mb-2" />
            <span className="text-xl font-bold">{productName}</span>
            <span className="text-xs opacity-60 mt-1">View {selectedIdx + 1}</span>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {(hasRealImages ? images : demoPlaceholders).map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#087443] shadow-md scale-102 ring-2 ring-[#087443]/20'
                  : 'border-[#E5EDE9] hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              {hasRealImages ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: item }}
                >
                  {idx + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
