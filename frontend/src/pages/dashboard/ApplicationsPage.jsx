import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import applicationsService from '../../services/applicationsService.js';
import jobsService from '../../services/jobsService.js';
import studentsService from '../../services/studentsService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  LayoutGrid,
  Plus,
  Send,
  Users,
  AlertTriangle,
  History,
  Briefcase,
  FileText,
  Filter,
} from 'lucide-react';

const KANBAN_STATUSES = [
  { key: 'APPLIED', label: 'Applied', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'INTERVIEW', label: 'Interview', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'SELECTED', label: 'Selected', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'WITHDRAWN', label: 'Withdrawn', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const LEGAL_NEXT_STATES = {
  APPLIED: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['SELECTED', 'REJECTED', 'WITHDRAWN'],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export default function ApplicationsPage() {
  const { user, activeRole } = useAuth();
  const toast = useToast();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [jobFilter, setJobFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Drawer details
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerHistory, setDrawerHistory] = useState([]);
  const [drawerInterviews, setDrawerInterviews] = useState([]);
  const [loadingDrawerData, setLoadingDrawerData] = useState(false);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedRoundType, setSchedRoundType] = useState('TECHNICAL');
  const [schedDateTime, setSchedDateTime] = useState('');
  const [schedReportingTime, setSchedReportingTime] = useState('09:30:00');
  const [schedMeetingLink, setSchedLink] = useState('https://meet.google.com/pt-interview-live');
  const [schedVenue, setSchedVenue] = useState('Virtual Room 101');
  const [schedPanelists, setSchedPanelists] = useState('Senior Tech Panel');

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedRoundNumber, setSelectedRoundNumber] = useState(1);
  const [evalResult, setEvalResult] = useState('CLEARED');
  const [evalRemarks, setEvalRemarks] = useState('Candidate demonstrated strong technical fundamentals.');

  // Bulk status bar
  const [bulkJobId, setBulkJobId] = useState('');
  const [bulkFromStatus, setBulkFromStatus] = useState('APPLIED');
  const [bulkToStatus, setBulkToStatus] = useState('SHORTLISTED');
  const [bulkDeptId, setBulkDeptId] = useState('');
  const [bulkMinCgpa, setBulkMinCgpa] = useState('');

  const loadData = async (preserveSelectedId = null) => {
    try {
      setLoading(true);
      const [appsData, jobsData, deptsData] = await Promise.all([
        applicationsService.getApplications(),
        jobsService.getJobs(),
        studentsService.getDepartments(),
      ]);

      const appsList = Array.isArray(appsData) ? appsData : appsData?.items || [];
      const jobsList = Array.isArray(jobsData) ? jobsData : jobsData?.items || [];

      setApplications(appsList);
      setJobs(jobsList);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);

      if (jobsList.length > 0 && !bulkJobId) {
        setBulkJobId(String(jobsList[0].id));
      }

      if (preserveSelectedId) {
        const found = appsList.find((a) => a.application_id === preserveSelectedId);
        if (found) {
          setSelectedApp(found);
          loadDrawerSubData(found.application_id);
        }
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Data Load Error', err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadDrawerSubData = async (appId) => {
    try {
      setLoadingDrawerData(true);
      const [history, interviews] = await Promise.all([
        applicationsService.getStatusHistory(appId).catch(() => []),
        applicationsService.getInterviews(appId).catch(() => []),
      ]);
      setDrawerHistory(Array.isArray(history) ? history : []);
      setDrawerInterviews(Array.isArray(interviews) ? interviews : []);
    } catch (err) {
      console.error('Failed to load drawer data:', err);
    } finally {
      setLoadingDrawerData(false);
    }
  };

  const openAppDrawer = (app) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
    loadDrawerSubData(app.application_id);
  };

  // Status update
  const handleUpdateStatus = async (appId, nextStatus) => {
    try {
      await applicationsService.updateStatus(appId, nextStatus);
      toast.success(
        'Status Updated',
        `Application moved to ${nextStatus.replace(/_/g, ' ')}.`
      );
      loadData(appId);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Status Update Failed', detail);
    }
  };

  // Schedule Interview
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (!schedDateTime) {
      toast.warning('Schedule Time Required', 'Please choose the interview date and time.');
      return;
    }

    try {
      await applicationsService.scheduleInterview(selectedApp.application_id, {
        round_type: schedRoundType,
        scheduled_at: new Date(schedDateTime).toISOString(),
        reporting_time: schedReportingTime || undefined,
        meeting_link: schedMeetingLink.trim() || undefined,
        venue: schedVenue.trim() || undefined,
        panelists: schedPanelists.trim() || undefined,
      });

      toast.success(
        'Interview Scheduled',
        `${schedRoundType} round scheduled for ${selectedApp.student_name}.`
      );
      setScheduleModalOpen(false);
      loadData(selectedApp.application_id);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Scheduling Failed', detail);
    }
  };

  // Record Interview Result
  const handleRecordResultSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await applicationsService.recordInterviewResult(
        selectedApp.application_id,
        selectedRoundNumber,
        {
          result: evalResult,
          remarks: evalRemarks.trim() || undefined,
        }
      );

      toast.success(
        'Interview Result Recorded',
        `Round ${selectedRoundNumber} marked as ${evalResult}.`
      );
      setResultModalOpen(false);
      loadData(selectedApp.application_id);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Result Entry Failed', detail);
    }
  };

  // Bulk Status Update
  const handleBulkPromote = async (e) => {
    e.preventDefault();
    if (!bulkJobId) {
      toast.warning('Select Job', 'Please select a job drive for bulk promotion.');
      return;
    }

    try {
      const payload = {
        job_id: parseInt(bulkJobId, 10),
        from_status: bulkFromStatus,
        to_status: bulkToStatus,
        department_id: bulkDeptId ? parseInt(bulkDeptId, 10) : undefined,
        min_cgpa: bulkMinCgpa ? parseFloat(bulkMinCgpa) : undefined,
      };

      const res = await applicationsService.bulkUpdateStatus(payload);
      toast.success(
        'Bulk Promotion Successful',
        res.message || `Promoted ${res.updated_count} candidate applications.`
      );
      loadData(selectedApp?.application_id);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Bulk Action Failed', detail);
    }
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mStudent = (app.student_name || '').toLowerCase().includes(q);
        const mRoll = (app.roll_number || '').toLowerCase().includes(q);
        const mCompany = (app.company || '').toLowerCase().includes(q);
        const mTitle = (app.job_title || '').toLowerCase().includes(q);
        if (!mStudent && !mRoll && !mCompany && !mTitle) return false;
      }

      if (jobFilter !== 'ALL' && String(app.job_id) !== String(jobFilter)) {
        return false;
      }

      if (statusFilter !== 'ALL' && app.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, jobFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Placement Operations Console
            </span>
            <span className="text-xs text-[#64748B]">· {applications.length} Total Applications</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-[#0B0B0F]">
            Candidate Application Pipeline
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time status board, legal state transitions, interview round tracking, and bulk batch actions
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <span>Kanban Board</span>
          </button>
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
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* 2. Bulk Action Bar (STAFF / ADMIN) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-violet-600" />
            Batch Promotion Action Bar
          </span>
          <span className="text-[11px] text-violet-700 font-semibold">
            Calls POST /applications/bulk-status
          </span>
        </div>

        <form onSubmit={handleBulkPromote} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Drive *</label>
            <select
              value={bulkJobId}
              onChange={(e) => setBulkJobId(e.target.value)}
              required
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 font-medium outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company_name || j.company} — {j.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">From Status</label>
            <select
              value={bulkFromStatus}
              onChange={(e) => setBulkFromStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 font-medium outline-none"
            >
              <option value="APPLIED">APPLIED</option>
              <option value="SHORTLISTED">SHORTLISTED</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Promote To</label>
            <select
              value={bulkToStatus}
              onChange={(e) => setBulkToStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 font-medium outline-none"
            >
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="INTERVIEW">INTERVIEW</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Department</label>
            <select
              value={bulkDeptId}
              onChange={(e) => setBulkDeptId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 font-medium outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Min CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 8.0"
              value={bulkMinCgpa}
              onChange={(e) => setBulkMinCgpa(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 font-medium outline-none"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              className="w-full py-2"
            >
              Promote
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Search & Filter Bar */}
      <GlassCard variant="white" className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, roll no, company, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs bg-[#F8F8FA] border border-black/10 outline-none"
            />
          </div>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 outline-none"
          >
            <option value="ALL">All Recruitment Drives</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company_name || j.company} — {j.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 outline-none"
          >
            <option value="ALL">All Statuses</option>
            {KANBAN_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* 4. Kanban or Table View */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading candidate applications...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {KANBAN_STATUSES.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.key);

            return (
              <div
                key={col.key}
                className="bg-[#F4F4F7] p-3 rounded-3xl min-h-[500px] flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-[#0B0B0F]">
                    {col.label}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white text-[10px] font-bold text-[#0B0B0F] flex items-center justify-center shadow-xs">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[640px] pr-0.5">
                  {colApps.map((app) => {
                    const legalNext = LEGAL_NEXT_STATES[app.status] || [];

                    return (
                      <div
                        key={app.application_id}
                        onClick={() => openAppDrawer(app)}
                        className="bg-white p-3.5 rounded-2xl border border-black/5 shadow-xs space-y-2.5 cursor-pointer hover:border-violet-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full truncate">
                            {app.company}
                          </span>
                          <span className="text-[10px] font-semibold text-[#64748B]">
                            {app.interview_rounds} rounds
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-xs text-[#0B0B0F]">{app.student_name}</p>
                          <p className="text-[10px] text-[#64748B]">
                            {app.roll_number} · {app.job_title}
                          </p>
                        </div>

                        {/* Legal Next States Buttons */}
                        {legalNext.length > 0 && (
                          <div
                            className="pt-2 border-t border-black/5 flex flex-wrap gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {legalNext.map((nextSt) => (
                              <button
                                key={nextSt}
                                type="button"
                                onClick={() => handleUpdateStatus(app.application_id, nextSt)}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-all border ${
                                  nextSt === 'REJECTED' || nextSt === 'WITHDRAWN'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                    : nextSt === 'SELECTED'
                                    ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                    : 'bg-slate-50 text-[#0B0B0F] border-black/10 hover:bg-[#0B0B0F] hover:text-white'
                                }`}
                              >
                                → {nextSt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <GlassCard variant="white" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/5 bg-[#FAFAFC] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-6">Company & Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Interviews</th>
                  <th className="py-3.5 px-6">Applied Date</th>
                  <th className="py-3.5 px-6 text-right">Legal Transitions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredApps.map((app) => {
                  const legalNext = LEGAL_NEXT_STATES[app.status] || [];

                  return (
                    <tr
                      key={app.application_id}
                      onClick={() => openAppDrawer(app)}
                      className="hover:bg-[#F9F9FB] cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-[#0B0B0F] text-sm">{app.student_name}</p>
                        <p className="text-[11px] text-[#64748B]">{app.roll_number}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-[#0B0B0F]">{app.company}</p>
                        <p className="text-[11px] text-[#64748B]">{app.job_title}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-bold text-[10px] uppercase px-2.5 py-1 rounded-full bg-violet-100 text-violet-800">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold whitespace-nowrap">
                        {app.interview_rounds} rounds
                      </td>
                      <td className="py-4 px-6 text-xs text-[#64748B] whitespace-nowrap">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {legalNext.map((nextSt) => (
                            <button
                              key={nextSt}
                              type="button"
                              onClick={() => handleUpdateStatus(app.application_id, nextSt)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${
                                nextSt === 'SELECTED'
                                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                  : nextSt === 'REJECTED' || nextSt === 'WITHDRAWN'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-50 text-[#0B0B0F] border-black/10 hover:bg-[#0B0B0F] hover:text-white'
                              }`}
                            >
                              Move {nextSt}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* 5. APPLICATION DETAIL DRAWER */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isDrawer={true}
        title={selectedApp ? `${selectedApp.student_name} (${selectedApp.roll_number})` : 'Application'}
        subtitle={selectedApp ? `${selectedApp.company} — ${selectedApp.job_title}` : ''}
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Status & Legal Next Actions */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-black/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-semibold">Current State:</span>
                <span className="font-display font-bold text-xs uppercase px-3 py-1 rounded-full bg-violet-100 text-violet-800">
                  {selectedApp.status}
                </span>
              </div>

              {LEGAL_NEXT_STATES[selectedApp.status]?.length > 0 && (
                <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#475569]">Move Status:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {LEGAL_NEXT_STATES[selectedApp.status].map((nextSt) => (
                      <Button
                        key={nextSt}
                        variant={nextSt === 'SELECTED' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedApp.application_id, nextSt)}
                      >
                        {nextSt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interview Rounds Management */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B0B0F] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-violet-600" />
                  Interview Rounds ({drawerInterviews.length})
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setScheduleModalOpen(true)}
                >
                  Schedule Round
                </Button>
              </div>

              {loadingDrawerData ? (
                <div className="py-6 text-center text-xs text-slate-500">Loading interview details...</div>
              ) : drawerInterviews.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white border border-black/5 text-center text-xs text-slate-500">
                  No interview rounds scheduled yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {drawerInterviews.map((iv) => (
                    <div
                      key={iv.id}
                      className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-[#0B0B0F]">
                          Round {iv.round_number}: {iv.round_type}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              iv.result === 'CLEARED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : iv.result === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {iv.result}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoundNumber(iv.round_number);
                              setEvalResult(iv.result || 'CLEARED');
                              setEvalRemarks(iv.remarks || '');
                              setResultModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-violet-600 hover:underline"
                          >
                            Update Result
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[#475569] text-[11px]">
                        <div>
                          <span>Scheduled: </span>
                          <strong className="text-[#0B0B0F]">
                            {iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : 'TBD'}
                          </strong>
                        </div>
                        <div>
                          <span>Reporting: </span>
                          <strong className="text-[#0B0B0F]">{iv.reporting_time || 'N/A'}</strong>
                        </div>
                        <div>
                          <span>Venue: </span>
                          <strong className="text-[#0B0B0F]">{iv.venue || 'Online'}</strong>
                        </div>
                        <div>
                          <span>Panelists: </span>
                          <strong className="text-[#0B0B0F]">{iv.panelists || 'Assigned Panel'}</strong>
                        </div>
                      </div>

                      {iv.meeting_link && (
                        <div className="pt-1.5 border-t border-black/5 flex items-center justify-between">
                          <a
                            href={iv.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-violet-600 font-bold text-[11px] hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Meeting Link
                          </a>
                        </div>
                      )}

                      {iv.remarks && (
                        <p className="text-[11px] text-[#64748B] italic">
                          Remarks: {iv.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chronological Status Audit History */}
            <div className="space-y-3 pt-3 border-t border-black/5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B0B0F] flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-600" />
                Status Audit Trail (Database History)
              </span>

              {drawerHistory.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">No transition history logged.</div>
              ) : (
                <div className="space-y-2">
                  {drawerHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-black/5 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#0B0B0F]">
                          {h.old_status || 'INIT'} → {h.new_status}
                        </span>
                        <p className="text-[10px] text-[#64748B]">Changed by {h.changed_by}</p>
                      </div>
                      <span className="text-[10px] text-[#64748B] tabular-nums">
                        {new Date(h.changed_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 6. SCHEDULE INTERVIEW MODAL */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Interview Round"
        subtitle={selectedApp ? `Round for ${selectedApp.student_name} (${selectedApp.company})` : ''}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Round Type *</label>
            <select
              value={schedRoundType}
              onChange={(e) => setSchedRoundType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-black/10 outline-none"
            >
              <option value="ONLINE_TEST">ONLINE TEST</option>
              <option value="TECHNICAL">TECHNICAL</option>
              <option value="HR">HR</option>
              <option value="GROUP_DISCUSSION">GROUP DISCUSSION</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              variant="pill"
              label="Interview Date & Time *"
              type="datetime-local"
              value={schedDateTime}
              onChange={(e) => setSchedDateTime(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="Reporting Time (HH:MM:SS)"
              placeholder="09:30:00"
              value={schedReportingTime}
              onChange={(e) => setSchedReportingTime(e.target.value)}
            />
          </div>

          <Input
            variant="pill"
            label="Venue / Room"
            placeholder="e.g. CDC Boardroom 2 or Virtual"
            value={schedVenue}
            onChange={(e) => setSchedVenue(e.target.value)}
          />

          <Input
            variant="pill"
            label="Meeting Link"
            placeholder="https://meet.google.com/..."
            value={schedMeetingLink}
            onChange={(e) => setSchedLink(e.target.value)}
          />

          <Input
            variant="pill"
            label="Panelists"
            placeholder="e.g. Vikram Rao, Principal Architect"
            value={schedPanelists}
            onChange={(e) => setSchedPanelists(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Schedule Round
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. RECORD INTERVIEW RESULT MODAL */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title={`Record Result for Round ${selectedRoundNumber}`}
        subtitle={selectedApp ? `Evaluation for ${selectedApp.student_name}` : ''}
      >
        <form onSubmit={handleRecordResultSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Evaluation Result *</label>
            <select
              value={evalResult}
              onChange={(e) => setEvalResult(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-black/10 outline-none"
            >
              <option value="CLEARED">CLEARED (Passed)</option>
              <option value="REJECTED">REJECTED (Failed)</option>
              <option value="PENDING">PENDING</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Panel Remarks / Feedback</label>
            <textarea
              value={evalRemarks}
              onChange={(e) => setEvalRemarks(e.target.value)}
              rows={3}
              placeholder="Record candidate strengths, gaps, or panel recommendation..."
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-white border border-black/10 outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setResultModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Evaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
