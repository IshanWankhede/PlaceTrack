import React from 'react';
import { motion } from 'framer-motion';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  variant = 'pill', // 'pill' | 'underline'
}) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-full ${
        variant === 'pill' ? 'bg-[#ECECEF]/80 backdrop-blur-md' : 'border-b border-black/10'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-1.5 text-xs md:text-sm font-semibold rounded-full transition-colors select-none z-10 ${
              isActive ? 'text-[#0B0B0F]' : 'text-[#64748B] hover:text-[#0B0B0F]'
            }`}
          >
            {isActive && variant === 'pill' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
                style={{ zIndex: -1 }}
              />
            )}
            {isActive && variant === 'underline' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0B0B0F]"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="flex items-center gap-1.5">
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#0B0B0F] text-white' : 'bg-black/5 text-[#64748B]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
