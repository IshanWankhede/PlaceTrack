import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Plus,
  Edit3,
  Ban,
  Search,
  Video,
  Building2,
  AlertTriangle,
  LayoutGrid,
  CalendarDays,
} from 'lucide-react';
import { MeetingLinkButton } from '../../components/ui/MeetingLinkButton.jsx';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';
import { evaluateInterviewMeetingLink } from '../../utils/interactionHelpers.js';

const ROUND_OPTIONS = ['Online Test', 'Technical 1', 'Technical 2', 'HR', 'Offer'];

export default function StaffInterviewsPage() {
  const { showToast } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'cards'

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');

  // Schedule / Edit / Reschedule Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [appId, setAppId] = useState('');
  const [roundName, setRoundName] = useState('Technical 1');
  const [date, setDate] = useState('2026-10-29');
  const [reportingTime, setReportingTime] = useState('11:00 AM');
  const [timezone, setTimezone] = useState('IST (UTC+5:30)');
  const [mode, setMode] = useState('ONLINE');
  const [venue, setVenue] = useState('Virtual Room PT-104 (Online Bridge)');
  const [meetingLink, setMeetingLink] = useState(
    'https://example.com/placetrack-demo-interview/ptk-panel-room'
  );
  const [panelists, setPanelists] = useState(
    'David Chen (VP Eng), Anjali Menon (Principal Architect)'
  );
  const [attendance, setAttendance] = useState('SCHEDULED');
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState('PENDING');

  // Cancel Confirmation Modal
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    interview: null,
    reason: 'Panelist unavailability — slot will be rescheduled by TPO.',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [intData, appData] = await Promise.all([
        mockApi.getInterviews(),
        mockApi.getApplications(),
      ]);
      setInterviews(intData);
      setApplications(appData);
      if (appData.length > 0 && !appId) {
        setAppId(appData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(interviews.map((i) => i.date))).filter(
      Boolean
    );
    return dates.sort();
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const mStudent = (item.student || '').toLowerCase().includes(q);
          const mRoll = (item.roll_number || '').toLowerCase().includes(q);
          const mCompany = (item.company || '').toLowerCase().includes(q);
          const mRole = (item.job_title || '').toLowerCase().includes(q);
          const mRound = (item.round_name || '').toLowerCase().includes(q);
          if (!mStudent && !mRoll && !mCompany && !mRole && !mRound)
            return false;
        }
        if (modeFilter !== 'ALL' && (item.mode || 'ONLINE') !== modeFilter)
          return false;
        if (resultFilter !== 'ALL' && item.result !== resultFilter) return false;
        if (
          selectedDateFilter !== 'ALL' &&
          item.date !== selectedDateFilter
        )
          return false;
        return true;
      })
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  }, [interviews, searchQuery, modeFilter, resultFilter, selectedDateFilter]);

  const openScheduleModal = () => {
    setEditingInterview(null);
    const defaultApp =
      applications.find((a) => a.id === 'app-904') || applications[0];
    setAppId(defaultApp?.id || 'app-904');
    setRoundName('Technical 1');
    setDate('2026-10-29');
    setReportingTime('11:00 AM');
    setTimezone('IST (UTC+5:30)');
    setMode('ONLINE');
    setVenue('Virtual Room PT-104 (Online Bridge)');
    setMeetingLink('https://example.com/placetrack-demo-interview/ptk-panel-room');
    setPanelists('David Chen (VP Eng), Anjali Menon');
    setAttendance('SCHEDULED');
    setFeedback('Scheduled by Placement Staff.');
    setResult('PENDING');
    setIsModalOpen(true);
  };

  const openRescheduleModal = (intItem) => {
    setEditingInterview(intItem);
    setAppId(intItem.application_id || intItem.applicationId || '');
    setRoundName(intItem.round_name || 'Technical 1');
    setDate(intItem.date || '2026-10-28');
    setReportingTime(intItem.reporting_time || '12:00 PM');
    setTimezone(intItem.timezone || 'IST (UTC+5:30)');
    setMode(intItem.mode || 'ONLINE');
    setVenue(intItem.venue || intItem.location || 'CDC Boardroom');
    setMeetingLink(
      intItem.meeting_link ||
        'https://example.com/placetrack-demo-interview/ptk-sys-arch'
    );
    setPanelists(
      Array.isArray(intItem.panelists)
        ? intItem.panelists.join(', ')
        : intItem.interviewer || ''
    );
    setAttendance(intItem.attendance || 'SCHEDULED');
    setFeedback(intItem.feedback || '');
    setResult(intItem.result || 'PENDING');
    setIsModalOpen(true);
  };

  const handleSaveInterview = async (e) => {
    e.preventDefault();
    if (mode === 'ONLINE') {
      const check = evaluateInterviewMeetingLink({
        mode: 'ONLINE',
        meeting_link: meetingLink,
        attendance: 'SCHEDULED',
        result: 'PENDING',
      });
      if (!check.valid) {
        showToast(check.reason || 'Please provide a valid https:// or http:// meeting URL.');
        return;
      }
    }
    const roundNumber = Math.max(1, ROUND_OPTIONS.indexOf(roundName) + 1);

    if (editingInterview) {
      await mockApi.updateInterview(editingInterview.id, {
        round_name: roundName,
        round_number: roundNumber,
        date,
        reporting_time: reportingTime,
        timezone,
        mode,
        venue,
        meeting_link: mode === 'IN_PERSON' ? '' : meetingLink,
        panelists,
        attendance,
        feedback,
        result,
      });
      showToast(
        `Updated interview schedule & outcome for ${editingInterview.student}`
      );
    } else {
      const targetApp =
        applications.find((a) => a.id === appId) || applications[0];
      await mockApi.scheduleInterview({
        application_id: targetApp?.id,
        student_id: targetApp?.student_id || targetApp?.studentId,
        company: targetApp?.company,
        job_title: targetApp?.job?.title,
        round_number: roundNumber,
        round_name: roundName,
        date,
        reporting_time: reportingTime,
        timezone,
        mode,
        venue,
        meeting_link: mode === 'IN_PERSON' ? '' : meetingLink,
        panelists,
        feedback,
      });
      showToast(
        `Scheduled new ${roundName} interview for ${targetApp?.student?.name}`
      );
    }

    await loadData();
    setIsModalOpen(false);
  };

  const handleQuickAttendance = async (intItem, nextAttendance) => {
    await mockApi.updateInterview(intItem.id, { attendance: nextAttendance });
    await loadData();
    showToast(`Marked ${intItem.student} as ${nextAttendance}`);
  };

  const handleConfirmCancelInterview = async (e) => {
    e.preventDefault();
    if (!cancelModal.interview) return;
    await mockApi.cancelInterview(
      cancelModal.interview.id,
      cancelModal.reason
    );
    await loadData();
    showToast(
      `Cancelled ${cancelModal.interview.round_name} interview for ${cancelModal.interview.student}`
    );
    setCancelModal({ isOpen: false, interview: null, reason: '' });
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
            TPO Interview Calendar & Panel Desk
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            Interview Calendar & Attendance Coordination
          </h2>
          <p className="text-xs text-[#64748B]">
            Create, edit, reschedule, and cancel interviews with timezone, online/in-person mode, assigned panelists, and result tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white rounded-xl p-1 border border-black/8">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-[#0B0B0F] text-white'
                  : 'text-[#64748B] hover:text-[#0B0B0F]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[#0B0B0F] text-white'
                  : 'text-[#64748B] hover:text-[#0B0B0F]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openScheduleModal}
          >
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Interactive Date Strip + Search & Filters */}
      <GlassCard variant="white" className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, roll number, company, role, or round..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-medium text-[#0B0B0F] placeholder:text-[#94A3B8] focus:outline-none focus:border-violet-600"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-semibold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Modes (Online & In-Person)</option>
              <option value="ONLINE">Online Mode Only</option>
              <option value="IN_PERSON">In-Person Mode Only</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-semibold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Result Statuses</option>
              <option value="PENDING">Pending Evaluation</option>
              <option value="PASSED">Passed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Calendar Date Selector Strip */}
        <div className="pt-2 border-t border-black/5 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mr-1 flex-shrink-0">
            Calendar Dates:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDateFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              selectedDateFilter === 'ALL'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-[#F4F4F7] text-[#475569] hover:text-[#0B0B0F]'
            }`}
          >
            All Dates ({interviews.length})
          </button>
          {uniqueDates.map((dt) => {
            const count = interviews.filter((i) => i.date === dt).length;
            return (
              <button
                key={dt}
                type="button"
                onClick={() => setSelectedDateFilter(dt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  selectedDateFilter === dt
                    ? 'bg-[#0B0B0F] text-white shadow-xs'
                    : 'bg-[#F4F4F7] text-[#475569] hover:text-[#0B0B0F]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-violet-500" />
                <span>{dt}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Calendar Agenda / Cards Display */}
      {filteredInterviews.length === 0 ? (
        <GlassCard
          variant="white"
          className="p-8 text-center text-xs text-slate-500"
        >
          No interviews match the selected filters.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInterviews.map((intItem) => {
            const isCancelled =
              intItem.attendance === 'CANCELLED' || intItem.result === 'CANCELLED';
            const isOnline = (intItem.mode || 'ONLINE') === 'ONLINE';

            return (
              <GlassCard
                key={intItem.id}
                variant="white"
                className={`p-6 space-y-4 flex flex-col justify-between ${
                  isCancelled ? 'opacity-75 bg-slate-50/70' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
                          {intItem.company}
                        </span>
                        <span className="text-xs font-bold text-[#0B0B0F]">
                          {intItem.round_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isOnline
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOnline ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <Building2 className="w-3 h-3" />
                          )}
                          {isOnline ? 'Online Mode' : 'In-Person Mode'}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-[#0B0B0F] mt-1.5">
                        {intItem.student}{' '}
                        <span className="text-xs font-mono text-[#64748B]">
                          ({intItem.roll_number})
                        </span>
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        {intItem.job_title}
                        {intItem.department ? ` · ${intItem.department}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={intItem.result || 'PENDING'} size="sm" />
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          intItem.attendance === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : intItem.attendance === 'ABSENT' ||
                              intItem.attendance === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Attendance: {intItem.attendance || 'SCHEDULED'}
                      </span>
                    </div>
                  </div>

                  {/* Schedule & Venue Details */}
                  <div className="p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/5 space-y-2 text-xs text-[#475569]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <span className="flex items-center gap-1.5 font-semibold text-[#0B0B0F]">
                        <Calendar className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                        {intItem.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-[#0B0B0F]">
                        <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        {intItem.reporting_time}{' '}
                        <span className="text-[10px] text-[#64748B]">
                          ({intItem.timezone || 'IST (UTC+5:30)'})
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{intItem.venue || intItem.location}</span>
                      </span>
                      <MeetingLinkButton interview={intItem} compact />
                    </div>

                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-black/5">
                      <Users className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">
                        Assigned Panel:{' '}
                        <strong className="text-[#0B0B0F]">
                          {Array.isArray(intItem.panelists)
                            ? intItem.panelists.join(', ')
                            : intItem.interviewer}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {intItem.feedback && (
                    <p className="text-[11px] text-[#64748B] italic bg-slate-50 px-3 py-2 rounded-xl border border-black/5">
                      “{intItem.feedback}”
                    </p>
                  )}
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#64748B] mr-1">
                      Attendance:
                    </span>
                    {['PRESENT', 'LATE', 'ABSENT'].map((att) => (
                      <button
                        key={att}
                        type="button"
                        disabled={isCancelled}
                        onClick={() => handleQuickAttendance(intItem, att)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          intItem.attendance === att
                            ? 'bg-[#0B0B0F] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40'
                        }`}
                      >
                        {att}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ContactActionButtons
                      compact
                      target={{
                        id: intItem.student_id || 'student-rohit',
                        name: intItem.student,
                        role: 'STUDENT',
                        phone: '+91 98202 33445',
                        subtitle: `${intItem.roll_number} · ${intItem.department || 'Candidate'}`,
                      }}
                      subject={`Interview Coordination: ${intItem.company} (${intItem.round_name})`}
                    />
                    {!isCancelled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Ban}
                        onClick={() =>
                          setCancelModal({
                            isOpen: true,
                            interview: intItem,
                            reason:
                              'Panelist schedule adjustment — slot will be reassigned by TPO.',
                          })
                        }
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit3}
                      onClick={() => openRescheduleModal(intItem)}
                    >
                      Reschedule / Edit
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Create / Edit / Reschedule Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingInterview
            ? `Reschedule / Edit Interview — ${editingInterview.student}`
            : 'Schedule New Interview'
        }
        subtitle="Synchronizes immediately with the candidate's Interview Calendar and Application Timeline"
      >
        <form onSubmit={handleSaveInterview} className="space-y-4">
          {!editingInterview && (
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Candidate Application
              </label>
              <select
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
              >
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.student?.name} ({a.student?.roll_number}) — {a.company} (
                    {a.job?.title})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Round Name
              </label>
              <select
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
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
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
              >
                <option value="ONLINE">Online (Meeting URL)</option>
                <option value="IN_PERSON">In-Person (Physical Venue)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Interview Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Reporting Time"
              value={reportingTime}
              onChange={(e) => setReportingTime(e.target.value)}
              placeholder="11:30 AM"
              required
            />
            <Input
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="IST (UTC+5:30)"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Venue / Room Name"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="CDC Interview Suite B"
              required
            />
            <Input
              label="Meeting URL (if Online)"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/ptk-panel-room"
            />
          </div>

          <Input
            label="Assigned Panelists (Comma-separated)"
            value={panelists}
            onChange={(e) => setPanelists(e.target.value)}
            placeholder="David Chen (VP Eng), Anjali Menon"
            required
          />

          {editingInterview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Attendance Status
                </label>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Round Result
                </label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PASSED">PASSED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Panelist Notes / Evaluation Feedback
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter panel evaluation notes or joining instructions..."
              className="w-full rounded-2xl border border-black/15 p-3 text-xs text-[#0B0B0F] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingInterview
                ? 'Save Schedule & Result'
                : 'Confirm Interview Slot'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Interview Confirmation Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() =>
          setCancelModal({ isOpen: false, interview: null, reason: '' })
        }
        title={`Cancel Interview — ${cancelModal.interview?.student || ''}?`}
        subtitle={
          cancelModal.interview
            ? `${cancelModal.interview.company} · ${cancelModal.interview.round_name} (${cancelModal.interview.date})`
            : ''
        }
      >
        <form onSubmit={handleConfirmCancelInterview} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-950">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Confirm Interview Cancellation</p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Cancelling marks the interview slot as CANCELLED, records the reason in the application status history, and notifies the candidate.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Cancellation Reason (Sent to Candidate)
            </label>
            <textarea
              rows={2}
              value={cancelModal.reason}
              onChange={(e) =>
                setCancelModal({ ...cancelModal, reason: e.target.value })
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
                setCancelModal({ isOpen: false, interview: null, reason: '' })
              }
            >
              Keep Scheduled
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="bg-rose-600 hover:bg-rose-700"
            >
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
