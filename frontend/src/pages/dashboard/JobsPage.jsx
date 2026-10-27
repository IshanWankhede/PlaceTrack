import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import jobsService from '../../services/jobsService.js';
import studentsService from '../../services/studentsService.js';
import companiesService from '../../services/companiesService.js';
import applicationsService from '../../services/applicationsService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  LayoutGrid,
  List,
  Plus,
  CheckCircle2,
  XCircle,
  Briefcase,
  Building2,
  Award,
  Sparkles,
  ExternalLink,
  Search,
  Check,
  X,
  FileText,
  Archive,
  Clock,
  ArrowUpDown,
  Lock,
  AlertCircle,
} from 'lucide-react';

const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export default function JobsPage() {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [studentEligibleJobs, setStudentEligibleJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState('details'); // 'details' | 'eligible' | 'applications'
  const [drawerCohortFilter, setDrawerCohortFilter] = useState('ALL'); // 'ALL' | 'ELIGIBLE' | 'INELIGIBLE'
  const [jobEligibilityCriteria, setJobEligibilityCriteria] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [eligibleStudentsList, setEligibleStudentsList] = useState([]);
  const [loadingEligibleStudents, setLoadingEligibleStudents] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  // Student specific filters
  const [eligibleOnly, setEligibleOnly] = useState(false);

  // Staff / Admin specific filters
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'CLOSED' | 'ARCHIVED'
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Common filters & sorting
  const [tierFilter, setTierFilter] = useState('ALL');
  const [packageRangeFilter, setPackageRangeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState(activeRole === 'STUDENT' ? 'best_match' : 'closing_soon');

  // Job Form State
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPackage, setFormPackage] = useState('14.0');
  const [formPackageMax, setFormPackageMax] = useState('18.0');
  const [formDriveDate, setFormDriveDate] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formLocation, setFormLocation] = useState('Bangalore, India');
  const [formMinCgpa, setFormMinCgpa] = useState('7.5');
  const [formMaxBacklogs, setFormMaxBacklogs] = useState('0');
  const [formJobType, setFormJobType] = useState('FULL_TIME');
  const [formStatus, setFormStatus] = useState('OPEN');
  const [formDepartmentIds, setFormDepartmentIds] = useState([]);
  const [formSkills, setFormSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('INTERMEDIATE');

  useEffect(() => {
    if (activeRole === 'STUDENT') {
      setSortBy('best_match');
    } else {
      setSortBy('closing_soon');
    }
  }, [activeRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, compsData, deptsData, skillsData] = await Promise.all([
        jobsService.getJobs(),
        companiesService.getCompanies(),
        studentsService.getDepartments(),
        studentsService.getSkills(),
      ]);

      const jobsList = Array.isArray(jobsData) ? jobsData : jobsData?.items || [];
      setJobs(jobsList);
      setCompanies(Array.isArray(compsData) ? compsData : compsData?.items || []);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
      setAvailableSkills(Array.isArray(skillsData) ? skillsData : []);

      if (activeRole === 'STUDENT' && user?.student_id) {
        const [eligJobs, myApps] = await Promise.all([
          studentsService.getStudentEligibleJobs(user.student_id).catch(() => []),
          applicationsService.getMyApplications().catch(() => []),
        ]);
        setStudentEligibleJobs(eligJobs || []);
        setApplications(myApps || []);
      } else {
        const [appsData, stdsData] = await Promise.all([
          applicationsService.getApplications().catch(() => []),
          studentsService.getStudents({ page_size: 100 }).catch(() => ({ items: [] })),
        ]);
        setApplications(Array.isArray(appsData) ? appsData : appsData?.items || []);
        setStudents(stdsData?.items || []);
      }
    } catch (err) {
      console.error('Failed to load jobs data:', err);
      toast.error('Data Load Error', err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole, user?.student_id]);

  // Load student-specific criteria checklist when drawer opens or changes
  useEffect(() => {
    if (!selectedJob || !isDrawerOpen) {
      setJobEligibilityCriteria(null);
      return;
    }

    if (activeRole === 'STUDENT' && user?.student_id) {
      setLoadingEligibility(true);
      jobsService
        .getJobEligibility(selectedJob.id, user.student_id)
        .then((res) => {
          setJobEligibilityCriteria(res);
        })
        .catch((err) => {
          console.error('Failed to check eligibility:', err);
          setJobEligibilityCriteria(null);
        })
        .finally(() => setLoadingEligibility(false));
    } else if (activeRole !== 'STUDENT') {
      // Staff view: load eligible students
      setLoadingEligibleStudents(true);
      jobsService
        .getEligibleStudents(selectedJob.id)
        .then((res) => {
          setEligibleStudentsList(Array.isArray(res) ? res : []);
        })
        .catch((err) => {
          console.error('Failed to load eligible students:', err);
          setEligibleStudentsList([]);
        })
        .finally(() => setLoadingEligibleStudents(false));
    }
  }, [selectedJob?.id, isDrawerOpen, activeRole, user?.student_id]);

  // Map of student's applications
  const studentApplicationsMap = useMemo(() => {
    const map = {};
    applications.forEach((a) => {
      const jid = a.job_id || a.jobId;
      map[jid] = a;
    });
    return map;
  }, [applications]);

  // Map of eligible jobs for student
  const eligibleJobsMap = useMemo(() => {
    const map = {};
    studentEligibleJobs.forEach((ej) => {
      map[ej.job_id] = ej;
    });
    return map;
  }, [studentEligibleJobs]);

  const isDeadlineExpired = (deadlineStr) => {
    if (!deadlineStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return deadlineStr < today;
  };

  // Student Apply Handler
  const handleApply = async (job) => {
    try {
      await applicationsService.applyToJob(job.id);
      toast.success(
        `Applied to ${job.company_name || job.company}`,
        `Your application for ${job.title} was submitted successfully.`
      );
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Application Failed', detail);
    }
  };

  // Staff: Add student to application
  const handleStaffAddStudentToApp = async (jobId, studentId, studentName) => {
    try {
      await applicationsService.applyToJob(jobId, studentId);
      toast.success(
        'Student Added',
        `${studentName} has been enrolled into the recruitment drive.`
      );
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Enrollment Failed', detail);
    }
  };

  // Staff: Toggle status or Archive
  const handleToggleJobStatus = async (job) => {
    const nextStatus = (job.status || 'OPEN') === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await jobsService.updateJob(job.id, { status: nextStatus });
      toast.info(
        'Drive Status Updated',
        `${job.title} at ${job.company_name || job.company} is now ${nextStatus}.`
      );
      loadData();
      if (selectedJob?.id === job.id) {
        setSelectedJob({ ...selectedJob, status: nextStatus });
      }
    } catch (err) {
      toast.error('Update Failed', err.response?.data?.detail || err.message);
    }
  };

  const handleArchiveJob = async (job) => {
    if (!window.confirm(`Archive recruitment drive for ${job.title}?`)) return;
    try {
      await jobsService.archiveJob(job.id);
      toast.info('Drive Archived', `${job.title} has been archived.`);
      loadData();
      if (selectedJob?.id === job.id) {
        setIsDrawerOpen(false);
      }
    } catch (err) {
      toast.error('Archive Failed', err.response?.data?.detail || err.message);
    }
  };

  const handleCloseExpired = async () => {
    try {
      const res = await jobsService.closeExpiredJobs();
      toast.success('Expired Drives Closed', `Closed ${res.closed} expired recruitment drives.`);
      loadData();
    } catch (err) {
      toast.error('Action Failed', err.response?.data?.detail || err.message);
    }
  };

  // Modal open handlers
  const openCreateModal = () => {
    setEditingJobId(null);
    setFormCompanyId(companies[0]?.id ? String(companies[0].id) : '');
    setFormTitle('');
    setFormDescription('');
    setFormPackage('12.0');
    setFormPackageMax('16.0');
    setFormDriveDate('');
    setFormDeadline('');
    setFormLocation('Bangalore, India');
    setFormMinCgpa('7.5');
    setFormMaxBacklogs('0');
    setFormJobType('FULL_TIME');
    setFormStatus('OPEN');
    setFormDepartmentIds([]);
    setFormSkills([]);
    setSelectedSkillId(availableSkills[0]?.id ? String(availableSkills[0].id) : '');
    setSelectedSkillLevel('INTERMEDIATE');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJobId(job.id);
    setFormCompanyId(String(job.company_id || ''));
    setFormTitle(job.title || '');
    setFormDescription(job.description || '');
    setFormPackage(String(job.package || '12.0'));
    setFormPackageMax(String(job.package_max || job.package || '16.0'));
    setFormDriveDate(job.drive_date || '');
    setFormDeadline(job.application_deadline || '');
    setFormLocation(job.location || 'Bangalore, India');
    setFormMinCgpa(String(job.minimum_cgpa ?? '7.5'));
    setFormMaxBacklogs(String(job.max_backlogs ?? '0'));
    setFormJobType(job.job_type || 'FULL_TIME');
    setFormStatus(job.status || 'OPEN');
    setFormDepartmentIds((job.departments || []).map((d) => d.department_id));
    setFormSkills((job.skills || []).map((s) => ({
      skill_id: s.skill_id,
      skill_name: s.skill_name,
      required_level: s.required_level || 'INTERMEDIATE',
    })));
    setSelectedSkillId(availableSkills[0]?.id ? String(availableSkills[0].id) : '');
    setSelectedSkillLevel('INTERMEDIATE');
    setIsDrawerOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleToggleDepartment = (deptId) => {
    setFormDepartmentIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const handleAddSkillRule = () => {
    if (!selectedSkillId) return;
    const skillObj = availableSkills.find((s) => String(s.id) === String(selectedSkillId));
    if (!skillObj) return;

    setFormSkills((prev) => [
      ...prev.filter((s) => s.skill_id !== skillObj.id),
      {
        skill_id: skillObj.id,
        skill_name: skillObj.name,
        required_level: selectedSkillLevel,
      },
    ]);
  };

  const handleRemoveSkillRule = (skillId) => {
    setFormSkills((prev) => prev.filter((s) => s.skill_id !== skillId));
  };

  const handleSaveDriveForm = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCompanyId) {
      toast.warning('Required Fields', 'Please select a company and provide a job title.');
      return;
    }

    const payload = {
      company_id: parseInt(formCompanyId, 10),
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      minimum_cgpa: parseFloat(formMinCgpa) || 7.0,
      package: parseFloat(formPackage) || 0,
      package_max: parseFloat(formPackageMax) || parseFloat(formPackage) || 0,
      max_backlogs: parseInt(formMaxBacklogs, 10) || 0,
      job_type: formJobType,
      location: formLocation.trim() || undefined,
      drive_date: formDriveDate || null,
      application_deadline: formDeadline || null,
      status: formStatus,
      skills: formSkills.map((s) => ({
        skill_id: s.skill_id,
        required_level: s.required_level,
      })),
      department_ids: formDepartmentIds,
    };

    try {
      if (editingJobId) {
        await jobsService.updateJob(editingJobId, payload);
        toast.success('Drive Updated', `Successfully updated recruitment parameters for ${formTitle}.`);
      } else {
        await jobsService.createJob(payload);
        toast.success('Drive Published', `Published new recruitment drive: ${formTitle}.`);
      }
      setIsCreateModalOpen(false);
      setEditingJobId(null);
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Save Failed', detail);
    }
  };

  // Helper to derive tier label
  const getJobTier = (job) => {
    const pkg = Number(job.package_max || job.package || 0);
    if (pkg >= 18) return 'SUPER_DREAM';
    if (pkg >= 10) return 'DREAM';
    return 'CORE';
  };

  // Filtered & Sorted Jobs
  const processedJobs = useMemo(() => {
    let result = jobs.map((job) => {
      const isEligible = Boolean(eligibleJobsMap[job.id]);
      const matchScore = eligibleJobsMap[job.id]?.match_score || 0;
      const tier = getJobTier(job);
      return {
        ...job,
        tier,
        isEligible,
        matchScore: Math.round(matchScore),
      };
    });

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (job) =>
          (job.title || '').toLowerCase().includes(q) ||
          (job.company_name || job.company || '').toLowerCase().includes(q) ||
          (job.location || '').toLowerCase().includes(q)
      );
    }

    if (activeRole === 'STUDENT' && eligibleOnly) {
      result = result.filter((job) => job.isEligible);
    }

    if (activeRole !== 'STUDENT' && statusFilter !== 'ALL') {
      result = result.filter((job) => (job.status || 'OPEN') === statusFilter);
    }

    if (tierFilter !== 'ALL') {
      result = result.filter((job) => job.tier === tierFilter);
    }

    if (packageRangeFilter !== 'ALL') {
      result = result.filter((job) => {
        const pkg = Number(job.package_max || job.package || 0);
        if (packageRangeFilter === 'UNDER_10') return pkg < 10;
        if (packageRangeFilter === '10_TO_18') return pkg >= 10 && pkg <= 18;
        if (packageRangeFilter === 'ABOVE_18') return pkg > 18;
        return true;
      });
    }

    return result.sort((a, b) => {
      if (sortBy === 'best_match' && activeRole === 'STUDENT') {
        if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortBy === 'highest_package') {
        return Number(b.package_max || b.package || 0) - Number(a.package_max || a.package || 0);
      }
      if (sortBy === 'closing_soon') {
        const d1 = a.application_deadline ? new Date(a.application_deadline).getTime() : 9999999999999;
        const d2 = b.application_deadline ? new Date(b.application_deadline).getTime() : 9999999999999;
        return d1 - d2;
      }
      return 0;
    });
  }, [
    jobs,
    eligibleJobsMap,
    searchQuery,
    eligibleOnly,
    statusFilter,
    tierFilter,
    packageRangeFilter,
    sortBy,
    activeRole,
  ]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                activeRole === 'ADMIN'
                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                  : activeRole === 'STAFF'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {activeRole === 'ADMIN'
                ? 'Executive Console'
                : activeRole === 'STAFF'
                ? 'TPO Placement Operations'
                : 'Student Candidate Portal'}
            </span>
            <span className="text-xs text-[#64748B]">· {jobs.length} Recruitment Drives</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-[#0B0B0F]">
            {activeRole === 'STUDENT' ? 'Available Campus Drives' : 'Campus Recruitment Drives'}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            {activeRole === 'STUDENT'
              ? 'Verify your eligibility criteria, track application status, and view live recruitment drives'
              : 'Configure company CTC tiers, academic cutoffs, inspect candidate eligibility cohorts, and review applications'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-full p-1 border border-black/5 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'grid' ? 'bg-[#0B0B0F] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#0B0B0F]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'table' ? 'bg-[#0B0B0F] text-white shadow-2xs' : 'text-[#64748B] hover:text-[#0B0B0F]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {(activeRole === 'ADMIN' || activeRole === 'STAFF') && (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={Clock}
                onClick={handleCloseExpired}
                title="Automatically mark drives with passed deadlines as CLOSED"
              >
                Close Expired
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={openCreateModal}
              >
                New Hiring Drive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white/85 backdrop-blur-md rounded-3xl p-4 border border-black/5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative min-w-[180px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search role, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs bg-[#F8F8FA] border border-black/10 text-[#0B0B0F] placeholder-slate-400 outline-none focus:border-violet-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {activeRole === 'STUDENT' && (
            <button
              type="button"
              onClick={() => setEligibleOnly(!eligibleOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                eligibleOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-[#475569] border-black/10 hover:border-black/25'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Eligible Only</span>
            </button>
          )}

          {activeRole !== 'STUDENT' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="CLOSED">Closed Only</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          )}

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#0B0B0F] outline-none"
          >
            <option value="ALL">All Tiers</option>
            <option value="SUPER_DREAM">Super Dream (&gt;18 LPA)</option>
            <option value="DREAM">Dream (10–18 LPA)</option>
            <option value="CORE">Core (&lt;10 LPA)</option>
          </select>

          <select
            value={packageRangeFilter}
            onChange={(e) => setPackageRangeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#0B0B0F] outline-none"
          >
            <option value="ALL">All Packages</option>
            <option value="UNDER_10">&lt; 10 LPA</option>
            <option value="10_TO_18">10 – 18 LPA</option>
            <option value="ABOVE_18">18+ LPA</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#475569] flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-violet-600" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#0B0B0F] text-white outline-none cursor-pointer"
          >
            {activeRole === 'STUDENT' ? (
              <>
                <option value="best_match">Best Match Score</option>
                <option value="highest_package">Highest CTC</option>
                <option value="closing_soon">Closing Soon</option>
              </>
            ) : (
              <>
                <option value="closing_soon">Closing Soon</option>
                <option value="highest_package">Highest CTC</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* 3. Main Grid or Table */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading placement recruitment drives...</p>
        </div>
      ) : processedJobs.length === 0 ? (
        <GlassCard variant="white" className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-[#0B0B0F]">
            No recruitment drives found
          </h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Try adjusting your search query, tier filter, or package range to inspect all active campus recruitment drives.
          </p>
        </GlassCard>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedJobs.map((job) => {
            const isOpen = (job.status || 'OPEN') === 'OPEN';
            const isExpired = isDeadlineExpired(job.application_deadline);
            const isStudent = activeRole === 'STUDENT';
            const studentApp = isStudent ? studentApplicationsMap[job.id] : null;
            const hasApplied = Boolean(studentApp);

            return (
              <GlassCard
                key={job.id}
                variant="white"
                hoverEffect={true}
                onClick={() => {
                  setSelectedJob(job);
                  setDrawerActiveTab('details');
                  setIsDrawerOpen(true);
                }}
                className="p-6 flex flex-col justify-between relative cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-100 to-indigo-100 flex items-center justify-center font-display font-bold text-xs text-violet-700 flex-shrink-0">
                        {(job.company_name || job.company || 'CO').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              job.tier === 'SUPER_DREAM'
                                ? 'bg-amber-100 text-amber-800'
                                : job.tier === 'DREAM'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {job.tier}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOpen
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {job.status || 'OPEN'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] font-medium mt-0.5 truncate">
                          Deadline: {job.application_deadline || 'Open'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isStudent && job.isEligible && (
                        <div
                          className="relative w-10 h-10 flex items-center justify-center flex-shrink-0"
                          title={`Your Match Score: ${job.matchScore}%`}
                        >
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="15"
                              stroke="#EDE9FE"
                              strokeWidth="3.5"
                              fill="none"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15"
                              stroke="#10B981"
                              strokeWidth="3.5"
                              strokeDasharray="94.2"
                              strokeDashoffset={94.2 - (94.2 * job.matchScore) / 100}
                              strokeLinecap="round"
                              fill="none"
                            />
                          </svg>
                          <span className="absolute font-display font-black text-[10px] text-emerald-700">
                            {job.matchScore}%
                          </span>
                        </div>
                      )}

                      <span className="font-display font-black text-xs sm:text-sm text-[#0B0B0F] bg-[#F4F4F7] px-2.5 py-1.5 rounded-full tabular-nums whitespace-nowrap">
                        {job.package_max && job.package_max !== job.package
                          ? `${job.package}–${job.package_max}`
                          : job.package || '0'}{' '}
                        LPA
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-base text-[#0B0B0F] group-hover:text-violet-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#475569] mb-3">
                    {job.company_name || job.company} · {job.location || 'India'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                      Min CGPA: {job.minimum_cgpa}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                      Backlogs ≤ {job.max_backlogs}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                      {job.job_type}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                  {isStudent ? (
                    hasApplied ? (
                      <span className="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full">
                        ✓ Applied ({studentApp.status})
                      </span>
                    ) : job.isEligible && isOpen && !isExpired ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(job);
                        }}
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <span
                        className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full flex items-center gap-1 cursor-help"
                        title={!isOpen ? 'Drive closed' : isExpired ? 'Deadline passed' : 'Academic or policy gap'}
                      >
                        <Lock className="w-3 h-3" />
                        Ineligible
                      </span>
                    )
                  ) : (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleToggleJobStatus(job)}
                        className="text-xs font-bold text-slate-600 hover:text-black underline"
                      >
                        {isOpen ? 'Close' : 'Reopen'}
                      </button>
                    </div>
                  )}

                  <span className="text-xs font-bold text-violet-600 group-hover:underline">
                    View Details →
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <GlassCard variant="white" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/5 bg-[#FAFAFC] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6">Company & Role</th>
                  <th className="py-3.5 px-6">Tier & Status</th>
                  <th className="py-3.5 px-6">CTC Package</th>
                  <th className="py-3.5 px-6">Academic Cutoff</th>
                  {activeRole === 'STUDENT' ? (
                    <th className="py-3.5 px-6">Eligibility</th>
                  ) : (
                    <th className="py-3.5 px-6">Deadline</th>
                  )}
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {processedJobs.map((job) => {
                  const isOpen = (job.status || 'OPEN') === 'OPEN';
                  const isExpired = isDeadlineExpired(job.application_deadline);
                  const isStudent = activeRole === 'STUDENT';
                  const studentApp = isStudent ? studentApplicationsMap[job.id] : null;
                  const hasApplied = Boolean(studentApp);

                  return (
                    <tr
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job);
                        setDrawerActiveTab('details');
                        setIsDrawerOpen(true);
                      }}
                      className="hover:bg-[#F9F9FB] cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-[#0B0B0F] text-sm">{job.title}</p>
                        <p className="text-[11px] text-[#64748B]">
                          {job.company_name || job.company} · {job.location || 'India'}
                        </p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full mr-1.5">
                          {job.tier}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {job.status || 'OPEN'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-display font-bold text-[#0B0B0F] whitespace-nowrap tabular-nums">
                        {job.package_max && job.package_max !== job.package
                          ? `${job.package}–${job.package_max}`
                          : job.package || '0'}{' '}
                        LPA
                      </td>
                      <td className="py-4 px-6 font-semibold whitespace-nowrap">
                        CGPA ≥ {job.minimum_cgpa} · Max {job.max_backlogs} Backlog
                      </td>

                      {isStudent ? (
                        <td className="py-4 px-6 whitespace-nowrap">
                          {hasApplied ? (
                            <span className="font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full text-xs">
                              ✓ Applied ({studentApp.status})
                            </span>
                          ) : job.isEligible ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                              {job.matchScore}% Match · Eligible
                            </span>
                          ) : (
                            <span className="font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-xs">
                              Ineligible
                            </span>
                          )}
                        </td>
                      ) : (
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-[#64748B]">
                          {job.application_deadline || 'No deadline'}
                        </td>
                      )}

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isStudent ? (
                          hasApplied ? (
                            <Button variant="secondary" size="sm">
                              View
                            </Button>
                          ) : job.isEligible && isOpen && !isExpired ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApply(job);
                              }}
                            >
                              Apply
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm" disabled>
                              Locked
                            </Button>
                          )
                        ) : (
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditModal(job)}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* 4. JOB DETAIL DRAWER */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isDrawer={true}
        title={selectedJob ? selectedJob.title : 'Hiring Drive'}
        subtitle={
          selectedJob
            ? `${selectedJob.company_name || selectedJob.company} · ${selectedJob.tier} · ${
                selectedJob.package_max && selectedJob.package_max !== selectedJob.package
                  ? `${selectedJob.package}–${selectedJob.package_max}`
                  : selectedJob.package || '0'
              } LPA`
            : ''
        }
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex bg-[#ECECEF] rounded-full p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDrawerActiveTab('details')}
                className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                  drawerActiveTab === 'details'
                    ? 'bg-white text-[#0B0B0F] shadow-xs'
                    : 'text-[#64748B]'
                }`}
              >
                Specifications
              </button>

              {activeRole === 'STUDENT' ? (
                <button
                  type="button"
                  onClick={() => setDrawerActiveTab('eligible')}
                  className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                    drawerActiveTab === 'eligible'
                      ? 'bg-white text-[#0B0B0F] shadow-xs'
                      : 'text-[#64748B]'
                  }`}
                >
                  Criteria Checklist
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDrawerActiveTab('eligible')}
                  className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                    drawerActiveTab === 'eligible'
                      ? 'bg-white text-[#0B0B0F] shadow-xs'
                      : 'text-[#64748B]'
                  }`}
                >
                  Eligible Students ({eligibleStudentsList.length})
                </button>
              )}
            </div>

            {/* TAB 1: Specifications */}
            {drawerActiveTab === 'details' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100">
                  <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider block mb-1">
                    Role Description
                  </span>
                  <p className="text-xs text-[#0B0B0F] leading-relaxed">
                    {selectedJob.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">CTC Package</span>
                    <span className="font-display font-extrabold text-[#0B0B0F] text-sm">
                      {selectedJob.package_max && selectedJob.package_max !== selectedJob.package
                        ? `${selectedJob.package}–${selectedJob.package_max}`
                        : selectedJob.package || '0'}{' '}
                      LPA
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Drive Status</span>
                    <span className="font-bold text-[#0B0B0F] text-sm">
                      {selectedJob.status || 'OPEN'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-black/5 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Academic Cutoff Criteria
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Minimum CGPA:</span>
                    <span className="font-bold text-[#0B0B0F]">{selectedJob.minimum_cgpa}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Max Active Backlogs:</span>
                    <span className="font-bold text-[#0B0B0F]">{selectedJob.max_backlogs}</span>
                  </div>
                </div>

                {selectedJob.departments && selectedJob.departments.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider block">
                      Eligible Departments
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.departments.map((d) => (
                        <span
                          key={d.department_id}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200"
                        >
                          {d.department_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider block">
                      Required Skills & Levels
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills.map((sk) => (
                        <span
                          key={sk.skill_id}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {sk.skill_name} · <strong className="text-violet-700">{sk.required_level}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-2.5">
                  {activeRole === 'STUDENT' ? (
                    !studentApplicationsMap[selectedJob.id] && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={
                          !eligibleJobsMap[selectedJob.id] ||
                          (selectedJob.status || 'OPEN') !== 'OPEN' ||
                          isDeadlineExpired(selectedJob.application_deadline)
                        }
                        onClick={() => handleApply(selectedJob)}
                      >
                        Apply For This Drive
                      </Button>
                    )
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleJobStatus(selectedJob)}
                      >
                        {(selectedJob.status || 'OPEN') === 'OPEN' ? 'Close Drive' : 'Reopen Drive'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Archive}
                        onClick={() => handleArchiveJob(selectedJob)}
                      >
                        Archive
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openEditModal(selectedJob)}
                      >
                        Edit Drive
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ELIGIBLE COHORT (STAFF) OR CRITERIA CHECKLIST (STUDENT) */}
            {drawerActiveTab === 'eligible' && (
              <div className="space-y-4">
                {activeRole === 'STUDENT' ? (
                  /* STUDENT VIEW: criteria checklist from fn_eligibility_check */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#64748B]">
                        Evaluation from database eligibility engine:
                      </p>
                      {jobEligibilityCriteria && (
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            jobEligibilityCriteria.eligible && jobEligibilityCriteria.policy_ok
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {jobEligibilityCriteria.eligible && jobEligibilityCriteria.policy_ok
                            ? '✓ Eligible'
                            : '✕ Ineligible'}
                        </span>
                      )}
                    </div>

                    {loadingEligibility ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        Checking database eligibility rules...
                      </div>
                    ) : jobEligibilityCriteria?.criteria ? (
                      <div className="space-y-2">
                        {jobEligibilityCriteria.criteria.map((c, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                              c.passed
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-rose-50/80 border-rose-200 text-rose-900 font-semibold'
                            }`}
                          >
                            <div>
                              <p className="font-bold">{c.rule} ({c.category})</p>
                              <p className="text-[11px] opacity-90 mt-0.5">
                                Required: {c.required} · Your profile: {c.actual}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                c.passed
                                  ? 'bg-emerald-200/80 text-emerald-900'
                                  : 'bg-rose-200/80 text-rose-900'
                              }`}
                            >
                              {c.passed ? 'PASSED' : 'GAP'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-500">
                        Unable to compute eligibility checklist.
                      </div>
                    )}
                  </div>
                ) : (
                  /* STAFF VIEW: fn_eligible_students(:job_id) */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-[#64748B]">
                        Eligible student cohort from database:
                      </p>
                      <span className="font-bold text-emerald-700">
                        {eligibleStudentsList.length} Eligible Candidates
                      </span>
                    </div>

                    {loadingEligibleStudents ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        Evaluating candidate cohort...
                      </div>
                    ) : eligibleStudentsList.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        No students currently meet all eligibility benchmarks for this drive.
                      </div>
                    ) : (
                      <div className="divide-y divide-black/5 max-h-[460px] overflow-y-auto pr-1">
                        {eligibleStudentsList.map((std) => (
                          <div
                            key={std.student_id}
                            className="py-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar name={std.student_name} size="xs" />
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-[#0B0B0F] truncate">{std.student_name}</p>
                                <p className="text-[10px] text-[#64748B] truncate">
                                  {std.roll_number} · {std.department} · CGPA {std.cgpa}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleStaffAddStudentToApp(selectedJob.id, std.student_id, std.student_name)
                              }
                            >
                              + Add to Application
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 5. CREATE / EDIT DRIVE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingJobId(null);
        }}
        title={editingJobId ? 'Edit Campus Recruitment Drive' : 'Launch New Campus Hiring Drive'}
        subtitle="Configure company, CTC parameters, cutoff thresholds, allowed departments, and skill benchmarks"
      >
        <form onSubmit={handleSaveDriveForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Target Company *
              </label>
              <select
                value={formCompanyId}
                onChange={(e) => setFormCompanyId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-black/10 text-[#0B0B0F] outline-none"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
            </div>

            <Input
              variant="pill"
              label="Job Role / Title *"
              placeholder="e.g. Full Stack Software Engineer"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              variant="pill"
              label="Package / CTC (LPA) *"
              type="number"
              step="0.1"
              value={formPackage}
              onChange={(e) => setFormPackage(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="Max CTC (LPA)"
              type="number"
              step="0.1"
              value={formPackageMax}
              onChange={(e) => setFormPackageMax(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              variant="pill"
              label="Location"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
            />
            <Input
              variant="pill"
              label="Min CGPA (0 - 10) *"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formMinCgpa}
              onChange={(e) => setFormMinCgpa(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="Max Backlogs *"
              type="number"
              min="0"
              value={formMaxBacklogs}
              onChange={(e) => setFormMaxBacklogs(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Job Type</label>
              <select
                value={formJobType}
                onChange={(e) => setFormJobType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-black/10 outline-none"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="PPO">PPO</option>
              </select>
            </div>

            <Input
              variant="pill"
              label="Drive Date"
              type="date"
              value={formDriveDate}
              onChange={(e) => setFormDriveDate(e.target.value)}
            />

            <Input
              variant="pill"
              label="Application Deadline"
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Status</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-black/10 outline-none"
            >
              <option value="OPEN">OPEN (Accepting Applications)</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              placeholder="Outline engineering scope, requirements..."
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-white border border-black/10 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Allowed Departments (Empty means all departments)
            </label>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => {
                const selected = formDepartmentIds.includes(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleToggleDepartment(dept.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-[#0B0B0F] text-white border-[#0B0B0F]'
                        : 'bg-white text-[#64748B] border-black/10 hover:border-black/25'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {dept.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#475569]">
              Required Skills & Minimum Levels
            </label>
            <div className="flex flex-wrap gap-1.5">
              {formSkills.map((sk) => (
                <span
                  key={sk.skill_id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-900"
                >
                  <span>
                    {sk.skill_name} · <strong>{sk.required_level}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillRule(sk.skill_id)}
                    className="text-violet-500 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-full text-xs bg-white border border-black/10 outline-none"
              >
                {availableSkills.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.category})
                  </option>
                ))}
              </select>
              <select
                value={selectedSkillLevel}
                onChange={(e) => setSelectedSkillLevel(e.target.value)}
                className="px-3 py-2 rounded-full text-xs font-semibold bg-white border border-black/10 outline-none"
              >
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddSkillRule}
              >
                Add Skill
              </Button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingJobId ? 'Save Changes' : 'Publish Drive'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
