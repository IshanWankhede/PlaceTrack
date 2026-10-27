import React from 'react';

export default function Skeleton({
  className = '',
  variant = 'rect', // 'rect' | 'circle' | 'text'
}) {
  const baseClasses = 'animate-pulse bg-black/[0.06]';

  const variantClasses = {
    rect: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  }[variant] || 'rounded-2xl';

  return <div className={`${baseClasses} ${variantClasses} ${className}`} />;
}
