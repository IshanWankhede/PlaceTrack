import React from 'react';
import GlassCard from './GlassCard.jsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  trend = null, // e.g. '+14.2% vs last year'
  trendPositive = true,
  icon: Icon = null,
  accentColor = 'lavender', // 'lavender', 'yellow', 'mint', 'peach'
  caption = '',
  className = '',
  onClick,
}) {
  const accentBgs = {
    lavender: 'bg-violet-50 text-violet-600',
    yellow: 'bg-amber-50 text-amber-600',
    mint: 'bg-emerald-50 text-emerald-600',
    peach: 'bg-orange-50 text-orange-600',
    blue: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <GlassCard
      hoverEffect={!!onClick}
      onClick={onClick}
      className={`p-6 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-2xl ${accentBgs[accentColor] || accentBgs.lavender}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-xl font-semibold text-[#0B0B0F]">{prefix}</span>}
          <span className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#0B0B0F] tabular-nums">
            {value}
          </span>
          {suffix && <span className="text-base font-medium text-[#64748B] ml-1">{suffix}</span>}
        </div>

        {(trend || caption) && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  trendPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trendPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {trend}
              </span>
            )}
            {caption && <span className="text-[#94A3B8]">{caption}</span>}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
