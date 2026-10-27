import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  glow = 'none', // 'none' | 'lavender' | 'yellow' | 'mint'
  variant = 'glass', // 'glass' | 'white' | 'subtle' | 'dark'
  rounded = 'card', // 'card' (28px) | 'cardLg' (32px) | 'cardXl' (40px)
  onClick,
  ...props
}) {
  const roundedClasses = {
    card: 'rounded-[28px]',
    cardLg: 'rounded-[32px]',
    cardXl: 'rounded-[40px]',
    lg: 'rounded-2xl',
  }[rounded] || 'rounded-[28px]';

  const variantClasses = {
    glass:
      'bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_16px_40px_-12px_rgba(11,11,15,0.05)]',
    white:
      'bg-white border border-black/[0.06] shadow-[0_12px_36px_-10px_rgba(11,11,15,0.04)]',
    subtle:
      'bg-[#FBFBFC]/90 backdrop-blur-md border border-black/[0.04]',
    dark:
      'bg-[#0B0B0F] text-white border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]',
  }[variant] || 'bg-white/70 backdrop-blur-xl border border-white/80';

  const glowClasses = {
    none: '',
    lavender: 'shadow-[0_20px_50px_-15px_rgba(139,92,246,0.18)]',
    yellow: 'shadow-[0_20px_50px_-15px_rgba(245,196,81,0.18)]',
    mint: 'shadow-[0_20px_50px_-15px_rgba(16,185,129,0.18)]',
  }[glow] || '';

  const Component = hoverEffect ? motion.div : 'div';
  const motionProps = hoverEffect
    ? {
        whileHover: { y: -4, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
      }
    : {};

  return (
    <Component
      className={`relative overflow-hidden transition-shadow ${roundedClasses} ${variantClasses} ${glowClasses} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {/* Subtle inner top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      {children}
    </Component>
  );
}
