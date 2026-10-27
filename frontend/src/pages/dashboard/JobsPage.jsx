import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { mockApi } from '../../services/mockApi.js';
import { checkEligibility, SKILL_LEVELS } from '../../services/eligibility.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  LayoutGrid,
  List,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lock,
  Filter,
  ArrowUpDown,
  Calendar,
  X,
  Briefcase,
  Building2,
  Users,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Eye,
  Settings2,
  FileText,
  ChevronRight,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sliders,
  BarChart3,
  Search,
  Check,
  CheckSquare,
  Info,
} from 'lucide-react';

const ALL_BRANCHES = [
  'Computer Science',
  'Information Tech.',
  'Electronics & Comm.',
  'Mechanical Eng.',
];

export default function JobsPage() {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState('details'); // 'details' | 'eligible' | 'applications'
  const [drawerCohortFilter, setDrawerCohortFilter] = useState('ALL'); // 'ALL' | 'ELIGIBLE' | 'INELIGIBLE'
  const [drawerAppFilter, setDrawerAppFilter] = useState('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  // Student specific filters
  const [eligibleOnly, setEligibleOnly] = useState(false);

  // Staff / Admin specific filters
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'CLOSED'
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Common filters & sorting
  const [tierFilter, setTierFilter] = useState('ALL');
  const [packageRangeFilter, setPackageRangeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState(activeRole === 'STUDENT' ? 'best_match' : 'closing_soon');

  // Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPackageMin, setNewPackageMin] = useState('14.0');
  const [newPackageMax, setNewPackageMax] = useState('18.0');
  const [newDriveDate, setNewDriveDate] = useState('2026-11-22');
  const [newDeadline, setNewDeadline] = useState('2026-11-18');
  const [newLocation, setNewLocation] = useState('Bangalore, India (Hybrid)');
  const [newMinCgpa, setNewMinCgpa] = useState('8.0');
  const [newMaxBacklogs, setNewMaxBacklogs] = useState('0');
  const [newAllowedBranches, setNewAllowedBranches] = useState([
    'Computer Science',
    'Information Tech.',
  ]);
  const [newRequiredSkills, setNewRequiredSkills] = useState([
    { name: 'React', level: 'Advanced' },
    { name: 'TypeScript', level: 'Intermediate' },
  ]);
  const [skillInputName, setSkillInputName] = useState('');
  const [skillInputLevel, setSkillInputLevel] = useState('Intermediate');
  const [newTier, setNewTier] = useState('Dream');
  const [newStatus, setNewStatus] = useState('OPEN');
  const [newDescription, setNewDescription] = useState('');

  // Synchronously adjust default sorting if role changes
  useEffect(() => {
    if (activeRole === 'STUDENT') {
      setSortBy('best_match');
    } else {
      setSortBy('closing_soon');
    }
  }, [activeRole]);

  // Load all jobs, students, applications, and interviews
  const loadData = async () => {
    try {
      const [jobsData, studentsData, appsData, interviewsData] = await Promise.all([
        mockApi.getJobs(),
        mockApi.getStudents(),
        mockApi.getApplications(),
        mockApi.getInterviews(),
      ]);
      setJobs(jobsData || []);
      setStudents(studentsData || []);
      setApplications(appsData || []);
      setInterviews(interviewsData || []);
    } catch (err) {
      console.error('Failed to load jobs data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ONLY for STUDENT role: resolve active student profile
  // For STAFF and ADMIN: this remains strictly null so their accounts are NEVER conflated with students!
  const currentStudent = useMemo(() => {
    if (activeRole !== 'STUDENT') return null;
    const targetId = user?.id || 'student-rohit';
    const found = students.find((s) => s.id === targetId) || students[0];
    if (!found) return user;
    return {
      ...found,
      ...user,
      skill_proficiencies: user?.skill_proficiencies || found?.skill_proficiencies || [],
    };
  }, [students, user, activeRole]);

  // Helper to determine if a deadline has expired (comparing with today's date)
  const isDeadlineExpired = (deadlineStr) => {
    if (!deadlineStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return deadlineStr < today;
  };

  // Precompute dynamic drive statistics from shared mock data store
  const driveStats = useMemo(() => {
    const stats = {};
    jobs.forEach((job) => {
      // 1. Applicants for this drive
      const applicants = applications.filter(
        (a) => (a.job_id || a.jobId) === job.id
      );
      // 2. Eligible students in batch
      const eligible = students.filter(
        (s) => checkEligibility(s, job).eligible
      );
      // 3. Shortlisted / in-process applicants
      const inProcess = applicants.filter((a) =>
        ['SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'OFFER_RELEASED'].includes(a.status)
      );

      stats[job.id] = {
        applicantsCount: applicants.length > 0 ? applicants.length : (job.applied_count ?? job.appliedCount ?? 0),
        applicantsList: applicants,
        eligibleCount: eligible.length,
        eligibleList: eligible,
        eligiblePercent: students.length > 0 ? Math.round((eligible.length / students.length) * 100) : 0,
        inProcessCount: inProcess.length,
      };
    });
    return stats;
  }, [jobs, applications, students]);

  // Precompute student's applications & interviews (ONLY when activeRole === 'STUDENT')
  const studentApplicationsMap = useMemo(() => {
    if (activeRole !== 'STUDENT' || !currentStudent) return {};
    const map = {};
    applications.forEach((a) => {
      const sid = a.student_id || a.studentId;
      if (sid === currentStudent.id) {
        const jid = a.job_id || a.jobId;
        map[jid] = a;
      }
    });
    return map;
  }, [activeRole, currentStudent, applications]);

  const studentInterviewsMap = useMemo(() => {
    if (activeRole !== 'STUDENT' || !currentStudent) return {};
    const map = {};
    interviews.forEach((i) => {
      const sid = i.student_id || i.studentId;
      if (sid === currentStudent.id) {
        if (i.application_id) map[i.application_id] = i;
        if (i.company) map[i.company.toLowerCase()] = i;
      }
    });
    return map;
  }, [activeRole, currentStudent, interviews]);

  // Student Application handler
  const handleApply = async (job) => {
    if (activeRole !== 'STUDENT') {
      toast.warning('Access Restricted', 'Only candidate student accounts can submit job applications.');
      return;
    }
    const studentId = currentStudent?.id || 'student-rohit';

    // Verify eligibility before submission
    const evaluation = checkEligibility(currentStudent, job);
    if (!evaluation.eligible) {
      toast.warning('Ineligible Application', 'You do not meet the minimum eligibility benchmarks for this drive.');
      return;
    }
    if ((job.status || 'OPEN') !== 'OPEN') {
      toast.error('Drive Closed', 'This recruitment drive is currently closed.');
      return;
    }
    if (isDeadlineExpired(job.deadline)) {
      toast.error('Deadline Passed', 'The application window for this drive has closed.');
      return;
    }

    try {
      await mockApi.applyToJob({
        student_id: studentId,
        job_id: job.id,
      });
      toast.placement(
        `Applied to ${job.company}`,
        `Registered for ${job.title} (${job.package_max_lpa || job.package_lpa} LPA)`
      );
      const [updatedJobs, updatedApps] = await Promise.all([
        mockApi.getJobs(),
        mockApi.getApplications(),
      ]);
      setJobs(updatedJobs);
      setApplications(updatedApps);
      if (selectedJob && selectedJob.id === job.id) {
        setSelectedJob(updatedJobs.find((j) => j.id === job.id) || selectedJob);
      }
    } catch (err) {
      console.error(err);
      toast.error('Application Failed', 'An error occurred while submitting your application.');
    }
  };

  // Staff & Admin: Toggle Job Status (Open / Close)
  const handleToggleJobStatus = async (job) => {
    const nextStatus = (job.status || 'OPEN') === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await mockApi.updateJob(job.id, { status: nextStatus });
      const updatedJobs = await mockApi.getJobs();
      setJobs(updatedJobs);
      if (selectedJob && selectedJob.id === job.id) {
        setSelectedJob({ ...selectedJob, status: nextStatus });
      }
      toast.info(
        `Drive Status Updated`,
        `${job.company} (${job.title}) is now marked as ${nextStatus}.`
      );
    } catch (err) {
      console.error(err);
      toast.error('Update Failed', 'Could not update drive status.');
    }
  };

  // Modal open handlers
  const openCreateModal = () => {
    setEditingJobId(null);
    setNewTitle('');
    setNewCompany('');
    setNewPackageMin('14.0');
    setNewPackageMax('18.0');
    setNewDriveDate('2026-11-22');
    setNewDeadline('2026-11-18');
    setNewLocation('Bangalore, India (Hybrid)');
    setNewMinCgpa('8.0');
    setNewMaxBacklogs('0');
    setNewAllowedBranches(['Computer Science', 'Information Tech.']);
    setNewRequiredSkills([
      { name: 'React', level: 'Advanced' },
      { name: 'TypeScript', level: 'Intermediate' },
    ]);
    setNewTier('Dream');
    setNewStatus('OPEN');
    setNewDescription(
      'Campus recruitment drive configured via PlaceTrack placement administration console.'
    );
    setIsCreateModalOpen(true);
  };

  const openEditModal = (jobToEdit) => {
    if (!jobToEdit) return;
    setEditingJobId(jobToEdit.id);
    setNewTitle(jobToEdit.title || '');
    setNewCompany(jobToEdit.company || '');
    setNewPackageMin(String(jobToEdit.package_min_lpa ?? jobToEdit.package_lpa ?? 12));
    setNewPackageMax(String(jobToEdit.package_max_lpa ?? jobToEdit.package_lpa ?? 16));
    setNewDriveDate(jobToEdit.drive_date || '2026-11-20');
    setNewDeadline(jobToEdit.deadline || '2026-11-15');
    setNewLocation(jobToEdit.location || 'Bangalore, India');
    setNewMinCgpa(String(jobToEdit.min_cgpa ?? 7.5));
    setNewMaxBacklogs(String(jobToEdit.max_backlogs ?? 0));
    setNewAllowedBranches(
      jobToEdit.allowed_branches || jobToEdit.eligibleDepartments || ['Computer Science']
    );
    setNewRequiredSkills(jobToEdit.required_skills || []);
    setNewTier(jobToEdit.tier || 'Dream');
    setNewStatus(jobToEdit.status || 'OPEN');
    setNewDescription(jobToEdit.description || '');
    setIsDrawerOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleToggleBranch = (branch) => {
    setNewAllowedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const handleAddSkillRule = () => {
    if (!skillInputName.trim()) return;
    setNewRequiredSkills((prev) => [
      ...prev.filter((s) => s.name.toLowerCase() !== skillInputName.trim().toLowerCase()),
      { name: skillInputName.trim(), level: skillInputLevel },
    ]);
    setSkillInputName('');
  };

  const handleRemoveSkillRule = (name) => {
    setNewRequiredSkills((prev) => prev.filter((s) => s.name !== name));
  };

  const handleSaveDriveForm = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const payload = {
      title: newTitle.trim(),
      company: newCompany.trim(),
      package_min_lpa: parseFloat(newPackageMin) || 12,
      package_max_lpa: parseFloat(newPackageMax) || 16,
      package_lpa: parseFloat(newPackageMax) || 16,
      drive_date: newDriveDate,
      deadline: newDeadline,
      location: newLocation,
      min_cgpa: parseFloat(newMinCgpa) || 7.5,
      max_backlogs: parseInt(newMaxBacklogs, 10) || 0,
      allowed_branches:
        newAllowedBranches.length > 0 ? newAllowedBranches : ['Computer Science'],
      required_skills: newRequiredSkills,
      tier: newTier,
      status: newStatus,
      description: newDescription.trim() || `${newCompany} campus recruitment drive for ${newTitle}.`,
    };

    try {
      if (editingJobId) {
        await mockApi.updateJob(editingJobId, payload);
        const updatedList = await mockApi.getJobs();
        setJobs(updatedList);
        toast.success(
          'Drive Updated',
          `Successfully updated recruitment parameters for ${newCompany}.`
        );
      } else {
        const created = await mockApi.createJob(payload);
        setJobs([created, ...jobs]);
        toast.success(
          'Drive Published',
          `Published new ${newTier} campus recruitment drive for ${newCompany}.`
        );
      }
      setIsCreateModalOpen(false);
      setEditingJobId(null);
    } catch (err) {
      console.error(err);
      toast.error('Save Failed', 'Could not save recruitment drive changes.');
    }
  };

  // Process & Filter Jobs based on active role
  const processedJobs = useMemo(() => {
    let result = jobs.map((job) => {
      if (activeRole === 'STUDENT' && currentStudent) {
        const evaluation = checkEligibility(currentStudent, job);
        return {
          ...job,
          studentEvaluation: evaluation,
          isEligible: evaluation.eligible,
          matchPercent: evaluation.matchPercent,
          failedRules: evaluation.failedRules,
        };
      }
      return {
        ...job,
        isEligible: false,
        matchPercent: 0,
        failedRules: [],
      };
    });

    // 1. Text Search Filter (company, role, location, branch)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (job) =>
          job.company.toLowerCase().includes(q) ||
          job.title.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          (job.allowed_branches || []).some((b) => b.toLowerCase().includes(q))
      );
    }

    // 2. Student-specific filter: "Eligible Only"
    if (activeRole === 'STUDENT' && eligibleOnly) {
      result = result.filter((job) => job.isEligible);
    }

    // 3. Staff/Admin-specific filter: Status Filter
    if (activeRole !== 'STUDENT' && statusFilter !== 'ALL') {
      result = result.filter((job) => (job.status || 'OPEN') === statusFilter);
    }

    // 4. Staff/Admin-specific filter: Branch Filter
    if (activeRole !== 'STUDENT' && branchFilter !== 'ALL') {
      result = result.filter((job) =>
        (job.allowed_branches || job.eligibleDepartments || []).includes(branchFilter)
      );
    }

    // 5. Tier Filter
    if (tierFilter !== 'ALL') {
      result = result.filter((job) => job.tier === tierFilter);
    }

    // 6. Package Range Filter
    if (packageRangeFilter !== 'ALL') {
      result = result.filter((job) => {
        const pkg = job.package_max_lpa || job.package_lpa || 0;
        if (packageRangeFilter === 'UNDER_14') return pkg < 14;
        if (packageRangeFilter === '14_TO_18') return pkg >= 14 && pkg <= 18;
        if (packageRangeFilter === 'ABOVE_18') return pkg > 18;
        return true;
      });
    }

    // 7. Sorting
    return result.sort((a, b) => {
      if (sortBy === 'best_match' && activeRole === 'STUDENT') {
        if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
        return (b.matchPercent || 0) - (a.matchPercent || 0);
      }
      if (sortBy === 'highest_package') {
        const pkgA = a.package_max_lpa || a.package_lpa || 0;
        const pkgB = b.package_max_lpa || b.package_lpa || 0;
        return pkgB - pkgA;
      }
      if (sortBy === 'closing_soon') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'drive_date') {
        return new Date(a.drive_date || a.deadline).getTime() - new Date(b.drive_date || b.deadline).getTime();
      }
      if (sortBy === 'most_applicants') {
        const countA = driveStats[a.id]?.applicantsCount || 0;
        const countB = driveStats[b.id]?.applicantsCount || 0;
        return countB - countA;
      }
      return 0;
    });
  }, [
    jobs,
    activeRole,
    currentStudent,
    searchQuery,
    eligibleOnly,
    statusFilter,
    branchFilter,
    tierFilter,
    packageRangeFilter,
    sortBy,
    driveStats,
  ]);

  // Executive Oversight Stats for ADMIN & STAFF
  const overviewStats = useMemo(() => {
    const totalDrives = jobs.length;
    const openDrives = jobs.filter((j) => (j.status || 'OPEN') === 'OPEN').length;
    const totalApps = applications.length;
    const superDreamCount = jobs.filter((j) => j.tier === 'Super Dream').length;
    const dreamCount = jobs.filter((j) => j.tier === 'Dream').length;
    const avgPackage =
      jobs.length > 0
        ? (
            jobs.reduce((acc, j) => acc + (j.package_max_lpa || j.package_lpa || 0), 0) /
            jobs.length
          ).toFixed(1)
        : '0.0';

    return {
      totalDrives,
      openDrives,
      totalApps,
      superDreamCount,
      dreamCount,
      avgPackage,
    };
  }, [jobs, applications]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-3 border-violet-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading placement recruitment drives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar: Dynamic based on Active Role */}
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
            <span className="text-xs text-[#64748B]">· {jobs.length} Published Drives</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-[#0B0B0F]">
            {activeRole === 'STUDENT'
              ? 'Available Campus Drives'
              : activeRole === 'STAFF'
              ? 'Campus Recruitment Drives Desk'
              : 'Placement Drive Oversight & Governance'}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            {activeRole === 'STUDENT'
              ? 'Verify your eligibility criteria, track application status, and view scheduled interview slots'
              : activeRole === 'STAFF'
              ? 'Configure company CTC tiers, academic cutoffs, inspect candidate eligibility cohorts, and review applications'
              : 'Institutional governance over campus hiring drives, CTC tiers, application volume, and recruitment policies'}
          </p>
        </div>

        {/* Header Action Controls */}
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
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openCreateModal}
            >
              New Hiring Drive
            </Button>
          )}

          {activeRole === 'ADMIN' && (
            <Button
              variant="secondary"
              size="sm"
              icon={BarChart3}
              onClick={() => navigate('/dashboard/analytics')}
            >
              Analytics
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Stats Band for ADMIN & STAFF */}
      {(activeRole === 'ADMIN' || activeRole === 'STAFF') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Active Open Drives</p>
              <p className="font-display font-extrabold text-2xl text-[#0B0B0F] mt-0.5">
                {overviewStats.openDrives}{' '}
                <span className="text-xs font-semibold text-[#64748B]">/ {overviewStats.totalDrives}</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Total Candidate Apps</p>
              <p className="font-display font-extrabold text-2xl text-[#0B0B0F] mt-0.5">
                {overviewStats.totalApps}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Average CTC Package</p>
              <p className="font-display font-extrabold text-2xl text-[#0B0B0F] mt-0.5">
                {overviewStats.avgPackage} <span className="text-xs font-semibold text-[#64748B]">LPA</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Super Dream / Dream</p>
              <p className="font-display font-extrabold text-2xl text-[#0B0B0F] mt-0.5">
                {overviewStats.superDreamCount + overviewStats.dreamCount}{' '}
                <span className="text-xs font-semibold text-[#64748B]">Tiers</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Filters & Search Bar */}
      <div className="bg-white/85 backdrop-blur-md rounded-3xl p-4 border border-black/5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Search + Role Specific Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
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

          {/* STUDENT ONLY: "Eligible Only" Toggle */}
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

          {/* STAFF & ADMIN ONLY: Drive Status Filter */}
          {activeRole !== 'STUDENT' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="CLOSED">Closed Only</option>
            </select>
          )}

          {/* STAFF & ADMIN ONLY: Department / Branch Filter */}
          {activeRole !== 'STUDENT' && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#0B0B0F] outline-none"
            >
              <option value="ALL">All Branches</option>
              {ALL_BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#0B0B0F] outline-none"
          >
            <option value="ALL">All Tiers</option>
            <option value="Super Dream">Super Dream (&gt;18 LPA)</option>
            <option value="Dream">Dream (12–18 LPA)</option>
            <option value="Core">Core (&lt;12 LPA)</option>
          </select>

          {/* Package Range Filter */}
          <select
            value={packageRangeFilter}
            onChange={(e) => setPackageRangeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-black/10 text-[#0B0B0F] outline-none"
          >
            <option value="ALL">All Packages</option>
            <option value="UNDER_14">&lt; 14 LPA</option>
            <option value="14_TO_18">14 – 18 LPA</option>
            <option value="ABOVE_18">18+ LPA</option>
          </select>
        </div>

        {/* Right Side: Sort By */}
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
                <option value="drive_date">Drive Date</option>
                <option value="highest_package">Highest CTC</option>
                <option value="most_applicants">Most Applicants</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* 4. Main Drives Grid or Table */}
      {processedJobs.length === 0 ? (
        <GlassCard variant="white" className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-[#0B0B0F]">
            No recruitment drives match your active filters
          </h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Try adjusting your search query, tier filter, or package range to inspect all active campus recruitment drives.
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setEligibleOnly(false);
                setStatusFilter('ALL');
                setBranchFilter('ALL');
                setTierFilter('ALL');
                setPackageRangeFilter('ALL');
                setSortBy(activeRole === 'STUDENT' ? 'best_match' : 'closing_soon');
              }}
            >
              Reset All Filters
            </Button>
          </div>
        </GlassCard>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedJobs.map((job) => {
            const stats = driveStats[job.id] || {
              applicantsCount: 0,
              eligibleCount: 0,
              eligiblePercent: 0,
              inProcessCount: 0,
            };

            const isOpen = (job.status || 'OPEN') === 'OPEN';
            const isExpired = isDeadlineExpired(job.deadline);

            // STUDENT ROLE SPECIFICS:
            const isStudent = activeRole === 'STUDENT';
            const studentApp = isStudent ? studentApplicationsMap[job.id] : null;
            const hasApplied = Boolean(studentApp);
            const studentInterview = studentApp
              ? studentInterviewsMap[studentApp.id] || studentInterviewsMap[job.company.toLowerCase()]
              : null;
            const rules = job.studentEvaluation || [];
            const failed = job.failedRules || [];

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
                  {/* Top Header Row: Company Logo, Tier, Status, Package & (Match % Ring for Student ONLY) */}
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-100 to-indigo-100 flex items-center justify-center font-display font-bold text-xs text-violet-700 flex-shrink-0">
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              job.tier === 'Super Dream'
                                ? 'bg-amber-100 text-amber-800'
                                : job.tier === 'Dream'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {job.tier || 'Dream'}
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
                          Drive: {job.drive_date || job.deadline}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Package and (Match Ring ONLY for Student) */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isStudent && job.isEligible && (
                        <div
                          className="relative w-10 h-10 flex items-center justify-center flex-shrink-0"
                          title={`Your Match Score: ${job.matchPercent}%`}
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
                              strokeDashoffset={94.2 - (94.2 * job.matchPercent) / 100}
                              strokeLinecap="round"
                              fill="none"
                            />
                          </svg>
                          <span className="absolute font-display font-black text-[10px] text-emerald-700">
                            {job.matchPercent}%
                          </span>
                        </div>
                      )}

                      <span className="font-display font-black text-xs sm:text-sm text-[#0B0B0F] bg-[#F4F4F7] px-2.5 py-1.5 rounded-full tabular-nums whitespace-nowrap">
                        {job.package_min_lpa && job.package_min_lpa !== job.package_max_lpa
                          ? `${job.package_min_lpa}–${job.package_max_lpa}`
                          : job.package_max_lpa || job.package_lpa}{' '}
                        LPA
                      </span>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <h3 className="font-display font-bold text-base text-[#0B0B0F] mb-0.5 group-hover:text-violet-700 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-3">
                    {job.company} · {job.location}
                  </p>

                  {/* ============================================================ */}
                  {/* MIDDLE SECTION: STUDENT VS STAFF/ADMIN                       */}
                  {/* ============================================================ */}

                  {isStudent ? (
                    /* STUDENT VIEW: Personal Eligibility Checklist */
                    <div className="bg-[#F9F9FB] rounded-2xl p-3 border border-black/5 space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                        <span>Your Eligibility Checklist</span>
                        <span className={job.isEligible ? 'text-emerald-700 font-extrabold' : 'text-rose-600 font-extrabold'}>
                          {rules.filter((r) => r.passed).length}/{rules.length} Met
                        </span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {rules.map((r, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between gap-2 text-[11px] px-2 py-1 rounded-lg ${
                              r.passed
                                ? 'bg-emerald-50/70 text-emerald-900'
                                : 'bg-rose-50/80 text-rose-900 font-semibold'
                            }`}
                          >
                            <span className="truncate">{r.label}</span>
                            {r.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* If student has applied, show live application stage & interview */}
                      {hasApplied && (
                        <div className="mt-2 pt-2 border-t border-black/5 flex flex-col gap-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#64748B]">Application Status:</span>
                            <span className="font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] uppercase">
                              {studentApp.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {studentInterview && (
                            <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between">
                              <span className="font-semibold truncate">
                                📅 {studentInterview.round_name}
                              </span>
                              <span className="text-[10px] font-bold">
                                {studentInterview.date} · {studentInterview.reporting_time}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* STAFF & ADMIN VIEW: Drive-Wide Cohort Metrics & Operational Parameters */
                    <div className="bg-[#F8F9FC] rounded-2xl p-3 border border-black/5 space-y-2 mb-4 text-xs">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        <span>Drive Operational Overview</span>
                        <span className="font-mono text-violet-700">Openings: {job.openings || 5}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div className="bg-white p-2 rounded-xl border border-black/5">
                          <span className="text-[10px] text-[#64748B] block">Total Applicants</span>
                          <span className="font-display font-extrabold text-sm text-[#0B0B0F]">
                            {stats.applicantsCount}{' '}
                            <span className="text-[10px] font-normal text-slate-500">students</span>
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-black/5">
                          <span className="text-[10px] text-[#64748B] block">Eligible in Batch</span>
                          <span className="font-display font-extrabold text-sm text-emerald-700">
                            {stats.eligibleCount}{' '}
                            <span className="text-[10px] font-normal text-emerald-800">
                              ({stats.eligiblePercent}%)
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#475569] space-y-1 pt-1 border-t border-black/5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Cutoff Benchmark:</span>
                          <span className="font-bold text-[#0B0B0F]">
                            CGPA ≥ {job.min_cgpa} · Max {job.max_backlogs ?? 0} Backlog
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-slate-500 flex-shrink-0">Branches:</span>
                          <span className="font-semibold text-[#0B0B0F] text-right truncate">
                            {(job.allowed_branches || job.eligibleDepartments || []).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ============================================================ */}
                {/* BOTTOM ACTION AREA: ROLE-BASED ACTIONS                      */}
                {/* ============================================================ */}
                <div className="pt-3 border-t border-black/5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>
                      Deadline: <strong className="text-[#0B0B0F]">{job.deadline}</strong>
                      {isExpired && <span className="ml-1 text-rose-600 font-bold">(Passed)</span>}
                    </span>
                    <span>{stats.applicantsCount} applied</span>
                  </div>

                  {isStudent ? (
                    /* ---------------- STUDENT ACTIONS ---------------- */
                    <div className="flex items-center justify-between gap-2">
                      {job.isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          Eligible ({job.matchPercent}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 truncate">
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          {failed.length} Gap{failed.length > 1 ? 's' : ''} Found
                        </span>
                      )}

                      {hasApplied ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                            setDrawerActiveTab('details');
                            setIsDrawerOpen(true);
                          }}
                        >
                          View Application
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
                          Apply Now
                        </Button>
                      ) : (
                        /* Disabled / Locked State with Explanation */
                        <div
                          className="relative group/lock"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3" />
                            <span>
                              {!isOpen
                                ? 'Drive Closed'
                                : isExpired
                                ? 'Deadline Passed'
                                : 'Ineligible'}
                            </span>
                          </button>

                          {/* Hover Tooltip explaining exact disabled reason */}
                          <div className="invisible group-hover/lock:visible opacity-0 group-hover/lock:opacity-100 transition-all absolute bottom-full right-0 mb-2 w-64 p-3 rounded-2xl bg-[#0B0B0F] text-white text-[11px] shadow-xl z-40 pointer-events-none">
                            <p className="font-bold text-rose-300 mb-1">
                              {!isOpen
                                ? 'Drive is Closed'
                                : isExpired
                                ? `Deadline expired on ${job.deadline}`
                                : 'Eligibility Gaps:'}
                            </p>
                            {!isOpen ? (
                              <p className="text-slate-200">
                                This recruitment drive has been closed by the TPO placement desk.
                              </p>
                            ) : isExpired ? (
                              <p className="text-slate-200">
                                The application window for this campus drive ended on {job.deadline}.
                              </p>
                            ) : (
                              <ul className="space-y-1 list-disc list-inside text-slate-200">
                                {failed.map((f, i) => (
                                  <li key={i}>{f.label}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ---------------- STAFF & ADMIN ACTIONS ---------------- */
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleJobStatus(job);
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                            isOpen
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={isOpen ? 'Click to close drive' : 'Click to reopen drive'}
                        >
                          {isOpen ? 'Close Drive' : 'Re-open Drive'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(job);
                          }}
                        >
                          Manage Drive
                        </Button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                            setDrawerActiveTab('eligible');
                            setIsDrawerOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-[#F4F4F7] hover:bg-[#EBEBEF] text-[#0B0B0F] transition-colors"
                          title="View Eligible Candidates"
                        >
                          Pool ({stats.eligibleCount})
                        </button>
                      </div>
                    </div>
                  )}
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
                    <th className="py-3.5 px-6">Your Eligibility</th>
                  ) : (
                    <th className="py-3.5 px-6">Candidate Pool / Apps</th>
                  )}
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {processedJobs.map((job) => {
                  const stats = driveStats[job.id] || { applicantsCount: 0, eligibleCount: 0 };
                  const isOpen = (job.status || 'OPEN') === 'OPEN';
                  const isExpired = isDeadlineExpired(job.deadline);
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
                          {job.company} · {job.location}
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
                        {job.package_min_lpa}–{job.package_max_lpa} LPA
                      </td>
                      <td className="py-4 px-6 font-semibold whitespace-nowrap">
                        CGPA ≥ {job.min_cgpa} · Max {job.max_backlogs ?? 0} Backlog
                      </td>

                      {isStudent ? (
                        <td className="py-4 px-6 whitespace-nowrap">
                          {hasApplied ? (
                            <span className="font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full text-xs">
                              ✓ Applied ({studentApp.status.replace(/_/g, ' ')})
                            </span>
                          ) : job.isEligible ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                              {job.matchPercent}% Match · Eligible
                            </span>
                          ) : (
                            <span className="font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-xs">
                              Ineligible ({job.failedRules?.length || 1} Gaps)
                            </span>
                          )}
                        </td>
                      ) : (
                        <td className="py-4 px-6 whitespace-nowrap text-xs">
                          <span className="font-bold text-[#0B0B0F]">{stats.applicantsCount} applied</span>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="font-semibold text-emerald-700">{stats.eligibleCount} eligible</span>
                        </td>
                      )}

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isStudent ? (
                          hasApplied ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                                setDrawerActiveTab('details');
                                setIsDrawerOpen(true);
                              }}
                            >
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
                              Apply Now
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm" disabled>
                              Locked
                            </Button>
                          )
                        ) : (
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleJobStatus(job)}
                              className="text-[11px] font-bold text-slate-600 hover:text-black underline mr-1"
                            >
                              {isOpen ? 'Close' : 'Reopen'}
                            </button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditModal(job)}
                            >
                              Manage
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

      {/* ============================================================ */}
      {/* 5. JOB DRAWER MODAL (ROLE-SPECIFIC DETAILS & WORKFLOWS)       */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isDrawer={true}
        title={selectedJob ? selectedJob.title : 'Hiring Drive'}
        subtitle={
          selectedJob
            ? `${selectedJob.company} · ${selectedJob.tier || 'Dream'} · ${
                selectedJob.package_min_lpa || selectedJob.package_lpa
              }–${selectedJob.package_max_lpa || selectedJob.package_lpa} LPA`
            : ''
        }
      >
        {selectedJob && (
          <div className="space-y-6">
            {/* Drawer Tabs Bar */}
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
                Drive Specifications
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
                  Your Eligibility Checklist
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setDrawerActiveTab('eligible')}
                    className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                      drawerActiveTab === 'eligible'
                        ? 'bg-white text-[#0B0B0F] shadow-xs'
                        : 'text-[#64748B]'
                    }`}
                  >
                    Eligible Cohort ({driveStats[selectedJob.id]?.eligibleCount || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerActiveTab('applications')}
                    className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                      drawerActiveTab === 'applications'
                        ? 'bg-white text-[#0B0B0F] shadow-xs'
                        : 'text-[#64748B]'
                    }`}
                  >
                    Applicants ({driveStats[selectedJob.id]?.applicantsCount || 0})
                  </button>
                </>
              )}
            </div>

            {/* TAB 1: Drive Specifications & Description */}
            {drawerActiveTab === 'details' && (
              <div className="space-y-5">
                {/* Role Description */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100">
                  <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider block mb-1">
                    Role Description & Scope
                  </span>
                  <p className="text-xs text-[#0B0B0F] leading-relaxed">
                    {selectedJob.description ||
                      'Comprehensive campus placement drive configured with automated eligibility verification and multi-stage evaluation.'}
                  </p>
                </div>

                {/* Key Parameters */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">CTC Package</span>
                    <span className="font-display font-extrabold text-[#0B0B0F] text-sm">
                      {selectedJob.package_min_lpa}–{selectedJob.package_max_lpa} LPA
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Drive Status</span>
                    <span className="font-bold text-[#0B0B0F] text-sm">
                      {selectedJob.status || 'OPEN'}
                    </span>
                  </div>
                </div>

                {/* Academic Cutoff Parameters */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-black/5 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Institutional Eligibility Rules Configured
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Minimum CGPA Required:</span>
                    <span className="font-bold text-[#0B0B0F]">{selectedJob.min_cgpa}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Maximum Active Backlogs:</span>
                    <span className="font-bold text-[#0B0B0F]">{selectedJob.max_backlogs ?? 0}</span>
                  </div>
                </div>

                {/* Allowed Branches */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider block">
                    Allowed Branches
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedJob.allowed_branches || selectedJob.eligibleDepartments || []).map((d) => (
                      <span
                        key={d}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Required Skills */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider block">
                    Required Skills & Proficiency Benchmarks
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedJob.required_skills || []).map((sk) => (
                      <span
                        key={sk.name}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {sk.name} · <strong className="text-violet-700">{sk.level}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule & Deadlines */}
                <div className="pt-4 border-t border-black/5 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Drive Date:</span>
                    <span className="font-bold text-[#0B0B0F]">
                      {selectedJob.drive_date || '2026-11-20'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Application Deadline:</span>
                    <span className="font-bold text-[#0B0B0F]">
                      {selectedJob.deadline}
                      {isDeadlineExpired(selectedJob.deadline) && (
                        <span className="text-rose-600 ml-1 font-bold">(Closed)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* If Student and applied, show live application progress */}
                {activeRole === 'STUDENT' && studentApplicationsMap[selectedJob.id] && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-900">
                        ✓ Your Application is Active
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 uppercase">
                        {studentApplicationsMap[selectedJob.id].status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Applied on: {studentApplicationsMap[selectedJob.id].applied_date} · Current Round:{' '}
                      <strong>{studentApplicationsMap[selectedJob.id].current_round || 'Assessment'}</strong>
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/dashboard/my-applications')}
                      className="w-full mt-1"
                    >
                      Track Full Application Timeline →
                    </Button>
                  </div>
                )}

                {/* Drawer Footer Actions */}
                <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-2.5">
                  {activeRole === 'STUDENT' ? (
                    !studentApplicationsMap[selectedJob.id] && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={
                          !checkEligibility(currentStudent, selectedJob).eligible ||
                          (selectedJob.status || 'OPEN') !== 'OPEN' ||
                          isDeadlineExpired(selectedJob.deadline)
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
                        variant="primary"
                        size="sm"
                        onClick={() => openEditModal(selectedJob)}
                      >
                        Edit Recruitment Drive
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ELIGIBLE COHORT / STUDENT EVALUATION */}
            {drawerActiveTab === 'eligible' && (
              <div className="space-y-4">
                {activeRole === 'STUDENT' ? (
                  /* STUDENT VIEW: Student's Own Rule-By-Rule Breakdown */
                  <div className="space-y-3">
                    <p className="text-xs text-[#64748B]">
                      Your profile benchmarked against {selectedJob.company} requirements.
                    </p>
                    <div className="space-y-2">
                      {checkEligibility(currentStudent, selectedJob).map((rule, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                            rule.passed
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50/80 border-rose-200 text-rose-900 font-semibold'
                          }`}
                        >
                          <div>
                            <p className="font-bold">{rule.rule} Criterion</p>
                            <p className="text-[11px] opacity-90 mt-0.5">{rule.label}</p>
                          </div>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              rule.passed
                                ? 'bg-emerald-200/80 text-emerald-900'
                                : 'bg-rose-200/80 text-rose-900'
                            }`}
                          >
                            {rule.passed ? 'PASSED' : 'GAP FOUND'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* STAFF & ADMIN VIEW: Full Registered Student Cohort with Eligibility & Gap analysis */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-[#64748B]">
                        Batch Eligibility Analysis for {selectedJob.company}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDrawerCohortFilter('ALL')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            drawerCohortFilter === 'ALL'
                              ? 'bg-[#0B0B0F] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          All ({students.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setDrawerCohortFilter('ELIGIBLE')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            drawerCohortFilter === 'ELIGIBLE'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          Eligible
                        </button>
                        <button
                          type="button"
                          onClick={() => setDrawerCohortFilter('INELIGIBLE')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            drawerCohortFilter === 'INELIGIBLE'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          Ineligible
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-black/5 max-h-[460px] overflow-y-auto pr-1">
                      {students
                        .filter((std) => {
                          const res = checkEligibility(std, selectedJob);
                          if (drawerCohortFilter === 'ELIGIBLE') return res.eligible;
                          if (drawerCohortFilter === 'INELIGIBLE') return !res.eligible;
                          return true;
                        })
                        .map((std) => {
                          const res = checkEligibility(std, selectedJob);
                          return (
                            <div
                              key={std.id}
                              className="py-3 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar src={std.photo_url || std.avatar} name={std.name} size="xs" />
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-[#0B0B0F] truncate">{std.name}</p>
                                  <p className="text-[10px] text-[#64748B] truncate">
                                    {std.roll_number} · {std.department} · CGPA {std.cgpa}
                                  </p>
                                </div>
                              </div>

                              <div className="flex-shrink-0">
                                {res.eligible ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Eligible ({res.matchPercent}%)
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full max-w-[140px] truncate"
                                    title={res.failedRules.map((f) => f.label).join(', ')}
                                  >
                                    <XCircle className="w-3 h-3 flex-shrink-0" />
                                    {res.failedRules[0]?.rule || 'Ineligible'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: APPLICATIONS RECEIVED (STAFF & ADMIN ONLY) */}
            {drawerActiveTab === 'applications' && activeRole !== 'STUDENT' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <p className="text-[#64748B]">
                    Students who applied for {selectedJob.title}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => navigate('/dashboard/applications')}
                  >
                    Open Console
                  </Button>
                </div>

                <div className="divide-y divide-black/5 max-h-[460px] overflow-y-auto pr-1">
                  {applications
                    .filter((a) => (a.job_id || a.jobId) === selectedJob.id)
                    .map((app) => {
                      const sid = app.student_id || app.studentId;
                      const studentObj =
                        students.find((s) => s.id === sid) || app.student || {};

                      return (
                        <div
                          key={app.id}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              src={studentObj.photo_url || studentObj.avatar}
                              name={studentObj.name}
                              size="xs"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#0B0B0F] truncate">
                                {studentObj.name}
                              </p>
                              <p className="text-[10px] text-[#64748B] truncate">
                                {studentObj.roll_number} · {studentObj.department} · Applied: {app.applied_date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 uppercase">
                              {app.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {applications.filter((a) => (a.job_id || a.jobId) === selectedJob.id).length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No student applications received yet for this recruitment drive.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* 6. CREATE / EDIT DRIVE MODAL (STAFF & ADMIN ONLY)            */}
      {/* ============================================================ */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingJobId(null);
        }}
        title={
          editingJobId
            ? 'Edit Campus Recruitment Drive'
            : 'Launch New Campus Hiring Drive'
        }
        subtitle="Configure CTC parameters, cutoff thresholds, allowed departments, and skill benchmarks"
      >
        <form onSubmit={handleSaveDriveForm} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              variant="pill"
              label="Job Role / Title"
              placeholder="e.g. Senior Frontend Engineer"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="Company Name"
              placeholder="e.g. TechNova Solutions"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              required
            />
          </div>

          {/* CTC Min & Max (LPA) */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              variant="pill"
              label="CTC Min (LPA)"
              type="number"
              step="0.5"
              value={newPackageMin}
              onChange={(e) => setNewPackageMin(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="CTC Max (LPA)"
              type="number"
              step="0.5"
              value={newPackageMax}
              onChange={(e) => setNewPackageMax(e.target.value)}
              required
            />
          </div>

          {/* Drive Date & Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              variant="pill"
              label="Drive Date"
              type="date"
              value={newDriveDate}
              onChange={(e) => setNewDriveDate(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="Application Deadline"
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              required
            />
          </div>

          {/* Location, Min CGPA, Max Active Backlogs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              variant="pill"
              label="Location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="Min CGPA"
              type="number"
              step="0.1"
              value={newMinCgpa}
              onChange={(e) => setNewMinCgpa(e.target.value)}
              required
            />
            <Input
              variant="pill"
              label="Max Active Backlogs"
              type="number"
              min="0"
              value={newMaxBacklogs}
              onChange={(e) => setNewMaxBacklogs(e.target.value)}
              required
            />
          </div>

          {/* Tier & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Drive Tier
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-black/10 text-[#0B0B0F] outline-none"
              >
                <option value="Core">Core (&lt;12 LPA)</option>
                <option value="Dream">Dream (12–18 LPA)</option>
                <option value="Super Dream">Super Dream (&gt;18 LPA)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Drive Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-black/10 text-[#0B0B0F] outline-none"
              >
                <option value="OPEN">Open (Accepting Applications)</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Role Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              placeholder="Outline engineering scope, responsibilities, and interview process..."
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-white border border-black/10 text-[#0B0B0F] outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Allowed Branches (Multi-select) */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Allowed Branches (Multi-select)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_BRANCHES.map((branch) => {
                const selected = newAllowedBranches.includes(branch);
                return (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => handleToggleBranch(branch)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-[#0B0B0F] text-white border-[#0B0B0F]'
                        : 'bg-white text-[#64748B] border-black/10 hover:border-black/25'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {branch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Required Skills with Levels */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#475569]">
              Required Skills & Minimum Proficiency Levels
            </label>
            <div className="flex flex-wrap gap-1.5">
              {newRequiredSkills.map((sk) => (
                <span
                  key={sk.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-900"
                >
                  <span>
                    {sk.name} · <strong>{sk.level}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillRule(sk.name)}
                    className="text-violet-500 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Skill name (e.g. Python, Go)..."
                value={skillInputName}
                onChange={(e) => setSkillInputName(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-full text-xs bg-white border border-black/10 outline-none"
              />
              <select
                value={skillInputLevel}
                onChange={(e) => setSkillInputLevel(e.target.value)}
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
              {editingJobId ? 'Save Drive Changes' : 'Publish Drive'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
