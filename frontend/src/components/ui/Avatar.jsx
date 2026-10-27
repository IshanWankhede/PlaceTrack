import React, { useState } from 'react';

export default function Avatar({
  src,
  name = 'User',
  size = 'md',
  className = '',
  status = null, // 'online' | 'busy'
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-bold',
  }[size] || 'w-10 h-10 text-sm';

  const initials = (name || 'PT')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-flex flex-shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClasses} rounded-full overflow-hidden flex items-center justify-center font-display font-semibold bg-[#E2E8F0] text-[#334155] border-2 border-white shadow-sm`}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status === 'online' && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
      )}
    </div>
  );
}
