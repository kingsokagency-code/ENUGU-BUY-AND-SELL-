'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { sendPhoneOtp, verifyPhoneOtp } from '@/lib/auth';
import { normalizeNigerianPhone } from '@/lib/validations/phone';
import { ArrowLeft, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('returnUrl') || '/';

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devNotice, setDevNotice] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const norm = normalizeNigerianPhone(phone);
    if (!norm.isValid || !norm.canonicalPhone) {
      setError(norm.error || 'Please enter a valid Nigerian phone number.');
      return;
    }

    const canonical = norm.canonicalPhone;
    setLoading(true);

    try {
      const res = await sendPhoneOtp(canonical);
      if (res.error) {
        // Map any technical error string to a friendly human message
        const msg = res.error.message;
        if (msg.includes('ZodError') || msg.includes('regex') || msg.includes('format') || msg.includes('pattern')) {
          setError('Please enter a valid Nigerian phone number.');
        } else {
          setError(msg);
        }
      } else {
        setPhone(canonical);
        const dataObj = res.data as Record<string, unknown> | null;
        if (dataObj?.message && typeof dataObj.message === 'string' && dataObj.message.includes('Dev mode')) {
          setDevNotice('Development Mode Active: Use verification code 123456');
        }
        setStep('otp');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send verification code';
      if (msg.includes('ZodError') || msg.includes('regex') || msg.includes('format') || msg.includes('pattern')) {
        setError('Please enter a valid Nigerian phone number.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await verifyPhoneOtp(phone, otp);
      if (res.error) {
        const msg = res.error.message;
        if (msg.includes('ZodError') || msg.includes('regex') || msg.includes('format') || msg.includes('pattern')) {
          setError('Please enter a valid Nigerian phone number.');
        } else {
          setError(msg);
        }
      } else {
        setStep('success');
        // If there's a redirect target other than root, redirect automatically after 1.5s
        if (redirectUrl !== '/') {
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1500);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      if (msg.includes('ZodError') || msg.includes('regex') || msg.includes('format') || msg.includes('pattern')) {
        setError('Please enter a valid Nigerian phone number.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[#111111] px-4 py-8 max-w-md mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087443] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-semibold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#087443]/15">
          Phone Verification
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
          {step === 'phone' ? (
            <Phone className="w-6 h-6" />
          ) : step === 'otp' ? (
            <ShieldCheck className="w-6 h-6" />
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
          {step === 'phone' && 'Sign in with Phone Number'}
          {step === 'otp' && 'Enter Verification Code'}
          {step === 'success' && 'Welcome to Enugu Buy & Sell'}
        </h1>
        <p className="text-xs sm:text-sm text-[#667085]">
          {step === 'phone' && 'We will send a 6-digit SMS verification code to your Nigerian phone.'}
          {step === 'otp' && `Enter the 6-digit SMS code sent to ${phone}`}
          {step === 'success' && 'Your phone identity has been verified.'}
        </p>
      </div>

      <div className="bg-white py-7 px-6 shadow-xs border border-slate-200/90 rounded-2xl space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        {devNotice && (
          <div className="bg-[#E8F5EF] border border-[#087443]/30 text-[#087443] text-xs p-3.5 rounded-xl font-semibold">
            {devNotice}
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#111111]">
                  Nigerian Phone Number
                </label>
                <span className="text-[11px] font-medium text-[#667085]">
                  e.g. 0801 234 5678
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none text-xs font-bold text-[#344054] border-r border-slate-300 pr-2.5">
                  <span>🇳🇬</span>
                  <span>+234</span>
                </div>
                <input
                  type="tel"
                  placeholder="08012345678 or +234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-sm text-[#111111] rounded-xl pl-24 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium placeholder:text-slate-400"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#667085]">
                Enter any standard format (080..., 80..., 234..., or +234...).
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full bg-[#FAFAF8] border border-slate-300 focus:border-[#087443] text-center tracking-[0.5em] text-lg font-black text-[#111111] rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs"
            >
              {loading ? 'Verifying...' : 'Verify Code & Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-xs font-semibold text-[#667085] hover:text-[#087443] transition-colors text-center"
            >
              ← Change Phone Number
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-[#087443]" />
            </div>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Signed in with <strong>{phone}</strong>. You can now chat directly with sellers, explore the campus catalog, or launch your storefront!
            </p>
            <Link
              href={redirectUrl}
              className="block w-full bg-[#087443] hover:bg-[#065f37] text-white font-bold text-sm py-3.5 rounded-xl text-center shadow-xs transition-all"
            >
              {redirectUrl !== '/' ? 'Continue to Listing &rarr;' : 'Explore Marketplace Now &rarr;'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#087443] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}


