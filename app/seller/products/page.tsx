'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  BarChart2,
  Archive,
  Tag,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Search,
  Plus,
  SlidersHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Active' | 'Draft' | 'Out of Stock' | 'Sold';
  views: number;
  dateAdded: string;
  imageUrl?: string;
}

interface ApiProduct {
  id: string;
  name: string;
  category_id?: string;
  price: number;
  stock?: number;
  status?: string;
  images?: string[];
}

const INITIAL_PRODUCTS: ProductRow[] = [
  {
    id: 'p1',
    name: 'iPhone 13 128GB (Green, Unlocked)',
    category: 'Phones & Tablets',
    price: 420000,
    stock: 12,
    status: 'Active',
    views: 340,
    dateAdded: 'Aug 14, 2026',
  },
  {
    id: 'p2',
    name: 'HP Laptop 15 (16GB RAM / 512GB SSD)',
    category: 'Laptops & Computers',
    price: 310000,
    stock: 4,
    status: 'Active',
    views: 280,
    dateAdded: 'Aug 16, 2026',
  },
  {
    id: 'p3',
    name: 'Nike Air Force 1 (White / Size 43)',
    category: 'Fashion & Shoes',
    price: 84000,
    stock: 15,
    status: 'Active',
    views: 520,
    dateAdded: 'Aug 18, 2026',
  },
  {
    id: 'p4',
    name: 'Soundcore Life Q30 Headset',
    category: 'Electronics & Audio',
    price: 35000,
    stock: 20,
    status: 'Active',
    views: 190,
    dateAdded: 'Aug 19, 2026',
  },
  {
    id: 'p5',
    name: 'Smart Watch Series 8 GPS',
    category: 'Wearables',
    price: 25000,
    stock: 0,
    status: 'Out of Stock',
    views: 410,
    dateAdded: 'Aug 10, 2026',
  },
  {
    id: 'p6',
    name: 'Organic Chemistry 4th Edition',
    category: 'Books & Materials',
    price: 4500,
    stock: 3,
    status: 'Draft',
    views: 65,
    dateAdded: 'Aug 20, 2026',
  },
];

