import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  CheckCircle2,
  MessageSquare,
  Video,
  Globe,
  Building2,
  Search,
  UserCheck,
} from 'lucide-react';
import { MeetingLinkButton } from '../../components/ui/MeetingLinkButton.jsx';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';

export default function StudentInterviewsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const studentId = user?.id || 'student-rohit';
        const [intData, appData] = await Promise.all([
          mockApi.getInterviews(studentId),
          mockApi.getApplications(),
        ]);
        // Strictly scope to current student
        const studentOnly = intData.filter(
          (i) => (i.student_id || i.studentId) === studentId
        );
        setInterviews(studentOnly);
        setApplications(
          appData.filter((a) => (a.student_id || a.studentId) === studentId)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const calendarDates = useMemo(() => {
    const counts = {};
    interviews.forEach((item) => {
      if (item.date) {
        counts[item.date] = (counts[item.date] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      if (selectedDate !== 'ALL' && item.date !== selectedDate) return false;
      if (modeFilter !== 'ALL' && (item.mode || 'ONLINE') !== modeFilter) return false;
      if (resultFilter !== 'ALL' && item.result !== resultFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCompany = (item.company || '').toLowerCase().includes(q);
        const matchRound = (item.round_name || '').toLowerCase().includes(q);
        const matchJob = (item.job_title || '').toLowerCase().includes(q);
        if (!matchCompany && !matchRound && !matchJob) return false;
      }
      return true;
    });
  }, [interviews, selectedDate, modeFilter, resultFilter, searchTerm]);

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
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Personal Interview Calendar & Panel Feedback
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            My Interview Calendar ({user?.name})
          </h2>
          <p className="text-xs text-[#64748B]">
            View your scheduled interview rounds, reporting times with timezone, online or in-person modes, assigned panelists, and evaluation status
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-black/5 text-xs font-bold text-[#0B0B0F] self-start sm:self-auto">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Scoped strictly to {user?.name} ({user?.roll_number || '21EC015'})</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard
          title="My Scheduled Rounds"
          value={interviews.filter((i) => i.attendance !== 'CANCELLED').length}
          suffix="Sessions"
          icon={Calendar}
          accentColor="lavender"
        />
        <StatCard
          title="Rounds Passed"
          value={interviews.filter((i) => i.result === 'PASSED').length}
          suffix="Cleared"
          icon={CheckCircle2}
          accentColor="mint"
        />
        <StatCard
          title="Pending Results"
          value={interviews.filter((i) => i.result === 'PENDING').length}
          suffix="Awaiting"
          icon={Clock}
          accentColor="yellow"
        />
        <StatCard
          title="Active Applications"
          value={applications.length}
          suffix="Drives"
          icon={Video}
          accentColor="peach"
        />
      </div>

      {/* Interactive Date Calendar Strip & Filters */}
      <GlassCard variant="white" className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your interviews by company, role, or round..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-[#F9F9FB] border border-black/10 text-xs font-medium text-[#0B0B0F] outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-[#F9F9FB] border border-black/10 text-xs font-bold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Modes (Online & In-Person)</option>
              <option value="ONLINE">Online Virtual Rooms</option>
              <option value="IN_PERSON">In-Person Campus Venues</option>
            </select>

            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-[#F9F9FB] border border-black/10 text-xs font-bold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Result States</option>
              <option value="PENDING">Pending Evaluation</option>
              <option value="PASSED">Passed</option>
              <option value="FAILED">Not Cleared</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Date Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-black/5">
          <button
            type="button"
            onClick={() => setSelectedDate('ALL')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0 border ${
              selectedDate === 'ALL'
                ? 'bg-[#0B0B0F] text-white border-[#0B0B0F]'
                : 'bg-[#F9F9FB] text-[#475569] border-black/10 hover:border-black/25'
            }`}
          >
            All Dates ({interviews.length})
          </button>
          {calendarDates.map((d) => (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedDate(d.date)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0 border flex items-center gap-2 ${
                selectedDate === d.date
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-[#0B0B0F] border-black/10 hover:border-violet-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{d.date}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  selectedDate === d.date
                    ? 'bg-white/20 text-white'
                    : 'bg-violet-50 text-violet-700'
                }`}
              >
                {d.count}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Scheduled Interviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-[#0B0B0F]">
            Assigned Interview Panels & Virtual Rooms ({filteredInterviews.length})
          </h3>
          <span className="text-[11px] font-semibold text-[#64748B]">
            Standard Timezone: IST (UTC+5:30)
          </span>
        </div>

        {filteredInterviews.length === 0 ? (
          <GlassCard variant="white" className="p-8 text-center text-xs text-slate-500">
            No interview slots match the selected filter for {user?.name}.
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInterviews.map((intItem) => {
              const isOnline = (intItem.mode || 'ONLINE') === 'ONLINE';
              const isCancelled =
                intItem.attendance === 'CANCELLED' || intItem.result === 'CANCELLED';

              return (
                <GlassCard
                  key={intItem.id}
                  variant="white"
                  className={`p-6 space-y-4 flex flex-col justify-between ${
                    isCancelled ? 'opacity-75 bg-slate-50' : ''
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                            {intItem.company}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              isOnline
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {isOnline ? (
                              <Globe className="w-3 h-3" />
                            ) : (
                              <Building2 className="w-3 h-3" />
                            )}
                            {isOnline ? 'Online Mode' : 'In-Person Mode'}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-lg text-[#0B0B0F] mt-1.5">
                          {intItem.round_name}
                        </h4>
                        <p className="text-xs font-medium text-[#64748B]">
                          {intItem.job_title} · Candidate: {intItem.student_name || user?.name} (
                          {intItem.roll_number || user?.roll_number})
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={intItem.result || 'PENDING'} />
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Attendance: {intItem.attendance || 'SCHEDULED'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/5 space-y-2.5 text-xs text-[#475569]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <span className="flex items-center gap-1.5 font-bold text-[#0B0B0F]">
                          <Calendar className="w-3.5 h-3.5 text-violet-600" />
                          Date: {intItem.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-[#0B0B0F]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {intItem.reporting_time} ({intItem.timezone || 'IST (UTC+5:30)'})
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-black/5">
                        <span className="flex items-center gap-1.5 font-medium text-[#0B0B0F]">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          Venue: {intItem.venue || intItem.location}
                        </span>
                        <MeetingLinkButton interview={intItem} compact />
                      </div>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-black/5">
                        <Users className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span>
                          Assigned Panel:{' '}
                          <strong className="text-[#0B0B0F]">
                            {Array.isArray(intItem.panelists)
                              ? intItem.panelists.join(', ')
                              : intItem.interviewer}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-violet-50/60 border border-violet-100 text-xs text-[#0B0B0F] flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[11px] uppercase tracking-wider text-violet-800">
                          Permitted Evaluation Notes & Instructions
                        </span>
                        <p className="text-xs text-slate-700 mt-0.5">
                          {intItem.feedback ||
                            'Evaluation feedback will be published by the panel after the round concludes.'}
                        </p>
                      </div>
                    </div>

                    {/* TPO Desk Contact & Join Meeting Action Bar */}
                    <div className="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#64748B]">
                        TPO Interview Desk Support:
                      </span>
                      <ContactActionButtons
                        compact
                        target={{
                          id: 'staff-raghav',
                          name: 'Raghav Menon (TPO)',
                          role: 'STAFF',
                          phone: '+91 98200 22014',
                          email: 'raghav.tpo@placetrack.edu',
                          subtitle: 'Senior Placement Coordinator (TPO)',
                        }}
                        subject={`Interview Query: ${intItem.company} — ${intItem.round_name}`}
                      />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
