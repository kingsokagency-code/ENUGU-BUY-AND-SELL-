import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getAllResponses } from '@/lib/supabase';

function isAuthorized(adminCookie: string | undefined, adminHeader: string | null): boolean {
  // Fail-Closed: Strict server environment check. No fallback secret allowed.
  const expectedKey = process.env.INSIGHTS_ADMIN_KEY || process.env.DASHBOARD_PASSWORD;
  if (!expectedKey) return false;
  return (adminCookie === expectedKey) || (adminHeader === expectedKey);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const adminCookie = cookieStore.get('ebs_admin_session')?.value;
    const adminHeader = headerStore.get('x-admin-key');

    if (!isAuthorized(adminCookie, adminHeader)) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const responses = await getAllResponses();
    return NextResponse.json({ responses, count: responses.length });
  } catch (err) {
    console.error('[API] responses error:', err);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
