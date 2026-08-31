import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Accepted admin passwords: environment variables + authorized EBS admin keys
    const validKeys = [
      process.env.INSIGHTS_ADMIN_KEY,
      process.env.DASHBOARD_PASSWORD,
      process.env.ADMIN_PASSWORD,
      'ebs_admin_2026',
      'enugu2026',
      'enugu2024',
    ].filter(Boolean) as string[];

    const trimmedInput = (password || '').trim();

    const isMatch = validKeys.some((k) => k === trimmedInput);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });

    // Set secure HTTP-Only admin session cookie
    response.cookies.set({
      name: 'ebs_admin_session',
      value: trimmedInput,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
