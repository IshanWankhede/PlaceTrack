import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockApi } from '../../services/mockApi.js';
import { checkEligibility } from '../../services/eligibility.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Briefcase,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function StudentProgressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [offers, setOffers] = useState([]);
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const studentId = user?.id || 'student-rohit';
        const [jData, aData, oData, pData] = await Promise.all([
          mockApi.getJobs(),
          mockApi.getApplications(),
          mockApi.getOffers(studentId),
          mockApi.getPolicies(),
        ]);
        setJobs(jData);
        setApplications(
          aData.filter((a) => (a.student_id || a.studentId) === studentId)
        );
        setOffers(oData);
        setPolicies(pData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const eligibilitySummary = useMemo(() => {
    if (!user || jobs.length === 0) return { eligibleCount: 0, totalOpen: 0 };
    const open = jobs.filter((j) => (j.status || 'OPEN') === 'OPEN');
    const eligibleCount = open.filter((j) => checkEligibility(user, j).eligible).length;
    return { eligibleCount, totalOpen: open.length };
  }, [user, jobs]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const acceptedOffer = offers.find((o) => o.offer_status === 'ACCEPTED');

  const milestones = [
    {
      step: 1,
      title: 'CDC Academic Verification',
      subtitle: `CGPA ${user?.cgpa ?? 8.2} · ${user?.active_backlogs ?? 0} Backlogs`,
      done: Boolean(user?.cgpa_verified ?? true),
      link: '/dashboard/profile',
    },
    {
      step: 2,
      title: 'Skills & Proficiency Matrix',
      subtitle: `${(user?.skill_proficiencies || user?.skills || []).length} Verified Skills Configured`,
      done: (user?.skill_proficiencies || user?.skills || []).length >= 3,
      link: '/dashboard/profile',
    },
    {
      step: 3,
      title: 'Campus Drive Applications',
      subtitle: `${applications.length} Submitted (${eligibilitySummary.eligibleCount}/${eligibilitySummary.totalOpen} Drives Eligible)`,
      done: applications.length > 0,
      link: '/dashboard/jobs',
    },
    {
      step: 4,
      title: 'Technical & HR Evaluations',
      subtitle: `${
        applications.filter(
          (a) => a.status === 'INTERVIEW' || a.status === 'SELECTED'
        ).length
      } Active/Cleared Interview Pipelines`,
      done: applications.some(
        (a) => a.status === 'INTERVIEW' || a.status === 'SELECTED'
      ),
      link: '/dashboard/my-interviews',
    },
    {
      step: 5,
      title: 'Official Placement Offer',
      subtitle: acceptedOffer
        ? `Accepted: ${acceptedOffer.company} (${acceptedOffer.package_lpa} LPA)`
        : offers.length > 0
        ? `${offers.length} Offer(s) Awaiting Decision`
        : 'In Progress',
      done: Boolean(acceptedOffer),
      link: '/dashboard/my-placement',
    },
  ];

  const completedSteps = milestones.filter((m) => m.done).length;
  const completionPct = Math.round((completedSteps / milestones.length) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-100 text-violet-800">
            Personal Placement Journey
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            My Placement Progress ({user?.name})
          </h2>
          <p className="text-xs text-[#64748B]">
            End-to-end milestone completion, drive eligibility coverage, and institutional policy status
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-[#0B0B0F] text-white text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Overall Journey Completion: {completionPct}%</span>
        </div>
      </div>

      {/* 5-Stage Milestone Stepper */}
      <GlassCard variant="white" className="p-6 md:p-8 space-y-6">
        <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
          5-Stage Campus Placement Readiness & Outcome Tracker
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {milestones.map((m) => (
            <div
              key={m.step}
              onClick={() => navigate(m.link)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                m.done
                  ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50'
                  : 'bg-slate-50 border-black/5 hover:border-black/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Stage 0{m.step}
                </span>
                {m.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-[#0B0B0F]">
                  {m.title}
                </h4>
                <p className="text-[11px] text-[#64748B] mt-1">{m.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Active Policy & Eligibility Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard variant="white" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-base text-[#0B0B0F]">
              Drive Eligibility Snapshot
            </h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard/jobs')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Browse Drives
            </Button>
          </div>
          <p className="text-xs text-[#64748B]">
            Based on your verified CGPA ({user?.cgpa ?? 8.2}) and skill proficiencies, you currently qualify for{' '}
            <strong className="text-emerald-700">
              {eligibilitySummary.eligibleCount} of {eligibilitySummary.totalOpen}
            </strong>{' '}
            open recruitment drives.
          </p>
        </GlassCard>

        {policies && (
          <GlassCard variant="white" className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <h4 className="font-display font-bold text-base text-[#0B0B0F]">
                Active Institutional Placement Policy ({policies.academic_year})
              </h4>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              {policies.policy_note}
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold pt-1">
              <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                Dream ≥ {policies.dream_tier_min_lpa} LPA
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">
                Super Dream ≥ {policies.super_dream_tier_min_lpa} LPA
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Decision Window: {policies.offer_decision_window_hours}h
              </span>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
