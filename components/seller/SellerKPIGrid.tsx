'use client';

import React from 'react';
import { MetricCard } from '@/components/ebs-ui/MetricCard';
import { DollarSign, ShoppingBag, Users, Star } from 'lucide-react';

interface SellerKPIGridProps {
  totalSales?: number;
  totalOrders?: number;
  newCustomers?: number;
  rating?: number;
  isDemo?: boolean;
}

export function SellerKPIGrid({
  totalSales = 0,
  totalOrders = 0,
  newCustomers = 0,
  rating = 5.0,
  isDemo = false,
}: SellerKPIGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        label="Total Sales"
        value={`₦${totalSales.toLocaleString()}`}
        icon={<DollarSign className="w-4 h-4" />}
        dark={true}
        isDemo={isDemo}
      />
      <MetricCard
        label="Orders"
        value={totalOrders.toString()}
        icon={<ShoppingBag className="w-4 h-4" />}
        dark={true}
        isDemo={isDemo}
      />
      <MetricCard
        label="Customers"
        value={newCustomers.toString()}
        icon={<Users className="w-4 h-4" />}
        dark={true}
        isDemo={isDemo}
      />
      <MetricCard
        label="Store Rating"
        value={rating.toFixed(1)}
        icon={<Star className="w-4 h-4 fill-current" />}
        dark={true}
        isDemo={isDemo}
      />
    </div>
  );
}
