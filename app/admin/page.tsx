'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/ebs-ui/MetricCard';
import {
  Users, Store, Package, Flame, AlertOctagon,
  ShieldCheck, ArrowRight, ExternalLink, Activity, UserPlus,
} from 'lucide-react';

interface PlatformMetrics {
  total_users: number;
  active_shops: number;
  live_products: number;
  pending_reports: number;
  team_applications: number;
  new_applications: number;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    total_users: 0,
    active_shops: 0,
    live_products: 0,
    pending_reports: 0,
    team_applications: 0,
    new_applications: 0,
  });
  const [loading, setLoading] = useState(true);

  // Auth State
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.status === 401) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
        setNeedsAuth(false);
      }
    } catch {
      // Error fetching
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid admin credentials');
        return;
      }
      setNeedsAuth(false);
      loadMetrics();
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (needsAuth) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto my-12 bg-[#111D17] border border-[#1D2B22] rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
              SECURITY VERIFICATION
            </span>
            <h2 className="text-xl font-black text-white pt-1">Admin Command Center</h2>
            <p className="text-xs text-[#6B9980]">
              Enter your EBS administrator passkey to access the governance console.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Admin Passkey
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0A1410] border border-[#1D2B22] focus:border-amber-500 rounded-xl text-white text-sm outline-none font-mono text-center"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-bold text-center">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? 'Verifying...' : 'Unlock Admin Center'}
            </button>
          </form>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D2B22]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">EBS Admin Command Center</h1>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
              Live Database Connected
            </span>
          </div>
          <p className="text-xs text-[#6B9980] mt-0.5">
            Centralized governance, store verification, moderation &amp; recruitment command
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/applications"
            className="px-4 py-2 rounded-xl bg-[#087443] hover:bg-[#0A8A50] text-xs font-bold text-white transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Recruitment Dashboard ({metrics.team_applications})</span>
          </Link>
        </div>
      </div>

      {/* 4 Real Marketplace Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Registered Users"
          value={loading ? '...' : metrics.total_users.toString()}
          icon={<Users className="w-4 h-4" />}
          dark={true}
        />
        <MetricCard
          label="Active Campus Stores"
          value={loading ? '...' : metrics.active_shops.toString()}
          icon={<Store className="w-4 h-4" />}
          dark={true}
        />
        <MetricCard
          label="Live Listed Products"
          value={loading ? '...' : metrics.live_products.toString()}
          icon={<Package className="w-4 h-4" />}
          dark={true}
        />
        <MetricCard
          label="Volunteer Applications"
          value={loading ? '...' : metrics.team_applications.toString()}
          icon={<UserPlus className="w-4 h-4" />}
          dark={true}
        />
      </div>

      {/* Actionable Queues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volunteer Team Applications Card */}
        <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Volunteer Team Recruitment</h2>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                {metrics.team_applications} Total Applied
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
                Review Applications ({metrics.team_applications}) →
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

          <Link
            href="/admin/applications"
            className="text-xs font-bold text-amber-400 hover:underline mt-4 pt-3 border-t border-[#1D2B22] flex items-center justify-between"
          >
            <span>Open Candidate Evaluation Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Operations Column */}
        <div className="space-y-6">
          {/* Moderation Reports Alert */}
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-bold text-white">Moderation Queue</h2>
              </div>
              <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full">
                {metrics.pending_reports} Flagged
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
              Featured deals cycling on homepage carousel with live countdown timers.
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
        </div>
      </div>
    </AdminLayout>
  );
}
