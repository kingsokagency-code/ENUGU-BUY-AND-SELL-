-- ====================================================================
-- ENUGU BUY & SELL — AUTHORITATIVE PHASE 1 CONSOLIDATED DATABASE SCHEMA
-- Remediates Findings H3, H4, M1, M2 & Operating under Core Documents 02, 03 & 09
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES TABLE (Remediating H3 & M2) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone        text UNIQUE,
  full_name    text,
  avatar_url   text,
  location     text DEFAULT 'Enugu',
  is_verified  boolean DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- M2: Automatic Profile Provisioning Trigger on auth.users Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, location)
  VALUES (
    new.id,
    new.phone,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student User'),
    'Enugu'
  )
  ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- H3: Public View Exclude Phone Number (Phone Privacy)
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, full_name, avatar_url, location, is_verified, created_at
  FROM public.profiles;

-- ── 2. SHOPS TABLE (The Atomic Unit of the Platform) ─────────────────
CREATE TABLE IF NOT EXISTS public.shops (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  logo_url    text,
  location    text DEFAULT 'Enugu',
  is_verified boolean DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 3. CATEGORIES TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL
);

-- Seed initial MVP categories per Core Doc 03 Section 19
INSERT INTO public.categories (name, slug) VALUES
  ('Electronics', 'electronics'),
  ('Phones', 'phones'),
  ('Laptops', 'laptops'),
  ('Books', 'books'),
  ('Fashion', 'fashion'),
  ('Furniture', 'furniture'),
  ('Appliances', 'appliances'),
  ('Services', 'services'),
  ('Other', 'other')
ON CONFLICT (slug) DO NOTHING;

-- ── 4. PRODUCTS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  price       numeric(12, 2) NOT NULL CHECK (price >= 0),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  condition   text DEFAULT 'Used',
  location    text DEFAULT 'Enugu',
  images      text[] DEFAULT '{}',
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 5. CONVERSATIONS TABLE (Remediating M1: Strict Product Context) ──
CREATE TABLE IF NOT EXISTS public.conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, -- M1: NOT NULL
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_buyer_seller_product UNIQUE (buyer_id, seller_id, product_id)
);

-- M1: Trigger verifying that seller_id is the actual owner of product's shop
CREATE OR REPLACE FUNCTION public.verify_conversation_seller()
RETURNS trigger AS $$
DECLARE
  actual_owner_id uuid;
BEGIN
  SELECT s.owner_id INTO actual_owner_id
  FROM public.products p
  JOIN public.shops s ON p.shop_id = s.id
  WHERE p.id = NEW.product_id;

  IF actual_owner_id IS NULL OR actual_owner_id <> NEW.seller_id THEN
    RAISE EXCEPTION 'Invalid conversation: seller_id does not own the product shop.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verify_conversation_seller ON public.conversations;
CREATE TRIGGER trg_verify_conversation_seller
  BEFORE INSERT OR UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.verify_conversation_seller();

-- ── 6. MESSAGES TABLE (Realtime Contextual Messages) ────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         text NOT NULL,
  image_url       text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── 7. REPORTS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('listing', 'seller', 'user')),
  target_id   uuid NOT NULL,
  reason      text NOT NULL CHECK (reason IN ('scam', 'fake_product', 'harassment', 'prohibited_item', 'spam', 'other')),
  details     text,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 8. SURVEY RESPONSES & AI INSIGHTS TABLES (Preserved Admin Data) ─
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number     text,
  institution         text,
  living_situation    text,
  hardest_item        text,
  first_search        text,
  found_item          text,
  biggest_challenge   text,
  trust_vs_price      text,
  cancelled_purchase  text,
  platform_preference text,
  whatsapp_daily      text,
  one_improvement     text,
  duration_seconds    integer DEFAULT 0,
  submitted_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_insights (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_count integer NOT NULL,
  report         jsonb NOT NULL,
  generated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analysis_runs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_count integer UNIQUE NOT NULL,
  status         text NOT NULL CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  error_message  text,
  completed_at   timestamptz
);

-- ── 9. ROW LEVEL SECURITY (RLS) POLICIES (Remediating H3, H4, M1) ───
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights       ENABLE ROW LEVEL SECURITY;

-- H3: Profiles RLS — Users can only select/update THEIR OWN private profile row
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Shops RLS
CREATE POLICY "Public read shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Owners create shop" ON public.shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update shop" ON public.shops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete shop" ON public.shops FOR DELETE USING (auth.uid() = owner_id);

-- Categories RLS
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

-- Products RLS
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (status = 'active' OR auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));
CREATE POLICY "Owners create product" ON public.products FOR INSERT WITH CHECK (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));
CREATE POLICY "Owners update product" ON public.products FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));
CREATE POLICY "Owners delete product" ON public.products FOR DELETE USING (auth.uid() IN (SELECT owner_id FROM public.shops WHERE id = shop_id));

-- Conversations RLS
CREATE POLICY "Participants view conversations" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyer create conversation" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Messages RLS
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM public.conversations WHERE buyer_id = auth.uid() OR seller_id = auth.uid())
);
CREATE POLICY "Participants insert messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (SELECT id FROM public.conversations WHERE buyer_id = auth.uid() OR seller_id = auth.uid())
);

-- Reports RLS
CREATE POLICY "Users insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ── 10. INDEXES FOR HIGH-EFFICIENCY PERFORMANCE ────────────────────
CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
