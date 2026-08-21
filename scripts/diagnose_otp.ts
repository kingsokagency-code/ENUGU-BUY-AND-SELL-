import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually without external deps
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOtpDelivery() {
  const testPhone = '+2348012345678';
  console.log('=== CONTROLLED SUPABASE AUTH OTP DIAGNOSTIC ===');
  console.log('Target Phone:', testPhone);
  console.log('Supabase URL:', supabaseUrl.replace(/https:\/\/(.*)\.supabase\.co/, 'https://[PROJECT_REF].supabase.co'));
  console.log('Anon Key Present:', !!supabaseAnonKey);
  console.log('Service Role Key Present:', !!serviceRoleKey);

  console.log('\n--- 1. Testing signInWithOtp with Anon Client ---');
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: testPhone,
    });

    if (error) {
      console.log('❌ Supabase Auth signInWithOtp Error:');
      console.log('  Name:', error.name);
      console.log('  Message:', error.message);
      console.log('  Status:', (error as any).status);
      console.log('  Code:', (error as any).code);
    } else {
      console.log('✅ Supabase Accepted OTP Request:', data);
    }
  } catch (err: unknown) {
    console.log('❌ Exception during signInWithOtp:', err instanceof Error ? err.message : err);
  }
}

testOtpDelivery();
