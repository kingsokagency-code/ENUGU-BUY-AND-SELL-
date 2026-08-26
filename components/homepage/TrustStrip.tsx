import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

const PILLARS = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Verified Sellers',
    desc: 'All sellers are verified for your safety',
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: 'Fast Delivery',
    desc: 'Quick delivery within Enugu & beyond',
  },
  {
    icon: <RotateCcw className="w-5 h-5" />,
    title: '7 Days Return',
    desc: 'Easy returns if item is not as described',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Secure Payments',
    desc: '100% secure payment & buyer protection',
  },
];

export function TrustStrip() {
  return (
    <section className="w-full bg-white py-6 border-b border-[#E5EDE9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PILLARS.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F8EF] text-[#087443] flex items-center justify-center shrink-0">
                {p.icon}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0D1F17]">{p.title}</p>
                <p className="text-[11px] text-[#6B7C74] mt-0.5 leading-snug">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
