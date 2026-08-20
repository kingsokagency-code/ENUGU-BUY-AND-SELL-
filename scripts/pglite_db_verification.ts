// @ts-nocheck
/**
 * scripts/pglite_db_verification.ts
 * KINSOK Phase 1 — Disposable Database Verification Engine (PGLite WASM Postgres)
 * Executes H3, H4, M1, M2 against a real, isolated PostgreSQL 16 engine in WebAssembly.
 *
 * HARD RULES:
 * - 100% isolated, disposable in-memory PostgreSQL instance
 * - Does not touch production
 * - Does not modify application source code, package.json, or migrations
 */

import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import * as fs from 'fs';
import * as path from 'path';

const MIGRATION_FILE = path.join(__dirname, '..', 'supabase', 'migrations', '001_phase1_consolidated_schema.sql');

interface TestResult {
  id: string;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];
let totalPass = 0, totalFail = 0;

function record(id: string, description: string, expected: string, actual: string, passed: boolean, error?: string) {
  results.push({ id, description, expected, actual, passed, error });
  if (passed) {
    totalPass++;
    console.log(`  ✓ PASS [${id}] ${description}`);
  } else {
    totalFail++;
    console.log(`  ✗ FAIL [${id}] ${description}`);
    console.log(`         Expected: ${expected}`);
    console.log(`         Actual:   ${actual}`);
    if (error) console.log(`         Error:    ${error}`);
  }
}

// ── Mock Supabase Auth Schema Setup ──────────────────────────────────────────
const AUTH_SCHEMA_MOCK = `
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;

CREATE TABLE IF NOT EXISTS auth.users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        text,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
`;

