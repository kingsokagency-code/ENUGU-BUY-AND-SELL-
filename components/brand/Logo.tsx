'use client';

import React from 'react';
import Image from 'next/image';

export interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: number | string;
  height?: number | string;
  className?: string;
  theme?: 'light' | 'dark' | 'monochrome';
}

/**
 * ENUGU BUY & SELL (EBS) — Master Brand Logo
 * Exactly rendered from the master brand artwork.
 * 
 * Features:
 * - 4 Speed/Motion trails
 * - 3D Green "e" with Orange Location Pin
 * - Bold Deep Navy "b" & "s"
 * - "— E N U G U —"
 * - "BUY • SELL • DISCOVER"
 */
export function Logo({
  size = 'md',
  width,
  height,
  className = '',
}: LogoProps) {
  // Proportional size presets maintaining exact aspect ratio of the official artwork
  const dimensions = {
    sm: { width: 95, height: 50 },
    md: { width: 135, height: 71 },
    lg: { width: 175, height: 92 },
    xl: { width: 220, height: 116 },
  }[size];

  const displayWidth = typeof width === 'number' ? width : dimensions.width;
  const displayHeight = typeof height === 'number' ? height : dimensions.height;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none relative ${className}`}
      style={{
        width: typeof width === 'string' ? width : `${displayWidth}px`,
        height: typeof height === 'string' ? height : `${displayHeight}px`,
      }}
    >
      <Image
        src="/logo-exact-transparent.png"
        alt="Enugu Buy & Sell (EBS)"
        width={Number(displayWidth)}
        height={Number(displayHeight)}
        priority
        unoptimized
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}

export default Logo;
