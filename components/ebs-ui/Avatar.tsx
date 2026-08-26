import React from 'react';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  dark?: boolean;
}

const sizeMap = {
  xs:  { box: 'w-6 h-6',   text: 'text-[10px]' },
  sm:  { box: 'w-8 h-8',   text: 'text-xs' },
  md:  { box: 'w-10 h-10', text: 'text-sm' },
  lg:  { box: 'w-12 h-12', text: 'text-base' },
  xl:  { box: 'w-16 h-16', text: 'text-xl' },
  '2xl': { box: 'w-20 h-20', text: 'text-2xl' },
};

function getInitials(name = ''): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function Avatar({ name, src, size = 'md', className = '', dark = false }: AvatarProps) {
  const { box, text } = sizeMap[size];
  const base = `${box} rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden ${className}`;

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name ?? 'avatar'} className={`${base} object-cover`} />;
  }

  const initials = getInitials(name);
  const bgClass = dark
    ? 'bg-[#1A2820] text-[#0A8A50]'
    : 'bg-[#087443] text-white';

  return (
    <span className={`${base} ${bgClass}`}>
      <span className={`${text} leading-none`}>{initials || '?'}</span>
    </span>
  );
}
