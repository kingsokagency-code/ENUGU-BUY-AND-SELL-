import React from 'react';

type BadgeVariant = 'green' | 'gold' | 'orange' | 'red' | 'blue' | 'gray' | 'verified' | 'new' | 'hot' | 'dark';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  green:    'bg-[#DCFCE7] text-[#166534]',
  gold:     'bg-[#FEF3C7] text-[#92400E]',
  orange:   'bg-[#FEE2E2] text-[#991B1B]',
  red:      'bg-[#EF4444] text-white',
  blue:     'bg-[#DBEAFE] text-[#1E40AF]',
  gray:     'bg-[#F3F4F6] text-[#6B7280]',
  verified: 'bg-[#087443] text-white',
  new:      'bg-[#7C3AED] text-white',
  hot:      'bg-[#F97316] text-white',
  dark:     'bg-[#1A2820] text-[#9CB3AA]',
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded-md',
  sm: 'px-2 py-0.5 text-xs rounded-lg',
  md: 'px-2.5 py-1 text-xs rounded-lg',
};

export function Badge({ variant = 'green', size = 'sm', children, className = '', dot = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold leading-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

/** Verified seller tick badge — matches reference design */
export function VerifiedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-[#087443] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ${className}`}
      title="Verified Merchant"
    >
      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Verified
    </span>
  );
}

/** Discount badge — shows -15% style */
export function DiscountBadge({ percent, className = '' }: { percent: number; className?: string }) {
  return (
    <span className={`inline-flex items-center bg-[#F97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ${className}`}>
      -{percent}%
    </span>
  );
}
