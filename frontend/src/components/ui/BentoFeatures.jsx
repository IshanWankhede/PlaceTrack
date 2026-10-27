import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard.jsx';
import { Check, ShieldCheck, Activity, BarChart2, Calendar, Sparkles } from 'lucide-react';

export default function BentoFeatures() {
  return (
    <section id="features" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3.5 py-1 rounded-full border border-violet-100">
          Core Capabilities
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl text-[#0B0B0F] mt-4 mb-3 tracking-tight">
          Everything campuses need.
        </h2>
        <p className="text-sm md:text-base text-[#64748B]">
          Engineered for effortless drives, zero paperwork, and maximum placement conversion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: Smart Eligibility (Large 7 cols) */}
        <div className="md:col-span-7">
          <GlassCard
            hoverEffect={true}
            glow="lavender"
            className="p-8 h-full flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-[#0B0B0F] mb-2">
                Smart Eligibility Verification
              </h3>
              <p className="text-sm text-[#64748B] max-w-md">
                Automated multi-factor checking: CGPA cutoff, departmental clearance, backlogs check, and required skill verification before one can click apply.
              </p>
            </div>

            {/* Mini Visual: Animated checklist with green checks */}
            <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/80 space-y-2.5">
              {[
                { label: 'Cumulative CGPA: 8.7 (Cutoff: 8.0)', passed: true },
                { label: 'Department: Computer Science & Eng.', passed: true },
                { label: 'Required: React, TypeScript, Node.js', passed: true },
                { label: 'Active Arrears / Backlogs: 0', passed: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#0B0B0F]">{item.label}</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Card 2: Live Application Tracking (5 cols) */}
        <div className="md:col-span-5">
          <GlassCard
            hoverEffect={true}
            glow="yellow"
            className="p-8 h-full flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-[#0B0B0F] mb-2">
                Live Tracking Stream
              </h3>
              <p className="text-sm text-[#64748B]">
                Real-time multi-stage pipeline status updates from application submission to final offer letter.
              </p>
            </div>

            {/* Mini Visual: Sliding status pills */}
            <div className="mt-8 space-y-2">
              <div className="p-3 bg-white/80 rounded-xl border border-black/5 flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold text-[#0B0B0F]">TechNova Solutions</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Interview Round 2
                </span>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-black/5 flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold text-[#0B0B0F]">CloudNest Systems</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Selected (14.5 LPA)
                </span>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-black/5 flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold text-[#0B0B0F]">DataWave Analytics</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Shortlisted
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Card 3: Interview Rounds Orchestration (5 cols) */}
        <div className="md:col-span-5">
          <GlassCard
            hoverEffect={true}
            glow="mint"
            className="p-8 h-full flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-[#0B0B0F] mb-2">
                Coordinated Rounds
              </h3>
              <p className="text-sm text-[#64748B]">
                Calendar scheduling, interviewer scorecards, and live slot bookings that eliminate missed rounds.
              </p>
            </div>

            {/* Mini Visual: Calendar slot card */}
            <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900">Virtual Room PT-82</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full">
                  In 45 mins
                </span>
              </div>
              <p className="text-xs text-[#0B0B0F] font-semibold">
                Tech & Architecture Review with VP Eng.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Card 4: Instant Analytics & Tier Distribution (7 cols) */}
        <div className="md:col-span-7">
          <GlassCard
            hoverEffect={true}
            glow="lavender"
            className="p-8 h-full flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-[#0B0B0F] mb-2">
                Instant Placement Analytics
              </h3>
              <p className="text-sm text-[#64748B] max-w-md">
                Continuous telemetry across department placement percentages, salary tier histograms, and recruiter recruitment funnels.
              </p>
            </div>

            {/* Mini Visual: Tiny line chart drawing itself */}
            <div className="mt-8 bg-white/80 p-4 rounded-2xl border border-black/5 flex items-end justify-between gap-3 h-28">
              {[35, 45, 60, 52, 75, 84, 96].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-violet-600 to-indigo-400 rounded-lg transition-all duration-500"
                    style={{ height: `${val}%` }}
                  />
                  <span className="text-[9px] text-[#94A3B8] font-bold">W{idx + 1}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </section>
  );
}