async function runDatabaseVerification() {
  console.log('\n==================================================');
  console.log('KINSOK PHASE 1 — DISPOSABLE DATABASE VERIFICATION');
  console.log('Engine: PGLite (PostgreSQL 16 WebAssembly)');
  console.log('==================================================\n');

  const db = new PGlite({
    extensions: {
      uuid_ossp,
    },
  });

  // ── TASK 3 / H4 — MIGRATION VERIFICATION ─────────────────────────────────
  console.log('── H4: Migration Verification ──────────────────────────────');

  let migrationSQL = '';
  try {
    migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
    console.log(`  Loaded migration file: ${MIGRATION_FILE} (${migrationSQL.length} bytes)`);
  } catch (e: unknown) {
    console.error('  ✗ Cannot read migration file:', e);
    process.exit(1);
  }

  // 1. Setup Auth schema
  try {
    await db.exec(AUTH_SCHEMA_MOCK);
    console.log('  ✓ Auth schema initialized');
  } catch (e: unknown) {
    console.error('  ✗ Auth schema setup failed:', e);
    process.exit(1);
  }

  // 2. Apply migration 001
  try {
    await db.exec(migrationSQL);
    record('H4-1', 'Migration 001 applies cleanly to empty database', 'No errors', 'Applied successfully', true);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('H4-1', 'Migration 001 applies cleanly to empty database', 'No errors', 'MIGRATION FAILED', false, msg);
    console.error(`\n  MIGRATION FAILED: ${msg}\n`);
    process.exit(1);
  }

  // 2b. Apply migration 002 (Telemetry)
  const TELEMETRY_MIGRATION_FILE = path.join(__dirname, '..', 'supabase', 'migrations', '002_phase2_telemetry_schema.sql');
  try {
    const telemetrySQL = fs.readFileSync(TELEMETRY_MIGRATION_FILE, 'utf8');
    await db.exec(telemetrySQL);
    record('TEL-1', 'Migration 002 Telemetry applies cleanly', 'No errors', 'Applied successfully', true);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('TEL-1', 'Migration 002 Telemetry applies cleanly', 'No errors', 'MIGRATION FAILED', false, msg);
  }

  // 3. Schema checks (Tables)
  const expectedTables = ['profiles', 'shops', 'categories', 'products', 'conversations', 'messages', 'reports', 'survey_responses', 'ai_insights', 'analysis_runs', 'analytics_events'];
  const tablesRes = await db.query<{ tablename: string }>(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
  const existingTables = tablesRes.rows.map(r => r.tablename);
  for (const t of expectedTables) {
    record(`H4-table-${t}`, `Table public.${t} exists`, 'exists', existingTables.includes(t) ? 'exists' : 'MISSING', existingTables.includes(t));
  }

  // 4. View public_profiles check
  const viewRes = await db.query<{ viewname: string }>(`SELECT viewname FROM pg_views WHERE schemaname='public' AND viewname='public_profiles'`);
  record('H4-view-public_profiles', 'View public.public_profiles exists', 'exists', viewRes.rows.length > 0 ? 'exists' : 'MISSING', viewRes.rows.length > 0);

  // 5. View structure check (phone excluded, public fields present)
  const viewColsRes = await db.query<{ column_name: string }>(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='public_profiles'
  `);
  const viewCols = viewColsRes.rows.map(r => r.column_name);
  record('H4-view-no-phone', 'public_profiles view excludes phone column', 'phone absent', viewCols.includes('phone') ? 'phone PRESENT (DEFECT!)' : 'phone absent', !viewCols.includes('phone'));
  record('H4-view-has-expected', 'public_profiles view includes public fields', 'id,full_name,avatar_url,location,is_verified,created_at', viewCols.join(','), ['id','full_name','avatar_url','location','is_verified','created_at'].every(c => viewCols.includes(c)));

  // 6. RLS enabled
  const rlsTables = ['profiles', 'shops', 'categories', 'products', 'conversations', 'messages', 'reports', 'survey_responses', 'ai_insights'];
  const rlsRes = await db.query<{ relname: string }>(`SELECT relname FROM pg_class WHERE relrowsecurity=true AND relname=ANY($1)`, [rlsTables]);
  const rlsEnabled = rlsRes.rows.map(r => r.relname);
  for (const t of rlsTables) {
    record(`H4-rls-${t}`, `RLS enabled on public.${t}`, 'enabled', rlsEnabled.includes(t) ? 'enabled' : 'NOT ENABLED', rlsEnabled.includes(t));
  }

  // 7. Functions check
  const funcsRes = await db.query<{ proname: string }>(`SELECT proname FROM pg_proc WHERE pronamespace=(SELECT oid FROM pg_namespace WHERE nspname='public') AND proname IN ('handle_new_user','verify_conversation_seller')`);
  const existingFuncs = funcsRes.rows.map(r => r.proname);
  record('H4-fn-handle_new_user', 'Function handle_new_user() exists', 'exists', existingFuncs.includes('handle_new_user') ? 'exists' : 'MISSING', existingFuncs.includes('handle_new_user'));
  record('H4-fn-verify_conversation_seller', 'Function verify_conversation_seller() exists', 'exists', existingFuncs.includes('verify_conversation_seller') ? 'exists' : 'MISSING', existingFuncs.includes('verify_conversation_seller'));

  // 8. Triggers check
  const trigRes = await db.query<{ tgname: string }>(`SELECT tgname FROM pg_trigger WHERE tgname IN ('on_auth_user_created','trg_verify_conversation_seller')`);
  const existingTriggers = trigRes.rows.map(r => r.tgname);
  record('H4-trig-on_auth_user_created', 'Trigger on_auth_user_created exists', 'exists', existingTriggers.includes('on_auth_user_created') ? 'exists' : 'MISSING', existingTriggers.includes('on_auth_user_created'));
  record('H4-trig-verify_conversation_seller', 'Trigger trg_verify_conversation_seller exists', 'exists', existingTriggers.includes('trg_verify_conversation_seller') ? 'exists' : 'MISSING', existingTriggers.includes('trg_verify_conversation_seller'));

  // 9. NOT NULL constraint on conversations.product_id
  const nnRes = await db.query<{ is_nullable: string }>(`SELECT is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='product_id'`);
  record('H4-nn-product_id', 'conversations.product_id is NOT NULL', 'NO', nnRes.rows[0]?.is_nullable, nnRes.rows[0]?.is_nullable === 'NO');

  // 10. RLS policy count
  const polRes = await db.query<{ count: string }>(`SELECT count(*) FROM pg_policy`);
  const polCount = parseInt(polRes.rows[0].count, 10);
  record('H4-policies-count', 'At least 10 RLS policies created', '>=10', String(polCount), polCount >= 10);


  // ── TASK 5 / M2 — PROFILE PROVISIONING ───────────────────────────────────
  console.log('\n── M2: Profile Provisioning ───────────────────────────────');

  const userARes = await db.query<{ id: string }>(`INSERT INTO auth.users (phone, raw_user_meta_data) VALUES ('+2348011111111', '{"full_name":"Student Alpha"}') RETURNING id`);
  const userAId = userARes.rows[0].id;

  const userBRes = await db.query<{ id: string }>(`INSERT INTO auth.users (phone, raw_user_meta_data) VALUES ('+2348022222222', '{"full_name":"Student Beta"}') RETURNING id`);
  const userBId = userBRes.rows[0].id;

  const profCheck = await db.query<{ id: string; phone: string; full_name: string; location: string }>(`SELECT id, phone, full_name, location FROM public.profiles WHERE id IN ($1, $2)`, [userAId, userBId]);
  const profA = profCheck.rows.find(r => r.id === userAId);
  const profB = profCheck.rows.find(r => r.id === userBId);

  record('M2-1', 'Trigger auto-creates profile on auth.users INSERT', '2 profiles auto-created', `${profCheck.rows.length} profiles created`, profCheck.rows.length === 2);
  record('M2-2', 'Profile ID matches auth user ID', userAId, profA?.id, profA?.id === userAId);
  record('M2-3', 'Profile phone matches auth phone', '+2348011111111', profA?.phone, profA?.phone === '+2348011111111');
  record('M2-4', 'Profile full_name defaults from raw_user_meta_data', 'Student Alpha', profA?.full_name, profA?.full_name === 'Student Alpha');
  record('M2-5', 'Profile location defaults to Enugu', 'Enugu', profA?.location, profA?.location === 'Enugu');

  // Idempotency: re-insert same auth user should not duplicate profile
  try {
    await db.query(`INSERT INTO auth.users (id, phone, raw_user_meta_data) VALUES ($1, '+2348011111111', '{"full_name":"Student Alpha"}') ON CONFLICT DO NOTHING`, [userAId]);
    const dupCheck = await db.query<{ count: string | number }>(`SELECT count(*) FROM public.profiles WHERE id=$1`, [userAId]);
    const countVal = Number(dupCheck.rows[0].count);
    record('M2-6', 'Duplicate auth user insert does not duplicate profile', '1 profile row', `${countVal} profile rows`, countVal === 1);
  } catch (e: unknown) {
    record('M2-6', 'Duplicate auth user insert handling', '1 profile row', 'ERROR: ' + String(e), false, String(e));
  }


  // ── TASK 2 / H3 — PHONE PRIVACY ─────────────────────────────────────────
  console.log('\n── H3: Phone Privacy ──────────────────────────────────────');

  // Test A: Anonymous / Public Profile view query (SELECT * FROM public_profiles)
  const pubProfileRes = await db.query<Record<string, unknown>>(`SELECT * FROM public.public_profiles WHERE id=$1`, [userAId]);
  const pubRow = pubProfileRes.rows[0];
  const pubColsFound = Object.keys(pubRow || {});
  record('H3-A-view-query', 'Querying public_profiles view returns public fields', 'id, full_name, avatar_url, location, is_verified, created_at', pubColsFound.join(','), ['id','full_name','location'].every(c => pubColsFound.includes(c)));
  record('H3-B-view-phone-absent', 'Querying public_profiles view does NOT return phone', 'phone undefined', String((pubRow as Record<string, unknown>)?.phone), pubRow?.phone === undefined);

  // Test C: Direct RLS policy check on profiles
  const profilePoliciesRes = await db.query<{ polname: string; polcmd: string }>(`SELECT polname, polcmd FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='profiles'`);
  const polNames = profilePoliciesRes.rows.map(r => r.polname);
  record('H3-C-policy-own-profile', 'Policy "Users read own profile" exists on profiles', 'exists', polNames.includes('Users read own profile') ? 'exists' : 'MISSING', polNames.includes('Users read own profile'));
  record('H3-D-no-public-read-profiles', 'No public SELECT policy exists on profiles table', '0 public policies', String(polNames.filter(p => p.toLowerCase().includes('public')).length), polNames.filter(p => p.toLowerCase().includes('public')).length === 0);


  // ── TASK 4 / M1 — CONVERSATION / PRODUCT OWNERSHIP ───────────────────────
  console.log('\n── M1: Conversation / Product Ownership ───────────────────');

  // Setup: Create Shop A owned by User A, Shop B owned by User B
  const shopARes = await db.query<{ id: string }>(`INSERT INTO public.shops (owner_id, slug, name) VALUES ($1, 'shop-alpha', 'Shop Alpha') RETURNING id`, [userAId]);
  const shopAId = shopARes.rows[0].id;

  const shopBRes = await db.query<{ id: string }>(`INSERT INTO public.shops (owner_id, slug, name) VALUES ($1, 'shop-beta', 'Shop Beta') RETURNING id`, [userBId]);
  const shopBId = shopBRes.rows[0].id;

  // Create Product A in Shop A, Product B in Shop B
  const prodARes = await db.query<{ id: string }>(`INSERT INTO public.products (shop_id, name, price) VALUES ($1, 'Product Alpha', 5000) RETURNING id`, [shopAId]);
  const prodAId = prodARes.rows[0].id;

  const prodBRes = await db.query<{ id: string }>(`INSERT INTO public.products (shop_id, name, price) VALUES ($1, 'Product Beta', 3000) RETURNING id`, [shopBId]);
  const prodBId = prodBRes.rows[0].id;

  // TEST A: product_id = NULL
  try {
    await db.query(`INSERT INTO public.conversations (buyer_id, seller_id, product_id) VALUES ($1, $2, NULL)`, [userBId, userAId]);
    record('M1-A', 'INSERT conversation with product_id=NULL fails (rejected by trigger/constraint)', 'Constraint/Trigger Error', 'Succeeded (DEFECT!)', false);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const isError = msg.includes('null') || msg.includes('NOT NULL') || msg.includes('not-null') || msg.includes('violates') || msg.includes('seller_id does not own');
    record('M1-A', 'INSERT conversation with product_id=NULL fails (rejected by trigger/constraint)', 'Rejection Error', msg.slice(0, 100), isError);
  }

  // TEST B: Wrong seller (UserB seller, Product A owned by UserA)
  try {
    await db.query(`INSERT INTO public.conversations (buyer_id, seller_id, product_id) VALUES ($1, $2, $3)`, [userBId, userBId, prodAId]);
    record('M1-B', 'INSERT conversation with wrong seller_id rejected by trigger', 'Trigger Error', 'Succeeded (DEFECT!)', false);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const isTrigErr = msg.includes('seller_id does not own') || msg.includes('Invalid conversation');
    record('M1-B', 'INSERT conversation with wrong seller_id rejected by trigger', 'Trigger EXCEPTION: seller_id does not own shop', msg.slice(0, 100), isTrigErr);
  }

  // TEST C: Correct seller (UserA seller, Product A owned by UserA, UserB buyer)
  let validConvId = '';
  try {
    const convRes = await db.query<{ id: string }>(`INSERT INTO public.conversations (buyer_id, seller_id, product_id) VALUES ($1, $2, $3) RETURNING id`, [userBId, userAId, prodAId]);
    validConvId = convRes.rows[0].id;
    record('M1-C', 'INSERT conversation with legitimate owner succeeds', 'SUCCESS', `Inserted ID=${validConvId.slice(0, 8)}...`, true);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('M1-C', 'INSERT conversation with legitimate owner succeeds', 'SUCCESS', 'FAILED: ' + msg, false);
  }

  // TEST D: UPDATE bypass (attempt to update conversation seller_id to UserB on Product A)
  if (validConvId) {
    try {
      await db.query(`UPDATE public.conversations SET seller_id=$1 WHERE id=$2`, [userBId, validConvId]);
      record('M1-D', 'UPDATE conversation seller_id to wrong seller rejected by trigger', 'Trigger Error', 'Succeeded (DEFECT!)', false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const isTrigErr = msg.includes('seller_id does not own') || msg.includes('Invalid conversation');
      record('M1-D', 'UPDATE conversation seller_id to wrong seller rejected by trigger', 'Trigger EXCEPTION on UPDATE', msg.slice(0, 100), isTrigErr);
    }
  } else {
    record('M1-D', 'UPDATE conversation seller_id bypass test', 'Trigger Error', 'SKIPPED (M1-C failed)', false);
  }

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
  console.log('\n==================================================');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${totalPass} | FAILED: ${totalFail}`);
  console.log('==================================================\n');

  const jsonSummary = JSON.stringify({ summary: { total: results.length, pass: totalPass, fail: totalFail }, results }, null, 2);
  fs.writeFileSync(path.join(__dirname, '..', 'pglite_verification_results.json'), jsonSummary);
  console.log('Results written to pglite_verification_results.json\n');

  process.exit(totalFail > 0 ? 1 : 0);
}

runDatabaseVerification().catch(err => {
  console.error('FATAL VERIFICATION ERROR:', err);
  process.exit(1);
});
