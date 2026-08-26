import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to Supabase Project:', url);
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  const tables = [
    'profiles',
    'shops',
    'categories',
    'products',
    'conversations',
    'messages',
    'reports',
    'analytics_events',
    'cart_items',
    'orders',
    'order_items',
    'customers',
    'notifications',
    'deals',
    'seller_payout_accounts'
  ];

  console.log('\n--- VERIFYING TABLE AVAILABILITY ---');
  for (const table of tables) {
    const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table [${table}]: ❌ ${error.message}`);
    } else {
      console.log(`Table [${table}]: 🟢 OK (${count ?? 0} rows)`);
    }
  }
}

main().catch(console.error);
