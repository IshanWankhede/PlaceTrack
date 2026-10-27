import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import StatisticsLineChart from '../../components/charts/StatisticsLineChart.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Users,
  Briefcase,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react';

export default function AdminOverview({ roleVariant = 'ADMIN' }) {
  const navigate = useNavigate();
  const { activeDemoUser: user, activeDemoRole: activeRole } = useAuth();
  const effectiveRole = roleVariant || activeRole || 'ADMIN';
  const isStaff = effectiveRole === 'STAFF';

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeJobTab, setActiveJobTab] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [anData, jobsData, stdData] = await Promise.all([
          mockApi.getAnalytics(),
          mockApi.getJobs(),
          mockApi.getStudents(),
        ]);
        setAnalytics(anData);
        setJobs(jobsData);
        setStudents(stdData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    if (activeJobTab === 'top') return j.package_lpa >= 16;
    if (activeJobTab === 'closing')
      return (
        j.status === 'CLOSING_SOON' ||
        ((j.status || 'OPEN') === 'OPEN' && j.deadline && j.deadline <= '2026-11-15')
      );
    if (activeJobTab === 'new') return j.openings >= 6;
    return true;
  });

  const unverifiedCgpaCount = students.filter((s) => !s.cgpa_verified).length;
  const inInterviewCount = students.filter(
    (s) => s.placement_status === 'In Interview' || s.status === 'IN_INTERVIEW'
  ).length;

  if (loading || !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-black/5 rounded-3xl" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-32 bg-black/5 rounded-3xl" />
          <div className="h-32 bg-black/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  const firstName = (user?.name || (isStaff ? 'Raghav' : 'Ishan')).split(' ')[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Row: Greeting Card + Next Drive Quick Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Greeting Card with inline line-art doodle */}
        <div className="lg:col-span-8 bg-gradient-to-r from-white via-white/90 to-[#F5F3FF] rounded-[32px] p-6 sm:p-8 border border-black/5 shadow-[0_12px_36px_-10px_rgba(11,11,15,0.04)] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-lg z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
                {isStaff
                  ? 'TPO Operations & Drive Desk'
                  : 'Executive Campus Recruitment Console'}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  isStaff
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                Role: {effectiveRole} ({user?.id})
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0B0B0F] mt-2 mb-1.5">
              Hello {firstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {isStaff ? (
                <>
                  As <strong>{user?.title || 'Senior Placement Coordinator'}</strong>, you have{' '}
                  <strong>{inInterviewCount} candidates</strong> in live interview rounds today and{' '}
                  <strong>{unverifiedCgpaCount} student transcripts</strong> awaiting TPO CGPA verification.
                </>
              ) : (
                <>
                  As <strong>{user?.title || 'Dean of Corporate Relations'}</strong>, 18 corporate partners are interviewing across 4 departments today. 42 student offers are ready for executive sign-off.
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              {isStaff ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ClipboardCheck}
                    onClick={() => navigate('/dashboard/students')}
                  >
                    Verify Student CGPAs ({unverifiedCgpaCount})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/dashboard/applications')}
                  >
                    Manage Interview Rounds
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={BarChart3}
                    onClick={() => navigate('/dashboard/analytics')}
                  >
                    Executive Analytics
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/dashboard/placements')}
                  >
                    Review Confirmed Offers
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Friendly Line-Art Illustration (waving doodle character) */}
          <div className="relative z-10 w-36 h-32 flex-shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full text-[#0B0B0F]"
              viewBox="0 0 160 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head */}
              <circle cx="80" cy="45" r="28" stroke="currentColor" strokeWidth="3" fill="#FFFFFF" />
              {/* Smiling Eyes */}
              <path d="M70 42C72 38 76 38 78 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M86 42C88 38 92 38 94 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              {/* Smile */}
              <path d="M75 54C78 60 86 60 89 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              {/* Glasses rim */}
              <rect x="65" y="36" width="16" height="13" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="83" y="36" width="16" height="13" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="81" y1="42" x2="83" y2="42" stroke="currentColor" strokeWidth="2" />
              {/* Body */}
              <path
                d="M48 115C48 90 62 82 80 82C98 82 112 90 112 115"
                stroke="currentColor"
                strokeWidth="3"
                fill={isStaff ? '#DBEAFE' : '#EDE9FE'}
              />
              {/* Waving Arm */}
              <path d="M106 88C116 80 126 65 132 50C133 46 138 48 136 53C130 72 116 95 106 102" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              {/* Sparkle badge */}
              <path d="M30 35L33 42L40 45L33 48L30 55L27 48L20 45L27 42Z" fill="#F5C451" />
            </svg>
          </div>
        </div>

        {/* Next Drive Quick Card with Circular Progress & Black Continue Pill */}
        <div className="lg:col-span-4 bg-white rounded-[32px] p-6 border border-black/5 shadow-[0_12px_36px_-10px_rgba(11,11,15,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              {isStaff ? 'Assigned TPO Room' : 'Next Live Drive'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Live in 35m
            </span>
          </div>

          <div className="my-2 flex items-center gap-4">
            {/* Circular progress SVG */}
            <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="#F1F1F4"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="#8B5CF6"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  strokeDashoffset="24"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute font-display font-bold text-xs text-[#0B0B0F]">
                73%
              </span>
            </div>

            <div>
              <h4 className="font-display font-bold text-sm text-[#0B0B0F]">
                TechNova Solutions
              </h4>
              <p className="text-[11px] text-[#64748B]">
                {isStaff
                  ? 'CDC Seminar Hall B · Panelist Check-In'
                  : 'Round 2 System Architecture · 64 Candidates'}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard/applications')}
            className="w-full justify-between"
            icon={ArrowRight}
            iconPosition="right"
          >
            <span>{isStaff ? 'Coordinate Round Tracker' : 'Continue Drive'}</span>
          </Button>
        </div>
      </div>

      {/* Two Big Number Cards + Placement Rate Ring Promo Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={isStaff ? 'Candidates In Interview' : 'Students Placed'}
          value={isStaff ? inInterviewCount : analytics.summary.studentsPlaced}
          suffix={
            isStaff
              ? `/ ${students.length} Cohort`
              : `/ ${analytics.summary.totalEligibleStudents}`
          }
          trend={isStaff ? `${unverifiedCgpaCount} CGPAs pending verification` : '+18.4% vs last year'}
          trendPositive={true}
          icon={Users}
          accentColor="lavender"
          caption={isStaff ? 'Active technical & HR panels' : 'Verified placement records'}
        />

        <StatCard
          title="Drives Open"
          value={analytics.summary.drivesOpen}
          suffix="Active"
          trend="4 Closing this week"
          trendPositive={true}
          icon={Briefcase}
          accentColor="yellow"
          caption="Avg package 14.8 LPA"
        />

        {/* Placement Rate with small animated ring */}
        <GlassCard variant="white" className="p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
              {isStaff ? 'Transcript Verification' : 'Placement Rate'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#0B0B0F] tabular-nums">
                {isStaff
                  ? `${Math.round(((students.length - unverifiedCgpaCount) / Math.max(students.length, 1)) * 100)}%`
                  : `${analytics.summary.placement_rate_percent ?? analytics.summary.placementRatePercent ?? 41.7}%`}
              </span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {isStaff
                ? `${students.length - unverifiedCgpaCount} of ${students.length} Verified by CDC`
                : 'Target 85% by Dec 2026'}
            </p>
          </div>

          {/* Small animated progress ring */}
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                stroke="#F1F1F4"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="88"
                strokeDashoffset={
                  isStaff
                    ? Math.round(
                        88 -
                          (88 *
                            Math.round(
                              ((students.length - unverifiedCgpaCount) /
                                Math.max(students.length, 1)) *
                                100
                            )) /
                            100
                      )
                    : Math.round(
                        88 -
                          (88 *
                            (analytics.summary.placement_rate_percent ??
                              analytics.summary.placementRatePercent ??
                              41.7)) /
                            100
                      )
                }
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <Sparkles className="w-5 h-5 text-emerald-500 absolute" />
          </div>
        </GlassCard>
      </div>

      {/* "Your Statistics" Line Chart with smooth curve & black tooltip */}
      <GlassCard variant="white" className="p-6 md:p-8">
        <StatisticsLineChart
          dataWeekly={analytics.trendWeekly}
          dataMonthly={analytics.trendMonthly}
        />
      </GlassCard>

      {/* Rows of Jobs / Drives with Tabs */}
      <GlassCard variant="white" className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-xl text-[#0B0B0F]">
              Corporate Hiring Drives
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Current campus recruitments accepting eligible candidate profiles
            </p>
          </div>

          <Tabs
            tabs={[
              { id: 'all', label: 'All' },
              { id: 'new', label: 'Newest' },
              { id: 'top', label: 'Top Paying' },
              { id: 'closing', label: 'Closing Soon' },
            ]}
            activeTab={activeJobTab}
            onChange={setActiveJobTab}
          />
        </div>

        <div className="divide-y divide-black/5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9F9FB] px-3 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#EEF2FF] to-[#FAF5FF] border border-black/5 flex items-center justify-center font-display font-bold text-xs text-[#6366F1] flex-shrink-0">
                  {job.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-[#0B0B0F]">
                    {job.title}
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    by <span className="font-semibold text-[#0B0B0F]">{job.company}</span> · {job.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="text-right">
                  <p className="font-display font-bold text-sm text-[#0B0B0F]">
                    {job.package_lpa} LPA
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {job.appliedCount} applicants
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/dashboard/jobs')}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
