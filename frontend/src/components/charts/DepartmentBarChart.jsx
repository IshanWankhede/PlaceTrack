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
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        <p className="text-violet-300 font-bold tabular-nums">
          Placed: {Number(payload[0].value).toFixed(1)}%
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

/**
 * DepartmentBarChart
 *
 * Accepts data from EITHER the mockApi shape (key: "rate") or the real API
 * shape (key: "placement_rate"). The chart normalises both into a "pct" field
 * so a single dataKey works.
 */
export default function DepartmentBarChart({ data = [] }) {
  const normalised = data.map((d) => ({
    ...d,
    pct: Number(d.placement_rate ?? d.rate ?? 0),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={normalised}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
          <XAxis
            dataKey="department"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
            dy={10}
            tickFormatter={(val) => {
              if (val.includes('Computer')) return 'CSE';
              if (val.includes('Information')) return 'IT';
              if (val.includes('Electronics')) return 'ECE';
              if (val.includes('Mechanical')) return 'MECH';
              return val;
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Bar
            dataKey="pct"
            fill="#8B5CF6"
            radius={[8, 8, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
