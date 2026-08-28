'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  ShoppingBag, Heart, MessageCircle, Clock,
  Store, ChevronRight, Package, ShieldCheck,
  CheckCircle2, ArrowRight, AlertCircle, LogOut,
  Edit3, Camera, X,
} from 'lucide-react';
import { getCurrentUser, getUserProfile, updateUserProfile, signOut, checkUserSellerStatus, type UserProfile, type SellerStatus } from '@/lib/auth';
import { getOrders } from '@/lib/commerce-client';
import type { Order } from '@/lib/types/commerce';

export default function BuyerAccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Edit Profile Modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const loadAccountData = async () => {
    setLoading(true);
    const { user } = await getCurrentUser();
    if (!user) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setUserId(user.id);

    // Load Profile
    const { profile: userProfile } = await getUserProfile(user.id);
    setProfile(userProfile);

    // Load Seller Status
    const status = await checkUserSellerStatus(user.id);
    setSellerStatus(status);

    // Load Real Buyer Orders
    const orderRes = await getOrders('buyer');
    if (orderRes.success) {
      setOrders(orderRes.orders);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  const handleOpenEdit = () => {
    setEditName(profile?.full_name || '');
    setEditPhone(profile?.phone || '');
    setEditLocation(profile?.location || 'Enugu, Nigeria');
    setEditAvatarUrl(profile?.avatar_url || null);
    setProfileError(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (editName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }

    setSavingProfile(true);
    setProfileError(null);

    const res = await updateUserProfile(userId, {
      full_name: editName.trim(),
      phone: editPhone.trim() || undefined,
      location: editLocation.trim() || 'Enugu, Nigeria',
      avatar_url: editAvatarUrl || undefined,
    });

    setSavingProfile(false);

    if (res.success) {
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(null), 3000);
      setIsEditingProfile(false);
      loadAccountData();
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // 1. Unauthenticated View
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E8F8EF] text-[#087443] flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#0D1F17]">My Account &amp; Orders</h1>
          <p className="text-xs text-slate-500">Sign in to track your campus purchases, saved storefronts, and manage your profile.</p>
          <div className="pt-2">
            <Link
              href="/auth?redirect=/account"
              className="bg-[#087443] hover:bg-[#065f35] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all inline-block shadow-sm"
            >
              Sign In to Your Account
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-4">
          <div className="h-28 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        </main>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const activeOrdersCount = orders.filter(o => !['completed', 'cancelled'].includes(o.order_status)).length;

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-[#E5EDE9] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              onClick={handleOpenEdit}
              className="relative w-16 h-16 rounded-2xl bg-[#087443] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm overflow-hidden cursor-pointer group"
              title="Click to edit profile picture"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.full_name || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                (profile?.full_name || 'U').slice(0, 2).toUpperCase()
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-[#0D1F17] truncate">
                  {profile?.full_name || 'Campus Buyer'}
                </h1>
                {profile?.is_verified && <ShieldCheck className="w-4 h-4 text-[#087443] shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{profile?.location || 'Enugu, Nigeria'}</p>
              {profile?.phone && <p className="text-[11px] text-slate-400 mt-0.5">{profile.phone}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenEdit}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {sellerStatus?.isSeller ? (
              <Link
                href="/seller/dashboard"
                className="bg-[#053D24] hover:bg-[#032817] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Seller Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/create-shop"
                className="bg-[#E8F8EF] hover:bg-[#d5f3e2] text-[#087443] text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-[#087443]/20 flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Open a Store</span>
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="text-slate-500 hover:text-red-600 text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile Success / Error Alerts */}
        {profileSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Edit Your Profile</h3>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {profileError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                {/* Avatar Photo Upload */}
                <ImageUpload
                  value={editAvatarUrl}
                  onChange={(url) => setEditAvatarUrl(url)}
                  folder="avatars"
                  label="Profile Picture / Avatar"
                  helperText="Tap to take photo or choose from device"
                  shape="circle"
                />

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Chinedu Eze"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Campus / Town Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. UNEC Campus, Enugu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 rounded-xl bg-[#087443] hover:bg-[#065f35] text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Real Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-[#E5EDE9] p-4 text-center shadow-2xs">
            <p className="text-[11px] text-slate-500 font-bold">Total Orders</p>
            <p className="text-base sm:text-xl font-black text-[#0D1F17] mt-1">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5EDE9] p-4 text-center shadow-2xs">
            <p className="text-[11px] text-slate-500 font-bold">Active Orders</p>
            <p className="text-base sm:text-xl font-black text-[#087443] mt-1">{activeOrdersCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5EDE9] p-4 text-center shadow-2xs">
            <p className="text-[11px] text-slate-500 font-bold">Total Spent</p>
            <p className="text-base sm:text-xl font-black text-[#0D1F17] mt-1">₦{totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Real Orders History */}
        <div className="bg-white rounded-3xl border border-[#E5EDE9] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EDE9]">
            <h2 className="text-sm font-bold text-[#0D1F17]">Order History &amp; Tracking</h2>
            <span className="text-xs text-slate-400">{orders.length} orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No Orders Placed Yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                When you buy from verified campus merchants, your purchases will appear here with live progress tracking.
              </p>
              <div className="pt-2">
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#087443] hover:underline"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((ord) => {
                const firstItem = ord.items?.[0];
                const itemsCount = ord.items?.length || 1;
                const isFinished = ['completed', 'delivered'].includes(ord.order_status);
                const isCancelled = ord.order_status === 'cancelled';

                return (
                  <Link
                    key={ord.id}
                    href={`/orders/${ord.id}`}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 -mx-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] text-[#087443] flex items-center justify-center font-bold text-xs shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#087443] transition-colors truncate">
                            #{ord.order_number}
                          </p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isFinished
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.order_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {ord.shop?.name || 'Verified Store'} • {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          {firstItem?.product?.name ? ` (${firstItem.product.name})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          ₦{Number(ord.total_amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(ord.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
