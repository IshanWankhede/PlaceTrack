import React, { useState, useEffect } from 'react';
import DataTable from '../../components/ui/DataTable.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import placementsService from '../../services/placementsService.js';
import offersService from '../../services/offersService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Download, Award, Edit3, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function PlacementsPage() {
  const { activeRole } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('placements'); // 'placements' | 'offers'
  const [placements, setPlacements] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Offer Breakdown modal
  const [editOfferModal, setEditOfferModal] = useState({
    isOpen: false,
    offer: null,
    base_lpa: '',
    bonus_lpa: '',
    esop_lpa: '',
  });
  const [savingBreakdown, setSavingBreakdown] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [placementsData, offersData] = await Promise.all([
        placementsService.getPlacements(),
        offersService.getOffers(),
      ]);
      setPlacements(Array.isArray(placementsData) ? placementsData : []);
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (err) {
      console.error('Failed to load placement records:', err);
      toast.error('Failed to load data', err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    const exportUrl = placementsService.getExportUrl();
    window.open(exportUrl, '_blank');
    toast.success('Export Started', 'Downloading verified placement records CSV');
  };

  const openBreakdownModal = (offer) => {
    setEditOfferModal({
      isOpen: true,
      offer,
      base_lpa: String(offer.base_lpa || offer.package || '0.00'),
      bonus_lpa: String(offer.bonus_lpa || '0.00'),
      esop_lpa: String(offer.esop_lpa || '0.00'),
    });
  };

  const handleSaveBreakdown = async (e) => {
    e.preventDefault();
    const { offer, base_lpa, bonus_lpa, esop_lpa } = editOfferModal;
    if (!offer) return;
    setSavingBreakdown(true);
    try {
      await offersService.updateBreakdown(offer.offer_id, {
        base_lpa: parseFloat(base_lpa) || 0,
        bonus_lpa: parseFloat(bonus_lpa) || 0,
        esop_lpa: parseFloat(esop_lpa) || 0,
      });
      toast.success('CTC Breakdown Updated', `Offer ${offer.offer_id} for ${offer.student_name}`);
      setEditOfferModal({ isOpen: false, offer: null, base_lpa: '', bonus_lpa: '', esop_lpa: '' });
      loadData();
    } catch (err) {
      toast.error('Update Failed', err.response?.data?.detail || err.message);
    } finally {
      setSavingBreakdown(false);
    }
  };

  // Filtered placements
  const filteredPlacements = placements.filter((p) => {
    if (deptFilter !== 'ALL' && p.department !== deptFilter) return false;
    if (companyFilter !== 'ALL' && p.company !== companyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.student_name || '').toLowerCase().includes(q);
      const matchRoll = (p.roll_number || '').toLowerCase().includes(q);
      const matchComp = (p.company || '').toLowerCase().includes(q);
      const matchRole = (p.job_role || '').toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchComp && !matchRole) return false;
    }
    return true;
  });

  // Filtered offers
  const filteredOffers = offers.filter((o) => {
    if (companyFilter !== 'ALL' && o.company !== companyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (o.student_name || '').toLowerCase().includes(q);
      const matchComp = (o.company || '').toLowerCase().includes(q);
      const matchTitle = (o.job_title || '').toLowerCase().includes(q);
      if (!matchName && !matchComp && !matchTitle) return false;
    }
    return true;
  });

  // Unique companies for filter
  const companyOptions = Array.from(
    new Set([...placements.map((p) => p.company), ...offers.map((o) => o.company)].filter(Boolean))
  );

  const placementColumns = [
    {
      header: 'Student',
      accessor: 'student_name',
      render: (row) => (
        <div>
          <p className="font-bold text-xs text-[#0B0B0F]">{row.student_name}</p>
          <p className="text-[11px] text-[#64748B]">{row.roll_number}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <span className="text-xs font-semibold text-[#475569]">{row.department}</span>
      ),
    },
    {
      header: 'Company & Role',
      accessor: 'company',
      render: (row) => (
        <div>
          <p className="font-bold text-xs text-[#0B0B0F]">{row.company}</p>
          <p className="text-[11px] text-violet-600 font-semibold">{row.job_role}</p>
        </div>
      ),
    },
    {
      header: 'Verified Package',
      accessor: 'package',
      render: (row) => (
        <span className="font-display font-extrabold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          {Number(row.package).toFixed(2)} LPA
        </span>
      ),
    },
    {
      header: 'Placement Date',
      accessor: 'placement_date',
      render: (row) => (
        <span className="text-xs text-[#64748B] font-medium">{row.placement_date}</span>
      ),
    },
  ];

  const offerColumns = [
    {
      header: 'Student',
      accessor: 'student_name',
      render: (row) => (
        <p className="font-bold text-xs text-[#0B0B0F]">{row.student_name}</p>
      ),
    },
    {
      header: 'Company',
      accessor: 'company',
      render: (row) => (
        <div>
          <p className="font-bold text-xs text-[#0B0B0F]">{row.company}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {row.tier} Tier
          </span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'job_title',
      render: (row) => <span className="text-xs font-semibold text-[#475569]">{row.job_title}</span>,
    },
    {
      header: 'CTC Breakdown (LPA)',
      accessor: 'package',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-emerald-600">{Number(row.package).toFixed(2)} LPA Total</p>
          <p className="text-[10px] text-slate-400">
            Base: {Number(row.base_lpa).toFixed(2)} · Bonus: {Number(row.bonus_lpa).toFixed(2)} · ESOP: {Number(row.esop_lpa).toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      header: 'Offer Status',
      accessor: 'status',
      render: (row) => {
        const s = row.status;
        const cls =
          s === 'ACCEPTED'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : s === 'PENDING'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : s === 'SUPERSEDED'
            ? 'bg-purple-50 text-purple-700 border-purple-200'
            : 'bg-slate-100 text-slate-600 border-slate-200';
        return (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cls}`}>
            {s}
          </span>
        );
      },
    },
    {
      header: 'Action',
      sortable: false,
      render: (row) => (
        (activeRole === 'ADMIN' || activeRole === 'STAFF') && (
          <button
            type="button"
            onClick={() => openBreakdownModal(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            title="Edit CTC breakdown"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
            Offers & Placement Outcomes
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verified campus placements, single/dream-offer policy compliance, and released offer letters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExportCSV} icon={Download}>
            Export Placements CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/5 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('placements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'placements'
              ? 'bg-[#0B0B0F] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B0B0F] hover:bg-black/5'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified Placements ({filteredPlacements.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'offers'
              ? 'bg-[#0B0B0F] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B0B0F] hover:bg-black/5'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Offer Letters & CTC Breakdown ({filteredOffers.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-black/5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'placements' && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs font-semibold bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Telecommunication">ENTC</option>
              <option value="Mechanical Engineering">Mechanical</option>
            </select>
          )}

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="text-xs font-semibold bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] focus:outline-none"
          >
            <option value="ALL">All Companies</option>
            {companyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search student, roll number, company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] w-48 sm:w-64 focus:outline-none focus:border-[#0B0B0F]"
        />
      </div>

      {/* Table Data */}
      {activeTab === 'placements' ? (
        <DataTable
          columns={placementColumns}
          data={filteredPlacements}
          loading={loading}
          emptyMessage="No verified placements match the active filters."
        />
      ) : (
        <DataTable
          columns={offerColumns}
          data={filteredOffers}
          loading={loading}
          emptyMessage="No offers found matching the active filters."
        />
      )}

      {/* EDIT OFFER BREAKDOWN MODAL */}
      <Modal
        isOpen={editOfferModal.isOpen}
        onClose={() => setEditOfferModal({ isOpen: false, offer: null, base_lpa: '', bonus_lpa: '', esop_lpa: '' })}
        title="Edit CTC Breakdown"
        maxWidth="max-w-sm"
      >
        {editOfferModal.offer && (
          <form onSubmit={handleSaveBreakdown} className="space-y-4 pt-2">
            <p className="text-xs text-slate-500">
              Set verified compensation components for{' '}
              <strong className="text-[#0B0B0F]">{editOfferModal.offer.student_name}</strong> at{' '}
              <strong className="text-[#0B0B0F]">{editOfferModal.offer.company}</strong>.
            </p>

            <Input
              label="Base Salary (LPA)"
              type="number"
              step="0.01"
              value={editOfferModal.base_lpa}
              onChange={(e) => setEditOfferModal({ ...editOfferModal, base_lpa: e.target.value })}
              required
            />
            <Input
              label="Annual Bonus (LPA)"
              type="number"
              step="0.01"
              value={editOfferModal.bonus_lpa}
              onChange={(e) => setEditOfferModal({ ...editOfferModal, bonus_lpa: e.target.value })}
            />
            <Input
              label="ESOP Value (LPA)"
              type="number"
              step="0.01"
              value={editOfferModal.esop_lpa}
              onChange={(e) => setEditOfferModal({ ...editOfferModal, esop_lpa: e.target.value })}
            />

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-black/5 text-xs font-bold text-[#0B0B0F]">
              <span>Total CTC:</span>
              <span className="text-emerald-600 font-display text-sm">
                {(
                  (parseFloat(editOfferModal.base_lpa) || 0) +
                  (parseFloat(editOfferModal.bonus_lpa) || 0) +
                  (parseFloat(editOfferModal.esop_lpa) || 0)
                ).toFixed(2)}{' '}
                LPA
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setEditOfferModal({ isOpen: false, offer: null, base_lpa: '', bonus_lpa: '', esop_lpa: '' })}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" loading={savingBreakdown}>
                Save Breakdown
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
