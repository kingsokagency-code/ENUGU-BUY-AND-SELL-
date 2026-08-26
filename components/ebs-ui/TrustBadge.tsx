import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock, Award } from 'lucide-react';

type TrustType = 'verified' | 'delivery' | 'return' | 'secure' | 'original';

interface TrustBadgeProps {
  type: TrustType;
  label?: string;
  dark?: boolean;
  vertical?: boolean;
}

const icons: Record<TrustType, React.ReactNode> = {
  verified: <ShieldCheck className="w-4 h-4" />,
  delivery: <Truck       className="w-4 h-4" />,
  return:   <RotateCcw   className="w-4 h-4" />,
  secure:   <Lock        className="w-4 h-4" />,
  original: <Award       className="w-4 h-4" />,
};

const labels: Record<TrustType, string> = {
  verified: 'Verified Sellers',
  delivery: 'Fast Delivery',
  return:   '7 Days Return',
  secure:   'Secure Payments',
  original: '100% Original',
};

export function TrustBadge({ type, label, dark = false, vertical = false }: TrustBadgeProps) {
  const clr  = dark ? 'text-[#0A8A50]' : 'text-[#087443]';
  const text = dark ? 'text-[#9CB3AA]' : 'text-[#0D1F17]';

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-1.5`}>
      <span className={clr}>{icons[type]}</span>
      <span className={`text-xs font-medium ${text}`}>{label ?? labels[type]}</span>
    </div>
  );
}

/** 4-pillar horizontal trust strip */
export function TrustStrip({ dark = false }: { dark?: boolean }) {
  const bg     = dark ? 'bg-[#1A2820] border-[#243320]' : 'bg-white border-[#E5EDE9]';
  const types: TrustType[] = ['verified', 'secure', 'delivery', 'original'];

  return (
    <div className={`border rounded-2xl p-4 flex items-center justify-around gap-2 flex-wrap ${bg}`}>
      {types.map(t => <TrustBadge key={t} type={t} dark={dark} vertical />)}
    </div>
  );
}
