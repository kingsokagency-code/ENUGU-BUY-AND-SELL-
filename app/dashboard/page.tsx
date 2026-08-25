'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface DealItem {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent?: number;
  sellerName: string;
  isVerifiedSeller: boolean;
  location: string;
  viewersCount: number;
  imageUrl?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'deals' | 'overview'>('deals');
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Deal Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Phones & Tablets');
  const [originalPrice, setOriginalPrice] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [location, setLocation] = useState('Nsukka, Enugu');
  const [isVerified, setIsVerified] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verify Admin Session on mount
  useEffect(() => {
    let isMounted = true;
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/insights');
        if (isMounted) {
          setIsAdminAuthenticated(res.ok);
        }
      } catch {
        if (isMounted) {
          setIsAdminAuthenticated(false);
        }
      }
    }
    checkAdminAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setAdminAuthLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        fetchDeals();
      } else {
        setAdminAuthError(data.error || 'Invalid admin credentials. Access denied.');
      }
    } catch {
      setAdminAuthError('Server error while authenticating admin.');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  // Fetch all live deals
  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (data.success && data.deals) {
        setDeals(data.deals);
      }
    } catch {
      console.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch('/api/deals');
        const data = await res.json();
        if (isMounted && data.success && data.deals) {
          setDeals(data.deals);
        }
      } catch {
        console.error('Failed to load deals');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Publish New Live Deal
  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dealPrice || !sellerName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          originalPrice: originalPrice ? Number(originalPrice) : Number(dealPrice),
          dealPrice: Number(dealPrice),
          sellerName: sellerName.trim(),
          location: location.trim(),
          isVerifiedSeller: isVerified,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: '🎉 Deal published to live homepage successfully!' });
        setName('');
        setOriginalPrice('');
        setDealPrice('');
        setSellerName('');
        fetchDeals();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to publish deal.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Network error while publishing deal.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Deal
  const handleDeleteDeal = async (id: string) => {
    if (!confirm('Are you sure you want to remove this live deal?')) return;

    try {
      const res = await fetch(`/api/deals?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeals((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      alert('Failed to delete deal');
    }
  };

  const categoriesList = [
    'Phones & Tablets',
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Beauty & Health',
    'Vehicles',
    'Property',
  ];

  const campusLocations = [
    'UNEC Campus, Enugu',
    'UNN Campus, Nsukka',
    'Nsukka, Enugu',
    'Independence Layout, Enugu',
    'New Haven, Enugu',
    'Abakpa, Enugu',
    'Ogui Road, Enugu',
    'Gariki, Enugu',
  ];

  // 1. Loading State
  if (isAdminAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#087443] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  // 2. Admin Login Gate (BLOCKED)
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Admin Command Center
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your secure administrator master key to access live operations, deal controls, and campus metrics.
            </p>
          </div>

          {adminAuthError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
              {adminAuthError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Admin Password / Master Key
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-slate-900 rounded-xl pl-10 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{adminAuthLoading ? 'Authenticating...' : 'Unlock Admin Center'}</span>
            </button>
          </form>

          <Link
            href="/"
            className="block text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#111827] pb-16">
      
      {/* ── TOP BANNER ── */}
      <div className="bg-[#053D24] text-white py-8 px-4 sm:px-8 lg:px-12 border-b border-emerald-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Live Marketplace Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Seller &amp; Admin Command Center
            </h1>
            <p className="text-emerald-200/80 text-xs sm:text-sm font-medium">
              Manage real-time hot deals, verified merchant adverts, and campus listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 bg-white text-[#053D24] hover:bg-emerald-50 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <span>View Live Homepage</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-2 text-sm font-bold">
          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-[#087443] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-[#FBBF24]" />
            <span>Live Hot Deals Manager</span>
            <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-black">
              {deals.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: LIVE HOT DEALS MANAGER ── */}
        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. LEFT: ADD NEW LIVE DEAL FORM (5 COLS) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#087443] font-bold text-xs uppercase tracking-wider">
                  <Plus className="w-4 h-4" />
                  <span>Publish New Hot Deal</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Add Live Spotlight Item</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Newly published deals instantly cycle on the homepage 3D carousel.
                </p>
              </div>

              {feedbackMsg && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              <form onSubmit={handleAddDeal} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deal Title / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 14 Pro Max 256GB"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#087443] focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#087443] font-medium"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pricing: Original & Deal Price in Naira */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Original Price (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 620000"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#087443] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deal Price (₦) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 580000"
                      value={dealPrice}
                      onChange={(e) => setDealPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#087443] font-medium font-bold text-[#087443]"
                    />
                  </div>
                </div>

                {/* Seller Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seller / Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kingsley's Tech Hub"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#087443] font-medium"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campus / Enugu Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#087443] font-medium"
                  >
                    {campusLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verified Seller Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="verifiedCheck"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 text-[#087443] rounded-sm focus:ring-[#087443]"
                  />
                  <label htmlFor="verifiedCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Mark as Verified Seller (Shows ✔ Badge)
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#087443] hover:bg-[#065F37] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                  <span>{submitting ? 'Publishing Deal...' : 'Publish to Live Homepage'}</span>
                </button>

              </form>
            </div>

            {/* 2. RIGHT: ACTIVE LIVE DEALS LIST (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Active Live Deals</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Currently rotating on the homepage spotlight.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full">
                  {deals.length} Live Items
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  Loading live deals...
                </div>
              ) : deals.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
                  <Flame className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No active deals found</p>
                  <p className="text-xs text-slate-400">Use the form on the left to publish your first live deal.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal, idx) => (
                    <div
                      key={deal.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-[#053D24] text-white px-2 py-0.5 rounded-md">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{deal.category}</span>
                          {deal.isVerifiedSeller && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black bg-emerald-50 text-[#087443] px-1.5 py-0.5 rounded-sm">
                              <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                              Verified
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {deal.name}
                        </h4>

                        <div className="flex items-center gap-3 text-xs">
                          {deal.originalPrice > deal.dealPrice && (
                            <span className="text-slate-400 line-through font-medium">
                              ₦{deal.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="font-black text-[#087443] text-sm">
                            ₦{deal.dealPrice.toLocaleString()}
                          </span>
                          {deal.discountPercent ? (
                            <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-sm">
                              -{deal.discountPercent}%
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                          <span>🏪 {deal.sellerName}</span>
                          <span>📍 {deal.location}</span>
                          <span>👥 {deal.viewersCount} viewing</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
