/**
 * scripts/run-migrations.mjs
 * Runs migrations by INSERTing into Supabase tables via REST API.
 * Uses only the service role key — no management API token needed.
 * 
 * Strategy: Use Supabase's pg_query via a bootstrap SQL function approach.
 * Actually, uses direct REST operations to verify tables and populate them.
 */

const URL   = 'https://fxailwyiitpfhlwulsiv.supabase.co';
const SVC   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HDR   = { 'apikey': SVC, 'Authorization': `Bearer ${SVC}`, 'Content-Type': 'application/json' };

async function checkTable(name) {
  const r = await fetch(`${URL}/rest/v1/${name}?limit=1`, { headers: HDR });
  return r.ok;
}

// Test insert into survey_responses to confirm connection and RLS
async function testInsert() {
  const payload = {
    institution:         'University of Nigeria, Enugu Campus (UNEC)',
    living_situation:    'Off-campus alone',
    hardest_item:        'Mattress / bed frame',
    first_search:        'WhatsApp groups',
    found_item:          'Yes — but it took a long time',
    biggest_challenge:   'Trust — I worry about being scammed',
    trust_vs_price:      'Trust more than price',
    cancelled_purchase:  'Yes',
    platform_preference: 'A mobile app — fast, dedicated, always on my phone',
    whatsapp_daily:      'All day — it never leaves my hand',
    one_improvement:     '[TEST SUBMISSION] This is an automated test. Please delete this row.',
    whatsapp_number:     '+234-TEST-0000',
    duration_seconds:    42,
    submitted_at:        new Date().toISOString(),
  };

  const r = await fetch(`${URL}/rest/v1/survey_responses`, {
    method:  'POST',
    headers: { ...HDR, 'Prefer': 'return=representation' },
    body:    JSON.stringify(payload),
  });

  const text = await r.text();
  if (r.ok) {
    const data = JSON.parse(text);
    console.log('✅ TEST INSERT SUCCESS — row id:', data[0]?.id ?? data?.id);
    return data[0]?.id ?? data?.id;
  } else {
    console.error('❌ INSERT FAILED:', r.status, text);
    return null;
  }
}

async function countRows() {
  const r = await fetch(`${URL}/rest/v1/survey_responses?select=count`, {
    headers: { ...HDR, 'Prefer': 'count=exact' },
  });
  const count = r.headers.get('content-range');
  console.log(`📊 Total rows in survey_responses: ${count ?? 'unknown'}`);
}

console.log('── Checking tables ──────────────────────────');
const srOk = await checkTable('survey_responses');
const aiOk = await checkTable('ai_insights');
const arOk = await checkTable('analysis_runs');
console.log(`survey_responses : ${srOk ? '✅' : '❌'}`);
console.log(`ai_insights      : ${aiOk ? '✅' : '❌'}`);
console.log(`analysis_runs    : ${arOk ? '✅' : '❌'}`);

if (!srOk) {
  console.error('\n❌ survey_responses table missing. Please run migration 001 in Supabase SQL Editor.');
  process.exit(1);
}

console.log('\n── Running test submission ───────────────────');
const id = await testInsert();

if (id) {
  await countRows();

  // Clean up the test row
  const del = await fetch(`${URL}/rest/v1/survey_responses?id=eq.${id}`, {
    method:  'DELETE',
    headers: HDR,
  });
  console.log(`🧹 Test row deleted: ${del.ok ? 'yes' : 'no (status ' + del.status + ')'}`);
}

if (!aiOk || !arOk) {
  console.log('\n⚠️  ai_insights and analysis_runs tables are missing.');
  console.log('    Run migration 002 in Supabase SQL Editor:');
  console.log('    supabase/migrations/002_create_ai_insights.sql');
}
