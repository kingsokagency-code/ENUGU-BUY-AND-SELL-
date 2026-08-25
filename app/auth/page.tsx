'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  resendVerificationEmail,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  checkUserSellerStatus,
  signOut,
  type SellerStatus,
} from '@/lib/auth';
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  RefreshCw,
  Sparkles,
  MessageCircle,
  ShoppingBag,
  Store,
  LogOut,
  LayoutGrid,
  BarChart3,
} from 'lucide-react';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('returnUrl') || '/';

  // Mode: 'signin' | 'signup' | 'verify-notice' | 'profile-complete' | 'account-hub' | 'success'
  const [mode, setMode] = useState<
    'signin' | 'signup' | 'verify-notice' | 'profile-complete' | 'account-hub' | 'success'
  >('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('UNEC Campus, Enugu');
  const [phone, setPhone] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerStatus | null>(null);

  // Initialize session & listen to auth state changes (e.g. from email link verification)
  useEffect(() => {
    let isMounted = true;

    async function handleUserSession(user: { id: string; email?: string; user_metadata?: { full_name?: string } } | null) {
      if (!user || !isMounted) return;

      setAuthenticatedUserId(user.id);
      if (user.email) setEmail(user.email);

      const { profile } = await getUserProfile(user.id);
      const sellerRes = await checkUserSellerStatus(user.id);
      if (isMounted) setSellerInfo(sellerRes);

      if (profile) {
        if (isMounted) {
          setFullName(profile.full_name || user.user_metadata?.full_name || '');
          setLocation(profile.location || 'UNEC Campus, Enugu');
          setPhone(profile.phone || '');
        }

        // If location is not set, prompt profile completion
        if (!profile.location) {
          if (isMounted) setMode('profile-complete');
        } else {
          // Profile is complete: show the Account Hub
          if (isMounted) {
            setMode((currentMode) =>
              currentMode !== 'verify-notice' && currentMode !== 'profile-complete'
                ? 'account-hub'
                : currentMode
            );
          }
        }
      } else {
        // New user from OAuth or email confirmation without row yet
        if (isMounted) setMode('profile-complete');
      }
    }

    // Check current session on mount
    getCurrentUser().then(({ user }) => {
      if (user) handleUserSession(user);
    });

    // Subscribe to auth state changes (such as email confirmation link redirects)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMounted) {
        handleUserSession(session.user);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Handle Email Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const res = await signInWithEmail({ email, password });
      if (res.error) {
        if (res.error.isUnverified) {
          setMode('verify-notice');
        } else {
          setError(res.error.message);
        }
      } else if (res.data?.user) {
        setAuthenticatedUserId(res.data.user.id);
        const { profile } = await getUserProfile(res.data.user.id);
        const sellerRes = await checkUserSellerStatus(res.data.user.id);
        setSellerInfo(sellerRes);

        if (!profile?.location) {
          setFullName(profile?.full_name || res.data.user.user_metadata?.full_name || '');
          setMode('profile-complete');
        } else {
          setFullName(profile.full_name || '');
          setLocation(profile.location);
          setPhone(profile.phone || '');

          if (redirectUrl && redirectUrl !== '/' && redirectUrl !== '/auth') {
            setMode('success');
            setTimeout(() => {
              router.push(redirectUrl);
            }, 1000);
          } else {
            setMode('account-hub');
          }
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const res = await signUpWithEmail({ email, password, fullName });
      if (res.error) {
        setError(res.error.message);
      } else if (res.data?.needsEmailVerification) {
        setMode('verify-notice');
      } else if (res.data?.user) {
        setAuthenticatedUserId(res.data.user.id);
        setMode('profile-complete');
      }
    } catch {
      setError('Sign up failed. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Sign In
  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);
    const res = await signInWithGoogle(redirectUrl);
    if (res.error) {
      setError(res.error.message);
      setGoogleLoading(false);
    }
  };

  // Handle Resend Verification Email
  const handleResendVerification = async () => {
    if (!email) {
      setError('Please provide your email address to resend confirmation.');
      return;
    }
    setResending(true);
    setError(null);
    setNotice(null);

    const res = await resendVerificationEmail(email);
    setResending(false);

    if (res.success) {
      setNotice('Verification email sent! Please check your inbox and spam folder.');
    } else {
      setError(res.error || 'Failed to resend confirmation email. Please try again.');
    }
  };

  // Handle Profile Completion
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedUserId) {
      setError('User session not found. Please log in again.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await updateUserProfile(authenticatedUserId, {
        full_name: fullName.trim(),
        location: location.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
      });

      if (!res.success) {
        setError(res.error || 'Failed to update profile.');
      } else {
        const sellerRes = await checkUserSellerStatus(authenticatedUserId);
        setSellerInfo(sellerRes);

        if (redirectUrl && redirectUrl !== '/' && redirectUrl !== '/auth') {
          setMode('success');
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1000);
        } else {
          setMode('account-hub');
        }
      }
    } catch {
      setError('An unexpected error occurred while saving profile.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setAuthenticatedUserId(null);
    setFullName('');
    setEmail('');
    setSellerInfo(null);
    setMode('signin');
    setLoading(false);
  };

  const campusLocations = [
    'UNEC Campus, Enugu',
    'UNN Campus, Nsukka',
    'Nsukka, Enugu',
    'Independence Layout, Enugu',
    'New Haven, Enugu',
    'Abakpa, Enugu',
    'Ogui Road, Enugu',
    'Gariki, Enugu',
    'Trans-Ekulu, Enugu',
    'Enugu Metropolis',
  ];

  return (
    <div className="text-[#111111] px-4 py-8 max-w-lg mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-semibold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#087443]/15 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure Auth</span>
        </span>
      </div>

      {/* Header Badge & Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
          {mode === 'verify-notice' ? (
            <Mail className="w-6 h-6 animate-pulse" />
          ) : mode === 'profile-complete' ? (
            <User className="w-6 h-6" />
          ) : mode === 'account-hub' ? (
            <User className="w-6 h-6" />
          ) : mode === 'success' ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <ShieldCheck className="w-6 h-6" />
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
          {mode === 'signin' && 'Sign In to Your Account'}
          {mode === 'signup' && 'Create Your EBS Account'}
          {mode === 'verify-notice' && 'Verify Your Email'}
          {mode === 'profile-complete' && 'Complete Your Profile'}
          {mode === 'account-hub' && 'Your Account Hub'}
          {mode === 'success' && 'Welcome to Enugu Buy & Sell'}
        </h1>
        <p className="text-xs sm:text-sm text-[#667085]">
          {mode === 'signin' && 'Enter your email and password to access the marketplace.'}
          {mode === 'signup' && 'Join the Enugu campus marketplace to buy, sell, and connect.'}
          {mode === 'verify-notice' && `We sent a confirmation link to ${email || 'your email'}.`}
          {mode === 'profile-complete' && 'Just a few details to personalize your marketplace experience.'}
          {mode === 'account-hub' && 'Manage your buyer identity, inquiries, and merchant tools.'}
          {mode === 'success' && 'Authentication complete! Redirecting to marketplace...'}
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white py-7 px-6 sm:px-8 shadow-xs border border-slate-200/90 rounded-2xl space-y-5">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        {notice && (
          <div className="bg-[#E8F5EF] border border-[#087443]/30 text-[#087443] text-xs p-3.5 rounded-xl font-semibold">
            {notice}
          </div>
        )}

        {/* ── MODE: SIGN IN / SIGN UP TABS ── */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="space-y-5">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#087443] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#087443] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Google OAuth Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  or with email
                </span>
              </div>
            </div>

            {/* SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="student@unn.edu.ng or your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chinedu Okeke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. chinedu@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Create Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[#667085] leading-relaxed">
                  By signing up, you agree to Enugu Buy &amp; Sell community rules and campus trade guidelines.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── MODE: EMAIL VERIFICATION PENDING NOTICE ── */}
        {mode === 'verify-notice' && (
          <div className="space-y-4 text-center">
            <div className="bg-[#E8F5EF] p-4 rounded-xl border border-[#087443]/20 space-y-2">
              <div className="text-xs font-bold text-[#087443] flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                <span>Verification Link Sent</span>
              </div>
              <p className="text-xs text-slate-700">
                Please check your inbox at <strong className="text-[#087443]">{email}</strong> and click the confirmation link to activate your account.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={resending}
                onClick={handleResendVerification}
                className="w-full bg-white border border-slate-300 hover:border-slate-400 text-[#111111] font-semibold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Resending Link...' : 'Resend Verification Email'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="w-full text-xs font-semibold text-[#667085] hover:text-[#087443] py-2 transition-colors cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* ── MODE: PROFILE COMPLETION ── */}
        {mode === 'profile-complete' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="bg-[#E8F5EF] p-3 rounded-xl border border-[#087443]/20 text-xs text-[#087443] font-medium">
              🎉 Email verified! Complete your basic profile to proceed.
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Campus Location *
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none"
                >
                  {campusLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#111111]">
                  WhatsApp Phone Number
                </label>
                <span className="text-[10px] text-slate-500 font-medium">(Optional for trade inquiries)</span>
              </div>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {loading ? 'Saving Profile...' : 'Complete Profile & Enter Marketplace'}
            </button>
          </form>
        )}

        {/* ── MODE: AUTHENTICATED ACCOUNT HUB ── */}
        {mode === 'account-hub' && (
          <div className="space-y-6">
            {/* Identity Profile Banner */}
            <div className="bg-gradient-to-br from-[#053D24] to-[#087443] text-white p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white text-[#087443] font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white truncate">
                      {fullName || 'EBS Member'}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 text-emerald-100 px-2 py-0.5 rounded-md border border-white/10">
                      <CheckCircle2 className="w-3 h-3 text-[#FBBF24]" />
                      <span>{sellerInfo?.isSeller ? 'Verified Merchant' : 'Campus Buyer'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 truncate mt-0.5">{email}</p>
                </div>
              </div>

              {/* Identity Details Row (Campus + WhatsApp) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-emerald-700/50 text-xs">
                <div className="bg-black/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-emerald-200/70 block font-semibold">Campus Location</span>
                    <span className="text-white font-bold truncate block">{location}</span>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-emerald-200/70 block font-semibold">WhatsApp Number</span>
                    <span className="text-white font-bold truncate block">{phone || 'Not added yet'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Profile Edit Button */}
              <button
                type="button"
                onClick={() => setMode('profile-complete')}
                className="w-full bg-white/10 hover:bg-white/20 text-emerald-100 text-xs font-semibold py-2 rounded-xl transition-colors text-center cursor-pointer"
              >
                ✏️ Edit Profile Details / WhatsApp Number
              </button>
            </div>

            {/* Seller CTA or Seller Dashboard Card */}
            {sellerInfo?.isSeller ? (
              <div className="bg-[#E8F5EF] border border-[#087443]/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#087443]">
                    <Store className="w-4 h-4" />
                    <span>Your Store: {sellerInfo.shops[0]?.name}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#087443] text-white px-2 py-0.5 rounded-full">
                    Merchant Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/seller/dashboard"
                    className="bg-[#087443] hover:bg-[#065f37] text-white font-bold text-xs py-2.5 px-3 rounded-xl text-center shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Seller Dashboard</span>
                  </Link>
                  <Link
                    href="/seller/products"
                    className="bg-white border border-[#087443]/30 hover:border-[#087443] text-[#087443] font-bold text-xs py-2.5 px-3 rounded-xl text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Inventory</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAFAF8] border border-amber-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                  <h3 className="text-xs font-bold text-slate-800">Want to sell on campus?</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Start your own verified campus storefront in 2 minutes. Reach students in UNEC, UNN, and Enugu metropolis.
                </p>
                <Link
                  href="/create-shop"
                  className="block w-full bg-[#087443] hover:bg-[#065f37] text-white font-bold text-xs py-2.5 px-3 rounded-xl text-center shadow-xs transition-all"
                >
                  Create Storefront Now &rarr;
                </Link>
              </div>
            )}

            {/* Buyer Quick Links */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Buyer Activities
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/conversations"
                  className="bg-[#FAFAF8] hover:bg-slate-100 border border-slate-200 p-3 rounded-xl transition-all flex items-center gap-2.5 text-xs font-bold text-slate-800"
                >
                  <MessageCircle className="w-4 h-4 text-[#087443]" />
                  <span>Student Inbox</span>
                </Link>
                <Link
                  href="/browse"
                  className="bg-[#FAFAF8] hover:bg-slate-100 border border-slate-200 p-3 rounded-xl transition-all flex items-center gap-2.5 text-xs font-bold text-slate-800"
                >
                  <LayoutGrid className="w-4 h-4 text-[#087443]" />
                  <span>Browse Catalog</span>
                </Link>
              </div>
            </div>

            {/* Logout Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/"
                className="text-xs font-semibold text-[#087443] hover:underline"
              >
                ← Back to Marketplace
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* ── MODE: SUCCESS ── */}
        {mode === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-[#087443]" />
            </div>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Signed in successfully. You can now chat directly with sellers, explore the campus catalog, or launch your storefront!
            </p>
            <Link
              href={redirectUrl}
              className="block w-full bg-[#087443] hover:bg-[#065f37] text-white font-bold text-sm py-3.5 rounded-xl text-center shadow-xs transition-all"
            >
              {redirectUrl !== '/' ? 'Continue to Destination &rarr;' : 'Explore Marketplace Now &rarr;'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#087443] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}


