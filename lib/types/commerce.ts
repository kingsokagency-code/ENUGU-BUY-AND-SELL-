/**
 * lib/types/commerce.ts
 * Authoritative Phase 3 Commerce & Operations TypeScript Type Definitions
 * Establishes complete relationships:
 * Profiles -> Shops -> Products -> CartItems -> Orders -> OrderItems
 * Orders -> Customers -> Notifications -> Deals -> PayoutAccounts
 */

import type { Profile, Shop, Product } from './index';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentStatus =
  | 'unpaid'
  | 'escrow_locked'
  | 'released_to_seller'
  | 'refunded_to_buyer';

export type PaymentMethod =
  | 'escrow_wallet'
  | 'card'
  | 'bank_transfer'
  | 'cash_on_delivery';

export type NotificationType =
  | 'order_placed'
  | 'order_status_update'
  | 'new_message'
  | 'new_product'
  | 'deal_alert'
  | 'store_verified'
  | 'system_alert';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined relation
  product?: Product;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  // Joined relation
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  shop_id: string;
  total_amount: number;
  escrow_fee: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  delivery_address: string | null;
  delivery_campus: string;
  contact_phone: string | null;
  buyer_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  buyer?: Profile;
  shop?: Shop;
  items?: OrderItem[];
}

export interface Customer {
  id: string;
  shop_id: string;
  user_id: string;
  total_orders: number;
  total_spent: number;
  first_order_at: string;
  last_order_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  user?: Profile;
  shop?: Shop;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link_url: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Deal {
  id: string;
  product_id: string;
  shop_id: string;
  discount_percent: number;
  deal_price: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  product?: Product;
  shop?: Shop;
}

export interface SellerPayoutAccount {
  id: string;
  shop_id: string;
  bank_name: string;
  bank_code: string | null;
  account_number: string;
  account_name: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
