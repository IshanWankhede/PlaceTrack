import React from 'react';
import Button from './Button.jsx';
import { Sparkles } from 'lucide-react';

export default function EmptyState({
  title = 'No records to display',
  description = 'Try adjusting your search criteria or create a new entry.',
  actionLabel = null,
  onAction = null,
  icon: Icon = Sparkles,
  className = '',
}) {
  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center max-w-sm mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-display font-bold text-lg text-[#0B0B0F] mb-1">
        {title}
      </h4>
      <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
