import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { mockApi } from '../../services/mockApi.js';
import { checkEligibility } from '../../services/eligibility.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  Download,
  Bell,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';

export default function StaffEligibleStudentsPage() {
  const { user, showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ELIGIBLE' | 'INELIGIBLE'
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [jobsData, stdData] = await Promise.all([
          mockApi.getJobs(),
          mockApi.getStudents(),
        ]);
        setJobs(jobsData);
        setStudents(stdData);
        if (jobsData.length > 0) {
          setSelectedJobId(jobsData[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) || jobs[0],
    [jobs, selectedJobId]
  );

  const evaluatedCohort = useMemo(() => {
    if (!selectedJob) return [];
    return students.map((std) => {
      const evaluation = checkEligibility(std, selectedJob);
      return {
        ...std,
        evaluation,
      };
    });
  }, [students, selectedJob]);

  const filteredCohort = useMemo(() => {
    return evaluatedCohort.filter((item) => {
      if (statusFilter === 'ELIGIBLE' && !item.evaluation.eligible) return false;
      if (statusFilter === 'INELIGIBLE' && item.evaluation.eligible) return false;
      if (deptFilter !== 'ALL' && item.department !== deptFilter) return false;
      return true;
    });
  }, [evaluatedCohort, statusFilter, deptFilter]);

  const eligibleStudents = evaluatedCohort.filter((c) => c.evaluation.eligible);

  const handleNotifyEligibleStudents = async () => {
    if (!selectedJob || eligibleStudents.length === 0) return;
    for (const std of eligibleStudents) {
      await mockApi.sendNotification({
        title: `You are Eligible: ${selectedJob.company} (${selectedJob.package_lpa} LPA)`,
        message: `Placement Staff verified your eligibility (${std.evaluation.matchPercent}% match) for ${selectedJob.title}. Apply before ${selectedJob.deadline}.`,
        type: 'info',
        target_role: 'STUDENT',
        student_id: std.id,
        sender_name: user?.name || 'Placement Staff (TPO)',
        link: '/dashboard/jobs',
      });
    }
    showToast(
      `Sent drive invitation alert to ${eligibleStudents.length} eligible student(s)`
    );
  };

  const handleExportShortlist = () => {
    if (!selectedJob) return;
    const headers = [
      'Student Name,Roll Number,Department,CGPA,Backlogs,Eligible,Match %,Gaps',
    ];
    const rows = filteredCohort.map(
      (s) =>
        `"${s.name}","${s.roll_number}","${s.department}",${s.cgpa},${
          s.active_backlogs ?? 0
        },${s.evaluation.eligible ? 'YES' : 'NO'},${s.evaluation.matchPercent}%,"${s.evaluation.failedRules
          .map((r) => r.label)
          .join('; ')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `Eligible_Cohort_${selectedJob.company.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported eligibility matrix for ${selectedJob.company}`);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            TPO Eligibility & Academic Audit
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            Eligible Students & Rule Verification
          </h2>
          <p className="text-xs text-[#64748B]">
            Audit student CGPA, active backlogs, branch, and skill proficiency rules against any recruitment drive
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={Bell}
            onClick={handleNotifyEligibleStudents}
          >
            Notify Eligible ({eligibleStudents.length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportShortlist}
          >
            Export Eligibility CSV
          </Button>
        </div>
      </div>

      {/* Drive Selector & KPI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <GlassCard variant="white" className="lg:col-span-6 p-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Select Recruitment Drive to Evaluate:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#F9F9FB] border border-black/15 font-display font-bold text-sm text-[#0B0B0F] outline-none"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.title} ({j.package_min_lpa || j.package_lpa}–
                {j.package_max_lpa || j.package_lpa} LPA · Min CGPA {j.min_cgpa})
              </option>
            ))}
          </select>
          {selectedJob && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#475569] pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 font-bold">
                Tier: {selectedJob.tier}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                Min CGPA: {selectedJob.min_cgpa}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                Max Backlogs: {selectedJob.max_backlogs ?? 0}
              </span>
            </div>
          )}
        </GlassCard>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Eligible Candidates"
            value={eligibleStudents.length}
            suffix={`/ ${evaluatedCohort.length}`}
            trend="Pass 100% of drive rules"
            trendPositive={true}
            icon={Users}
            accentColor="mint"
          />
          <StatCard
            title="Ineligible (Gaps Found)"
            value={evaluatedCohort.length - eligibleStudents.length}
            suffix="Students"
            trend="Missing CGPA, branch, or skill level"
            trendPositive={false}
            icon={Briefcase}
            accentColor="yellow"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-black/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#475569] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-violet-600" />
            Eligibility Filter:
          </span>
          {[
            { id: 'ALL', label: `All (${evaluatedCohort.length})` },
            { id: 'ELIGIBLE', label: `Eligible Only (${eligibleStudents.length})` },
            {
              id: 'INELIGIBLE',
              label: `Ineligible (${evaluatedCohort.length - eligibleStudents.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#0B0B0F] text-white'
                  : 'bg-white text-[#64748B] border border-black/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748B]">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-black/10 text-[#0B0B0F] outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Tech.">Information Tech.</option>
            <option value="Electronics & Comm.">Electronics & Comm.</option>
            <option value="Mechanical Eng.">Mechanical Eng.</option>
          </select>
        </div>
      </div>

      {/* Candidate Rule Evaluation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCohort.map((student) => {
          const { eligible, matchPercent, rules } = student.evaluation;
          return (
            <GlassCard key={student.id} variant="white" className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={student.photo_url || student.avatar}
                    name={student.name}
                    size="sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-[#0B0B0F]">
                        {student.name}
                      </h4>
                      {student.cgpa_verified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B]">
                      {student.roll_number} · {student.department} · CGPA{' '}
                      <strong className="text-[#0B0B0F]">{student.cgpa}</strong> · Backlogs:{' '}
                      {student.active_backlogs ?? 0}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {eligible ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Eligible · {matchPercent}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      <XCircle className="w-3.5 h-3.5" />
                      Ineligible
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-black/5">
                {rules.map((r, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] flex items-center justify-between gap-2 ${
                      r.passed
                        ? 'bg-emerald-50/70 text-emerald-900'
                        : 'bg-rose-50/80 text-rose-900 font-semibold'
                    }`}
                  >
                    <span className="truncate">{r.label}</span>
                    {r.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t border-black/5 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#64748B]">
                  Direct Candidate Outreach:
                </span>
                <ContactActionButtons
                  compact
                  target={{
                    id: student.id,
                    name: student.name,
                    role: 'STUDENT',
                    phone: student.phone,
                    email: student.email,
                    subtitle: `${student.roll_number} · ${student.department}`,
                  }}
                  subject={`Drive Eligibility (${selectedJob?.company}) — ${student.name}`}
                />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
