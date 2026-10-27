import React from 'react';

export default function FunnelChart({ data = [] }) {
  const maxCount = data[0]?.count || 1;

  return (
    <div className="space-y-4 w-full">
      {data.map((stage, idx) => {
        const percentage = Math.round((stage.count / maxCount) * 100);
        return (
          <div key={stage.stage} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#0B0B0F]">{stage.stage}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B] tabular-nums font-normal">{stage.pct}</span>
                <span className="text-[#0B0B0F] font-bold tabular-nums">
                  {stage.count}
                </span>
              </div>
            </div>
            <div className="h-3 w-full bg-[#F1F1F4] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  background:
                    idx === 0
                      ? '#6366F1'
                      : idx === 1
                      ? '#8B5CF6'
                      : idx === 2
                      ? '#A78BFA'
                      : idx === 3
                      ? '#F5C451'
                      : '#10B981',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
