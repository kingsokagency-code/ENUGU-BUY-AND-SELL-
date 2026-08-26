'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface OrderItem {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'Pending' | 'Delivered' | 'Processing';
  date: string;
}

const DEMO_SELLER_ORDERS: OrderItem[] = [
  { id: '1', customer: 'Daniel E.', product: 'iPhone 14 Pro Max', amount: 250000, status: 'Pending', date: 'Just now' },
  { id: '2', customer: 'Chioma A.', product: 'MacBook Air M2', amount: 120000, status: 'Delivered', date: '2h ago' },
  { id: '3', customer: 'Emeka P.', product: 'Sony WH-1000XM5', amount: 75000, status: 'Delivered', date: 'Yesterday' },
  { id: '4', customer: 'Faith U.', product: 'Campus Desk Set', amount: 45000, status: 'Pending', date: 'May 19' },
];

export function RecentOrdersTable() {
  return (
    <div className="bg-[#1A2820] border border-[#243320] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Orders</h3>
            <p className="text-xs text-[#6B9980] mt-0.5">Live store transactions</p>
          </div>
          <Link
            href="/seller/orders"
            className="text-xs font-semibold text-[#0A8A50] hover:text-[#087443] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#243320]">
          {DEMO_SELLER_ORDERS.map((ord) => {
            const isPending = ord.status === 'Pending';
            return (
              <div key={ord.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#243320] text-[#0A8A50] flex items-center justify-center font-bold text-xs shrink-0">
                    {ord.customer[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{ord.customer}</p>
                    <p className="text-[10px] text-[#6B9980] truncate">{ord.product}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white">₦{ord.amount.toLocaleString()}</p>
                  <span
                    className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isPending ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#243320] text-[11px] text-[#6B9980] flex items-center justify-between">
        <span>4 new orders pending fulfillment</span>
        <Link href="/seller/orders" className="text-white hover:underline font-medium">Manage →</Link>
      </div>
    </div>
  );
}
