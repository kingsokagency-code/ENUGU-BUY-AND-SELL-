'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { MobileSellerNav } from '@/components/seller/MobileBottomNav';
import {
  Package, Plus, Search, SlidersHorizontal, Edit2,
  Trash2, ExternalLink, ArrowLeft, AlertCircle, CheckCircle2,
  Archive, ShieldAlert, X, Eye
} from 'lucide-react';
import { getCurrentUser, checkUserSellerStatus, type SellerStatus } from '@/lib/auth';
import { getSellerProducts, updateProduct, archiveProduct } from '@/lib/commerce-client';

interface SellerProduct {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  condition: string;
  location: string;
  images?: string[];
  status: 'active' | 'sold' | 'archived';
  stock_quantity?: number;
  created_at: string;
  shops?: {
    id: string;
    name: string;
    slug: string;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function MyProductsPage() {
  const router = useRouter();
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Sold' | 'Archived'>('All');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCondition, setEditCondition] = useState('Used');
  const [editStatus, setEditStatus] = useState<'active' | 'sold' | 'archived'>('active');
  const [isSaving, setIsSaving] = useState(false);

  // Archive Confirm Modal State
  const [archivingProduct, setArchivingProduct] = useState<SellerProduct | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const { user } = await getCurrentUser();
    if (!user) {
      router.push('/auth?redirect=/seller/products');
      return;
    }

    const status = await checkUserSellerStatus(user.id);
    if (!status.isSeller || status.shops.length === 0) {
      router.push('/create-shop');
      return;
    }

    setSellerStatus(status);

    // Fetch real seller products
    const res = await getSellerProducts();
    if (res.success) {
      setProducts(res.products as SellerProduct[]);
    } else {
      setErrorMessage(res.error || 'Failed to load products');
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenEdit = (p: SellerProduct) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditStock(String(p.stock_quantity ?? 1));
    setEditCondition(p.condition || 'Used');
    setEditStatus(p.status || 'active');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const numPrice = parseFloat(editPrice);
    const numStock = parseInt(editStock, 10);

    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage('Please enter a valid price');
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      setErrorMessage('Stock cannot be negative');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const res = await updateProduct(editingProduct.id, {
      name: editName.trim(),
      price: numPrice,
      stock_quantity: numStock,
      condition: editCondition,
      status: editStatus,
    });

    setIsSaving(false);

    if (res.success) {
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingProduct(null);
      loadData();
    } else {
      setErrorMessage(res.error || 'Failed to update product');
    }
  };

  const handleConfirmArchive = async () => {
    if (!archivingProduct) return;
    setIsArchiving(true);
    setErrorMessage(null);

    const res = await archiveProduct(archivingProduct.id);
    setIsArchiving(false);

    if (res.success) {
      setSuccessMessage(`"${archivingProduct.name}" archived successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setArchivingProduct(null);
      loadData();
    } else {
      setErrorMessage(res.error || 'Failed to archive product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categories?.name && p.categories.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return p.status === 'active';
    if (activeTab === 'Sold') return p.status === 'sold';
    if (activeTab === 'Archived') return p.status === 'archived';
    return true;
  });

  const primaryShop = sellerStatus?.shops?.[0];
  const storeName = primaryShop?.name || 'My Store';
  const storeSlug = primaryShop?.slug || 'store';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A14] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0A8A50] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#6B9980]">Loading store catalog...</p>
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
              <h1 className="text-base sm:text-lg font-bold text-white">Product Management</h1>
              <p className="text-[11px] text-[#6B9980]">
                {products.length} live listings in {storeName}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/create-product"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0A8A50] hover:bg-[#087443] text-xs font-bold text-white transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
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

          {/* Search & Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            {/* Tab Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['All', 'Active', 'Sold', 'Archived'] as const).map((tab) => {
                const count =
                  tab === 'All'
                    ? products.length
                    : products.filter((p) => p.status === tab.toLowerCase()).length;
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0A8A50] text-white shadow-sm'
                        : 'bg-[#1A2820] text-[#9CB3AA] hover:bg-[#243320] border border-[#243320]'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B9980]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-xs text-white placeholder-[#6B9980] focus:outline-none focus:border-[#0A8A50]"
              />
            </div>
          </div>

          {/* Product Grid / Table */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#1A2820] border border-[#243320] rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0A8A50]/10 text-[#0A8A50] flex items-center justify-center mx-auto border border-[#0A8A50]/20">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No products found</h3>
                <p className="text-xs text-[#6B9980]">
                  {searchQuery || activeTab !== 'All'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Your storefront is currently empty. Add your first item to start selling!'}
                </p>
              </div>
              {!searchQuery && activeTab === 'All' && (
                <Link
                  href="/create-product"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0A8A50] hover:bg-[#087443] text-xs font-bold text-white transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Product</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-[#1A2820] border border-[#243320] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111D17] text-[#6B9980] border-b border-[#243320]">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Product</th>
                      <th className="px-4 py-3.5 font-bold">Price</th>
                      <th className="px-4 py-3.5 font-bold">Stock</th>
                      <th className="px-4 py-3.5 font-bold">Condition</th>
                      <th className="px-4 py-3.5 font-bold">Status</th>
                      <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#243320]">
                    {filteredProducts.map((product) => {
                      const isSold = product.status === 'sold' || (product.stock_quantity ?? 1) === 0;
                      const isArchived = product.status === 'archived';

                      return (
                        <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Name & Image */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#111D17] border border-[#243320] flex items-center justify-center shrink-0 overflow-hidden">
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-[#6B9980]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate max-w-[220px]">
                                  {product.name}
                                </p>
                                <p className="text-[11px] text-[#6B9980]">
                                  {product.categories?.name || 'General'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-4 font-bold text-white">
                            ₦{Number(product.price).toLocaleString()}
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                                (product.stock_quantity ?? 1) === 0
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : (product.stock_quantity ?? 1) <= 2
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-[#0A8A50]/10 text-[#6EE7B7] border border-[#0A8A50]/20'
                              }`}
                            >
                              {product.stock_quantity ?? 1} in stock
                            </span>
                          </td>

                          {/* Condition */}
                          <td className="px-4 py-4 text-[#9CB3AA]">
                            {product.condition || 'Used'}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isArchived
                                  ? 'bg-slate-500/20 text-slate-300'
                                  : isSold
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-[#0A8A50]/20 text-[#34D399]'
                              }`}
                            >
                              {product.status.toUpperCase()}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/products/${product.id}`}
                                target="_blank"
                                className="p-1.5 text-[#6B9980] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="View live listing"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                onClick={() => handleOpenEdit(product)}
                                className="p-1.5 text-[#6B9980] hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                title="Edit product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {!isArchived && (
                                <button
                                  onClick={() => setArchivingProduct(product)}
                                  className="p-1.5 text-[#6B9980] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Archive product"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
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

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111D17] border border-[#243320] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#243320] pb-3">
              <h3 className="text-sm font-bold text-white">Edit Product</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[#6B9980] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#9CB3AA] font-bold">Product Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white focus:outline-none focus:border-[#0A8A50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#9CB3AA] font-bold">Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white focus:outline-none focus:border-[#0A8A50]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#9CB3AA] font-bold">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white focus:outline-none focus:border-[#0A8A50]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#9CB3AA] font-bold">Condition</label>
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white focus:outline-none focus:border-[#0A8A50]"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#9CB3AA] font-bold">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white focus:outline-none focus:border-[#0A8A50]"
                  >
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#243320]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-[#9CB3AA] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#0A8A50] hover:bg-[#087443] text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE CONFIRMATION MODAL */}
      {archivingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111D17] border border-[#243320] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Archive className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Archive Product?</h3>
              <p className="text-xs text-[#6B9980]">
                "{archivingProduct.name}" will be hidden from the public marketplace. Historical orders will remain intact.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setArchivingProduct(null)}
                className="px-4 py-2 rounded-xl bg-[#1A2820] hover:bg-[#243320] text-[#9CB3AA] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={isArchiving}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isArchiving ? 'Archiving...' : 'Yes, Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileSellerNav />
    </div>
  );
}
