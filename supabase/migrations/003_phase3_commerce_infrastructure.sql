-- ====================================================================
-- ENUGU BUY & SELL — PHASE 3 COMMERCE & OPERATING INFRASTRUCTURE SCHEMA
-- Establishes: profiles -> shops -> products -> cart_items -> orders -> order_items
-- And: orders -> customers -> notifications -> analytics
-- ====================================================================

-- ── 1. CART ITEMS TABLE ──────────────────────────────────────────────
-- Persistent cross-device buyer cart
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_cart_product UNIQUE (user_id, product_id)
);

-- ── 2. ORDERS TABLE ──────────────────────────────────────────────────
-- Central commercial transaction record connecting Buyer, Shop, and Escrow
CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text UNIQUE NOT NULL,
  buyer_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_id          uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  total_amount     numeric(12, 2) NOT NULL CHECK (total_amount >= 0),
  escrow_fee       numeric(12, 2) NOT NULL DEFAULT 0 CHECK (escrow_fee >= 0),
  order_status     text NOT NULL DEFAULT 'pending' 
                   CHECK (order_status IN ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'in_transit', 'delivered', 'completed', 'cancelled', 'disputed')),
  payment_status   text NOT NULL DEFAULT 'unpaid' 
                   CHECK (payment_status IN ('unpaid', 'escrow_locked', 'released_to_seller', 'refunded_to_buyer')),
  payment_method   text DEFAULT 'escrow_wallet' 
                   CHECK (payment_method IN ('escrow_wallet', 'card', 'bank_transfer', 'cash_on_delivery')),
  delivery_address text,
  delivery_campus  text DEFAULT 'UNN Main Campus',
  contact_phone    text,
  buyer_notes      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── 3. ORDER ITEMS TABLE ─────────────────────────────────────────────
-- Line item breakdown preserving historical unit prices and quantities
CREATE TABLE IF NOT EXISTS public.order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  numeric(12, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal    numeric(12, 2) NOT NULL CHECK (subtotal >= 0),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 4. CUSTOMERS TABLE ───────────────────────────────────────────────
-- Dedicated relationship table tracking buyer-seller acquisition & lifetime value
CREATE TABLE IF NOT EXISTS public.customers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id        uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_orders   integer NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  total_spent    numeric(12, 2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  first_order_at timestamptz DEFAULT now(),
  last_order_at  timestamptz DEFAULT now(),
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_shop_customer UNIQUE (shop_id, user_id)
);

-- ── 5. NOTIFICATIONS TABLE ───────────────────────────────────────────
-- In-app notifications stream for buyers, sellers, and system alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text NOT NULL 
              CHECK (type IN ('order_placed', 'order_status_update', 'new_message', 'new_product', 'deal_alert', 'store_verified', 'system_alert')),
  title       text NOT NULL,
  body        text NOT NULL,
  link_url    text,
  is_read     boolean NOT NULL DEFAULT false,
  metadata    jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 6. DEALS TABLE ───────────────────────────────────────────────────
-- Real persistent flash deals and discounted products linked to live catalog
CREATE TABLE IF NOT EXISTS public.deals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id          uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 90),
  deal_price       numeric(12, 2) NOT NULL CHECK (deal_price >= 0),
  is_active        boolean NOT NULL DEFAULT true,
  starts_at        timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── 7. SELLER PAYOUT ACCOUNTS TABLE ──────────────────────────────────
-- Verified merchant settlement bank account records
CREATE TABLE IF NOT EXISTS public.seller_payout_accounts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id        uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  bank_name      text NOT NULL,
  bank_code      text,
  account_number text NOT NULL,
  account_name   text NOT NULL,
  is_verified    boolean NOT NULL DEFAULT false,
  is_primary     boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_shop_payout_account UNIQUE (shop_id, account_number)
);

-- ── 8. TRIGGERS & AUTOMATION FUNCTIONS ────────────────────────────────

