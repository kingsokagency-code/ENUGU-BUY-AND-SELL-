import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

const HOTSPOTS = [
  { name: 'UNN Main Campus',      subtitle: 'Popular deals near you',  deals: '120+', color: 'bg-[#E8F8EF]', dot: 'bg-[#087443]' },
  { name: 'Ogui Road',            subtitle: 'Electronics & Gadgets',    deals: '67+',  color: 'bg-[#FEF3C7]', dot: 'bg-[#F59E0B]' },
  { name: 'Abakpa Nike',          subtitle: 'Fashion & Accessories',    deals: '54+',  color: 'bg-[#FEE2E2]', dot: 'bg-[#F97316]' },
  { name: 'Kenyatta Market',      subtitle: 'Everything Market',        deals: '93+',  color: 'bg-[#DBEAFE]', dot: 'bg-[#3B82F6]' },
  { name: 'New Haven',            subtitle: 'Student Essentials',       deals: '75+',  color: 'bg-[#F3E8FF]', dot: 'bg-[#8B5CF6]' },
];

export function HotspotsPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Hotspots card */}
      <div className="bg-white rounded-2xl border border-[#E5EDE9] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#0D1F17] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#087443]" />
            Hotspots Around You
          </h3>
          <Link href="/browse" className="text-xs font-semibold text-[#087443] hover:text-[#053D24] flex items-center gap-0.5">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {HOTSPOTS.map(spot => (
            <Link
              key={spot.name}
              href={`/browse?location=${encodeURIComponent(spot.name)}`}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAF9] transition-colors group"
            >
              <div className={`w-9 h-9 rounded-xl ${spot.color} flex items-center justify-center shrink-0`}>
                <span className={`w-2.5 h-2.5 rounded-full ${spot.dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0D1F17] truncate group-hover:text-[#087443] transition-colors">{spot.name}</p>
                <p className="text-[10px] text-[#9CB3AA]">{spot.subtitle}</p>
              </div>
              <span className="text-[10px] font-bold text-[#087443] bg-[#E8F8EF] px-1.5 py-0.5 rounded-lg shrink-0">
                {spot.deals} deals
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Sell CTA card */}
      <div className="bg-[#087443] rounded-2xl p-5 text-white flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-sm leading-snug">Have Something to Sell?</p>
          <p className="text-xs text-white/75 mt-1 leading-relaxed">Turn your items into cash or grow your business today.</p>
          <Link
            href="/create-shop"
            className="inline-flex items-center gap-1.5 mt-3 bg-[#FBBF24] text-[#053D24] font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#F59E0B] transition-colors"
          >
            Sell Now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="text-5xl shrink-0 opacity-60 select-none">🛍️</div>
      </div>
    </div>
  );
}
