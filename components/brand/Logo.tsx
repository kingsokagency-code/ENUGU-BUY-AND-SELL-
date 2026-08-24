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
 * ENUGU BUY & SELL — Master Brand Logo
 * 
 * Implemented as a SINGLE INDIVISIBLE VECTOR SVG LOCKUP:
 * [ICON]  ENUGU
 *         [ BUY ] & [ SELL ]
 *         — Powered by KINGSOK —
 * 
 * Uses exact viewBox="0 0 300 90" and preserveAspectRatio="xMinYMid meet".
 * Scales 100% proportionally without clipping, wrapping, or separation at any size.
 */
export function Logo({
  variant = 'full',
  size = 'md',
  width,
  height,
  className = '',
  theme = 'dark',
}: LogoProps) {
  // Proportional size presets maintaining exact 300:90 (3.33:1) aspect ratio
  const dimensions = {
    sm: { width: 160, height: 48 },
    md: { width: 215, height: 64 },
    lg: { width: 270, height: 81 },
    xl: { width: 330, height: 99 },
  }[size];

  const displayWidth = width ?? dimensions.width;
  const displayHeight = height ?? dimensions.height;

  // ── Color System ──
  const isLight = theme === 'light';
  const isMono = theme === 'monochrome';

  const deepEmerald = isMono ? (isLight ? '#FFFFFF' : '#053D24') : '#053D24';
  const primaryGreen = isMono ? (isLight ? '#FFFFFF' : '#053D24') : '#087443';
  const brightGreen = isMono ? (isLight ? '#FFFFFF' : '#053D24') : '#0A8A50';
  const accentYellow = isMono ? (isLight ? '#FFFFFF' : '#053D24') : '#FBBF24';
  const accentOrange = isMono ? (isLight ? '#FFFFFF' : '#053D24') : '#F97316';
  
  const textEnugu = isLight ? '#FFFFFF' : deepEmerald;
  const textAmp = isLight ? '#CBD5E1' : deepEmerald;
  const textPowered = isLight ? '#A7F3D0' : primaryGreen;
  const textKingsok = isLight ? '#FFFFFF' : deepEmerald;

  // ── VARIANT 1: ICON ONLY (Shopping Bag + "e" + Location Pin + Arrows) ──
  if (variant === 'icon') {
    const iconDim = size === 'sm' ? 44 : size === 'md' ? 56 : size === 'lg' ? 72 : 88;
    return (
      <svg
        viewBox="0 0 94 94"
        width={width ?? iconDim}
        height={height ?? iconDim}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className={`select-none shrink-0 block ${className}`}
        aria-label="Enugu Buy & Sell Icon"
      >
        <defs>
          <linearGradient id="iconBagGradSingle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryGreen} />
            <stop offset="100%" stopColor={deepEmerald} />
          </linearGradient>
        </defs>

        {/* Handle */}
        <path
          d="M36 26 C36 10, 60 10, 60 26"
          stroke={primaryGreen}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="36" cy="27" r="3.5" fill={accentYellow} />
        <circle cx="60" cy="27" r="3.5" fill={accentYellow} />

        {/* Bag Body */}
        <path
          d="M22 27 L74 27 L85 81 C85 85, 80 88, 75 88 L21 88 C16 88, 11 85, 11 81 Z"
          fill="url(#iconBagGradSingle)"
        />
        {/* Left Side Shadow Panel */}
        <path
          d="M22 27 L33 27 L21 88 C16 88, 11 85, 11 81 L22 27 Z"
          fill="#032516"
        />
        {/* Top Rim Highlight */}
        <path
          d="M22 27 L74 27 L72 31 L24 31 Z"
          fill={brightGreen}
          opacity="0.85"
        />

        {/* Stylized White "e" */}
        <path
          d="M60 45 C47 43, 31 51, 28 63 C25 75, 33 84, 49 83 C60 82, 66 77, 68 71 L57 71 C55 74, 50 76, 45 76 C35 75, 33 69, 33 64 L70 64 C70 55, 67 46, 60 45 Z M35 57 C36 52, 45 50, 54 51 C58 52, 61 55, 61 57 L35 57 Z"
          fill="#FFFFFF"
        />

        {/* Yellow Loop Arrow */}
        <path
          d="M11 58 C3 66, 6 79, 20 82"
          stroke={accentYellow}
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="23,77 26,86 16,84" fill={accentYellow} />

        {/* Green Return Arrow */}
        <path
          d="M69 78 C80 77, 86 66, 81 55"
          stroke={brightGreen}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="82,50 87,59 77,58" fill={brightGreen} />

        {/* Orange Location Pin */}
        <g transform="translate(61, 33)">
          <path
            d="M8 0 C3.5 0, 0 3.5, 0 8 C0 15, 8 22, 8 22 C8 22, 16 15, 16 8 C16 3.5, 12.5 0, 8 0 Z"
            fill={accentOrange}
          />
          <circle cx="8" cy="8" r="3.2" fill="#FFFFFF" />
        </g>
      </svg>
    );
  }

  // ── VARIANT 2 & 3: COMPLETE MASTER LOCKUP (ONE INDIVISIBLE SVG) ──
  return (
    <svg
      viewBox="0 0 300 90"
      width={displayWidth}
      height={displayHeight}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
      className={`select-none shrink-0 block ${className}`}
      aria-label="ENUGU BUY & SELL — Powered by KINGSOK"
    >
      <defs>
        <linearGradient id="masterBagGradLockup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primaryGreen} />
          <stop offset="100%" stopColor={deepEmerald} />
        </linearGradient>
      </defs>

      {/* ======================================================== */}
      {/* 1. LEFT 3D SHOPPING BAG ICON (Coordinates: x:8 to 88)    */}
      {/* ======================================================== */}
      <g id="MasterBrandIcon" transform="translate(0, 0)">
        {/* Handle */}
        <path
          d="M36 26 C36 10, 60 10, 60 26"
          stroke={primaryGreen}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="36" cy="27" r="3.5" fill={accentYellow} />
        <circle cx="60" cy="27" r="3.5" fill={accentYellow} />

        {/* Bag Body */}
        <path
          d="M22 27 L74 27 L85 81 C85 85, 80 88, 75 88 L21 88 C16 88, 11 85, 11 81 Z"
          fill="url(#masterBagGradLockup)"
        />
        {/* Left Side Shadow Panel */}
        <path
          d="M22 27 L33 27 L21 88 C16 88, 11 85, 11 81 L22 27 Z"
          fill="#032516"
        />
        {/* Top Rim Highlight */}
        <path
          d="M22 27 L74 27 L72 31 L24 31 Z"
          fill={brightGreen}
          opacity="0.85"
        />

        {/* Stylized White "e" */}
        <path
          d="M60 45 C47 43, 31 51, 28 63 C25 75, 33 84, 49 83 C60 82, 66 77, 68 71 L57 71 C55 74, 50 76, 45 76 C35 75, 33 69, 33 64 L70 64 C70 55, 67 46, 60 45 Z M35 57 C36 52, 45 50, 54 51 C58 52, 61 55, 61 57 L35 57 Z"
          fill="#FFFFFF"
        />

        {/* Yellow Loop Arrow */}
        <path
          d="M11 58 C3 66, 6 79, 20 82"
          stroke={accentYellow}
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="23,77 26,86 16,84" fill={accentYellow} />

        {/* Green Return Arrow */}
        <path
          d="M69 78 C80 77, 86 66, 81 55"
          stroke={brightGreen}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="82,50 87,59 77,58" fill={brightGreen} />

        {/* Orange Location Pin */}
        <g transform="translate(61, 33)">
          <path
            d="M8 0 C3.5 0, 0 3.5, 0 8 C0 15, 8 22, 8 22 C8 22, 16 15, 16 8 C16 3.5, 12.5 0, 8 0 Z"
            fill={accentOrange}
          />
          <circle cx="8" cy="8" r="3.2" fill="#FFFFFF" />
        </g>
      </g>

      {/* ======================================================== */}
      {/* 2. RIGHT TYPOGRAPHY LOCKUP (Coordinates: x:98 to 295)    */}
      {/* ======================================================== */}
      <g id="MasterTypographyLockup" transform="translate(98, 0)">
        
        {/* ROW 1: "ENUGU" Major Wordmark */}
        <text
          x="0"
          y="34"
          fill={textEnugu}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="36"
          fontWeight="900"
          letterSpacing="0.03em"
        >
          ENUGU
        </text>

        {/* ROW 2: [ BUY ] & [ SELL ] Badges */}
        <g id="BuySellRow" transform="translate(0, 44)">
          {/* [ BUY ] Badge */}
          <rect
            x="0"
            y="0"
            width="72"
            height="24"
            rx="6"
            fill={primaryGreen}
          />
          <text
            x="36"
            y="17"
            fill="#FFFFFF"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="14.5"
            fontWeight="900"
            letterSpacing="0.08em"
            textAnchor="middle"
          >
            BUY
          </text>

          {/* "&" Ampersand */}
          <text
            x="84"
            y="18"
            fill={textAmp}
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="16.5"
            fontWeight="900"
            textAnchor="middle"
          >
            &amp;
          </text>

          {/* [ SELL ] Badge */}
          <rect
            x="96"
            y="0"
            width="86"
            height="24"
            rx="6"
            fill={accentYellow}
          />
          <text
            x="139"
            y="17"
            fill={deepEmerald}
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="14.5"
            fontWeight="900"
            letterSpacing="0.08em"
            textAnchor="middle"
          >
            SELL
          </text>
        </g>

        {/* ROW 3: "— Powered by KINGSOK —" */}
        <g id="PoweredByKingsokRow" transform="translate(0, 83)">
          {/* Left Rule */}
          <line
            x1="0"
            y1="-3.5"
            x2="16"
            y2="-3.5"
            stroke={primaryGreen}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Text */}
          <text
            x="22"
            y="0"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="11.5"
            letterSpacing="0.03em"
          >
            <tspan fill={textPowered} fontWeight="700">Powered by </tspan>
            <tspan fill={textKingsok} fontWeight="900" letterSpacing="0.06em">KINGSOK</tspan>
          </text>

          {/* Right Rule */}
          <line
            x1="172"
            y1="-3.5"
            x2="188"
            y2="-3.5"
            stroke={primaryGreen}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

      </g>
    </svg>
  );
}

export default Logo;
