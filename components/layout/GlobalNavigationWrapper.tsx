'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileSellerNav } from '@/components/seller/MobileBottomNav';

export function GlobalNavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. Never show mobile bottom nav on admin routes
  const isAdmin = pathname.startsWith('/admin');

  // 2. Never show bottom nav inside active conversation chat room (to maximize message composer space)
  const isActiveChatRoom = pathname.startsWith('/conversations/') && pathname !== '/conversations';

  // 3. Show Seller Bottom Nav on all /seller/* pages
  const isSellerArea = pathname.startsWith('/seller');

  return (
    <>
      <div className="flex-1 flex flex-col w-full min-h-0">
        {children}
      </div>

      {/* Global Mobile Navigation Layer */}
      {!isAdmin && !isActiveChatRoom && (
        isSellerArea ? <MobileSellerNav /> : <BottomNav />
      )}
    </>
  );
}
