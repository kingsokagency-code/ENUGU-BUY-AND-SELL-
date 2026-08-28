/**
 * lib/commerce-client.ts
 * Client-side Commerce & Cart Helpers
 * Wraps Supabase Session JWT token into API calls
 */

import { supabase } from './supabase';
import type { CartItem, Order, OrderStatus } from './types/commerce';

interface CartResponse {
  success: boolean;
  count: number;
  unique_items_count: number;
  total_amount: number;
  items: CartItem[];
  error?: string;
}

interface AddToCartResponse {
  success: boolean;
  item?: CartItem;
  total_items_count?: number;
  message?: string;
  error?: string;
}

interface OrdersResponse {
  success: boolean;
  count: number;
  orders: Order[];
  error?: string;
}

interface SingleOrderResponse {
  success: boolean;
  order: Order;
  is_buyer?: boolean;
  is_seller?: boolean;
  error?: string;
}

interface CreateOrderPayload {
  shop_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  delivery_campus: string;
  delivery_address?: string;
  contact_phone?: string;
  buyer_notes?: string;
  payment_method?: string;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    try {
      const { data: refreshData } = await supabase.auth.refreshSession();
      session = refreshData.session;
    } catch {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

/**
 * Fetch authenticated user's cart
 */
export async function getCart(): Promise<CartResponse> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/cart', { headers, cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching cart';
    return { success: false, count: 0, unique_items_count: 0, total_amount: 0, items: [], error: msg };
  }
}

/**
 * Add a product to cart
 */
export async function addToCart(productId: string, quantity: number = 1): Promise<AddToCartResponse> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers,
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to add to cart' };
    }
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error adding to cart';
    return { success: false, error: msg };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update quantity' };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating quantity';
    return { success: false, error: msg };
  }
}

/**
 * Remove an item from cart
 */
export async function removeCartItem(cartItemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to remove item' };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error removing item';
    return { success: false, error: msg };
  }
}

/**
 * Create a new order
 */
export async function placeOrder(payload: CreateOrderPayload): Promise<{ success: boolean; order_id?: string; order_number?: string; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to place order' };
    }
    return { success: true, order_id: data.order_id, order_number: data.order_number };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error placing order';
    return { success: false, error: msg };
  }
}

/**
 * Fetch orders for buyer or seller
 */
export async function getOrders(role: 'buyer' | 'seller' = 'buyer'): Promise<OrdersResponse> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/orders?role=${role}`, { headers, cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching orders';
    return { success: false, count: 0, orders: [], error: msg };
  }
}

/**
 * Fetch single order details
 */
export async function getOrderById(orderId: string): Promise<SingleOrderResponse> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/orders/${orderId}`, { headers, cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching order';
    return { success: false, order: {} as Order, error: msg };
  }
}

/**
 * Update order status (Seller action)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ order_status: status }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update order status' };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating order status';
    return { success: false, error: msg };
  }
}

/**
 * Fetch all products owned by the authenticated seller's shops
 */
export async function getSellerProducts(): Promise<{ success: boolean; count: number; products: any[]; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/products?seller=true', { headers, cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, count: 0, products: [], error: data.error || 'Failed to fetch seller products' };
    }
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching seller products';
    return { success: false, count: 0, products: [], error: msg };
  }
}

/**
 * Update product details, stock, or status
 */
export async function updateProduct(productId: string, payload: Record<string, unknown>): Promise<{ success: boolean; product?: any; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update product' };
    }
    return { success: true, product: data.product };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating product';
    return { success: false, error: msg };
  }
}

/**
 * Safely archive product
 */
export async function archiveProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to archive product' };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error archiving product';
    return { success: false, error: msg };
  }
}

/**
 * Fetch seller customers CRM list
 */
export async function getSellerCustomers(): Promise<{ success: boolean; count: number; customers: any[]; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/seller/customers', { headers, cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, count: 0, customers: [], error: data.error || 'Failed to fetch customers' };
    }
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching customers';
    return { success: false, count: 0, customers: [], error: msg };
  }
}

/**
 * Update seller shop settings
 */
export async function updateShopSettings(shopId: string, payload: Record<string, unknown>): Promise<{ success: boolean; shop?: any; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/shops/${shopId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update shop' };
    }
    return { success: true, shop: data.shop };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating shop';
    return { success: false, error: msg };
  }
}
