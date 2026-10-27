import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './Button.jsx';
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, Shield, User, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DashboardPreviewSection() {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 5, y: -2 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotate({
      x: ((centerY - y) / centerY) * 6,
      y: ((x - centerX) / centerX) * 6,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 4, y: 0 });
  };

  return (
    <section id="preview" className="py-24 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3.5 py-1 rounded-full border border-violet-100">
          Command Center
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl text-[#0B0B0F] mt-4 mb-3 tracking-tight">
          Purpose-built for speed.
        </h2>
        <p className="text-sm md:text-base text-[#64748B]">
          A clean, distraction-free environment that gives placement officers and students instant visibility.
        </p>
      </div>

      {/* 3D Tilting Browser Window */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="perspective-1000 flex justify-center"
      >
        <motion.div
          animate={{
            rotateX: rotate.x,
            rotateY: rotate.y,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="w-full max-w-5xl rounded-[32px] md:rounded-[40px] bg-white border border-black/10 shadow-[0_30px_90px_-20px_rgba(11,11,15,0.15)] overflow-hidden"
        >
          {/* Mock Browser Header */}
          <div className="px-6 py-4 bg-[#F8F8FA] border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="ml-4 px-4 py-1 rounded-full bg-white text-[11px] font-medium text-[#64748B] border border-black/5 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                placetrack.campus/dashboard/overview
              </div>
            </div>
            <Link
              to="/dashboard"
              className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              Live Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Browser Content Mock Preview */}
          <div className="p-6 md:p-8 bg-[#F9F9FB] space-y-6">
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-black/5 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-xl text-[#0B0B0F] mb-1">
                    Hello Ishan! 👋
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    18 recruitment drives are underway today. TechNova interview slots start at 12:00 PM.
                  </p>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-2xl font-display font-black text-[#0B0B0F]">
                    212
                  </span>
                  <p className="text-[10px] uppercase font-bold text-[#64748B]">
                    Students Placed
                  </p>
                </div>
              </div>

              <div className="md:col-span-4 bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-white/80">Placement Rate</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <span className="text-3xl font-display font-black">41.7%</span>
                  <p className="text-[10px] text-white/80 mt-0.5">+14% vs same week last year</p>
                </div>
              </div>
            </div>

            {/* Bottom sample table row */}
            <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-display font-bold text-sm text-[#0B0B0F]">
                  Active Drives Closing Soon
                </h5>
                <span className="text-xs font-semibold text-[#64748B]">Oct 2026</span>
              </div>
              <div className="divide-y divide-black/5">
                {[
                  { company: 'TechNova Solutions', role: 'Frontend Engineer', lpa: '16.5 LPA', applicants: 64, status: 'Active' },
                  { company: 'DataWave Analytics', role: 'ML Research Engineer', lpa: '18.0 LPA', applicants: 42, status: 'Shortlisting' },
                  { company: 'CloudNest Systems', role: 'Cloud SRE', lpa: '15.0 LPA', applicants: 51, status: 'Selected 8' },
                ].map((item, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#0B0B0F]">{item.company}</p>
                      <p className="text-[#64748B] text-[11px]">{item.role}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#0B0B0F]">{item.lpa}</span>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Two Column: For Students / For Staff */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* For Students */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-black/5 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
            <User className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            For Students
          </span>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-[#0B0B0F] mt-2 mb-3">
            Never miss an interview or eligibility cutoff.
          </h3>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            One clean dashboard that shows the exact criteria, deadline counters, round schedules, and instant offer letters with salary breakdowns.
          </p>
          <ul className="space-y-3 mb-8 text-xs font-semibold text-[#0B0B0F]">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Automated CGPA and skills criteria verification
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Real-time stage timeline from Shortlist to Offer
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Direct digital offer acceptance and placement certificate
            </li>
          </ul>
          <Link to={user ? "/dashboard/profile" : "/login"}>
            <Button variant="secondary" size="md">
              Explore Student Hub →
            </Button>
          </Link>
        </div>

        {/* For Staff */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-black/5 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
            For Placement Staff
          </span>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-[#0B0B0F] mt-2 mb-3">
            Run 50+ concurrent campus drives effortlessly.
          </h3>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            Eliminate endless spreadsheet chaos. Manage student cohorts, filter by department with instant exports, and track university placement metrics in real time.
          </p>
          <ul className="space-y-3 mb-8 text-xs font-semibold text-[#0B0B0F]">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              Automated batch eligibility filters & CSV exports
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              Interactive Kanban board for drag-and-drop applicant rounds
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              Executive placement dashboards and NIRF/accreditation reporting
            </li>
          </ul>
          <Link to={user ? "/dashboard/profile" : "/login"}>
            <Button variant="primary" size="md">
              Launch Staff Console →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
