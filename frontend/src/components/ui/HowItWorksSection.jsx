import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard.jsx';
import { UserCheck, Sliders, CalendarCheck, Award, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create Verified Profile',
    desc: 'Students sync academic records, accredited credentials, and code repositories with automatic CGPA verification.',
    tag: 'Automated Sync',
    color: '#8B5CF6',
    preview: {
      type: 'profile',
      headline: 'Aarav Sharma · 21CS042',
      metric: '8.7 CGPA Verified',
      tags: ['React', 'Node.js', 'Python', 'AWS'],
    },
  },
  {
    number: '02',
    title: 'Smart Matching Engine',
    desc: 'Instant eligibility gatekeeper eliminates guesswork. Students only see and apply to jobs where they qualify.',
    tag: 'Zero Rejections for Cutoffs',
    color: '#6366F1',
    preview: {
      type: 'matching',
      headline: '100% Eligible: TechNova Solutions',
      metric: 'Threshold 8.0 · Your 8.7',
      tags: ['Fast-track Interview', 'Package 16.5 LPA'],
    },
  },
  {
    number: '03',
    title: 'Structured Interview Rounds',
    desc: 'Live schedule coordination, automated calendar invites, and instant panel scorecards without email chains.',
    tag: 'Real-time Updates',
    color: '#F5C451',
    preview: {
      type: 'interview',
      headline: 'System Design Round Scheduled',
      metric: 'Tomorrow 12:00 PM · Virtual Bay 2',
      tags: ['Dr. David Chen', 'Live Coding Ready'],
    },
  },
  {
    number: '04',
    title: 'Direct Placement & Offer',
    desc: 'One-click offer letter issuance, verified digital acceptance, and immediate placement celebration stream.',
    tag: 'One-click Acceptance',
    color: '#10B981',
    preview: {
      type: 'offer',
      headline: 'Official Offer: CloudNest Systems',
      metric: '14.5 LPA CTC Confirmed',
      tags: ['Offer Signed', 'Joining July 2027'],
    },
  },
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3.5 py-1 rounded-full border border-violet-100">
          The Process
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl text-[#0B0B0F] mt-4 mb-3 tracking-tight">
          How it works.
        </h2>
        <p className="text-sm md:text-base text-[#64748B]">
          From the initial drive announcement to final offer signing in 4 friction-free steps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Step Selector List */}
        <div className="lg:col-span-6 space-y-4">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-[28px] border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-white border-black/10 shadow-[0_16px_40px_-10px_rgba(11,11,15,0.08)] scale-[1.02]'
                    : 'bg-white/40 border-black/[0.04] hover:bg-white/70 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#0B0B0F] text-white'
                        : 'bg-black/5 text-[#64748B]'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                        {step.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#64748B] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Card Display */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-[36px] bg-gradient-to-tr from-[#EEF2FF] via-[#FAF5FF] to-[#FEF3C7] p-8 border border-white/80 shadow-[0_24px_60px_-15px_rgba(11,11,15,0.08)] flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-plus-grid opacity-30 pointer-events-none" />

            {/* Stepper indicator bar */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B0B0F] uppercase tracking-wider">
                Step {steps[activeStep].number} of 04
              </span>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeStep
                        ? 'w-8 bg-[#0B0B0F]'
                        : 'w-2.5 bg-black/15'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Visual Content with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 bg-white/85 backdrop-blur-xl rounded-[28px] p-6 border border-white/90 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: steps[activeStep].color }}
                  >
                    {activeStep === 0 && <UserCheck className="w-5 h-5" />}
                    {activeStep === 1 && <Sliders className="w-5 h-5" />}
                    {activeStep === 2 && <CalendarCheck className="w-5 h-5" />}
                    {activeStep === 3 && <Award className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-[#0B0B0F]">
                      {steps[activeStep].preview.headline}
                    </h4>
                    <p className="text-xs font-semibold text-emerald-600">
                      {steps[activeStep].preview.metric}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
                  {steps[activeStep].preview.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-3 py-1 bg-[#F1F1F4] text-[#475569] rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom info */}
            <div className="relative z-10 flex items-center justify-between text-xs text-[#64748B]">
              <span>Verified Campus Recruiter Network</span>
              <span className="flex items-center gap-1 font-semibold text-[#0B0B0F]">
                Automated Pipeline <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
