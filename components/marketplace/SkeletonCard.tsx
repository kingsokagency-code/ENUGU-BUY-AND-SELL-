'use client';

/**
 * Reusable shimmer skeleton loading components for Enugu Buy & Sell
 */

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col h-full animate-shimmer shadow-xs">
      {/* 4:3 Image Area */}
      <div className="aspect-[4/3] w-full bg-slate-100" />

      {/* Body Content */}
      <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Price Bar */}
          <div className="h-5 w-24 bg-slate-200 rounded-md" />
          {/* Title Lines */}
          <div className="h-4 w-full bg-slate-100 rounded-md" />
          <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
        </div>

        {/* Footnote Bar */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="h-3.5 w-20 bg-slate-100 rounded" />
          <div className="h-3.5 w-12 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 animate-shimmer shadow-xs">
      {/* Header Monogram Row */}
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-slate-200" />
        <div className="h-5 w-16 bg-slate-100 rounded-md" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
        <div className="h-3.5 w-full bg-slate-100 rounded" />
        <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-3.5 w-24 bg-slate-100 rounded" />
        <div className="h-3.5 w-14 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export function CategoryPillsSkeleton() {
  return (
    <div className="flex items-center gap-2 overflow-hidden py-1 animate-shimmer">
      {[80, 72, 88, 64, 76, 92].map((w, i) => (
        <div
          key={i}
          className="h-9 rounded-xl bg-slate-200 shrink-0"
          style={{ width: `${w}px` }}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
