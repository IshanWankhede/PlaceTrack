import React from 'react';

const STATUS_LABELS = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

const STAGE_COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#F5C451', '#F87171', '#94A3B8'];

/**
 * FunnelChart
 *
 * Accepts data from EITHER the mockApi shape (keys: stage, count, pct) or the
 * real API shape (keys: status, count). Computes conversion % from the first stage.
 */
export default function FunnelChart({ data = [] }) {
  const maxCount = data[0]?.count || 1;

  return (
    <div className="space-y-4 w-full">
      {data.map((raw, idx) => {
        const label = raw.stage ?? STATUS_LABELS[raw.status] ?? raw.status ?? '–';
        const pct = raw.pct ?? `${Math.round((raw.count / maxCount) * 100)}%`;
        const barWidth = Math.round((raw.count / maxCount) * 100);
        return (
          <div key={raw.stage ?? raw.status ?? idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#0B0B0F]">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B] tabular-nums font-normal">{pct}</span>
                <span className="text-[#0B0B0F] font-bold tabular-nums">
                  {raw.count}
                </span>
              </div>
            </div>
            <div className="h-3 w-full bg-[#F1F1F4] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${barWidth}%`,
                  background: STAGE_COLORS[idx % STAGE_COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
