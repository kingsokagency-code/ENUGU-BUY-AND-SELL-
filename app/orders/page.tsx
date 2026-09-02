'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';

export default function OrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 bg-[#F8FAF9]">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto">
          <Package className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h1 className="text-base font-bold text-slate-900">Redirecting to Your Orders...</h1>
          <p className="text-xs text-slate-500">
            Order tracking and history are managed in your Account Hub.
          </p>
        </div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087443] hover:underline pt-2"
        >
          <span>Go to Account Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
