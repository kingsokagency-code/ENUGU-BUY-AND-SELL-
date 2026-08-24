'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Menu,
  MapPin,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Car,
  MoreHorizontal,
  Plus,
  MessageCircle,
  User,
  LayoutGrid,
  Laptop,
} from 'lucide-react';

export function HeroPhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 7 }}
      animate={{ opacity: 1, y: 0, rotate: 7 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{
        filter: 'drop-shadow(0 30px 35px rgba(0,0,0,0.45))',
        transformOrigin: 'center center',
      }}
      className="hidden lg:block absolute right-[2%] xl:right-[4%] -bottom-[40px] xl:-bottom-[50px] w-[31vw] max-w-[420px] xl:max-w-[460px] z-30 pointer-events-none select-none"
    >
      {/* Ambient Glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#087443]/30 via-[#FBBF24]/15 to-transparent blur-2xl rounded-[50px] pointer-events-none" />

      {/* Phone Hardware Chassis */}
      <div className="relative bg-[#0A0D0B] p-3 rounded-[46px] shadow-2xl border-[4px] border-[#223528] ring-1 ring-white/15">
        
        {/* Dynamic Island / Earpiece Top */}
        <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-30 flex items-center justify-end px-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/90 ring-1 ring-black" />
        </div>

        {/* Screen Display Container */}
        <div className="relative bg-[#022413] text-white rounded-[38px] overflow-hidden flex flex-col h-[590px] xl:h-[620px] border border-emerald-950/80">
          
          {/* Status Bar */}
          <div className="pt-3.5 px-7 flex justify-between items-center text-[10.5px] font-bold text-white/85 shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px]">5G</span>
              <div className="w-4.5 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-[#10B981] rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Mobile App Header */}
          <div className="px-4.5 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-official.png"
                alt="Enugu Buy & Sell"
                className="h-7.5 w-auto object-contain"
              />
            </div>
            <div className="w-7.5 h-7.5 rounded-lg bg-white/10 flex items-center justify-center text-white/90">
              <Menu className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Scrollable Body */}
          <div className="flex-1 overflow-hidden px-4 space-y-3 pb-16">
            
            {/* Search Bar */}
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                placeholder="Search for anything..."
                className="w-full bg-white text-slate-800 text-[11px] font-semibold rounded-full pl-4 pr-8 py-2.5 shadow-sm outline-none placeholder:text-slate-400"
              />
              <div className="absolute right-1.5 w-7 h-7 rounded-full bg-[#087443] flex items-center justify-center text-white">
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* "Buy. Sell. Connect." Hero Card */}
            <div className="bg-[#053D24] border border-emerald-700/50 rounded-2xl p-3 text-left relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white">Buy. Sell. Connect.</h4>
                  <p className="text-[9.5px] text-emerald-100/90 mt-0.5">The easier way to trade in Enugu.</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#FBBF24] text-[#022413] flex items-center justify-center shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-black text-white px-0.5">
                <span>Top Categories</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#087443] flex items-center justify-center shadow-xs">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] font-bold text-white/90 truncate w-full">Electronics</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#087443] flex items-center justify-center shadow-xs">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] font-bold text-white/90 truncate w-full">Fashion</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#087443] flex items-center justify-center shadow-xs">
                    <HomeIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] font-bold text-white/90 truncate w-full">Home</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#087443] flex items-center justify-center shadow-xs">
                    <Car className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] font-bold text-white/90 truncate w-full">Vehicles</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#087443] flex items-center justify-center shadow-xs">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] font-bold text-white/90 truncate w-full">More</span>
                </div>
              </div>
            </div>

            {/* Popular Near You Mobile Listings */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[11px] font-black text-white px-0.5">
                <span>Popular Near You</span>
                <span className="text-[9.5px] font-bold text-[#FBBF24]">See all</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-white text-slate-900 rounded-xl p-1.5 shadow-xs space-y-1">
                  <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Smartphone className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="text-[8.5px] font-bold text-slate-800 truncate">iPhone 12</div>
                  <div className="text-[9.5px] font-black text-[#087443]">₦265,000</div>
                  <div className="text-[7.5px] text-slate-400 truncate">Enugu</div>
                </div>

                <div className="bg-white text-slate-900 rounded-xl p-1.5 shadow-xs space-y-1">
                  <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Shirt className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="text-[8.5px] font-bold text-slate-800 truncate">Air Force 1</div>
                  <div className="text-[9.5px] font-black text-[#087443]">₦84,000</div>
                  <div className="text-[7.5px] text-slate-400 truncate">Ogul</div>
                </div>

                <div className="bg-white text-slate-900 rounded-xl p-1.5 shadow-xs space-y-1">
                  <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Laptop className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="text-[8.5px] font-bold text-slate-800 truncate">HP Laptop</div>
                  <div className="text-[9.5px] font-black text-[#087443]">₦310,000</div>
                  <div className="text-[7.5px] text-slate-400 truncate">Coal Camp</div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom App Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#011C0F]/95 backdrop-blur-md border-t border-emerald-900/60 py-2.5 px-5 flex items-center justify-around text-white/70">
            <div className="flex flex-col items-center text-[#10B981]">
              <HomeIcon className="w-4 h-4" />
              <span className="text-[8px] font-bold mt-0.5">Home</span>
            </div>
            <div className="flex flex-col items-center">
              <LayoutGrid className="w-4 h-4" />
              <span className="text-[8px] font-medium mt-0.5">Categories</span>
            </div>
            <div className="flex flex-col items-center -mt-3">
              <div className="w-8.5 h-8.5 rounded-full bg-[#087443] text-white flex items-center justify-center shadow-md border-2 border-[#022413]">
                <Plus className="w-4.5 h-4.5 stroke-[3]" />
              </div>
              <span className="text-[8px] font-bold text-[#10B981] mt-0.5">Sell</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="w-4 h-4" />
              <span className="text-[8px] font-medium mt-0.5">Inbox</span>
            </div>
            <div className="flex flex-col items-center">
              <User className="w-4 h-4" />
              <span className="text-[8px] font-medium mt-0.5">Profile</span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
