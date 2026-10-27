import React from 'react';
import MagneticButton from './MagneticButton.jsx';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  magnetic = false,
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none whitespace-nowrap cursor-pointer';

  const variants = {
    primary:
      'bg-[#0B0B0F] text-white hover:bg-[#1A1A22] shadow-[0_4px_14px_0_rgba(11,11,15,0.25)] hover:shadow-[0_6px_20px_rgba(11,11,15,0.35)]',
    secondary:
      'bg-white text-[#0B0B0F] border border-black/10 hover:border-black/20 hover:bg-[#F9F9FB] shadow-[0_2px_8px_rgba(11,11,15,0.04)]',
    outline:
      'bg-white text-[#0B0B0F] border border-black/15 hover:border-black/30 hover:bg-[#F9F9FB] shadow-[0_2px_8px_rgba(11,11,15,0.04)]',
    glass:
      'bg-white/70 backdrop-blur-md text-[#0B0B0F] border border-white/80 hover:bg-white/90 shadow-[0_8px_24px_rgba(11,11,15,0.06)]',
    ghost:
      'bg-transparent text-[#0B0B0F] hover:bg-black/5 hover:text-black',
    accent:
      'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-[0_4px_16px_rgba(139,92,246,0.35)]',
    danger:
      'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-5 py-2.5 gap-2 font-medium tracking-tight',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    icon: 'p-2.5 rounded-full aspect-square',
  };

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      ) : null}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  const combinedClasses = `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className} group`;

  if (magnetic && !disabled && !loading) {
    return (
      <MagneticButton
        className={combinedClasses}
        onClick={onClick}
        type={type}
        {...props}
      >
        {content}
      </MagneticButton>
    );
  }

  return (
    <button
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {content}
    </button>
  );
}
