import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Strict Fail-Closed Security: Must match server environment variable. No fallback secret.
    const expectedPassword = process.env.INSIGHTS_ADMIN_KEY || process.env.DASHBOARD_PASSWORD;

    if (!expectedPassword) {
      console.error('[SECURITY] Admin key not configured in environment variables.');
      return NextResponse.json({ error: 'Server authentication unconfigured. Access denied.' }, { status: 500 });
    }

    if (!password || password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });

    // Set secure HTTP-Only admin session cookie
    response.cookies.set({
      name: 'ebs_admin_session',
      value: expectedPassword,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
