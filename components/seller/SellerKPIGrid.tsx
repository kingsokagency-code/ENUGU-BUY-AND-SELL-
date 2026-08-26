'use client';

import React from 'react';
import { MetricCard } from '@/components/ebs-ui/MetricCard';
import { DollarSign, ShoppingBag, Users, Star } from 'lucide-react';

interface SellerKPIGridProps {
  totalSales?: number;
  totalOrders?: number;
  newCustomers?: number;
  rating?: number;
}

export function SellerKPIGrid({
  totalSales = 1250000,
  totalOrders = 56,
  newCustomers = 142,
  rating = 4.8,
}: SellerKPIGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        label="Total Sales"
        value={`₦${totalSales.toLocaleString()}`}
        change={23.5}
        icon={<DollarSign className="w-4 h-4" />}
        dark={true}
        isDemo={true}
      />
      <MetricCard
        label="Orders"
        value={totalOrders.toString()}
        change={18.2}
        icon={<ShoppingBag className="w-4 h-4" />}
        dark={true}
        isDemo={true}
      />
      <MetricCard
        label="New Customers"
        value={newCustomers.toString()}
        change={31.4}
        icon={<Users className="w-4 h-4" />}
        dark={true}
        isDemo={true}
      />
      <MetricCard
        label="Store Rating"
        value={rating.toFixed(1)}
        change={0.6}
        icon={<Star className="w-4 h-4 fill-current" />}
        dark={true}
        isDemo={true}
      />
    </div>
  );
}
