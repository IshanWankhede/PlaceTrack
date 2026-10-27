import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-black/[0.06] relative overflow-hidden">

      {/* Main Footer links and copyright */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#64748B]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#0B0B0F] text-white flex items-center justify-center font-display font-bold text-xs">
            P.
          </div>
          <span className="font-display font-bold text-base text-[#0B0B0F] tracking-tight">
            PlaceTrack
          </span>
          <span className="text-slate-300">|</span>
          <span>© 2026 PlaceTrack Technologies Inc. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <a href="#how-it-works" className="hover:text-[#0B0B0F] transition-colors">
            Process
          </a>
          <a href="#features" className="hover:text-[#0B0B0F] transition-colors">
            Features
          </a>
          <Link to="/login" className="hover:text-[#0B0B0F] transition-colors">
            Staff Portal
          </Link>
          <Link to="/login" className="hover:text-[#0B0B0F] transition-colors">
            Student Access
          </Link>
        </div>
      </div>
    </footer>
  );
}
