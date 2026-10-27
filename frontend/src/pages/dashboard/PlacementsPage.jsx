import React, { useState, useEffect } from 'react';
import DataTable from '../../components/ui/DataTable.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Download, Plus, Edit3, FileText } from 'lucide-react';
import { downloadDemoOfferPdf } from '../../utils/offerPdfGenerator.js';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';

export default function PlacementsPage() {
  const { activeRole, user, showToast } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Process Fictional Offer form state
  const [studentId, setStudentId] = useState('student-rohit');
  const [jobId, setJobId] = useState('job-1');
  const [baseLpa, setBaseLpa] = useState('14.0');
  const [bonusLpa, setBonusLpa] = useState('2.5');
  const [esopValue, setEsopValue] = useState('2.0');
  const [joiningDate, setJoiningDate] = useState('July 15, 2027');

  // Edit Existing Offer Record modal state
  const [editOfferModal, setEditOfferModal] = useState({
    isOpen: false,
    offer: null,
    base_lpa: '',
    bonus_lpa: '',
    esop_value: '',
    joining_date: '',
    offer_status: 'PENDING',
    explanation: '',
  });

  const loadData = async () => {
    try {
      const [placementsData, studentsData, jobsData] = await Promise.all([
        mockApi.getPlacements(),
        mockApi.getStudents(),
        mockApi.getJobs(),
      ]);
      setPlacements(placementsData);
      setStudents(studentsData);
      setJobs(jobsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    const headers = [
      'Student,Roll Number,Department,Company,Role,Tier,Base (LPA),Bonus (LPA),ESOP (LPA),Total CTC (LPA),Offer Status,Joining Date,Date',
    ];
    const rows = placements.map(
      (p) =>
        `"${p.student}","${p.roll_number}","${p.department}","${p.company}","${p.job_role}","${
          p.tier || 'Dream'
        }",${p.base_lpa || p.package_lpa},${p.bonus_lpa || 0},${p.esop_value || 0},${
          p.package_lpa
        },"${p.offer_status || 'PENDING'}","${p.joining_date || 'July 15, 2027'}","${p.date}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'PlaceTrack_Placements_Offers_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported verified placement & offer records to CSV');
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    const std = students.find((s) => s.id === studentId) || students[0];
    const jb = jobs.find((j) => j.id === jobId) || jobs[0];
    if (!std || !jb) return;

    const total =
      (parseFloat(baseLpa) || 0) + (parseFloat(bonusLpa) || 0) + (parseFloat(esopValue) || 0);

    await mockApi.createOffer({
      student_id: std.id,
      student: std.name,
      roll_number: std.roll_number,
      department: std.department,
      job_id: jb.id,
      company: jb.company,
      job_role: jb.title,
      tier: jb.tier || 'Dream',
      package_lpa: Number(total.toFixed(1)),
      base_lpa: parseFloat(baseLpa) || 12,
      bonus_lpa: parseFloat(bonusLpa) || 2,
      esop_value: parseFloat(esopValue) || 1.5,
      joining_date: joiningDate,
      actor: `${user?.name || 'Raghav Menon'} (${activeRole})`,
    });
    setIsOfferModalOpen(false);
    showToast(`Issued offer for ${std.name} at ${jb.company}`);
    await loadData();
  };

  const openEditOfferModal = (offer) => {
    setEditOfferModal({
      isOpen: true,
      offer,
      base_lpa: String(offer.base_lpa ?? offer.package_lpa ?? 12),
      bonus_lpa: String(offer.bonus_lpa ?? 0),
      esop_value: String(offer.esop_value ?? 0),
      joining_date: offer.joining_date || 'July 15, 2027',
      offer_status: offer.offer_status || 'PENDING',
      explanation: '',
    });
  };

  const handleSaveOfferRecord = async (e) => {
    e.preventDefault();
    const { offer, base_lpa, bonus_lpa, esop_value, joining_date, offer_status, explanation } =
      editOfferModal;
    if (!offer) return;

    await mockApi.updateOfferRecord(offer.id, {
      base_lpa: parseFloat(base_lpa) || 0,
      bonus_lpa: parseFloat(bonus_lpa) || 0,
      esop_value: parseFloat(esop_value) || 0,
      joining_date,
    });

    if (offer_status !== offer.offer_status) {
      await mockApi.updateOfferStatus(offer.id, offer_status, {
        isStudentDecision: false,
        actor: `${user?.name || 'Raghav Menon'} (${activeRole})`,
        explanation:
          explanation.trim() ||
          `Offer status updated to ${offer_status} by ${user?.name || activeRole}.`,
      });
    }

    setEditOfferModal({
      isOpen: false,
      offer: null,
      base_lpa: '',
      bonus_lpa: '',
      esop_value: '',
      joining_date: '',
      offer_status: 'PENDING',
      explanation: '',
    });
    showToast(`Updated offer record for ${offer.student} (${offer.company})`);
    await loadData();
  };

  const handleStatusChange = async (offerId, nextStatus) => {
    await mockApi.updateOfferStatus(offerId, nextStatus, {
      isStudentDecision: false,
      actor: `${user?.name || 'Raghav Menon'} (${activeRole})`,
    });
    showToast(`Updated offer status to ${nextStatus} and synced application timeline`);
    await loadData();
  };

  const filteredPlacements = placements.filter((p) => {
    if (deptFilter !== 'ALL' && p.department !== deptFilter) return false;
    if (statusFilter !== 'ALL' && (p.offer_status || 'PENDING') !== statusFilter) return false;
    return true;
  });

  const columns = [
    {
      header: 'Student Name',
      accessor: 'student',
      render: (row) => (
        <div>
          <p className="font-bold text-xs text-[#0B0B0F]">{row.student}</p>
          <p className="text-[11px] text-[#64748B] font-mono">{row.roll_number}</p>
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
      header: 'Company & Tier',
      accessor: 'company',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
            {row.company}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {row.tier || 'Dream'}
          </span>
        </div>
      ),
    },
    {
      header: 'Designation / Joining',
      accessor: 'job_role',
      render: (row) => (
        <div>
          <span className="text-xs font-bold text-[#0B0B0F] block">{row.job_role}</span>
          <span className="text-[10px] text-[#64748B]">
            Joining: {row.joining_date || 'July 15, 2027'}
          </span>
        </div>
      ),
    },
    {
      header: 'CTC Breakdown',
      accessor: 'package_lpa',
      render: (row) => (
        <div>
          <span className="font-display font-black text-sm text-emerald-700 tabular-nums block">
            {row.package_lpa} LPA
          </span>
          <span className="text-[10px] text-[#64748B]">
            Base {row.base_lpa || row.package_lpa} · Bonus {row.bonus_lpa || 0} · ESOP{' '}
            {row.esop_value || 0}
          </span>
        </div>
      ),
    },
    {
      header: 'Offer Status & Actions',
      accessor: 'offer_status',
      render: (row) => {
        const st = row.offer_status || 'PENDING';
        const matchedStd = students.find((s) => s.id === row.student_id);
        return (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={st}
              onChange={(e) => handleStatusChange(row.id, e.target.value)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                st === 'ACCEPTED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : st === 'DECLINED' || st === 'EXPIRED'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <option value="PENDING">Pending Decision</option>
              <option value="ACCEPTED">Accepted & Verified</option>
              <option value="DECLINED">Declined</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <button
              type="button"
              onClick={() => {
                const res = downloadDemoOfferPdf(row, matchedStd);
                if (res.success) {
                  showToast(`Downloaded Offer PDF (${res.filename})`);
                } else {
                  showToast(res.error || 'Could not generate Offer PDF');
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-colors cursor-pointer"
              title="Download Offer PDF"
            >
              <FileText className="w-3 h-3" />
              Offer PDF
            </button>

            <button
              type="button"
              onClick={() => openEditOfferModal(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-[#0B0B0F] transition-colors cursor-pointer"
              title="Edit offer record"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </button>

            <ContactActionButtons
              compact
              target={{
                id: row.student_id || matchedStd?.id || 'student-rohit',
                name: row.student,
                role: 'STUDENT',
                phone: matchedStd?.phone || '+91 98202 33445',
                email: matchedStd?.email || '',
                subtitle: `${row.roll_number} · ${row.department}`,
              }}
              subject={`Offer Follow-up: ${row.company} (${row.package_lpa} LPA)`}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800">
              {activeRole === 'STAFF' ? 'TPO Offer Desk' : 'Executive Offer Oversight'}
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            {activeRole === 'STAFF'
              ? 'Offers and Placements Management'
              : 'Institution Placements & Offers Ledger'}
          </h2>
          <p className="text-xs text-[#64748B]">
            Process fictional candidate offer records, update CTC breakdowns, and oversee student offer decisions across all departments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsOfferModalOpen(true)}
            className="shadow-md"
          >
            Process Fictional Offer
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#64748B]">Department:</span>
          {[
            'ALL',
            'Computer Science',
            'Information Tech.',
            'Electronics & Comm.',
            'Mechanical Eng.',
          ].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                deptFilter === dept
                  ? 'bg-[#0B0B0F] text-white shadow-xs'
                  : 'bg-white text-[#64748B] border border-black/5 hover:border-black/20'
              }`}
            >
              {dept === 'ALL' ? 'All Departments' : dept.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748B]">Decision Status:</span>
          {['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                statusFilter === st
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-[#64748B] border border-black/5 hover:border-black/20'
              }`}
            >
              {st === 'ALL' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPlacements}
        searchPlaceholder="Search offers by student, roll number, company, or package..."
      />

      {/* Process Fictional Offer Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title="Process Offer Record"
        subtitle="Issue a placement offer that immediately syncs with the student's My Offers portal and Application Timeline"
      >
        <form onSubmit={handleCreateOffer} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Select Student Candidate
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-black/10 text-[#0B0B0F] outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roll_number} · {s.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Select Recruitment Drive
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-black/10 text-[#0B0B0F] outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.title} ({j.tier} Tier)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              variant="pill"
              label="Base Salary (LPA)"
              type="number"
              step="0.5"
              value={baseLpa}
              onChange={(e) => setBaseLpa(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="Bonus (LPA)"
              type="number"
              step="0.5"
              value={bonusLpa}
              onChange={(e) => setBonusLpa(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="ESOP (LPA)"
              type="number"
              step="0.5"
              value={esopValue}
              onChange={(e) => setEsopValue(e.target.value)}
              required
            />
          </div>

          <Input
            variant="pill"
            label="Proposed Joining Date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsOfferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Issue Fictional Offer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Existing Offer Record Modal */}
      <Modal
        isOpen={editOfferModal.isOpen}
        onClose={() =>
          setEditOfferModal({
            isOpen: false,
            offer: null,
            base_lpa: '',
            bonus_lpa: '',
            esop_value: '',
            joining_date: '',
            offer_status: 'PENDING',
            explanation: '',
          })
        }
        title={`Update Offer Record — ${editOfferModal.offer?.student}`}
        subtitle={`${editOfferModal.offer?.company} · ${editOfferModal.offer?.job_role} (${editOfferModal.offer?.tier} Tier)`}
      >
        <form onSubmit={handleSaveOfferRecord} className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <Input
              variant="pill"
              label="Base Salary (LPA)"
              type="number"
              step="0.5"
              value={editOfferModal.base_lpa}
              onChange={(e) =>
                setEditOfferModal((prev) => ({ ...prev, base_lpa: e.target.value }))
              }
              required
            />
            <Input
              variant="pill"
              label="Bonus (LPA)"
              type="number"
              step="0.5"
              value={editOfferModal.bonus_lpa}
              onChange={(e) =>
                setEditOfferModal((prev) => ({ ...prev, bonus_lpa: e.target.value }))
              }
              required
            />
            <Input
              variant="pill"
              label="ESOP (LPA)"
              type="number"
              step="0.5"
              value={editOfferModal.esop_value}
              onChange={(e) =>
                setEditOfferModal((prev) => ({ ...prev, esop_value: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              variant="pill"
              label="Proposed Joining Date"
              value={editOfferModal.joining_date}
              onChange={(e) =>
                setEditOfferModal((prev) => ({ ...prev, joining_date: e.target.value }))
              }
              required
            />

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Offer Decision Status
              </label>
              <select
                value={editOfferModal.offer_status}
                onChange={(e) =>
                  setEditOfferModal((prev) => ({ ...prev, offer_status: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-black/10 text-[#0B0B0F] outline-none"
              >
                <option value="PENDING">PENDING (Awaiting Student Decision)</option>
                <option value="ACCEPTED">ACCEPTED (Verified)</option>
                <option value="DECLINED">DECLINED</option>
                <option value="EXPIRED">EXPIRED (Deadline Lapsed)</option>
              </select>
            </div>
          </div>

          <Input
            variant="pill"
            label="Audit Note / Status Explanation"
            value={editOfferModal.explanation}
            onChange={(e) =>
              setEditOfferModal((prev) => ({ ...prev, explanation: e.target.value }))
            }
            placeholder="Reason for updating compensation or offer status..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() =>
                setEditOfferModal({
                  isOpen: false,
                  offer: null,
                  base_lpa: '',
                  bonus_lpa: '',
                  esop_value: '',
                  joining_date: '',
                  offer_status: 'PENDING',
                  explanation: '',
                })
              }
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Offer Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
