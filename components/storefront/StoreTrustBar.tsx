import React from 'react';
import { Award, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export function StoreTrustBar() {
  const items = [
    { icon: <Award className="w-5 h-5" />, title: '100% Original', desc: 'Verified authentic items' },
    { icon: <Truck className="w-5 h-5" />, title: 'Fast Delivery', desc: 'Direct to your hostel/address' },
    { icon: <RotateCcw className="w-5 h-5" />, title: '7 Days Return', desc: 'Hassle-free money back guarantee' },
    { icon: <ShieldCheck className="w-5 h-5" />, title: 'Secure Pay', desc: 'Funds released upon verification' },
  ];

  return (
    <div className="bg-white border border-[#E5EDE9] rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] text-[#087443] flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#0D1F17] truncate">{item.title}</p>
              <p className="text-[11px] text-[#6B7C74] truncate">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
