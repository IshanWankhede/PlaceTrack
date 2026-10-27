import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import applicationsService from '../../services/applicationsService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Users,
  Search,
  Eye,
  Building2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Video,
} from 'lucide-react';

export default function StudentMyApplications() {
  const { user } = useAuth();
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationsService.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Failed to load applications', err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user?.student_id]);

  const handleWithdraw = async (applicationId, companyName) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for ${companyName}?`)) {
      return;
    }
    setWithdrawingId(applicationId);
    try {
      await applicationsService.withdrawApplication(applicationId);
      toast.info('Application Withdrawn', `Withdrawn from ${companyName}`);
      if (selectedApp && (selectedApp.application_id || selectedApp.id) === applicationId) {
        setSelectedApp(null);
      }
      loadApplications();
    } catch (err) {
      toast.error('Withdrawal Failed', err.response?.data?.detail || err.message);
    } finally {
      setWithdrawingId(null);
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchComp = (app.company || '').toLowerCase().includes(q);
        const matchTitle = (app.title || '').toLowerCase().includes(q);
        if (!matchComp && !matchTitle) return false;
      }
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
      if (tierFilter !== 'ALL' && app.tier !== tierFilter) return false;
      return true;
    });
  }, [applications, searchQuery, statusFilter, tierFilter]);

  const canWithdraw = (status) => !['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(status);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
            My Campus Applications
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Track interview rounds, reporting schedules, venues, and live application statuses ({filteredApps.length} applications).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-black/5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">In Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="text-xs font-semibold bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] focus:outline-none"
          >
            <option value="ALL">All Tiers</option>
            <option value="CORE">CORE Tier</option>
            <option value="DREAM">DREAM Tier</option>
            <option value="SUPER_DREAM">SUPER_DREAM Tier</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search company or job title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] w-48 sm:w-64 focus:outline-none focus:border-[#0B0B0F]"
        />
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-black/5" />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <GlassCard variant="white" className="p-12 text-center space-y-3">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-display font-bold text-base text-[#0B0B0F]">No applications found</p>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Browse available placement drives to apply for matching corporate opportunities.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const appId = app.application_id || app.id;
            const interviews = app.interviews || [];
            const isNonFinal = canWithdraw(app.status);

            return (
              <GlassCard key={appId} variant="white" className="p-6 md:p-7 space-y-5">
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-display font-black text-sm">
                      {app.company?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                          {app.title}
                        </h3>
                        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
                          {app.company}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {app.tier} Tier
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Applied: {app.applied_date} · Package: <strong className="text-[#0B0B0F]">{Number(app.package).toFixed(2)} LPA</strong>
                        {app.location && ` · Location: ${app.location}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} size="md" />
                    {isNonFinal && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleWithdraw(appId, app.company)}
                        loading={withdrawingId === appId}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        Withdraw
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" icon={Eye} onClick={() => setSelectedApp(app)}>
                      Details
                    </Button>
                  </div>
                </div>

                {/* Round Tracker */}
                <div className="pt-3 border-t border-black/5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet-600" />
                    Interview Rounds ({interviews.length})
                  </h4>

                  {interviews.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No interview rounds scheduled yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {interviews.map((iv) => {
                        const isCleared = iv.result === 'CLEARED';
                        const isRejected = iv.result === 'REJECTED';
                        return (
                          <div
                            key={iv.round_number}
                            className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                              isCleared
                                ? 'bg-emerald-50/60 border-emerald-200'
                                : isRejected
                                ? 'bg-rose-50/60 border-rose-200'
                                : 'bg-slate-50 border-black/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0B0B0F]">
                                Round {iv.round_number}: {iv.round_type?.replace('_', ' ')}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCleared
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isRejected
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {iv.result || 'SCHEDULED'}
                              </span>
                            </div>

                            <p className="text-[#64748B] text-[11px]">
                              Time: <strong className="text-[#0B0B0F]">{iv.scheduled_at?.replace('T', ' ')}</strong>
                              {iv.reporting_time && ` (Reporting: ${iv.reporting_time})`}
                            </p>

                            {iv.venue && (
                              <p className="text-[#64748B] text-[11px] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                Venue: {iv.venue}
                              </p>
                            )}

                            {iv.meeting_link && (
                              <a
                                href={iv.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:underline"
                              >
                                <Video className="w-3 h-3" />
                                Join Interview Bridge
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}

                            {iv.panelists && (
                              <p className="text-[10px] text-slate-400">
                                Panelists: {iv.panelists}
                              </p>
                            )}

                            {iv.remarks && (
                              <p className="text-[11px] text-slate-600 italic bg-white/70 p-1.5 rounded-lg border border-black/5">
                                Remarks: &ldquo;{iv.remarks}&rdquo;
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Detail Drawer Modal */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? `${selectedApp.company} — ${selectedApp.title}` : 'Application Details'}
        maxWidth="max-w-lg"
      >
        {selectedApp && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-[#F6F6F8] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Application ID:</span>
                <span className="font-mono font-bold text-[#0B0B0F]">
                  #{selectedApp.application_id || selectedApp.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Status:</span>
                <StatusBadge status={selectedApp.status} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Tier:</span>
                <span className="font-bold text-[#0B0B0F]">{selectedApp.tier} Tier</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Package:</span>
                <span className="font-bold text-emerald-600">{Number(selectedApp.package).toFixed(2)} LPA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Date Applied:</span>
                <span className="font-bold text-[#0B0B0F]">{selectedApp.applied_date}</span>
              </div>
            </div>

            {canWithdraw(selectedApp.status) && (
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleWithdraw(selectedApp.application_id || selectedApp.id, selectedApp.company)}
                  className="w-full text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  Withdraw from this recruitment drive
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
