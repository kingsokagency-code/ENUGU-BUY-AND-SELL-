/**
 * app/api/admin/applications/route.ts
 * Admin Endpoint to fetch all recruitment applications with filtering & sorting
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTeamApplications } from '@/lib/recruitment';
import { sanitizeErrorMessage } from '@/lib/error-utils';

async function checkAdminAuthorized(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('ebs_admin_session')?.value;
  const adminKey = process.env.INSIGHTS_ADMIN_KEY || process.env.DASHBOARD_PASSWORD;

  if (sessionCookie && adminKey && sessionCookie === adminKey) {
    return true;
  }

  const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (authHeader && adminKey && authHeader === adminKey) {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  try {
    const isAuthorized = await checkAdminAuthorized(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const team_area = searchParams.get('team_area') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort_by = (searchParams.get('sort_by') as any) || 'created_at';

    const res = await getTeamApplications({
      team_area,
      status,
      search,
      sort_by,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error || 'Failed to fetch applications' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      applications: res.applications,
      count: res.applications.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, 'Failed to process admin applications request') },
      { status: 500 }
    );
  }
}
