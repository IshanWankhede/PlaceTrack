import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  CircleDot,
  History,
  UserCheck,
  Sparkles,
} from 'lucide-react';

const STATE_STYLES = {
  COMPLETED: {
    nodeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    cardBg: 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    lineBg: 'bg-emerald-500',
    label: 'Completed',
    Icon: CheckCircle2,
  },
  CURRENT: {
    nodeBg:
      'bg-violet-600 text-white border-violet-600 ring-4 ring-violet-200/80 shadow-sm',
    cardBg:
      'bg-violet-50/90 border-violet-300 ring-1 ring-violet-200/70 text-[#0B0B0F] shadow-xs',
    badgeBg: 'bg-violet-600 text-white',
    lineBg: 'bg-slate-200',
    label: 'Current Stage',
    Icon: CircleDot,
  },
  REJECTED: {
    nodeBg: 'bg-rose-600 text-white border-rose-600 ring-4 ring-rose-100',
    cardBg: 'bg-rose-50/80 border-rose-200 text-rose-950',
    badgeBg: 'bg-rose-100 text-rose-800',
    lineBg: 'bg-slate-200',
    label: 'Not Selected',
    Icon: XCircle,
  },
  CANCELLED: {
    nodeBg: 'bg-slate-300 text-slate-600 border-slate-300',
    cardBg: 'bg-slate-100/70 border-slate-200 text-slate-500',
    badgeBg: 'bg-slate-200 text-slate-600',
    lineBg: 'bg-slate-200',
    label: 'Cancelled / Closed',
    Icon: Ban,
  },
  UPCOMING: {
    nodeBg: 'bg-white text-slate-400 border-slate-200',
    cardBg: 'bg-[#FBFBFC] border-black/5 text-slate-500',
    badgeBg: 'bg-slate-100 text-slate-500',
    lineBg: 'bg-slate-200',
    label: 'Upcoming',
    Icon: Clock,
  },
};

export default function ApplicationTimeline({
  stages = [],
  statusHistory = [],
  showHistory = false,
  compact = false,
}) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Drive-Specific Stage Stepper */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            Drive-Specific Recruitment Timeline ({stages.length} Applicable Stages)
          </span>
          <div className="flex items-center gap-3 text-[10px] font-semibold text-[#64748B]">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-600" /> Current
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> Upcoming
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected
            </span>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 ${
            compact
              ? 'sm:grid-cols-2 lg:grid-cols-4'
              : 'sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
          } gap-2.5`}
        >
          {stages.map((st, idx) => {
            const cfg = STATE_STYLES[st.state] || STATE_STYLES.UPCOMING;
            const StateIcon = cfg.Icon;

            return (
              <div
                key={st.key || idx}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 transition-all relative ${cfg.cardBg}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${cfg.nodeBg}`}
                    >
                      <StateIcon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badgeBg}`}
                    >
                      {st.state_label || cfg.label}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-display font-bold leading-snug text-[#0B0B0F]">
                      {idx + 1}. {st.label}
                    </p>
                    {st.subtitle && (
                      <p className="text-[11px] font-medium text-[#475569] mt-0.5 leading-snug">
                        {st.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-1 text-[10px] text-[#64748B]">
                  <span className="font-mono truncate">
                    {st.timestamp || (st.state === 'UPCOMING' ? 'Not reached' : 'Recorded')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status History & Explanations Log */}
      {showHistory && statusHistory && statusHistory.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-black/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B0B0F] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-violet-600" />
              Verified Status History & Audit Trail
            </span>
            <span className="text-[10px] font-semibold text-[#64748B]">
              {statusHistory.length} recorded event{statusHistory.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {statusHistory.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="p-3 rounded-xl bg-white border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#0B0B0F]">
                      {entry.stage_label || entry.status}
                    </span>
                    <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                      {entry.status}
                    </span>
                    {entry.actor && (
                      <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        {entry.actor}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    {entry.explanation}
                  </p>
                </div>

                <span className="text-[10px] font-mono text-[#64748B] flex-shrink-0">
                  {entry.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
