import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import jobsService from '../../services/jobsService.js';
import applicationsService from '../../services/applicationsService.js';
import offersService from '../../services/offersService.js';
import { checkEligibility } from '../../services/eligibility.js';
import {
  Award,
  Sparkles,
  Calendar,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function StudentOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [jobsData, appsData, offersData] = await Promise.all([
          jobsService.getJobs({ page_size: 50 }).catch(() => ({ items: [] })),
          applicationsService.getMyApplications().catch(() => []),
          offersService.getMyOffers().catch(() => []),
        ]);
        const rawJobs = jobsData?.items || jobsData || [];
        setJobs(
          rawJobs.map((j) => ({
            ...j,
            company: j.company_name || j.company || 'Corporate Partner',
            package_lpa: j.package ? Number(j.package) : (j.package_lpa || 0),
            deadline: j.application_deadline || j.deadline || null,
          }))
        );
        setApplications(appsData || []);
        setOffers(offersData || []);
      } catch (err) {
        console.error('Failed to load student overview data:', err);
      }
    }
    load();
  }, [user?.id]);

  const openJobs = useMemo(
    () => jobs.filter((j) => (j.status || 'OPEN') === 'OPEN'),
    [jobs]
  );

  const eligibleCount = useMemo(() => {
    if (!user) return 0;
    return openJobs.filter((j) => checkEligibility(user, j).eligible).length;
  }, [openJobs, user]);

  const primaryOffer = offers[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-white via-white/90 to-[#EDE9FE] rounded-[32px] p-6 sm:p-8 border border-black/5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
              Student Placement Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              Role: STUDENT ({user?.id || 'student-rohit'})
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0B0B0F] mt-2 mb-1.5">
            Welcome, {user?.name || 'Rohit Verma'}! 🎓
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Roll: <span className="font-mono font-bold text-[#0B0B0F]">{user?.roll_number || '21EC015'}</span> · Dept: <strong className="text-[#0B0B0F]">{user?.department || 'Electronics & Comm.'}</strong> · Verified CGPA: <strong className="text-violet-700">{user?.cgpa ?? 8.2}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard/my-placement')}
            icon={Award}
          >
            My Placement Offers ({offers.length})
          </Button>
        </div>
      </div>

      {/* Offer Banner */}
      {primaryOffer && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-violet-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-xs text-emerald-950">
                Offer Letter Issued: {primaryOffer.company} ({primaryOffer.package || primaryOffer.package_lpa} LPA · {primaryOffer.tier} Tier) — Status: {primaryOffer.status || primaryOffer.offer_status}
              </p>
              <p className="text-[11px] text-emerald-800">
                Review base, bonus & ESOP breakdown or accept/decline under the single-offer policy.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard/my-placement')}
            icon={ArrowRight}
            iconPosition="right"
          >
            View Full Offer
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Open Campus Drives"
          value={openJobs.length || 0}
          suffix="Active"
          trend={`Eligible for ${eligibleCount} drives`}
          trendPositive={true}
          icon={Briefcase}
          accentColor="lavender"
        />
        <StatCard
          title="My Applications"
          value={applications.length}
          suffix="Submitted"
          trend="Live 5-stage round tracking"
          trendPositive={true}
          icon={Layers}
          accentColor="yellow"
        />
        <StatCard
          title="Active Interviews"
          value={
            applications.filter(
              (a) =>
                a.status === 'SHORTLISTED' ||
                a.status === 'INTERVIEW' ||
                a.status === 'ASSESSMENT'
            ).length
          }
          suffix="Scheduled"
          trend="Next round details in tracker"
          trendPositive={true}
          icon={Calendar}
          accentColor="mint"
        />
      </div>

      {/* Active Applications preview */}
      <GlassCard variant="white" className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
              My Application Pipeline ({user?.name})
            </h3>
            <p className="text-xs text-[#64748B]">
              Real-time progression across ongoing company recruitments
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/my-applications')}
          >
            Open Round Tracker →
          </Button>
        </div>

        {applications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No applications submitted for {user?.name} yet. Browse{' '}
            <button
              type="button"
              onClick={() => navigate('/dashboard/jobs')}
              className="font-bold text-violet-600 underline"
            >
              Available Jobs
            </button>{' '}
            to apply.
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {applications.map((app, index) => (
              <div
                key={`${app.application_id || app.id || index}-${index}`}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-xs text-[#0B0B0F]">{app.company}</p>
                  <p className="text-[11px] text-[#64748B]">
                    {app.job_title || app.title || app.job?.title || 'Applied Position'} · Current Stage: <strong>{app.current_round || app.status || 'Applied'}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-xs text-[#0B0B0F]">
                    {app.package || app.job?.package_lpa ? `${app.package || app.job?.package_lpa} LPA` : 'Competitive'}
                  </span>
                  <StatusBadge status={app.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
