import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  CheckCircle2,
  XCircle,
  Award,
  MessageSquare,
  Layers,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';

export default function StaffResultsSelectionPage() {
  const { user, activeRole, showToast } = useAuth();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback & Stage Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [stageDraft, setStageDraft] = useState('INTERVIEW');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Process Offer Modal
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerApp, setOfferApp] = useState(null);
  const [baseLpa, setBaseLpa] = useState('13.5');
  const [bonusLpa, setBonusLpa] = useState('2.5');
  const [esopLpa, setEsopLpa] = useState('2.0');
  const [joiningDate, setJoiningDate] = useState('August 01, 2027');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [apps, ints] = await Promise.all([
        mockApi.getApplications(),
        mockApi.getInterviews(),
      ]);
      setApplications(apps);
      setInterviews(ints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const openEvaluateModal = (app) => {
    setSelectedApp(app);
    setFeedbackDraft(app.feedback || '');
    setStageDraft(app.status || 'INTERVIEW');
    setIsFeedbackModalOpen(true);
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    await mockApi.updateApplicationStatus(selectedApp.id, stageDraft, feedbackDraft, {
      actor: `${user?.name || 'Raghav Menon'} (${activeRole || 'STAFF'})`,
    });
    await loadAll();
    setIsFeedbackModalOpen(false);
    showToast(`Recorded ${stageDraft} result & feedback for ${selectedApp.student?.name}`);
  };

  const openProcessOfferModal = (app) => {
    setOfferApp(app);
    const pkg = Number(app.job?.package_lpa || 16.0);
    setBaseLpa((pkg * 0.75).toFixed(1));
    setBonusLpa((pkg * 0.15).toFixed(1));
    setEsopLpa((pkg * 0.1).toFixed(1));
    setIsOfferModalOpen(true);
  };

  const handleCreateOfferRecord = async (e) => {
    e.preventDefault();
    if (!offerApp) return;
    const base = parseFloat(baseLpa) || 12.0;
    const bonus = parseFloat(bonusLpa) || 2.0;
    const esop = parseFloat(esopLpa) || 1.0;
    const total = +(base + bonus + esop).toFixed(1);

    await mockApi.createOffer({
      student_id: offerApp.student_id || offerApp.studentId,
      company: offerApp.company,
      job_role: offerApp.job?.title || 'Software Engineer',
      base_lpa: base,
      bonus_lpa: bonus,
      esop_value: esop,
      package_lpa: total,
      joining_date: joiningDate,
      offer_status: 'PENDING',
    });

    await loadAll();
    setIsOfferModalOpen(false);
    showToast(`Processed ${total} LPA offer record for ${offerApp.student?.name}`);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;
  const interviewCount = applications.filter(
    (a) => a.status === 'INTERVIEW' || a.status === 'SHORTLISTED'
  ).length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            TPO Evaluation & Selection Desk
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            Results, Selection & Offer Processing
          </h2>
          <p className="text-xs text-[#64748B]">
            Record interview feedback and round outcomes, update application stages, and issue fictional offer records
          </p>
        </div>
      </div>

      {/* Operational Report KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard
          title="Total Applications"
          value={applications.length}
          suffix="Active"
          icon={FileSpreadsheet}
          accentColor="lavender"
        />
        <StatCard
          title="In Technical / HR"
          value={interviewCount}
          suffix="Candidates"
          icon={Clock}
          accentColor="yellow"
        />
        <StatCard
          title="Selected for Offer"
          value={selectedCount}
          suffix="Cleared"
          icon={CheckCircle2}
          accentColor="mint"
        />
        <StatCard
          title="Not Selected"
          value={rejectedCount}
          suffix="Archived"
          icon={XCircle}
          accentColor="peach"
        />
      </div>

      {/* Candidate Selection & Feedback Cards */}
      <div className="space-y-4">
        {applications.map((app) => {
          const linkedInterview = interviews.find(
            (i) => (i.application_id || i.applicationId) === app.id
          );
          return (
            <GlassCard key={app.id} variant="white" className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
                      {app.company}
                    </span>
                    <span className="text-xs font-bold text-[#0B0B0F]">
                      {app.job?.title} ({app.job?.package_lpa} LPA)
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Current Round: {app.current_round || app.currentRound}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#0B0B0F] mt-1.5">
                    {app.student?.name}{' '}
                    <span className="text-xs font-mono text-[#64748B]">
                      ({app.student?.roll_number} · {app.student?.department} · CGPA{' '}
                      {app.student?.cgpa})
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {linkedInterview && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Attendance: {linkedInterview.attendance || 'SCHEDULED'}
                    </span>
                  )}
                  <StatusBadge status={app.status} size="md" />
                </div>
              </div>

              {/* 5-Stage Round Outcomes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(app.rounds || []).map((r) => (
                  <div
                    key={r.round_number}
                    className={`p-2.5 rounded-2xl border text-xs ${
                      r.result === 'PASSED'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : r.result === 'FAILED'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-slate-50 border-black/5 text-slate-700'
                    }`}
                  >
                    <p className="font-bold truncate">
                      {r.round_number}. {r.round_name}
                    </p>
                    <p className="text-[10px] font-extrabold uppercase mt-0.5">
                      {r.result}
                    </p>
                  </div>
                ))}
              </div>

              {/* Feedback & Action Bar */}
              <div className="pt-3 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-[#475569]">
                  <strong className="text-[#0B0B0F]">Panelist Feedback: </strong>
                  {app.feedback || 'No evaluation notes recorded yet.'}
                </p>

                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <ContactActionButtons
                    compact
                    target={{
                      id: app.student_id || app.studentId || app.student?.id || 'student-rohit',
                      name: app.student?.name || 'Candidate',
                      role: 'STUDENT',
                      phone: app.student?.phone || '+91 98202 33445',
                      email: app.student?.email || '',
                      subtitle: `${app.student?.roll_number} · ${app.student?.department}`,
                    }}
                    subject={`Selection Update: ${app.company} (${app.job?.title})`}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={MessageSquare}
                    onClick={() => openEvaluateModal(app)}
                  >
                    Record Result & Feedback
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Award}
                    onClick={() => openProcessOfferModal(app)}
                  >
                    Process Offer Record
                  </Button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Record Result & Feedback Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title={
          selectedApp
            ? `Record Result & Feedback — ${selectedApp.student?.name}`
            : 'Record Selection Result'
        }
        subtitle={selectedApp ? `${selectedApp.company} · ${selectedApp.job?.title}` : ''}
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Update Application Stage
            </label>
            <select
              value={stageDraft}
              onChange={(e) => setStageDraft(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
            >
              <option value="APPLIED">APPLIED (Application Received)</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (TPO Eligibility Review)</option>
              <option value="SHORTLISTED">SHORTLISTED (Shortlisted for Drive)</option>
              <option value="ASSESSMENT">ASSESSMENT (Online Test Stage)</option>
              <option value="INTERVIEW">INTERVIEW (Technical / HR Panel)</option>
              <option value="SELECTED">SELECTED (Cleared All Rounds)</option>
              <option value="OFFER_RELEASED">OFFER_RELEASED (Offer Extended)</option>
              <option value="REJECTED">REJECTED (Did Not Clear)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Interviewer Feedback (Visible to Student on My Interviews & Applications)
            </label>
            <textarea
              rows={3}
              value={feedbackDraft}
              onChange={(e) => setFeedbackDraft(e.target.value)}
              placeholder="Enter panelist evaluation feedback..."
              className="w-full rounded-2xl border border-black/15 p-3 text-xs text-[#0B0B0F] outline-none"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsFeedbackModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Stage & Feedback
            </Button>
          </div>
        </form>
      </Modal>

      {/* Process Fictional Offer Record Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title={
          offerApp
            ? `Issue Fictional Offer — ${offerApp.student?.name}`
            : 'Issue Fictional Offer Record'
        }
        subtitle="Creates a verified offer in the shared store and notifies the student"
      >
        <form onSubmit={handleCreateOfferRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Base Salary (LPA)"
              type="number"
              step="0.5"
              value={baseLpa}
              onChange={(e) => setBaseLpa(e.target.value)}
              required
            />
            <Input
              label="Joining Bonus (LPA)"
              type="number"
              step="0.5"
              value={bonusLpa}
              onChange={(e) => setBonusLpa(e.target.value)}
              required
            />
            <Input
              label="ESOP Grant (LPA)"
              type="number"
              step="0.5"
              value={esopLpa}
              onChange={(e) => setEsopLpa(e.target.value)}
              required
            />
          </div>

          <Input
            label="Expected Joining Date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsOfferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Issue Offer to Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