export default function MyProductsPage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Draft' | 'Out of Stock' | 'Sold'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<ProductRow[]>(INITIAL_PRODUCTS);

  useEffect(() => {
    async function loadLiveProducts() {
      try {
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const mapped: ProductRow[] = data.products.map((p: ApiProduct) => ({
            id: p.id,
            name: p.name,
            category: p.category_id || 'General',
            price: Number(p.price),
            stock: p.stock ?? 1,
            status: p.status === 'sold' ? 'Sold' : 'Active',
            views: Math.floor(Math.random() * 200) + 20,
            dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            imageUrl: p.images?.[0],
          }));
          setProducts(mapped);
        }
      } catch {
        // Keep initial products
      }
    }
    loadLiveProducts();
  }, []);

  // Filter products by tab and search
  const filteredProducts = products.filter((p) => {
    const matchesTab = activeTab === 'All' || p.status === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getStatusBadge = (status: ProductRow['status']) => {
    switch (status) {
      case 'Active':
        return <span className="bg-emerald-50 text-[#087443] border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md">Active</span>;
      case 'Out of Stock':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md">Out of Stock</span>;
      case 'Draft':
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md">Draft</span>;
      case 'Sold':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md">Sold</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row text-slate-900">
      
      {/* ── SIDEBAR (DEEP EMERALD #032B19) ── */}
      <aside className="w-full md:w-64 bg-[#032B19] text-white flex flex-col justify-between p-5 shrink-0 border-r border-emerald-950">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo variant="compact" theme="light" size="sm" />
          </Link>

          {/* Navigation Items */}
          <div className="space-y-4">
            <div>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-emerald-100/80 hover:bg-white/10 text-xs font-bold transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                <span>Overview</span>
              </Link>
            </div>

            {/* Store Group */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/60 px-3 py-1">
                Store
              </div>
              <Link
                href="/seller/products"
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#087443] text-white text-xs font-bold shadow-xs"
              >
                <Package className="w-4 h-4 text-[#FBBF24]" />
                <span>Products</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span>Orders</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Star className="w-4 h-4 text-emerald-300" />
                <span>Reviews</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <BarChart2 className="w-4 h-4 text-emerald-300" />
                <span>Analytics</span>
              </Link>
            </div>

            {/* Manage Group */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/60 px-3 py-1">
                Manage
              </div>
              <Link
                href="/seller/products"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Archive className="w-4 h-4 text-[#FBBF24]" />
                <span>Inventory</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Tag className="w-4 h-4 text-emerald-300" />
                <span>Coupons</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-emerald-300" />
                <span>Store Settings</span>
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <CreditCard className="w-4 h-4 text-emerald-300" />
                <span>Payouts</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-emerald-900/60 space-y-1">
          <Link
            href="/conversations"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help &amp; Support</span>
          </Link>
          <Link
            href="/auth"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN INVENTORY CONTENT ── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Products</h1>
            <p className="text-xs text-slate-500">Manage all listings and stock in your store catalog.</p>
          </div>

          <Link
            href="/create-product"
            className="inline-flex items-center gap-1.5 bg-[#087443] hover:bg-[#065f37] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Status Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar text-xs font-bold">
          {(['All', 'Active', 'Draft', 'Out of Stock', 'Sold'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            const count = tab === 'All' ? products.length : products.filter((p) => p.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 font-bold ${
                  isSelected
                    ? 'border-[#087443] text-[#087443]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{tab === 'All' ? 'All Products' : tab}</span>
                <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Category Filter, and Add Button Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search products by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFAF8] border border-slate-200 focus:border-[#087443] text-xs text-slate-900 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#087443]/15 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#FAFAF8] border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-[#087443]"
            >
              <option value="All">All Categories</option>
              <option value="Phones & Tablets">Phones &amp; Tablets</option>
              <option value="Laptops & Computers">Laptops &amp; Computers</option>
              <option value="Fashion & Shoes">Fashion &amp; Shoes</option>
              <option value="Electronics & Audio">Electronics &amp; Audio</option>
              <option value="Books & Materials">Books &amp; Materials</option>
            </select>

            <button
              type="button"
              className="inline-flex items-center gap-1 bg-[#FAFAF8] border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#087443]" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Product Data Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#FAFAF8] text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Views</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Product Cell */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E8F5EF] to-slate-100 flex items-center justify-center text-[#087443] shrink-0 border border-slate-200/60 overflow-hidden">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-[#087443]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/products/${p.id}`} className="font-bold text-slate-900 hover:text-[#087443] transition-colors truncate block max-w-xs">
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-slate-400">{p.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price Cell */}
                    <td className="px-5 py-3.5 font-black text-[#087443] text-sm">
                      ₦{p.price.toLocaleString()}
                    </td>

                    {/* Stock Cell */}
                    <td className="px-5 py-3.5 font-bold text-slate-700">
                      {p.stock}
                    </td>

                    {/* Status Badge Cell */}
                    <td className="px-5 py-3.5">
                      {getStatusBadge(p.status)}
                    </td>

                    {/* Views Cell */}
                    <td className="px-5 py-3.5 text-slate-500 font-semibold">
                      {p.views}
                    </td>

                    {/* Actions Cell */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${p.id}`}
                          className="w-8 h-8 rounded-lg hover:bg-[#E8F5EF] text-slate-500 hover:text-[#087443] flex items-center justify-center transition-colors"
                          title="View on marketplace"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Showing 1 to {filteredProducts.length} of {products.length} products</span>

            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#087443] text-white font-bold flex items-center justify-center shadow-2xs">
                1
              </button>
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold">
                2
              </button>
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold">
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold">
                12
              </button>
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
