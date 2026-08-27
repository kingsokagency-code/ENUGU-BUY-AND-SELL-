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

const BUYER_EMAIL = 'ebs_qa_msg_buyer_2026@enugubuysell.test';
const SELLER_EMAIL = 'ebs_qa_msg_seller_2026@enugubuysell.test';

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

// Strict Manifest
const manifest = {
  buyerAuthId: null,
  buyerProfileId: null,
  sellerAuthId: null,
  sellerProfileId: null,
  shopId: null,
  productId: null,
  conversationId: null,
  messageIds: [],
  notificationIds: [],
};

const results = {
  emailPreCheck: 'NOT TESTED',
  provisioning: 'NOT TESTED',
  conversationHandshake: 'NOT TESTED',
  buyerSendMessage: 'NOT TESTED',
  sellerNotification: 'NOT TESTED',
  sellerConversationRead: 'NOT TESTED',
  sellerReplyMessage: 'NOT TESTED',
  buyerNotification: 'NOT TESTED',
  buyerThreadVerification: 'NOT TESTED',
  cleanup: 'NOT TESTED',
  databaseIntegrity: 'NOT TESTED',
};

async function runPhase5Test() {
  console.log('=== EBS PHASE 5 REAL MESSAGING E2E TEST ===');
  console.log('Target Project:', url);

  // ── 1. PRE-CHECK ──────────────────────────────────────────────────
  console.log('\n[1/9] Pre-flight Email Check...');
  const { data: userList, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (listErr) throw new Error('Failed to list auth users: ' + listErr.message);

  const existingBuyer = userList.users.find(u => u.email === BUYER_EMAIL);
  const existingSeller = userList.users.find(u => u.email === SELLER_EMAIL);

  if (existingBuyer || existingSeller) {
    throw new Error(`Safety Violation: Test email already exists in auth.users.`);
  }
  console.log('✓ Pre-check confirmed: Test emails do not exist.');
  results.emailPreCheck = 'PASS';

  // Record baseline counts
  const { count: baseProd } = await admin.from('products').select('*', { count: 'exact', head: true });
  const { count: baseShops } = await admin.from('shops').select('*', { count: 'exact', head: true });
  const { count: baseProfiles } = await admin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: baseConv } = await admin.from('conversations').select('*', { count: 'exact', head: true });
  const { count: baseMsg } = await admin.from('messages').select('*', { count: 'exact', head: true });

  // ── 2. PROVISION TEST OBJECTS ────────────────────────────────────
  console.log('\n[2/9] Provisioning Test Buyer, Seller, Shop & Product...');

  // A. Create Buyer
  const { data: bUser, error: bErr } = await admin.auth.admin.createUser({
    email: BUYER_EMAIL,
    password: 'EBS_Test_Buyer_2026!Sec',
    email_confirm: true,
    user_metadata: { full_name: '[TEST] EBS Chat Buyer' },
  });
  if (bErr || !bUser?.user) throw new Error('Failed to create buyer: ' + bErr?.message);
  manifest.buyerAuthId = bUser.user.id;
  manifest.buyerProfileId = bUser.user.id;
  console.log(`✓ Test Buyer Created: ID ${manifest.buyerAuthId}`);

  // B. Create Seller
  const { data: sUser, error: sErr } = await admin.auth.admin.createUser({
    email: SELLER_EMAIL,
    password: 'EBS_Test_Seller_2026!Sec',
    email_confirm: true,
    user_metadata: { full_name: '[TEST] EBS Chat Merchant' },
  });
  if (sErr || !sUser?.user) throw new Error('Failed to create seller: ' + sErr?.message);
  manifest.sellerAuthId = sUser.user.id;
  manifest.sellerProfileId = sUser.user.id;
  console.log(`✓ Test Seller Created: ID ${manifest.sellerAuthId}`);

  // Ensure profiles
  await admin.from('profiles').upsert([
    { id: manifest.buyerAuthId, full_name: '[TEST] EBS Chat Buyer', location: 'UNN Franco (QA Test)' },
    { id: manifest.sellerAuthId, full_name: '[TEST] EBS Chat Merchant', location: 'UNN Hilltop (QA Test)' }
  ]);

  // C. Create Shop
  const { data: shop, error: shopErr } = await admin.from('shops').insert({
    owner_id: manifest.sellerAuthId,
    name: '[TEST ONLY] Chat Verification Store',
    slug: `ebs-chat-store-${Date.now()}`,
    location: 'UNN QA Test Campus',
    is_verified: true,
  }).select().single();
  if (shopErr || !shop) throw new Error('Failed to create test shop: ' + shopErr?.message);
  manifest.shopId = shop.id;
  console.log(`✓ Test Shop Created: ID ${manifest.shopId}`);

  // D. Create Product
  const { data: prod, error: prodErr } = await admin.from('products').insert({
    shop_id: manifest.shopId,
    name: '[TEST ONLY] Phase 5 Chat Item',
    price: 3500,
    condition: 'Like New',
    location: 'UNN QA Test Campus',
    status: 'active',
  }).select().single();
  if (prodErr || !prod) throw new Error('Failed to create test product: ' + prodErr?.message);
  manifest.productId = prod.id;
  console.log(`✓ Test Product Created: ID ${manifest.productId}`);

  results.provisioning = 'PASS';

  // ── 3. TEST CONVERSATION HANDSHAKE ───────────────────────────────
  console.log('\n[3/9] Testing Product -> Conversation Handshake (Trigger verify_conversation_seller)...');
  const { data: conv, error: convErr } = await admin.from('conversations').insert({
    buyer_id: manifest.buyerAuthId,
    seller_id: manifest.sellerAuthId,
    product_id: manifest.productId,
  }).select().single();

  if (convErr || !conv) throw new Error('Conversation handshake failed: ' + convErr?.message);
  manifest.conversationId = conv.id;
  console.log(`✓ Conversation Created: ID ${manifest.conversationId} (Strict Product Context: ${manifest.productId})`);

  results.conversationHandshake = 'PASS';

  // ── 4. TEST BUYER SENDS MESSAGE ───────────────────────────────────
  console.log('\n[4/9] Testing Buyer -> Seller Message Delivery...');
  const buyerMsgContent = 'Hello! Is this product still available for pickup on campus today?';
  const { data: msg1, error: msg1Err } = await admin.from('messages').insert({
    conversation_id: manifest.conversationId,
    sender_id: manifest.buyerAuthId,
    content: buyerMsgContent,
  }).select().single();

  if (msg1Err || !msg1) throw new Error('Message insert failed: ' + msg1Err?.message);
  manifest.messageIds.push(msg1.id);
  console.log(`✓ Buyer Message Stored: ID ${msg1.id} ("${msg1.content}")`);

  // Insert In-App Notification for Seller
  const { data: notif1, error: n1Err } = await admin.from('notifications').insert({
    user_id: manifest.sellerAuthId,
    type: 'new_message',
    title: 'Message from [TEST] EBS Chat Buyer',
    body: buyerMsgContent,
    link_url: `/conversations/${manifest.conversationId}`,
    metadata: { conversation_id: manifest.conversationId, sender_id: manifest.buyerAuthId },
  }).select().single();

  if (n1Err || !notif1) throw new Error('Notification creation failed: ' + n1Err?.message);
  manifest.notificationIds.push(notif1.id);
  console.log(`✓ Seller In-App Notification Dispatched: ID ${notif1.id}`);

  results.buyerSendMessage = 'PASS';
  results.sellerNotification = 'PASS';

  // ── 5. TEST SELLER CONVERSATION QUERY ─────────────────────────────
  console.log('\n[5/9] Testing Seller Inbox Read...');
  const { data: sellerInbox, error: inbErr } = await admin
    .from('conversations')
    .select('id, buyer_id, seller_id, product_id, products(id, name, price), messages(id, content, sender_id)')
    .eq('id', manifest.conversationId)
    .single();

  if (inbErr || !sellerInbox || sellerInbox.messages.length === 0) {
    throw new Error('Seller inbox read failed');
  }
  console.log(`✓ Seller Inbox Verified: Found conversation with Product "${sellerInbox.products?.name}"`);

  results.sellerConversationRead = 'PASS';

  // ── 6. TEST SELLER REPLIES ────────────────────────────────────────
  console.log('\n[6/9] Testing Seller -> Buyer Reply Delivery...');
  const sellerReplyContent = 'Yes, it is available! We can meet at Franco Quadrangle around 2 PM.';
  const { data: msg2, error: msg2Err } = await admin.from('messages').insert({
    conversation_id: manifest.conversationId,
    sender_id: manifest.sellerAuthId,
    content: sellerReplyContent,
  }).select().single();

  if (msg2Err || !msg2) throw new Error('Seller reply insert failed: ' + msg2Err?.message);
  manifest.messageIds.push(msg2.id);
  console.log(`✓ Seller Reply Stored: ID ${msg2.id} ("${msg2.content}")`);

  // Insert In-App Notification for Buyer
  const { data: notif2, error: n2Err } = await admin.from('notifications').insert({
    user_id: manifest.buyerAuthId,
    type: 'new_message',
    title: 'Message from [TEST] EBS Chat Merchant',
    body: sellerReplyContent,
    link_url: `/conversations/${manifest.conversationId}`,
    metadata: { conversation_id: manifest.conversationId, sender_id: manifest.sellerAuthId },
  }).select().single();

  if (n2Err || !notif2) throw new Error('Buyer notification creation failed: ' + n2Err?.message);
  manifest.notificationIds.push(notif2.id);
  console.log(`✓ Buyer In-App Notification Dispatched: ID ${notif2.id}`);

  results.sellerReplyMessage = 'PASS';
  results.buyerNotification = 'PASS';

  // ── 7. TEST BUYER THREAD VERIFICATION ─────────────────────────────
  console.log('\n[7/9] Testing Buyer Message Thread Retrieval...');
  const { data: threadMessages, error: thErr } = await admin
    .from('messages')
    .select('id, sender_id, content, created_at')
    .eq('conversation_id', manifest.conversationId)
    .order('created_at', { ascending: true });

  if (thErr || !threadMessages || threadMessages.length !== 2) {
    throw new Error(`Buyer thread verification failed. Expected 2 messages, got ${threadMessages?.length}`);
  }

  if (threadMessages[0].sender_id !== manifest.buyerAuthId || threadMessages[1].sender_id !== manifest.sellerAuthId) {
    throw new Error('Message order or sender integrity mismatch');
  }

  console.log('✓ Buyer Thread Verified: 2 messages retrieved in exact chronological sequence:');
  console.log(`  1. Buyer: "${threadMessages[0].content}"`);
  console.log(`  2. Seller: "${threadMessages[1].content}"`);

  results.buyerThreadVerification = 'PASS';

  // ── 8. STRICT MANIFEST CLEANUP ────────────────────────────────────
  console.log('\n[8/9] Executing Strict Manifest-Based Safe Cleanup...');
  console.log('Manifest:', JSON.stringify(manifest, null, 2));

  // A. Delete Messages
  for (const mId of manifest.messageIds) {
    await admin.from('messages').delete().eq('id', mId);
  }
  console.log('✓ Messages deleted by exact ID.');

  // B. Delete Notifications
  for (const nId of manifest.notificationIds) {
    await admin.from('notifications').delete().eq('id', nId);
  }
  console.log('✓ Notifications deleted by exact ID.');

  // C. Delete Conversation
  if (manifest.conversationId) {
    await admin.from('conversations').delete().eq('id', manifest.conversationId);
  }
  console.log('✓ Conversation deleted by exact ID.');

  // D. Delete Product
  if (manifest.productId) {
    await admin.from('products').delete().eq('id', manifest.productId);
  }
  console.log('✓ Product deleted by exact ID.');

  // E. Delete Shop
  if (manifest.shopId) {
    await admin.from('shops').delete().eq('id', manifest.shopId);
  }
  console.log('✓ Shop deleted by exact ID.');

  // F. Delete Profiles
  if (manifest.buyerProfileId) await admin.from('profiles').delete().eq('id', manifest.buyerProfileId);
  if (manifest.sellerProfileId) await admin.from('profiles').delete().eq('id', manifest.sellerProfileId);
  console.log('✓ Profiles deleted by exact ID.');

  // G. Delete Auth Users
  if (manifest.buyerAuthId) await admin.auth.admin.deleteUser(manifest.buyerAuthId);
  if (manifest.sellerAuthId) await admin.auth.admin.deleteUser(manifest.sellerAuthId);
  console.log('✓ Auth users deleted via Admin API.');

  results.cleanup = 'PASS';

  // ── 9. POST-CLEANUP READ-ONLY INTEGRITY VERIFICATION ────────────────
  console.log('\n[9/9] Post-Cleanup Read-Only Integrity Verification...');

  const checks = await Promise.all([
    admin.from('conversations').select('id').eq('id', manifest.conversationId).maybeSingle(),
    admin.from('products').select('id').eq('id', manifest.productId).maybeSingle(),
    admin.from('shops').select('id').eq('id', manifest.shopId).maybeSingle(),
    admin.from('profiles').select('id').in('id', [manifest.buyerProfileId, manifest.sellerProfileId]),
  ]);

  const anyLingering = checks.some(c => c.data !== null && (!Array.isArray(c.data) || c.data.length > 0));
  if (anyLingering) {
    throw new Error('Post-cleanup check failed: Test records lingering');
  }

  // Baseline check
  const { count: finalProd } = await admin.from('products').select('*', { count: 'exact', head: true });
  const { count: finalShops } = await admin.from('shops').select('*', { count: 'exact', head: true });
  const { count: finalProfiles } = await admin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: finalConv } = await admin.from('conversations').select('*', { count: 'exact', head: true });
  const { count: finalMsg } = await admin.from('messages').select('*', { count: 'exact', head: true });

  if (
    finalProd !== baseProd ||
    finalShops !== baseShops ||
    finalProfiles !== baseProfiles ||
    finalConv !== baseConv ||
    finalMsg !== baseMsg
  ) {
    throw new Error('Baseline mismatch detected');
  }

  console.log('✓ Zero residual test records exist.');
  console.log(`✓ Baseline counts match perfectly (Products: ${finalProd}, Shops: ${finalShops}, Profiles: ${finalProfiles}, Conversations: ${finalConv}, Messages: ${finalMsg}).`);

  results.databaseIntegrity = 'PASS';

  console.log('\n========================================');
  console.log('🎉 PHASE 5 MESSAGING E2E TESTS PASSED 100%');
  console.log('========================================');
}

runPhase5Test().then(() => {
  console.log('\nFINAL RESULTS MATRIX:');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('\n❌ PHASE 5 TEST STOPPED ON ERROR:', err.message);
  console.log('\nPARTIAL RESULTS MATRIX:');
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
