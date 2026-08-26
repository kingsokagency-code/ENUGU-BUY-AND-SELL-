'use client';

import React from 'react';

export interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: number | string;
  height?: number | string;
  className?: string;
  theme?: 'light' | 'dark' | 'monochrome';
}

/**
 * ENUGU BUY & SELL (EBS) — Master Brand Identity (Option 3 - Refined)
 * Fast. Simple. Trusted.
 * 
 * Symmetrical layout with:
 * - Dynamic forward-moving green "e" with 3 speed motion streaks
 * - Bold geometric "b" and "s" in deep navy (#0D1117)
 * - "— E N U G U —" prominently positioned with breathing room and crisp contrast
 * - "BUY • SELL • DISCOVER" tagline centered underneath
 */
export function Logo({
  variant = 'full',
  size = 'md',
  width,
  height,
  className = '',
  theme = 'dark',
}: LogoProps) {
  // Proportional size presets maintaining exact 300:130 (2.3:1) aspect ratio
  const dimensions = {
    sm: { width: 125, height: 54 },
    md: { width: 175, height: 76 },
    lg: { width: 230, height: 100 },
    xl: { width: 290, height: 126 },
  }[size];

  const displayWidth = width ?? dimensions.width;
  const displayHeight = height ?? dimensions.height;

  // ── Color System from Official Brand Guidelines ──
  const isLight = theme === 'light';
  const primaryGreen = '#0A8F4F';
  const deepGreen = '#06663B';
  const navyDark = isLight ? '#FFFFFF' : '#0D1117';
  const tagColor = isLight ? '#E2E8F0' : '#475569';

  // ── VARIANT 1: ICON ONLY (=e Motion Mark) ──
  if (variant === 'icon') {
    const iconDim = size === 'sm' ? 36 : size === 'md' ? 48 : size === 'lg' ? 64 : 80;
    return (
      <svg
        viewBox="0 0 100 100"
        width={width ?? iconDim}
        height={height ?? iconDim}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className={`select-none shrink-0 block ${className}`}
        aria-label="EBS Speed Icon"
      >
        <defs>
          <linearGradient id="ebsSpeedGradIcon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={primaryGreen} />
            <stop offset="100%" stopColor={deepGreen} />
          </linearGradient>
        </defs>

        {/* 3 Horizontal Speed Motion Lines on Left */}
        <rect x="6" y="28" width="22" height="6.5" rx="3.25" fill="url(#ebsSpeedGradIcon)" />
        <rect x="0" y="46" width="18" height="6.5" rx="3.25" fill="url(#ebsSpeedGradIcon)" />
        <rect x="4" y="64" width="26" height="6.5" rx="3.25" fill="url(#ebsSpeedGradIcon)" />

        {/* Dynamic Forward-Moving "e" Glyph */}
        <g transform="translate(32, 10)">
          <path
            d="M32 0 C49.6 0, 64 14.3, 64 32 C64 36.5, 63 40.5, 61 44 L11 44 C13.5 54, 22 61.5, 33 61.5 C40 61.5, 46.5 58, 51 52.5 L60 59 C53.5 68, 44 74, 33 74 C14.5 74, 0 59.5, 0 41 C0 20, 14 0, 32 0 Z M52.5 33 C52 23, 44 14.5, 32 14.5 C21 14.5, 14 22, 12 33 L52.5 33 Z"
            fill="url(#ebsSpeedGradIcon)"
          />
        </g>
      </svg>
    );
  }

  // ── VARIANT 2: HORIZONTAL / FULL MASTER WORDMARK ──
  return (
    <svg
      viewBox="0 0 300 130"
      width={displayWidth}
      height={displayHeight}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={`select-none shrink-0 block ${className}`}
      aria-label="EBS — ENUGU BUY & SELL"
    >
      <defs>
        <linearGradient id="ebsSpeedGradFull" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={primaryGreen} />
          <stop offset="100%" stopColor={deepGreen} />
        </linearGradient>
      </defs>

      {/* ======================================================== */}
      {/* 1. TOP ROW: "= e b s" Master Wordmark (Centered)         */}
      {/* ======================================================== */}
      <g id="EBSWordmark" transform="translate(38, 4)">
        
        {/* 3 Speed Lines on the Left */}
        <rect x="0" y="24" width="22" height="6" rx="3" fill="url(#ebsSpeedGradFull)" />
        <rect x="-7" y="40" width="18" height="6" rx="3" fill="url(#ebsSpeedGradFull)" />
        <rect x="-3" y="56" width="26" height="6" rx="3" fill="url(#ebsSpeedGradFull)" />

        {/* Dynamic Forward-Moving "e" */}
        <g transform="translate(25, 9)">
          <path
            d="M28 0 C43.5 0, 56 12, 56 28 C56 32, 55 35.5, 53 38.5 L10 38.5 C12 47.5, 19.5 54, 29 54 C35.5 54, 41 51, 44.5 46.5 L52 52 C46.5 60, 38.5 65, 29 65 C13 65, 0 52, 0 36 C0 17, 12.5 0, 28 0 Z M45.5 29 C45 20.5, 38 13, 28 13 C18 13, 12 19.5, 10.5 29 L45.5 29 Z"
            fill="url(#ebsSpeedGradFull)"
          />
        </g>

        {/* Bold Geometric "b" */}
        <g transform="translate(90, 0)">
          <path
            d="M0 0 L12 0 L12 28 C17 22, 24.5 18.5, 33 18.5 C49 18.5, 61 31.5, 61 49 C61 66.5, 49 79.5, 33 79.5 C24.5 79.5, 17 76, 12 70 L12 78 L0 78 L0 0 Z M12 49 C12 59, 19 67, 30 67 C41 67, 49 59, 49 49 C49 39, 41 31, 30 31 C19 31, 12 39, 12 49 Z"
            fill={navyDark}
          />
        </g>

        {/* Bold Geometric "s" */}
        <g transform="translate(159, 15)">
          <path
            d="M28 0 C42 0, 54 7.5, 54 21 L42 21 C42 14.5, 36.5 10.5, 28 10.5 C20 10.5, 14 14, 14 19.5 C14 25, 19 27.5, 29 30.5 C42 34, 55 39, 55 51.5 C55 64.5, 42.5 72, 28 72 C13 72, 0 64, 0 51 L12 51 C12 58, 19 61.5, 28 61.5 C37 61.5, 43 57.5, 43 51 C43 45, 38 42, 27 39 C14 35, 2 30, 2 19.5 C2 7.5, 14 0, 28 0 Z"
            fill={navyDark}
          />
        </g>

      </g>

      {/* ======================================================== */}
      {/* 2. MIDDLE ROW: "— E N U G U —" (Brought Down & Clear)     */}
      {/* ======================================================== */}
      <g id="EnuguSubBrand" transform="translate(0, 102)">
        {/* Left Rule */}
        <line x1="32" y1="0" x2="82" y2="0" stroke={primaryGreen} strokeWidth="2.2" strokeLinecap="round" />

        {/* "E N U G U" Text */}
        <text
          x="150"
          y="4.5"
          fill={primaryGreen}
          fontFamily="'Poppins', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="15"
          fontWeight="900"
          letterSpacing="0.46em"
          textAnchor="middle"
        >
          ENUGU
        </text>

        {/* Right Rule */}
        <line x1="218" y1="0" x2="268" y2="0" stroke={primaryGreen} strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* ======================================================== */}
      {/* 3. BOTTOM ROW: "BUY • SELL • DISCOVER" (Clear & Readable) */}
      {/* ======================================================== */}
      <g id="BuySellDiscoverTagline" transform="translate(150, 122)">
        <text
          x="0"
          y="0"
          fill={tagColor}
          fontFamily="'Poppins', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="9"
          fontWeight="800"
          letterSpacing="0.26em"
          textAnchor="middle"
        >
          BUY &nbsp;•&nbsp; SELL &nbsp;•&nbsp; DISCOVER
        </text>
      </g>

    </svg>
  );
}

export default Logo;
