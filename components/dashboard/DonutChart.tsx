'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: Record<string, number>;
  colors?: string[];
}

const DEFAULT_COLORS = ['#16a34a', '#f97316', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { pct: number } }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white shadow-xl max-w-[200px]">
      <p className="text-white/60 mb-0.5 leading-snug">{payload[0].name}</p>
      <p className="font-bold text-white">{payload[0].value} responses · {payload[0].payload.pct}%</p>
    </div>
  );
};

const CustomLegend = ({ payload }: { payload?: { value: string; color: string }[] }) => (
  <ul className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-3">
    {(payload ?? []).map((entry, i) => (
      <li key={i} className="flex items-center gap-1.5 text-[10px] text-white/50 max-w-[120px]">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
        <span className="truncate">{entry.value}</span>
      </li>
    ))}
  </ul>
);

export default function DonutChart({ data, colors = DEFAULT_COLORS }: Props) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name: name.length > 28 ? name.slice(0, 28) + '…' : name,
      value,
      pct: total ? Math.round((value / total) * 100) : 0,
    }));

  if (!chartData.length) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return <div className="h-[220px] flex items-center justify-center text-white/20 text-xs">No data yet</div>;
}
