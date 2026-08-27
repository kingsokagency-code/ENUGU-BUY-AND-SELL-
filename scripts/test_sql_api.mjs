import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const clean = line.trim();
  if (!clean || clean.startsWith('#')) return;
  const idx = clean.indexOf('=');
  if (idx !== -1) {
    const k = clean.substring(0, idx).trim();
    let v = clean.substring(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    env[k] = v;
  }
});

const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = 'fxailwyiitpfhlwulsiv';

async function testEndpoints() {
  const sql = fs.readFileSync('supabase/migrations/003_phase3_commerce_infrastructure.sql', 'utf8');

  // Test 1: Management API with access token
  console.log('Testing Management API...');
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log('Test 1 status:', res.status);
    const body = await res.text();
    console.log('Test 1 body:', body.slice(0, 300));
  } catch (err) {
    console.error('Test 1 error:', err.message);
  }

  // Test 2: PostgREST rpc / exec_sql if available
  console.log('\nTesting PostgREST rpc...');
  try {
    const res = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log('Test 2 status:', res.status);
    const body = await res.text();
    console.log('Test 2 body:', body.slice(0, 300));
  } catch (err) {
    console.error('Test 2 error:', err.message);
  }
}

testEndpoints();
