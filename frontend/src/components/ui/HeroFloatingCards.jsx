import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, Sparkles } from 'lucide-react';

export default function HeroFloatingCards({ mouseOffset = { x: 0, y: 0 } }) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 hidden sm:block">
      {/* 1. Student Progress Card (Top-Left of 3D Panel) */}
      <motion.div
        animate={{
          x: mouseOffset.x * 12,
          y: mouseOffset.y * 10,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="absolute top-4 -left-4 lg:-left-6 pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-white/90 backdrop-blur-xl border border-white/90 p-3.5 rounded-2xl shadow-[0_16px_36px_-10px_rgba(11,11,15,0.08)] w-52 transform -rotate-2 hover:rotate-0 transition-transform duration-300"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[11px] font-bold text-violet-700">
              PW
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B0B0F]">Palak W.</p>
              <p className="text-[10px] font-semibold text-[#64748B]">CGPA 8.7 · CSE</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-[#64748B]">Round 2 of 3</span>
              <span className="text-violet-600 font-bold">67%</span>
            </div>
            <div className="w-full h-1.5 bg-violet-100 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-violet-600 rounded-full" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 2. Interview Glass Card (Top-Right of 3D Panel) */}
      <motion.div
        animate={{
          x: -mouseOffset.x * 10,
          y: mouseOffset.y * 14,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="absolute top-6 -right-4 lg:-right-6 pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="bg-gradient-to-br from-[#EDE9FE]/95 to-white/95 backdrop-blur-xl border border-purple-200/60 p-3.5 rounded-2xl shadow-[0_16px_36px_-10px_rgba(139,92,246,0.12)] w-56 transform rotate-2 hover:rotate-0 transition-transform duration-300"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded-lg bg-violet-600 text-white">
              <Calendar className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-bold text-violet-900">
              TechNova Solutions
            </span>
          </div>
          <p className="text-xs font-semibold text-[#0B0B0F] mb-2">
            System Design Interview
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-violet-700 border border-violet-200/50">
              12:00 PM
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/50">
              Confirmed
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Black Pill "Offer received · 14.5 LPA" (Bottom-Left of 3D Panel) */}
      <motion.div
        animate={{
          x: mouseOffset.x * 10,
          y: -mouseOffset.y * 12,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="absolute bottom-6 -left-3 lg:-left-5 pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="bg-[#0B0B0F] text-white px-3.5 py-2 rounded-full shadow-[0_14px_30px_rgba(11,11,15,0.25)] flex items-center gap-2 transform -rotate-1 hover:rotate-0 transition-transform"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold tracking-tight">
            Offer received · <strong>14.5 LPA</strong>
          </span>
          <Award className="w-3 h-3 text-amber-300" />
        </motion.div>
      </motion.div>

      {/* 4. Purple Pill "Placed at CloudNest" (Bottom-Right of 3D Panel) */}
      <motion.div
        animate={{
          x: -mouseOffset.x * 14,
          y: -mouseOffset.y * 10,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="absolute bottom-4 -right-3 lg:-right-5 pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          className="bg-violet-600 text-white px-3.5 py-2 rounded-full shadow-[0_14px_30px_rgba(139,92,246,0.3)] flex items-center gap-1.5 transform rotate-2 hover:rotate-0 transition-transform"
        >
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <span className="text-xs font-semibold tracking-tight">
            Placed at <strong>CloudNest</strong>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
