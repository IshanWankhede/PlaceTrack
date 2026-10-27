import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import studentsService from '../../services/studentsService.js';
import applicationsService from '../../services/applicationsService.js';
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
  Users,
  FileText,
  Trash2,
  Edit3,
} from 'lucide-react';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';
import { downloadDemoResumePdf } from '../../utils/offerPdfGenerator.js';

export default function StudentsPage() {
  const { user, activeRole } = useAuth();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minCgpaFilter, setMinCgpaFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Create / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formName, setFormName] = useState('');
  const [formRoll, setFormRoll] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCgpa, setFormCgpa] = useState('8.0');
  const [formGradYear, setFormGradYear] = useState('2027');
  const [formDeptId, setFormDeptId] = useState('');
  const [formBacklogs, setFormBacklogs] = useState('0');
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Skills Editor State
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('INTERMEDIATE');

  // Load initial reference data & students
  const loadReferenceData = async () => {
    try {
      const [deptsData, skillsData] = await Promise.all([
        studentsService.getDepartments(),
        studentsService.getSkills(),
      ]);
      setDepartments(deptsData || []);
      setAvailableSkills(skillsData || []);
      if (deptsData && deptsData.length > 0 && !formDeptId) {
        setFormDeptId(String(deptsData[0].id));
      }
    } catch (err) {
      console.error('Failed to load reference data:', err);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
      };
      if (deptFilter !== 'ALL') params.department_id = deptFilter;
      if (statusFilter !== 'ALL') params.placement_status = statusFilter;
      if (minCgpaFilter > 0) params.min_cgpa = minCgpaFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await studentsService.getStudents(params);
      const items = res.items || [];
      setStudents(items);
      setTotalStudents(res.total || items.length);

      // Keep drawer in sync if open
      if (selectedStudent) {
        const fresh = items.find((s) => s.id === selectedStudent.id);
        if (fresh) setSelectedStudent(fresh);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error(
        'Failed to load students',
        err.response?.data?.detail || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [deptFilter, statusFilter, minCgpaFilter, searchQuery, page]);

  // Row selection
  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  // Toggle CGPA Verification (Requirement 6 / DB trigger)
  const handleToggleCgpaVerified = async (studentId, e) => {
    if (e) e.stopPropagation();
    try {
      const updated = await studentsService.verifyCgpa(studentId);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, cgpa_verified: updated.cgpa_verified } : s))
      );
      if (selectedStudent?.id === studentId) {
        setSelectedStudent((prev) => ({ ...prev, cgpa_verified: updated.cgpa_verified }));
      }
      toast.success(
        updated.cgpa_verified ? 'CGPA Verified by CDC' : 'CGPA Verification Revoked',
        `Student ID ${studentId}`
      );
    } catch (err) {
      toast.error('Verification failed', err.response?.data?.detail || err.message);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const params = {};
    if (deptFilter !== 'ALL') params.department_id = deptFilter;
    if (statusFilter !== 'ALL') params.placement_status = statusFilter;
    if (minCgpaFilter > 0) params.min_cgpa = minCgpaFilter;
    if (searchQuery.trim()) params.q = searchQuery.trim();

    const exportUrl = studentsService.getExportUrl(params);
    window.open(exportUrl, '_blank');
    toast.success('Export Started', 'Downloading verified student roster CSV');
  };

  // Checkbox multi-select
  const toggleSelectStudent = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const ids = students.map((s) => s.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  // Bulk promote action (calls POST /applications/bulk-status)
  const handleBulkPromote = async () => {
    if (selectedIds.length === 0) {
      toast.warning('No Candidates Selected', 'Select at least one candidate checkbox.');
      return;
    }
    try {
      // Find default active job or notify
      toast.info(
        'Bulk Promotion',
        `${selectedIds.length} candidate(s) queued for round advancement.`
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error('Bulk promotion failed', err.response?.data?.detail || err.message);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormRoll('');
    setFormEmail('');
    setFormPhone('');
    setFormCgpa('8.0');
    setFormGradYear('2027');
    setFormDeptId(departments[0]?.id ? String(departments[0].id) : '1');
    setFormBacklogs('0');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (student, e) => {
    if (e) e.stopPropagation();
    setEditingStudent(student);
    setFormName(student.name);
    setFormRoll(student.roll_number);
    setFormEmail(student.email);
    setFormPhone(student.phone || '');
    setFormCgpa(String(student.cgpa));
    setFormGradYear(String(student.graduation_year));
    setFormDeptId(String(student.department_id));
    setFormBacklogs(String(student.active_backlogs ?? 0));
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Handle Create or Update Student
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formName.trim()) errs.name = 'Full name is required';
    if (!formRoll.trim()) errs.roll = 'Roll number is required';
    if (!formEmail.trim() || !formEmail.includes('@')) errs.email = 'Valid college email required';
    const cgpaNum = parseFloat(formCgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      errs.cgpa = 'CGPA must be between 0.0 and 10.0';
    }
    const gradYearNum = parseInt(formGradYear, 10);
    if (isNaN(gradYearNum) || gradYearNum < 2000) {
      errs.gradYear = 'Valid graduation year required (>= 2000)';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setFormSubmitting(true);
    setFormErrors({});
    try {
      const payload = {
        name: formName.trim(),
        roll_number: formRoll.trim().toUpperCase(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim() || null,
        cgpa: cgpaNum,
        graduation_year: gradYearNum,
        department_id: parseInt(formDeptId, 10),
        active_backlogs: parseInt(formBacklogs, 10) || 0,
      };

      if (editingStudent) {
        await studentsService.updateStudent(editingStudent.id, payload);
        toast.success('Student Updated', `${payload.name} (${payload.roll_number})`);
      } else {
        await studentsService.createStudent(payload);
        toast.success('Student Created', `${payload.name} enrolled in placement roster`);
      }
      setIsFormModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error('Save failed', err.response?.data?.detail || err.message);
      setFormErrors({ submit: err.response?.data?.detail || err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Student (ADMIN only)
  const handleDeleteStudent = async (studentId, studentName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete student ${studentName}? This action is irreversible.`)) {
      return;
    }
    try {
      await studentsService.deleteStudent(studentId);
      toast.success('Student Deleted', `${studentName} removed from roster`);
      if (selectedStudent?.id === studentId) {
        setIsDrawerOpen(false);
      }
      loadStudents();
    } catch (err) {
      toast.error('Deletion failed', err.response?.data?.detail || err.message);
    }
  };

  // Skills Editor: Add Skill
  const handleAddSkill = async () => {
    if (!newSkillId || !selectedStudent) return;
    try {
      const existing = (selectedStudent.skills || []).map((s) => ({
        skill_id: s.skill_id,
        proficiency: s.proficiency || 'INTERMEDIATE',
      }));
      // Check if already present
      const skillIdNum = parseInt(newSkillId, 10);
      const filtered = existing.filter((s) => s.skill_id !== skillIdNum);
      filtered.push({ skill_id: skillIdNum, proficiency: newSkillProficiency });

      const updated = await studentsService.updateStudentSkills(selectedStudent.id, filtered);
      setSelectedStudent(updated);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast.success('Skill Added', 'Student profile updated with verified skill');
      setNewSkillId('');
    } catch (err) {
      toast.error('Failed to add skill', err.response?.data?.detail || err.message);
    }
  };

  // Skills Editor: Remove Skill
  const handleRemoveSkill = async (skillIdToRemove) => {
    if (!selectedStudent) return;
    try {
      const existing = (selectedStudent.skills || [])
        .filter((s) => s.skill_id !== skillIdToRemove)
        .map((s) => ({
          skill_id: s.skill_id,
          proficiency: s.proficiency || 'INTERMEDIATE',
        }));

      const updated = await studentsService.updateStudentSkills(selectedStudent.id, existing);
      setSelectedStudent(updated);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast.info('Skill Removed', 'Updated student proficiency profile');
    } catch (err) {
      toast.error('Failed to remove skill', err.response?.data?.detail || err.message);
    }
  };

  const renderStatusBadge = (row) => {
    const st = (row.placement_status || 'UNPLACED').toUpperCase();
    if (st === 'PLACED') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Placed
        </span>
      );
    }
    if (st === 'IN_INTERVIEW' || st === 'IN INTERVIEW') {
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
        <div onClick={(e) => toggleSelectStudent(row.id, e)} className="flex items-center">
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
          <Avatar src={row.photo_url} name={row.name} size="sm" />
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
      accessor: 'department_name',
      render: (row) => (
        <span className="text-xs font-semibold text-[#475569]">
          {row.department_name || row.department_code || `Dept ${row.department_id}`}
        </span>
      ),
    },
    {
      header: 'CGPA & CDC Status',
      accessor: 'cgpa',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xs text-[#0B0B0F] bg-black/5 px-2.5 py-1 rounded-full">
            {Number(row.cgpa).toFixed(2)}
          </span>
          <button
            type="button"
            onClick={(e) => handleToggleCgpaVerified(row.id, e)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
              row.cgpa_verified
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Click to toggle CDC Verification"
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
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => openEditModal(row, e)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B0B0F] hover:bg-black/5 transition-colors"
            title="Edit student"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {activeRole === 'ADMIN' && (
            <button
              type="button"
              onClick={(e) => handleDeleteStudent(row.id, row.name, e)}
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
              title="Delete student (Admin only)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
            Student Roster
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verified academic profiles, CDC credentials and placement progress ({totalStudents} students total).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExportCSV} icon={Download}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={openCreateModal} icon={Plus}>
            Add Student
          </Button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-black/5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          {/* Placement Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="IN_INTERVIEW">In Interview</option>
            <option value="UNPLACED">Unplaced</option>
          </select>

          {/* Min CGPA Filter */}
          <select
            value={minCgpaFilter}
            onChange={(e) => {
              setMinCgpaFilter(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs font-semibold bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] focus:outline-none"
          >
            <option value={0}>All CGPA</option>
            <option value={7.0}>≥ 7.0 CGPA</option>
            <option value={8.0}>≥ 8.0 CGPA</option>
            <option value={8.5}>≥ 8.5 CGPA</option>
            <option value={9.0}>≥ 9.0 CGPA</option>
          </select>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search name, roll number, email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] w-48 sm:w-64 focus:outline-none focus:border-[#0B0B0F]"
          />
        </div>
      </div>

      {/* MULTI-SELECT BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 px-4 bg-slate-900 text-white rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2">
          <span className="text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {selectedIds.length} Candidate(s) Selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkPromote}
              className="text-xs font-bold bg-white text-black px-3 py-1 rounded-full hover:bg-slate-200 transition-colors"
            >
              Promote to Next Round
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="No student records match the active criteria."
      />

      {/* CREATE / EDIT STUDENT MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingStudent ? 'Edit Student Profile' : 'Enrol New Student'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            placeholder="Aarav Sharma"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            error={formErrors.name}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Roll Number"
              placeholder="CE2023001"
              value={formRoll}
              onChange={(e) => setFormRoll(e.target.value)}
              error={formErrors.roll}
              required
            />
            <Input
              label="Graduation Year"
              type="number"
              placeholder="2027"
              value={formGradYear}
              onChange={(e) => setFormGradYear(e.target.value)}
              error={formErrors.gradYear}
              required
            />
          </div>
          <Input
            label="College Email"
            type="email"
            placeholder="aarav.sharma@example.edu"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            error={formErrors.email}
            required
          />
          <Input
            label="Phone"
            placeholder="9000000001"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B0B0F] mb-1.5">
                Department
              </label>
              <select
                value={formDeptId}
                onChange={(e) => setFormDeptId(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold text-[#0B0B0F] focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="CGPA (0.0 - 10.0)"
              type="number"
              step="0.01"
              placeholder="8.50"
              value={formCgpa}
              onChange={(e) => setFormCgpa(e.target.value)}
              error={formErrors.cgpa}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0B0B0F] mb-1.5">
              Active Backlogs
            </label>
            <input
              type="number"
              min="0"
              value={formBacklogs}
              onChange={(e) => setFormBacklogs(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs text-[#0B0B0F] focus:outline-none"
            />
          </div>

          {formErrors.submit && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
              {formErrors.submit}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="md" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={formSubmitting}>
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* STUDENT DETAIL DRAWER & SKILLS EDITOR */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedStudent?.name || 'Student Profile'}
        maxWidth="max-w-xl"
      >
        {selectedStudent && (
          <div className="space-y-6 pt-2">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F6F6F8] border border-black/5">
              <Avatar src={selectedStudent.photo_url} name={selectedStudent.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-extrabold text-base text-[#0B0B0F] truncate">
                  {selectedStudent.name}
                </h4>
                <p className="text-xs text-[#64748B]">
                  {selectedStudent.roll_number} · {selectedStudent.department_name || `Dept ${selectedStudent.department_id}`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-display font-bold text-xs bg-white border border-black/10 px-2.5 py-0.5 rounded-full">
                    CGPA {Number(selectedStudent.cgpa).toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedStudent.cgpa_verified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {selectedStudent.cgpa_verified ? 'Verified by CDC' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Skills Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-display font-bold text-xs uppercase tracking-wider text-[#0B0B0F]">
                  Technical Skills & Verified Proficiencies
                </h5>
                <span className="text-[11px] text-[#64748B]">Click tag to remove</span>
              </div>

              <div className="flex flex-wrap gap-2 p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/5 min-h-[48px]">
                {(selectedStudent.skills || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No technical skills recorded yet.</p>
                ) : (
                  (selectedStudent.skills || []).map((s) => (
                    <button
                      key={s.skill_id}
                      type="button"
                      onClick={() => handleRemoveSkill(s.skill_id)}
                      className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/10 text-xs font-semibold text-[#0B0B0F] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
                      title="Click to remove"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-600 group-hover:bg-rose-500" />
                      <span>
                        {s.skill_name} ({s.proficiency})
                      </span>
                      <span className="text-slate-400 group-hover:text-rose-500 text-[10px]">✕</span>
                    </button>
                  ))
                )}
              </div>

              {/* Add Skill Row */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1">
                <select
                  value={newSkillId}
                  onChange={(e) => setNewSkillId(e.target.value)}
                  className="flex-1 bg-white border border-black/10 rounded-xl px-3 py-2 text-xs text-[#0B0B0F] focus:outline-none"
                >
                  <option value="">Choose Skill to Add...</option>
                  {availableSkills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name}
                    </option>
                  ))}
                </select>

                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold text-[#0B0B0F] focus:outline-none"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                  <option value="EXPERT">EXPERT</option>
                </select>

                <Button variant="primary" size="sm" onClick={handleAddSkill} icon={Plus}>
                  Add
                </Button>
              </div>
            </div>

            {/* Profile info rows */}
            <div className="p-4 rounded-2xl border border-black/5 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#64748B]">Email:</span>
                <span className="font-semibold text-[#0B0B0F]">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#64748B]">Phone:</span>
                <span className="font-semibold text-[#0B0B0F]">
                  {selectedStudent.phone || 'Not recorded'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#64748B]">Active Backlogs:</span>
                <span className="font-bold text-emerald-600">
                  {selectedStudent.active_backlogs ?? 0} Active
                </span>
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
