'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

interface Props {
  data: Record<string, number>;
  color?: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { fullName: string } }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white shadow-xl max-w-[220px]">
      <p className="text-white/60 mb-0.5 leading-snug">{payload[0].payload.fullName}</p>
      <p className="font-bold text-white">{payload[0].value} responses</p>
    </div>
  );
};

export default function HorizBarChart({ data, color = '#f97316' }: Props) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value]) => ({
      fullName: name,
      name: name.length > 26 ? name.slice(0, 26) + '…' : name,
      value,
      pct: total ? Math.round((value / total) * 100) : 0,
    }));

  if (!chartData.length) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 38)}>
      <BarChart
        layout="vertical"
        data={chartData}
        barSize={14}
        margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 10, fill: 'rgba(255,255,255,0.35)', formatter: (v: unknown) => `${total ? Math.round((Number(v) / total) * 100) : 0}%` }}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={color} fillOpacity={1 - i * 0.08} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return <div className="h-[160px] flex items-center justify-center text-white/20 text-xs">No data yet</div>;
}
