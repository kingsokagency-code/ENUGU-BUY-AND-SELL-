'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Flame, Plus, Trash2, ShieldCheck, Check } from 'lucide-react';
import { DiscountBadge } from '@/components/ebs-ui/Badge';

interface DealItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  seller: string;
  category: string;
}

const INITIAL_DEALS: DealItem[] = [
  { id: '1', name: 'iPhone 13 Pro Max (256GB • Sierra Blue)', price: 720000, originalPrice: 900000, discount: 20, seller: 'Kingsok Gadgets', category: 'Phones & Tablets' },
  { id: '2', name: 'HP Pavilion Laptop (Intel Core i5 • 8GB RAM)', price: 320000, originalPrice: 450000, discount: 30, seller: 'TechHub NG', category: 'Electronics' },
  { id: '3', name: 'JBL PartyBox 110 (Bluetooth Speaker)', price: 280000, originalPrice: 340000, discount: 18, seller: 'Sounds & More', category: 'Electronics' },
  { id: '4', name: 'Study Table with Chair & Drawer', price: 45000, originalPrice: 60000, discount: 25, seller: 'Campus Essentials', category: 'Home & Living' },
  { id: '5', name: 'Men\'s High Quality Sneakers', price: 32000, originalPrice: 40000, discount: 20, seller: 'Fresh Kicks', category: 'Fashion' },
];

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<DealItem[]>(INITIAL_DEALS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: '',
    price: '',
    originalPrice: '',
    seller: '',
    category: 'Phones & Tablets',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.name || !newDeal.price) return;
    const priceNum = Number(newDeal.price);
    const origNum = Number(newDeal.originalPrice) || priceNum;
    const discountPct = origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;

    setDeals([
      {
        id: Date.now().toString(),
        name: newDeal.name,
        price: priceNum,
        originalPrice: origNum,
        discount: discountPct,
        seller: newDeal.seller || 'Verified Seller',
        category: newDeal.category,
      },
      ...deals,
    ]);

    setNewDeal({ name: '', price: '', originalPrice: '', seller: '', category: 'Phones & Tablets' });
    setShowAddForm(false);
  };

  const handleRemove = (id: string) => {
    setDeals(deals.filter(d => d.id !== id));
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D2B22]">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#F97316]" />
            <h1 className="text-xl font-bold text-white">Hot Deals Curator</h1>
          </div>
          <p className="text-xs text-[#6B9980] mt-0.5">Control live discounted products on the homepage carousel</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-[#087443] hover:bg-[#0A8A50] text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Curate New Deal'}</span>
        </button>
      </div>

      {/* Add Deal Form Modal / Drawer */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="p-5 rounded-2xl bg-[#111D17] border border-[#1D2B22] space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-white">Add Product to Homepage Hot Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#6B9980] block mb-1">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. iPhone 14 Pro Max"
                value={newDeal.name}
                onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2820] border border-[#243320] text-xs text-white placeholder-[#6B9980] focus:outline-none focus:border-[#087443]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#6B9980] block mb-1">Merchant Store Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kingsok Gadgets"
                value={newDeal.seller}
                onChange={(e) => setNewDeal({ ...newDeal, seller: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2820] border border-[#243320] text-xs text-white placeholder-[#6B9980] focus:outline-none focus:border-[#087443]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#6B9980] block mb-1">Deal Price (₦)</label>
              <input
                type="number"
                required
                placeholder="720000"
                value={newDeal.price}
                onChange={(e) => setNewDeal({ ...newDeal, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2820] border border-[#243320] text-xs text-white placeholder-[#6B9980] focus:outline-none focus:border-[#087443]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#6B9980] block mb-1">Original Price (₦)</label>
              <input
                type="number"
                placeholder="900000"
                value={newDeal.originalPrice}
                onChange={(e) => setNewDeal({ ...newDeal, originalPrice: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2820] border border-[#243320] text-xs text-white placeholder-[#6B9980] focus:outline-none focus:border-[#087443]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#087443] hover:bg-[#0A8A50] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Publish to Homepage Carousel
          </button>
        </form>
      )}

      {/* Deals Table */}
      <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1F17] text-[#6B9980] font-bold uppercase text-[10px] border-b border-[#1D2B22]">
              <tr>
                <th className="p-4">Deal Listing</th>
                <th className="p-4">Category</th>
                <th className="p-4">Merchant</th>
                <th className="p-4">Deal Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B22] text-white">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-[#1A2820]/50 transition-colors">
                  <td className="p-4 font-bold">{d.name}</td>
                  <td className="p-4 text-[#9CB3AA]">{d.category}</td>
                  <td className="p-4 text-[#9CB3AA] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0A8A50]" />
                    <span>{d.seller}</span>
                  </td>
                  <td className="p-4 font-bold text-[#0A8A50]">
                    ₦{d.price.toLocaleString()}
                    <span className="block text-[10px] text-[#6B9980] line-through font-normal">
                      ₦{d.originalPrice.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <DiscountBadge percent={d.discount} />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleRemove(d.id)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                      title="Remove Deal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
