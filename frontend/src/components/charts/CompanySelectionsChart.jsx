import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

const COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#A78BFA',
  '#C4B5FD',
  '#10B981',
  '#34D399',
  '#F5C451',
  '#FB923C',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0B0F] text-white px-3 py-2 rounded-2xl shadow-xl text-xs border border-white/10 select-none">
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        <p className="text-violet-300 font-bold tabular-nums">
          Selections: {payload[0].value}
        </p>
        {payload[0].payload.avg_package != null && (
          <p className="text-emerald-300 tabular-nums">
            Avg: {Number(payload[0].payload.avg_package).toFixed(1)} LPA
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function CompanySelectionsChart({ data = [] }) {
  const top = data.slice(0, 8);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 16, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.04)" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
            allowDecimals={false}
          />
          <YAxis
            dataKey="company"
            type="category"
            axisLine={false}
            tickLine={false}
            width={96}
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(val) => (val.length > 14 ? val.slice(0, 13) + '…' : val)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Bar dataKey="selections" radius={[0, 8, 8, 0]} maxBarSize={24}>
            {top.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
