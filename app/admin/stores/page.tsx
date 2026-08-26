'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Check, X, ShieldCheck, Eye, Store } from 'lucide-react';

const INITIAL_STORES = [
  { id: '1', name: 'Franco Gadget Hub', owner: 'Emeka Obi', category: 'Electronics', campus: 'UNN Franco', status: 'Pending', products: 12, submitted: 'Today' },
  { id: '2', name: 'Nsukka Fresh Groceries', owner: 'Blessing K.', category: 'Food & Drinks', campus: 'Hilltop UNN', status: 'Pending', products: 8, submitted: 'Today' },
  { id: '3', name: 'IMT Tech Repairs', owner: 'David U.', category: 'Services & Gadgets', campus: 'IMT Campus 1', status: 'Pending', products: 5, submitted: 'Yesterday' },
  { id: '4', name: 'Kingsok Gadgets', owner: 'Kingsley O.', category: 'Electronics & Phones', campus: 'UNN Main Campus', status: 'Verified', products: 36, submitted: 'May 10' },
  { id: '5', name: 'Trendy Wears', owner: 'Amara C.', category: 'Fashion & Wears', campus: 'UNN Nsukka', status: 'Verified', products: 76, submitted: 'May 12' },
];

export default function AdminStoresPage() {
  const [stores, setStores] = useState(INITIAL_STORES);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Verified'>('Pending');

  const handleApprove = (id: string) => {
    setStores(stores.map(s => s.id === id ? { ...s, status: 'Verified' } : s));
  };

  const handleReject = (id: string) => {
    setStores(stores.filter(s => s.id !== id));
  };

  const filtered = stores.filter(s => {
    if (activeTab === 'All') return true;
    return s.status === activeTab;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D2B22]">
        <div>
          <h1 className="text-xl font-bold text-white">Store Approvals & Merchant Verification</h1>
          <p className="text-xs text-[#6B9980] mt-0.5">Review merchant applications, assign verified badges, and audit inventory</p>
        </div>

        <div className="flex gap-2">
          {(['Pending', 'Verified', 'All'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === t
                  ? 'bg-[#087443] text-white'
                  : 'bg-[#111D17] text-[#9CB3AA] border border-[#1D2B22]'
              }`}
            >
              {t} {t === 'Pending' && `(${stores.filter(s => s.status === 'Pending').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1F17] text-[#6B9980] font-bold uppercase text-[10px] border-b border-[#1D2B22]">
              <tr>
                <th className="p-4">Storefront</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Category</th>
                <th className="p-4">Campus Location</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B22] text-white">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#1A2820]/50 transition-colors">
                  <td className="p-4 font-bold flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#0A8A50]" />
                    <span>{s.name}</span>
                  </td>
                  <td className="p-4 text-[#9CB3AA]">{s.owner}</td>
                  <td className="p-4 text-[#9CB3AA]">{s.category}</td>
                  <td className="p-4 text-[#9CB3AA]">{s.campus}</td>
                  <td className="p-4">{s.products} items</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {s.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(s.id)}
                          className="px-3 py-1 rounded-lg bg-[#087443] hover:bg-[#0A8A50] text-[11px] font-bold text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve & Verify</span>
                        </button>
                        <button
                          onClick={() => handleReject(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[11px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Merchant
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
