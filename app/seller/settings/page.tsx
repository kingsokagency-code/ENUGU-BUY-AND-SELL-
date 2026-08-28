'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { MobileSellerNav } from '@/components/seller/MobileBottomNav';
import {
  Settings, Store, ShieldCheck, MapPin, Globe,
  CheckCircle2, AlertCircle, ExternalLink, ArrowLeft,
  Save, Image as ImageIcon
} from 'lucide-react';
import { getCurrentUser, checkUserSellerStatus, type SellerStatus } from '@/lib/auth';
import { updateShopSettings } from '@/lib/commerce-client';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function SellerSettingsPage() {
  const router = useRouter();
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopLocation, setShopLocation] = useState('');
  const [shopLogoUrl, setShopLogoUrl] = useState('');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const { user } = await getCurrentUser();
    if (!user) {
      router.push('/auth?redirect=/seller/settings');
      return;
    }

    const status = await checkUserSellerStatus(user.id);
    if (!status.isSeller || status.shops.length === 0) {
      router.push('/create-shop');
      return;
    }

    setSellerStatus(status);

    const primaryShop = status.shops[0];
    setShopName(primaryShop.name || '');
    setShopDescription(primaryShop.description || '');
    setShopLocation(primaryShop.location || 'UNEC Campus, Enugu');
    setShopLogoUrl(primaryShop.logo_url || '');

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerStatus?.shops?.[0]) return;

    if (shopName.trim().length < 2) {
      setErrorMessage('Store name must be at least 2 characters');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const shopId = sellerStatus.shops[0].id;
    const res = await updateShopSettings(shopId, {
      name: shopName.trim(),
      description: shopDescription.trim(),
      location: shopLocation.trim(),
      logo_url: shopLogoUrl.trim() || null,
    });

    setIsSaving(false);

    if (res.success) {
      setSuccessMessage('Store settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadSettings();
    } else {
      setErrorMessage(res.error || 'Failed to update store settings');
    }
  };

  const primaryShop = sellerStatus?.shops?.[0];
  const storeName = primaryShop?.name || 'My Store';
  const storeSlug = primaryShop?.slug || 'store';
  const isVerified = primaryShop?.is_verified ?? false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A14] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0A8A50] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#6B9980]">Loading store configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1A14] text-white flex flex-col lg:flex-row">
      <SellerSidebar storeName={storeName} storeSlug={storeSlug} />

      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {/* Top Header */}
        <header className="bg-[#111D17] border-b border-[#243320] px-4 sm:px-8 py-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">Store Settings &amp; Branding</h1>
              <p className="text-[11px] text-[#6B9980]">
                Configure public storefront appearance and campus identity
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href={`/shops/${storeSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-xs font-semibold text-[#9CB3AA] hover:text-white border border-[#243320] transition-colors"
              >
                <span>View Live Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-[#0A8A50]/10 border border-[#0A8A50]/30 rounded-2xl text-[#6EE7B7] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Store Profile Card */}
          <div className="bg-[#1A2820] border border-[#243320] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#243320]">
              <div className="w-16 h-16 rounded-2xl bg-[#087443] flex items-center justify-center text-xl font-black text-white border border-[#0A8A50]/40 overflow-hidden shrink-0">
                {shopLogoUrl ? (
                  <img src={shopLogoUrl} alt={storeName} className="w-full h-full object-cover" />
                ) : (
                  storeName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">{storeName}</h2>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 bg-[#087443] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Merchant
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B9980]">
                  Public URL: <span className="text-[#34D399]">/shops/{storeSlug}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#9CB3AA] font-bold">Store Public Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  placeholder="e.g. Kingsok Gadgets &amp; Laptops"
                  className="w-full px-3.5 py-2.5 bg-[#111D17] border border-[#243320] rounded-xl text-white focus:outline-none focus:border-[#0A8A50]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#9CB3AA] font-bold">Store Description / Bio</label>
                <textarea
                  rows={4}
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  placeholder="Tell campus buyers about your products, hostel pickup locations, and warranty details..."
                  className="w-full p-3.5 bg-[#111D17] border border-[#243320] rounded-xl text-white placeholder-[#6B9980] focus:outline-none focus:border-[#0A8A50]"
                />
              </div>

              <div className="space-y-1.5">
                <ImageUpload
                  value={shopLogoUrl}
                  onChange={(url) => setShopLogoUrl(url || '')}
                  folder="shops"
                  label="Store Logo / Profile Picture"
                  helperText="Tap to take photo or choose from device gallery"
                  shape="square"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[#9CB3AA] font-bold">Primary Campus Location</label>
                  <select
                    value={shopLocation}
                    onChange={(e) => setShopLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#111D17] border border-[#243320] rounded-xl text-white focus:outline-none focus:border-[#0A8A50]"
                  >
                    <option value="UNEC Campus, Enugu">UNEC Campus, Enugu</option>
                    <option value="UNN Main Campus, Nsukka">UNN Main Campus, Nsukka</option>
                    <option value="ESUT Campus, Agbani">ESUT Campus, Agbani</option>
                    <option value="IMT Campus, Enugu">IMT Campus, Enugu</option>
                    <option value="Caritas University, Amorji-Nike">Caritas University, Amorji-Nike</option>
                    <option value="Godfrey Okoye University, Thinkers Corner">Godfrey Okoye University, Thinkers Corner</option>
                    <option value="Independence Layout, Enugu">Independence Layout, Enugu</option>
                    <option value="New Haven, Enugu">New Haven, Enugu</option>
                    <option value="Ogui Road, Enugu">Ogui Road, Enugu</option>
                    <option value="Abakpa Nike, Enugu">Abakpa Nike, Enugu</option>
                    <option value="Gariki, Enugu">Gariki, Enugu</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#243320]">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A8A50] hover:bg-[#087443] text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Store Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <MobileSellerNav />
    </div>
  );
}
