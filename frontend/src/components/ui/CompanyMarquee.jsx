import React from 'react';
import { motion } from 'framer-motion';

const companies = [
  'TechNova Solutions',
  'DataWave Analytics',
  'CloudNest Systems',
  'Mechano Dynamics',
  'Embedded Edge Labs',
  'Aether Cognitive',
  'HyperScale Labs',
  'QuantPulse Micro',
];

export default function CompanyMarquee() {
  return (
    <div className="relative w-full py-8 overflow-hidden border-y border-black/[0.06] bg-white/40 backdrop-blur-sm select-none">
      {/* Edge gradient fade masks */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-24 md:w-44 bg-gradient-to-r from-[#F6F6F8] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-24 md:w-44 bg-gradient-to-l from-[#F6F6F8] to-transparent z-10" />

      <div className="flex w-max">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="flex items-center gap-14 md:gap-20 whitespace-nowrap"
        >
          {[...companies, ...companies].map((company, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-slate-400 hover:text-[#0B0B0F] transition-colors cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="font-display font-bold text-sm md:text-base tracking-wider uppercase opacity-80 hover:opacity-100">
                {company}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
