'use client';

import { motion } from 'framer-motion';
import {
  Smartphone,
  Laptop,
  BookOpen,
  Shirt,
  Tv,
  Armchair,
  Utensils,
  Wrench,
  Package,
  LayoutGrid,
} from 'lucide-react';

export interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
}

export interface CategoryPillsProps {
  categories?: CategoryItem[];
  selectedCategory?: string; // slug or 'all'
  onSelectCategory?: (slug: string) => void;
  className?: string;
}

// Built-in list of official MVP categories from database schema
export const DEFAULT_MVP_CATEGORIES: CategoryItem[] = [
  { name: 'All Categories', slug: 'all' },
  { name: 'Phones', slug: 'phones' },
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Books', slug: 'books' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Appliances', slug: 'appliances' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Services', slug: 'services' },
  { name: 'Other', slug: 'other' },
];

function getCategoryIcon(slug: string, isSelected: boolean) {
  const iconClass = `w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#087443]'}`;
  switch (slug) {
    case 'all':
      return <LayoutGrid className={iconClass} />;
    case 'phones':
      return <Smartphone className={iconClass} />;
    case 'laptops':
      return <Laptop className={iconClass} />;
    case 'books':
      return <BookOpen className={iconClass} />;
    case 'fashion':
      return <Shirt className={iconClass} />;
    case 'electronics':
      return <Tv className={iconClass} />;
    case 'appliances':
      return <Utensils className={iconClass} />;
    case 'furniture':
      return <Armchair className={iconClass} />;
    case 'services':
      return <Wrench className={iconClass} />;
    default:
      return <Package className={iconClass} />;
  }
}

function getGridCategoryIcon(slug: string) {
  switch (slug) {
    case 'phones':
      return <Smartphone className="w-6 h-6 text-[#087443]" />;
    case 'laptops':
      return <Laptop className="w-6 h-6 text-[#087443]" />;
    case 'books':
      return <BookOpen className="w-6 h-6 text-[#F97316]" />;
    case 'fashion':
      return <Shirt className="w-6 h-6 text-[#EA580C]" />;
    case 'electronics':
      return <Tv className="w-6 h-6 text-[#0284C7]" />;
    case 'appliances':
      return <Utensils className="w-6 h-6 text-[#F59E0B]" />;
    case 'furniture':
      return <Armchair className="w-6 h-6 text-[#8B5CF6]" />;
    case 'services':
      return <Wrench className="w-6 h-6 text-[#10B981]" />;
    default:
      return <LayoutGrid className="w-6 h-6 text-[#087443]" />;
  }
}

export function CategoryPills({
  categories = DEFAULT_MVP_CATEGORIES,
  selectedCategory = 'all',
  onSelectCategory,
  className = '',
}: CategoryPillsProps) {
  const items = categories[0]?.slug === 'all'
    ? categories
    : [{ name: 'All Categories', slug: 'all' }, ...categories];

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth">
        {items.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory?.(cat.slug)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 select-none ${
                isSelected
                  ? 'bg-[#087443] text-white shadow-sm border border-[#087443]'
                  : 'bg-white hover:bg-slate-50 text-[#344054] hover:text-[#111111] border border-slate-200/90 shadow-2xs hover:border-[#087443]/30'
              }`}
            >
              {getCategoryIcon(cat.slug, isSelected)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Visual Category Grid with squircle cards matching reference prototype
 */
export function CategoryGrid({
  categories = DEFAULT_MVP_CATEGORIES,
  onSelectCategory,
}: {
  categories?: CategoryItem[];
  onSelectCategory?: (slug: string) => void;
}) {
  const displayItems = categories.filter((c) => c.slug !== 'all');

  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3.5">
      {displayItems.map((cat) => (
        <motion.button
          key={cat.slug}
          type="button"
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={() => onSelectCategory?.(cat.slug)}
          className="bg-white border border-slate-200/90 hover:border-[#087443]/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 shadow-2xs hover:shadow-sm transition-all group select-none text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E8F5EF] via-slate-50 to-[#E8F5EF]/50 flex items-center justify-center border border-[#087443]/15 group-hover:scale-108 transition-transform shadow-2xs">
            {getGridCategoryIcon(cat.slug)}
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-[#111111] group-hover:text-[#087443] transition-colors truncate w-full">
            {cat.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

