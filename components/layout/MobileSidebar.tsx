'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/brand/Logo';
import { getCurrentUser, getUserProfile, checkUserSellerStatus } from '@/lib/auth';
import {
  X,
  Home,
  LayoutGrid,
  Store,
  MessageCircle,
  Package,
  Settings,
  HelpCircle,
  User,
  CheckCircle2,
  BarChart3,
  Plus,
} from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [storeName, setStoreName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      if (!isOpen) return;
      const { user } = await getCurrentUser();
      if (user && isMounted) {
        const { profile } = await getUserProfile(user.id);
        const name =
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'EBS Member';
        setUserName(name);

        const sellerStatus = await checkUserSellerStatus(user.id);
        if (isMounted) {
          setIsSeller(sellerStatus.isSeller);
          if (sellerStatus.shops.length > 0) {
            setStoreName(sellerStatus.shops[0].name);
          }
        }
      } else if (isMounted) {
        setUserName(null);
        setIsSeller(false);
        setStoreName(null);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const menuLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Browse Catalog', href: '/browse', icon: LayoutGrid },
    { label: 'Campus Stores', href: '/shops', icon: Store },
    { label: 'Student Inbox', href: '/conversations', icon: MessageCircle },
    { label: 'Store Dashboard', href: '/seller/dashboard', icon: BarChart3 },
    { label: 'My Listings / Inventory', href: '/seller/products', icon: Package },
    { label: 'Sell Something', href: '/create-product', icon: Plus },
    { label: 'Account Settings', href: '/auth', icon: Settings },
    { label: 'Help & Support', href: '/conversations', icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-[300px] sm:w-[320px] bg-[#032B19] text-white h-full flex flex-col justify-between p-5 z-10 shadow-2xl overflow-y-auto"
          >
            {/* Top Section */}
            <div className="space-y-6">
              {/* Header with Logo + Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/60">
                <Logo variant="compact" theme="light" size="sm" />
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card Header */}
              <Link
                href="/auth"
                onClick={onClose}
                className="bg-[#053D24] hover:bg-[#074D2E] border border-emerald-700/50 rounded-2xl p-3.5 flex items-center gap-3 transition-colors block"
              >
                <div className="w-11 h-11 rounded-xl bg-white text-[#087443] font-black text-lg flex items-center justify-center shadow-md shrink-0">
                  {userName ? userName.charAt(0).toUpperCase() : 'E'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-white truncate">
                    {userName || 'Welcome to EBS'}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#FBBF24]">
                    {userName ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#FBBF24]" />
                        <span>
                          {isSeller
                            ? storeName
                              ? `Store: ${storeName}`
                              : 'Verified Merchant'
                            : 'Campus Member / Buyer'}
                        </span>
                      </>
                    ) : (
                      <span>Sign in to your account &rarr;</span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {menuLinks.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#087443] text-white shadow-xs'
                          : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#FBBF24]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Account */}
            <div className="pt-6 border-t border-emerald-800/60">
              <Link
                href="/auth"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-200 hover:bg-emerald-800/40 transition-colors"
              >
                <User className="w-4 h-4 text-emerald-300" />
                <span>Account / Sign In</span>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
