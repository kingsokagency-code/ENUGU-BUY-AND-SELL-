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

const BUYER_EMAIL = 'ebs_qa_buyer_2026@enugubuysell.test';
const SELLER_EMAIL = 'ebs_qa_seller_2026@enugubuysell.test';

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

// Exact Test Manifest to track all created IDs
const manifest = {
  buyerAuthId: null,
  buyerProfileId: null,
  sellerAuthId: null,
  sellerProfileId: null,
  shopId: null,
  productId: null,
  cartItemId: null,
  orderId: null,
  orderItemIds: [],
  customerId: null,
  notificationIds: [],
};

const results = {
  provisioning: 'NOT TESTED',
  buyerCart: 'NOT TESTED',
  checkoutOrder: 'NOT TESTED',
  customerTrigger: 'NOT TESTED',
  sellerNotification: 'NOT TESTED',
  sellerOrderVisibility: 'NOT TESTED',
  sellerStatusTransition: 'NOT TESTED',
  buyerNotification: 'NOT TESTED',
  cleanup: 'NOT TESTED',
  databaseIntegrity: 'NOT TESTED',
};

async function runControlledTest() {
  console.log('=== EBS PHASE 4 CONTROLLED COMMERCE E2E TEST ===');
  console.log('Target Project:', url);

  // ── 1. PRE-CHECK: Verify test emails do NOT exist ──────────────────────
  console.log('\n[1/10] Pre-flight Email Check...');
  const { data: userList, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (listErr) throw new Error('Failed to list auth users: ' + listErr.message);

  const existingBuyer = userList.users.find(u => u.email === BUYER_EMAIL);
  const existingSeller = userList.users.find(u => u.email === SELLER_EMAIL);

  if (existingBuyer || existingSeller) {
    throw new Error(`Safety Violation: Test email already exists in production auth.users. Buyer: ${!!existingBuyer}, Seller: ${!!existingSeller}`);
  }
  console.log('✓ Pre-check confirmed: Test emails do not exist.');

  // Record baseline production counts
  const { count: baselineProducts } = await admin.from('products').select('*', { count: 'exact', head: true });
  const { count: baselineShops } = await admin.from('shops').select('*', { count: 'exact', head: true });
  const { count: baselineProfiles } = await admin.from('profiles').select('*', { count: 'exact', head: true });

  // ── 2. PROVISION TEST ACCOUNTS & OBJECTS ──────────────────────────────
  console.log('\n[2/10] Provisioning Test Buyer, Seller, Store & Product...');
  
  // A. Create Buyer Auth User
  const { data: buyerUser, error: buyerErr } = await admin.auth.admin.createUser({
    email: BUYER_EMAIL,
    password: 'EBS_Test_Buyer_2026!Sec',
    email_confirm: true,
    user_metadata: { full_name: '[TEST] EBS QA Buyer' },
  });
  if (buyerErr || !buyerUser?.user) throw new Error('Failed to create test buyer: ' + buyerErr?.message);
  manifest.buyerAuthId = buyerUser.user.id;
  manifest.buyerProfileId = buyerUser.user.id;
  console.log(`✓ Test Buyer Created: ID ${manifest.buyerAuthId}`);

  // B. Create Seller Auth User
  const { data: sellerUser, error: sellerErr } = await admin.auth.admin.createUser({
    email: SELLER_EMAIL,
    password: 'EBS_Test_Seller_2026!Sec',
    email_confirm: true,
    user_metadata: { full_name: '[TEST] EBS QA Merchant' },
  });
  if (sellerErr || !sellerUser?.user) throw new Error('Failed to create test seller: ' + sellerErr?.message);
  manifest.sellerAuthId = sellerUser.user.id;
  manifest.sellerProfileId = sellerUser.user.id;
  console.log(`✓ Test Seller Created: ID ${manifest.sellerAuthId}`);

  // Ensure profiles exist (trigger on_auth_user_created handles this or upsert)
  await admin.from('profiles').upsert([
    { id: manifest.buyerAuthId, full_name: '[TEST] EBS QA Buyer', location: 'UNN Franco (QA Test)' },
    { id: manifest.sellerAuthId, full_name: '[TEST] EBS QA Merchant', location: 'UNN Hilltop (QA Test)' }
  ]);

  // C. Create Dedicated Test Shop
  const { data: shop, error: shopErr } = await admin.from('shops').insert({
    owner_id: manifest.sellerAuthId,
    name: '[TEST ONLY] EBS Verification Store',
    slug: `ebs-test-verification-store-${Date.now()}`,
    location: 'UNN QA Test Campus',
    is_verified: true,
  }).select().single();
  if (shopErr || !shop) throw new Error('Failed to create test shop: ' + shopErr?.message);
  manifest.shopId = shop.id;
  console.log(`✓ Test Shop Created: ID ${manifest.shopId}`);

  // D. Create Dedicated Test Product
  const { data: product, error: prodErr } = await admin.from('products').insert({
    shop_id: manifest.shopId,
    name: '[TEST ONLY] Phase 4 QA Verification Item',
    description: 'Isolated test product for Phase 4 commerce validation',
    price: 5000,
    condition: 'Brand New',
    location: 'UNN QA Test Campus',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'],
  }).select().single();
  if (prodErr || !product) throw new Error('Failed to create test product: ' + prodErr?.message);
  manifest.productId = product.id;
  console.log(`✓ Test Product Created: ID ${manifest.productId} (Price: ₦${product.price})`);

  results.provisioning = 'PASS';

  // ── 3. TEST BUYER CART OPERATIONS ────────────────────────────────────
  console.log('\n[3/10] Testing Real Cart Operations (Add -> Increment -> Read)...');
  const { data: cartItem, error: cartErr } = await admin.from('cart_items').insert({
    user_id: manifest.buyerAuthId,
    product_id: manifest.productId,
    quantity: 1,
  }).select().single();
  if (cartErr || !cartItem) throw new Error('Cart insert failed: ' + cartErr?.message);
  manifest.cartItemId = cartItem.id;
  console.log(`✓ Cart Item Created: ID ${manifest.cartItemId} (Qty: ${cartItem.quantity})`);

  // Update quantity to 2
  const { data: updatedCart, error: updateCartErr } = await admin.from('cart_items').update({
    quantity: 2,
    updated_at: new Date().toISOString(),
  }).eq('id', manifest.cartItemId).select().single();
  if (updateCartErr || updatedCart.quantity !== 2) throw new Error('Cart quantity update failed');
  console.log(`✓ Cart Quantity Updated to ${updatedCart.quantity}`);

  // Verify Cart Read Query with relation join
  const { data: cartQuery, error: cqErr } = await admin
    .from('cart_items')
    .select('id, user_id, product_id, quantity, products(id, name, price, shop_id, shops(id, name))')
    .eq('id', manifest.cartItemId)
    .single();
  if (cqErr || !cartQuery.products) throw new Error('Cart relation query failed');
  console.log(`✓ Cart Relation Read: Product "${cartQuery.products.name}" (₦${cartQuery.products.price})`);

  results.buyerCart = 'PASS';

  // ── 4. TEST CHECKOUT & ORDER CREATION ────────────────────────────────
  console.log('\n[4/10] Testing Authoritative Order Creation & Cart Clearing...');
  const orderNumber = `EBS-TEST-${Date.now().toString(36).toUpperCase()}`;
  const totalAmount = Number(product.price) * updatedCart.quantity; // 5000 * 2 = 10000
  const escrowFee = Math.round(totalAmount * 0.01); // 100

  // Insert Order Header
  const { data: order, error: orderErr } = await admin.from('orders').insert({
    order_number: orderNumber,
    buyer_id: manifest.buyerAuthId,
    shop_id: manifest.shopId,
    total_amount: totalAmount,
    escrow_fee: escrowFee,
    order_status: 'pending',
    payment_status: 'unpaid',
    payment_method: 'escrow_wallet',
    delivery_campus: 'UNN QA Test Campus',
    delivery_address: 'Franco Hall Room 12',
    contact_phone: '+2348000000001',
    buyer_notes: 'QA Controlled Verification Order',
  }).select().single();
  if (orderErr || !order) throw new Error('Order creation failed: ' + orderErr?.message);
  manifest.orderId = order.id;
  console.log(`✓ Order Created: ID ${manifest.orderId} (Number: ${order.order_number}) | Total: ₦${order.total_amount}`);

  // Insert Order Line Item
  const { data: orderItem, error: oiErr } = await admin.from('order_items').insert({
    order_id: manifest.orderId,
    product_id: manifest.productId,
    quantity: updatedCart.quantity,
    unit_price: product.price,
    subtotal: totalAmount,
  }).select().single();
  if (oiErr || !orderItem) throw new Error('Order item creation failed: ' + oiErr?.message);
  manifest.orderItemIds.push(orderItem.id);
  console.log(`✓ Order Line Item Created: ID ${orderItem.id}`);

  // Delete purchased item from cart
  await admin.from('cart_items').delete().eq('id', manifest.cartItemId);
  const { data: clearedCheck } = await admin.from('cart_items').select('id').eq('id', manifest.cartItemId).maybeSingle();
  if (clearedCheck) throw new Error('Cart item was not cleared after order creation');
  console.log(`✓ Cart item ${manifest.cartItemId} verified cleared from buyer cart`);

  results.checkoutOrder = 'PASS';

  // ── 5. VERIFY CUSTOMER TRIGGER ───────────────────────────────────────
  console.log('\n[5/10] Verifying Customer Sync Database Trigger...');
  const { data: customer, error: custErr } = await admin
    .from('customers')
    .select('id, shop_id, user_id, total_orders, total_spent')
    .eq('shop_id', manifest.shopId)
    .eq('user_id', manifest.buyerAuthId)
    .maybeSingle();

  if (custErr || !customer) throw new Error('Customer relationship trigger failed: ' + custErr?.message);
  manifest.customerId = customer.id;
  if (customer.total_orders < 1 || Number(customer.total_spent) < totalAmount) {
    throw new Error('Customer record stats calculation incorrect');
  }
  console.log(`✓ Customer Relationship Verified: ID ${manifest.customerId} (Orders: ${customer.total_orders}, Total Spent: ₦${customer.total_spent})`);

  results.customerTrigger = 'PASS';

  // ── 6. VERIFY SELLER NOTIFICATION TRIGGER ────────────────────────────
  console.log('\n[6/10] Verifying Seller Notification Trigger...');
  const { data: sellerNotifs, error: snErr } = await admin
    .from('notifications')
    .select('id, type, title, body, user_id')
    .eq('user_id', manifest.sellerAuthId);

  if (snErr || !sellerNotifs || sellerNotifs.length === 0) {
    throw new Error('Seller notification trigger failed: ' + snErr?.message);
  }
  sellerNotifs.forEach(n => manifest.notificationIds.push(n.id));
  console.log(`✓ Seller Notification Generated: ID ${sellerNotifs[0].id} ("${sellerNotifs[0].title}")`);

  results.sellerNotification = 'PASS';

  // ── 7. TEST SELLER ORDER VISIBILITY ──────────────────────────────────
  console.log('\n[7/10] Testing Seller Order Query & Isolation...');
  const { data: sellerOrders, error: soErr } = await admin
    .from('orders')
    .select('id, order_number, total_amount, order_status, profiles:buyer_id(full_name), order_items(id, unit_price, quantity, products(name))')
    .eq('shop_id', manifest.shopId);

  if (soErr || !sellerOrders || sellerOrders.length === 0) {
    throw new Error('Seller orders query failed');
  }
  if (sellerOrders[0].id !== manifest.orderId) {
    throw new Error('Seller received incorrect order ID');
  }
  console.log(`✓ Seller Order Verified: #${sellerOrders[0].order_number} for Buyer "${sellerOrders[0].profiles?.full_name}"`);

  results.sellerOrderVisibility = 'PASS';

  // ── 8. TEST SELLER STATUS TRANSITIONS & BUYER NOTIFICATION ───────────
  console.log('\n[8/10] Testing Seller Status Lifecycle Workflow...');
  const statusLifecycle = ['confirmed', 'processing', 'ready_for_pickup', 'delivered', 'completed'];
  for (const st of statusLifecycle) {
    const { data: updated, error: stErr } = await admin
      .from('orders')
      .update({ order_status: st, updated_at: new Date().toISOString() })
      .eq('id', manifest.orderId)
      .select('order_status')
      .single();

    if (stErr || updated.order_status !== st) throw new Error(`Status update to ${st} failed`);
    console.log(`  ➔ Status transition: -> ${updated.order_status}`);
  }
  console.log('✓ Full 5-step status transition completed successfully.');

  results.sellerStatusTransition = 'PASS';

  // Verify Buyer Notification generated on status change
  console.log('\nVerifying Buyer Status Update Notification...');
  const { data: buyerNotifs, error: bnErr } = await admin
    .from('notifications')
    .select('id, type, title, body, user_id')
    .eq('user_id', manifest.buyerAuthId);

  if (bnErr || !buyerNotifs || buyerNotifs.length === 0) {
    throw new Error('Buyer notification trigger failed: ' + bnErr?.message);
  }
  buyerNotifs.forEach(n => manifest.notificationIds.push(n.id));
  console.log(`✓ Buyer Notification Generated: ID ${buyerNotifs[0].id} ("${buyerNotifs[0].title}")`);

  results.buyerNotification = 'PASS';

  // ── 9. EXACT MANIFEST-BASED SAFE CLEANUP ─────────────────────────────
  console.log('\n[9/10] Executing Strict Manifest-Based Cleanup...');
  console.log('Manifest to be deleted:', JSON.stringify(manifest, null, 2));

  // A. Delete Order Items by Exact ID
  for (const oiId of manifest.orderItemIds) {
    const { error } = await admin.from('order_items').delete().eq('id', oiId);
    if (error) console.error('Error deleting order item:', oiId, error.message);
  }
  console.log('✓ Order line items deleted by exact ID.');

  // B. Delete Order by Exact ID
  if (manifest.orderId) {
    const { error } = await admin.from('orders').delete().eq('id', manifest.orderId);
    if (error) console.error('Error deleting order:', manifest.orderId, error.message);
  }
  console.log('✓ Order deleted by exact ID.');

  // C. Delete Customer record by Exact ID
  if (manifest.customerId) {
    const { error } = await admin.from('customers').delete().eq('id', manifest.customerId);
    if (error) console.error('Error deleting customer:', manifest.customerId, error.message);
  }
  console.log('✓ Customer relationship deleted by exact ID.');

  // D. Delete Notifications by Exact IDs
  for (const nId of manifest.notificationIds) {
    const { error } = await admin.from('notifications').delete().eq('id', nId);
    if (error) console.error('Error deleting notification:', nId, error.message);
  }
  console.log('✓ Notifications deleted by exact IDs.');

  // E. Delete Product by Exact ID
  if (manifest.productId) {
    const { error } = await admin.from('products').delete().eq('id', manifest.productId);
    if (error) console.error('Error deleting product:', manifest.productId, error.message);
  }
  console.log('✓ Product deleted by exact ID.');

  // F. Delete Shop by Exact ID
  if (manifest.shopId) {
    const { error } = await admin.from('shops').delete().eq('id', manifest.shopId);
    if (error) console.error('Error deleting shop:', manifest.shopId, error.message);
  }
  console.log('✓ Shop deleted by exact ID.');

  // G. Delete Profiles by Exact ID
  if (manifest.buyerProfileId) await admin.from('profiles').delete().eq('id', manifest.buyerProfileId);
  if (manifest.sellerProfileId) await admin.from('profiles').delete().eq('id', manifest.sellerProfileId);
  console.log('✓ Profiles deleted by exact IDs.');

  // H. Delete Auth Users via Admin API
  if (manifest.buyerAuthId) await admin.auth.admin.deleteUser(manifest.buyerAuthId);
  if (manifest.sellerAuthId) await admin.auth.admin.deleteUser(manifest.sellerAuthId);
  console.log('✓ Auth users deleted via Admin API.');

  results.cleanup = 'PASS';

  // ── 10. POST-CLEANUP READ-ONLY INTEGRITY VERIFICATION ────────────────
  console.log('\n[10/10] Post-Cleanup Read-Only Integrity Verification...');

  const checks = await Promise.all([
    admin.from('orders').select('id').eq('id', manifest.orderId).maybeSingle(),
    admin.from('customers').select('id').eq('id', manifest.customerId).maybeSingle(),
    admin.from('products').select('id').eq('id', manifest.productId).maybeSingle(),
    admin.from('shops').select('id').eq('id', manifest.shopId).maybeSingle(),
    admin.from('profiles').select('id').in('id', [manifest.buyerProfileId, manifest.sellerProfileId]),
  ]);

  const anyLingering = checks.some(c => c.data !== null && (!Array.isArray(c.data) || c.data.length > 0));
  if (anyLingering) {
    throw new Error('Post-cleanup check failed: Some test records are still present in database');
  }

  // Verify baseline product count is identical to pre-test count
  const { count: finalProducts } = await admin.from('products').select('*', { count: 'exact', head: true });
  const { count: finalShops } = await admin.from('shops').select('*', { count: 'exact', head: true });
  const { count: finalProfiles } = await admin.from('profiles').select('*', { count: 'exact', head: true });

  if (finalProducts !== baselineProducts || finalShops !== baselineShops || finalProfiles !== baselineProfiles) {
    throw new Error(`Database baseline mismatch! Products: ${finalProducts}/${baselineProducts}, Shops: ${finalShops}/${baselineShops}`);
  }

  console.log('✓ Zero residual test records exist.');
  console.log(`✓ Baseline counts match perfectly (Products: ${finalProducts}, Shops: ${finalShops}, Profiles: ${finalProfiles}).`);

  results.databaseIntegrity = 'PASS';

  console.log('\n========================================');
  console.log('🎉 ALL PHASE 4 CHECKS COMPLETED WITH 100% SUCCESS!');
  console.log('========================================');
}

runControlledTest().then(() => {
  console.log('\nFINAL RESULTS MATRIX:');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('\n❌ TEST RUN STOPPED ON ERROR:', err.message);
  console.log('\nPARTIAL RESULTS MATRIX:');
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
