'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import {
  ShieldCheck, Lock, ArrowLeft, ArrowRight,
  CheckCircle2, AlertCircle, ShoppingBag, MapPin, Store,
} from 'lucide-react';
import { getCart, placeOrder } from '@/lib/commerce-client';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import type { CartItem } from '@/lib/types/commerce';

const CAMPUSES = [
  'UNN Main Campus (Nsukka)',
  'UNEC Campus (Enugu)',
  'IMT Campus (Enugu)',
  'ESUT Main Campus (Agbani)',
  'College of Medicine (Ituku-Ozalla)',
  'New Haven (Enugu City)',
  'Independence Layout (Enugu)',
  'Ogui Road / Coal Camp (Enugu)',
  'Other / Off Campus',
];

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryCampus, setDeliveryCampus] = useState(CAMPUSES[0]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'escrow_wallet' | 'card' | 'bank_transfer'>('escrow_wallet');

  useEffect(() => {
    async function initCheckout() {
      setLoading(true);
      const { user } = await getCurrentUser();
      if (!user) {
        router.push('/auth?redirect=/checkout');
        return;
      }

      // Fetch Profile for Autofill
      const { profile } = await getUserProfile(user.id);
      if (profile) {
        if (profile.full_name) setFullName(profile.full_name);
        if (profile.phone) setContactPhone(profile.phone);
        if (profile.location) setDeliveryAddress(profile.location);
      }

      // Fetch Cart Items
      const cartRes = await getCart();
      if (!cartRes.success || cartRes.items.length === 0) {
        router.push('/cart');
        return;
      }

      setItems(cartRes.items);
      setTotalAmount(cartRes.total_amount);
      setLoading(false);
    }

    initCheckout();
  }, [router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full recipient name');
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMessage('Please enter a reachable contact phone or WhatsApp number');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty');
      return;
    }

    setSubmitting(true);

    try {
      // Extract primary shop_id and items payload
      const firstProduct = items[0].product;
      const targetShopId = firstProduct?.shop?.id || firstProduct?.shop_id || '';

      const itemsPayload = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const res = await placeOrder({
        shop_id: targetShopId,
        items: itemsPayload,
        delivery_campus: deliveryCampus,
        delivery_address: deliveryAddress,
        contact_phone: contactPhone,
        buyer_notes: buyerNotes,
        payment_method: paymentMethod,
      });

      if (res.success && res.order_id) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart_updated'));
        }
        router.push(`/orders/${res.order_id}`);
      } else {
        setErrorMessage(res.error || 'Failed to place order. Please check inputs and try again.');
        setSubmitting(false);
      }
    } catch {
      setErrorMessage('Connection error while processing order');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#087443] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Preparing secure checkout...</p>
          </div>
        </main>
      </div>
    );
  }

  const escrowFee = Math.round(totalAmount * 0.01);
  const finalTotal = totalAmount + escrowFee;

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-[#087443] hover:underline font-bold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#0D1F17] tracking-tight">
            Order Checkout &amp; Delivery
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Buyer & Delivery Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Contact Information */}
            <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5EDE9]">
                <div className="w-6 h-6 rounded-full bg-[#087443] text-white flex items-center justify-center text-xs font-bold">1</div>
                <h2 className="text-sm font-bold text-[#0D1F17]">Recipient &amp; Contact Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0D1F17] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kingsley Okoye"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#087443] focus:ring-1 focus:ring-[#087443] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1F17] mb-1">WhatsApp / Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#087443] focus:ring-1 focus:ring-[#087443] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Campus Delivery / Meetup Location */}
            <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5EDE9]">
                <div className="w-6 h-6 rounded-full bg-[#087443] text-white flex items-center justify-center text-xs font-bold">2</div>
                <h2 className="text-sm font-bold text-[#0D1F17]">Campus Delivery &amp; Handover Location</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0D1F17] mb-1">Target Campus / District</label>
                  <select
                    value={deliveryCampus}
                    onChange={(e) => setDeliveryCampus(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#087443] focus:ring-1 focus:ring-[#087443] outline-none bg-white"
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1F17] mb-1">Specific Hall / Faculty / Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Franco Hall Room 14, or Faculty of Arts Ground Floor"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#087443] focus:ring-1 focus:ring-[#087443] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1F17] mb-1">Special Notes for Seller (Optional)</label>
                  <textarea
                    rows={2}
                    value={buyerNotes}
                    onChange={(e) => setBuyerNotes(e.target.value)}
                    placeholder="e.g. Please call me when you arrive at Franco Quadrangle"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#087443] focus:ring-1 focus:ring-[#087443] outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5EDE9]">
                <div className="w-6 h-6 rounded-full bg-[#087443] text-white flex items-center justify-center text-xs font-bold">3</div>
                <h2 className="text-sm font-bold text-[#0D1F17]">Payment &amp; Escrow Protection</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#087443] bg-[#E8F8EF]/40 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="escrow_wallet"
                    checked={paymentMethod === 'escrow_wallet'}
                    onChange={() => setPaymentMethod('escrow_wallet')}
                    className="mt-0.5 text-[#087443] focus:ring-[#087443]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#0D1F17]">Enugu Escrow Safety Wallet (Recommended)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Funds are held securely in escrow until you inspect and verify the physical item at delivery.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-0.5 text-[#087443] focus:ring-[#087443]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#0D1F17]">Direct Bank Transfer / Handover Payment</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pay the verified student merchant directly upon verified meetup handover.
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right: Order Summary & Review */}
          <div className="lg:col-span-5 space-y-4 sticky top-20">
            <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-[#0D1F17] pb-3 border-b border-[#E5EDE9]">
                Review Your Order ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Items List Mini */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-2 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {item.product?.images?.[0] ? (
                          <Image src={item.product.images[0]} alt={item.product?.name || ''} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.product?.name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-black text-slate-900 shrink-0">
                      ₦{(Number(item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 border-t border-[#E5EDE9] space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₦{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Escrow Protection Fee</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">1%</span>
                  </span>
                  <span className="font-bold text-slate-900">₦{escrowFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5EDE9] flex justify-between items-baseline">
                <div>
                  <p className="text-xs font-bold text-[#0D1F17]">Total Amount</p>
                  <p className="text-[10px] text-slate-400">Safe exchange guaranteed</p>
                </div>
                <p className="text-xl font-black text-[#087443]">
                  ₦{finalTotal.toLocaleString()}
                </p>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#087443] hover:bg-[#065f35] active:scale-[0.98] disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-[#087443]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{submitting ? 'Placing Real Order...' : 'Place Order →'}</span>
              </button>

              <div className="pt-1 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Protected by EBS Campus Trust &amp; Escrow</span>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
