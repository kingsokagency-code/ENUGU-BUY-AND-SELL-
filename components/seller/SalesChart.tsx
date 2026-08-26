'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const DEMO_CHART_DATA = [
  { date: 'May 14', sales: 180000 },
  { date: 'May 15', sales: 240000 },
  { date: 'May 16', sales: 195000 },
  { date: 'May 17', sales: 310000 },
  { date: 'May 18', sales: 280000 },
  { date: 'May 19', sales: 420000 },
  { date: 'May 20', sales: 380000 },
];

export function SalesChart() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');

  return (
    <div className="bg-[#1A2820] border border-[#243320] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Sales Overview</h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">Demo</span>
          </div>
          <p className="text-xs text-[#6B9980] mt-0.5">Real-time revenue tracking</p>
        </div>

        {/* Range Tabs */}
        <div className="flex items-center bg-[#111D17] border border-[#243320] rounded-xl p-1 text-xs">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all uppercase text-[11px] ${
                range === r
                  ? 'bg-[#087443] text-white shadow-sm'
                  : 'text-[#6B9980] hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEMO_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A8A50" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0A8A50" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#243320" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6B9980"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#243320' }}
            />
            <YAxis
              stroke="#6B9980"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₦${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111D17',
                borderColor: '#243320',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`₦${Number(value || 0).toLocaleString()}`, 'Sales']}
              labelStyle={{ color: '#0A8A50', fontWeight: 'bold' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#0A8A50"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#salesGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-[#243320] flex items-center justify-between text-xs text-[#6B9980]">
        <span>Connects to real payment events upon transaction confirmation</span>
        <span className="font-semibold text-white">Peak: ₦420,000</span>
      </div>
    </div>
  );
}
