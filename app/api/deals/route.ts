import { NextResponse, NextRequest } from 'next/server';

export interface DealItem {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  imageUrl?: string;
  sellerName: string;
  isVerifiedSeller: boolean;
  location: string;
  viewersCount: number;
  isFeatured?: boolean;
  createdAt: string;
}

// In-memory store initialized with realistic Enugu deals
let dealsStore: DealItem[] = [
  {
    id: 'd1',
    name: 'iPhone 13 Pro (Alpine Green, 128GB)',
    category: 'Phones & Tablets',
    originalPrice: 620000,
    dealPrice: 580000,
    discountPercent: 6,
    imageUrl: '/placeholder-phone.png',
    sellerName: "Kingsley's Tech Hub",
    isVerifiedSeller: true,
    location: 'Nsukka, Enugu',
    viewersCount: 14,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd2',
    name: 'MacBook Pro 14" (M1 Pro / 16GB RAM)',
    category: 'Electronics',
    originalPrice: 950000,
    dealPrice: 880000,
    discountPercent: 7,
    imageUrl: '/placeholder-laptop.png',
    sellerName: 'Prime Gadgets Enugu',
    isVerifiedSeller: true,
    location: 'Independence Layout, Enugu',
    viewersCount: 21,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd3',
    name: 'Samsung Galaxy S23 Ultra (512GB)',
    category: 'Phones & Tablets',
    originalPrice: 780000,
    dealPrice: 710000,
    discountPercent: 9,
    imageUrl: '/placeholder-phone.png',
    sellerName: 'Emeka Mobile Hub',
    isVerifiedSeller: true,
    location: 'UNEC Campus, Enugu',
    viewersCount: 18,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd4',
    name: 'Sony WH-1000XM5 Noise Canceling',
    category: 'Electronics',
    originalPrice: 240000,
    dealPrice: 210000,
    discountPercent: 12,
    imageUrl: '/placeholder-headphones.png',
    sellerName: 'SoundWave Audio',
    isVerifiedSeller: true,
    location: 'New Haven, Enugu',
    viewersCount: 11,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
];

// GET: Fetch all active live deals
export async function GET() {
  return NextResponse.json({
    success: true,
    deals: dealsStore,
    totalDeals: dealsStore.length,
    activeViewers: dealsStore.reduce((acc, d) => acc + d.viewersCount, 0),
  });
}

// POST: Add a new live deal from Admin Dashboard
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      originalPrice,
      dealPrice,
      imageUrl,
      sellerName,
      location,
      isVerifiedSeller = true,
    } = body;

    if (!name || !dealPrice || !sellerName) {
      return NextResponse.json(
        { success: false, error: 'Name, deal price, and seller name are required' },
        { status: 400 }
      );
    }

    const orig = Number(originalPrice) || Number(dealPrice);
    const dealP = Number(dealPrice);
    const discount = orig > dealP ? Math.round(((orig - dealP) / orig) * 100) : 0;

    const newDeal: DealItem = {
      id: `deal-${Date.now()}`,
      name: name.trim(),
      category: category || 'General',
      originalPrice: orig,
      dealPrice: dealP,
      discountPercent: discount,
      imageUrl: imageUrl || '/placeholder-phone.png',
      sellerName: sellerName.trim(),
      isVerifiedSeller: Boolean(isVerifiedSeller),
      location: location?.trim() || 'Enugu',
      viewersCount: Math.floor(Math.random() * 15) + 5,
      isFeatured: true,
      createdAt: new Date().toISOString(),
    };

    // Prepend to top of live deals list
    dealsStore = [newDeal, ...dealsStore];

    return NextResponse.json({
      success: true,
      deal: newDeal,
      totalDeals: dealsStore.length,
    });
  } catch (error) {
    console.error('[API Deals POST Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a deal by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Deal ID is required' }, { status: 400 });
    }

    dealsStore = dealsStore.filter((d) => d.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Deal removed successfully',
      remainingCount: dealsStore.length,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete deal' }, { status: 500 });
  }
}
