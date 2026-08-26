/**
 * lib/validations/commerce.ts
 * Server-side Zod validation schemas for Cart, Orders, and Deals
 */

import { z } from 'zod';

export const addToCartSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  shop_id: z.string().uuid('Invalid shop ID'),
  items: z.array(
    z.object({
      product_id: z.string().uuid('Invalid product ID'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Order must contain at least one item'),
  delivery_campus: z.string().min(2, 'Please specify campus location').default('UNN Main Campus'),
  delivery_address: z.string().optional(),
  contact_phone: z.string().optional(),
  buyer_notes: z.string().max(500, 'Notes too long').optional(),
  payment_method: z.enum(['escrow_wallet', 'card', 'bank_transfer', 'cash_on_delivery']).default('escrow_wallet'),
});

export const updateOrderStatusSchema = z.object({
  order_status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'ready_for_pickup',
    'in_transit',
    'delivered',
    'completed',
    'cancelled',
    'disputed',
  ]),
});

export const createDealSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  discount_percent: z.number().int().min(1).max(90, 'Discount must be between 1% and 90%'),
  deal_price: z.number().min(0, 'Deal price must be non-negative'),
  starts_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
});
