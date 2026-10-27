import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import offersService from '../../services/offersService.js';
import placementsService from '../../services/placementsService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  CheckCircle2,
  Download,
  ShieldCheck,
  PartyPopper,
  AlertTriangle,
  XCircle,
  Clock,
  Lock,
  Sparkles,
} from 'lucide-react';
import { downloadDemoOfferPdf } from '../../utils/offerPdfGenerator.js';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';

export default function StudentMyPlacement() {
  const { user, showToast } = useAuth();
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    offer: null,
    action: null, // 'ACCEPTED' | 'DECLINED'
  });

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#F5C451', '#10B981', '#6366F1'],
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentOffers, myPlacement] = await Promise.all([
        offersService.getMyOffers().catch(() => []),
        placementsService.getMyPlacement().catch(() => null),
      ]);
      setOffers(studentOffers || []);
      setPlacement(myPlacement);
      setSelectedOfferId((prev) => {
        if (prev && studentOffers.some((o) => o.offer_id === prev)) return prev;
        return studentOffers[0]?.offer_id || null;
      });
    } catch (err) {
      console.error('Failed to load placement/offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fireConfetti();
  }, [user?.id]);

  const handleConfirmDecision = async () => {
    const { offer, action } = confirmModal;
    if (!offer || !action) return;

    try {
      if (action === 'ACCEPTED') {
        await offersService.acceptOffer(offer.offer_id);
        fireConfetti();
        toast.placement(
          `Offer Accepted: ${offer.company}`,
          `Confirmed ${offer.package} LPA (${offer.tier} Tier) — placement recorded!`
        );
      } else {
        await offersService.declineOffer(offer.offer_id);
        toast.warning(
          `Offer Declined: ${offer.company}`,
          `You have formally declined the ${offer.company} offer.`
        );
      }
      await loadData();
      setConfirmModal({ isOpen: false, offer: null, action: null });
      setDecisionNote('');
    } catch (err) {
      toast.error(
        'Action Blocked by Placement Policy',
        err.response?.data?.detail || err.message || 'This offer decision is not permitted by placement policy.'
      );
      setConfirmModal({ isOpen: false, offer: null, action: null });
    }
  };

  const formatStatusLabel = (status) => {
    if (status === 'ACCEPTED') return 'Accepted';
    if (status === 'DECLINED') return 'Declined';
    if (status === 'EXPIRED') return 'Expired';
    return 'Pending Decision';
  };

  const activeOffer =
    offers.find((o) => (o.offer_id || o.id) === selectedOfferId) || offers[0];

  const activeOfferStatus = activeOffer?.status || activeOffer?.offer_status || 'PENDING';
  const activeOfferPackage = Number(activeOffer?.package || activeOffer?.package_lpa || 0).toFixed(2);
  const activeOfferBase = Number(activeOffer?.base_lpa || 0).toFixed(2);
  const activeOfferBonus = Number(activeOffer?.bonus_lpa || 0).toFixed(2);
  const activeOfferEsop = Number(activeOffer?.esop_lpa || activeOffer?.esop_value || 0).toFixed(2);

  const policyEval = activeOffer?.policy_evaluation || {
    can_accept: activeOfferStatus === 'PENDING',
    can_decline: activeOfferStatus === 'PENDING',
    is_decided: activeOfferStatus !== 'PENDING',
    is_upgrade: false,
    supersedes_offer: null,
    lock_reason: null,
  };

  const handleDownloadDemoOfferDocument = (offer) => {
    if (!offer) {
      toast.warning('Offer Record Missing', 'Please select a valid offer before downloading.');
      return;
    }
    const result = downloadDemoOfferPdf(offer, user);
    if (!result.success) {
      toast.warning('PDF Generation Failed', result.error || 'Could not generate Offer PDF.');
      return;
    }
    showToast(`Downloaded Offer PDF (${result.filename})`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header with celebration button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F]">
            My Placement Offers & Compensation Breakdown
          </h2>
          <p className="text-xs text-[#64748B]">
            Review Base, Bonus, and ESOP components, make policy-verified offer decisions, and download offer documents
          </p>
        </div>

        <button
          type="button"
          onClick={fireConfetti}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <PartyPopper className="w-4 h-4" />
          <span>Celebrate Again</span>
        </button>
      </div>

      {/* Verified Placement Record Card if Placed */}
      {placement && (
        <div className="p-6 rounded-3xl bg-emerald-950 text-white border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Official Placement Confirmed
              </span>
              <h3 className="font-display font-extrabold text-xl text-white">
                {placement.company} — {placement.job_role}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Verified package: <strong className="text-emerald-300">{Number(placement.package).toFixed(2)} LPA</strong> · Enrolled: {placement.placement_date}
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
            PLACED
          </span>
        </div>
      )}

      {/* Configured Institutional Offer Policy Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-bold">
              Configured CDC Offer Policy: Single-offer policy with Dream-to-Super-Dream Tier Upgrade
            </p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Tier hierarchy: Core &lt; Dream &lt; Super Dream. Accepting a higher-tier offer automatically supersedes a lower-tier accepted offer.
            </p>
          </div>
        </div>
      </div>

      {/* Offer Selector Tabs if student has multiple offers */}
      {offers.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {offers.map((off) => {
            const offId = off.offer_id || off.id;
            const offStatus = off.status || off.offer_status || 'PENDING';
            const offPkg = Number(off.package || off.package_lpa || 0).toFixed(2);
            return (
              <button
                key={offId}
                type="button"
                onClick={() => setSelectedOfferId(offId)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  (activeOffer?.offer_id || activeOffer?.id) === offId
                    ? 'bg-[#0B0B0F] text-white border-[#0B0B0F] shadow-sm'
                    : 'bg-white text-[#475569] border-black/10 hover:border-black/25'
                }`}
              >
                <span>{off.company}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/15">
                  {off.tier} · {offPkg} LPA
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    offStatus === 'ACCEPTED'
                      ? 'bg-emerald-500 text-white'
                      : offStatus === 'DECLINED' || offStatus === 'EXPIRED'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-400 text-black'
                  }`}
                >
                  {formatStatusLabel(offStatus)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* BIG CELEBRATION OFFER CARD */}
      {activeOffer && (
        <div className="rounded-[40px] bg-gradient-to-tr from-[#0B0B0F] via-[#1E1E28] to-[#0B0B0F] text-white p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Top status & tier badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${
                    activeOfferStatus === 'ACCEPTED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : activeOfferStatus === 'DECLINED' ||
                        activeOfferStatus === 'EXPIRED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {activeOfferStatus === 'ACCEPTED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : activeOfferStatus === 'DECLINED' ||
                    activeOfferStatus === 'EXPIRED' ? (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Status: {formatStatusLabel(activeOfferStatus)}</span>
                </div>

                <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-bold">
                  {activeOffer.tier} Tier
                </span>
              </div>

              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                OFFER #{activeOffer.offer_id || activeOffer.id}
              </span>
            </div>

            {/* Main Title & Company */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-300">
                Total Compensation: {activeOfferPackage} LPA
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
                {activeOffer.company}
              </h1>
              <p className="text-sm md:text-base text-slate-300 font-medium">
                {activeOffer.job_title || activeOffer.job_role || 'Software Engineering'} (Full-Time)
              </p>
            </div>

            {/* Base, Bonus, and ESOP Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                  Base Salary
                </span>
                <span className="font-display font-black text-3xl text-white tracking-tight tabular-nums">
                  {activeOfferBase} LPA
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Fixed annual cash
                </span>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                  Performance Bonus
                </span>
                <span className="font-display font-bold text-2xl text-emerald-400 tracking-tight tabular-nums">
                  {activeOfferBonus} LPA
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Annual performance variable
                </span>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                  ESOP / Equity Grant
                </span>
                <span className="font-display font-bold text-2xl text-amber-300 tracking-tight tabular-nums">
                  {activeOfferEsop} LPA
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Vested equity allocation
                </span>
              </div>
            </div>

            {/* Candidate details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Candidate Name
                </span>
                <span className="font-bold text-white block mt-0.5">
                  {user?.name || activeOffer.student_name || activeOffer.student || 'Candidate'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Roll Number
                </span>
                <span className="font-bold text-white block mt-0.5 font-mono">
                  {user?.roll_number || activeOffer.roll_number || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Department
                </span>
                <span className="font-bold text-white block mt-0.5">
                  {user?.department || activeOffer.department || 'Engineering'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Joining Date
                </span>
                <span className="font-bold text-white block mt-0.5">
                  {activeOffer.joining_date || 'July 15, 2027'}
                </span>
              </div>
            </div>

            {/* Action buttons: Accept / Decline with Policy Evaluation & Confirmation Modal */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-slate-300">
                  Offer Record · University CDC & {activeOffer.company} People Team
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="glass"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownloadDemoOfferDocument(activeOffer)}
                  className="text-white hover:bg-white/20 border-white/20"
                >
                  Download Offer PDF
                </Button>

                {policyEval.is_decided ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-slate-200 text-xs font-bold border border-white/15">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Decision Recorded: {formatStatusLabel(activeOffer.offer_status)} (Duplicate Decisions Locked)
                  </span>
                ) : !policyEval.can_accept && policyEval.lock_reason ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-amber-200 text-xs font-bold border border-amber-400/30">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      {policyEval.lock_reason}
                    </span>
                    {policyEval.can_decline && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            offer: activeOffer,
                            action: 'DECLINED',
                          })
                        }
                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30"
                      >
                        Decline Offer
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!policyEval.can_accept}
                      onClick={() =>
                        setConfirmModal({
                          isOpen: true,
                          offer: activeOffer,
                          action: 'ACCEPTED',
                        })
                      }
                      className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                    >
                      {policyEval.is_upgrade
                        ? `Accept & Upgrade to ${activeOffer.tier}`
                        : 'Accept Offer'}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!policyEval.can_decline}
                      onClick={() =>
                        setConfirmModal({
                          isOpen: true,
                          offer: activeOffer,
                          action: 'DECLINED',
                        })
                      }
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30"
                    >
                      Decline Offer
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* TPO Coordinator Support Bar (Call tel: + Demo Inbox Message) */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white">
                  Need Offer Policy Clarification? Contact TPO Coordinator
                </p>
                <p className="text-[11px] text-slate-400">
                  Raghav Menon · Senior Placement Coordinator (TPO) · +91 98200 22014
                </p>
              </div>
              <ContactActionButtons
                target={{
                  id: 'staff-raghav',
                  name: 'Raghav Menon',
                  role: 'STAFF',
                  phone: '+91 98200 22014',
                  email: 'raghav.tpo@placetrack.edu',
                  subtitle: 'Senior Placement Coordinator (TPO)',
                }}
                subject={`Offer Policy Query: ${activeOffer.company} (${activeOffer.package || activeOffer.package_lpa} LPA)`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Accept / Decline */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal({ isOpen: false, offer: null, action: null });
          setDecisionNote('');
        }}
        title={
          confirmModal.action === 'ACCEPTED'
            ? `Accept Offer from ${confirmModal.offer?.company}?`
            : `Decline Offer from ${confirmModal.offer?.company}?`
        }
        subtitle={`${confirmModal.offer?.job_role || confirmModal.offer?.job_title || 'Role'} · ${confirmModal.offer?.package || confirmModal.offer?.package_lpa} LPA (${confirmModal.offer?.tier} Tier)`}
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <p className="font-bold">
              Single-offer policy: accepting locks other offers unless the new company is a higher tier.
            </p>
            <p className="text-[11px] text-amber-800">
              {confirmModal.action === 'ACCEPTED'
                ? confirmModal.offer?.policy_evaluation?.is_upgrade
                  ? `Accepting this ${confirmModal.offer?.tier} offer will automatically supersede your previously accepted ${confirmModal.offer?.policy_evaluation?.supersedes_offer} offer and update both application timelines.`
                  : `By accepting ${confirmModal.offer?.company} (${confirmModal.offer?.tier} Tier), any same-tier or lower-tier offers will be locked and your application timeline will move to Offer Accepted.`
                : `Declining ${confirmModal.offer?.company} is final and updates your application timeline to Offer Declined.`}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/5 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-[#64748B] block uppercase">Base</span>
              <span className="font-bold text-[#0B0B0F]">{confirmModal.offer?.base_lpa} LPA</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block uppercase">Bonus</span>
              <span className="font-bold text-emerald-700">{confirmModal.offer?.bonus_lpa} LPA</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block uppercase">ESOP</span>
              <span className="font-bold text-violet-700">{confirmModal.offer?.esop_lpa ?? confirmModal.offer?.esop_value ?? '0'} LPA</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Optional Candidate Decision Note (Recorded in Application Timeline)
            </label>
            <input
              type="text"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="e.g., Excited to join the core engineering team in July 2027"
              className="w-full px-4 py-2.5 rounded-full bg-white border border-black/10 text-xs font-medium text-[#0B0B0F] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => {
                setConfirmModal({ isOpen: false, offer: null, action: null });
                setDecisionNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleConfirmDecision}
              className={
                confirmModal.action === 'ACCEPTED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }
            >
              Confirm {confirmModal.action === 'ACCEPTED' ? 'Acceptance' : 'Decline'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
