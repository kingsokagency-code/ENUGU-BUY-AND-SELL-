'use client';

import React from 'react';
import Link from 'next/link';
import { AdminSidebar } from './AdminSidebar';
import { ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A1410] text-white flex flex-col lg:flex-row">
      {/* Desktop Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Surface */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-[#0D1F17] border-b border-[#1D2B22] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-sm text-white">EBS Admin Center</span>
          </div>
          <Link
            href="/"
            className="text-xs text-[#9CB3AA] hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </Link>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
