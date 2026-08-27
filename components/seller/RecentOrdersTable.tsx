'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import type { Order } from '@/lib/types/commerce';

interface RecentOrdersTableProps {
  orders?: Order[];
}

export function RecentOrdersTable({ orders = [] }: RecentOrdersTableProps) {
  const pendingCount = orders.filter(o => o.order_status === 'pending').length;
  const recentSlice = orders.slice(0, 5);

  return (
    <div className="bg-[#1A2820] border border-[#243320] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Orders</h3>
            <p className="text-xs text-[#6B9980] mt-0.5">Live store transactions ({orders.length})</p>
          </div>
          <Link
            href="/seller/orders"
            className="text-xs font-semibold text-[#0A8A50] hover:text-[#087443] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Package className="w-8 h-8 text-[#6B9980]/50 mx-auto" />
            <p className="text-xs font-bold text-white">No Orders Yet</p>
            <p className="text-[11px] text-[#6B9980]">When buyers order your products, they will appear here in real time.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#243320]">
            {recentSlice.map((ord) => {
              const customerName = ord.buyer?.full_name || 'Campus Buyer';
              const firstItem = ord.items?.[0];
              const productName = firstItem?.product?.name || `Order #${ord.order_number}`;
              const isPending = ord.order_status === 'pending';
              const isDelivered = ['delivered', 'completed'].includes(ord.order_status);

              return (
                <Link
                  key={ord.id}
                  href={`/seller/orders`}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-[#243320]/40 px-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#243320] text-[#0A8A50] flex items-center justify-center font-bold text-xs shrink-0">
                      {customerName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{customerName}</p>
                      <p className="text-[10px] text-[#6B9980] truncate">{productName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-white">₦{Number(ord.total_amount).toLocaleString()}</p>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300'
                          : isDelivered
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {ord.order_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#243320] text-[11px] text-[#6B9980] flex items-center justify-between">
        <span>{pendingCount} order{pendingCount === 1 ? '' : 's'} pending fulfillment</span>
        <Link href="/seller/orders" className="text-white hover:underline font-medium">Manage →</Link>
      </div>
    </div>
  );
}
