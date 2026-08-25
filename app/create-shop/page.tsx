'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/telemetry';

import { ArrowLeft, CheckCircle2, Store, Plus } from 'lucide-react';

export default function CreateShopPage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('UNEC Campus, Enugu');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdShop, setCreatedShop] = useState<{ id: string; name: string; slug: string } | null>(null);

  // Auto-generate slug from name if user hasn't edited slug manually
  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, location }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setError('Authentication required. Please Sign In to register your campus storefront.');
      } else if (!res.ok) {
        setError(data.error || 'Failed to create shop');
      } else {
        setCreatedShop(data.shop);
        trackEvent('shop_created', { shop_id: data.shop.id, slug: data.shop.slug });
      }
    } catch {
      setError('Connection error while creating shop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[#111111] px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-semibold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#087443]/15">
            Storefront Setup
          </span>
        </div>

        <main className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">Create Your Campus Storefront</h1>
            <p className="text-xs sm:text-sm text-[#667085]">
              Get a persistent digital store and custom shareable link to showcase your products across Enugu.
            </p>
          </div>

          {createdShop ? (
            /* SUCCESS STATE */
            <div className="bg-white border border-[#087443]/30 rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-[#087443]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                  Congratulations! &ldquo;{createdShop.name}&rdquo; is Live
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] max-w-sm mx-auto">
                  Your custom shop link is ready: <strong className="text-[#087443]">/shops/{createdShop.slug}</strong>. Now add your first product to start attracting buyers!
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href={`/create-product?shop_id=${createdShop.id}`}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#087443] hover:bg-[#065f37] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Product</span>
                </Link>
                <Link
                  href={`/shops/${createdShop.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:border-slate-400 text-[#111111] font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-xs"
                >
                  <Store className="w-4 h-4 text-[#667085]" />
                  <span>View Your Store &rarr;</span>
                </Link>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center justify-between gap-2">
                    <span>{error}</span>
                    {error.includes('Sign In') && (
                      <Link href="/auth?redirect=/create-shop" className="bg-[#087443] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                        Sign In Now
                      </Link>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kingsley's Tech Hub"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Custom Shop URL Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#667085] bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200">
                      /shops/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="kingsley-tech"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl px-3.5 py-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Shop Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell buyers what you sell, campus delivery details, or operating hours..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl px-3.5 py-2.5 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="UNEC Campus, Enugu"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm"
                  >
                    {loading ? 'Creating Shop...' : 'Publish Digital Shop'}
                  </button>
                </div>

              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
