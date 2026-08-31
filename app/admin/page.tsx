'use client';

import React from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/ebs-ui/MetricCard';
import {
  Users, Store, Package, Flame, AlertOctagon,
  ShieldCheck, ArrowRight, ExternalLink, Activity,
} from 'lucide-react';

export default function AdminOverviewPage() {
  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D2B22]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">EBS Admin Command Center</h1>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
              Platform Live
            </span>
          </div>
          <p className="text-xs text-[#6B9980] mt-0.5">
            Centralized governance, store verification, moderation & marketplace health
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/stores"
            className="px-4 py-2 rounded-xl bg-[#087443] hover:bg-[#0A8A50] text-xs font-bold text-white transition-colors"
          >
            Review 3 Pending Stores
          </Link>
        </div>
      </div>

      {/* 4 Marketplace Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Total Registered Users"
          value="10,247"
          change={14.2}
          icon={<Users className="w-4 h-4" />}
          dark={true}
          isDemo={true}
        />
        <MetricCard
          label="Active Campus Stores"
          value="512"
          change={8.5}
          icon={<Store className="w-4 h-4" />}
          dark={true}
          isDemo={true}
        />
        <MetricCard
          label="Live Listed Products"
          value="8,340"
          change={21.0}
          icon={<Package className="w-4 h-4" />}
          dark={true}
          isDemo={true}
        />
        <MetricCard
          label="Pending Reports"
          value="7"
          icon={<AlertOctagon className="w-4 h-4" />}
          dark={true}
          isDemo={true}
        />
      </div>

      {/* Actionable Queues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Stores Approval Queue */}
        <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#0A8A50]" />
                <h2 className="text-sm font-bold text-white">Pending Store Approvals</h2>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                3 Waiting
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Franco Gadget Hub', owner: 'Emeka Obi', campus: 'UNN Franco', date: '10m ago' },
                { name: 'Nsukka Fresh Groceries', owner: 'Blessing K.', campus: 'Hilltop UNN', date: '1h ago' },
                { name: 'IMT Tech Repairs', owner: 'David U.', campus: 'IMT Campus 1', date: '3h ago' },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#1A2820] border border-[#243320] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{s.name}</p>
                    <p className="text-[10px] text-[#6B9980]">{s.owner} • {s.campus} • {s.date}</p>
                  </div>
                  <Link
                    href="/admin/stores"
                    className="px-3 py-1.5 rounded-lg bg-[#087443] hover:bg-[#0A8A50] text-[11px] font-bold text-white transition-colors shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/stores"
            className="text-xs font-bold text-[#0A8A50] hover:underline mt-4 pt-3 border-t border-[#1D2B22] flex items-center justify-between"
          >
            <span>Manage all merchant storefronts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Operations & Recruitment Column */}
        <div className="space-y-6">
          {/* Volunteer Team Applications Card */}
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Volunteer Team Applications</h2>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                Active Funnel
              </span>
            </div>
            <p className="text-xs text-[#6B9980] mb-4">
              Real-time candidate intake, evidence-based scoring (0–100), and interview claim validation.
            </p>
            <div className="flex gap-2 text-xs">
              <Link
                href="/admin/applications"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-center font-black text-slate-950 transition-colors shadow-xs"
              >
                Review Applications →
              </Link>
              <Link
                href="/join-team"
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-center font-semibold text-[#9CB3AA] border border-[#243320]"
              >
                View Public Page
              </Link>
            </div>
          </div>

          {/* Hot Deals Manager Card */}
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F97316]" />
                <h2 className="text-sm font-bold text-white">Hot Deals Curator</h2>
              </div>
              <Link href="/admin/deals" className="text-xs font-bold text-[#F97316] hover:underline">
                Manage Deals →
              </Link>
            </div>
            <p className="text-xs text-[#6B9980] mb-4">
              5 active deals cycling on homepage carousel with countdown timers.
            </p>
            <div className="flex gap-2 text-xs">
              <Link href="/admin/deals" className="flex-1 py-2 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-center font-semibold text-white border border-[#243320]">
                Add New Hot Deal
              </Link>
              <Link href="/" target="_blank" className="flex-1 py-2 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-center font-semibold text-[#9CB3AA] border border-[#243320]">
                Preview Homepage
              </Link>
            </div>
          </div>

          {/* Moderation Reports Alert */}
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-bold text-white">Moderation Queue</h2>
              </div>
              <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full">
                7 Flagged
              </span>
            </div>
            <p className="text-xs text-[#6B9980] mb-3">
              User-submitted reports for suspected duplicates, pricing violations or policy checks.
            </p>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:underline"
            >
              <span>Open Moderation Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
