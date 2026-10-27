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
import { ChevronDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0B0F] text-white px-3.5 py-2.5 rounded-2xl shadow-xl text-xs border border-white/10 select-none">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium capitalize text-slate-200">
              {entry.name}:
            </span>
            <span className="font-bold text-white tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function StatisticsLineChart({ dataWeekly = [], dataMonthly = [] }) {
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'monthly'

  const currentData = timeframe === 'weekly' ? dataWeekly : dataMonthly;

  return (
    <div className="w-full">
      {/* Chart Header with Timeframe Dropdown */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-lg md:text-xl text-[#0B0B0F]">
            Placement Statistics
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time track of offers released and technical rounds completed
          </p>
        </div>

        <div className="relative inline-flex items-center bg-[#F1F1F4] rounded-full p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 rounded-full transition-all ${
              timeframe === 'weekly'
                ? 'bg-white text-[#0B0B0F] shadow-sm'
                : 'text-[#64748B] hover:text-[#0B0B0F]'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 rounded-full transition-all ${
              timeframe === 'monthly'
                ? 'bg-white text-[#0B0B0F] shadow-sm'
                : 'text-[#64748B] hover:text-[#0B0B0F]'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={currentData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="offersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="interviewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5C451" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F5C451" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,0,0,0.04)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="offers"
              stroke="#8B5CF6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#offersGradient)"
              activeDot={{ r: 6, fill: '#0B0B0F', stroke: '#8B5CF6', strokeWidth: 2 }}
            />
            {timeframe === 'weekly' && (
              <Area
                type="monotone"
                dataKey="interviews"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#interviewsGradient)"
                activeDot={{ r: 5, fill: '#0B0B0F', stroke: '#F59E0B', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-end gap-6 pt-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          <span>Offers Confirmed</span>
        </div>
        {timeframe === 'weekly' && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>Interviews Conducted</span>
          </div>
        )}
      </div>
    </div>
  );
}
