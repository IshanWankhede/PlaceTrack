import React, { useState, useEffect } from 'react';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Plus,
  CheckCircle2,
  Award,
  Download,
  ShieldCheck,
  Clock,
  XCircle,
  ArrowUpRight,
  Users,
  FileText,
} from 'lucide-react';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';
import { downloadDemoResumePdf } from '../../utils/offerPdfGenerator.js';

export default function StudentsPage() {
  const { showToast } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minCgpaFilter, setMinCgpaFilter] = useState(0);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await mockApi.getStudents();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  // Requirement 6: Toggle CGPA Verified
  const handleToggleCgpaVerified = async (studentId, e) => {
    if (e) e.stopPropagation();
    const updated = await mockApi.toggleStudentCgpaVerified(studentId);
    if (updated) {
      setStudents((prev) => prev.map((s) => (s.id === studentId ? updated : s)));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(updated);
      }
      toast.success(
        updated.cgpa_verified ? 'CGPA Verified by CDC' : 'CGPA Verification Revoked',
        `${updated.name} (${updated.roll_number})`
      );
    }
  };

  // Requirement 6: CSV Export of filtered cohort
  const handleExportCSV = () => {
    const headers = [
      'Name,Roll Number,Department,CGPA,CGPA Verified,Active Backlogs,Placement Status,Company,Package (LPA)',
    ];
    const rows = filteredStudents.map(
      (s) =>
        `"${s.name}","${s.roll_number}","${s.department}",${s.cgpa},${
          s.cgpa_verified ? 'Yes' : 'No'
        },${s.active_backlogs ?? 0},"${s.placement_status || (s.placed ? 'Placed' : 'Unplaced')}","${
          s.placed_company || s.placedCompany || '-'
        }",${s.placed_package || s.placedPackage || 0}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'PlaceTrack_Student_Cohort_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredStudents.length} student records to CSV`);
  };

  // Requirement 6: Multi-select + Bulk "Promote to next round" (works on filtered cohort)
  const toggleSelectStudent = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredStudents.map((s) => s.id);
    const allSelected =
      filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleBulkPromote = async (targetIds) => {
    const idsToPromote =
      targetIds && targetIds.length > 0
        ? targetIds
        : selectedIds.length > 0
        ? selectedIds
        : filteredStudents.map((s) => s.id);
    if (idsToPromote.length === 0) return;

    const res = await mockApi.promoteStudentsToNextRound(idsToPromote);
    setStudents(res.students);
    toast.placement(
      `Promoted ${idsToPromote.length} Candidate(s)`,
      'Selected cohort advanced to the next recruitment round'
    );
    setSelectedIds([]);
  };

  const handleAddSkill = async () => {
    if (!newSkillInput.trim() || !selectedStudent) return;
    const updatedSkills = [...selectedStudent.skills, newSkillInput.trim()];
    const updated = await mockApi.updateStudentSkills(selectedStudent.id, updatedSkills);
    setSelectedStudent(updated);
    setStudents(students.map((s) => (s.id === updated.id ? updated : s)));
    setNewSkillInput('');
    showToast(`Added ${newSkillInput} to skills profile`);
  };

  const handleRemoveSkill = async (skillToRemove) => {
    if (!selectedStudent) return;
    const updatedSkills = selectedStudent.skills.filter((s) => s !== skillToRemove);
    const updated = await mockApi.updateStudentSkills(selectedStudent.id, updatedSkills);
    setSelectedStudent(updated);
    setStudents(students.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Removed ${skillToRemove}`);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (deptFilter !== 'ALL' && s.department !== deptFilter) return false;
    const st = s.placement_status || (s.placed ? 'Placed' : 'Unplaced');
    if (statusFilter !== 'ALL' && st !== statusFilter) return false;
    if (minCgpaFilter > 0 && s.cgpa < minCgpaFilter) return false;
    return true;
  });

  const activeSelectedInFiltered = filteredStudents.filter((s) =>
    selectedIds.includes(s.id)
  );

  const renderStatusBadge = (row) => {
    const st = row.placement_status || (row.placed ? 'Placed' : 'Unplaced');
    if (st === 'Placed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Placed ({row.placed_package || row.placedPackage} LPA)
        </span>
      );
    }
    if (st === 'In Interview') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          In Interview
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
        <XCircle className="w-3.5 h-3.5 text-slate-400" />
        Unplaced
      </span>
    );
  };

  const columns = [
    {
      header: 'Select',
      sortable: false,
      render: (row) => (
        <div
          onClick={(e) => toggleSelectStudent(row.id, e)}
          className="flex items-center"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(row.id)}
            onChange={() => {}}
            className="w-4 h-4 rounded border-black/20 text-[#0B0B0F] focus:ring-0 cursor-pointer"
          />
        </div>
      ),
    },
    {
      header: 'Student',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.photo_url || row.avatar} name={row.name} size="sm" />
          <div>
            <p className="font-bold text-xs text-[#0B0B0F]">{row.name}</p>
            <p className="text-[11px] text-[#64748B]">
              {row.roll_number} · Backlogs: {row.active_backlogs ?? 0}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <span className="text-xs font-semibold text-[#475569]">
          {row.department}
        </span>
      ),
    },
    {
      header: 'CGPA & CDC Toggle',
      accessor: 'cgpa',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xs text-[#0B0B0F] bg-black/5 px-2.5 py-1 rounded-full">
            {row.cgpa.toFixed(1)}
          </span>
          <button
            type="button"
            onClick={(e) => handleToggleCgpaVerified(row.id, e)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
              row.cgpa_verified
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Click to toggle CDC CGPA Verification"
          >
            <ShieldCheck className="w-3 h-3" />
            {row.cgpa_verified ? 'Verified' : 'Unverified'}
          </button>
        </div>
      ),
    },
    {
      header: 'Placement Status',
      accessor: 'placement_status',
      render: (row) => renderStatusBadge(row),
    },
    {
      header: 'Contact & Action',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div
          className="flex flex-wrap items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <ContactActionButtons
            compact
            target={{
              id: row.id,
              name: row.name,
              role: 'STUDENT',
              phone: row.phone,
              email: row.email,
              subtitle: `${row.roll_number} · ${row.department}`,
            }}
            subject={`Placement Verification & Drive Update — ${row.name}`}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(row);
            }}
          >
            View Profile
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header + CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F]">
            Candidate Directory
          </h2>
          <p className="text-xs text-[#64748B]">
            Manage student placement status, toggle CGPA verification, export CSV, and bulk-promote cohorts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleSelectAllFiltered}
            icon={Users}
          >
            {filteredStudents.length > 0 &&
            filteredStudents.every((s) => selectedIds.includes(s.id))
              ? 'Deselect Filtered Cohort'
              : `Select Filtered (${filteredStudents.length})`}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-black/5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#64748B]">Dept:</span>
          {['ALL', 'Computer Science', 'Information Tech.', 'Electronics & Comm.', 'Mechanical Eng.'].map(
            (dept) => (
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
                {dept === 'ALL' ? 'All Depts' : dept.split(' ')[0]}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#64748B]">Status:</span>
          {['ALL', 'Placed', 'In Interview', 'Unplaced'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white text-[#64748B] border border-black/5'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setMinCgpaFilter(minCgpaFilter === 8.5 ? 0 : 8.5)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              minCgpaFilter > 0
                ? 'bg-amber-400 text-black shadow-xs font-bold'
                : 'bg-white text-[#64748B] border border-black/5'
            }`}
          >
            CGPA ≥ 8.5
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Requirement 6: works on selected or filtered cohort) */}
      <div className="p-4 rounded-3xl bg-[#0B0B0F] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-violet-600 text-white text-xs font-bold">
            {selectedIds.length > 0
              ? `${selectedIds.length} Selected`
              : `${filteredStudents.length} in Filtered Cohort`}
          </span>
          <p className="text-xs text-slate-300">
            {selectedIds.length > 0
              ? `Ready to promote ${selectedIds.length} selected candidate(s) (${activeSelectedInFiltered.length} in current view).`
              : `Bulk action applies to all ${filteredStudents.length} candidate(s) in the current filtered cohort.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
            >
              Clear Selection
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              handleBulkPromote(
                selectedIds.length > 0
                  ? selectedIds
                  : filteredStudents.map((s) => s.id)
              )
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Promote to next round</span>
          </button>
        </div>
      </div>

      {/* Main Students Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search candidates by name, roll number, or skills..."
        searchKey={(item, q) =>
          item.name.toLowerCase().includes(q) ||
          item.roll_number.toLowerCase().includes(q) ||
          item.skills.some((s) => s.toLowerCase().includes(q))
        }
        onRowClick={handleRowClick}
      />

      {/* Slide-over Profile Drawer */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isDrawer={true}
        title={selectedStudent ? selectedStudent.name : 'Student Profile'}
        subtitle={selectedStudent ? `${selectedStudent.roll_number} · ${selectedStudent.department}` : ''}
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-violet-500/10 to-amber-500/10 border border-violet-100 flex items-center gap-4">
              <Avatar
                src={selectedStudent.photo_url || selectedStudent.avatar}
                name={selectedStudent.name}
                size="lg"
              />
              <div>
                <h4 className="font-display font-bold text-lg text-[#0B0B0F]">
                  {selectedStudent.name}
                </h4>
                <p className="text-xs text-[#64748B]">{selectedStudent.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-bold text-violet-700 bg-white px-2.5 py-0.5 rounded-full shadow-xs">
                    CGPA {selectedStudent.cgpa}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleCgpaVerified(selectedStudent.id)}
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedStudent.cgpa_verified
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {selectedStudent.cgpa_verified ? '✓ CGPA Verified' : 'Verify CGPA'}
                  </button>
                </div>
              </div>
            </div>

            {selectedStudent.placed && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      Offer Confirmed: {selectedStudent.placed_package || selectedStudent.placedPackage} LPA
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {selectedStudent.placed_company || selectedStudent.placedCompany}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white bg-emerald-700 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            )}

            {/* Skills Proficiency Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-display font-bold text-sm text-[#0B0B0F]">
                  Technical Skills & Levels
                </h5>
                <span className="text-[11px] text-[#64748B]">Click tag to remove</span>
              </div>

              <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-[#F9F9FB] border border-black/5">
                {(selectedStudent.skill_proficiencies || []).map((sp) => (
                  <button
                    key={sp.name}
                    type="button"
                    onClick={() => handleRemoveSkill(sp.name)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#0B0B0F] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 group-hover:bg-rose-500" />
                    <span>
                      {sp.name} ({sp.level})
                    </span>
                    <span className="text-slate-400 group-hover:text-rose-500 text-[10px]">✕</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Add skill (e.g. Docker, Rust, PyTorch)..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 bg-white border border-black/10 rounded-full px-4 py-2 text-xs text-[#0B0B0F] focus:outline-none focus:border-[#0B0B0F]"
                />
                <Button variant="primary" size="sm" onClick={handleAddSkill} icon={Plus}>
                  Add
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-black/5 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#64748B]">Phone & Direct Contact:</span>
                <ContactActionButtons
                  compact
                  showPhoneText
                  target={{
                    id: selectedStudent.id,
                    name: selectedStudent.name,
                    role: 'STUDENT',
                    phone: selectedStudent.phone,
                    email: selectedStudent.email,
                    subtitle: `${selectedStudent.roll_number} · ${selectedStudent.department}`,
                  }}
                  subject={`Placement Desk Follow-up — ${selectedStudent.name}`}
                />
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#64748B]">Active Backlogs:</span>
                <span className="font-bold text-emerald-600">
                  {selectedStudent.active_backlogs ?? 0} Active
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5">
                <span className="text-[#64748B]">Candidate Resume:</span>
                <button
                  type="button"
                  onClick={() => {
                    const res = downloadDemoResumePdf(selectedStudent);
                    if (res.success) {
                      showToast(`Downloaded Resume PDF (${res.filename})`);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs border border-violet-200 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download Resume PDF
                </button>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Placement Status:</span>
                <span className="font-bold text-[#0B0B0F]">
                  {selectedStudent.placement_status || 'Unplaced'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
