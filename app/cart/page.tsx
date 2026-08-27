'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  ShieldCheck, ArrowLeft, Lock, Store,
} from 'lucide-react';
import { getCart, updateCartItemQuantity, removeCartItem } from '@/lib/commerce-client';
import { getCurrentUser } from '@/lib/auth';
import type { CartItem } from '@/lib/types/commerce';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadCartData = useCallback(async () => {
    setLoading(true);
    const { user } = await getCurrentUser();
    if (!user) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    const res = await getCart();
    if (res.success) {
      setItems(res.items);
      setTotalAmount(res.total_amount);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCartData();

    const handleCartUpdate = () => loadCartData();
    window.addEventListener('cart_updated', handleCartUpdate);
    return () => window.removeEventListener('cart_updated', handleCartUpdate);
  }, [loadCartData]);

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(itemId);

    // Optimistic update
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));

    const res = await updateCartItemQuantity(itemId, newQty);
    setUpdatingId(null);

    if (res.success) {
      window.dispatchEvent(new Event('cart_updated'));
    } else {
      // Revert if failed
      loadCartData();
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingId(itemId);
    const res = await removeCartItem(itemId);
    setUpdatingId(null);

    if (res.success) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      window.dispatchEvent(new Event('cart_updated'));
      loadCartData();
    }
  };

  // 1. Unauthenticated View
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F8EF] text-[#087443] flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0D1F17]">Your Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-[#6B7C74] mt-2 max-w-sm">
            Sign in to access your saved marketplace items, track orders, and complete checkout across Enugu.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/auth?redirect=/cart"
              className="bg-[#087443] hover:bg-[#065f35] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/browse"
              className="bg-white border border-[#E5EDE9] hover:bg-slate-50 text-[#0D1F17] text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all"
            >
              Browse Catalog
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
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-4 h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  // 3. Empty Cart State
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0D1F17]">Your Cart is Empty</h1>
          <p className="text-xs sm:text-sm text-[#6B7C74] mt-2 max-w-sm">
            You don&apos;t have any active items in your cart yet. Explore thousands of student deals across Enugu!
          </p>
          <div className="mt-6">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-[#087443] hover:bg-[#065f35] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-[#087443]/20"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 4. Active Cart Content
  const escrowFee = Math.round(totalAmount * 0.01);
  const finalTotal = totalAmount + escrowFee;

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/browse" className="inline-flex items-center gap-1.5 text-xs text-[#087443] hover:underline font-bold mb-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-[#0D1F17] tracking-tight">
              Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => {
              const product = item.product;
              const unitPrice = item.unit_price || (product ? Number(product.price) : 0);
              const subtotal = unitPrice * item.quantity;
              const isUpdating = updatingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border border-[#E5EDE9] p-3.5 sm:p-4 flex gap-3 sm:gap-4 items-center justify-between transition-all shadow-2xs ${
                    isUpdating ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                    {product?.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product?.name || 'Product'}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.product_id}`}
                          className="text-xs sm:text-sm font-bold text-[#0D1F17] hover:text-[#087443] transition-colors line-clamp-1 leading-snug"
                        >
                          {product?.name || 'Marketplace Product'}
                        </Link>
                        
                        {product?.shop && (
                          <p className="text-[11px] text-[#6B7C74] flex items-center gap-1 mt-0.5">
                            <Store className="w-3 h-3 text-[#087443]" />
                            <span className="truncate">{product.shop.name}</span>
                            {product.shop.is_verified && <ShieldCheck className="w-3 h-3 text-[#087443] shrink-0" />}
                          </p>
                        )}
                      </div>

                      {/* Remove Item Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 flex-wrap gap-2">
                      <div className="flex items-center border border-[#E5EDE9] rounded-xl bg-white">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 font-bold text-xs text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-black text-[#087443]">
                          ₦{subtotal.toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-slate-400">
                            ₦{unitPrice.toLocaleString()} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5EDE9] p-5 space-y-4 shadow-sm sticky top-20">
            <h2 className="text-sm font-bold text-[#0D1F17] pb-3 border-b border-[#E5EDE9]">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-slate-600">
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
              <div className="flex justify-between text-slate-500">
                <span>Campus Delivery / Meetup</span>
                <span className="text-emerald-600 font-bold">Standard Campus Meet</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5EDE9] flex justify-between items-baseline">
              <div>
                <p className="text-xs font-bold text-[#0D1F17]">Total Amount</p>
                <p className="text-[10px] text-slate-400">All fees included</p>
              </div>
              <p className="text-xl font-black text-[#087443]">
                ₦{finalTotal.toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-[#087443] hover:bg-[#065f35] active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-[#087443]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Funds held securely in escrow until item is received</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
