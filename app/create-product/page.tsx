'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/telemetry';
import { getSession } from '@/lib/auth';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ArrowLeft, CheckCircle2, Package, Plus, Store } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  slug: string;
  location?: string;
}

function CreateProductForm() {
  const searchParams = useSearchParams();
  const initialShopId = searchParams.get('shop_id') ?? '';

  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState(initialShopId);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Used');
  const [location] = useState('UNEC Campus, Enugu');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [loadingShops, setLoadingShops] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOwnedShops() {
      setLoadingShops(true);
      try {
        const { session } = await getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/shops?owner=true', { headers });
        const data = await res.json();
        if (res.status === 401) {
          setError('Authentication required. Please Sign In to add products.');
        } else {
          const ownedList = data.shops ?? [];
          setShops(ownedList);
          if (!shopId && ownedList.length > 0) {
            setShopId(ownedList[0].id);
          }
        }
      } catch {
        console.warn('[PRODUCT] Error loading seller shops');
      } finally {
        setLoadingShops(false);
      }
    }
    loadOwnedShops();
  }, [shopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shopId) {
      setError('Please select or create a shop first.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid price greater than ₦0.');
      return;
    }

    setLoading(true);

    try {
      const { session } = await getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          shop_id: shopId,
          name,
          price: numPrice,
          description,
          condition,
          location,
          images: imageUrl ? [imageUrl] : [],
        }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setError('Seller authentication required. Please Sign In first.');
      } else if (res.status === 403) {
        setError('Forbidden: You do not own the selected shop.');
      } else if (!res.ok) {
        setError(data.error || 'Failed to create product');
      } else {
        setCreatedProductId(data.product.id);
        trackEvent('product_created', { product_id: data.product.id, shop_id: shopId });
        trackEvent('product_published', { product_id: data.product.id, shop_id: shopId });
      }
    } catch {
      setError('Connection error while publishing product');
    } finally {
      setLoading(false);
    }
  };

  if (loadingShops) {
    return (
      <div className="text-center py-12 space-y-2">
        <div className="w-8 h-8 border-2 border-[#087443] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#667085]">Checking seller credentials &amp; shops...</p>
      </div>
    );
  }

  if (shops.length === 0 && !createdProductId) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/15">
          <Store className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#111111]">Create a Store First</h2>
        <p className="text-xs text-[#667085] max-w-sm mx-auto">
          Every product must belong to a storefront. Create your shop to start listing items!
        </p>
        <Link
          href="/create-shop"
          className="inline-block bg-[#087443] hover:bg-[#065f37] text-white text-xs font-bold px-6 py-2.5 rounded-xl mt-2 shadow-xs transition-all"
        >
          Create Storefront Now &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div>
      {createdProductId ? (
        /* SUCCESS STATE */
        <div className="bg-white border border-[#087443]/30 rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F5EF] text-[#087443] flex items-center justify-center mx-auto border border-[#087443]/20 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-[#087443]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                  Product Published Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] max-w-sm mx-auto">
                  &ldquo;{name}&rdquo; is now live in the marketplace for campus buyers to discover.
                </p>
              </div>
              <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href={`/products/${createdProductId}`}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#087443] hover:bg-[#065f37] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-xs transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span>View Published Listing &rarr;</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedProductId(null);
                    setName('');
                    setPrice('');
                    setDescription('');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:border-slate-400 text-[#111111] font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#667085]" />
                  <span>+ List Another Product</span>
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE MATCHING REFERENCE SCREENSHOT */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Add New Product</h1>
                <p className="text-xs text-slate-500 mt-0.5">Fill in the details to list your product in your store.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center justify-between gap-2 font-medium">
                    <span>{error}</span>
                    {error.includes('Sign In') && (
                      <Link href="/auth?redirect=/create-product" className="bg-[#087443] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                        Sign In Now
                      </Link>
                    )}
                  </div>
                )}

                {/* Shop Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Storefront *
                  </label>
                  {shops.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                      <span>You have not created a shop yet.</span>
                      <Link href="/create-shop" className="bg-[#087443] text-white font-bold px-3 py-1.5 rounded-lg">
                        Create Shop First
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={shopId}
                      onChange={(e) => setShopId(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3.5 py-3 outline-none focus:border-[#087443]"
                      required
                    >
                      {shops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.location})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Product Photo */}
                <ImageUpload
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  folder="products"
                  label="Product Photo *"
                  helperText="Tap to take photo or choose from gallery"
                  shape="square"
                />

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 13 128GB"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAFAF8] border border-slate-200 focus:border-[#087443] text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-3 outline-none font-medium placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Category *
                  </label>
                  <select
                    className="w-full bg-[#FAFAF8] border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 rounded-xl px-3.5 py-3 outline-none focus:border-[#087443]"
                  >
                    <option value="phones">Phones &amp; Tablets</option>
                    <option value="laptops">Laptops &amp; Computers</option>
                    <option value="fashion">Fashion &amp; Shoes</option>
                    <option value="electronics">Electronics &amp; Audio</option>
                    <option value="appliances">Home &amp; Kitchen</option>
                    <option value="books">Books &amp; Textbooks</option>
                    <option value="services">Campus Services</option>
                  </select>
                </div>

                {/* Price (₦) and Stock Quantity Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="e.g. 420000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-slate-200 focus:border-[#087443] text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-3 outline-none font-bold placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      defaultValue={1}
                      min={1}
                      className="w-full bg-[#FAFAF8] border border-slate-200 focus:border-[#087443] text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-3 outline-none font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Condition Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-[#FAFAF8] border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 rounded-xl px-3.5 py-3 outline-none focus:border-[#087443]"
                  >
                    <option value="New">Brand New</option>
                    <option value="Used">Used (Good Condition)</option>
                    <option value="Refurbished">Refurbished / Open Box</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your product, specifications, warranty, or condition..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#FAFAF8] border border-slate-200 focus:border-[#087443] text-xs sm:text-sm text-slate-900 rounded-xl p-3.5 outline-none font-medium placeholder:text-slate-400 resize-none leading-relaxed"
                  />
                </div>

                {/* Action Buttons: Cancel and Publish Product */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Link
                    href="/seller/products"
                    className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#087443] hover:bg-[#065f37] disabled:opacity-50 text-white font-extrabold text-xs px-7 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <span>Publish Product</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <div className="text-[#111111] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087443] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inventory</span>
          </Link>
          <span className="text-xs font-bold text-[#087443] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#087443]/15">
            Seller Hub
          </span>
        </div>

        <Suspense fallback={<p className="text-xs text-[#667085]">Loading product creation form...</p>}>
          <CreateProductForm />
        </Suspense>
      </div>
    </div>
  );
}