-- Automatic Customer Stats Sync on Order Placement / Completion
CREATE OR REPLACE FUNCTION public.handle_order_customer_sync()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.customers (shop_id, user_id, total_orders, total_spent, first_order_at, last_order_at)
  VALUES (
    NEW.shop_id,
    NEW.buyer_id,
    1,
    NEW.total_amount,
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (shop_id, user_id) DO UPDATE SET
    total_orders = public.customers.total_orders + 1,
    total_spent  = public.customers.total_spent + EXCLUDED.total_spent,
    last_order_at = EXCLUDED.last_order_at,
    updated_at   = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_customer_sync ON public.orders;
CREATE TRIGGER trg_order_customer_sync
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_customer_sync();

-- Automatic Notification to Seller on New Order
CREATE OR REPLACE FUNCTION public.notify_seller_on_order()
RETURNS trigger AS $$
DECLARE
  v_owner_id uuid;
  v_shop_name text;
BEGIN
  SELECT owner_id, name INTO v_owner_id, v_shop_name
  FROM public.shops
  WHERE id = NEW.shop_id;

  IF v_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link_url, metadata)
    VALUES (
      v_owner_id,
      'order_placed',
      'New Order Received! 🛒',
      'You have a new order (' || NEW.order_number || ') totaling ₦' || TO_CHAR(NEW.total_amount, 'FM999,999,999.00'),
      '/seller/dashboard',
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'total_amount', NEW.total_amount)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_seller_on_order ON public.orders;
CREATE TRIGGER trg_notify_seller_on_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_seller_on_order();

-- Automatic Notification to Buyer on Order Status Change
CREATE OR REPLACE FUNCTION public.notify_buyer_on_order_status()
RETURNS trigger AS $$
BEGIN
  IF OLD.order_status IS DISTINCT FROM NEW.order_status THEN
    INSERT INTO public.notifications (user_id, type, title, body, link_url, metadata)
    VALUES (
      NEW.buyer_id,
      'order_status_update',
      'Order Status Updated',
      'Your order ' || NEW.order_number || ' is now ' || UPPER(REPLACE(NEW.order_status, '_', ' ')),
      '/account',
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'status', NEW.order_status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_buyer_on_order_status ON public.orders;
CREATE TRIGGER trg_notify_buyer_on_order_status
  AFTER UPDATE OF order_status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_buyer_on_order_status();

-- ── 9. ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────────

ALTER TABLE public.cart_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_payout_accounts ENABLE ROW LEVEL SECURITY;

-- 1. Cart Items RLS (Strict user isolation)
CREATE POLICY "Users read own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- 2. Orders RLS (Buyers view their orders; Sellers view their shop orders)
CREATE POLICY "Buyers view own orders" ON public.orders 
  FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers view shop orders" ON public.orders 
  FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));
CREATE POLICY "Buyers create orders" ON public.orders 
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers update order status" ON public.orders 
  FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));

-- 3. Order Items RLS (Accessible by buyer or seller of parent order)
CREATE POLICY "Participants view order items" ON public.order_items 
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE buyer_id = auth.uid() 
         OR shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid())
    )
  );
CREATE POLICY "Buyers insert order items" ON public.order_items 
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
  );

-- 4. Customers RLS (Shop owners view/manage their customers)
CREATE POLICY "Sellers view own customers" ON public.customers 
  FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));
CREATE POLICY "Sellers update customer notes" ON public.customers 
  FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));

-- 5. Notifications RLS (Strict recipient isolation)
CREATE POLICY "Users view own notifications" ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications 
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Deals RLS (Public read active; Shop owners manage their product deals)
CREATE POLICY "Public read deals" ON public.deals 
  FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers manage product deals" ON public.deals 
  FOR ALL USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));

-- 7. Seller Payout Accounts RLS (Shop owners manage their payout accounts)
CREATE POLICY "Sellers view own payout accounts" ON public.seller_payout_accounts 
  FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));
CREATE POLICY "Sellers manage payout accounts" ON public.seller_payout_accounts 
  FOR ALL USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));

-- ── 10. HIGH PERFORMANCE INDEXES ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_shop_user ON public.customers(shop_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_product ON public.deals(product_id);
CREATE INDEX IF NOT EXISTS idx_deals_active ON public.deals(is_active);
CREATE INDEX IF NOT EXISTS idx_payout_shop ON public.seller_payout_accounts(shop_id);
