-- ====================================================================
-- ENUGU BUY & SELL — PHASE 6 SELLER OPERATIONS SCHEMA MIGRATION
-- Adds stock_quantity inventory tracking to public.products
-- Preserves all existing Phase 1, 2, 3, 4, 5 tables, triggers, and RLS policies
-- ====================================================================

-- ── 1. ADD STOCK QUANTITY TO PRODUCTS ────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN stock_quantity integer NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0);
  END IF;
END $$;

-- ── 2. PERFORMANCE INDEXES ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_shop_status ON public.products(shop_id, status);

-- ── 3. ATOMIC INVENTORY DECREMENT RPC FUNCTION ────────────────────────
-- Allows safe, concurrency-protected stock reduction during checkout
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id uuid,
  p_quantity integer
)
RETURNS jsonb AS $$
DECLARE
  v_current_stock integer;
  v_new_stock integer;
  v_product_name text;
BEGIN
  -- Lock the product row for update to prevent race conditions
  SELECT stock_quantity, name INTO v_current_stock, v_product_name
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product not found'
    );
  END IF;

  IF v_current_stock < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient stock for "' || v_product_name || '". Available: ' || v_current_stock || ', requested: ' || p_quantity
    );
  END IF;

  v_new_stock := v_current_stock - p_quantity;

  UPDATE public.products
  SET 
    stock_quantity = v_new_stock,
    status = CASE WHEN v_new_stock = 0 THEN 'sold' ELSE status END,
    updated_at = now()
  WHERE id = p_product_id;

  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
