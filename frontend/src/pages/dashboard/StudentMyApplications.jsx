import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ApplicationTimeline from '../../components/ui/ApplicationTimeline.jsx';
import { MeetingLinkButton } from '../../components/ui/MeetingLinkButton.jsx';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Users,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Video,
  Building2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Award,
} from 'lucide-react';

export default function StudentMyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('LAST_UPDATED');

  // Detail Modal State
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const allApps = await mockApi.getApplications();
        const targetId = user?.id || 'student-rohit';
        const studentApps = allApps.filter(
          (a) => (a.student_id || a.studentId) === targetId
        );
        setApplications(studentApps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const filteredAndSortedApps = useMemo(() => {
    return applications
      .filter((app) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = (app.company || '').toLowerCase().includes(q);
          const matchTitle = (app.job?.title || '').toLowerCase().includes(q);
          const matchId = (app.id || '').toLowerCase().includes(q);
          const matchRound = (app.current_round || '').toLowerCase().includes(q);
          if (!matchCompany && !matchTitle && !matchId && !matchRound) return false;
        }

        if (statusFilter !== 'ALL') {
          if (statusFilter === 'REVIEW') {
            if (!['APPLIED', 'UNDER_REVIEW'].includes(app.status)) return false;
          } else if (statusFilter === 'SHORTLISTED') {
            if (!['SHORTLISTED', 'ASSESSMENT'].includes(app.status)) return false;
          } else if (statusFilter === 'INTERVIEW') {
            if (app.status !== 'INTERVIEW') return false;
          } else if (statusFilter === 'OFFERS') {
            if (
              ![
                'SELECTED',
                'OFFER_RELEASED',
                'OFFER_ACCEPTED',
                'OFFER_DECLINED',
                'OFFER_EXPIRED',
              ].includes(app.status)
            )
              return false;
          } else if (statusFilter === 'REJECTED') {
            if (app.status !== 'REJECTED') return false;
          }
        }

        if (tierFilter !== 'ALL') {
          const appTier = app.job?.tier || app.linked_offer?.tier || 'Dream';
          if (appTier !== tierFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PACKAGE_DESC') {
          return Number(b.job?.package_lpa || 0) - Number(a.job?.package_lpa || 0);
        }
        if (sortBy === 'APPLIED_DATE') {
          return String(b.applied_date || '').localeCompare(String(a.applied_date || ''));
        }
        if (sortBy === 'COMPANY_AZ') {
          return String(a.company || '').localeCompare(String(b.company || ''));
        }
        // Default: LAST_UPDATED
        return String(b.last_update || '').localeCompare(String(a.last_update || ''));
      });
  }, [applications, searchQuery, statusFilter, tierFilter, sortBy]);

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
            Student Application & Stage Tracker
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            My Applications ({user?.name || 'Rohit Verma'})
          </h2>
          <p className="text-xs text-[#64748B]">
            Real-time recruitment progress, drive-specific stage timelines, next required actions, upcoming interviews, and status history
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Calendar}
            onClick={() => navigate('/dashboard/my-interviews')}
          >
            My Interview Calendar
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Award}
            onClick={() => navigate('/dashboard/my-placement')}
          >
            Review My Offers
          </Button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <GlassCard variant="white" className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role, application ID, or active round..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-medium text-[#0B0B0F] placeholder:text-[#94A3B8] focus:outline-none focus:border-violet-600"
            />
          </div>

          {/* Tier Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-semibold text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Drive Tiers</option>
              <option value="Super Dream">Super Dream Tier</option>
              <option value="Dream">Dream Tier</option>
              <option value="Core">Core Tier</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-4 flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#F9F9FB] border border-black/10 text-xs font-semibold text-[#0B0B0F] outline-none"
            >
              <option value="LAST_UPDATED">Sort: Last Updated (Newest)</option>
              <option value="APPLIED_DATE">Sort: Application Date</option>
              <option value="PACKAGE_DESC">Sort: Highest Package (LPA)</option>
              <option value="COMPANY_AZ">Sort: Company Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-black/5">
          {[
            { id: 'ALL', label: `All Applications (${applications.length})` },
            { id: 'REVIEW', label: 'Applied / Under Review' },
            { id: 'SHORTLISTED', label: 'Shortlisted / Assessment' },
            { id: 'INTERVIEW', label: 'In Interview' },
            { id: 'OFFERS', label: 'Selected / Offers' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#0B0B0F] text-white shadow-xs'
                  : 'bg-[#F4F4F7] text-[#64748B] hover:text-[#0B0B0F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Applications List */}
      {filteredAndSortedApps.length === 0 ? (
        <GlassCard variant="white" className="p-10 text-center space-y-3">
          <p className="font-display font-bold text-base text-[#0B0B0F]">
            No matching applications found
          </p>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Try clearing your search or status filter, or browse open campus drives to submit a new application.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setTierFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedApps.map((app) => {
            const elig = app.eligibility || { eligible: true, matchPercent: 92 };
            const nextAction = app.next_required_action || {};
            const upcomingInt = app.upcoming_interview;

            return (
              <GlassCard
                key={app.id}
                variant="white"
                className="p-6 md:p-7 space-y-6"
              >
                {/* Top Row: Company, Job Title, Eligibility, Package & Status */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-100 to-indigo-100 flex items-center justify-center font-display font-black text-sm text-violet-700 flex-shrink-0">
                      {app.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                          {app.job?.title}
                        </h3>
                        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
                          {app.company}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {app.job?.tier || 'Dream'} Tier
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap">
                        <span>
                          App ID: <strong className="font-mono text-[#0B0B0F]">{app.id}</strong>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Applied: <strong className="text-[#0B0B0F]">{app.applied_date}</strong>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Last Updated: <strong className="text-[#0B0B0F]">{app.last_update}</strong>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            elig.eligible ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {elig.eligible
                            ? `Eligible (${elig.matchPercent}% Match)`
                            : `Eligibility Warning (${elig.matchPercent}% Match)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-display font-bold text-base text-[#0B0B0F] bg-[#F4F4F7] px-3.5 py-1 rounded-full tabular-nums">
                      {app.job?.package_lpa} LPA
                    </span>
                    <StatusBadge status={app.status} size="md" />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedApp(app)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Next Required Action & Upcoming Interview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Next Required Action Card */}
                  <div
                    className={`${
                      upcomingInt ? 'lg:col-span-6' : 'lg:col-span-12'
                    } p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                      nextAction.urgent
                        ? 'bg-amber-50/70 border-amber-200/90'
                        : 'bg-violet-50/50 border-violet-200/70'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-800 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-violet-600" />
                          Next Required Action
                        </span>
                        {nextAction.badge && (
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              nextAction.urgent
                                ? 'bg-amber-200/80 text-amber-950'
                                : 'bg-violet-100 text-violet-800'
                            }`}
                          >
                            {nextAction.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-sm text-[#0B0B0F]">
                        {nextAction.title}
                      </h4>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        {nextAction.description}
                      </p>
                    </div>

                    {nextAction.cta_route && (
                      <div className="pt-1 flex items-center justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowRight}
                          iconPosition="right"
                          onClick={() => navigate(nextAction.cta_route)}
                        >
                          {nextAction.cta_label || 'Take Action'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Upcoming / Latest Interview Info Card */}
                  {upcomingInt && (
                    <div className="lg:col-span-6 p-4 rounded-2xl bg-[#F9F9FB] border border-black/8 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B0B0F] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-violet-600" />
                            Interview Schedule · {upcomingInt.round_name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                upcomingInt.mode === 'IN_PERSON'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {upcomingInt.mode === 'IN_PERSON' ? 'In-Person' : 'Online'}
                            </span>
                            <StatusBadge status={upcomingInt.result || 'PENDING'} size="sm" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#475569]">
                          <p className="flex items-center gap-1.5 font-semibold text-[#0B0B0F]">
                            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>
                              {upcomingInt.date} · {upcomingInt.reporting_time}{' '}
                              <span className="text-[10px] text-[#64748B]">
                                ({upcomingInt.timezone || 'IST (UTC+5:30)'})
                              </span>
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate" title={upcomingInt.venue}>
                              {upcomingInt.venue}
                            </span>
                          </p>
                        </div>

                        <p className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                          <span>
                            Assigned Panel:{' '}
                            <strong className="text-[#0B0B0F]">
                              {Array.isArray(upcomingInt.panelists)
                                ? upcomingInt.panelists.join(', ')
                                : upcomingInt.interviewer}
                            </strong>
                          </span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[#64748B]">
                          Attendance:{' '}
                          <strong className="text-[#0B0B0F]">
                            {upcomingInt.attendance || 'SCHEDULED'}
                          </strong>
                        </span>
                        <MeetingLinkButton interview={upcomingInt} compact />
                      </div>
                    </div>
                  )}
                </div>

                {/* Drive-Specific Application Timeline */}
                <ApplicationTimeline
                  stages={app.timeline_stages}
                  statusHistory={app.status_history}
                  showHistory={false}
                />

                {/* Bottom Recruiter / TPO Explanation Footer */}
                <div className="pt-2 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#64748B]">
                      <strong className="text-[#0B0B0F]">Latest Stage Note: </strong>
                      {app.feedback}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="text-xs font-bold text-violet-700 hover:text-violet-900 inline-flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View Full History & Eligibility ({app.status_history?.length || 1} events)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Application Full Detail Modal */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={
          selectedApp
            ? `${selectedApp.company} — ${selectedApp.job?.title}`
            : 'Application Details'
        }
        subtitle={
          selectedApp
            ? `Application ID: ${selectedApp.id} · Applied on ${selectedApp.applied_date} · Last Updated: ${selectedApp.last_update}`
            : ''
        }
      >
        {selectedApp && (
          <div className="space-y-5">
            {/* Summary Banner */}
            <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-black/5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                  Current Application Stage
                </span>
                <p className="font-display font-bold text-base text-[#0B0B0F]">
                  {selectedApp.current_round} ({selectedApp.job?.tier || 'Dream'} Tier ·{' '}
                  {selectedApp.job?.package_lpa} LPA)
                </p>
              </div>
              <StatusBadge status={selectedApp.status} size="md" />
            </div>

            {/* Next Required Action */}
            {selectedApp.next_required_action && (
              <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-800">
                  Next Required Action
                </span>
                <p className="font-display font-bold text-sm text-[#0B0B0F]">
                  {selectedApp.next_required_action.title}
                </p>
                <p className="text-xs text-[#475569]">
                  {selectedApp.next_required_action.description}
                </p>
              </div>
            )}

            {/* Full Timeline & Status History */}
            <ApplicationTimeline
              stages={selectedApp.timeline_stages}
              statusHistory={selectedApp.status_history}
              showHistory={true}
              compact={true}
            />

            {/* Eligibility Rule Breakdown */}
            {selectedApp.eligibility?.rules && (
              <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-black/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B0B0F]">
                    Verified Eligibility Checklist
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {selectedApp.eligibility.matchPercent}% Profile Match
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedApp.eligibility.rules.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        r.passed
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <span className="font-semibold">{r.rule}</span>
                      <span className="font-mono text-[11px]">
                        {r.actual} / {r.required} ({r.passed ? 'Passed' : 'Failed'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placement Cell Coordinator Contact Strip */}
            <div className="p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#0B0B0F]">
                  Need clarification on this application stage?
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Contact Assigned TPO Coordinator: Raghav Menon (+91 98201 44510)
                </p>
              </div>
              <ContactActionButtons
                target={{
                  id: 'staff-raghav',
                  name: 'Raghav Menon',
                  role: 'STAFF',
                  phone: '+91 98201 44510',
                  department: 'Central Placement Cell',
                }}
                compact
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {selectedApp.next_required_action?.cta_route && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const route = selectedApp.next_required_action.cta_route;
                    setSelectedApp(null);
                    navigate(route);
                  }}
                >
                  {selectedApp.next_required_action.cta_label || 'Open Related Page'}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
