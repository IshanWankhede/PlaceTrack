import React from 'react';
import { tokens } from '../../theme/tokens.js';

export default function StatusBadge({
  status = 'APPLIED',
  size = 'md',
  showDot = true,
  className = '',
}) {
  const normalized = (status || 'APPLIED').toLowerCase();
  const config =
    tokens.colors.status[normalized] || tokens.colors.status.applied;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-3 py-1 gap-1.5 font-semibold tracking-tight',
    lg: 'text-sm px-4 py-1.5 gap-2 font-semibold',
  }[size] || 'text-xs px-3 py-1 gap-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full select-none ${sizeClasses} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.dot }}
        />
      )}
      <span>{config.label || status}</span>
    </span>
  );
}
