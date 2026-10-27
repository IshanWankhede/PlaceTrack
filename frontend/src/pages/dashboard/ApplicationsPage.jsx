import React, { useState, useEffect, useMemo } from 'react';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import ApplicationTimeline from '../../components/ui/ApplicationTimeline.jsx';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';
import { MeetingLinkButton } from '../../components/ui/MeetingLinkButton.jsx';
import { downloadDemoResumePdf } from '../../utils/offerPdfGenerator.js';
import { evaluateInterviewMeetingLink } from '../../utils/interactionHelpers.js';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Award,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Plus,
  Layers,
  LayoutGrid,
  FileText,
} from 'lucide-react';

const ROUND_OPTIONS = ['Online Test', 'Technical 1', 'Technical 2', 'HR', 'Offer'];

export default function ApplicationsPage() {
  const { user, activeDemoRole, showToast } = useAuth();
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [driveFilter, setDriveFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Consequential Status Transition Confirmation Modal
  const [transitionModal, setTransitionModal] = useState({
    isOpen: false,
    app: null,
    targetStatus: 'SHORTLISTED',
    roundName: 'Technical 1',
    explanation: '',
  });

  // Schedule Interview Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedRound, setSchedRound] = useState('Technical 1');
  const [schedDate, setSchedDate] = useState('2026-10-29');
  const [schedTime, setSchedTime] = useState('11:00 AM');
  const [schedTimezone, setSchedTimezone] = useState('IST (UTC+5:30)');
  const [schedMode, setSchedMode] = useState('ONLINE');
  const [schedVenue, setSchedVenue] = useState('Virtual Room PT-104 (Online Bridge)');
  const [schedLink, setSchedLink] = useState('https://example.com/placetrack-demo-interview/panel-room-104');
  const [schedPanelists, setSchedPanelists] = useState(
    'David Chen (VP Eng), Anjali Menon (Principal Architect)'
  );
  const [schedNotes, setSchedNotes] = useState(
    'Live technical problem solving and system architecture walkthrough.'
  );

  // Interview Result Entry Modal
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [evalInterview, setEvalInterview] = useState(null);
  const [evalAttendance, setEvalAttendance] = useState('PRESENT');
  const [evalResult, setEvalResult] = useState('PASSED');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalPromoteSelected, setEvalPromoteSelected] = useState(false);

  // Offer Processing Modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerBase, setOfferBase] = useState('13.5');
  const [offerBonus, setOfferBonus] = useState('2.5');
  const [offerEsop, setOfferEsop] = useState('2.0');
  const [offerDeadline, setOfferDeadline] = useState('2026-11-08');
  const [offerJoining, setOfferJoining] = useState('July 15, 2027');

  const loadData = async (preserveSelectedId = null) => {
    try {
      const [appsData, jobsData] = await Promise.all([
        mockApi.getApplications(),
        mockApi.getJobs(),
      ]);
      setApplications(appsData);
      setJobs(jobsData);
      const targetId = preserveSelectedId || selectedAppId;
      if (targetId && appsData.some((a) => a.id === targetId)) {
        setSelectedAppId(targetId);
      } else if (appsData.length > 0) {
        // Default to Rohit Verma's active interview application for clear demo inspection
        const rohitApp = appsData.find((a) => a.id === 'app-904') || appsData[0];
        setSelectedAppId(rohitApp.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedApp = useMemo(
    () => applications.find((a) => a.id === selectedAppId) || applications[0] || null,
    [applications, selectedAppId]
  );

  const uniqueCompanies = useMemo(
    () => Array.from(new Set(applications.map((a) => a.company))).filter(Boolean),
    [applications]
  );

  const uniqueDepartments = useMemo(
    () =>
      Array.from(
        new Set(applications.map((a) => a.student?.department))
      ).filter(Boolean),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mStudent = (app.student?.name || '').toLowerCase().includes(q);
        const mRoll = (app.student?.roll_number || '').toLowerCase().includes(q);
        const mCompany = (app.company || '').toLowerCase().includes(q);
        const mTitle = (app.job?.title || '').toLowerCase().includes(q);
        const mId = (app.id || '').toLowerCase().includes(q);
        if (!mStudent && !mRoll && !mCompany && !mTitle && !mId) return false;
      }
      if (companyFilter !== 'ALL' && app.company !== companyFilter) return false;
      if (driveFilter !== 'ALL' && (app.job_id || app.jobId) !== driveFilter)
        return false;
      if (
        departmentFilter !== 'ALL' &&
        app.student?.department !== departmentFilter
      )
        return false;
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
      return true;
    });
  }, [
    applications,
    searchQuery,
    companyFilter,
    driveFilter,
    departmentFilter,
    statusFilter,
  ]);

  // Open confirmation modal before executing status transition
  const promptStatusTransition = (app, targetStatus) => {
    const defaultExplanations = {
      UNDER_REVIEW:
        'Application verified by TPO and forwarded to corporate recruitment panel.',
      SHORTLISTED:
        'Candidate met all academic CGPA, backlog, and skill proficiency cutoffs.',
      ASSESSMENT:
        'Assigned candidate to proctored Online Assessment round.',
      INTERVIEW:
        'Shortlisted for live technical / HR panel evaluation.',
      SELECTED:
        'Candidate cleared all interview rounds; recommended for final offer release.',
      REJECTED:
        'Candidate did not meet benchmark evaluation cutoff in the current round.',
    };

    setTransitionModal({
      isOpen: true,
      app,
      targetStatus,
      roundName:
        targetStatus === 'INTERVIEW'
          ? app.current_round && app.current_round !== 'Online Test'
            ? app.current_round
            : 'Technical 1'
          : targetStatus === 'SELECTED'
          ? 'Offer'
          : app.current_round || 'Online Test',
      explanation: defaultExplanations[targetStatus] || `Status updated to ${targetStatus}.`,
    });
  };

  const handleConfirmStatusTransition = async (e) => {
    e.preventDefault();
    const { app, targetStatus, roundName, explanation } = transitionModal;
    if (!app) return;

    const actorName = `${user?.name || 'Raghav Menon'} (${activeDemoRole})`;
    const updated = await mockApi.updateApplicationStatus(
      app.id,
      targetStatus,
      explanation,
      {
        actor: actorName,
        round_name: roundName,
        stage_label: `${targetStatus.replace(/_/g, ' ')} (${roundName})`,
      }
    );

    await loadData(app.id);
    setTransitionModal({
      isOpen: false,
      app: null,
      targetStatus: 'SHORTLISTED',
      roundName: 'Technical 1',
      explanation: '',
    });

    toast.placement(
      `Stage Updated: ${targetStatus.replace(/_/g, ' ')}`,
      `${updated?.student?.name} (${updated?.company}) updated & notified`
    );
  };

  const openScheduleModalForApp = (app) => {
    const rounds = app?.job?.recruitment_process?.interview_rounds || [
      'Technical 1',
      'Technical 2',
      'HR',
    ];
    setSchedRound(rounds[0] || 'Technical 1');
    setSchedDate('2026-10-29');
    setSchedTime('11:00 AM');
    setSchedTimezone('IST (UTC+5:30)');
    setSchedMode('ONLINE');
    setSchedVenue('Virtual Room PT-104 (Google Meet)');
    setSchedLink('https://example.com/placetrack-demo-interview/panel-room-104');
    setSchedPanelists('David Chen (VP Eng), Anjali Menon (Principal Architect)');
    setSchedNotes(`Scheduled ${rounds[0] || 'Technical 1'} for ${app.student?.name}.`);
    setScheduleModalOpen(true);
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (schedMode === 'ONLINE' && schedLink.trim()) {
      const check = evaluateInterviewMeetingLink({
        mode: 'ONLINE',
        attendance: 'SCHEDULED',
        result: 'PENDING',
        meeting_link: schedLink.trim(),
      });
      if (!check.canJoin) {
        toast.warning('Invalid Meeting URL', check.explanation);
        return;
      }
    }

    const roundNumber = Math.max(1, ROUND_OPTIONS.indexOf(schedRound) + 1);

    await mockApi.scheduleInterview({
      application_id: selectedApp.id,
      student_id: selectedApp.student_id || selectedApp.studentId,
      company: selectedApp.company,
      job_title: selectedApp.job?.title,
      round_number: roundNumber,
      round_name: schedRound,
      date: schedDate,
      reporting_time: schedTime,
      timezone: schedTimezone,
      mode: schedMode,
      venue: schedVenue,
      meeting_link: schedMode === 'IN_PERSON' ? '' : schedLink.trim(),
      panelists: schedPanelists,
      feedback: schedNotes,
    });

    await loadData(selectedApp.id);
    setScheduleModalOpen(false);
    showToast(
      `Scheduled ${schedRound} (${schedMode === 'IN_PERSON' ? 'In-Person' : 'Online'}) for ${selectedApp.student?.name}`
    );
  };

  const openResultModalForApp = (app) => {
    const targetInt = app.upcoming_interview || app.linked_interviews?.[0] || null;
    setEvalInterview(targetInt);
    setEvalAttendance(targetInt?.attendance === 'CANCELLED' ? 'PRESENT' : targetInt?.attendance || 'PRESENT');
    setEvalResult(targetInt?.result === 'PENDING' ? 'PASSED' : targetInt?.result || 'PASSED');
    setEvalFeedback(
      targetInt?.feedback ||
        'Demonstrated strong analytical problem-solving and clean architecture design.'
    );
    setEvalPromoteSelected(false);
    setResultModalOpen(true);
  };

  const handleSaveInterviewResult = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (evalInterview) {
      await mockApi.updateInterview(evalInterview.id, {
        attendance: evalAttendance,
        result: evalResult,
        feedback: evalFeedback,
        mark_final_selected: evalPromoteSelected,
      });
    } else {
      const nextSt =
        evalResult === 'FAILED'
          ? 'REJECTED'
          : evalPromoteSelected
          ? 'SELECTED'
          : 'INTERVIEW';
      await mockApi.updateApplicationStatus(selectedApp.id, nextSt, evalFeedback, {
        actor: `${user?.name || 'Raghav Menon'} (${activeDemoRole})`,
        stage_label: `Evaluation Result: ${evalResult}`,
      });
    }

    await loadData(selectedApp.id);
    setResultModalOpen(false);
    showToast(
      `Recorded ${evalResult} interview outcome for ${selectedApp.student?.name}`
    );
  };

  const openOfferModalForApp = (app) => {
    const pkg = Number(app?.job?.package_lpa || 15.0);
    setOfferBase((pkg * 0.75).toFixed(1));
    setOfferBonus((pkg * 0.15).toFixed(1));
    setOfferEsop((pkg * 0.1).toFixed(1));
    setOfferDeadline('2026-11-08');
    setOfferJoining('July 15, 2027');
    setOfferModalOpen(true);
  };

  const handleProcessOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    const base = parseFloat(offerBase) || 12.0;
    const bonus = parseFloat(offerBonus) || 2.0;
    const esop = parseFloat(offerEsop) || 1.0;
    const total = +(base + bonus + esop).toFixed(1);

    await mockApi.createOffer({
      application_id: selectedApp.id,
      student_id: selectedApp.student_id || selectedApp.studentId,
      company: selectedApp.company,
      tier: selectedApp.job?.tier || (total >= 18 ? 'Super Dream' : total >= 10 ? 'Dream' : 'Core'),
      job_role: selectedApp.job?.title || 'Software Engineer',
      base_lpa: base,
      bonus_lpa: bonus,
      esop_value: esop,
      package_lpa: total,
      decision_deadline: offerDeadline,
      joining_date: offerJoining,
      offer_status: 'PENDING',
    });

    await loadData(selectedApp.id);
    setOfferModalOpen(false);
    toast.placement(
      `Offer Released (${total} LPA)`,
      `Issued ${selectedApp.company} offer to ${selectedApp.student?.name}`
    );
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
            {activeDemoRole === 'ADMIN' ? 'CDC Executive Governance' : 'TPO Application Management'}
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            Candidate Applications & Stage Workflow
          </h2>
          <p className="text-xs text-[#64748B]">
            Searchable candidate table, drive/department/status filters, valid stage transitions with confirmation, interview scheduling, result entry, and offer processing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-[#0B0B0F] text-white shadow-xs'
                : 'bg-white text-[#64748B] hover:text-[#0B0B0F]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Table & Detail Panel</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'kanban'
                ? 'bg-[#0B0B0F] text-white shadow-xs'
                : 'bg-white text-[#64748B] hover:text-[#0B0B0F]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Stage Board</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <GlassCard variant="white" className="p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, roll no, ID, or company..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-medium text-[#0B0B0F] placeholder:text-[#94A3B8] focus:outline-none focus:border-violet-600"
            />
          </div>

          {/* Company Filter */}
          <div className="lg:col-span-2">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-semibold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Companies</option>
              {uniqueCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Drive Filter */}
          <div className="lg:col-span-2">
            <select
              value={driveFilter}
              onChange={(e) => setDriveFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-semibold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Job Drives</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="lg:col-span-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-semibold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Departments</option>
              {uniqueDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-semibold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Final Selected</option>
              <option value="OFFER_RELEASED">Offer Released</option>
              <option value="OFFER_ACCEPTED">Offer Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {viewMode === 'table' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 5 COLUMNS: Searchable Application Table */}
          <div className="lg:col-span-5 bg-white rounded-[28px] border border-black/8 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#0B0B0F]">
                  Candidate Applications ({filteredApplications.length})
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Select any row to inspect timeline & manage workflow
                </p>
              </div>
              {(searchQuery ||
                companyFilter !== 'ALL' ||
                driveFilter !== 'ALL' ||
                departmentFilter !== 'ALL' ||
                statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCompanyFilter('ALL');
                    setDriveFilter('ALL');
                    setDepartmentFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="text-[11px] font-bold text-violet-600 hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="divide-y divide-black/5 max-h-[720px] overflow-y-auto">
              {filteredApplications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No applications match the active filters.
                </div>
              ) : (
                filteredApplications.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className={`p-4 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-violet-50/80 border-l-4 border-l-violet-600'
                          : 'hover:bg-[#F9F9FB]'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0B0B0F] truncate">
                            {app.student?.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B]">
                            ({app.student?.roll_number})
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-violet-700 truncate">
                          {app.company} · {app.job?.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                          <span>{app.student?.department}</span>
                          <span>·</span>
                          <span>CGPA {app.student?.cgpa}</span>
                          <span>·</span>
                          <span>Stage: {app.current_round}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusBadge status={app.status} size="sm" />
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {app.job?.package_lpa} LPA
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT 7 COLUMNS: Application Detail & Workflow Action Panel */}
          <div className="lg:col-span-7 space-y-6">
            {selectedApp ? (
              <GlassCard variant="white" className="p-6 sm:p-7 space-y-6">
                {/* Candidate & Drive Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-black/5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {selectedApp.id}
                      </span>
                      <span className="text-xs font-extrabold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
                        {selectedApp.company} ({selectedApp.job?.tier || 'Dream'})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          selectedApp.eligibility?.eligible
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {selectedApp.eligibility?.eligible
                          ? `Eligible (${selectedApp.eligibility?.matchPercent}% Match)`
                          : 'Criteria Check'}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-[#0B0B0F]">
                      {selectedApp.student?.name}{' '}
                      <span className="text-sm font-mono font-normal text-[#64748B]">
                        ({selectedApp.student?.roll_number})
                      </span>
                    </h3>
                    <p className="text-xs text-[#475569]">
                      {selectedApp.student?.department} · CGPA{' '}
                      <strong>{selectedApp.student?.cgpa}</strong> · Active Backlogs:{' '}
                      <strong>{selectedApp.student?.active_backlogs ?? 0}</strong> · Target Role:{' '}
                      <strong>
                        {selectedApp.job?.title} ({selectedApp.job?.package_lpa} LPA)
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedApp.status} size="md" />
                      <span className="text-[10px] text-[#64748B]">
                        Updated: {selectedApp.last_update}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedApp.student && (
                        <>
                          <ContactActionButtons
                            target={{
                              id: selectedApp.student.id,
                              name: selectedApp.student.name,
                              role: 'STUDENT',
                              phone: selectedApp.student.phone,
                              department: selectedApp.student.department,
                            }}
                            compact
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const res = downloadDemoResumePdf(selectedApp.student);
                              if (res.success) {
                                toast.success(
                                  'Resume PDF Downloaded',
                                  `Saved ${res.filename}`
                                );
                              } else {
                                toast.warning('Resume Unavailable', res.error);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Resume PDF</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operational Action Toolbar (Schedule Interview, Record Result, Process Offer) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50/80 via-indigo-50/60 to-amber-50/50 border border-violet-200/60 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0B0B0F]">
                      Recruitment Workflow Actions
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Calendar}
                        onClick={() => openScheduleModalForApp(selectedApp)}
                      >
                        Schedule Interview
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={MessageSquare}
                        onClick={() => openResultModalForApp(selectedApp)}
                      >
                        Enter Interview Result
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Award}
                        onClick={() => openOfferModalForApp(selectedApp)}
                      >
                        Process Offer
                      </Button>
                    </div>
                  </div>

                  {/* Valid Status Transitions Bar */}
                  <div className="pt-2.5 border-t border-black/5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#475569]">
                      Valid Stage Transitions (Requires Confirmation):
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(selectedApp.valid_transitions?.length > 0
                        ? selectedApp.valid_transitions
                        : ['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED']
                      ).map((nextSt) => (
                        <button
                          key={nextSt}
                          type="button"
                          onClick={() => promptStatusTransition(selectedApp, nextSt)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                            nextSt === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : nextSt === 'SELECTED' || nextSt === 'OFFER_RELEASED'
                              ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                              : 'bg-white text-[#0B0B0F] border-black/15 hover:bg-[#0B0B0F] hover:text-white'
                          }`}
                        >
                          Move to {nextSt.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Linked Interview Card if Scheduled */}
                {selectedApp.upcoming_interview && (
                  <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-black/8 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-violet-600" />
                        Linked Interview Slot · {selectedApp.upcoming_interview.round_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {selectedApp.upcoming_interview.mode === 'IN_PERSON'
                            ? 'In-Person'
                            : 'Online'}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Attendance: {selectedApp.upcoming_interview.attendance}
                        </span>
                        <StatusBadge
                          status={selectedApp.upcoming_interview.result}
                          size="sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#475569]">
                      <p className="font-semibold text-[#0B0B0F]">
                        {selectedApp.upcoming_interview.date} at{' '}
                        {selectedApp.upcoming_interview.reporting_time}{' '}
                        <span className="text-[10px] text-[#64748B]">
                          ({selectedApp.upcoming_interview.timezone || 'IST (UTC+5:30)'})
                        </span>
                      </p>
                      <p className="truncate">
                        Venue: <strong>{selectedApp.upcoming_interview.venue}</strong>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-[#64748B]">
                        Panelists:{' '}
                        <strong className="text-[#0B0B0F]">
                          {Array.isArray(selectedApp.upcoming_interview.panelists)
                            ? selectedApp.upcoming_interview.panelists.join(', ')
                            : selectedApp.upcoming_interview.interviewer}
                        </strong>
                      </p>
                      <MeetingLinkButton
                        interview={selectedApp.upcoming_interview}
                        compact
                      />
                    </div>
                  </div>
                )}

                {/* Drive-Specific Stage Timeline & Chronological Status History */}
                <ApplicationTimeline
                  stages={selectedApp.timeline_stages}
                  statusHistory={selectedApp.status_history}
                  showHistory={true}
                  compact={true}
                />
              </GlassCard>
            ) : (
              <GlassCard variant="white" className="p-8 text-center text-xs text-slate-500">
                Select an application from the table to inspect details.
              </GlassCard>
            )}
          </div>
        </div>
      ) : (
        /* STAGE BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { key: 'REVIEW', title: 'Applied / Review', statuses: ['APPLIED', 'UNDER_REVIEW'] },
            { key: 'SHORTLISTED', title: 'Shortlisted / Test', statuses: ['SHORTLISTED', 'ASSESSMENT'] },
            { key: 'INTERVIEW', title: 'Interview Rounds', statuses: ['INTERVIEW'] },
            {
              key: 'OFFERS',
              title: 'Selected & Offers',
              statuses: ['SELECTED', 'OFFER_RELEASED', 'OFFER_ACCEPTED'],
            },
            {
              key: 'CLOSED',
              title: 'Rejected / Declined',
              statuses: ['REJECTED', 'OFFER_DECLINED', 'OFFER_EXPIRED'],
            },
          ].map((col) => {
            const colApps = filteredApplications.filter((a) =>
              col.statuses.includes(a.status)
            );
            return (
              <div
                key={col.key}
                className="bg-[#F4F4F7] p-4 rounded-3xl min-h-[480px] flex flex-col gap-3"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-[#0B0B0F]">
                    {col.title}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white text-[10px] font-bold text-[#0B0B0F] flex items-center justify-center shadow-xs">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedAppId(app.id);
                        setViewMode('table');
                      }}
                      className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs space-y-2 cursor-pointer hover:border-violet-300 transition-all"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full truncate">
                          {app.company}
                        </span>
                        <span className="text-xs font-bold text-[#0B0B0F]">
                          {app.job?.package_lpa} LPA
                        </span>
                      </div>
                      <p className="font-bold text-xs text-[#0B0B0F]">
                        {app.student?.name} ({app.student?.roll_number})
                      </p>
                      <p className="text-[11px] text-[#64748B] truncate">
                        {app.job?.title}
                      </p>
                      <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                        <StatusBadge status={app.status} size="sm" />
                        <span className="text-[10px] text-violet-700 font-bold">
                          Inspect →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Consequential Status Transition */}
      <Modal
        isOpen={transitionModal.isOpen}
        onClose={() =>
          setTransitionModal({ ...transitionModal, isOpen: false, app: null })
        }
        title={`Confirm Stage Transition → ${transitionModal.targetStatus.replace(/_/g, ' ')}`}
        subtitle={
          transitionModal.app
            ? `${transitionModal.app.student?.name} (${transitionModal.app.student?.roll_number}) · ${transitionModal.app.company}`
            : ''
        }
      >
        <form onSubmit={handleConfirmStatusTransition} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Consequential Recruitment Action</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                This transition updates the shared application timeline, appends an audit entry to status history, and sends an immediate notification to the candidate.
              </p>
            </div>
          </div>

          {transitionModal.targetStatus === 'INTERVIEW' && (
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Target Interview Round
              </label>
              <select
                value={transitionModal.roundName}
                onChange={(e) =>
                  setTransitionModal({ ...transitionModal, roundName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
              >
                {ROUND_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Status Explanation / Audit Note (Visible to Student)
            </label>
            <textarea
              rows={3}
              value={transitionModal.explanation}
              onChange={(e) =>
                setTransitionModal({
                  ...transitionModal,
                  explanation: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-black/15 p-3 text-xs text-[#0B0B0F] outline-none"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() =>
                setTransitionModal({ ...transitionModal, isOpen: false, app: null })
              }
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Notify Candidate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={`Schedule Interview — ${selectedApp?.student?.name || ''}`}
        subtitle={`${selectedApp?.company || ''} · ${selectedApp?.job?.title || ''}`}
      >
        <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Round Name
              </label>
              <select
                value={schedRound}
                onChange={(e) => setSchedRound(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
              >
                {ROUND_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Interview Mode
              </label>
              <select
                value={schedMode}
                onChange={(e) => setSchedMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
              >
                <option value="ONLINE">Online (Virtual Meeting Link)</option>
                <option value="IN_PERSON">In-Person (Campus Venue)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Date"
              type="date"
              value={schedDate}
              onChange={(e) => setSchedDate(e.target.value)}
              required
            />
            <Input
              label="Reporting Time"
              value={schedTime}
              onChange={(e) => setSchedTime(e.target.value)}
              placeholder="11:00 AM"
              required
            />
            <Input
              label="Timezone"
              value={schedTimezone}
              onChange={(e) => setSchedTimezone(e.target.value)}
              placeholder="IST (UTC+5:30)"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Venue / Room Name"
              value={schedVenue}
              onChange={(e) => setSchedVenue(e.target.value)}
              required
            />
            <Input
              label="Meeting URL (if Online)"
              value={schedLink}
              onChange={(e) => setSchedLink(e.target.value)}
              placeholder="https://meet.google.com/ptk-panel-room"
            />
          </div>

          <Input
            label="Assigned Panelists"
            value={schedPanelists}
            onChange={(e) => setSchedPanelists(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Candidate Instructions / Notes
            </label>
            <textarea
              rows={2}
              value={schedNotes}
              onChange={(e) => setSchedNotes(e.target.value)}
              className="w-full rounded-2xl border border-black/15 p-3 text-xs text-[#0B0B0F] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Interview Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enter Interview Result Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title={`Record Interview Outcome — ${selectedApp?.student?.name || ''}`}
        subtitle={`${selectedApp?.company || ''} · ${
          evalInterview?.round_name || selectedApp?.current_round || 'Technical Panel'
        }`}
      >
        <form onSubmit={handleSaveInterviewResult} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Candidate Attendance
              </label>
              <select
                value={evalAttendance}
                onChange={(e) => setEvalAttendance(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
              >
                <option value="PRESENT">PRESENT</option>
                <option value="LATE">LATE</option>
                <option value="ABSENT">ABSENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Round Result
              </label>
              <select
                value={evalResult}
                onChange={(e) => setEvalResult(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
              >
                <option value="PASSED">PASSED (Cleared Round)</option>
                <option value="FAILED">FAILED (Did Not Clear)</option>
                <option value="PENDING">PENDING (Under Evaluation)</option>
              </select>
            </div>
          </div>

          {evalResult === 'PASSED' && (
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 cursor-pointer text-xs font-semibold text-emerald-950">
              <input
                type="checkbox"
                checked={evalPromoteSelected}
                onChange={(e) => setEvalPromoteSelected(e.target.checked)}
                className="rounded border-emerald-400 text-emerald-600"
              />
              <span>
                Mark candidate as Final Selected (Cleared all interview rounds for Offer Release)
              </span>
            </label>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Panelist Evaluation Feedback
            </label>
            <textarea
              rows={3}
              value={evalFeedback}
              onChange={(e) => setEvalFeedback(e.target.value)}
              className="w-full rounded-2xl border border-black/15 p-3 text-xs text-[#0B0B0F] outline-none"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setResultModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Interview Result
            </Button>
          </div>
        </form>
      </Modal>

      {/* Process Offer Modal */}
      <Modal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title={`Release Official Offer — ${selectedApp?.student?.name || ''}`}
        subtitle={`${selectedApp?.company || ''} · ${selectedApp?.job?.title || ''}`}
      >
        <form onSubmit={handleProcessOfferSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Base Salary (LPA)"
              type="number"
              step="0.5"
              value={offerBase}
              onChange={(e) => setOfferBase(e.target.value)}
              required
            />
            <Input
              label="Joining Bonus (LPA)"
              type="number"
              step="0.5"
              value={offerBonus}
              onChange={(e) => setOfferBonus(e.target.value)}
              required
            />
            <Input
              label="ESOP Grant (LPA)"
              type="number"
              step="0.5"
              value={offerEsop}
              onChange={(e) => setOfferEsop(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Offer Decision Deadline"
              type="date"
              value={offerDeadline}
              onChange={(e) => setOfferDeadline(e.target.value)}
              required
            />
            <Input
              label="Proposed Joining Date"
              value={offerJoining}
              onChange={(e) => setOfferJoining(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setOfferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Release Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
