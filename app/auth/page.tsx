'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  signUpWithEmail,
  signInWithEmail,
  resendVerificationEmail,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
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
} from 'lucide-react';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('returnUrl') || '/';

  // Mode: 'signin' | 'signup' | 'verify-notice' | 'profile-complete' | 'success'
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify-notice' | 'profile-complete' | 'success'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('UNEC Campus, Enugu');
  const [phone, setPhone] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    async function checkCurrentSession() {
      const { user } = await getCurrentUser();
      if (user) {
        setAuthenticatedUserId(user.id);
        const { profile } = await getUserProfile(user.id);
        if (profile) {
          setFullName(profile.full_name || '');
          setLocation(profile.location || 'UNEC Campus, Enugu');
          setPhone(profile.phone || '');
        }
      }
    }
    checkCurrentSession();
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
        if (!profile?.location) {
          setFullName(profile?.full_name || res.data.user.user_metadata?.full_name || '');
          setMode('profile-complete');
        } else {
          setMode('success');
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1000);
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
        setMode('success');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      }
    } catch {
      setError('An unexpected error occurred while saving profile.');
    } finally {
      setLoading(false);
    }
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
    <div className="text-[#111111] px-4 py-8 max-w-md mx-auto space-y-6">
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
          {mode === 'success' && 'Welcome to Enugu Buy & Sell'}
        </h1>
        <p className="text-xs sm:text-sm text-[#667085]">
          {mode === 'signin' && 'Enter your email and password to access the marketplace.'}
          {mode === 'signup' && 'Join the Enugu campus marketplace to buy, sell, and connect.'}
          {mode === 'verify-notice' && `We sent a confirmation link to ${email || 'your email'}.`}
          {mode === 'profile-complete' && 'Just a few details to personalize your marketplace experience.'}
          {mode === 'success' && 'Authentication complete! Redirecting to marketplace...'}
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white py-7 px-6 shadow-xs border border-slate-200/90 rounded-2xl space-y-5">
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
          <div className="space-y-4">
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
                  className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs"
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
                  className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs"
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
                className="w-full bg-white border border-slate-300 hover:border-slate-400 text-[#111111] font-semibold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
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
                className="w-full text-xs font-semibold text-[#667085] hover:text-[#087443] py-2 transition-colors"
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
                  Phone Number
                </label>
                <span className="text-[10px] text-slate-500 font-medium">(Optional)</span>
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
              className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs"
            >
              {loading ? 'Saving Profile...' : 'Complete Profile & Enter Marketplace'}
            </button>
          </form>
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


