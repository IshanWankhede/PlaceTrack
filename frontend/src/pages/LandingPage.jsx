import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import HeroScene from '../components/three/HeroScene.jsx';
import HeroFloatingCards from '../components/ui/HeroFloatingCards.jsx';
import SplitText from '../components/ui/SplitText.jsx';
import Button from '../components/ui/Button.jsx';
import CompanyMarquee from '../components/ui/CompanyMarquee.jsx';
import HowItWorksSection from '../components/ui/HowItWorksSection.jsx';
import BentoFeatures from '../components/ui/BentoFeatures.jsx';
import StatsBand from '../components/ui/StatsBand.jsx';
import DashboardPreviewSection from '../components/ui/DashboardPreviewSection.jsx';
import Footer from '../components/layout/Footer.jsx';
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Users } from 'lucide-react';
import { useLenisScroll } from '../hooks/useLenisScroll.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  useLenisScroll();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard/profile');
    } else {
      navigate('/login');
    }
  };

  const handleHeroMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) / (width / 2);
    const y = (clientY - (top + height / 2)) / (height / 2);
    setMouseOffset({ x, y });
  };

  return (
    <div className="relative min-h-screen bg-[#F6F6F8] text-[#0B0B0F] overflow-x-hidden">
      {/* Floating glass pill navigation */}
      <Navbar />

      {/* HERO SECTION: High-impact split layout */}
      <section
        onMouseMove={handleHeroMouseMove}
        className="relative min-h-[92vh] flex items-center px-4 sm:px-6 lg:px-8 pt-28 pb-16 bg-plus-grid bg-hero-glow overflow-hidden select-none"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center z-10">
          
          {/* LEFT COLUMN: Headings, Value Props, Buttons */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Announcement pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/10 shadow-sm text-xs font-semibold text-[#0B0B0F]">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Season 2026/27 Live</span>
              <span className="text-slate-300">·</span>
              <span className="text-violet-600 font-bold">58+ Drives Active</span>
            </div>

            {/* Split Headline with high contrast styling */}
            <h1 className="font-display font-extrabold tracking-tight leading-[1.08] text-4xl sm:text-5xl md:text-6xl lg:text-[68px] text-[#0B0B0F]">
              <div className="block">
                <SplitText delay={0.1}>Placements.</SplitText>
              </div>
              <div className="block bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent py-1">
                <SplitText delay={0.3}>Made effortless.</SplitText>
              </div>
              <div className="block text-[#0B0B0F]">
                <SplitText delay={0.5}>From campus to career.</SplitText>
              </div>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#475569] max-w-xl font-normal leading-relaxed">
              The unified placement workspace connecting students, recruiters, and career advancement cells — with automated eligibility checks, live round tracking, and verified offer letters.
            </p>

            {/* Action Buttons: Magnetic Black Pill + Secondary Glass Pill */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                magnetic={true}
                onClick={handleGetStarted}
                icon={ArrowRight}
                iconPosition="right"
                className="px-8 shadow-xl text-sm font-bold"
              >
                Get started
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 text-sm font-semibold"
              >
                Explore drives
              </Button>
            </div>

            {/* Trust feature points */}
            <div className="pt-6 border-t border-black/[0.06] flex flex-wrap items-center gap-6 text-xs font-semibold text-[#475569]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Auto CGPA Screening</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Live Interview Stages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>212+ Placed Students</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D Student Workstation Scene */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Rounded Glass Frame for 3D Scene */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] max-w-[500px] rounded-[36px] md:rounded-[44px] bg-gradient-to-tr from-[#EEF2FF] via-[#F5F3FF] to-[#FEF3C7] border border-white/90 shadow-[0_24px_70px_-15px_rgba(11,11,15,0.08)] overflow-visible">
              
              {/* Subtle inner grid accent */}
              <div className="absolute inset-0 bg-plus-grid opacity-25 pointer-events-none rounded-[44px]" />

              {/* Floating Placement Cards docked around the 3D model */}
              <HeroFloatingCards mouseOffset={mouseOffset} />

              {/* 3D Student Preparing for Placement */}
              <div className="absolute inset-0 flex items-center justify-center">
                <HeroScene />
              </div>



            </div>

          </div>

        </div>
      </section>

      {/* Infinite Company Marquee Strip */}
      <CompanyMarquee />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Bento Grid Features */}
      <BentoFeatures />

      {/* Animated Stats Band */}
      <StatsBand />

      {/* 3D Dashboard Preview */}
      <DashboardPreviewSection />

      {/* Footer & CTA */}
      <Footer />
    </div>
  );
}
