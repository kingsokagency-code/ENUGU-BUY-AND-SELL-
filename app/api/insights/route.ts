import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getLatestInsight } from '@/lib/supabase';

function isAuthorized(adminCookie: string | undefined, adminHeader: string | null): boolean {
  // Fail-Closed: Strict server environment check. No fallback secret allowed.
  const expectedKey = process.env.INSIGHTS_ADMIN_KEY || process.env.DASHBOARD_PASSWORD;
  if (!expectedKey) return false;
  return (adminCookie === expectedKey) || (adminHeader === expectedKey);
}

// ── GET /api/insights — protected latest report ──
export async function GET() {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const adminCookie = cookieStore.get('ebs_admin_session')?.value;
    const adminHeader = headerStore.get('x-admin-key');

    if (!isAuthorized(adminCookie, adminHeader)) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const insight = await getLatestInsight();
    return NextResponse.json({ insight });
  } catch (err) {
    console.error('[EBS] GET insights error:', err);
    return NextResponse.json({ error: 'Failed to fetch insight' }, { status: 500 });
  }
}

// ── POST /api/insights — disabled in Phase 1 MVP Scope (H5) ──
export async function POST() {
  return NextResponse.json(
    { error: 'AI Analysis execution disabled in Phase 1 Core MVP Scope.' },
    { status: 403 }
  );
}
