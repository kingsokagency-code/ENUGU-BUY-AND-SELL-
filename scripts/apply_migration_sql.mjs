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

const sqlContent = fs.readFileSync('supabase/migrations/003_phase3_commerce_infrastructure.sql', 'utf8');
const projectRef = 'fxailwyiitpfhlwulsiv';
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Applying Migration to project:', projectRef);

async function executeSql() {
  // Method 1: Supabase /pg/query endpoint with service key
  try {
    const res = await fetch(`https://${projectRef}.supabase.co/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sqlContent }),
    });

    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

executeSql();
