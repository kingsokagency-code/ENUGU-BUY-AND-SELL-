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
 * Features:
 * - Dynamic forward-moving green "e" with 3 speed motion streaks
 * - Modern bold "b" and "s" in deep navy (#0D1117)
 * - "— E N U G U —" sub-brand header with flanking rules
 * - "BUY • SELL • DISCOVER" tagline
 */
export function Logo({
  variant = 'full',
  size = 'md',
  width,
  height,
  className = '',
  theme = 'dark',
}: LogoProps) {
  // Proportional size presets maintaining exact 3.3:1 (300:90) or 2.7:1 (270:100) aspect ratios
  const dimensions = {
    sm: { width: 130, height: 48 },
    md: { width: 175, height: 64 },
    lg: { width: 230, height: 84 },
    xl: { width: 290, height: 106 },
  }[size];

  const displayWidth = width ?? dimensions.width;
  const displayHeight = height ?? dimensions.height;

  // ── Color System from Official Brand Guidelines ──
  const isLight = theme === 'light';
  const primaryGreen = '#0A8F4F';
  const deepGreen = '#06663B';
  const navyDark = isLight ? '#FFFFFF' : '#0D1117';
  const coolGray = isLight ? '#E2E8F0' : '#6B7280';

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
          {/* Outer Ring & Crossbar */}
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
      viewBox="0 0 280 100"
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
      {/* 1. TOP ROW: "= e b s" Master Wordmark                     */}
      {/* ======================================================== */}
      <g id="EBSWordmark" transform="translate(18, 4)">
        
        {/* 3 Speed Lines on the Left */}
        <rect x="0" y="21" width="22" height="5.5" rx="2.75" fill="url(#ebsSpeedGradFull)" />
        <rect x="-6" y="36" width="18" height="5.5" rx="2.75" fill="url(#ebsSpeedGradFull)" />
        <rect x="-2" y="51" width="26" height="5.5" rx="2.75" fill="url(#ebsSpeedGradFull)" />

        {/* Dynamic Forward-Moving "e" */}
        <g transform="translate(24, 7)">
          <path
            d="M26 0 C40.5 0, 52 11.5, 52 26 C52 29.5, 51.2 33, 49.5 36 L9 36 C11 44, 18 50, 27 50 C33 50, 38 47.5, 41.5 43 L48.5 48 C43.5 55.5, 36 60, 27 60 C12 60, 0 48, 0 33 C0 16, 11.5 0, 26 0 Z M42.5 27 C42 19, 35.5 12, 26 12 C17 12, 11.5 18, 10 27 L42.5 27 Z"
            fill="url(#ebsSpeedGradFull)"
          />
        </g>

        {/* Bold Geometric "b" */}
        <g transform="translate(85, 0)">
          <path
            d="M0 0 L11 0 L11 25.5 C15.5 20, 22.5 17, 30.5 17 C45 17, 56.5 29, 56.5 45 C56.5 61, 45 73, 30.5 73 C22.5 73, 15.5 70, 11 64.5 L11 72 L0 72 L0 0 Z M11 45 C11 54, 17.5 61.5, 27.5 61.5 C37.5 61.5, 45 54, 45 45 C45 36, 37.5 28.5, 27.5 28.5 C17.5 28.5, 11 36, 11 45 Z"
            fill={navyDark}
          />
        </g>

        {/* Bold Geometric "s" */}
        <g transform="translate(150, 14)">
          <path
            d="M26 0 C39 0, 50 7, 50 19 L39 19 C39 13.5, 34 9.5, 26 9.5 C18.5 9.5, 13 13, 13 18 C13 23, 17.5 25.5, 27 28 C39 31, 51 35.5, 51 47 C51 59, 39.5 66, 26 66 C12 66, 0 58.5, 0 46.5 L11 46.5 C11 53, 17.5 56.5, 26 56.5 C34.5 56.5, 40 53, 40 47 C40 41.5, 35.5 39, 25 36 C13 32.5, 2 28, 2 18 C2 7, 13 0, 26 0 Z"
            fill={navyDark}
          />
        </g>

      </g>

      {/* ======================================================== */}
      {/* 2. MIDDLE ROW: "— E N U G U —"                            */}
      {/* ======================================================== */}
      <g id="EnuguSubBrand" transform="translate(0, 80)">
        {/* Left Rule */}
        <line x1="28" y1="0" x2="68" y2="0" stroke={primaryGreen} strokeWidth="1.75" strokeLinecap="round" />

        {/* "E N U G U" Text */}
        <text
          x="140"
          y="4"
          fill={primaryGreen}
          fontFamily="'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif"
          fontSize="13"
          fontWeight="800"
          letterSpacing="0.42em"
          textAnchor="middle"
        >
          ENUGU
        </text>

        {/* Right Rule */}
        <line x1="212" y1="0" x2="252" y2="0" stroke={primaryGreen} strokeWidth="1.75" strokeLinecap="round" />
      </g>

      {/* ======================================================== */}
      {/* 3. BOTTOM ROW: "BUY • SELL • DISCOVER"                   */}
      {/* ======================================================== */}
      <g id="BuySellDiscoverTagline" transform="translate(140, 96)">
        <text
          x="0"
          y="0"
          fill={coolGray}
          fontFamily="'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif"
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="0.28em"
          textAnchor="middle"
        >
          BUY &nbsp;•&nbsp; SELL &nbsp;•&nbsp; DISCOVER
        </text>
      </g>

    </svg>
  );
}

export default Logo;
