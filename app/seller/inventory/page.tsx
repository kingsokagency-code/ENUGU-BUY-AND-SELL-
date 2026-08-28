'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { MobileSellerNav } from '@/components/seller/MobileBottomNav';
import {
  Boxes, Plus, Minus, CheckCircle2, AlertCircle,
  Package, Search, RefreshCw, ArrowLeft, ArrowUpRight
} from 'lucide-react';
import { getCurrentUser, checkUserSellerStatus, type SellerStatus } from '@/lib/auth';
import { getSellerProducts, updateProduct } from '@/lib/commerce-client';

interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  status: 'active' | 'sold' | 'archived';
  category_name?: string;
  image_url?: string;
  isUpdating?: boolean;
}

export default function SellerInventoryPage() {
  const router = useRouter();
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const { user } = await getCurrentUser();
    if (!user) {
      router.push('/auth?redirect=/seller/inventory');
      return;
    }

    const status = await checkUserSellerStatus(user.id);
    if (!status.isSeller || status.shops.length === 0) {
      router.push('/create-shop');
      return;
    }

    setSellerStatus(status);

    const res = await getSellerProducts();
    if (res.success) {
      const mapped: InventoryItem[] = (res.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        stock_quantity: p.stock_quantity ?? (p.status === 'sold' ? 0 : 1),
        status: p.status || 'active',
        category_name: p.categories?.name || 'General',
        image_url: p.images?.[0],
      }));
      setItems(mapped);
    } else {
      setErrorMessage(res.error || 'Failed to load inventory');
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAdjustStock = async (itemId: string, newStock: number) => {
    if (newStock < 0) return;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              stock_quantity: newStock,
              status: newStock === 0 ? 'sold' : 'active',
              isUpdating: true,
            }
          : it
      )
    );

    const res = await updateProduct(itemId, {
      stock_quantity: newStock,
      status: newStock === 0 ? 'sold' : 'active',
    });

    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, isUpdating: false } : it))
    );

    if (res.success) {
      setSuccessMessage('Stock updated');
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      setErrorMessage(res.error || 'Failed to update stock');
      // Re-fetch on error to revert
      loadInventory();
    }
  };

  const handleToggleOutOfStock = async (item: InventoryItem) => {
    const isCurrentlyOut = item.stock_quantity === 0 || item.status === 'sold';
    const nextStock = isCurrentlyOut ? 1 : 0;
    await handleAdjustStock(item.id, nextStock);
  };

  const filteredItems = items.filter((it) =>
    it.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const primaryShop = sellerStatus?.shops?.[0];
  const storeName = primaryShop?.name || 'My Store';
  const storeSlug = primaryShop?.slug || 'store';

  const totalStockCount = items.reduce((acc, it) => acc + (it.stock_quantity || 0), 0);
  const outOfStockCount = items.filter((it) => it.stock_quantity === 0 || it.status === 'sold').length;
  const lowStockCount = items.filter((it) => it.stock_quantity > 0 && it.stock_quantity <= 2).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A14] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0A8A50] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#6B9980]">Loading real inventory matrix...</p>
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
              <h1 className="text-base sm:text-lg font-bold text-white">Stock &amp; Inventory Management</h1>
              <p className="text-[11px] text-[#6B9980]">
                {items.length} items across {storeName} ({totalStockCount} total units available)
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/seller/products"
                className="text-xs font-bold text-[#6B9980] hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Product Catalog</span>
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

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1A2820] border border-[#243320] rounded-2xl space-y-1">
              <p className="text-[11px] text-[#6B9980] font-bold">Total Available Units</p>
              <p className="text-xl font-black text-white">{totalStockCount}</p>
            </div>
            <div className="p-4 bg-[#1A2820] border border-[#243320] rounded-2xl space-y-1">
              <p className="text-[11px] text-amber-400 font-bold">Low Stock Alert (≤ 2 units)</p>
              <p className="text-xl font-black text-amber-400">{lowStockCount}</p>
            </div>
            <div className="p-4 bg-[#1A2820] border border-[#243320] rounded-2xl space-y-1">
              <p className="text-[11px] text-red-400 font-bold">Out of Stock Listings</p>
              <p className="text-xl font-black text-red-400">{outOfStockCount}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B9980]" />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-xs text-white placeholder-[#6B9980] focus:outline-none focus:border-[#0A8A50]"
              />
            </div>
          </div>

          {/* Inventory Table */}
          {filteredItems.length === 0 ? (
            <div className="bg-[#1A2820] border border-[#243320] rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0A8A50]/10 text-[#0A8A50] flex items-center justify-center mx-auto border border-[#0A8A50]/20">
                <Boxes className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No products to track</h3>
                <p className="text-xs text-[#6B9980]">
                  Create products in your store to manage live inventory levels.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1A2820] border border-[#243320] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111D17] text-[#6B9980] border-b border-[#243320]">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Product</th>
                      <th className="px-4 py-3.5 font-bold">Price</th>
                      <th className="px-4 py-3.5 font-bold">Current Stock</th>
                      <th className="px-4 py-3.5 font-bold text-center">Quick Adjust</th>
                      <th className="px-5 py-3.5 font-bold text-right">Availability Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#243320]">
                    {filteredItems.map((item) => {
                      const isOut = item.stock_quantity === 0 || item.status === 'sold';

                      return (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Product */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#111D17] border border-[#243320] flex items-center justify-center shrink-0 overflow-hidden">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-[#6B9980]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate max-w-[220px]">
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-[#6B9980]">
                                  {item.category_name}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-4 font-bold text-white">
                            ₦{Number(item.price).toLocaleString()}
                          </td>

                          {/* Stock Status Badge */}
                          <td className="px-4 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1.5 ${
                                isOut
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : item.stock_quantity <= 2
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-[#0A8A50]/10 text-[#6EE7B7] border border-[#0A8A50]/20'
                              }`}
                            >
                              <span>{item.stock_quantity} Units</span>
                              {item.isUpdating && (
                                <RefreshCw className="w-3 h-3 animate-spin text-[#6B9980]" />
                              )}
                            </span>
                          </td>

                          {/* Quick Adjust Buttons */}
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-[#111D17] border border-[#243320] rounded-xl p-1">
                              <button
                                onClick={() =>
                                  handleAdjustStock(item.id, Math.max(0, item.stock_quantity - 1))
                                }
                                disabled={item.stock_quantity <= 0 || item.isUpdating}
                                className="w-7 h-7 rounded-lg bg-[#1A2820] hover:bg-[#243320] text-white flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
                                title="Decrease stock by 1"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <span className="w-8 text-center font-bold text-white text-xs">
                                {item.stock_quantity}
                              </span>

                              <button
                                onClick={() =>
                                  handleAdjustStock(item.id, item.stock_quantity + 1)
                                }
                                disabled={item.isUpdating}
                                className="w-7 h-7 rounded-lg bg-[#0A8A50] hover:bg-[#087443] text-white flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
                                title="Increase stock by 1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Availability Toggle */}
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleToggleOutOfStock(item)}
                              disabled={item.isUpdating}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isOut
                                  ? 'bg-[#0A8A50]/10 hover:bg-[#0A8A50]/20 text-[#6EE7B7] border border-[#0A8A50]/30'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {isOut ? 'Reactivate (Stock = 1)' : 'Mark Out of Stock'}
                            </button>
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

      <MobileSellerNav />
    </div>
  );
}
