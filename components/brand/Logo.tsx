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
 * 100% Vector SVG from the official master brand asset:
 * [3D Bag + Clean "e" + Arrows + Location Pin]  ENUGU
 *                                              [ BUY ] & [ SELL ]
 *                                              — Powered by KINGSOK —
 */
export function Logo({
  variant = 'full',
  size = 'md',
  width,
  height,
  className = '',
  theme = 'dark',
}: LogoProps) {
  // Proportional size presets maintaining exact 2.5:1 (1000:400) aspect ratio
  const dimensions = {
    sm: { width: 140, height: 56 },
    md: { width: 180, height: 72 },
    lg: { width: 240, height: 96 },
    xl: { width: 300, height: 120 },
  }[size];

  const displayWidth = width ?? dimensions.width;
  const displayHeight = height ?? dimensions.height;

  // ── VARIANT 1: ICON ONLY ──
  if (variant === 'icon') {
    const iconDim = size === 'sm' ? 40 : size === 'md' ? 52 : size === 'lg' ? 68 : 84;
    return (
      <svg
        viewBox="30 20 340 370"
        width={width ?? iconDim}
        height={height ?? iconDim}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className={`select-none shrink-0 block ${className}`}
        aria-label="Enugu Buy & Sell Icon"
      >
        <defs>
          <linearGradient id="iconBagFront" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="25%" stopColor="#16A34A" />
            <stop offset="65%" stopColor="#087443" />
            <stop offset="100%" stopColor="#02381E" />
          </linearGradient>
          <linearGradient id="iconBagSide" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="50%" stopColor="#065F38" />
            <stop offset="100%" stopColor="#012413" />
          </linearGradient>
          <linearGradient id="iconHandle" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="30%" stopColor="#22C55E" />
            <stop offset="70%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#052E16" />
          </linearGradient>
          <linearGradient id="iconGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="iconOrangePin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="40%" stopColor="#FB923C" />
            <stop offset="80%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="iconYellowArrow" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#FBBF24" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="iconGreenArrow" x1="0" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#86EFAC" />
          </linearGradient>
        </defs>

        {/* Handle */}
        <path d="M175 140 C175 45, 260 45, 260 140" stroke="url(#iconHandle)" strokeWidth="24" strokeLinecap="round" fill="none" />
        <ellipse cx="175" cy="144" rx="14" ry="9" fill="url(#iconGold)" stroke="#854D0E" strokeWidth="2.5" />
        <ellipse cx="260" cy="144" rx="14" ry="9" fill="url(#iconGold)" stroke="#854D0E" strokeWidth="2.5" />

        {/* Bag Body */}
        <path d="M120 142 L160 142 L105 348 C100 365, 85 365, 75 350 L50 295 L120 142 Z" fill="url(#iconBagSide)" />
        <path d="M142 142 L295 142 L345 330 C352 355, 335 368, 308 368 L125 368 C98 368, 85 352, 95 330 L142 142 Z" fill="url(#iconBagFront)" />
        <path d="M142 142 L295 142 L290 156 L137 156 Z" fill="#86EFAC" opacity="0.6" />

        {/* Green Exchange Arrow */}
        <path d="M260 340 C320 335, 345 285, 325 240" stroke="url(#iconGreenArrow)" strokeWidth="18" strokeLinecap="round" fill="none" />
        <polygon points="325,215 352,260 302,252" fill="#22C55E" stroke="#15803D" strokeWidth="2" />

        {/* Stylized White "e" */}
        <path d="M235 200 C175 190, 115 220, 105 285 C95 345, 140 375, 205 372 C255 370, 280 345, 288 318 L242 318 C235 332, 215 342, 195 340 C158 335, 145 305, 148 280 L288 280 C290 245, 275 208, 235 200 Z M152 255 C158 230, 195 220, 235 225 C255 228, 264 242, 265 255 L152 255 Z" fill="#FFFFFF" />

        {/* Yellow Loop Arrow */}
        <path d="M65 270 C30 300, 35 360, 95 372 C125 378, 155 365, 175 350" stroke="url(#iconYellowArrow)" strokeWidth="20" strokeLinecap="round" fill="none" />
        <polygon points="195,340 148,335 162,375" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />

        {/* Location Pin */}
        <g transform="translate(262, 168)">
          <path d="M32 0 C14.3 0, 0 14.3, 0 32 C0 55, 32 88, 32 88 C32 88, 64 55, 64 32 C64 14.3, 49.7 0, 32 0 Z" fill="url(#iconOrangePin)" stroke="#C2410C" strokeWidth="2" />
          <circle cx="32" cy="32" r="12" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  // ── VARIANT 2 & 3: FULL MASTER BRAND LOCKUP (100% Vector 1000x400) ──
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 400"
      width={displayWidth}
      height={displayHeight}
      fill="none"
      preserveAspectRatio="xMinYMid meet"
      className={`select-none shrink-0 block ${className}`}
      aria-label="ENUGU BUY & SELL — Powered by KINGSOK"
    >
      <defs>
        {/* Emerald Bag Front Face Gradient */}
        <linearGradient id="mbBagFrontGrad" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="25%" stopColor="#16A34A" />
          <stop offset="65%" stopColor="#087443" />
          <stop offset="100%" stopColor="#02381E" />
        </linearGradient>

        {/* Emerald Bag Side Panel Gradient */}
        <linearGradient id="mbBagSideGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#15803D" />
          <stop offset="50%" stopColor="#065F38" />
          <stop offset="100%" stopColor="#012413" />
        </linearGradient>

        {/* Tubular Bag Handle Gradient */}
        <linearGradient id="mbHandleGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="30%" stopColor="#22C55E" />
          <stop offset="70%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#052E16" />
        </linearGradient>

        {/* Gold Metallic Gradient */}
        <linearGradient id="mbGoldMetallic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="30%" stopColor="#FACC15" />
          <stop offset="70%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Orange Pin Gradient */}
        <linearGradient id="mbOrangePinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="80%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        {/* Yellow Exchange Arrow Gradient */}
        <linearGradient id="mbYellowArrowGrad" x1="0" y1="0" x2="1" y2="0.8">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#FBBF24" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Green Exchange Arrow Gradient */}
        <linearGradient id="mbGreenArrowGrad" x1="0" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#86EFAC" />
        </linearGradient>

        {/* 3D Bevel Gloss Top Highlight */}
        <linearGradient id="mbGlossHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ======================================================== */}
      {/* 1. 3D EMERALD SHOPPING BAG ICON (LEFT CLUSTER)           */}
      {/* ======================================================== */}
      <g id="ShoppingBagGroup" transform="translate(10, 0)">
        
        {/* Bag Handle */}
        <g id="BagHandle">
          <path
            d="M175 140 C175 45, 260 45, 260 140"
            stroke="url(#mbHandleGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="175" cy="144" rx="14" ry="9" fill="url(#mbGoldMetallic)" stroke="#854D0E" strokeWidth="2.5" />
          <ellipse cx="175" cy="144" rx="7" ry="4.5" fill="#052E16" />
          <ellipse cx="260" cy="144" rx="14" ry="9" fill="url(#mbGoldMetallic)" stroke="#854D0E" strokeWidth="2.5" />
          <ellipse cx="260" cy="144" rx="7" ry="4.5" fill="#052E16" />
        </g>

        {/* Bag Body 3D Perspective */}
        <g id="BagBody">
          <path
            d="M120 142 L160 142 L105 348 C100 365, 85 365, 75 350 L50 295 L120 142 Z"
            fill="url(#mbBagSideGrad)"
          />
          <path
            d="M142 142 L295 142 L345 330 C352 355, 335 368, 308 368 L125 368 C98 368, 85 352, 95 330 L142 142 Z"
            fill="url(#mbBagFrontGrad)"
          />
          <path
            d="M142 142 L295 142 L290 156 L137 156 Z"
            fill="#86EFAC"
            opacity="0.6"
          />
        </g>

        {/* Green Exchange Arrow */}
        <g id="GreenArrow">
          <path
            d="M260 340 C320 335, 345 285, 325 240"
            stroke="url(#mbGreenArrowGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            fill="none"
          />
          <polygon
            points="325,215 352,260 302,252"
            fill="#22C55E"
            stroke="#15803D"
            strokeWidth="2"
          />
        </g>

        {/* White Stylized Lowercase "e" (CLEAN UNCOVERED VECTOR) */}
        <g id="LetterE">
          <path
            d="M235 200 C175 190, 115 220, 105 285 C95 345, 140 375, 205 372 C255 370, 280 345, 288 318 L242 318 C235 332, 215 342, 195 340 C158 335, 145 305, 148 280 L288 280 C290 245, 275 208, 235 200 Z M152 255 C158 230, 195 220, 235 225 C255 228, 264 242, 265 255 L152 255 Z"
            fill="#FFFFFF"
          />
        </g>

        {/* Yellow Loop Arrow */}
        <g id="YellowArrow">
          <path
            d="M65 270 C30 300, 35 360, 95 372 C125 378, 155 365, 175 350"
            stroke="url(#mbYellowArrowGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            fill="none"
          />
          <polygon
            points="195,340 148,335 162,375"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="2.5"
          />
        </g>

        {/* Orange Location Pin */}
        <g id="LocationPin" transform="translate(262, 168)">
          <path
            d="M32 0 C14.3 0, 0 14.3, 0 32 C0 55, 32 88, 32 88 C32 88, 64 55, 64 32 C64 14.3, 49.7 0, 32 0 Z"
            fill="url(#mbOrangePinGrad)"
            stroke="#C2410C"
            strokeWidth="2"
          />
          <circle cx="32" cy="32" r="12" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
        </g>

      </g>

      {/* ======================================================== */}
      {/* 2. TYPOGRAPHY & BADGES CLUSTER (RIGHT SIDE)              */}
      {/* ======================================================== */}
      <g id="TypographyGroup" transform="translate(395, 0)">
        
        {/* "ENUGU" Wordmark */}
        <text
          x="0"
          y="180"
          fill={theme === 'light' ? '#FFFFFF' : '#002D1E'}
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontSize="112"
          fontWeight="900"
          letterSpacing="0.03em"
        >
          ENUGU
        </text>

        {/* "BUY" Emerald Badge */}
        <g id="BuyBadge" transform="translate(0, 208)">
          <rect
            x="0"
            y="0"
            width="185"
            height="76"
            rx="22"
            fill="url(#mbBagFrontGrad)"
            stroke="#22C55E"
            strokeWidth="3.5"
          />
          <text
            x="92.5"
            y="53"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            fontSize="46"
            fontWeight="900"
            letterSpacing="0.08em"
            textAnchor="middle"
          >
            BUY
          </text>
        </g>

        {/* "&" Ampersand */}
        <g id="AmpersandSymbol" transform="translate(196, 222)">
          <text
            x="13"
            y="42"
            fill={theme === 'light' ? '#CBD5E1' : '#334155'}
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            fontSize="36"
            fontWeight="900"
            textAnchor="middle"
          >
            &amp;
          </text>
        </g>

        {/* "SELL" Golden Yellow Badge */}
        <g id="SellBadge" transform="translate(232, 208)">
          <rect
            x="0"
            y="0"
            width="210"
            height="76"
            rx="22"
            fill="url(#mbYellowArrowGrad)"
            stroke="#FDE047"
            strokeWidth="3.5"
          />
          <text
            x="105"
            y="53"
            fill="#002D1E"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            fontSize="46"
            fontWeight="900"
            letterSpacing="0.06em"
            textAnchor="middle"
          >
            SELL
          </text>
        </g>

        {/* "— Powered by KINGSOK —" Sub-Brand */}
        <g id="PoweredByKingsok" transform="translate(0, 335)">
          <line x1="2" y1="12" x2="60" y2="12" stroke="#087443" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <text
            x="72"
            y="18"
            fill="#087443"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            fontSize="21"
            fontWeight="800"
            letterSpacing="0.14em"
          >
            Powered by <tspan fill={theme === 'light' ? '#FFFFFF' : '#002D1E'} fontWeight="900">KINGSOK</tspan>
          </text>
          <line x1="390" y1="12" x2="445" y2="12" stroke="#087443" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </g>

      </g>

    </svg>
  );
}

export default Logo;
