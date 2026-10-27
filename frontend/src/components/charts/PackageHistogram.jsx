import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0B0F] text-white px-3 py-2 rounded-2xl shadow-xl text-xs border border-white/10 select-none">
        <p className="font-semibold text-slate-200 mb-1">Bracket: {label}</p>
        <p className="text-amber-300 font-bold tabular-nums">
          Students: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * PackageHistogram
 *
 * Accepts data from EITHER the mockApi shape (key: "range") or the real API
 * shape (key: "tier_range"). Normalises into "label" so a single dataKey works.
 */
export default function PackageHistogram({ data = [] }) {
  const normalised = data.map((d) => ({
    ...d,
    label: d.tier_range ?? d.range ?? '',
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={normalised}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
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
            dataKey="label"
            type="category"
            axisLine={false}
            tickLine={false}
            width={76}
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Bar
            dataKey="count"
            fill="#F5C451"
            radius={[0, 8, 8, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
