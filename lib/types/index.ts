/**
 * lib/types/index.ts
 * Core MVP TypeScript Type Definitions
 * Aligned strictly with Core Document 02, 03 & 09 Architecture
 */

export interface Profile {
  id: string;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  location: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  location: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type ProductStatus = 'active' | 'sold' | 'archived';

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  condition: string;
  location: string;
  images: string[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  // Joined relations
  shop?: Shop;
  category?: Category;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  product?: Product;
  buyer?: Profile;
  seller?: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  // Joined relations
  sender?: Profile;
}

export type ReportTargetType = 'listing' | 'seller' | 'user';
export type ReportReason = 'scam' | 'fake_product' | 'harassment' | 'prohibited_item' | 'spam' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}
