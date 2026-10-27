import React from 'react';
import { Link } from 'react-router-dom';
import AuthScene from '../components/three/AuthScene.jsx';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#F6F6F8] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Soft ambient gradient glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Floating container card with 40px radius */}
      <div className="w-full max-w-5xl bg-white rounded-[36px] md:rounded-[44px] shadow-[0_24px_70px_-15px_rgba(11,11,15,0.08)] border border-black/[0.04] p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 min-h-[640px] relative z-10">
        
        {/* Left Side: 3D Scene in pastel rounded container */}
        <div className="lg:col-span-6 rounded-[28px] md:rounded-[36px] bg-gradient-to-br from-[#EEF2FF] via-[#F3E8FF] to-[#FEF3C7] relative overflow-hidden min-h-[320px] lg:min-h-full flex flex-col justify-between p-8 border border-white/60">
          {/* Subtle noise and glow */}
          <div className="absolute inset-0 bg-plus-grid opacity-30 pointer-events-none" />

          {/* Top badge */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-[#0B0B0F] text-white flex items-center justify-center font-display font-bold text-sm tracking-tighter">
                P.
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-[#0B0B0F]">
                PlaceTrack
              </span>
            </Link>

            <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 bg-white/70 backdrop-blur-md rounded-full text-[#64748B] border border-white/80">
              Campus 2026/27
            </span>
          </div>

          {/* Dedicated Three.js Scene */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AuthScene />
          </div>

          {/* Bottom testimonial/tagline */}
          <div className="relative z-10 bg-white/75 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-sm max-w-xs mx-auto lg:mx-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold text-[#0B0B0F]">
                18 active hiring drives
              </p>
            </div>
            <p className="text-[11px] text-[#64748B] leading-tight">
              Direct campus pipeline connecting students with top tier engineering teams.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
