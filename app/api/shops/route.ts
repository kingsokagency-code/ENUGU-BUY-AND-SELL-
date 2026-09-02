import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthenticatedUser, getAdminClient } from '@/lib/server-auth';
import { createShopSchema } from '@/lib/validations/shop';

/**
 * GET /api/shops
 * List active shops or user's owned shops (?owner=true)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerOnly = searchParams.get('owner') === 'true';
    const q = searchParams.get('q')?.trim() ?? '';

    if (ownerOnly) {
      const { user, error: authErr } = await getAuthenticatedUser(request);
      if (authErr || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const admin = getAdminClient();
      const { data: userShops, error } = await admin
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, shops: userShops ?? [] });
    }

    let query = supabase
      .from('shops')
      .select('*, profiles(full_name, avatar_url, is_verified)')
      .order('created_at', { ascending: false })
      .limit(40);

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`);
    }

    const { data: shops, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: shops?.length ?? 0, shops: shops ?? [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/shops
 * Authenticated Shop Creation for Sellers
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate seller user session
    const { user, error: authErr } = await getAuthenticatedUser(request);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized seller authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // 2. Server-side Zod Validation
    const validated = createShopSchema.parse(body);

    // 3. Check if user already owns a shop
    const admin = getAdminClient();
    const { data: userExistingShop } = await admin
      .from('shops')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (userExistingShop) {
      // User already has a shop -> update it smoothly
      const updateData: Record<string, unknown> = {
        name: validated.name,
        description: validated.description,
        location: validated.location ?? 'Enugu',
        updated_at: new Date().toISOString(),
      };
      if (typeof validated.logo_url === 'string') {
        updateData.logo_url = validated.logo_url || null;
      }

      const { data: updatedShop, error: updErr } = await admin
        .from('shops')
        .update(updateData)
        .eq('id', userExistingShop.id)
        .select()
        .single();

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, shop: updatedShop, message: 'Shop updated successfully' }, { status: 200 });
    }

    // 4. Check if slug is taken by another user -> generate unique slug
    let targetSlug = validated.slug;
    const { data: existingSlugShop } = await admin
      .from('shops')
      .select('id')
      .eq('slug', targetSlug)
      .maybeSingle();

    if (existingSlugShop) {
      targetSlug = `${validated.slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 5. Database Insertion
    const insertData: Record<string, unknown> = {
      owner_id: user.id,
      name: validated.name,
      slug: targetSlug,
      description: validated.description,
      location: validated.location ?? 'Enugu',
    };
    if (typeof validated.logo_url === 'string' && validated.logo_url) {
      insertData.logo_url = validated.logo_url;
    }

    const { data: shop, error: dbErr } = await admin
      .from('shops')
      .insert(insertData)
      .select()
      .single();

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 400 });
    }

    // Log telemetry event
    try {
      await admin.from('analytics_events').insert({
        event_name: 'shop_created',
        event_data: { shop_id: shop.id, slug: shop.slug },
        user_id: user.id,
      });
    } catch {}

    return NextResponse.json({ success: true, shop }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err && Array.isArray((err as any).errors)) {
      const messages = (err as any).errors.map((e: any) => e.message).filter(Boolean);
      const formattedError = messages.length > 0 ? messages.join('. ') : 'Validation Error';
      return NextResponse.json({ error: formattedError, details: (err as any).errors }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

