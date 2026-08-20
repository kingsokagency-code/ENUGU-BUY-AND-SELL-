'use client';

import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

interface Props {
  data: Record<string, number>;
  color?: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { name: string } }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white shadow-xl">
      <p className="text-white/60 mb-0.5 max-w-[180px] leading-snug">{payload[0].payload.name}</p>
      <p className="font-bold text-white">{payload[0].value} responses</p>
    </div>
  );
};

export default function BarChart({ data, color = '#16a34a' }: Props) {
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name: name.length > 22 ? name.slice(0, 22) + '…' : name,
      fullName: name,
      value,
    }));

  if (!chartData.length) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ReBarChart data={chartData} barSize={20} margin={{ top: 4, right: 4, left: -28, bottom: 4 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={color} fillOpacity={1 - i * 0.1} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return <div className="h-[200px] flex items-center justify-center text-white/20 text-xs">No data yet</div>;
}
