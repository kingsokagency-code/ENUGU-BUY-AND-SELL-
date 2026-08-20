/**
 * scripts/live_http_tests.ts
 * Live HTTP endpoint tests against deployed production (read-only)
 * Tests C1/H1 (Admin auth), H2 (OTP gate), H5 (AI scope), M5 (Routes)
 */

const BASE_URL = 'https://enugu-buy-sell.vercel.app';

interface HttpResult {
  id: string;
  test: string;
  expected: number;
  actual: number;
  passed: boolean;
  body?: string;
}

const httpResults: HttpResult[] = [];

async function testEndpoint(id: string, test: string, url: string, options: RequestInit, expectedStatus: number): Promise<void> {
  try {
    const res = await fetch(url, options);
    const body = await res.text().catch(() => '');
    const passed = res.status === expectedStatus;
    httpResults.push({ id, test, expected: expectedStatus, actual: res.status, passed, body: body.slice(0, 200) });
    const icon = passed ? '✓ PASS' : '❌ FAIL';
    console.log(`[${id}] ${icon}: ${test}`);
    console.log(`        Expected: ${expectedStatus} | Got: ${res.status}`);
    if (!passed) console.log(`        Body: ${body.slice(0, 200)}`);
  } catch (err: unknown) {
    httpResults.push({ id, test, expected: expectedStatus, actual: 0, passed: false, body: String(err) });
    console.log(`[${id}] ❌ FAIL (network): ${test} — ${String(err)}`);
  }
}

async function runLiveHttpTests() {
  console.log('\n==================================================');
  console.log('KINSOK PHASE 1 — LIVE HTTP ENDPOINT TESTS');
  console.log(`Target: ${BASE_URL}`);
  console.log('==================================================\n');

  // C1/H1 — Unauthenticated GET /api/responses → 401
  await testEndpoint('C1/H1-1', 'Unauthenticated GET /api/responses → 401',
    `${BASE_URL}/api/responses`, { method: 'GET' }, 401);

  // C1/H1 — Wrong credentials GET /api/responses with bad x-admin-key → 401
  await testEndpoint('C1/H1-2', 'Wrong x-admin-key GET /api/responses → 401',
    `${BASE_URL}/api/responses`, { method: 'GET', headers: { 'x-admin-key': 'wrong_key_12345' } }, 401);

  // C1/H1 — POST /api/admin/login with no body → should not give 200
  await testEndpoint('C1/H1-3', 'Unauthenticated POST /api/admin/login with no credentials → 401 or 400',
    `${BASE_URL}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: '' }) }, 401);

  // H5 — POST /api/insights must be 403 (AI disabled in Phase 1)
  await testEndpoint('H5-1', 'POST /api/insights returns 403 (AI disabled)',
    `${BASE_URL}/api/insights`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }, 403);

  // M5 — Route rendering checks
  await testEndpoint('M5-1', 'GET / returns 200', `${BASE_URL}/`, { method: 'GET' }, 200);
  await testEndpoint('M5-2', 'GET /browse returns 200', `${BASE_URL}/browse`, { method: 'GET' }, 200);
  await testEndpoint('M5-3', 'GET /auth returns 200', `${BASE_URL}/auth`, { method: 'GET' }, 200);
  await testEndpoint('M5-4', 'GET /shops returns 200', `${BASE_URL}/shops`, { method: 'GET' }, 200);
  await testEndpoint('M5-5', 'GET /dashboard returns 200', `${BASE_URL}/dashboard`, { method: 'GET' }, 200);
  await testEndpoint('M5-6', 'GET /create-shop returns 200', `${BASE_URL}/create-shop`, { method: 'GET' }, 200);

  // M3 — Unauthenticated POST /api/shops → 401
  await testEndpoint('M3-1', 'Unauthenticated POST /api/shops → 401',
    `${BASE_URL}/api/shops`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test Shop', slug: 'test-shop' }) }, 401);

  // M3 — Unauthenticated POST /api/products → 401
  await testEndpoint('M3-2', 'Unauthenticated POST /api/products → 401',
    `${BASE_URL}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test Product', price: 100 }) }, 401);

  // Summary
  console.log('\n==================================================');
  const total = httpResults.length;
  const passed = httpResults.filter(r => r.passed).length;
  const failed = httpResults.filter(r => !r.passed).length;
  console.log(`LIVE HTTP TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveHttpTests().catch(console.error);
