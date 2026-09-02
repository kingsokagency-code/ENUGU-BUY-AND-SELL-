'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import {
  Users, Search, ShieldCheck, MapPin, Phone,
  MessageSquare, Edit3, CheckCircle2, AlertCircle,
  Calendar, ShoppingBag, ArrowLeft, X
} from 'lucide-react';
import { getCurrentUser, checkUserSellerStatus, type SellerStatus } from '@/lib/auth';
import { getSellerCustomers } from '@/lib/commerce-client';

interface CustomerRow {
  id: string;
  shop_id: string;
  user_id: string;
  total_orders: number;
  total_spent: number;
  first_order_at: string;
  last_order_at: string;
  notes: string | null;
  shops?: {
    id: string;
    name: string;
    slug: string;
  };
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    phone: string | null;
    is_verified: boolean;
  };
}

export default function SellerCustomersPage() {
  const router = useRouter();
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Note Modal
  const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const { user } = await getCurrentUser();
    if (!user) {
      router.push('/auth?redirect=/seller/customers');
      return;
    }

    const status = await checkUserSellerStatus(user.id);
    if (!status.isSeller || status.shops.length === 0) {
      router.push('/create-shop');
      return;
    }

    setSellerStatus(status);

    const res = await getSellerCustomers();
    if (res.success) {
      setCustomers(res.customers || []);
    } else {
      setErrorMessage(res.error || 'Failed to load customer CRM');
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleOpenNote = (cust: CustomerRow) => {
    setEditingCustomer(cust);
    setNoteText(cust.notes || '');
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setIsSavingNote(true);
    try {
      const res = await fetch('/api/seller/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: editingCustomer.id,
          notes: noteText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Customer note updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setEditingCustomer(null);
        loadCustomers();
      } else {
        setErrorMessage(data.error || 'Failed to save note');
      }
    } catch {
      setErrorMessage('Network error saving note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const name = c.profiles?.full_name?.toLowerCase() || '';
    const loc = c.profiles?.location?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || loc.includes(q);
  });

  const primaryShop = sellerStatus?.shops?.[0];
  const storeName = primaryShop?.name || 'My Store';
  const storeSlug = primaryShop?.slug || 'store';

  const totalRevenueFromCustomers = customers.reduce(
    (acc, c) => acc + Number(c.total_spent || 0),
    0
  );
  const repeatCustomersCount = customers.filter((c) => c.total_orders > 1).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A14] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0A8A50] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#6B9980]">Loading Customer Relationship Hub...</p>
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
              <h1 className="text-base sm:text-lg font-bold text-white">Customer Relationship Management</h1>
              <p className="text-[11px] text-[#6B9980]">
                {customers.length} unique buyers across {storeName}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/seller/dashboard"
                className="text-xs font-bold text-[#6B9980] hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
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

          {/* CRM Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1A2820] border border-[#243320] rounded-2xl space-y-1">
              <p className="text-[11px] text-[#6B9980] font-bold">Total Acquired Buyers</p>
              <p className="text-xl font-black text-white">{customers.length}</p>
            </div>
            <div className="p-4 bg-[#1A2820] border border-[#243320] rounded-2xl space-y-1">
              <p className="text-[11px] text-[#34D399] font-bold">Repeat Customers (&gt; 1 order)</p>
              <p className="text-xl font-black text-[#34D399]">{repeatCustomersCount}</p>
            </div>
            <div className="p-4 bg-[#1A2820] border border-[#243320] rounded-2xl space-y-1">
              <p className="text-[11px] text-[#FBBF24] font-bold">Customer Lifetime Value</p>
              <p className="text-xl font-black text-[#FBBF24]">
                ₦{totalRevenueFromCustomers.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B9980]" />
              <input
                type="text"
                placeholder="Search customers by name or campus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-xs text-white placeholder-[#6B9980] focus:outline-none focus:border-[#0A8A50]"
              />
            </div>
          </div>

          {/* Customer Table */}
          {filteredCustomers.length === 0 ? (
            <div className="bg-[#1A2820] border border-[#243320] rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0A8A50]/10 text-[#0A8A50] flex items-center justify-center mx-auto border border-[#0A8A50]/20">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No customers yet</h3>
                <p className="text-xs text-[#6B9980]">
                  When buyers place orders with your store, their profiles and order history will automatically appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1A2820] border border-[#243320] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111D17] text-[#6B9980] border-b border-[#243320]">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Customer</th>
                      <th className="px-4 py-3.5 font-bold">Orders Placed</th>
                      <th className="px-4 py-3.5 font-bold">Total Spent</th>
                      <th className="px-4 py-3.5 font-bold">Last Order Date</th>
                      <th className="px-4 py-3.5 font-bold">Merchant Notes</th>
                      <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#243320]">
                    {filteredCustomers.map((cust) => {
                      const name = cust.profiles?.full_name || 'EBS Buyer';
                      const location = cust.profiles?.location || 'UNEC Campus, Enugu';
                      const lastOrder = new Date(cust.last_order_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      return (
                        <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Customer info */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#087443] flex items-center justify-center font-bold text-white shrink-0 border border-[#0A8A50]/40">
                                {name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-white truncate max-w-[180px]">
                                    {name}
                                  </p>
                                  {cust.profiles?.is_verified && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-[#6B9980]">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[160px]">{location}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Orders Placed */}
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111D17] border border-[#243320] text-xs font-bold text-white">
                              <ShoppingBag className="w-3 h-3 text-[#0A8A50]" />
                              <span>{cust.total_orders} Orders</span>
                            </span>
                          </td>

                          {/* Total Spent */}
                          <td className="px-4 py-4 font-bold text-[#34D399]">
                            ₦{Number(cust.total_spent).toLocaleString()}
                          </td>

                          {/* Last Order Date */}
                          <td className="px-4 py-4 text-[#9CB3AA]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#6B9980]" />
                              <span>{lastOrder}</span>
                            </div>
                          </td>

                          {/* Merchant Notes */}
                          <td className="px-4 py-4 max-w-xs">
                            <p className="text-[11px] text-[#6B9980] truncate italic">
                              {cust.notes || 'No notes added'}
                            </p>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenNote(cust)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1A2820] hover:bg-[#243320] text-[#9CB3AA] hover:text-white border border-[#243320] transition-colors cursor-pointer text-[11px] font-bold"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Note</span>
                              </button>

                              <Link
                                href="/conversations"
                                className="p-1.5 text-[#6B9980] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="Open inbox"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* NOTE MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111D17] border border-[#243320] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#243320] pb-3">
              <h3 className="text-sm font-bold text-white">
                Customer Note: {editingCustomer.profiles?.full_name || 'Buyer'}
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-[#6B9980] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#9CB3AA] font-bold">Private Seller Notes</label>
                <textarea
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Prefers hostel delivery at UNEC, frequent phone buyer, prompt payment."
                  className="w-full p-3 bg-[#1A2820] border border-[#243320] rounded-xl text-white placeholder-[#6B9980] focus:outline-none focus:border-[#0A8A50]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#243320]">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-[#9CB3AA] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNote}
                  className="px-4 py-2 rounded-xl bg-[#0A8A50] hover:bg-[#087443] text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
