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

console.log('Target Supabase Project:', url);
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function verifyDeep() {
  console.log('\n--- READ-ONLY COMMERCE INFRASTRUCTURE DEEP VERIFICATION ---');

  const tests = [
    { name: 'cart_items schema & foreign key join test', query: supabase.from('cart_items').select('id, user_id, product_id, quantity, products(id, name, price, shop_id)').limit(1) },
    { name: 'orders schema & relations test', query: supabase.from('orders').select('id, order_number, buyer_id, shop_id, total_amount, order_status, shops(id, name), profiles:buyer_id(id, full_name)').limit(1) },
    { name: 'order_items schema & relations test', query: supabase.from('order_items').select('id, order_id, product_id, quantity, unit_price, subtotal, products(id, name), orders(id, order_number)').limit(1) },
    { name: 'customers schema & relations test', query: supabase.from('customers').select('id, shop_id, user_id, total_orders, total_spent, shops(id, name), profiles(id, full_name)').limit(1) },
    { name: 'notifications schema test', query: supabase.from('notifications').select('id, user_id, type, title, body, is_read, metadata').limit(1) },
    { name: 'deals schema test', query: supabase.from('deals').select('id, product_id, shop_id, discount_percent, deal_price, is_active, products(id, name)').limit(1) },
    { name: 'seller_payout_accounts schema test', query: supabase.from('seller_payout_accounts').select('id, shop_id, bank_name, account_number, account_name, is_verified, shops(id, name)').limit(1) },
  ];

  let passed = 0;
  for (const t of tests) {
    const { data, error } = await t.query;
    if (error) {
      console.log(`❌ [${t.name}]: ${error.message}`);
    } else {
      console.log(`🟢 [${t.name}]: SUCCESS (Relation joins verified, columns aligned)`);
      passed++;
    }
  }

  console.log(`\nVerification complete: ${passed}/${tests.length} checks passed perfectly.`);
}

verifyDeep().catch(console.error);
