'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Star, Users, MessageCircle, UserPlus, Check, Award, Truck, RotateCcw, Lock } from 'lucide-react';
import { TrustBadge } from '@/components/ebs-ui/TrustBadge';
import { getCurrentUser } from '@/lib/auth';
import { initiateProductConversation } from '@/lib/messaging-client';

interface StoreHeroProps {
  id?: string;
  name: string;
  category?: string;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  followersCount?: number;
  isVerified?: boolean;
  location?: string;
  slug?: string;
  featuredProductId?: string;
}

export function StoreHero({
  name = 'Campus Store',
  category = 'Campus Merchant',
  description,
  rating = 4.8,
  reviewsCount = 0,
  followersCount = 0,
  isVerified = false,
  location,
  slug = 'store',
  featuredProductId,
}: StoreHeroProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [currentFollowers, setCurrentFollowers] = useState(followersCount);
  const [connecting, setConnecting] = useState(false);

  const getInitials = (n: string) => {
    return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'EBS';
  };

  const handleFollowToggle = () => {
    setFollowing(prev => {
      const next = !prev;
      setCurrentFollowers(f => next ? f + 1 : Math.max(0, f - 1));
      return next;
    });
  };

  const [notice, setNotice] = useState<string | null>(null);

  const handleMessageStore = async () => {
    try {
      setConnecting(true);
      setNotice(null);
      const { user } = await getCurrentUser();
      if (!user) {
        router.push(`/auth?redirect=${encodeURIComponent(`/shops/${slug}`)}`);
        return;
      }

      if (featuredProductId) {
        const res = await initiateProductConversation(featuredProductId);
        if (res.success && res.conversation?.id) {
          router.push(`/conversations/${res.conversation.id}`);
          return;
        }
      }

      // If store has no products listed yet
      setNotice('This store has no active products listed yet. Inquiries will open once products are published.');
      setTimeout(() => setNotice(null), 5000);
    } catch {
      setNotice('Unable to start conversation at this moment.');
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#0F1A14] via-[#111D17] to-[#1A2820] text-white border-b border-[#243320]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Main Store Banner Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
          {/* Store Big Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#087443] flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-xl shadow-[#087443]/30 border-2 border-white/10 shrink-0">
            {getInitials(name)}
          </div>

          {/* Store Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{name}</h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 bg-[#087443] text-white text-xs font-bold px-2.5 py-0.5 rounded-full self-center sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Merchant
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#9CB3AA] mt-1 font-medium">{category}</p>
            {description && (
              <p className="text-xs text-white/70 mt-1.5 max-w-xl line-clamp-2 leading-relaxed">{description}</p>
            )}

            {/* Metrics: Rating, Followers, Location */}
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start flex-wrap text-xs text-[#9CB3AA]">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-white/50 font-normal">({reviewsCount.toLocaleString()} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#0A8A50]" />
                <span className="text-white font-semibold">{currentFollowers.toLocaleString()}</span>
                <span>Followers</span>
              </div>
              {location && (
                <span className="text-white/60">• {location}</span>
              )}
            </div>

            {/* Follow & Message Buttons */}
            <div className="flex items-center gap-3 mt-5 justify-center sm:justify-start">
              <button
                onClick={handleFollowToggle}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  following
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-transparent text-white border border-white/30 hover:bg-white/10'
                }`}
              >
                {following ? <Check className="w-3.5 h-3.5 text-[#0A8A50]" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{following ? 'Following' : '+ Follow'}</span>
              </button>

              <button
                onClick={handleMessageStore}
                disabled={connecting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#087443] hover:bg-[#0A8A50] text-white text-xs font-bold transition-all shadow-md shadow-[#087443]/30 cursor-pointer disabled:opacity-50"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{connecting ? 'Connecting...' : 'Message'}</span>
              </button>
            </div>

            {notice && (
              <div className="mt-3 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-200 text-xs text-center sm:text-left animate-fadeIn">
                {notice}
              </div>
            )}
          </div>
        </div>

        {/* 4 Trust Badges Strip on Storefront */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#243320] text-xs text-[#9CB3AA]">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Award className="w-4 h-4 text-[#0A8A50] shrink-0" />
            <span className="font-semibold text-white/90">100% Original Products</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Truck className="w-4 h-4 text-[#0A8A50] shrink-0" />
            <span className="font-semibold text-white/90">Fast Campus Delivery</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <RotateCcw className="w-4 h-4 text-[#0A8A50] shrink-0" />
            <span className="font-semibold text-white/90">7 Days Return Guarantee</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Lock className="w-4 h-4 text-[#0A8A50] shrink-0" />
            <span className="font-semibold text-white/90">Secure Escrow Payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
