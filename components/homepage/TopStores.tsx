import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ebs-ui/Avatar';

interface DemoStore {
  id: string;
  name: string;
  initials: string;
  category: string;
  rating: number;
  products: number;
  slug: string;
}

const DEMO_STORES: DemoStore[] = [
  { id: '1', name: 'Kingsok Gadgets',    initials: 'KG', category: 'Electronics',        rating: 4.8, products: 128, slug: 'kingsok-gadgets'    },
  { id: '2', name: 'Campus Essentials',  initials: 'CE', category: 'Student Items',       rating: 4.7, products: 95,  slug: 'campus-essentials'  },
  { id: '3', name: 'Trendy Wears',       initials: 'TW', category: 'Fashion',             rating: 4.6, products: 76,  slug: 'trendy-wears'       },
  { id: '4', name: 'BookHub UNN',        initials: 'BH', category: 'Books & Stationery',  rating: 4.8, products: 62,  slug: 'bookhub-unn'        },
];

interface TopStoresProps {
  stores?: DemoStore[];
}

export function TopStores({ stores }: TopStoresProps) {
  const displayStores = stores?.length ? stores : DEMO_STORES;

  return (
    <div className="bg-white rounded-2xl border border-[#E5EDE9] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#0D1F17]">Top Stores</h3>
        <Link href="/shops" className="text-xs font-semibold text-[#087443] hover:text-[#053D24] flex items-center gap-0.5">
          View All Stores <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List */}
      <div className="flex flex-col gap-1">
        {displayStores.map(store => (
          <Link
            key={store.id}
            href={`/shops/${store.slug}`}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAF9] transition-colors group"
          >
            <Avatar name={store.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-[#0D1F17] truncate group-hover:text-[#087443] transition-colors">{store.name}</span>
                <ShieldCheck className="w-3 h-3 text-[#087443] shrink-0" />
              </div>
              <span className="text-[10px] text-[#9CB3AA]">{store.category} · {store.products} products</span>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold justify-end">
                <Star className="w-3 h-3 fill-current" />{store.rating}
              </div>
              <button
                onClick={e => e.preventDefault()}
                className="text-[10px] text-[#087443] border border-[#087443] rounded-lg px-2 py-0.5 hover:bg-[#087443] hover:text-white transition-colors mt-0.5"
              >
                Follow
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
