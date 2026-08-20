'use client';

import React from 'react';
import Link from 'next/link';
import { SearchX, PackageSearch, Store, MessageSquarePlus, Tag } from 'lucide-react';

export type EmptyStateType = 'search' | 'products' | 'shops' | 'conversations' | 'category';

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  onSecondaryActionClick?: () => void;
}

function getDefaultConfig(type: EmptyStateType) {
  switch (type) {
    case 'search':
      return {
        icon: <SearchX className="w-10 h-10 text-[#087443]" />,
        title: 'No exact matches found in Enugu',
        description: 'Try searching with broader terms (e.g. "laptop", "phone", "textbook") or browse all campus items.',
        actionText: 'Browse All Products',
        actionHref: '/browse',
      };
    case 'shops':
      return {
        icon: <Store className="w-10 h-10 text-[#087443]" />,
        title: 'No campus storefronts listed yet',
        description: 'Be the first student seller or local merchant in Enugu to open your digital shop!',
        actionText: '+ Start Your Shop Now',
        actionHref: '/create-shop',
      };
    case 'conversations':
      return {
        icon: <MessageSquarePlus className="w-10 h-10 text-[#087443]" />,
        title: 'No conversations yet',
        description: 'When you message a merchant or a buyer inquires about your listing, your chats will appear here.',
        actionText: 'Explore Marketplace',
        actionHref: '/browse',
      };
    case 'category':
      return {
        icon: <Tag className="w-10 h-10 text-[#087443]" />,
        title: 'No active items in this category',
        description: 'High student demand exists across campus. Be the first to list an item in this category!',
        actionText: '+ List an Item',
        actionHref: '/create-product',
      };
    case 'products':
    default:
      return {
        icon: <PackageSearch className="w-10 h-10 text-[#087443]" />,
        title: 'No active products listed yet',
        description: 'Be the first student or merchant in Enugu to list a product for campus buyers to discover!',
        actionText: '+ List a Product',
        actionHref: '/create-product',
      };
  }
}

export function EmptyState({
  type = 'products',
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  secondaryActionText,
  secondaryActionHref,
  onSecondaryActionClick,
}: EmptyStateProps) {
  const defaults = getDefaultConfig(type);

  const displayTitle = title || defaults.title;
  const displayDesc = description || defaults.description;
  const displayActionText = actionText || defaults.actionText;
  const displayActionHref = actionHref || defaults.actionHref;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
      {/* Icon Circle */}
      <div className="w-16 h-16 rounded-2xl bg-[#E8F5EF] flex items-center justify-center mx-auto border border-[#087443]/15 shadow-inner">
        {defaults.icon}
      </div>

      {/* Text Copy */}
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-[#111111]">{displayTitle}</h3>
        <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">{displayDesc}</p>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        {onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            className="w-full sm:w-auto bg-[#087443] hover:bg-[#065f37] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-xs"
          >
            {displayActionText}
          </button>
        ) : displayActionHref ? (
          <Link
            href={displayActionHref}
            className="w-full sm:w-auto bg-[#087443] hover:bg-[#065f37] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-xs inline-block"
          >
            {displayActionText}
          </Link>
        ) : null}

        {secondaryActionText && (
          secondaryActionHref ? (
            <Link
              href={secondaryActionHref}
              className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 text-[#344054] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all inline-block"
            >
              {secondaryActionText}
            </Link>
          ) : onSecondaryActionClick ? (
            <button
              type="button"
              onClick={onSecondaryActionClick}
              className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 text-[#344054] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              {secondaryActionText}
            </button>
          ) : null
        )}
      </div>
    </div>
  );
}
