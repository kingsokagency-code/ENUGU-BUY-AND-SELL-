'use client';

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

// Built-in list of the 9 official MVP categories from database schema
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
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 select-none ${
                isSelected
                  ? 'bg-[#087443] text-white shadow-sm border border-[#087443]'
                  : 'bg-white hover:bg-slate-50 text-[#344054] hover:text-[#111111] border border-slate-200/90 shadow-xs'
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
