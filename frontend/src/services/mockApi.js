/**
 * PlaceTrack Mock API Service
 * Authoritative frontend-only dataset with snake_case field names, deterministic demo accounts
 * for ADMIN, STAFF, and STUDENT, role-scoped notifications, and localStorage state persistence.
 */

import { checkEligibility } from './eligibility.js';

const STORAGE_DATA_KEY = 'placetrack_demo_data_v5';

export const DEMO_STAFF_ACCOUNTS = {
  ADMIN: {
    id: 'admin-ishan',
    roll_number: 'CDC-DIR-001',
    name: 'Ishan Wankhede',
    email: 'ishan.cdc@placetrack.edu',
    phone: '+91 98200 11001',
    role: 'ADMIN',
    designation: 'Dean of Corporate Relations',
    title: 'Dean of Corporate Relations',
    department: 'Career Advancement Cell',
    permissions: [
      'manage_drives',
      'manage_companies',
      'verify_students',
      'manage_applications',
      'manage_placements',
      'view_analytics',
      'export_nirf',
    ],
    photo_url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  STAFF: {
    id: 'staff-raghav',
    roll_number: 'CDC-TPO-014',
    name: 'Raghav Menon',
    email: 'raghav.tpo@placetrack.edu',
    phone: '+91 98200 22014',
    role: 'STAFF',
    designation: 'Senior Placement Coordinator (TPO)',
    title: 'Senior Placement Coordinator (TPO)',
    department: 'Training & Placement Office (TPO)',
    permissions: [
      'manage_drives',
      'manage_companies',
      'verify_students',
      'manage_applications',
      'manage_placements',
    ],
    photo_url:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
};

export const initialStudents = [
  {
    id: 'std-101',
    roll_number: '21CS042',
    name: 'Palak Waje',
    email: 'palak.waje@example.edu',
    phone: '+91 98765 43210',
    role: 'STUDENT',
    cgpa: 8.7,
    cgpa_verified: true,
    active_backlogs: 0,
    department: 'Computer Science',
    resume_url: 'https://placetrack.edu/resumes/21CS042_Palak_Waje_Resume.pdf',
    photo_url:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skill_proficiencies: [
      { name: 'React', level: 'Expert' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'Node.js', level: 'Advanced' },
      { name: 'Next.js', level: 'Advanced' },
      { name: 'Jest', level: 'Intermediate' },
      { name: 'Python', level: 'Intermediate' },
      { name: 'AWS', level: 'Intermediate' },
      { name: 'Go', level: 'Advanced' },
      { name: 'Kubernetes', level: 'Intermediate' },
      { name: 'Docker', level: 'Advanced' },
      { name: 'Linux', level: 'Advanced' },
    ],
    skills: [
      'React',
      'TypeScript',
      'Node.js',
      'Next.js',
      'Jest',
      'Python',
      'AWS',
      'Go',
      'Kubernetes',
      'Docker',
      'Linux',
    ],
    placement_status: 'Placed',
    placed: true,
    placed_company: 'CloudNest Systems',
    placed_package: 15.0,
    placedCompany: 'CloudNest Systems',
    placedPackage: 15.0,
  },
  {
    id: 'std-102',
    roll_number: '21CS089',
    name: 'Priya Patel',
    email: 'priya.patel@example.edu',
    phone: '+91 98201 11223',
    role: 'STUDENT',
    cgpa: 9.3,
    cgpa_verified: true,
    active_backlogs: 0,
    department: 'Computer Science',
    resume_url: 'https://placetrack.edu/resumes/21CS089_Priya_Patel.pdf',
    photo_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    skill_proficiencies: [
      { name: 'Python', level: 'Expert' },
      { name: 'PyTorch', level: 'Advanced' },
      { name: 'SQL', level: 'Advanced' },
      { name: 'FastAPI', level: 'Advanced' },
      { name: 'Docker', level: 'Intermediate' },
    ],
    skills: ['Python', 'PyTorch', 'SQL', 'FastAPI', 'Docker'],
    placement_status: 'Placed',
    placed: true,
    placed_company: 'DataWave Analytics',
    placed_package: 22.0,
    placedCompany: 'DataWave Analytics',
    placedPackage: 22.0,
  },
  {
    id: 'student-rohit',
    roll_number: '21EC015',
    name: 'Rohit Verma',
    email: 'rohit.verma@example.edu',
    phone: '+91 98112 33445',
    role: 'STUDENT',
    designation: 'B.Tech Final Year Candidate · 21EC015',
    title: 'B.Tech Final Year Candidate',
    cgpa: 8.2,
    cgpa_verified: true,
    active_backlogs: 0,
    department: 'Electronics & Comm.',
    resume_url: 'https://placetrack.edu/resumes/21EC015_Rohit_Verma.pdf',
    photo_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skill_proficiencies: [
      { name: 'C++', level: 'Advanced' },
      { name: 'Embedded C', level: 'Advanced' },
      { name: 'RTOS', level: 'Intermediate' },
      { name: 'Python', level: 'Advanced' },
      { name: 'PyTorch', level: 'Intermediate' },
      { name: 'Go', level: 'Intermediate' },
      { name: 'Kubernetes', level: 'Intermediate' },
      { name: 'Docker', level: 'Advanced' },
      { name: 'AWS', level: 'Intermediate' },
      { name: 'Git', level: 'Intermediate' },
      { name: 'Verilog', level: 'Intermediate' },
    ],
    skills: [
      'C++',
      'Embedded C',
      'RTOS',
      'Python',
      'PyTorch',
      'Go',
      'Kubernetes',
      'Docker',
      'AWS',
      'Git',
      'Verilog',
    ],
    placement_status: 'Placed',
    placed: true,
    placed_company: 'CloudNest Systems',
    placed_package: 15.0,
    placedCompany: 'CloudNest Systems',
    placedPackage: 15.0,
  },
  {
    id: 'std-104',
    roll_number: '21IT054',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.edu',
    phone: '+91 97654 22110',
    role: 'STUDENT',
    cgpa: 8.9,
    cgpa_verified: true,
    active_backlogs: 0,
    department: 'Information Tech.',
    resume_url: 'https://placetrack.edu/resumes/21IT054_Ananya_Iyer.pdf',
    photo_url:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    skill_proficiencies: [
      { name: 'Go', level: 'Expert' },
      { name: 'Kubernetes', level: 'Advanced' },
      { name: 'Docker', level: 'Advanced' },
      { name: 'PostgreSQL', level: 'Advanced' },
      { name: 'Linux', level: 'Advanced' },
    ],
    skills: ['Go', 'Kubernetes', 'Docker', 'PostgreSQL', 'Linux'],
    placement_status: 'Placed',
    placed: true,
    placed_company: 'TechNova Solutions',
    placed_package: 17.5,
    placedCompany: 'TechNova Solutions',
    placedPackage: 17.5,
  },
  {
    id: 'std-105',
    roll_number: '21ME031',
    name: 'Vikram Rao',
    email: 'vikram.rao@example.edu',
    phone: '+91 99001 55667',
    role: 'STUDENT',
    cgpa: 7.9,
    cgpa_verified: false,
    active_backlogs: 1,
    department: 'Mechanical Eng.',
    resume_url: 'https://placetrack.edu/resumes/21ME031_Vikram_Rao.pdf',
    photo_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skill_proficiencies: [
      { name: 'SolidWorks', level: 'Advanced' },
      { name: 'MATLAB', level: 'Advanced' },
      { name: 'Ansys', level: 'Intermediate' },
      { name: 'Python', level: 'Beginner' },
      { name: 'AutoCAD', level: 'Advanced' },
    ],
    skills: ['SolidWorks', 'MATLAB', 'Ansys', 'Python', 'AutoCAD'],
    placement_status: 'In Interview',
    placed: false,
    placed_company: null,
    placed_package: null,
    placedCompany: null,
    placedPackage: null,
  },
  {
    id: 'std-106',
    roll_number: '21CS112',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@example.edu',
    phone: '+91 98450 77889',
    role: 'STUDENT',
    cgpa: 9.1,
    cgpa_verified: true,
    active_backlogs: 0,
    department: 'Computer Science',
    resume_url: 'https://placetrack.edu/resumes/21CS112_Sneha_Kulkarni.pdf',
    photo_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    skill_proficiencies: [
      { name: 'Java', level: 'Expert' },
      { name: 'Spring Boot', level: 'Advanced' },
      { name: 'Kafka', level: 'Advanced' },
      { name: 'MySQL', level: 'Advanced' },
      { name: 'React', level: 'Intermediate' },
    ],
    skills: ['Java', 'Spring Boot', 'Kafka', 'MySQL', 'React'],
    placement_status: 'Placed',
    placed: true,
    placed_company: 'CloudNest Systems',
    placed_package: 15.0,
    placedCompany: 'CloudNest Systems',
    placedPackage: 15.0,
  },
  {
    id: 'std-107',
    roll_number: '21EC077',
    name: 'Devansh Gupta',
    email: 'devansh.gupta@example.edu',
    phone: '+91 98332 44556',
    role: 'STUDENT',
    cgpa: 8.4,
    cgpa_verified: true,
    active_backlogs: 0,
    department: 'Electronics & Comm.',
    resume_url: 'https://placetrack.edu/resumes/21EC077_Devansh_Gupta.pdf',
    photo_url:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    skill_proficiencies: [
      { name: 'ARM Cortex', level: 'Advanced' },
      { name: 'Rust', level: 'Intermediate' },
      { name: 'PCB Design', level: 'Advanced' },
      { name: 'I2C/SPI', level: 'Advanced' },
      { name: 'Git', level: 'Intermediate' },
    ],
    skills: ['ARM Cortex', 'Rust', 'PCB Design', 'I2C/SPI', 'Git'],
    placement_status: 'Placed',
    placed: true,
    placed_company: 'Embedded Edge Labs',
    placed_package: 12.0,
    placedCompany: 'Embedded Edge Labs',
    placedPackage: 12.0,
  },
  {
    id: 'std-108',
    roll_number: '21IT023',
    name: 'Meera Nair',
    email: 'meera.nair@example.edu',
    phone: '+91 98860 99001',
    role: 'STUDENT',
    cgpa: 8.6,
    cgpa_verified: false,
    active_backlogs: 0,
    department: 'Information Tech.',
    resume_url: 'https://placetrack.edu/resumes/21IT023_Meera_Nair.pdf',
    photo_url:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skill_proficiencies: [
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'Next.js', level: 'Advanced' },
      { name: 'GraphQL', level: 'Intermediate' },
      { name: 'TailwindCSS', level: 'Expert' },
      { name: 'Jest', level: 'Intermediate' },
    ],
    skills: ['TypeScript', 'Next.js', 'GraphQL', 'TailwindCSS', 'Jest'],
    placement_status: 'Unplaced',
    placed: false,
    placed_company: null,
    placed_package: null,
    placedCompany: null,
    placedPackage: null,
  },
];

export const initialJobs = [
  {
    id: 'job-1',
    title: 'Senior Software Engineer (Frontend)',
    company: 'TechNova Solutions',
    package_lpa: 18.5,
    package_min_lpa: 16.0,
    package_max_lpa: 18.5,
    min_cgpa: 8.0,
    max_backlogs: 0,
    tier: 'Super Dream',
    job_type: 'Full-time',
    location: 'Bangalore, India (Hybrid)',
    drive_date: '2026-11-18',
    deadline: '2026-11-15',
    status: 'OPEN',
    recruitment_process: {
      has_assessment: true,
      assessment_name: 'HackerRank Frontend Systems Assessment',
      interview_rounds: ['Technical 1', 'Technical 2', 'HR'],
    },
    required_skills: [
      { name: 'React', level: 'Advanced' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'Node.js', level: 'Intermediate' },
      { name: 'Next.js', level: 'Intermediate' },
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
    allowed_branches: ['Computer Science', 'Information Tech.'],
    eligibleDepartments: ['Computer Science', 'Information Tech.'],
    description:
      'Build enterprise-grade real-time web applications with micro-frontend architectures and low-latency state synchronization.',
    openings: 8,
    applied_count: 64,
    appliedCount: 64,
  },
  {
    id: 'job-2',
    title: 'Machine Learning Research Engineer',
    company: 'DataWave Analytics',
    package_lpa: 22.0,
    package_min_lpa: 18.0,
    package_max_lpa: 22.0,
    min_cgpa: 8.0,
    max_backlogs: 0,
    tier: 'Super Dream',
    job_type: 'Full-time',
    location: 'Hyderabad, India (On-site)',
    drive_date: '2026-11-24',
    deadline: '2026-11-20',
    status: 'OPEN',
    recruitment_process: {
      has_assessment: false,
      assessment_name: null,
      interview_rounds: ['Technical 1', 'HR'],
    },
    required_skills: [
      { name: 'Python', level: 'Advanced' },
      { name: 'PyTorch', level: 'Intermediate' },
      { name: 'Docker', level: 'Intermediate' },
    ],
    skills: ['Python', 'PyTorch', 'Docker'],
    allowed_branches: [
      'Computer Science',
      'Information Tech.',
      'Electronics & Comm.',
    ],
    eligibleDepartments: [
      'Computer Science',
      'Information Tech.',
      'Electronics & Comm.',
    ],
    description:
      'Train high-throughput vision and tabular neural networks for automated financial and predictive intelligence. Direct portfolio shortlist (no online test).',
    openings: 4,
    applied_count: 42,
    appliedCount: 42,
  },
  {
    id: 'job-3',
    title: 'Cloud Infrastructure & SRE Specialist',
    company: 'CloudNest Systems',
    package_lpa: 15.0,
    package_min_lpa: 13.5,
    package_max_lpa: 15.0,
    min_cgpa: 7.5,
    max_backlogs: 0,
    tier: 'Dream',
    job_type: 'Full-time',
    location: 'Pune, India (Remote)',
    drive_date: '2026-11-12',
    deadline: '2026-11-10',
    status: 'OPEN',
    recruitment_process: {
      has_assessment: true,
      assessment_name: 'Cloud & Linux Diagnostics Test',
      interview_rounds: ['Technical 1', 'Technical 2', 'HR'],
    },
    required_skills: [
      { name: 'Go', level: 'Intermediate' },
      { name: 'Kubernetes', level: 'Intermediate' },
      { name: 'Docker', level: 'Intermediate' },
      { name: 'AWS', level: 'Intermediate' },
    ],
    skills: ['Go', 'Kubernetes', 'Docker', 'AWS'],
    allowed_branches: [
      'Computer Science',
      'Information Tech.',
      'Electronics & Comm.',
    ],
    eligibleDepartments: [
      'Computer Science',
      'Information Tech.',
      'Electronics & Comm.',
    ],
    description:
      'Design self-healing multi-region Kubernetes clusters with zero-trust network policies and distributed observability.',
    openings: 6,
    applied_count: 51,
    appliedCount: 51,
  },
  {
    id: 'job-4',
    title: 'Robotics Control Systems Engineer',
    company: 'Mechano Dynamics',
    package_lpa: 13.5,
    package_min_lpa: 11.5,
    package_max_lpa: 13.5,
    min_cgpa: 7.5,
    max_backlogs: 1,
    tier: 'Dream',
    job_type: 'Full-time',
    location: 'Chennai, India (On-site)',
    drive_date: '2026-11-28',
    deadline: '2026-11-25',
    status: 'OPEN',
    recruitment_process: {
      has_assessment: true,
      assessment_name: 'Control Systems & Embedded Coding Test',
      interview_rounds: ['Technical 1', 'HR'],
    },
    required_skills: [
      { name: 'C++', level: 'Intermediate' },
      { name: 'Embedded C', level: 'Intermediate' },
      { name: 'Python', level: 'Intermediate' },
    ],
    skills: ['C++', 'Embedded C', 'Python'],
    allowed_branches: ['Mechanical Eng.', 'Electronics & Comm.'],
    eligibleDepartments: ['Mechanical Eng.', 'Electronics & Comm.'],
    description:
      'Develop trajectory optimization algorithms and kinematic actuators for autonomous warehouse AGVs.',
    openings: 5,
    applied_count: 29,
    appliedCount: 29,
  },
  {
    id: 'job-5',
    title: 'IoT Firmware Architect',
    company: 'Embedded Edge Labs',
    package_lpa: 10.5,
    package_min_lpa: 9.0,
    package_max_lpa: 10.5,
    min_cgpa: 7.5,
    max_backlogs: 1,
    tier: 'Core',
    job_type: 'Full-time',
    location: 'Bangalore, India (On-site)',
    drive_date: '2026-11-08',
    deadline: '2026-11-05',
    status: 'OPEN',
    recruitment_process: {
      has_assessment: true,
      assessment_name: 'Embedded C & RTOS Diagnostics Assessment',
      interview_rounds: ['Technical 1', 'Technical 2', 'HR'],
    },
    required_skills: [
      { name: 'C++', level: 'Intermediate' },
      { name: 'Embedded C', level: 'Intermediate' },
      { name: 'RTOS', level: 'Beginner' },
    ],
    skills: ['C++', 'Embedded C', 'RTOS'],
    allowed_branches: ['Electronics & Comm.', 'Computer Science'],
    eligibleDepartments: ['Electronics & Comm.', 'Computer Science'],
    description:
      'Architect ultra-low-power edge sensory nodes communicating over BLE Mesh and Thread protocols.',
    openings: 7,
    applied_count: 38,
    appliedCount: 38,
  },
  {
    id: 'job-6',
    title: 'Distributed Systems Backend Engineer',
    company: 'TechNova Solutions',
    package_lpa: 17.5,
    package_min_lpa: 15.0,
    package_max_lpa: 17.5,
    min_cgpa: 8.2,
    max_backlogs: 0,
    tier: 'Super Dream',
    job_type: 'Full-time',
    location: 'Bangalore, India (On-site)',
    drive_date: '2026-11-02',
    deadline: '2026-10-30',
    status: 'CLOSED',
    recruitment_process: {
      has_assessment: true,
      assessment_name: 'High-Throughput Concurrency Assessment',
      interview_rounds: ['Technical 1', 'Technical 2', 'HR'],
    },
    required_skills: [
      { name: 'Java', level: 'Advanced' },
      { name: 'Spring Boot', level: 'Intermediate' },
      { name: 'Kafka', level: 'Intermediate' },
    ],
    skills: ['Java', 'Spring Boot', 'Kafka'],
    allowed_branches: ['Computer Science', 'Information Tech.'],
    eligibleDepartments: ['Computer Science', 'Information Tech.'],
    description:
      'Build fault-tolerant payment routing and idempotency services handling 25,000 requests per second.',
    openings: 5,
    applied_count: 88,
    appliedCount: 88,
  },
];

const buildStandardRounds = (
  activeStageIndex = 2,
  companyName = 'TechNova Solutions'
) => [
  {
    round_number: 1,
    round_name: 'Online Test',
    round_type: 'ONLINE_TEST',
    date: '2026-10-12',
    reporting_time: '10:00 AM',
    venue: 'Central Computing Lab 204',
    meeting_link: 'https://example.com/placetrack-demo-interview/online-assessment',
    panelists: ['Automated Proctoring', 'Dr. R. Subramanian'],
    result:
      activeStageIndex > 0
        ? 'PASSED'
        : activeStageIndex === 0
        ? 'PENDING'
        : 'PENDING',
  },
  {
    round_number: 2,
    round_name: 'Technical 1',
    round_type: 'TECHNICAL',
    date: '2026-10-16',
    reporting_time: '11:30 AM',
    venue: 'CDC Interview Suite A',
    meeting_link: 'https://example.com/placetrack-demo-interview/ptk-tech-one',
    panelists: ['David Chen (VP Eng)', 'Siddharth Roy (Staff SWE)'],
    result:
      activeStageIndex > 1
        ? 'PASSED'
        : activeStageIndex === 1
        ? 'PENDING'
        : 'PENDING',
  },
  {
    round_number: 3,
    round_name: 'Technical 2',
    round_type: 'TECHNICAL',
    date: '2026-10-26',
    reporting_time: '02:00 PM',
    venue: 'Virtual Room PT-82',
    meeting_link: 'https://example.com/placetrack-demo-interview/ptk-sys-arch',
    panelists: ['Anjali Menon (Principal Architect)', 'Karan Malhotra'],
    result:
      activeStageIndex > 2
        ? 'PASSED'
        : activeStageIndex === 2
        ? 'PENDING'
        : 'PENDING',
  },
  {
    round_number: 4,
    round_name: 'HR',
    round_type: 'HR',
    date: '2026-10-29',
    reporting_time: '04:00 PM',
    venue: 'CDC Executive Boardroom',
    meeting_link: 'https://example.com/placetrack-demo-interview/ptk-hr-sync',
    panelists: [
      'Maya Alston (Head of People)',
      'Neha Kapoor (University Relations)',
    ],
    result:
      activeStageIndex > 3
        ? 'PASSED'
        : activeStageIndex === 3
        ? 'PENDING'
        : 'PENDING',
  },
  {
    round_number: 5,
    round_name: 'Offer',
    round_type: 'HR',
    date: '2026-11-01',
    reporting_time: '05:00 PM',
    venue: `${companyName} Offer Portal`,
    meeting_link: 'https://placetrack.edu/dashboard/my-placement',
    panelists: ['CDC Dean Ishan Wankhede', 'Corporate Compensation Committee'],
    result: activeStageIndex >= 4 ? 'PASSED' : 'PENDING',
  },
];

export const initialApplications = [
  {
    id: 'app-901',
    student_id: 'std-101',
    studentId: 'std-101',
    student: {
      id: 'std-101',
      roll_number: '21CS042',
      name: 'Palak Waje',
      email: 'palak.waje@example.edu',
      cgpa: 8.7,
      department: 'Computer Science',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    job_id: 'job-3',
    jobId: 'job-3',
    job: {
      id: 'job-3',
      title: 'Cloud Infrastructure & SRE Specialist',
      package_lpa: 15.0,
      location: 'Pune, India (Remote)',
    },
    company: 'CloudNest Systems',
    status: 'OFFER_ACCEPTED',
    current_round: 'Offer',
    currentRound: 'Offer',
    applied_date: '2026-10-02',
    appliedDate: '2026-10-02',
    last_update: '2026-10-18 16:40 IST',
    lastUpdate: '2026-10-18 16:40 IST',
    feedback: 'Exceptional command of container orchestration and Linux internals.',
    rounds: buildStandardRounds(4, 'CloudNest Systems'),
    status_history: [
      {
        id: 'hist-901-1',
        status: 'APPLIED',
        stage_label: 'Application Submitted',
        timestamp: '2026-10-02 10:15 IST',
        actor: 'Palak Waje (21CS042)',
        explanation: 'Submitted verified academic transcript and resume for CloudNest Systems drive.',
      },
      {
        id: 'hist-901-2',
        status: 'SHORTLISTED',
        stage_label: 'Shortlisted for Assessment',
        timestamp: '2026-10-04 14:20 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Verified CGPA 8.7 >= 7.5 and 0 backlogs. Cleared for Cloud & Linux Assessment.',
      },
      {
        id: 'hist-901-3',
        status: 'INTERVIEW',
        stage_label: 'Cleared Online Assessment & Technical Panels',
        timestamp: '2026-10-14 18:00 IST',
        actor: 'CloudNest Interview Panel',
        explanation: 'Passed Technical 1, Technical 2, and HR round with strong SRE fundamentals.',
      },
      {
        id: 'hist-901-4',
        status: 'OFFER_RELEASED',
        stage_label: 'Offer Released (15.0 LPA)',
        timestamp: '2026-10-18 11:00 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Official Dream Tier offer (15.0 LPA CTC) issued via PlaceTrack Offer Desk.',
      },
      {
        id: 'hist-901-5',
        status: 'OFFER_ACCEPTED',
        stage_label: 'Offer Accepted by Student',
        timestamp: '2026-10-18 16:40 IST',
        actor: 'Palak Waje (21CS042)',
        explanation: 'Student formally accepted the 15.0 LPA Dream Tier offer.',
      },
    ],
  },
  {
    id: 'app-902',
    student_id: 'std-101',
    studentId: 'std-101',
    student: {
      id: 'std-101',
      roll_number: '21CS042',
      name: 'Palak Waje',
      email: 'palak.waje@example.edu',
      cgpa: 8.7,
      department: 'Computer Science',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    job_id: 'job-1',
    jobId: 'job-1',
    job: {
      id: 'job-1',
      title: 'Senior Software Engineer (Frontend)',
      package_lpa: 18.5,
      location: 'Bangalore, India (Hybrid)',
    },
    company: 'TechNova Solutions',
    status: 'INTERVIEW',
    current_round: 'Technical 2',
    currentRound: 'Technical 2',
    applied_date: '2026-10-05',
    appliedDate: '2026-10-05',
    last_update: '2026-10-21 15:10 IST',
    lastUpdate: '2026-10-21 15:10 IST',
    feedback: 'Cleared Online Test and Technical 1 with full test case passes.',
    rounds: buildStandardRounds(2, 'TechNova Solutions'),
    status_history: [
      {
        id: 'hist-902-1',
        status: 'APPLIED',
        stage_label: 'Application Submitted',
        timestamp: '2026-10-05 09:30 IST',
        actor: 'Palak Waje (21CS042)',
        explanation: 'Applied for Super Dream upgrade opportunity at TechNova Solutions.',
      },
      {
        id: 'hist-902-2',
        status: 'SHORTLISTED',
        stage_label: 'Shortlisted for HackerRank Assessment',
        timestamp: '2026-10-07 11:45 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Met all Super Dream eligibility criteria (CGPA 8.7, React & TypeScript Advanced).',
      },
      {
        id: 'hist-902-3',
        status: 'INTERVIEW',
        stage_label: 'Advanced to Technical 2 Panel',
        timestamp: '2026-10-21 15:10 IST',
        actor: 'David Chen (VP Engineering)',
        explanation: 'Cleared Technical 1 round; Technical 2 system architecture interview scheduled for 2026-10-26.',
      },
    ],
  },
  {
    id: 'app-903',
    student_id: 'std-102',
    studentId: 'std-102',
    student: {
      id: 'std-102',
      roll_number: '21CS089',
      name: 'Priya Patel',
      email: 'priya.patel@example.edu',
      cgpa: 9.3,
      department: 'Computer Science',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    job_id: 'job-2',
    jobId: 'job-2',
    job: {
      id: 'job-2',
      title: 'Machine Learning Research Engineer',
      package_lpa: 22.0,
      location: 'Hyderabad, India (On-site)',
    },
    company: 'DataWave Analytics',
    status: 'OFFER_ACCEPTED',
    current_round: 'Offer',
    currentRound: 'Offer',
    applied_date: '2026-09-28',
    appliedDate: '2026-09-28',
    last_update: '2026-10-12 17:20 IST',
    lastUpdate: '2026-10-12 17:20 IST',
    feedback:
      'Top 1% ranking in model tuning challenge. Exemplary theoretical foundations.',
    rounds: buildStandardRounds(4, 'DataWave Analytics'),
    status_history: [
      {
        id: 'hist-903-1',
        status: 'APPLIED',
        stage_label: 'Application Submitted',
        timestamp: '2026-09-28 11:00 IST',
        actor: 'Priya Patel (21CS089)',
        explanation: 'Submitted ML research portfolio for DataWave Analytics.',
      },
      {
        id: 'hist-903-2',
        status: 'SHORTLISTED',
        stage_label: 'Direct Portfolio Shortlist',
        timestamp: '2026-10-01 13:15 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Shortlisted directly for ML Research Panel based on CGPA 9.3 and PyTorch publications.',
      },
      {
        id: 'hist-903-3',
        status: 'OFFER_ACCEPTED',
        stage_label: 'Offer Released & Accepted (22.0 LPA)',
        timestamp: '2026-10-12 17:20 IST',
        actor: 'Priya Patel (21CS089)',
        explanation: 'Cleared all research interviews and accepted 22.0 LPA Super Dream offer.',
      },
    ],
  },
  {
    id: 'app-904',
    student_id: 'student-rohit',
    studentId: 'student-rohit',
    student: {
      id: 'student-rohit',
      roll_number: '21EC015',
      name: 'Rohit Verma',
      email: 'rohit.verma@example.edu',
      cgpa: 8.2,
      department: 'Electronics & Comm.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    job_id: 'job-5',
    jobId: 'job-5',
    job: {
      id: 'job-5',
      title: 'IoT Firmware Architect',
      package_lpa: 10.5,
      location: 'Bangalore, India (On-site)',
    },
    company: 'Embedded Edge Labs',
    status: 'INTERVIEW',
    current_round: 'Technical 1',
    currentRound: 'Technical 1',
    applied_date: '2026-10-12',
    appliedDate: '2026-10-12',
    last_update: '2026-10-25 09:40 IST',
    lastUpdate: '2026-10-25 09:40 IST',
    feedback: 'Cleared Online Test (94th percentile in RTOS & C++); scheduled for Technical 1 hardware assessment.',
    rounds: buildStandardRounds(1, 'Embedded Edge Labs'),
    status_history: [
      {
        id: 'hist-904-1',
        status: 'APPLIED',
        stage_label: 'Application Submitted',
        timestamp: '2026-10-12 10:20 IST',
        actor: 'Rohit Verma (21EC015)',
        explanation: 'Applied for IoT Firmware Architect drive with verified 8.2 CGPA and Embedded C credentials.',
      },
      {
        id: 'hist-904-2',
        status: 'UNDER_REVIEW',
        stage_label: 'TPO Eligibility & Resume Review',
        timestamp: '2026-10-14 11:05 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Verified ECE department eligibility, 0 active backlogs, and RTOS project portfolio.',
      },
      {
        id: 'hist-904-3',
        status: 'SHORTLISTED',
        stage_label: 'Shortlisted for Online Assessment',
        timestamp: '2026-10-16 15:30 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Candidate shortlisted for Embedded C & RTOS Diagnostics Assessment.',
      },
      {
        id: 'hist-904-4',
        status: 'ASSESSMENT',
        stage_label: 'Online Assessment Completed (Passed)',
        timestamp: '2026-10-19 18:15 IST',
        actor: 'Embedded Edge Evaluation Engine',
        explanation: 'Scored 94/100 in low-level memory management and interrupt latency test.',
      },
      {
        id: 'hist-904-5',
        status: 'INTERVIEW',
        stage_label: 'Technical 1 Interview Scheduled',
        timestamp: '2026-10-25 09:40 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Scheduled in-person Technical 1 panel on 2026-10-28 at 10:00 AM IST in Hardware Bay B · Lab 102.',
      },
    ],
  },
  {
    id: 'app-905',
    student_id: 'student-rohit',
    studentId: 'student-rohit',
    student: {
      id: 'student-rohit',
      roll_number: '21EC015',
      name: 'Rohit Verma',
      email: 'rohit.verma@example.edu',
      cgpa: 8.2,
      department: 'Electronics & Comm.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    job_id: 'job-3',
    jobId: 'job-3',
    job: {
      id: 'job-3',
      title: 'Cloud Infrastructure & SRE Specialist',
      package_lpa: 15.0,
      location: 'Pune, India (Remote)',
    },
    company: 'CloudNest Systems',
    status: 'OFFER_ACCEPTED',
    current_round: 'Offer',
    currentRound: 'Offer',
    applied_date: '2026-10-04',
    appliedDate: '2026-10-04',
    last_update: '2026-10-20 18:30 IST',
    lastUpdate: '2026-10-20 18:30 IST',
    feedback: 'Strong distributed systems and Linux debugging skills demonstrated across all panels.',
    rounds: buildStandardRounds(4, 'CloudNest Systems'),
    status_history: [
      {
        id: 'hist-905-1',
        status: 'APPLIED',
        stage_label: 'Application Submitted',
        timestamp: '2026-10-04 09:15 IST',
        actor: 'Rohit Verma (21EC015)',
        explanation: 'Submitted application for Cloud Infrastructure & SRE Specialist (Dream Tier).',
      },
      {
        id: 'hist-905-2',
        status: 'SHORTLISTED',
        stage_label: 'Shortlisted for Cloud Assessment',
        timestamp: '2026-10-06 12:00 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Cleared initial screening with Go, Docker, Kubernetes, and AWS proficiencies.',
      },
      {
        id: 'hist-905-3',
        status: 'INTERVIEW',
        stage_label: 'Cleared All Technical & HR Rounds',
        timestamp: '2026-10-18 17:00 IST',
        actor: 'Maya Alston (COO, CloudNest)',
        explanation: 'Passed Technical 1, Technical 2, and Executive HR panel.',
      },
      {
        id: 'hist-905-4',
        status: 'OFFER_RELEASED',
        stage_label: 'Dream Tier Offer Released (15.0 LPA)',
        timestamp: '2026-10-20 11:00 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'CloudNest Systems released a 15.0 LPA Dream Tier offer (Base 12.0 + Bonus 2.0 + ESOP 1.0).',
      },
      {
        id: 'hist-905-5',
        status: 'OFFER_ACCEPTED',
        stage_label: 'Offer Accepted by Student',
        timestamp: '2026-10-20 18:30 IST',
        actor: 'Rohit Verma (21EC015)',
        explanation: 'Accepted Dream Tier offer from CloudNest Systems. Eligible only for Super Dream upgrades.',
      },
    ],
  },
  {
    id: 'app-906',
    student_id: 'student-rohit',
    studentId: 'student-rohit',
    student: {
      id: 'student-rohit',
      roll_number: '21EC015',
      name: 'Rohit Verma',
      email: 'rohit.verma@example.edu',
      cgpa: 8.2,
      department: 'Electronics & Comm.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    job_id: 'job-2',
    jobId: 'job-2',
    job: {
      id: 'job-2',
      title: 'Machine Learning Research Engineer',
      package_lpa: 22.0,
      location: 'Hyderabad, India (On-site)',
    },
    company: 'DataWave Analytics',
    status: 'OFFER_RELEASED',
    current_round: 'Offer',
    currentRound: 'Offer',
    applied_date: '2026-10-08',
    appliedDate: '2026-10-08',
    last_update: '2026-10-24 16:00 IST',
    lastUpdate: '2026-10-24 16:00 IST',
    feedback: 'Outstanding edge-AI inference optimization work; Super Dream offer released and awaiting your decision.',
    rounds: buildStandardRounds(4, 'DataWave Analytics'),
    status_history: [
      {
        id: 'hist-906-1',
        status: 'APPLIED',
        stage_label: 'Application Submitted',
        timestamp: '2026-10-08 14:10 IST',
        actor: 'Rohit Verma (21EC015)',
        explanation: 'Applied for Super Dream tier upgrade drive at DataWave Analytics.',
      },
      {
        id: 'hist-906-2',
        status: 'UNDER_REVIEW',
        stage_label: 'Research Portfolio Under Review',
        timestamp: '2026-10-10 10:00 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Forwarded Python & PyTorch signal-processing research profile to DataWave AI team.',
      },
      {
        id: 'hist-906-3',
        status: 'SHORTLISTED',
        stage_label: 'Direct Shortlist for ML Research Panel',
        timestamp: '2026-10-13 16:30 IST',
        actor: 'Rhea Sengupta (DataWave HR)',
        explanation: 'Drive has no separate online test; shortlisted directly for ML Research & HR panels.',
      },
      {
        id: 'hist-906-4',
        status: 'SELECTED',
        stage_label: 'Final Selection Confirmed',
        timestamp: '2026-10-22 19:00 IST',
        actor: 'Dr. Arvind Narayanan (VP AI Research)',
        explanation: 'Cleared Technical 1 and HR panels with strong neural quantization benchmarks.',
      },
      {
        id: 'hist-906-5',
        status: 'OFFER_RELEASED',
        stage_label: 'Super Dream Offer Released (22.0 LPA)',
        timestamp: '2026-10-24 16:00 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Released 22.0 LPA Super Dream offer. Student can accept this higher-tier upgrade under CDC policy.',
      },
    ],
  },
  {
    id: 'app-907',
    student_id: 'std-105',
    studentId: 'std-105',
    student: {
      id: 'std-105',
      roll_number: '21ME031',
      name: 'Vikram Rao',
      email: 'vikram.rao@example.edu',
      cgpa: 7.9,
      department: 'Mechanical Eng.',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    job_id: 'job-4',
    jobId: 'job-4',
    job: {
      id: 'job-4',
      title: 'Robotics Control Systems Engineer',
      package_lpa: 13.5,
      location: 'Chennai, India (On-site)',
    },
    company: 'Mechano Dynamics',
    status: 'UNDER_REVIEW',
    current_round: 'Online Test',
    currentRound: 'Online Test',
    applied_date: '2026-10-23',
    appliedDate: '2026-10-23',
    last_update: '2026-10-24 11:20 IST',
    lastUpdate: '2026-10-24 11:20 IST',
    feedback: 'Application under TPO verification review before shortlisting for Control Systems Test.',
    rounds: buildStandardRounds(0, 'Mechano Dynamics'),
    status_history: [
      {
        id: 'hist-907-1',
        status: 'APPLIED',
        stage_label: 'Application Submitted',
        timestamp: '2026-10-23 16:45 IST',
        actor: 'Vikram Rao (21ME031)',
        explanation: 'Submitted application for Robotics Control Systems Engineer.',
      },
      {
        id: 'hist-907-2',
        status: 'UNDER_REVIEW',
        stage_label: 'Under TPO Eligibility Review',
        timestamp: '2026-10-24 11:20 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Reviewing transcript and CAD/kinematics coursework before shortlisting.',
      },
    ],
  },
  {
    id: 'app-908',
    student_id: 'std-108',
    studentId: 'std-108',
    student: {
      id: 'std-108',
      roll_number: '21IT023',
      name: 'Meera Nair',
      email: 'meera.nair@example.edu',
      cgpa: 8.6,
      department: 'Information Tech.',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    job_id: 'job-1',
    jobId: 'job-1',
    job: {
      id: 'job-1',
      title: 'Senior Software Engineer (Frontend)',
      package_lpa: 18.5,
      location: 'Bangalore, India (Hybrid)',
    },
    company: 'TechNova Solutions',
    status: 'REJECTED',
    rejected_at_stage: 'ASSESSMENT',
    current_round: 'Online Test',
    currentRound: 'Online Test',
    applied_date: '2026-10-06',
    appliedDate: '2026-10-06',
    last_update: '2026-10-14 19:00 IST',
    lastUpdate: '2026-10-14 19:00 IST',
    feedback: 'Did not meet benchmark cutoff (75%) in HackerRank Frontend Systems Assessment.',
    rounds: buildStandardRounds(0, 'TechNova Solutions').map((r, i) =>
      i === 0 ? { ...r, result: 'FAILED' } : r
    ),
    status_history: [
      {
        id: 'hist-908-1',
        status: 'APPLIED',
        stage_label: 'Application Submitted',
        timestamp: '2026-10-06 12:10 IST',
        actor: 'Meera Nair (21IT023)',
        explanation: 'Applied for Senior Software Engineer (Frontend).',
      },
      {
        id: 'hist-908-2',
        status: 'SHORTLISTED',
        stage_label: 'Shortlisted for Assessment',
        timestamp: '2026-10-08 10:00 IST',
        actor: 'Raghav Menon (TPO)',
        explanation: 'Shortlisted for HackerRank Frontend Systems Assessment.',
      },
      {
        id: 'hist-908-3',
        status: 'REJECTED',
        stage_label: 'Not Selected After Online Assessment',
        timestamp: '2026-10-14 19:00 IST',
        actor: 'TechNova Assessment Panel',
        explanation: 'Scored 62/100 (cutoff 75/100) in HackerRank Frontend Systems Assessment.',
      },
    ],
  },
];

export const initialInterviews = [
  {
    id: 'int-301',
    application_id: 'app-902',
    applicationId: 'app-902',
    student_id: 'std-101',
    student: 'Palak Waje',
    roll_number: '21CS042',
    department: 'Computer Science',
    company: 'TechNova Solutions',
    job_title: 'Senior Software Engineer (Frontend)',
    jobTitle: 'Senior Software Engineer (Frontend)',
    round_number: 3,
    round_name: 'Technical 2',
    round_type: 'TECHNICAL',
    date: '2026-10-26',
    reporting_time: '12:00 PM',
    timezone: 'IST (UTC+5:30)',
    mode: 'ONLINE',
    scheduled_at: '2026-10-26T12:00:00',
    meeting_link: 'https://example.com/placetrack-demo-interview/ptk-sys-arch',
    venue: 'Virtual Room PT-82 (Online Bridge)',
    panelists: [
      'David Chen (VP Engineering)',
      'Anjali Menon (Principal Architect)',
    ],
    interviewer: 'David Chen (VP Engineering)',
    location: 'Virtual Room PT-82 (Online Bridge)',
    attendance: 'SCHEDULED',
    feedback: 'System architecture & micro-frontend state synchronization deep dive.',
    result: 'PENDING',
    statusColor: 'interview',
  },
  {
    id: 'int-302',
    application_id: 'app-904',
    applicationId: 'app-904',
    student_id: 'student-rohit',
    student: 'Rohit Verma',
    roll_number: '21EC015',
    department: 'Electronics & Comm.',
    company: 'Embedded Edge Labs',
    job_title: 'IoT Firmware Architect',
    jobTitle: 'IoT Firmware Architect',
    round_number: 2,
    round_name: 'Technical 1',
    round_type: 'TECHNICAL',
    date: '2026-10-28',
    reporting_time: '10:00 AM',
    timezone: 'IST (UTC+5:30)',
    mode: 'IN_PERSON',
    scheduled_at: '2026-10-28T10:00:00',
    meeting_link: '',
    venue: 'Hardware Bay B · Lab 102 (Main Campus)',
    panelists: ['Karthik Raman (Embedded Principal)', 'S. Venkatesh (Firmware Lead)'],
    interviewer: 'Karthik Raman (Embedded Principal)',
    location: 'Hardware Bay B · Lab 102',
    attendance: 'SCHEDULED',
    feedback: 'Bring student ID card and RTOS lab workbook for live oscilloscope & firmware debugging.',
    result: 'PENDING',
    statusColor: 'interview',
  },
  {
    id: 'int-306',
    application_id: 'app-906',
    applicationId: 'app-906',
    student_id: 'student-rohit',
    student: 'Rohit Verma',
    roll_number: '21EC015',
    department: 'Electronics & Comm.',
    company: 'DataWave Analytics',
    job_title: 'Machine Learning Research Engineer',
    jobTitle: 'Machine Learning Research Engineer',
    round_number: 3,
    round_name: 'HR & Executive Offer Briefing',
    round_type: 'HR',
    date: '2026-10-27',
    reporting_time: '04:30 PM',
    timezone: 'IST (UTC+5:30)',
    mode: 'ONLINE',
    scheduled_at: '2026-10-27T16:30:00',
    meeting_link: 'https://example.com/placetrack-demo-interview/dw-ml-briefing',
    venue: 'DataWave Virtual Bridge (Room DW-09)',
    panelists: ['Dr. Arvind Narayanan (VP AI Research)', 'Rhea Sengupta (HR Lead)'],
    interviewer: 'Rhea Sengupta (HR Lead)',
    location: 'DataWave Virtual Bridge (Room DW-09)',
    attendance: 'SCHEDULED',
    feedback: 'Final compensation structure & AI Research Lab onboarding walkthrough.',
    result: 'PENDING',
    statusColor: 'interview',
  },
  {
    id: 'int-303',
    application_id: 'app-901',
    applicationId: 'app-901',
    student_id: 'std-101',
    student: 'Palak Waje',
    roll_number: '21CS042',
    department: 'Computer Science',
    company: 'CloudNest Systems',
    job_title: 'Cloud Infrastructure & SRE Specialist',
    jobTitle: 'Cloud Infrastructure & SRE Specialist',
    round_number: 4,
    round_name: 'HR',
    round_type: 'HR',
    date: '2026-10-16',
    reporting_time: '04:00 PM',
    timezone: 'IST (UTC+5:30)',
    mode: 'IN_PERSON',
    scheduled_at: '2026-10-16T16:00:00',
    meeting_link: '',
    venue: 'CDC Executive Boardroom',
    panelists: ['Maya Alston (COO)', 'Neha Kapoor (HR Lead)'],
    interviewer: 'Maya Alston (COO)',
    location: 'CDC Executive Boardroom',
    attendance: 'PRESENT',
    feedback: 'Strong cultural alignment and leadership clarity. Cleared for final offer.',
    result: 'PASSED',
    statusColor: 'selected',
  },
  {
    id: 'int-304',
    application_id: 'app-905',
    applicationId: 'app-905',
    student_id: 'student-rohit',
    student: 'Rohit Verma',
    roll_number: '21EC015',
    department: 'Electronics & Comm.',
    company: 'CloudNest Systems',
    job_title: 'Cloud Infrastructure & SRE Specialist',
    jobTitle: 'Cloud Infrastructure & SRE Specialist',
    round_number: 4,
    round_name: 'HR',
    round_type: 'HR',
    date: '2026-10-18',
    reporting_time: '03:30 PM',
    timezone: 'IST (UTC+5:30)',
    mode: 'ONLINE',
    scheduled_at: '2026-10-18T15:30:00',
    meeting_link: 'https://example.com/placetrack-demo-interview/cn-hr-rohit',
    venue: 'CDC Virtual Suite 4 (Online)',
    panelists: ['Maya Alston (COO)', 'Vikramaditya Joshi (University Relations)'],
    interviewer: 'Maya Alston (COO)',
    location: 'CDC Virtual Suite 4',
    attendance: 'PRESENT',
    feedback: 'Excellent production incident response walkthrough and Linux kernel troubleshooting.',
    result: 'PASSED',
    statusColor: 'selected',
  },
  {
    id: 'int-305',
    application_id: 'app-906',
    applicationId: 'app-906',
    student_id: 'student-rohit',
    student: 'Rohit Verma',
    roll_number: '21EC015',
    department: 'Electronics & Comm.',
    company: 'DataWave Analytics',
    job_title: 'Machine Learning Research Engineer',
    jobTitle: 'Machine Learning Research Engineer',
    round_number: 2,
    round_name: 'Technical 1',
    round_type: 'TECHNICAL',
    date: '2026-10-21',
    reporting_time: '02:30 PM',
    timezone: 'IST (UTC+5:30)',
    mode: 'ONLINE',
    scheduled_at: '2026-10-21T14:30:00',
    meeting_link: 'https://example.com/placetrack-demo-interview/dw-ml-research',
    venue: 'DataWave AI Research Bridge (Online)',
    panelists: ['Dr. Arvind Narayanan (VP AI Research)', 'Rhea Sengupta'],
    interviewer: 'Dr. Arvind Narayanan (VP AI Research)',
    location: 'DataWave AI Research Bridge',
    attendance: 'PRESENT',
    feedback: 'Top-tier edge quantization and PyTorch model compression demonstration. Recommended for Super Dream Offer.',
    result: 'PASSED',
    statusColor: 'selected',
  },
];

export const initialOffers = [
  {
    id: 'off-1',
    student_id: 'std-101',
    student: 'Palak Waje',
    roll_number: '21CS042',
    department: 'Computer Science',
    company: 'CloudNest Systems',
    tier: 'Dream',
    job_role: 'Cloud Infrastructure & SRE Specialist',
    package_lpa: 15.0,
    base_lpa: 12.0,
    bonus_lpa: 2.0,
    esop_value: 1.0,
    offer_status: 'ACCEPTED',
    date: '2026-10-18',
    joining_date: 'July 15, 2027',
    verified: true,
  },
  {
    id: 'off-2',
    student_id: 'std-101',
    student: 'Palak Waje',
    roll_number: '21CS042',
    department: 'Computer Science',
    company: 'TechNova Solutions',
    tier: 'Super Dream',
    job_role: 'Senior Software Engineer (Frontend)',
    package_lpa: 18.5,
    base_lpa: 14.0,
    bonus_lpa: 2.5,
    esop_value: 2.0,
    offer_status: 'PENDING',
    date: '2026-10-24',
    joining_date: 'August 01, 2027',
    verified: true,
  },
  {
    id: 'off-3',
    student_id: 'std-102',
    student: 'Priya Patel',
    roll_number: '21CS089',
    department: 'Computer Science',
    company: 'DataWave Analytics',
    tier: 'Super Dream',
    job_role: 'Machine Learning Research Engineer',
    package_lpa: 22.0,
    base_lpa: 16.5,
    bonus_lpa: 3.0,
    esop_value: 2.5,
    offer_status: 'ACCEPTED',
    date: '2026-10-12',
    joining_date: 'July 10, 2027',
    verified: true,
  },
  {
    id: 'off-4',
    student_id: 'std-104',
    student: 'Ananya Iyer',
    roll_number: '21IT054',
    department: 'Information Tech.',
    company: 'TechNova Solutions',
    tier: 'Super Dream',
    job_role: 'Distributed Systems Backend Engineer',
    package_lpa: 17.5,
    base_lpa: 13.5,
    bonus_lpa: 2.0,
    esop_value: 2.0,
    offer_status: 'ACCEPTED',
    date: '2026-10-17',
    joining_date: 'July 15, 2027',
    verified: true,
  },
  {
    id: 'off-5',
    student_id: 'std-106',
    student: 'Sneha Kulkarni',
    roll_number: '21CS112',
    department: 'Computer Science',
    company: 'CloudNest Systems',
    tier: 'Dream',
    job_role: 'Full Stack Cloud Engineer',
    package_lpa: 15.0,
    base_lpa: 12.0,
    bonus_lpa: 1.8,
    esop_value: 1.2,
    offer_status: 'ACCEPTED',
    date: '2026-10-15',
    joining_date: 'July 15, 2027',
    verified: true,
  },
  {
    id: 'off-6',
    student_id: 'std-107',
    student: 'Devansh Gupta',
    roll_number: '21EC077',
    department: 'Electronics & Comm.',
    company: 'Embedded Edge Labs',
    tier: 'Core',
    job_role: 'IoT Firmware Architect',
    package_lpa: 12.0,
    base_lpa: 10.0,
    bonus_lpa: 1.5,
    esop_value: 0.5,
    offer_status: 'ACCEPTED',
    date: '2026-10-19',
    joining_date: 'July 20, 2027',
    verified: true,
  },
  {
    id: 'off-7',
    student_id: 'student-rohit',
    student: 'Rohit Verma',
    roll_number: '21EC015',
    department: 'Electronics & Comm.',
    company: 'CloudNest Systems',
    tier: 'Dream',
    job_role: 'Cloud Infrastructure & SRE Specialist',
    package_lpa: 15.0,
    base_lpa: 12.0,
    bonus_lpa: 2.0,
    esop_value: 1.0,
    offer_status: 'ACCEPTED',
    date: '2026-10-20',
    joining_date: 'July 15, 2027',
    verified: true,
  },
  {
    id: 'off-8',
    student_id: 'student-rohit',
    student: 'Rohit Verma',
    roll_number: '21EC015',
    department: 'Electronics & Comm.',
    company: 'DataWave Analytics',
    tier: 'Super Dream',
    job_role: 'Machine Learning Research Engineer',
    package_lpa: 22.0,
    base_lpa: 16.5,
    bonus_lpa: 3.0,
    esop_value: 2.5,
    offer_status: 'PENDING',
    date: '2026-10-24',
    joining_date: 'August 01, 2027',
    verified: true,
  },
];

export const initialCompanies = [
  {
    id: 'comp-1',
    name: 'TechNova Solutions',
    tagline: 'Enterprise Cloud & Next-Gen Systems',
    sector: 'Enterprise Software',
    tier: 'Super Dream',
    logo_url: '',
    logo_letter: 'TN',
    logoLetter: 'TN',
    hr_contacts: [
      {
        name: 'Neha Kapoor',
        email: 'neha.kapoor@technova.io',
        phone: '+91 98201 44510',
      },
      {
        name: 'Arjun Malhotra',
        email: 'campus@technova.io',
        phone: '+91 98201 44511',
      },
    ],
    active_drives: 2,
    activeDrives: 2,
    total_hired: 48,
    totalHired: 48,
    avg_package_lpa: 17.5,
    avgPackageLPA: 17.5,
    highest_package_lpa: 24.0,
    highestPackageLPA: 24.0,
    rating: 4.8,
    accent_bg: '#EDE9FE',
    accentBg: '#EDE9FE',
    accent_color: '#6D28D9',
    accentColor: '#6D28D9',
  },
  {
    id: 'comp-2',
    name: 'DataWave Analytics',
    tagline: 'Predictive Intelligence & Neural Engineering',
    sector: 'Artificial Intelligence',
    tier: 'Super Dream',
    logo_url: '',
    logo_letter: 'DW',
    logoLetter: 'DW',
    hr_contacts: [
      {
        name: 'Rhea Sengupta',
        email: 'rhea.hr@datawave.ai',
        phone: '+91 97400 88219',
      },
      {
        name: 'Dr. Arvind Narayanan (AI Research Desk)',
        email: 'arvind.research@datawave.ai',
        phone: '',
      },
    ],
    active_drives: 1,
    activeDrives: 1,
    total_hired: 32,
    totalHired: 32,
    avg_package_lpa: 20.5,
    avgPackageLPA: 20.5,
    highest_package_lpa: 28.5,
    highestPackageLPA: 28.5,
    rating: 4.9,
    accent_bg: '#FEF3C7',
    accentBg: '#FEF3C7',
    accent_color: '#B45309',
    accentColor: '#B45309',
  },
  {
    id: 'comp-3',
    name: 'CloudNest Systems',
    tagline: 'Resilient Hyperscale Cloud Infrastructure',
    sector: 'Cloud & DevOps',
    tier: 'Dream',
    logo_url: '',
    logo_letter: 'CN',
    logoLetter: 'CN',
    hr_contacts: [
      {
        name: 'Maya Alston',
        email: 'maya.alston@cloudnest.dev',
        phone: '+91 99002 31004',
      },
      {
        name: 'Vikramaditya Joshi',
        email: 'university@cloudnest.dev',
        phone: '+91 99002 31009',
      },
    ],
    active_drives: 2,
    activeDrives: 2,
    total_hired: 54,
    totalHired: 54,
    avg_package_lpa: 15.0,
    avgPackageLPA: 15.0,
    highest_package_lpa: 22.0,
    highestPackageLPA: 22.0,
    rating: 4.7,
    accent_bg: '#DCFCE7',
    accentBg: '#DCFCE7',
    accent_color: '#15803D',
    accentColor: '#15803D',
  },
  {
    id: 'comp-4',
    name: 'Mechano Dynamics',
    tagline: 'Autonomous Robotics & Kinematic Hardware',
    sector: 'Robotics & Hardware',
    tier: 'Dream',
    logo_url: '',
    logo_letter: 'MD',
    logoLetter: 'MD',
    hr_contacts: [
      {
        name: 'Suresh Natarajan',
        email: 'suresh.hr@mechano.in',
        phone: '+91 94441 72011',
      },
    ],
    active_drives: 1,
    activeDrives: 1,
    total_hired: 28,
    totalHired: 28,
    avg_package_lpa: 13.5,
    avgPackageLPA: 13.5,
    highest_package_lpa: 19.0,
    highestPackageLPA: 19.0,
    rating: 4.6,
    accent_bg: '#FFE4E6',
    accentBg: '#FFE4E6',
    accent_color: '#BE123C',
    accentColor: '#BE123C',
  },
  {
    id: 'comp-5',
    name: 'Embedded Edge Labs',
    tagline: 'Micro-Silicon & Ultra Low-Power Edge Computing',
    sector: 'Semiconductors & IoT',
    tier: 'Core',
    logo_url: '',
    logo_letter: 'EE',
    logoLetter: 'EE',
    hr_contacts: [
      {
        name: 'Kavita Deshmukh',
        email: 'careers@embeddededge.io',
        phone: '+91 98804 51230',
      },
    ],
    active_drives: 2,
    activeDrives: 2,
    total_hired: 36,
    totalHired: 36,
    avg_package_lpa: 11.5,
    avgPackageLPA: 11.5,
    highest_package_lpa: 16.5,
    highestPackageLPA: 16.5,
    rating: 4.7,
    accent_bg: '#E0F2FE',
    accentBg: '#E0F2FE',
    accent_color: '#0369A1',
    accentColor: '#0369A1',
  },
];

// Deterministic, recipient-scoped initial notifications (never broadcast indiscriminately)
export const initialNotifications = [
  // STUDENT notifications — Palak Waje (std-101)
  {
    id: 'notif-std-101-1',
    event_type: 'OFFER_RELEASED',
    recipient_user_id: 'std-101',
    target_role: 'STUDENT',
    student_id: 'std-101',
    title: 'TechNova Super Dream Offer Released',
    message:
      'TechNova Solutions extended a Senior Software Engineer (18.5 LPA · Super Dream) offer awaiting your decision.',
    type: 'placement',
    timestamp: '10m ago',
    created_at: '2026-10-25T10:35:00.000Z',
    read_by: {},
    related_offer_id: 'off-2',
    related_drive_id: 'job-1',
    related_application_id: 'app-902',
    link: '/dashboard/my-placement',
    dedupe_key: 'OFFER_RELEASED:std-101:off-2',
  },
  {
    id: 'notif-std-101-2',
    event_type: 'INTERVIEW_SCHEDULED',
    recipient_user_id: 'std-101',
    target_role: 'STUDENT',
    student_id: 'std-101',
    title: 'Technical 2 Interview Scheduled',
    message:
      'TechNova Solutions Technical 2 panel scheduled for 2026-10-26 at 12:00 PM in Google Meet (Room PT-82).',
    type: 'info',
    timestamp: '1h ago',
    created_at: '2026-10-25T09:45:00.000Z',
    read_by: {},
    related_interview_id: 'int-301',
    related_application_id: 'app-902',
    related_drive_id: 'job-1',
    link: '/dashboard/my-interviews',
    dedupe_key: 'INTERVIEW_SCHEDULED:std-101:int-301',
  },
  {
    id: 'notif-std-101-3',
    event_type: 'DRIVE_CREATED',
    recipient_user_id: 'std-101',
    target_role: 'STUDENT',
    student_id: 'std-101',
    title: 'Eligible Drive Open: TechNova Solutions',
    message:
      'You meet all eligibility criteria for Senior Software Engineer (Frontend) (16.0–18.5 LPA).',
    type: 'success',
    timestamp: '2h ago',
    created_at: '2026-10-25T08:30:00.000Z',
    read_by: {},
    related_drive_id: 'job-1',
    link: '/dashboard/jobs',
    dedupe_key: 'DRIVE_CREATED:std-101:job-1',
  },
  // STUDENT notifications — Priya Patel (std-102)
  {
    id: 'notif-std-102-1',
    event_type: 'OFFER_RELEASED',
    recipient_user_id: 'std-102',
    target_role: 'STUDENT',
    student_id: 'std-102',
    title: 'DataWave Analytics Offer Confirmed',
    message:
      'Your Machine Learning Research Engineer (22.0 LPA · Super Dream) offer is verified.',
    type: 'placement',
    timestamp: '3h ago',
    created_at: '2026-10-25T07:30:00.000Z',
    read_by: {},
    related_offer_id: 'off-3',
    related_drive_id: 'job-2',
    related_application_id: 'app-903',
    link: '/dashboard/my-placement',
    dedupe_key: 'OFFER_RELEASED:std-102:off-3',
  },
  // STUDENT notifications — Rohit Verma (student-rohit)
  {
    id: 'notif-student-rohit-1',
    event_type: 'OFFER_RELEASED',
    recipient_user_id: 'student-rohit',
    target_role: 'STUDENT',
    student_id: 'student-rohit',
    title: 'DataWave Super Dream Offer Released',
    message:
      'DataWave Analytics extended a Machine Learning Research Engineer (22.0 LPA · Super Dream) offer awaiting your decision.',
    type: 'placement',
    timestamp: '12m ago',
    created_at: '2026-10-25T10:38:00.000Z',
    read_by: {},
    related_offer_id: 'off-8',
    related_drive_id: 'job-2',
    link: '/dashboard/my-placement',
    dedupe_key: 'OFFER_RELEASED:student-rohit:off-8',
  },
  {
    id: 'notif-student-rohit-2',
    event_type: 'INTERVIEW_SCHEDULED',
    recipient_user_id: 'student-rohit',
    target_role: 'STUDENT',
    student_id: 'student-rohit',
    title: 'Technical 1 Interview Scheduled: Embedded Edge Labs',
    message:
      'Embedded Edge Labs Technical 1 panel scheduled for 2026-10-28 at 10:00 AM in Hardware Bay B · Lab 102.',
    type: 'info',
    timestamp: '1h ago',
    created_at: '2026-10-25T09:40:00.000Z',
    read_by: {},
    related_interview_id: 'int-302',
    related_application_id: 'app-904',
    related_drive_id: 'job-5',
    link: '/dashboard/my-interviews',
    dedupe_key: 'INTERVIEW_SCHEDULED:student-rohit:int-302',
  },
  {
    id: 'notif-student-rohit-3',
    event_type: 'APPLICATION_SHORTLISTED',
    recipient_user_id: 'student-rohit',
    target_role: 'STUDENT',
    student_id: 'student-rohit',
    title: 'Shortlisted for Technical 1: Embedded Edge Labs',
    message:
      'You cleared the Online Test for IoT Firmware Architect (10.5 LPA) and advanced to Technical 1.',
    type: 'success',
    timestamp: '4h ago',
    created_at: '2026-10-25T06:30:00.000Z',
    read_by: {},
    related_application_id: 'app-904',
    related_interview_id: 'int-302',
    related_drive_id: 'job-5',
    link: '/dashboard/my-applications',
    dedupe_key: 'APPLICATION_SHORTLISTED:student-rohit:app-904',
  },
  // STAFF notifications — Raghav Menon (staff-raghav)
  {
    id: 'notif-staff-raghav-1',
    event_type: 'STUDENT_VERIFICATION_REQUIRED',
    recipient_user_id: 'staff-raghav',
    target_role: 'STAFF',
    title: 'Student Records Awaiting CGPA Verification',
    message:
      'Vikram Rao (21ME031) and Meera Nair (21IT023) require TPO transcript & CGPA verification.',
    type: 'warning',
    timestamp: '15m ago',
    created_at: '2026-10-25T10:30:00.000Z',
    read_by: {},
    link: '/dashboard/students',
    dedupe_key: 'STUDENT_VERIFICATION_REQUIRED:staff-raghav:initial',
  },
  {
    id: 'notif-staff-raghav-2',
    event_type: 'INTERVIEW_SCHEDULED',
    recipient_user_id: 'staff-raghav',
    target_role: 'STAFF',
    title: 'Interview Scheduled: Rohit Verma · Embedded Edge Labs',
    message:
      'Technical 1 round scheduled on 2026-10-28 at 10:00 AM in Hardware Bay B · Lab 102.',
    type: 'info',
    timestamp: '45m ago',
    created_at: '2026-10-25T10:00:00.000Z',
    read_by: {},
    related_interview_id: 'int-302',
    related_application_id: 'app-904',
    link: '/dashboard/interviews',
    dedupe_key: 'INTERVIEW_SCHEDULED:staff-raghav:int-302',
  },
  {
    id: 'notif-staff-raghav-3',
    event_type: 'APPLICATION_SUBMITTED',
    recipient_user_id: 'staff-raghav',
    target_role: 'STAFF',
    title: 'Candidate Application Submitted: Rohit Verma',
    message:
      'Rohit Verma (21EC015 · Electronics & Comm.) applied to Embedded Edge Labs (IoT Firmware Architect).',
    type: 'success',
    timestamp: '2h ago',
    created_at: '2026-10-25T08:40:00.000Z',
    read_by: {},
    related_application_id: 'app-904',
    related_drive_id: 'job-5',
    link: '/dashboard/applications',
    dedupe_key: 'APPLICATION_SUBMITTED:staff-raghav:app-904',
  },
  // ADMIN notifications — Ishan Wankhede (admin-ishan)
  {
    id: 'notif-admin-ishan-1',
    event_type: 'OFFER_ACCEPTED',
    recipient_user_id: 'admin-ishan',
    target_role: 'ADMIN',
    title: 'Offer Accepted: Rohit Verma · CloudNest Systems',
    message:
      'Rohit Verma (21EC015) accepted the 15.0 LPA (Dream Tier) offer from CloudNest Systems.',
    type: 'placement',
    timestamp: '25m ago',
    created_at: '2026-10-25T10:20:00.000Z',
    read_by: {},
    related_offer_id: 'off-7',
    related_application_id: 'app-905',
    link: '/dashboard/placements',
    dedupe_key: 'OFFER_ACCEPTED:admin-ishan:off-7',
  },
  {
    id: 'notif-admin-ishan-2',
    event_type: 'POLICY_CHANGED',
    recipient_user_id: 'admin-ishan',
    target_role: 'ADMIN',
    title: 'Academic Year 2026-27 Placement Policy Active',
    message:
      'Single-offer lock and tier upgrade rules (Core < Dream < Super Dream) are active across all departments.',
    type: 'info',
    timestamp: '1h ago',
    created_at: '2026-10-25T09:30:00.000Z',
    read_by: {},
    link: '/dashboard/policies',
    dedupe_key: 'POLICY_CHANGED:admin-ishan:initial',
  },
];

export const initialAnalytics = {
  summary: {
    students_placed: 212,
    studentsPlaced: 212,
    total_eligible_students: 508,
    totalEligibleStudents: 508,
    placement_rate_percent: 41.7,
    placementRatePercent: 41.7,
    drives_open: 18,
    drivesOpen: 18,
    avg_package_lpa: 14.8,
    avgPackageLpa: 14.8,
    median_package_lpa: 14.2,
    medianPackageLpa: 14.2,
    highest_package_lpa: 28.5,
    highestPackageLpa: 28.5,
    total_offers: 268,
    totalOffers: 268,
    partner_companies: 58,
    partnerCompanies: 58,
  },
  trendWeekly: [
    { name: 'W1 Sep', offers: 12, interviews: 34, drives: 4 },
    { name: 'W2 Sep', offers: 24, interviews: 58, drives: 7 },
    { name: 'W3 Sep', offers: 42, interviews: 86, drives: 11 },
    { name: 'W4 Sep', offers: 68, interviews: 112, drives: 14 },
    { name: 'W1 Oct', offers: 118, interviews: 165, drives: 16 },
    { name: 'W2 Oct', offers: 165, interviews: 210, drives: 18 },
    { name: 'W3 Oct', offers: 192, interviews: 248, drives: 18 },
    { name: 'W4 Oct', offers: 212, interviews: 280, drives: 18 },
  ],
  trendMonthly: [
    { name: 'Jul', offers: 15, avgLpa: 12.5 },
    { name: 'Aug', offers: 55, avgLpa: 13.8 },
    { name: 'Sep', offers: 144, avgLpa: 14.6 },
    { name: 'Oct', offers: 212, avgLpa: 15.2 },
  ],
  departmentBreakdown: [
    {
      department: 'Computer Science',
      placed: 86,
      total: 120,
      rate: 71.6,
      avgLpa: 16.4,
      medianLpa: 15.5,
    },
    {
      department: 'Information Tech.',
      placed: 64,
      total: 95,
      rate: 67.3,
      avgLpa: 15.1,
      medianLpa: 14.6,
    },
    {
      department: 'Electronics & Comm.',
      placed: 42,
      total: 110,
      rate: 38.1,
      avgLpa: 12.8,
      medianLpa: 12.0,
    },
    {
      department: 'Mechanical Eng.',
      placed: 20,
      total: 98,
      rate: 20.4,
      avgLpa: 11.2,
      medianLpa: 10.8,
    },
  ],
  packageDistribution: [
    { range: '< 8 LPA', count: 18 },
    { range: '8 - 12 LPA', count: 64 },
    { range: '12 - 16 LPA', count: 82 },
    { range: '16 - 20 LPA', count: 36 },
    { range: '20+ LPA', count: 12 },
  ],
  funnelData: [
    { stage: 'Eligible Students', count: 508, pct: '100%' },
    { stage: 'Applied to Drives', count: 486, pct: '95.6%' },
    { stage: 'Shortlisted for Tests', count: 372, pct: '73.2%' },
    { stage: 'Attended Interviews', count: 284, pct: '55.9%' },
    { stage: 'Selected with Offers', count: 212, pct: '41.7%' },
  ],
};

export const initialStaffAccounts = [
  {
    ...DEMO_STAFF_ACCOUNTS.ADMIN,
    account_status: 'ACTIVE',
    assigned_departments: ['All Departments'],
    joined_date: '2022-06-15',
  },
  {
    ...DEMO_STAFF_ACCOUNTS.STAFF,
    account_status: 'ACTIVE',
    assigned_departments: ['Computer Science', 'Information Tech.'],
    joined_date: '2023-08-01',
  },
  {
    id: 'staff-2',
    roll_number: 'CDC-TPO-019',
    name: 'Dr. Meera Krishnan',
    email: 'meera.tpo@placetrack.edu',
    phone: '+91 98200 22019',
    role: 'STAFF',
    title: 'Faculty Placement Coordinator (Circuit Branches)',
    department: 'Training & Placement Office (TPO)',
    account_status: 'ACTIVE',
    assigned_departments: ['Electronics & Comm.', 'Mechanical Eng.'],
    joined_date: '2024-01-10',
    permissions: [
      'manage_drives',
      'manage_companies',
      'verify_students',
      'manage_applications',
      'manage_placements',
    ],
    photo_url:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'staff-3',
    roll_number: 'CDC-TPO-024',
    name: 'Sandeep Kulkarni',
    email: 'sandeep.tpo@placetrack.edu',
    phone: '+91 98200 22024',
    role: 'STAFF',
    title: 'Corporate Relations & Interview Desk Officer',
    department: 'Training & Placement Office (TPO)',
    account_status: 'ACTIVE',
    assigned_departments: ['Computer Science', 'Electronics & Comm.'],
    joined_date: '2024-07-20',
    permissions: [
      'manage_drives',
      'verify_students',
      'manage_applications',
    ],
    photo_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

export const initialPolicies = {
  academic_year: '2026-27',
  single_offer_policy: true,
  allow_higher_tier_upgrade: true,
  min_ctc_upgrade_multiplier: 1.5,
  dream_tier_min_lpa: 10.0,
  super_dream_tier_min_lpa: 18.0,
  institutional_min_cgpa: 6.5,
  max_allowed_backlogs: 1,
  max_active_applications: 8,
  auto_debar_on_interview_noshow: true,
  require_cdc_cgpa_verification: true,
  offer_decision_window_hours: 72,
  policy_note:
    'Single-offer policy: accepting locks other offers unless the new company is a higher tier (Core → Dream → Super Dream).',
  last_updated_by: 'Ishan Wankhede (Dean, CDC)',
  last_updated_at: '2026-10-20',
};

// Load or initialize mutable state from localStorage (no passwords stored)
function loadPersistedData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePersistedData(data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

const persisted = loadPersistedData();

let students = (persisted?.students || [...initialStudents]).map((s) => ({
  account_status: 'ACTIVE',
  ...s,
}));
let staffAccounts = (persisted?.staffAccounts || [...initialStaffAccounts]).map((st) => ({
  account_status: 'ACTIVE',
  ...st,
}));
let jobs = persisted?.jobs || [...initialJobs];
let applications = persisted?.applications || [...initialApplications];
let interviews = (persisted?.interviews || [...initialInterviews]).map((intItem) => ({
  attendance: intItem.result === 'PASSED' ? 'PRESENT' : 'SCHEDULED',
  feedback:
    intItem.feedback ||
    (intItem.result === 'PASSED'
      ? 'Strong architectural clarity and clean system design communication.'
      : 'Scheduled for upcoming technical evaluation.'),
  ...intItem,
}));
let offers = persisted?.offers || [...initialOffers];
let companies = persisted?.companies || [...initialCompanies];
let notifications = (persisted?.notifications || [...initialNotifications]).map((n) => ({
  read_by: n.read_by && typeof n.read_by === 'object' ? { ...n.read_by } : {},
  ...n,
}));
let policies = persisted?.policies || { ...initialPolicies };
let studentSettings = persisted?.studentSettings || {};
// Track which notification IDs have already been surfaced via polling for each recipient in this session
const surfacedPollIdsByRecipient = {};

export const initialConversations = [
  {
    id: 'conv-rohit-raghav',
    subject: 'Embedded Edge Labs Technical 1 & DataWave Super Dream Offer',
    participant_ids: ['student-rohit', 'staff-raghav'],
    participants: [
      {
        id: 'student-rohit',
        name: 'Rohit Verma',
        role: 'STUDENT',
        subtitle: '21EC015 · Electronics & Comm.',
      },
      {
        id: 'staff-raghav',
        name: 'Raghav Menon',
        role: 'STAFF',
        subtitle: 'Senior Placement Coordinator (TPO)',
      },
    ],
    updated_at: '2026-10-25T10:42:00.000Z',
    unread_by: { 'student-rohit': true },
    messages: [
      {
        id: 'msg-101',
        sender_id: 'staff-raghav',
        sender_name: 'Raghav Menon',
        sender_role: 'STAFF',
        text: 'Hi Rohit, congratulations on clearing the DataWave Analytics Technical 1 round! Your 22.0 LPA Super Dream offer letter is now available in your Placement Portal.',
        timestamp: '2026-10-25 10:15 IST',
        created_at: '2026-10-25T04:45:00.000Z',
      },
      {
        id: 'msg-102',
        sender_id: 'student-rohit',
        sender_name: 'Rohit Verma',
        sender_role: 'STUDENT',
        text: 'Thank you Sir! Since I already accepted CloudNest Systems (15.0 LPA Dream Tier), does the single-offer policy allow me to upgrade to DataWave (Super Dream)?',
        timestamp: '2026-10-25 10:28 IST',
        created_at: '2026-10-25T04:58:00.000Z',
      },
      {
        id: 'msg-103',
        sender_id: 'staff-raghav',
        sender_name: 'Raghav Menon',
        sender_role: 'STAFF',
        text: 'Yes — under the 2026-27 CDC Policy, upgrading from a Dream Tier offer to a Super Dream Tier offer (≥18.0 LPA) is permitted. Also remember to bring your RTOS lab workbook for the Embedded Edge Labs in-person round on Oct 28.',
        timestamp: '2026-10-25 10:42 IST',
        created_at: '2026-10-25T05:12:00.000Z',
      },
    ],
  },
  {
    id: 'conv-palak-raghav',
    subject: 'TechNova Solutions Technical 2 Panel Preparation',
    participant_ids: ['std-101', 'staff-raghav'],
    participants: [
      {
        id: 'std-101',
        name: 'Palak Waje',
        role: 'STUDENT',
        subtitle: '21CS042 · Computer Science',
      },
      {
        id: 'staff-raghav',
        name: 'Raghav Menon',
        role: 'STAFF',
        subtitle: 'Senior Placement Coordinator (TPO)',
      },
    ],
    updated_at: '2026-10-25T09:50:00.000Z',
    unread_by: {},
    messages: [
      {
        id: 'msg-201',
        sender_id: 'staff-raghav',
        sender_name: 'Raghav Menon',
        sender_role: 'STAFF',
        text: 'Hi Palak, your TechNova Solutions Technical 2 round is confirmed for Oct 26 at 12:00 PM IST. Please join the virtual bridge 10 minutes early.',
        timestamp: '2026-10-25 09:50 IST',
        created_at: '2026-10-25T04:20:00.000Z',
      },
    ],
  },
  {
    id: 'conv-raghav-ishan',
    subject: '2026-27 Super Dream Tier Upgrade & Verification Audit',
    participant_ids: ['staff-raghav', 'admin-ishan'],
    participants: [
      {
        id: 'staff-raghav',
        name: 'Raghav Menon',
        role: 'STAFF',
        subtitle: 'Senior Placement Coordinator (TPO)',
      },
      {
        id: 'admin-ishan',
        name: 'Ishan Wankhede',
        role: 'ADMIN',
        subtitle: 'Dean of Corporate Relations',
      },
    ],
    updated_at: '2026-10-25T10:10:00.000Z',
    unread_by: { 'admin-ishan': true },
    messages: [
      {
        id: 'msg-301',
        sender_id: 'admin-ishan',
        sender_name: 'Ishan Wankhede',
        sender_role: 'ADMIN',
        text: 'Raghav, please ensure all unverified student CGPA records in Mechanical and IT are audited before the next Super Dream shortlist closes.',
        timestamp: '2026-10-25 09:30 IST',
        created_at: '2026-10-25T04:00:00.000Z',
      },
      {
        id: 'msg-302',
        sender_id: 'staff-raghav',
        sender_name: 'Raghav Menon',
        sender_role: 'STAFF',
        text: 'Understood, Dean Ishan. Vikram Rao (21ME031) and Meera Nair (21IT023) are queued for transcript verification today.',
        timestamp: '2026-10-25 10:10 IST',
        created_at: '2026-10-25T04:40:00.000Z',
      },
    ],
  },
  {
    id: 'conv-raghav-hr-technova',
    subject: 'TechNova Campus Hiring Logistics — Neha Kapoor (HR)',
    participant_ids: ['staff-raghav', 'admin-ishan', 'hr-neha-kapoor'],
    participants: [
      {
        id: 'staff-raghav',
        name: 'Raghav Menon',
        role: 'STAFF',
        subtitle: 'Senior Placement Coordinator (TPO)',
      },
      {
        id: 'admin-ishan',
        name: 'Ishan Wankhede',
        role: 'ADMIN',
        subtitle: 'Dean of Corporate Relations',
      },
      {
        id: 'hr-neha-kapoor',
        name: 'Neha Kapoor (TechNova HR)',
        role: 'HR_CONTACT',
        subtitle: 'neha.kapoor@technova.io · TechNova Solutions',
      },
    ],
    updated_at: '2026-10-25T08:15:00.000Z',
    unread_by: {},
    messages: [
      {
        id: 'msg-401',
        sender_id: 'hr-neha-kapoor',
        sender_name: 'Neha Kapoor (TechNova HR)',
        sender_role: 'HR_CONTACT',
        text: 'Hello TPO Team, our panel led by David Chen is ready for the Technical 2 interviews tomorrow. Please share any updated candidate resumes.',
        timestamp: '2026-10-25 08:15 IST',
        created_at: '2026-10-25T02:45:00.000Z',
      },
    ],
  },
];

let conversations = (persisted?.conversations || [...initialConversations]).map((c) => ({
  ...c,
  unread_by: c.unread_by && typeof c.unread_by === 'object' ? { ...c.unread_by } : {},
  messages: Array.isArray(c.messages) ? [...c.messages] : [],
}));

function persistAll() {
  savePersistedData({
    students,
    staffAccounts,
    jobs,
    applications,
    interviews,
    offers,
    companies,
    notifications,
    policies,
    studentSettings,
    conversations,
  });
}

function emitNotificationsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('placetrack-notifications-updated'));
  }
}

function emitConversationsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('placetrack-conversations-updated'));
  }
}

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

const ALLOWED_ROUTES_BY_ROLE = {
  ADMIN: [
    '/dashboard',
    '/dashboard/students',
    '/dashboard/user-management',
    '/dashboard/companies',
    '/dashboard/jobs',
    '/dashboard/eligible-students',
    '/dashboard/applications',
    '/dashboard/interviews',
    '/dashboard/results',
    '/dashboard/placements',
    '/dashboard/analytics',
    '/dashboard/policies',
    '/dashboard/notifications',
    '/dashboard/profile',
  ],
  STAFF: [
    '/dashboard',
    '/dashboard/students',
    '/dashboard/companies',
    '/dashboard/jobs',
    '/dashboard/eligible-students',
    '/dashboard/applications',
    '/dashboard/interviews',
    '/dashboard/results',
    '/dashboard/placements',
    '/dashboard/notifications',
    '/dashboard/profile',
  ],
  STUDENT: [
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/jobs',
    '/dashboard/my-applications',
    '/dashboard/my-interviews',
    '/dashboard/my-placement',
    '/dashboard/my-offers',
    '/dashboard/my-progress',
    '/dashboard/notifications',
    '/dashboard/settings',
  ],
};

export function resolveSafeRouteForRole(rawLink, role = 'STUDENT') {
  const allowed = ALLOWED_ROUTES_BY_ROLE[role] || ALLOWED_ROUTES_BY_ROLE.STUDENT;
  if (rawLink && allowed.includes(rawLink)) {
    return rawLink;
  }

  // Deterministic role-aware route equivalents
  if (role === 'STUDENT') {
    if (rawLink === '/dashboard/applications' || rawLink === '/dashboard/results') {
      return '/dashboard/my-applications';
    }
    if (rawLink === '/dashboard/interviews') {
      return '/dashboard/my-interviews';
    }
    if (rawLink === '/dashboard/placements') {
      return '/dashboard/my-placement';
    }
    if (rawLink === '/dashboard/eligible-students') {
      return '/dashboard/jobs';
    }
    return '/dashboard';
  }

  if (role === 'STAFF') {
    if (rawLink === '/dashboard/my-applications') return '/dashboard/applications';
    if (rawLink === '/dashboard/my-interviews') return '/dashboard/interviews';
    if (rawLink === '/dashboard/my-placement' || rawLink === '/dashboard/my-offers') {
      return '/dashboard/placements';
    }
    if (rawLink === '/dashboard/user-management') return '/dashboard/students';
    if (rawLink === '/dashboard/policies' || rawLink === '/dashboard/analytics') {
      return '/dashboard';
    }
    return '/dashboard';
  }

  // ADMIN equivalents
  if (rawLink === '/dashboard/my-applications') return '/dashboard/applications';
  if (rawLink === '/dashboard/my-interviews') return '/dashboard/interviews';
  if (rawLink === '/dashboard/my-placement' || rawLink === '/dashboard/my-offers') {
    return '/dashboard/placements';
  }
  return '/dashboard';
}

function normalizeUserId(userId, role = 'ADMIN') {
  if (!userId) return getDefaultUserIdForRole(role);
  if (userId === 'admin-1' || userId === 'usr-admin-1') return 'admin-ishan';
  if (userId === 'staff-1' || userId === 'usr-staff-1') return 'staff-raghav';
  if (userId === 'std-103') return 'student-rohit';
  return userId;
}

function getDefaultUserIdForRole(role = 'ADMIN') {
  if (role === 'ADMIN') return 'admin-ishan';
  if (role === 'STAFF') return 'staff-raghav';
  return 'student-rohit';
}

function getResponsibleStaffAccounts(department = null) {
  const activeStaff = staffAccounts.filter(
    (s) => s.role === 'STAFF' && s.account_status !== 'DEACTIVATED'
  );
  const matched = activeStaff.filter((s) => {
    if (!department) return true;
    const depts = s.assigned_departments || [];
    return (
      depts.includes('All Departments') ||
      depts.includes(department) ||
      s.id === 'staff-raghav'
    );
  });
  if (matched.length > 0) return matched;
  return activeStaff.length > 0 ? [activeStaff[0]] : [{ id: 'staff-raghav', role: 'STAFF' }];
}

function getAdminAccounts() {
  const activeAdmins = staffAccounts.filter(
    (s) => s.role === 'ADMIN' && s.account_status !== 'DEACTIVATED'
  );
  return activeAdmins.length > 0 ? activeAdmins : [{ id: 'admin-ishan', role: 'ADMIN' }];
}

function formatNotificationTimestamp(isoString) {
  if (!isoString) return 'Just now';
  try {
    const created = new Date(isoString);
    if (Number.isNaN(created.getTime())) return String(isoString);
    const diffSec = Math.max(0, Math.floor((Date.now() - created.getTime()) / 1000));
    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
}

/**
 * Deterministic notification creation helper.
 * Prevents duplicate notifications for the same (dedupe_key) and stores read status per recipient.
 */
const pushNotification = ({
  event_type = 'SYSTEM_ALERT',
  recipient_user_id = null,
  target_role = 'STUDENT',
  student_id = null,
  title,
  message,
  type = 'info',
  link = '/dashboard',
  sender_name = 'PlaceTrack CDC',
  related_application_id = null,
  related_interview_id = null,
  related_drive_id = null,
  related_offer_id = null,
  dedupe_key = null,
}) => {
  const resolvedRecipientId =
    recipient_user_id ||
    student_id ||
    getDefaultUserIdForRole(target_role);

  const safeLink = resolveSafeRouteForRole(link, target_role);

  const computedDedupeKey =
    dedupe_key ||
    `${event_type}:${resolvedRecipientId}:${
      related_offer_id ||
      related_interview_id ||
      related_application_id ||
      related_drive_id ||
      title
    }:${message}`;

  // Prevent duplicate notification for the same event and recipient
  const existingIdx = notifications.findIndex(
    (n) =>
      n.dedupe_key === computedDedupeKey &&
      (n.recipient_user_id || n.student_id) === resolvedRecipientId
  );

  const nowIso = new Date().toISOString();

  if (existingIdx !== -1) {
    // Update timestamp & unread state for this recipient without creating a duplicate row
    const existing = notifications[existingIdx];
    const nextReadBy = { ...(existing.read_by || {}) };
    delete nextReadBy[resolvedRecipientId];
    const updatedItem = {
      ...existing,
      title,
      message,
      type,
      link: safeLink,
      created_at: nowIso,
      timestamp: 'Just now',
      read_by: nextReadBy,
    };
    notifications = [
      updatedItem,
      ...notifications.filter((_, idx) => idx !== existingIdx),
    ];
    persistAll();
    emitNotificationsUpdated();
    return updatedItem;
  }

  const item = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    event_type,
    recipient_user_id: resolvedRecipientId,
    target_role,
    student_id: target_role === 'STUDENT' ? resolvedRecipientId : student_id,
    title,
    message,
    type,
    sender_name,
    created_at: nowIso,
    timestamp: 'Just now',
    read_by: {},
    related_application_id,
    related_interview_id,
    related_drive_id,
    related_offer_id,
    link: safeLink,
    dedupe_key: computedDedupeKey,
  };

  notifications = [item, ...notifications];
  persistAll();
  emitNotificationsUpdated();
  return item;
};

function serializeNotificationForUser(notif, userId, role) {
  const effectiveUserId = userId || getDefaultUserIdForRole(role);
  const readByMap =
    notif.read_by && typeof notif.read_by === 'object' ? notif.read_by : {};
  const isReadForRecipient = Boolean(readByMap[effectiveUserId]);
  return {
    ...notif,
    recipient_user_id:
      notif.recipient_user_id || notif.student_id || getDefaultUserIdForRole(notif.target_role),
    event_type: notif.event_type || 'SYSTEM_ALERT',
    read_by: readByMap,
    read: isReadForRecipient,
    timestamp: notif.created_at
      ? formatNotificationTimestamp(notif.created_at)
      : notif.timestamp || 'Just now',
    link: resolveSafeRouteForRole(notif.link, role),
  };
}

export const mockApi = {
  // Deterministic Demo Accounts Directory
  getDemoAccounts() {
    return {
      ADMIN: { ...(staffAccounts.find((s) => s.id === 'admin-ishan' || s.role === 'ADMIN') || DEMO_STAFF_ACCOUNTS.ADMIN) },
      STAFF: { ...(staffAccounts.find((s) => s.id === 'staff-raghav' || s.role === 'STAFF') || DEMO_STAFF_ACCOUNTS.STAFF) },
      STUDENT: { ...(students.find((s) => s.id === 'student-rohit') || students[0]), role: 'STUDENT' },
      ALL_STAFF: [...staffAccounts],
      ALL_STUDENTS: students.map((s) => ({ ...s, role: 'STUDENT' })),
    };
  },

  // Staff & User Account Management (Admin)
  async getStaffAccounts() {
    await delay(60);
    return [...staffAccounts];
  },

  async createUserAccount(payload) {
    await delay(120);
    const accountType = payload.role || 'STUDENT';
    if (accountType === 'STAFF' || accountType === 'ADMIN') {
      const createdStaff = {
        id: `${accountType.toLowerCase()}-${Date.now().toString().slice(-4)}`,
        roll_number:
          payload.roll_number ||
          (accountType === 'ADMIN' ? 'CDC-ADM-009' : `CDC-TPO-${Math.floor(100 + Math.random() * 90)}`),
        name: payload.name || 'New Placement Coordinator',
        email: payload.email || 'coordinator@placetrack.edu',
        phone: payload.phone || '+91 98200 00000',
        role: accountType,
        title:
          payload.title ||
          (accountType === 'ADMIN'
            ? 'Associate Dean, Corporate Relations'
            : 'Placement Coordinator (TPO)'),
        department: payload.department || 'Training & Placement Office (TPO)',
        assigned_departments: payload.assigned_departments || ['Computer Science'],
        account_status: 'ACTIVE',
        joined_date: new Date().toISOString().split('T')[0],
        permissions:
          accountType === 'ADMIN'
            ? [...DEMO_STAFF_ACCOUNTS.ADMIN.permissions]
            : [...DEMO_STAFF_ACCOUNTS.STAFF.permissions],
        photo_url:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      staffAccounts = [createdStaff, ...staffAccounts];

      // Rule: Staff account created -> notify Admin
      getAdminAccounts().forEach((adm) => {
        pushNotification({
          event_type: 'STAFF_ACCOUNT_CREATED',
          recipient_user_id: adm.id,
          target_role: 'ADMIN',
          title: `New ${accountType} Account Created: ${createdStaff.name}`,
          message: `${createdStaff.name} (${createdStaff.roll_number}) provisioned in ${createdStaff.department}.`,
          type: 'success',
          link: '/dashboard/user-management',
          dedupe_key: `STAFF_ACCOUNT_CREATED:${adm.id}:${createdStaff.id}`,
        });
      });

      persistAll();
      return createdStaff;
    }

    // Create Student Account
    const isVerified = Boolean(payload.cgpa_verified ?? false);
    const createdStudent = {
      id: `std-${Date.now().toString().slice(-4)}`,
      roll_number: payload.roll_number || `21CS${Math.floor(120 + Math.random() * 80)}`,
      name: payload.name || 'New Student Candidate',
      email: payload.email || 'student@example.edu',
      phone: payload.phone || '+91 98765 11111',
      role: 'STUDENT',
      account_status: 'ACTIVE',
      cgpa: Number(payload.cgpa ?? 8.4),
      cgpa_verified: isVerified,
      active_backlogs: Number(payload.active_backlogs ?? 0),
      department: payload.department || 'Computer Science',
      resume_url:
        payload.resume_url ||
        `https://placetrack.edu/resumes/${payload.roll_number || 'student'}_Resume.pdf`,
      photo_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      skill_proficiencies: payload.skill_proficiencies || [
        { name: 'React', level: 'Intermediate' },
        { name: 'Python', level: 'Intermediate' },
      ],
      skills: payload.skills || ['React', 'Python'],
      placement_status: 'Unplaced',
      placed: false,
      placed_company: null,
      placed_package: null,
      placedCompany: null,
      placedPackage: null,
    };
    students = [createdStudent, ...students];

    // Rule: Student record needs verification -> notify responsible staff
    if (!createdStudent.cgpa_verified) {
      getResponsibleStaffAccounts(createdStudent.department).forEach((stf) => {
        pushNotification({
          event_type: 'STUDENT_VERIFICATION_REQUIRED',
          recipient_user_id: stf.id,
          target_role: 'STAFF',
          title: `Student Record Needs Verification: ${createdStudent.name}`,
          message: `${createdStudent.name} (${createdStudent.roll_number} · ${createdStudent.department}) requires CGPA (${createdStudent.cgpa}) verification.`,
          type: 'warning',
          link: '/dashboard/students',
          dedupe_key: `STUDENT_VERIFICATION_REQUIRED:${stf.id}:${createdStudent.id}`,
        });
      });
    }

    persistAll();
    return createdStudent;
  },

  async updateUserAccount(id, roleType, payload) {
    await delay(100);
    if (roleType === 'STAFF' || roleType === 'ADMIN') {
      let updated = null;
      staffAccounts = staffAccounts.map((st) => {
        if (st.id === id) {
          updated = { ...st, ...payload };
          return updated;
        }
        return st;
      });
      persistAll();
      return updated;
    }

    let updatedStudent = null;
    students = students.map((s) => {
      if (s.id === id) {
        updatedStudent = {
          ...s,
          ...payload,
          cgpa: payload.cgpa !== undefined ? Number(payload.cgpa) : s.cgpa,
          active_backlogs:
            payload.active_backlogs !== undefined
              ? Number(payload.active_backlogs)
              : s.active_backlogs,
        };
        return updatedStudent;
      }
      return s;
    });
    persistAll();
    return updatedStudent;
  },

  async toggleUserAccountStatus(id, roleType = 'STUDENT') {
    await delay(90);
    if (roleType === 'STAFF' || roleType === 'ADMIN') {
      let toggled = null;
      staffAccounts = staffAccounts.map((st) => {
        if (st.id === id) {
          const nextStatus = st.account_status === 'DEACTIVATED' ? 'ACTIVE' : 'DEACTIVATED';
          toggled = { ...st, account_status: nextStatus };
          return toggled;
        }
        return st;
      });
      persistAll();
      return toggled;
    }

    let toggledStudent = null;
    students = students.map((s) => {
      if (s.id === id) {
        const nextStatus = s.account_status === 'DEACTIVATED' ? 'ACTIVE' : 'DEACTIVATED';
        toggledStudent = { ...s, account_status: nextStatus };
        return toggledStudent;
      }
      return s;
    });
    persistAll();
    return toggledStudent;
  },

  // Placement Policies (Admin)
  async getPolicies() {
    await delay(60);
    return { ...policies };
  },

  async updatePolicies(nextPolicies) {
    await delay(110);
    policies = {
      ...policies,
      ...nextPolicies,
      last_updated_at: new Date().toISOString().split('T')[0],
    };

    // Rule: Demo system policy changed -> notify Admin
    getAdminAccounts().forEach((adm) => {
      pushNotification({
        event_type: 'POLICY_CHANGED',
        recipient_user_id: adm.id,
        target_role: 'ADMIN',
        title: `Placement Policy Updated (${policies.academic_year})`,
        message: `Single-offer lock: ${policies.single_offer_policy ? 'Enabled' : 'Disabled'} · Dream ≥ ${policies.dream_tier_min_lpa} LPA · Super Dream ≥ ${policies.super_dream_tier_min_lpa} LPA.`,
        type: 'info',
        link: '/dashboard/policies',
        dedupe_key: `POLICY_CHANGED:${adm.id}:${policies.single_offer_policy}:${policies.dream_tier_min_lpa}:${policies.super_dream_tier_min_lpa}:${policies.institutional_min_cgpa}`,
      });
    });

    persistAll();
    return { ...policies };
  },

  // Students
  async getStudents() {
    await delay(70);
    return [...students];
  },

  async getStudentById(id) {
    await delay(60);
    const found = students.find((s) => s.id === id);
    if (!found) return null;
    return { ...found, role: 'STUDENT' };
  },

  async updateStudentProfile(id, payload) {
    await delay(100);
    let updatedStudent = null;
    students = students.map((s) => {
      if (s.id !== id) return s;
      const skillProficiencies =
        payload.skill_proficiencies || s.skill_proficiencies || [];
      const skillNames = skillProficiencies.map((sp) =>
        typeof sp === 'string' ? sp : sp.name
      );
      updatedStudent = {
        ...s,
        ...payload,
        skill_proficiencies: skillProficiencies,
        skills: payload.skills || skillNames,
      };
      return updatedStudent;
    });

    // If student record is unverified and updated their profile/resume, notify responsible staff
    if (updatedStudent && !updatedStudent.cgpa_verified) {
      getResponsibleStaffAccounts(updatedStudent.department).forEach((stf) => {
        pushNotification({
          event_type: 'STUDENT_VERIFICATION_REQUIRED',
          recipient_user_id: stf.id,
          target_role: 'STAFF',
          title: `Student Profile Pending Verification: ${updatedStudent.name}`,
          message: `${updatedStudent.name} (${updatedStudent.roll_number}) updated profile credentials and awaits CDC CGPA verification.`,
          type: 'warning',
          link: '/dashboard/students',
          dedupe_key: `STUDENT_VERIFICATION_REQUIRED:${stf.id}:${updatedStudent.id}:profile`,
        });
      });
    }

    persistAll();
    return updatedStudent;
  },

  async updateStudentSkills(id, skillsOrProficiencies) {
    await delay(100);
    students = students.map((s) => {
      if (s.id !== id) return s;
      const normalizedProficiencies = skillsOrProficiencies.map((item) => {
        if (typeof item === 'object' && item !== null) return item;
        const existing = (s.skill_proficiencies || []).find(
          (p) => p.name.toLowerCase() === String(item).toLowerCase()
        );
        return existing || { name: String(item), level: 'Intermediate' };
      });
      const skillNames = normalizedProficiencies.map((p) => p.name);
      return {
        ...s,
        skill_proficiencies: normalizedProficiencies,
        skills: skillNames,
      };
    });
    persistAll();
    return students.find((s) => s.id === id);
  },

  async toggleStudentCgpaVerified(id) {
    await delay(90);
    let updatedStudent = null;
    students = students.map((s) => {
      if (s.id === id) {
        updatedStudent = { ...s, cgpa_verified: !s.cgpa_verified };
        return updatedStudent;
      }
      return s;
    });
    if (updatedStudent) {
      if (updatedStudent.cgpa_verified) {
        // Notify student that their CGPA has been verified
        pushNotification({
          event_type: 'STUDENT_VERIFIED',
          recipient_user_id: updatedStudent.id,
          target_role: 'STUDENT',
          student_id: updatedStudent.id,
          title: `CDC Academic Profile Verified`,
          message: `Your CGPA (${updatedStudent.cgpa}) and backlog record (${updatedStudent.active_backlogs}) have been verified by Placement Staff.`,
          type: 'success',
          link: '/dashboard/profile',
          dedupe_key: `STUDENT_VERIFIED:${updatedStudent.id}:true`,
        });
      } else {
        // Rule: Student record needs verification -> notify responsible staff
        getResponsibleStaffAccounts(updatedStudent.department).forEach((stf) => {
          pushNotification({
            event_type: 'STUDENT_VERIFICATION_REQUIRED',
            recipient_user_id: stf.id,
            target_role: 'STAFF',
            title: `Verification Required: ${updatedStudent.name}`,
            message: `${updatedStudent.name} (${updatedStudent.roll_number} · ${updatedStudent.department}) is marked Unverified and requires transcript review.`,
            type: 'warning',
            link: '/dashboard/students',
            dedupe_key: `STUDENT_VERIFICATION_REQUIRED:${stf.id}:${updatedStudent.id}:unverified`,
          });
        });
      }
    }
    persistAll();
    return updatedStudent;
  },

  async promoteStudentsToNextRound(studentIds = []) {
    await delay(120);
    const roundOrder = ['Online Test', 'Technical 1', 'Technical 2', 'HR', 'Offer'];

    students = students.map((s) => {
      if (!studentIds.includes(s.id)) return s;
      if (s.placement_status === 'Unplaced') {
        return { ...s, placement_status: 'In Interview' };
      }
      return s;
    });

    applications = applications.map((app) => {
      const sid = app.student_id || app.studentId;
      if (!studentIds.includes(sid)) return app;
      const currentRoundName =
        app.current_round || app.currentRound || 'Online Test';
      const idx = Math.max(0, roundOrder.indexOf(currentRoundName));
      const nextIdx = Math.min(roundOrder.length - 1, idx + 1);
      const nextRoundName = roundOrder[nextIdx];
      const nextStatus =
        nextIdx === roundOrder.length - 1
          ? 'SELECTED'
          : nextIdx >= 1
          ? 'INTERVIEW'
          : 'SHORTLISTED';

      const updatedRounds = (
        app.rounds || buildStandardRounds(nextIdx, app.company)
      ).map((r, rIdx) => ({
        ...r,
        result:
          rIdx < nextIdx
            ? 'PASSED'
            : rIdx === nextIdx && nextStatus === 'SELECTED'
            ? 'PASSED'
            : 'PENDING',
      }));

      // Rule: Application shortlisted or advanced -> notify the affected student
      pushNotification({
        event_type: 'APPLICATION_SHORTLISTED',
        recipient_user_id: sid,
        target_role: 'STUDENT',
        student_id: sid,
        title: `Shortlisted for ${nextRoundName}: ${app.company}`,
        message: `Your application for ${app.job?.title || app.company} advanced to ${nextRoundName} (${nextStatus}).`,
        type: nextStatus === 'SELECTED' ? 'placement' : 'success',
        related_application_id: app.id,
        related_drive_id: app.job_id || app.jobId,
        link: '/dashboard/my-applications',
        dedupe_key: `APPLICATION_SHORTLISTED:${sid}:${app.id}:${nextRoundName}`,
      });

      return {
        ...app,
        status: nextStatus,
        current_round: nextRoundName,
        currentRound: nextRoundName,
        rounds: updatedRounds,
        last_update: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
      };
    });

    persistAll();
    return { students: [...students], applications: [...applications] };
  },

  // Jobs
  async getJobs() {
    await delay(70);
    return [...jobs];
  },

  async getJobById(id) {
    await delay(60);
    const found = jobs.find((j) => j.id === id);
    if (!found) throw new Error('Job not found');
    return { ...found };
  },

  async createJob(newJob) {
    await delay(120);
    const minLpa = Number(newJob.package_min_lpa ?? newJob.package_lpa ?? 12);
    const maxLpa = Number(newJob.package_max_lpa ?? newJob.package_lpa ?? minLpa);
    const requiredSkills = Array.isArray(newJob.required_skills)
      ? newJob.required_skills
      : (newJob.skills || []).map((s) =>
          typeof s === 'object' ? s : { name: s, level: 'Intermediate' }
        );
    const allowedBranches =
      newJob.allowed_branches ||
      newJob.eligibleDepartments || ['Computer Science', 'Information Tech.'];

    const created = {
      id: `job-${Date.now()}`,
      title: newJob.title,
      company: newJob.company,
      package_lpa: maxLpa,
      package_min_lpa: minLpa,
      package_max_lpa: maxLpa,
      min_cgpa: Number(newJob.min_cgpa ?? 7.5),
      max_backlogs: Number(newJob.max_backlogs ?? 0),
      drive_date: newJob.drive_date || '2026-11-25',
      deadline: newJob.deadline || '2026-11-20',
      location: newJob.location || 'Bangalore, India',
      tier: newJob.tier || 'Dream',
      status: newJob.status || 'OPEN',
      allowed_branches: allowedBranches,
      eligibleDepartments: allowedBranches,
      required_skills: requiredSkills,
      skills: requiredSkills.map((s) => s.name),
      description:
        newJob.description ||
        'Campus recruitment drive configured via PlaceTrack CDC administration portal.',
      openings: Number(newJob.openings ?? 6),
      applied_count: 0,
      appliedCount: 0,
    };
    jobs.unshift(created);

    // Rule: New recruitment drive -> notify ONLY eligible students
    students
      .filter((std) => std.account_status !== 'DEACTIVATED')
      .forEach((std) => {
        const evalRes = checkEligibility(std, created);
        if (evalRes.eligible) {
          pushNotification({
            event_type: 'DRIVE_CREATED',
            recipient_user_id: std.id,
            target_role: 'STUDENT',
            student_id: std.id,
            title: `New ${created.tier} Drive Matching Your Profile: ${created.company}`,
            message: `You are eligible (${evalRes.matchPercent}% Match) for ${created.title} (${minLpa}–${maxLpa} LPA). Apply by ${created.deadline}.`,
            type: 'info',
            related_drive_id: created.id,
            link: '/dashboard/jobs',
            dedupe_key: `DRIVE_CREATED:${std.id}:${created.id}`,
          });
        }
      });

    persistAll();
    return created;
  },

  async updateJob(jobId, updates) {
    await delay(110);
    let updatedJob = null;
    jobs = jobs.map((j) => {
      if (j.id !== jobId) return j;
      const minLpa = Number(updates.package_min_lpa ?? j.package_min_lpa ?? j.package_lpa);
      const maxLpa = Number(updates.package_max_lpa ?? j.package_max_lpa ?? j.package_lpa);
      const requiredSkills = Array.isArray(updates.required_skills)
        ? updates.required_skills
        : j.required_skills || [];
      const allowedBranches =
        updates.allowed_branches || j.allowed_branches || j.eligibleDepartments || [];
      updatedJob = {
        ...j,
        ...updates,
        package_min_lpa: minLpa,
        package_max_lpa: maxLpa,
        package_lpa: maxLpa,
        min_cgpa: Number(updates.min_cgpa ?? j.min_cgpa),
        max_backlogs: Number(updates.max_backlogs ?? j.max_backlogs ?? 0),
        allowed_branches: allowedBranches,
        eligibleDepartments: allowedBranches,
        required_skills: requiredSkills,
        skills: requiredSkills.map((s) => s.name),
      };
      return updatedJob;
    });
    if (updatedJob && (updatedJob.status || 'OPEN') === 'OPEN') {
      students
        .filter((std) => std.account_status !== 'DEACTIVATED')
        .forEach((std) => {
          const evalRes = checkEligibility(std, updatedJob);
          if (evalRes.eligible) {
            pushNotification({
              event_type: 'DRIVE_CREATED',
              recipient_user_id: std.id,
              target_role: 'STUDENT',
              student_id: std.id,
              title: `Drive Updated: ${updatedJob.company}`,
              message: `${updatedJob.title} (${updatedJob.package_lpa} LPA) criteria updated. You are eligible (${evalRes.matchPercent}% Match).`,
              type: 'info',
              related_drive_id: updatedJob.id,
              link: '/dashboard/jobs',
              dedupe_key: `DRIVE_UPDATED:${std.id}:${updatedJob.id}:${updatedJob.min_cgpa}:${updatedJob.package_lpa}`,
            });
          }
        });
    }
    persistAll();
    return updatedJob;
  },

  // Applications, Timeline Stepper, Valid Transitions & Status History
  getValidApplicationTransitions(currentStatus = 'APPLIED', job = null) {
    const hasAssessment = job?.recruitment_process?.has_assessment !== false;
    const transitionsMap = {
      APPLIED: ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED'],
      UNDER_REVIEW: hasAssessment
        ? ['SHORTLISTED', 'ASSESSMENT', 'REJECTED']
        : ['SHORTLISTED', 'INTERVIEW', 'REJECTED'],
      SHORTLISTED: hasAssessment
        ? ['ASSESSMENT', 'INTERVIEW', 'REJECTED']
        : ['INTERVIEW', 'REJECTED'],
      ASSESSMENT: ['INTERVIEW', 'REJECTED'],
      INTERVIEW: ['INTERVIEW', 'SELECTED', 'REJECTED'],
      SELECTED: ['OFFER_RELEASED'],
      OFFER_RELEASED: ['OFFER_ACCEPTED', 'OFFER_DECLINED', 'OFFER_EXPIRED'],
      OFFER_ACCEPTED: [],
      OFFER_DECLINED: [],
      OFFER_EXPIRED: [],
      REJECTED: [],
    };
    return transitionsMap[currentStatus] || ['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];
  },

  _enrichApplication(app) {
    const sid = app.student_id || app.studentId;
    const jid = app.job_id || app.jobId;
    const liveStudent =
      students.find((s) => s.id === sid) ||
      app.student ||
      students.find((s) => s.id === 'student-rohit') ||
      students[0];
    const liveJob =
      jobs.find((j) => j.id === jid) ||
      jobs.find((j) => j.company.toLowerCase() === (app.company || '').toLowerCase()) ||
      app.job ||
      jobs[0];

    const eligibility =
      liveStudent && liveJob
        ? checkEligibility(liveStudent, liveJob)
        : { eligible: true, matchPercent: 90, rules: [], failedRules: [] };

    const appInterviews = interviews.filter(
      (i) => (i.application_id || i.applicationId) === app.id
    );
    const activeOrUpcomingInterview =
      appInterviews.find(
        (i) => i.result === 'PENDING' && i.attendance !== 'CANCELLED'
      ) ||
      appInterviews[0] ||
      null;

    const linkedOffer =
      offers.find(
        (o) =>
          o.student_id === sid &&
          o.company.toLowerCase() === (app.company || '').toLowerCase()
      ) || null;

    // Synchronize derived offer status into application status if an offer exists
    let effectiveStatus = app.status || 'APPLIED';
    if (linkedOffer) {
      if (linkedOffer.offer_status === 'ACCEPTED') {
        effectiveStatus = 'OFFER_ACCEPTED';
      } else if (linkedOffer.offer_status === 'DECLINED') {
        effectiveStatus = 'OFFER_DECLINED';
      } else if (linkedOffer.offer_status === 'EXPIRED') {
        effectiveStatus = 'OFFER_EXPIRED';
      } else if (
        effectiveStatus === 'SELECTED' &&
        linkedOffer.offer_status === 'PENDING'
      ) {
        effectiveStatus = 'OFFER_RELEASED';
      }
    }

    // Build drive-specific applicable stages (only stages that apply to this recruitment drive)
    const hasAssessment = liveJob?.recruitment_process?.has_assessment !== false;
    const assessmentName =
      liveJob?.recruitment_process?.assessment_name || 'Online Assessment';
    const interviewRoundNames = Array.isArray(
      liveJob?.recruitment_process?.interview_rounds
    )
      ? liveJob.recruitment_process.interview_rounds
      : ['Technical 1', 'Technical 2', 'HR'];

    const rawStages = [
      {
        key: 'APPLIED',
        label: 'Applied',
        subtitle: `Submitted for ${liveJob?.title || app.company}`,
        defaultTime: app.applied_date || app.appliedDate || '2026-10-10',
      },
      {
        key: 'UNDER_REVIEW',
        label: 'Under Review',
        subtitle: 'TPO & Recruiter screening',
      },
      {
        key: 'SHORTLISTED',
        label: 'Shortlisted',
        subtitle: hasAssessment
          ? 'Cleared for Online Assessment'
          : 'Direct portfolio shortlist',
      },
    ];

    if (hasAssessment) {
      rawStages.push({
        key: 'ASSESSMENT',
        label: 'Assessment',
        subtitle: assessmentName,
      });
    }

    if (interviewRoundNames.length > 0) {
      rawStages.push({
        key: 'INTERVIEW',
        label: `Interview Rounds (${interviewRoundNames.length})`,
        subtitle: interviewRoundNames.join(' → '),
      });
    }

    rawStages.push(
      {
        key: 'FINAL_RESULT',
        label: 'Final Result',
        subtitle: 'Selection panel outcome',
      },
      {
        key: 'OFFER_RELEASED',
        label: 'Offer Released',
        subtitle: linkedOffer
          ? `${linkedOffer.package_lpa} LPA (${linkedOffer.tier})`
          : `${liveJob?.package_lpa || ''} LPA Offer`,
      },
      {
        key: 'OFFER_DECISION',
        label:
          effectiveStatus === 'OFFER_ACCEPTED'
            ? 'Offer Accepted'
            : effectiveStatus === 'OFFER_DECLINED'
            ? 'Offer Declined'
            : effectiveStatus === 'OFFER_EXPIRED'
            ? 'Offer Expired'
            : 'Offer Decision',
        subtitle:
          effectiveStatus === 'OFFER_ACCEPTED'
            ? `Joining ${linkedOffer?.joining_date || 'Confirmed'}`
            : effectiveStatus === 'OFFER_DECLINED'
            ? 'Declined by candidate'
            : effectiveStatus === 'OFFER_EXPIRED'
            ? 'Decision window closed'
            : 'Accept or Decline offer',
      }
    );

    // Map effectiveStatus to current stage index accurately without falsely marking future stages complete
    const stageKeys = rawStages.map((s) => s.key);
    const findIdx = (k) => stageKeys.indexOf(k);

    let completedUpToIdx = -1;
    let currentIdx = -1;
    let rejectedIdx = -1;
    let cancelledIdx = -1;

    if (effectiveStatus === 'APPLIED') {
      completedUpToIdx = findIdx('APPLIED');
      currentIdx = findIdx('UNDER_REVIEW');
    } else if (effectiveStatus === 'UNDER_REVIEW') {
      completedUpToIdx = findIdx('APPLIED');
      currentIdx = findIdx('UNDER_REVIEW');
    } else if (effectiveStatus === 'SHORTLISTED') {
      completedUpToIdx = findIdx('SHORTLISTED');
      currentIdx = hasAssessment ? findIdx('ASSESSMENT') : findIdx('INTERVIEW');
    } else if (effectiveStatus === 'ASSESSMENT') {
      completedUpToIdx = findIdx('SHORTLISTED');
      currentIdx = findIdx('ASSESSMENT');
    } else if (effectiveStatus === 'INTERVIEW') {
      completedUpToIdx = hasAssessment
        ? findIdx('ASSESSMENT')
        : findIdx('SHORTLISTED');
      currentIdx = findIdx('INTERVIEW');
    } else if (effectiveStatus === 'SELECTED') {
      completedUpToIdx = findIdx('FINAL_RESULT');
      currentIdx = findIdx('OFFER_RELEASED');
    } else if (effectiveStatus === 'OFFER_RELEASED') {
      completedUpToIdx = findIdx('OFFER_RELEASED');
      currentIdx = findIdx('OFFER_DECISION');
    } else if (effectiveStatus === 'OFFER_ACCEPTED') {
      completedUpToIdx = findIdx('OFFER_DECISION');
      currentIdx = -1;
    } else if (effectiveStatus === 'OFFER_DECLINED') {
      completedUpToIdx = findIdx('OFFER_RELEASED');
      rejectedIdx = findIdx('OFFER_DECISION');
    } else if (effectiveStatus === 'OFFER_EXPIRED') {
      completedUpToIdx = findIdx('OFFER_RELEASED');
      cancelledIdx = findIdx('OFFER_DECISION');
    } else if (effectiveStatus === 'REJECTED') {
      const rejStageKey = app.rejected_at_stage || 'SHORTLISTED';
      const targetRejIdx =
        findIdx(rejStageKey) !== -1
          ? findIdx(rejStageKey)
          : findIdx('SHORTLISTED');
      completedUpToIdx = Math.max(0, targetRejIdx - 1);
      rejectedIdx = targetRejIdx;
    }

    const historyList = Array.isArray(app.status_history)
      ? app.status_history
      : [];

    const timelineStages = rawStages.map((stg, idx) => {
      let state = 'UPCOMING';
      let stateLabel = 'Upcoming';
      if (idx === rejectedIdx) {
        state = 'REJECTED';
        stateLabel = stg.key === 'OFFER_DECISION' ? 'Declined' : 'Rejected';
      } else if (idx === cancelledIdx) {
        state = 'CANCELLED';
        stateLabel = 'Expired';
      } else if (rejectedIdx !== -1 && idx > rejectedIdx) {
        state = 'CANCELLED';
        stateLabel = 'Closed';
      } else if (idx <= completedUpToIdx) {
        state = 'COMPLETED';
        stateLabel = 'Completed';
      } else if (idx === currentIdx) {
        state = 'CURRENT';
        stateLabel = 'Current';
      }

      // Attach accurate timestamp if completed/current/rejected
      const matchedHist = historyList.find(
        (h) =>
          h.status === stg.key ||
          (stg.key === 'OFFER_DECISION' &&
            ['OFFER_ACCEPTED', 'OFFER_DECLINED', 'OFFER_EXPIRED'].includes(h.status)) ||
          (stg.key === 'FINAL_RESULT' && h.status === 'SELECTED')
      );

      let timestamp = matchedHist?.timestamp || stg.defaultTime || '';
      if (!timestamp) {
        if (state === 'COMPLETED') {
          timestamp = app.last_update || app.applied_date || 'Completed';
        } else if (state === 'CURRENT') {
          timestamp =
            stg.key === 'INTERVIEW' && activeOrUpcomingInterview
              ? `${activeOrUpcomingInterview.date} · ${activeOrUpcomingInterview.reporting_time}`
              : 'In Progress';
        } else if (state === 'REJECTED') {
          timestamp = app.last_update || 'Closed';
        } else {
          timestamp = 'Upcoming';
        }
      }

      let subtitle = stg.subtitle;
      if (stg.key === 'INTERVIEW' && state === 'CURRENT') {
        subtitle = `Active: ${app.current_round || 'Technical 1'}${
          activeOrUpcomingInterview
            ? ` (${activeOrUpcomingInterview.date}, ${activeOrUpcomingInterview.reporting_time})`
            : ''
        }`;
      }

      return {
        ...stg,
        state,
        state_label: stateLabel,
        subtitle,
        timestamp,
      };
    });

    // Compute clear Next Required Action for Student & Staff
    let nextRequiredAction = {
      title: 'Application Under Review',
      description:
        'Your application is in the TPO & Recruiter verification queue. No immediate action is required from you.',
      badge: 'Awaiting TPO Action',
      urgent: false,
      cta_label: null,
      cta_route: null,
    };

    if (effectiveStatus === 'ASSESSMENT' || (effectiveStatus === 'SHORTLISTED' && hasAssessment)) {
      nextRequiredAction = {
        title: `Complete ${assessmentName}`,
        description: `You are shortlisted for ${app.company}. Complete the proctored assessment before the drive deadline (${liveJob?.deadline || '2026-11-15'}).`,
        badge: 'Assessment Required',
        urgent: true,
        cta_label: 'View Assessment Details',
        cta_route: '/dashboard/my-applications',
      };
    } else if (effectiveStatus === 'INTERVIEW' || (effectiveStatus === 'SHORTLISTED' && !hasAssessment)) {
      if (activeOrUpcomingInterview) {
        nextRequiredAction = {
          title: `Attend ${activeOrUpcomingInterview.round_name} Interview on ${activeOrUpcomingInterview.date}`,
          description: `Report by ${activeOrUpcomingInterview.reporting_time} ${
            activeOrUpcomingInterview.timezone || 'IST (UTC+5:30)'
          } · Mode: ${
            activeOrUpcomingInterview.mode === 'IN_PERSON' ? 'In-Person' : 'Online'
          } (${activeOrUpcomingInterview.venue}).`,
          badge: 'Upcoming Interview',
          urgent: true,
          cta_label: 'Open Interview Schedule',
          cta_route: '/dashboard/my-interviews',
        };
      } else {
        nextRequiredAction = {
          title: `Awaiting ${app.current_round || 'Technical'} Slot Assignment`,
          description:
            'You cleared the previous round. Placement Staff (TPO) is assigning your interview slot and panel.',
          badge: 'Slot Pending',
          urgent: false,
          cta_label: 'Check Interview Calendar',
          cta_route: '/dashboard/my-interviews',
        };
      }
    } else if (effectiveStatus === 'SELECTED') {
      nextRequiredAction = {
        title: 'Selected — Awaiting Official Offer Letter Release',
        description:
          'You have cleared all interview rounds! The TPO Offer Desk is finalizing your compensation breakdown.',
        badge: 'Offer Processing',
        urgent: false,
        cta_label: 'Check My Offers',
        cta_route: '/dashboard/my-placement',
      };
    } else if (effectiveStatus === 'OFFER_RELEASED') {
      nextRequiredAction = {
        title: `Respond to ${app.company} Offer (${linkedOffer?.package_lpa || liveJob?.package_lpa} LPA · ${linkedOffer?.tier || liveJob?.tier})`,
        description:
          'Review Base, Bonus, and ESOP breakdown and formally Accept or Decline within the CDC decision window.',
        badge: 'Decision Required',
        urgent: true,
        cta_label: 'Review & Decide on Offer',
        cta_route: '/dashboard/my-placement',
      };
    } else if (effectiveStatus === 'OFFER_ACCEPTED') {
      nextRequiredAction = {
        title: `Offer Accepted (${linkedOffer?.package_lpa || liveJob?.package_lpa} LPA)`,
        description: `Your placement at ${app.company} is verified. Proposed joining date: ${
          linkedOffer?.joining_date || 'July 15, 2027'
        }.`,
        badge: 'Placement Confirmed',
        urgent: false,
        cta_label: 'View Verified Offer',
        cta_route: '/dashboard/my-placement',
      };
    } else if (effectiveStatus === 'OFFER_DECLINED') {
      nextRequiredAction = {
        title: 'Offer Declined by Candidate',
        description: `You formally declined the offer from ${app.company}.`,
        badge: 'Closed',
        urgent: false,
        cta_label: null,
        cta_route: null,
      };
    } else if (effectiveStatus === 'OFFER_EXPIRED') {
      nextRequiredAction = {
        title: 'Offer Decision Window Expired',
        description: `The offer decision deadline for ${app.company} has elapsed.`,
        badge: 'Expired',
        urgent: false,
        cta_label: null,
        cta_route: null,
      };
    } else if (effectiveStatus === 'REJECTED') {
      nextRequiredAction = {
        title: 'Application Closed (Not Selected)',
        description:
          app.feedback ||
          'You did not advance to the next stage for this drive. Explore other eligible open drives.',
        badge: 'Closed',
        urgent: false,
        cta_label: 'Browse Eligible Drives',
        cta_route: '/dashboard/jobs',
      };
    }

    return {
      ...app,
      status: effectiveStatus,
      student: liveStudent
        ? {
            ...app.student,
            id: liveStudent.id,
            name: liveStudent.name,
            roll_number: liveStudent.roll_number,
            email: liveStudent.email,
            cgpa: liveStudent.cgpa,
            cgpa_verified: liveStudent.cgpa_verified,
            active_backlogs: liveStudent.active_backlogs,
            department: liveStudent.department,
            avatar: liveStudent.avatar,
            skills: liveStudent.skills,
          }
        : app.student,
      job: liveJob
        ? {
            ...app.job,
            ...liveJob,
          }
        : app.job,
      eligibility,
      linked_interviews: appInterviews,
      upcoming_interview: activeOrUpcomingInterview,
      linked_offer: linkedOffer,
      timeline_stages: timelineStages,
      next_required_action: nextRequiredAction,
      valid_transitions: this.getValidApplicationTransitions(effectiveStatus, liveJob),
      status_history:
        historyList.length > 0
          ? historyList
          : [
              {
                id: `hist-${app.id}-init`,
                status: 'APPLIED',
                stage_label: 'Application Submitted',
                timestamp: `${app.applied_date || '2026-10-10'} 10:00 IST`,
                actor: liveStudent?.name || 'Candidate',
                explanation: `Submitted application for ${liveJob?.title || app.company}.`,
              },
            ],
    };
  },

  async getApplications() {
    await delay(70);
    return applications.map((app) => this._enrichApplication(app));
  },

  async getApplicationById(id) {
    await delay(60);
    const found = applications.find((a) => a.id === id);
    if (!found) throw new Error('Application not found');
    return this._enrichApplication(found);
  },

  async updateApplicationStatus(
    id,
    newStatus,
    customFeedback = null,
    options = {}
  ) {
    await delay(100);
    if (customFeedback && typeof customFeedback === 'object') {
      options = { ...customFeedback, ...options };
      customFeedback = customFeedback.explanation || customFeedback.feedback || null;
    }
    let updatedApp = null;
    const statusToRoundIdx = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 1,
      ASSESSMENT: 1,
      INTERVIEW: 2,
      SELECTED: 4,
      OFFER_RELEASED: 4,
      OFFER_ACCEPTED: 4,
      OFFER_DECLINED: 4,
      OFFER_EXPIRED: 4,
      REJECTED: 1,
    };
    const roundNames = ['Online Test', 'Technical 1', 'Technical 2', 'HR', 'Offer'];
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`;

    applications = applications.map((app) => {
      if (app.id === id) {
        const rIdx = statusToRoundIdx[newStatus] ?? 1;
        const targetRoundName =
          options.round_name ||
          (newStatus === 'INTERVIEW' && app.current_round && app.current_round !== 'Online Test'
            ? app.current_round
            : roundNames[rIdx]);

        const rounds = (app.rounds || buildStandardRounds(rIdx, app.company)).map(
          (r, idx) => ({
            ...r,
            result:
              newStatus === 'REJECTED' && idx === rIdx
                ? 'FAILED'
                : idx < rIdx ||
                  (['SELECTED', 'OFFER_RELEASED', 'OFFER_ACCEPTED'].includes(newStatus) &&
                    idx <= 4)
                ? 'PASSED'
                : 'PENDING',
          })
        );

        const defaultExplanation =
          customFeedback ||
          (newStatus === 'UNDER_REVIEW'
            ? 'Application moved to TPO & Recruiter verification review.'
            : newStatus === 'SHORTLISTED'
            ? 'Candidate shortlisted after meeting academic & skill criteria.'
            : newStatus === 'ASSESSMENT'
            ? 'Candidate assigned to Online Assessment round.'
            : newStatus === 'INTERVIEW'
            ? `Candidate advanced to ${targetRoundName} interview stage.`
            : newStatus === 'SELECTED'
            ? 'Cleared all technical and HR evaluation panels. Final selection confirmed.'
            : newStatus === 'OFFER_RELEASED'
            ? 'Official placement offer released to student portal.'
            : newStatus === 'REJECTED'
            ? 'Did not meet benchmark cutoff in current evaluation stage.'
            : `Application status updated to ${newStatus}.`);

        const prevHistory = Array.isArray(app.status_history)
          ? app.status_history
          : [];

        const rejectedAtStage =
          newStatus === 'REJECTED'
            ? options.rejected_at_stage ||
              (app.status === 'INTERVIEW'
                ? 'INTERVIEW'
                : app.status === 'ASSESSMENT'
                ? 'ASSESSMENT'
                : app.status === 'SELECTED'
                ? 'FINAL_RESULT'
                : 'SHORTLISTED')
            : app.rejected_at_stage;

        const newHistEntry = {
          id: `hist-${app.id}-${Date.now()}`,
          status: newStatus,
          stage_label: options.stage_label || `Moved to ${newStatus.replace(/_/g, ' ')}`,
          timestamp: nowStamp,
          actor: options.actor || 'Raghav Menon (TPO)',
          explanation: defaultExplanation,
        };

        updatedApp = {
          ...app,
          status: newStatus,
          rejected_at_stage: rejectedAtStage,
          current_round: targetRoundName,
          currentRound: targetRoundName,
          rounds,
          feedback: defaultExplanation,
          last_update: nowStamp,
          lastUpdate: nowStamp,
          status_history: [...prevHistory, newHistEntry],
        };
        return updatedApp;
      }
      return app;
    });

    if (updatedApp) {
      const sid = updatedApp.student_id || updatedApp.studentId;
      if (['INTERVIEW', 'SHORTLISTED', 'ASSESSMENT'].includes(newStatus)) {
        students = students.map((s) =>
          s.id === sid && !s.placed ? { ...s, placement_status: 'In Interview' } : s
        );
      }

      // Rule: Application status changed -> notify the affected student
      const evtType =
        newStatus === 'REJECTED'
          ? 'APPLICATION_REJECTED'
          : 'APPLICATION_SHORTLISTED';

      pushNotification({
        event_type: evtType,
        recipient_user_id: sid,
        target_role: 'STUDENT',
        student_id: sid,
        title:
          newStatus === 'REJECTED'
            ? `Application Update: ${updatedApp.company} (Not Selected)`
            : `Application Stage Updated: ${updatedApp.company} (${newStatus.replace(/_/g, ' ')})`,
        message: `${updatedApp.feedback || `Your application for ${updatedApp.job?.title || updatedApp.company} is now ${newStatus.replace(/_/g, ' ')}.`}`,
        type:
          newStatus === 'SELECTED' || newStatus === 'OFFER_RELEASED'
            ? 'placement'
            : newStatus === 'REJECTED'
            ? 'warning'
            : 'success',
        related_application_id: updatedApp.id,
        related_drive_id: updatedApp.job_id || updatedApp.jobId,
        link: '/dashboard/my-applications',
        dedupe_key: `${evtType}:${sid}:${updatedApp.id}:${newStatus}:${updatedApp.last_update}`,
      });
    }
    persistAll();
    return updatedApp ? this._enrichApplication(updatedApp) : null;
  },

  async applyToJob({ studentId, student_id, jobId, job_id }) {
    await delay(120);
    const targetStudentId = student_id || studentId || 'student-rohit';
    const targetJobId = job_id || jobId;
    const student =
      students.find((s) => s.id === targetStudentId) ||
      students.find((s) => s.id === 'student-rohit') ||
      students[0];
    const job = jobs.find((j) => j.id === targetJobId);
    if (!job) throw new Error('Job not found');

    const existing = applications.find(
      (a) =>
        (a.student_id || a.studentId) === student.id &&
        (a.job_id || a.jobId) === job.id
    );
    if (existing) return this._enrichApplication(existing);

    const today = new Date().toISOString().split('T')[0];
    const nowStamp = `${today} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`;
    const hasAssessment = job?.recruitment_process?.has_assessment !== false;
    const firstRound = hasAssessment
      ? 'Online Test'
      : job?.recruitment_process?.interview_rounds?.[0] || 'Technical 1';

    const newApp = {
      id: `app-${Date.now().toString().slice(-4)}`,
      student_id: student.id,
      studentId: student.id,
      student: {
        id: student.id,
        roll_number: student.roll_number,
        name: student.name,
        email: student.email,
        cgpa: student.cgpa,
        department: student.department,
        avatar: student.avatar,
      },
      job_id: job.id,
      jobId: job.id,
      job: {
        id: job.id,
        title: job.title,
        package_lpa: job.package_lpa,
        location: job.location,
      },
      company: job.company,
      status: 'APPLIED',
      current_round: firstRound,
      currentRound: firstRound,
      applied_date: today,
      appliedDate: today,
      last_update: nowStamp,
      lastUpdate: nowStamp,
      feedback:
        'Application submitted successfully to campus recruitment portal. Awaiting TPO review.',
      rounds: buildStandardRounds(0, job.company),
      status_history: [
        {
          id: `hist-apply-${Date.now()}`,
          status: 'APPLIED',
          stage_label: 'Application Submitted by Candidate',
          timestamp: nowStamp,
          actor: `${student.name} (${student.roll_number})`,
          explanation: `Applied for ${job.title} at ${job.company} (${job.package_lpa} LPA · ${job.tier} Tier).`,
        },
      ],
    };

    applications.unshift(newApp);
    job.applied_count = (job.applied_count || 0) + 1;
    job.appliedCount = job.applied_count;

    // Rule: Student applies -> notify that student AND the relevant demo placement staff
    pushNotification({
      event_type: 'APPLICATION_SUBMITTED',
      recipient_user_id: student.id,
      target_role: 'STUDENT',
      student_id: student.id,
      title: `Application Confirmed: ${job.company}`,
      message: `You applied for ${job.title} (${job.package_lpa} LPA). Current status: Applied / Under Review.`,
      type: 'success',
      related_application_id: newApp.id,
      related_drive_id: job.id,
      link: '/dashboard/my-applications',
      dedupe_key: `APPLICATION_SUBMITTED:${student.id}:${newApp.id}`,
    });

    getResponsibleStaffAccounts(student.department).forEach((stf) => {
      pushNotification({
        event_type: 'APPLICATION_SUBMITTED',
        recipient_user_id: stf.id,
        target_role: 'STAFF',
        title: `New Candidate Application: ${student.name}`,
        message: `${student.name} (${student.roll_number} · ${student.department}) applied to ${job.company} (${job.title}).`,
        type: 'info',
        related_application_id: newApp.id,
        related_drive_id: job.id,
        link: '/dashboard/applications',
        dedupe_key: `APPLICATION_SUBMITTED:${stf.id}:${newApp.id}`,
      });
    });

    persistAll();
    return this._enrichApplication(newApp);
  },

  // Interviews, Scheduling, Rescheduling, Cancellation, Attendance & Feedback (Staff / Admin / Student)
  async getInterviews(studentId = null) {
    await delay(70);
    const enriched = interviews.map((item) => ({
      timezone: 'IST (UTC+5:30)',
      mode:
        item.mode ||
        (item.venue &&
        item.venue.toLowerCase().includes('meet') &&
        !item.venue.toLowerCase().includes('room')
          ? 'ONLINE'
          : item.venue &&
            (item.venue.toLowerCase().includes('lab') ||
              item.venue.toLowerCase().includes('boardroom') ||
              item.venue.toLowerCase().includes('suite'))
          ? 'IN_PERSON'
          : 'ONLINE'),
      ...item,
    }));
    if (!studentId) return enriched;
    const normalizedSid = normalizeUserId(studentId, 'STUDENT');
    return enriched.filter((i) => normalizeUserId(i.student_id, 'STUDENT') === normalizedSid);
  },

  async scheduleInterview(payload) {
    await delay(120);
    const app = applications.find((a) => a.id === payload.application_id);
    const student =
      students.find((s) => s.id === (payload.student_id || app?.student_id)) ||
      students.find((s) => s.id === 'student-rohit') ||
      students[0];

    const mode = payload.mode || 'ONLINE';
    const timezone = payload.timezone || 'IST (UTC+5:30)';
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`;

    const newInterview = {
      id: `int-${Date.now().toString().slice(-4)}`,
      application_id: app?.id || payload.application_id || 'app-904',
      applicationId: app?.id || payload.application_id || 'app-904',
      student_id: student.id,
      student: student.name,
      roll_number: student.roll_number,
      department: student.department,
      company: payload.company || app?.company || 'TechNova Solutions',
      job_title: payload.job_title || app?.job?.title || 'Software Engineer',
      jobTitle: payload.job_title || app?.job?.title || 'Software Engineer',
      round_number: Number(payload.round_number || 2),
      round_name: payload.round_name || 'Technical 1',
      round_type: (payload.round_name || 'TECHNICAL').toUpperCase().includes('HR')
        ? 'HR'
        : 'TECHNICAL',
      date: payload.date || '2026-10-29',
      reporting_time: payload.reporting_time || '11:00 AM',
      timezone,
      mode,
      scheduled_at: `${payload.date || '2026-10-29'}T11:00:00`,
      meeting_link:
        payload.meeting_link !== undefined
          ? payload.meeting_link
          : 'https://example.com/placetrack-demo-interview/ptk-campus-panel',
      venue:
        payload.venue ||
        (mode === 'ONLINE' ? 'Virtual Room PT-104 (Online Bridge)' : 'CDC Interview Suite 2'),
      panelists: Array.isArray(payload.panelists)
        ? payload.panelists
        : String(payload.panelists || 'Senior Engineering Panel')
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean),
      interviewer: Array.isArray(payload.panelists)
        ? payload.panelists[0]
        : String(payload.panelists || 'Senior Engineering Panel').split(',')[0],
      location:
        payload.venue ||
        (mode === 'ONLINE' ? 'Google Meet Virtual Panel Room' : 'CDC Interview Suite 2'),
      attendance: 'SCHEDULED',
      feedback: payload.feedback || 'Interview slot confirmed by Placement Staff.',
      result: 'PENDING',
      statusColor: 'interview',
    };

    interviews = [newInterview, ...interviews];

    // Also synchronize the application's round details and status_history in centralized store
    if (app) {
      applications = applications.map((a) => {
        if (a.id !== app.id) return a;
        const updatedRounds = (a.rounds || []).map((r) =>
          r.round_name === newInterview.round_name ||
          r.round_number === newInterview.round_number
            ? {
                ...r,
                date: newInterview.date,
                reporting_time: newInterview.reporting_time,
                venue: newInterview.venue,
                meeting_link: newInterview.meeting_link,
                panelists: newInterview.panelists,
              }
            : r
        );
        const prevHist = Array.isArray(a.status_history) ? a.status_history : [];
        return {
          ...a,
          status: 'INTERVIEW',
          current_round: newInterview.round_name,
          currentRound: newInterview.round_name,
          rounds: updatedRounds,
          last_update: nowStamp,
          lastUpdate: nowStamp,
          feedback: `Scheduled for ${newInterview.round_name} on ${newInterview.date} at ${newInterview.reporting_time} ${timezone} (${mode === 'IN_PERSON' ? 'In-Person' : 'Online'}).`,
          status_history: [
            ...prevHist,
            {
              id: `hist-int-${Date.now()}`,
              status: 'INTERVIEW',
              stage_label: `${newInterview.round_name} Scheduled (${mode === 'IN_PERSON' ? 'In-Person' : 'Online'})`,
              timestamp: nowStamp,
              actor: 'Raghav Menon (TPO)',
              explanation: `Scheduled ${newInterview.round_name} on ${newInterview.date} at ${newInterview.reporting_time} ${timezone} · ${newInterview.venue}. Panel: ${newInterview.panelists.join(', ')}.`,
            },
          ],
        };
      });
    }

    // Rule: Interview scheduled -> notify the affected student AND responsible staff
    pushNotification({
      event_type: 'INTERVIEW_SCHEDULED',
      recipient_user_id: student.id,
      target_role: 'STUDENT',
      student_id: student.id,
      title: `Interview Scheduled: ${newInterview.company} (${newInterview.round_name})`,
      message: `${newInterview.round_name} on ${newInterview.date} at ${newInterview.reporting_time} ${timezone} (${mode === 'IN_PERSON' ? 'In-Person' : 'Online'}) · ${newInterview.venue}.`,
      type: 'info',
      related_interview_id: newInterview.id,
      related_application_id: newInterview.application_id,
      link: '/dashboard/my-interviews',
      dedupe_key: `INTERVIEW_SCHEDULED:${student.id}:${newInterview.id}`,
    });

    getResponsibleStaffAccounts(student.department).forEach((stf) => {
      pushNotification({
        event_type: 'INTERVIEW_SCHEDULED',
        recipient_user_id: stf.id,
        target_role: 'STAFF',
        title: `Interview Slot Assigned: ${student.name}`,
        message: `${student.name} (${student.roll_number}) scheduled for ${newInterview.company} ${newInterview.round_name} on ${newInterview.date} (${newInterview.reporting_time} ${timezone}).`,
        type: 'info',
        related_interview_id: newInterview.id,
        related_application_id: newInterview.application_id,
        link: '/dashboard/interviews',
        dedupe_key: `INTERVIEW_SCHEDULED:${stf.id}:${newInterview.id}`,
      });
    });

    persistAll();
    return newInterview;
  },

  async updateInterview(interviewId, updates) {
    await delay(100);
    let prevInt = null;
    let updatedInt = null;
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`;

    interviews = interviews.map((item) => {
      if (item.id !== interviewId) return item;
      prevInt = { ...item };
      const panelistsArr =
        updates.panelists !== undefined
          ? Array.isArray(updates.panelists)
            ? updates.panelists
            : String(updates.panelists)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
          : item.panelists;
      updatedInt = {
        ...item,
        ...updates,
        timezone: updates.timezone || item.timezone || 'IST (UTC+5:30)',
        mode: updates.mode || item.mode || 'ONLINE',
        panelists: panelistsArr,
        interviewer: panelistsArr[0] || item.interviewer,
        location: updates.venue || item.location,
      };
      return updatedInt;
    });

    // Synchronize interview changes (date, time, venue, result, feedback) back into applications store
    if (updatedInt) {
      const scheduleChanged =
        prevInt &&
        (prevInt.date !== updatedInt.date ||
          prevInt.reporting_time !== updatedInt.reporting_time ||
          prevInt.venue !== updatedInt.venue ||
          prevInt.mode !== updatedInt.mode ||
          prevInt.meeting_link !== updatedInt.meeting_link);
      const resultPublished =
        prevInt &&
        ((updates.result && updates.result !== prevInt.result) ||
          (updates.feedback && updates.feedback !== prevInt.feedback));

      applications = applications.map((app) => {
        if (app.id !== (updatedInt.application_id || updatedInt.applicationId)) {
          return app;
        }
        const updatedRounds = (app.rounds || []).map((r) => {
          if (
            r.round_name === updatedInt.round_name ||
            r.round_number === updatedInt.round_number
          ) {
            return {
              ...r,
              date: updatedInt.date,
              reporting_time: updatedInt.reporting_time,
              venue: updatedInt.venue,
              meeting_link: updatedInt.meeting_link,
              panelists: updatedInt.panelists,
              result: updatedInt.result || r.result,
            };
          }
          return r;
        });

        let nextAppStatus = app.status;
        let nextRoundName = app.current_round || updatedInt.round_name;
        if (updatedInt.result === 'FAILED') {
          nextAppStatus = 'REJECTED';
        } else if (updatedInt.result === 'PASSED') {
          if (
            updatedInt.round_name === 'Offer' ||
            updatedInt.round_name === 'HR' ||
            updates.mark_final_selected
          ) {
            nextAppStatus = 'SELECTED';
            nextRoundName = 'Offer';
          }
        }

        const prevHist = Array.isArray(app.status_history) ? app.status_history : [];
        let nextHist = [...prevHist];

        if (scheduleChanged) {
          nextHist.push({
            id: `hist-resched-${Date.now()}`,
            status: nextAppStatus,
            stage_label: `${updatedInt.round_name} Rescheduled`,
            timestamp: nowStamp,
            actor: 'Raghav Menon (TPO)',
            explanation: `Updated slot to ${updatedInt.date} at ${updatedInt.reporting_time} ${updatedInt.timezone} (${updatedInt.mode === 'IN_PERSON' ? 'In-Person' : 'Online'}) · ${updatedInt.venue}.`,
          });
        }

        if (resultPublished) {
          nextHist.push({
            id: `hist-res-${Date.now()}`,
            status: nextAppStatus,
            stage_label: `${updatedInt.round_name} Result: ${updatedInt.result}`,
            timestamp: nowStamp,
            actor: updatedInt.interviewer || 'Raghav Menon (TPO)',
            explanation: `Attendance: ${updatedInt.attendance || 'PRESENT'} · Outcome: ${updatedInt.result}. ${updatedInt.feedback || ''}`,
          });
        }

        return {
          ...app,
          status: nextAppStatus,
          rejected_at_stage:
            updatedInt.result === 'FAILED' ? 'INTERVIEW' : app.rejected_at_stage,
          current_round: nextRoundName,
          currentRound: nextRoundName,
          feedback: updatedInt.feedback || app.feedback,
          rounds: updatedRounds,
          last_update: nowStamp,
          lastUpdate: nowStamp,
          status_history: nextHist,
        };
      });

      const studentObj = students.find((s) => s.id === updatedInt.student_id);

      // Rule: Interview rescheduled -> notify affected student AND responsible staff
      if (scheduleChanged) {
        pushNotification({
          event_type: 'INTERVIEW_RESCHEDULED',
          recipient_user_id: updatedInt.student_id,
          target_role: 'STUDENT',
          student_id: updatedInt.student_id,
          title: `Interview Rescheduled: ${updatedInt.company} (${updatedInt.round_name})`,
          message: `Updated schedule: ${updatedInt.date} at ${updatedInt.reporting_time} ${updatedInt.timezone} · Venue: ${updatedInt.venue}.`,
          type: 'info',
          related_interview_id: updatedInt.id,
          related_application_id: updatedInt.application_id,
          link: '/dashboard/my-interviews',
          dedupe_key: `INTERVIEW_RESCHEDULED:${updatedInt.student_id}:${updatedInt.id}:${updatedInt.date}:${updatedInt.reporting_time}:${updatedInt.venue}`,
        });

        getResponsibleStaffAccounts(studentObj?.department).forEach((stf) => {
          pushNotification({
            event_type: 'INTERVIEW_RESCHEDULED',
            recipient_user_id: stf.id,
            target_role: 'STAFF',
            title: `Interview Rescheduled: ${updatedInt.student}`,
            message: `${updatedInt.student} (${updatedInt.roll_number}) · ${updatedInt.company} (${updatedInt.round_name}) moved to ${updatedInt.date} at ${updatedInt.reporting_time}.`,
            type: 'info',
            related_interview_id: updatedInt.id,
            related_application_id: updatedInt.application_id,
            link: '/dashboard/interviews',
            dedupe_key: `INTERVIEW_RESCHEDULED:${stf.id}:${updatedInt.id}:${updatedInt.date}:${updatedInt.reporting_time}:${updatedInt.venue}`,
          });
        });
      }

      // Rule: Interview result published -> notify the affected student
      if (resultPublished || (!scheduleChanged && updates.result)) {
        pushNotification({
          event_type: 'INTERVIEW_RESULT_PUBLISHED',
          recipient_user_id: updatedInt.student_id,
          target_role: 'STUDENT',
          student_id: updatedInt.student_id,
          title: `Interview Result Published: ${updatedInt.company} (${updatedInt.round_name})`,
          message: `Outcome: ${updatedInt.result}. ${
            updatedInt.feedback ? `Feedback: "${updatedInt.feedback}"` : ''
          }`,
          type:
            updatedInt.result === 'PASSED'
              ? 'success'
              : updatedInt.result === 'FAILED'
              ? 'warning'
              : 'info',
          related_interview_id: updatedInt.id,
          related_application_id: updatedInt.application_id,
          link: '/dashboard/my-interviews',
          dedupe_key: `INTERVIEW_RESULT_PUBLISHED:${updatedInt.student_id}:${updatedInt.id}:${updatedInt.result}:${updatedInt.feedback}`,
        });
      }
    }

    persistAll();
    return updatedInt;
  },

  async cancelInterview(interviewId, reason = 'Cancelled by Placement Staff due to panel rescheduling.') {
    await delay(100);
    let cancelledInt = null;
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`;

    interviews = interviews.map((item) => {
      if (item.id !== interviewId) return item;
      cancelledInt = {
        ...item,
        attendance: 'CANCELLED',
        result: 'CANCELLED',
        feedback: reason,
      };
      return cancelledInt;
    });

    if (cancelledInt) {
      applications = applications.map((app) => {
        if (app.id !== (cancelledInt.application_id || cancelledInt.applicationId)) {
          return app;
        }
        const prevHist = Array.isArray(app.status_history) ? app.status_history : [];
        return {
          ...app,
          feedback: `${cancelledInt.round_name} interview cancelled: ${reason}`,
          last_update: nowStamp,
          lastUpdate: nowStamp,
          status_history: [
            ...prevHist,
            {
              id: `hist-cancel-${Date.now()}`,
              status: app.status,
              stage_label: `${cancelledInt.round_name} Interview Cancelled`,
              timestamp: nowStamp,
              actor: 'Raghav Menon (TPO)',
              explanation: reason,
            },
          ],
        };
      });

      pushNotification({
        event_type: 'INTERVIEW_CANCELLED',
        recipient_user_id: cancelledInt.student_id,
        target_role: 'STUDENT',
        student_id: cancelledInt.student_id,
        title: `Interview Cancelled: ${cancelledInt.company} (${cancelledInt.round_name})`,
        message: `${cancelledInt.round_name} scheduled on ${cancelledInt.date} was cancelled. Reason: ${reason}`,
        type: 'warning',
        related_interview_id: cancelledInt.id,
        related_application_id: cancelledInt.application_id,
        link: '/dashboard/my-interviews',
        dedupe_key: `INTERVIEW_CANCELLED:${cancelledInt.student_id}:${cancelledInt.id}`,
      });
    }

    persistAll();
    return cancelledInt;
  },

  // Placements & Offers with Policy Evaluation & Decision Guards
  _evaluateOfferPolicyForStudent(offer, allStudentOffers = []) {
    const tierRank = { Core: 1, Dream: 2, 'Super Dream': 3 };
    const status = offer.offer_status || 'PENDING';

    if (status === 'ACCEPTED') {
      return {
        can_accept: false,
        can_decline: false,
        is_decided: true,
        lock_reason: 'You have already accepted this offer. Duplicate decisions are prevented.',
      };
    }
    if (status === 'DECLINED') {
      return {
        can_accept: false,
        can_decline: false,
        is_decided: true,
        lock_reason: 'You have formally declined this offer. Decision is final.',
      };
    }
    if (status === 'EXPIRED') {
      return {
        can_accept: false,
        can_decline: false,
        is_decided: true,
        lock_reason: 'The decision window for this offer has expired.',
      };
    }

    // Offer is PENDING
    const acceptedOffers = allStudentOffers.filter(
      (o) => o.id !== offer.id && o.offer_status === 'ACCEPTED'
    );

    if (acceptedOffers.length === 0 || !policies.single_offer_policy) {
      return {
        can_accept: true,
        can_decline: true,
        is_decided: false,
        is_upgrade: false,
        supersedes_offer: null,
        lock_reason: null,
      };
    }

    // Check highest accepted offer tier
    const highestAccepted = acceptedOffers.reduce((best, curr) =>
      (tierRank[curr.tier] || 1) > (tierRank[best.tier] || 1) ? curr : best
    , acceptedOffers[0]);

    const acceptedRank = tierRank[highestAccepted.tier] || 1;
    const candidateRank = tierRank[offer.tier] || 1;

    if (policies.allow_higher_tier_upgrade && candidateRank > acceptedRank) {
      return {
        can_accept: true,
        can_decline: true,
        is_decided: false,
        is_upgrade: true,
        supersedes_offer: {
          id: highestAccepted.id,
          company: highestAccepted.company,
          tier: highestAccepted.tier,
          package_lpa: highestAccepted.package_lpa,
        },
        lock_reason: null,
      };
    }

    return {
      can_accept: false,
      can_decline: true,
      is_decided: false,
      is_upgrade: false,
      supersedes_offer: null,
      lock_reason: `Locked by Single-Offer Policy (${highestAccepted.company} · ${highestAccepted.tier} Tier already accepted). Only higher-tier upgrades are permitted.`,
    };
  },

  async getPlacements() {
    await delay(70);
    return offers.map((o) => {
      const studentOffers = offers.filter((so) => so.student_id === o.student_id);
      return {
        decision_deadline: o.decision_deadline || '2026-11-05',
        ...o,
        policy_evaluation: this._evaluateOfferPolicyForStudent(o, studentOffers),
      };
    });
  },

  async getOffers(studentId) {
    await delay(70);
    if (!studentId) return this.getPlacements();
    const normalizedSid = normalizeUserId(studentId, 'STUDENT');
    const studentOffers = offers.filter(
      (o) => normalizeUserId(o.student_id, 'STUDENT') === normalizedSid
    );
    return studentOffers.map((o) => ({
      decision_deadline: o.decision_deadline || '2026-11-05',
      ...o,
      policy_evaluation: this._evaluateOfferPolicyForStudent(o, studentOffers),
    }));
  },

  async createOffer(payload) {
    await delay(120);
    const student =
      students.find((s) => s.id === payload.student_id) ||
      students.find((s) => s.id === 'student-rohit') ||
      students[0];
    const baseLpa = Number(payload.base_lpa ?? 12.0);
    const bonusLpa = Number(payload.bonus_lpa ?? 2.0);
    const esopValue = Number(payload.esop_value ?? 1.5);
    const totalPackage = Number(
      payload.package_lpa ?? +(baseLpa + bonusLpa + esopValue).toFixed(1)
    );
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`;

    // Prevent duplicate pending offer for same student + company
    const existingOfferIdx = offers.findIndex(
      (o) =>
        o.student_id === student.id &&
        o.company.toLowerCase() === (payload.company || '').toLowerCase()
    );

    const createdOffer = {
      id:
        existingOfferIdx !== -1
          ? offers[existingOfferIdx].id
          : `off-${Date.now().toString().slice(-4)}`,
      student_id: student.id,
      student: student.name,
      roll_number: student.roll_number,
      department: student.department,
      company: payload.company || 'TechNova Solutions',
      tier:
        payload.tier ||
        (totalPackage >= (policies.super_dream_tier_min_lpa || 18)
          ? 'Super Dream'
          : totalPackage >= (policies.dream_tier_min_lpa || 10)
          ? 'Dream'
          : 'Core'),
      job_role: payload.job_role || 'Software Development Engineer',
      package_lpa: totalPackage,
      base_lpa: baseLpa,
      bonus_lpa: bonusLpa,
      esop_value: esopValue,
      offer_status: payload.offer_status || 'PENDING',
      date: new Date().toISOString().split('T')[0],
      decision_deadline: payload.decision_deadline || '2026-11-05',
      joining_date: payload.joining_date || 'July 15, 2027',
      verified: true,
    };

    if (existingOfferIdx !== -1) {
      offers = offers.map((o, idx) => (idx === existingOfferIdx ? createdOffer : o));
    } else {
      offers = [createdOffer, ...offers];
    }

    // Also mark corresponding application as OFFER_RELEASED and record in status_history
    let matchedAppId = payload.application_id || null;
    applications = applications.map((app) => {
      if (
        app.id === payload.application_id ||
        ((app.student_id || app.studentId) === student.id &&
          app.company.toLowerCase() === createdOffer.company.toLowerCase())
      ) {
        matchedAppId = app.id;
        const prevHist = Array.isArray(app.status_history) ? app.status_history : [];
        return {
          ...app,
          status: 'OFFER_RELEASED',
          current_round: 'Offer',
          currentRound: 'Offer',
          last_update: nowStamp,
          lastUpdate: nowStamp,
          feedback: `Official ${createdOffer.tier} Offer released (${createdOffer.package_lpa} LPA: Base ${baseLpa} + Bonus ${bonusLpa} + ESOP ${esopValue}). Awaiting student decision.`,
          status_history: [
            ...prevHist,
            {
              id: `hist-offer-${Date.now()}`,
              status: 'OFFER_RELEASED',
              stage_label: `${createdOffer.tier} Offer Released (${createdOffer.package_lpa} LPA)`,
              timestamp: nowStamp,
              actor: 'Raghav Menon (TPO)',
              explanation: `Released ${createdOffer.package_lpa} LPA offer for ${createdOffer.job_role}. Decision deadline: ${createdOffer.decision_deadline}.`,
            },
          ],
        };
      }
      return app;
    });

    // Rule: Offer released -> notify the specific student
    pushNotification({
      event_type: 'OFFER_RELEASED',
      recipient_user_id: student.id,
      target_role: 'STUDENT',
      student_id: student.id,
      title: `New Offer Released: ${createdOffer.company} (${createdOffer.package_lpa} LPA)`,
      message: `Congratulations ${student.name}! ${createdOffer.company} released a ${createdOffer.tier} Tier offer for ${createdOffer.job_role}.`,
      type: 'placement',
      related_offer_id: createdOffer.id,
      related_application_id: matchedAppId,
      link: '/dashboard/my-placement',
      dedupe_key: `OFFER_RELEASED:${student.id}:${createdOffer.id}:${createdOffer.package_lpa}`,
    });

    persistAll();
    return createdOffer;
  },

  async updateOfferRecord(offerId, updates) {
    await delay(100);
    let updatedOffer = null;
    offers = offers.map((o) => {
      if (o.id !== offerId) return o;
      const base = Number(updates.base_lpa ?? o.base_lpa);
      const bonus = Number(updates.bonus_lpa ?? o.bonus_lpa);
      const esop = Number(updates.esop_value ?? o.esop_value);
      const total = Number(updates.package_lpa ?? +(base + bonus + esop).toFixed(1));
      updatedOffer = {
        ...o,
        ...updates,
        base_lpa: base,
        bonus_lpa: bonus,
        esop_value: esop,
        package_lpa: total,
      };
      return updatedOffer;
    });
    persistAll();
    return updatedOffer;
  },

  async updateOfferStatus(offerId, newStatus, options = {}) {
    await delay(100);
    const targetOffer = offers.find((o) => o.id === offerId);
    if (!targetOffer) throw new Error('Offer record not found');

    // Prevent duplicate decision if already in target status
    if (targetOffer.offer_status === newStatus && !options.forceStaffOverride) {
      return targetOffer;
    }

    const studentOffers = offers.filter((o) => o.student_id === targetOffer.student_id);
    const policyEval = this._evaluateOfferPolicyForStudent(targetOffer, studentOffers);

    // If invoked by student, enforce policy rules
    if (options.isStudentDecision) {
      if (newStatus === 'ACCEPTED' && !policyEval.can_accept) {
        throw new Error(policyEval.lock_reason || 'Offer acceptance blocked by CDC placement policy.');
      }
      if (newStatus === 'DECLINED' && !policyEval.can_decline) {
        throw new Error(policyEval.lock_reason || 'Offer cannot be declined in its current state.');
      }
    }

    let updatedOffer = null;
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`;

    offers = offers.map((o) => {
      if (o.id === offerId) {
        updatedOffer = {
          ...o,
          offer_status: newStatus,
          decided_at: nowStamp,
        };
        return updatedOffer;
      }
      return o;
    });

    if (updatedOffer && newStatus === 'ACCEPTED') {
      students = students.map((s) =>
        s.id === updatedOffer.student_id
          ? {
              ...s,
              placed: true,
              placement_status: 'Placed',
              placed_company: updatedOffer.company,
              placed_package: updatedOffer.package_lpa,
              placedCompany: updatedOffer.company,
              placedPackage: updatedOffer.package_lpa,
            }
          : s
      );
    }

    if (updatedOffer) {
      const mappedAppStatus =
        newStatus === 'ACCEPTED'
          ? 'OFFER_ACCEPTED'
          : newStatus === 'DECLINED'
          ? 'OFFER_DECLINED'
          : newStatus === 'EXPIRED'
          ? 'OFFER_EXPIRED'
          : 'OFFER_RELEASED';

      // Synchronize decision into the corresponding application record & status_history
      applications = applications.map((app) => {
        if (
          (app.student_id || app.studentId) === updatedOffer.student_id &&
          app.company.toLowerCase() === updatedOffer.company.toLowerCase()
        ) {
          const prevHist = Array.isArray(app.status_history) ? app.status_history : [];
          return {
            ...app,
            status: mappedAppStatus,
            last_update: nowStamp,
            lastUpdate: nowStamp,
            feedback:
              newStatus === 'ACCEPTED'
                ? `Offer Accepted (${updatedOffer.package_lpa} LPA · ${updatedOffer.tier} Tier). Joining ${updatedOffer.joining_date}.`
                : newStatus === 'DECLINED'
                ? `Offer Declined by candidate (${updatedOffer.company}).`
                : newStatus === 'EXPIRED'
                ? `Offer decision window expired for ${updatedOffer.company}.`
                : app.feedback,
            status_history: [
              ...prevHist,
              {
                id: `hist-offdec-${Date.now()}`,
                status: mappedAppStatus,
                stage_label: `Offer ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}`,
                timestamp: nowStamp,
                actor: options.actor || `${updatedOffer.student} (${updatedOffer.roll_number})`,
                explanation:
                  options.explanation ||
                  `Offer status updated to ${newStatus} for ${updatedOffer.company} (${updatedOffer.package_lpa} LPA · ${updatedOffer.tier} Tier).`,
              },
            ],
          };
        }
        return app;
      });

      const evtType =
        newStatus === 'ACCEPTED'
          ? 'OFFER_ACCEPTED'
          : newStatus === 'DECLINED'
          ? 'OFFER_DECLINED'
          : 'OFFER_RELEASED';

      // Rule: Offer accepted or declined -> notify responsible staff and Admin
      getResponsibleStaffAccounts(updatedOffer.department).forEach((stf) => {
        pushNotification({
          event_type: evtType,
          recipient_user_id: stf.id,
          target_role: 'STAFF',
          title: `Offer ${newStatus}: ${updatedOffer.student} · ${updatedOffer.company}`,
          message: `${updatedOffer.student} (${updatedOffer.roll_number}) ${newStatus.toLowerCase()} the ${updatedOffer.package_lpa} LPA (${updatedOffer.tier}) offer from ${updatedOffer.company}.`,
          type: newStatus === 'ACCEPTED' ? 'placement' : 'warning',
          related_offer_id: updatedOffer.id,
          link: '/dashboard/placements',
          dedupe_key: `${evtType}:${stf.id}:${updatedOffer.id}:${newStatus}`,
        });
      });

      getAdminAccounts().forEach((adm) => {
        pushNotification({
          event_type: evtType,
          recipient_user_id: adm.id,
          target_role: 'ADMIN',
          title: `Candidate Offer ${newStatus}: ${updatedOffer.company}`,
          message: `${updatedOffer.student} (${updatedOffer.roll_number} · ${updatedOffer.department}) ${newStatus.toLowerCase()} ${updatedOffer.company} (${updatedOffer.package_lpa} LPA).`,
          type: newStatus === 'ACCEPTED' ? 'placement' : 'warning',
          related_offer_id: updatedOffer.id,
          link: '/dashboard/placements',
          dedupe_key: `${evtType}:${adm.id}:${updatedOffer.id}:${newStatus}`,
        });
      });

      // Also record confirmation for the student
      pushNotification({
        event_type: evtType,
        recipient_user_id: updatedOffer.student_id,
        target_role: 'STUDENT',
        student_id: updatedOffer.student_id,
        title: `Offer Decision Recorded: ${updatedOffer.company} (${newStatus})`,
        message: `Offer status for ${updatedOffer.company} (${updatedOffer.package_lpa} LPA · ${updatedOffer.tier}) is now ${newStatus}.`,
        type: newStatus === 'ACCEPTED' ? 'placement' : 'warning',
        related_offer_id: updatedOffer.id,
        link: '/dashboard/my-placement',
        dedupe_key: `${evtType}:${updatedOffer.student_id}:${updatedOffer.id}:${newStatus}`,
      });
    }
    persistAll();
    return updatedOffer;
  },

  // Companies
  async getCompanies() {
    await delay(70);
    return [...companies];
  },

  async createCompany(companyData) {
    await delay(120);
    const initials = (companyData.name || 'CO')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const created = {
      id: `comp-${Date.now()}`,
      name: companyData.name,
      tagline: companyData.tagline || 'Campus Recruitment Partner',
      sector: companyData.sector || 'Technology',
      tier: companyData.tier || 'Dream',
      logo_url: companyData.logo_url || '',
      logo_letter: initials,
      logoLetter: initials,
      hr_contacts: Array.isArray(companyData.hr_contacts)
        ? companyData.hr_contacts
        : [],
      active_drives: Number(companyData.active_drives ?? 1),
      activeDrives: Number(companyData.active_drives ?? 1),
      total_hired: Number(companyData.total_hired ?? 0),
      totalHired: Number(companyData.total_hired ?? 0),
      avg_package_lpa: Number(companyData.avg_package_lpa ?? 14.0),
      avgPackageLPA: Number(companyData.avg_package_lpa ?? 14.0),
      highest_package_lpa: Number(companyData.highest_package_lpa ?? 18.0),
      highestPackageLPA: Number(companyData.highest_package_lpa ?? 18.0),
      rating: 4.8,
      accent_bg: '#EDE9FE',
      accentBg: '#EDE9FE',
      accent_color: '#6D28D9',
      accentColor: '#6D28D9',
    };
    companies.unshift(created);
    getAdminAccounts().forEach((adm) => {
      pushNotification({
        event_type: 'COMPANY_CREATED',
        recipient_user_id: adm.id,
        target_role: 'ADMIN',
        title: `Corporate Partner Added: ${created.name}`,
        message: `${created.name} (${created.tier} Tier) onboarded with ${created.hr_contacts.length} HR contact(s).`,
        type: 'success',
        link: '/dashboard/companies',
        dedupe_key: `COMPANY_CREATED:${adm.id}:${created.id}`,
      });
    });
    persistAll();
    return created;
  },

  async updateCompany(companyId, updates) {
    await delay(100);
    let updatedComp = null;
    companies = companies.map((c) => {
      if (c.id !== companyId) return c;
      updatedComp = {
        ...c,
        ...updates,
        avg_package_lpa: Number(updates.avg_package_lpa ?? c.avg_package_lpa),
        avgPackageLPA: Number(updates.avg_package_lpa ?? c.avg_package_lpa),
        highest_package_lpa: Number(updates.highest_package_lpa ?? c.highest_package_lpa),
        highestPackageLPA: Number(updates.highest_package_lpa ?? c.highest_package_lpa),
      };
      return updatedComp;
    });
    persistAll();
    return updatedComp;
  },

  // Deterministic Targeted Notification Dispatch (Staff/Admin composer)
  async sendNotification({
    title,
    message,
    type = 'info',
    event_type = 'DIRECT_MESSAGE',
    target_role = 'STUDENT',
    student_id = null,
    recipient_user_id = null,
    sender_name = 'Placement Staff (TPO)',
    link = '/dashboard/notifications',
    related_drive_id = null,
    related_application_id = null,
    related_interview_id = null,
    related_offer_id = null,
  }) {
    await delay(80);

    // If targeting ALL_STUDENTS, create an individual notification per active student so read status is tracked per student
    if (target_role === 'STUDENT' && (!student_id || student_id === 'ALL_STUDENTS') && !recipient_user_id) {
      const createdList = students
        .filter((s) => s.account_status !== 'DEACTIVATED')
        .map((s) =>
          pushNotification({
            event_type,
            recipient_user_id: s.id,
            target_role: 'STUDENT',
            student_id: s.id,
            title,
            message,
            type,
            sender_name,
            link,
            related_drive_id,
            related_application_id,
            related_interview_id,
            related_offer_id,
            dedupe_key: `${event_type}:${s.id}:${title}:${message}`,
          })
        );
      return createdList[0] || null;
    }

    if (target_role === 'STAFF' && !recipient_user_id) {
      const createdStaffNotifs = getResponsibleStaffAccounts().map((stf) =>
        pushNotification({
          event_type,
          recipient_user_id: stf.id,
          target_role: 'STAFF',
          title,
          message,
          type,
          sender_name,
          link,
          related_drive_id,
          related_application_id,
          related_interview_id,
          related_offer_id,
          dedupe_key: `${event_type}:${stf.id}:${title}:${message}`,
        })
      );
      return createdStaffNotifs[0] || null;
    }

    const resolvedRecipient =
      recipient_user_id || student_id || getDefaultUserIdForRole(target_role);

    return pushNotification({
      event_type,
      recipient_user_id: resolvedRecipient,
      target_role,
      student_id: target_role === 'STUDENT' ? resolvedRecipient : null,
      title,
      message,
      type,
      sender_name,
      link,
      related_drive_id,
      related_application_id,
      related_interview_id,
      related_offer_id,
      dedupe_key: `${event_type}:${resolvedRecipient}:${title}:${message}`,
    });
  },

  /**
   * Retrieve notifications strictly scoped to the active recipient.
   * Never generates random or fake notifications on render or polling cycles.
   */
  async getNotifications({
    poll = false,
    role = 'ADMIN',
    userId = null,
  } = {}) {
    await delay(50);
    const effectiveUserId = normalizeUserId(userId, role);

    const userScopedList = notifications
      .filter((n) => {
        if (n.target_role !== role) return false;
        const recipientId = normalizeUserId(n.recipient_user_id || n.student_id, n.target_role);
        if (recipientId && recipientId !== effectiveUserId) {
          return false;
        }
        return true;
      })
      .map((n) => serializeNotificationForUser(n, effectiveUserId, role));

    // Track already-seen notification IDs so polling only surfaces genuinely new event notifications once
    if (!surfacedPollIdsByRecipient[effectiveUserId]) {
      surfacedPollIdsByRecipient[effectiveUserId] = new Set(
        userScopedList.map((n) => n.id)
      );
      return {
        notifications: userScopedList,
        latestPolled: null,
      };
    }

    let latestNewUnread = null;
    if (poll) {
      const seenSet = surfacedPollIdsByRecipient[effectiveUserId];
      for (const item of userScopedList) {
        if (!seenSet.has(item.id)) {
          seenSet.add(item.id);
          if (!item.read && !latestNewUnread) {
            latestNewUnread = item;
          }
        }
      }
    } else {
      const seenSet = surfacedPollIdsByRecipient[effectiveUserId];
      userScopedList.forEach((item) => seenSet.add(item.id));
    }

    return {
      notifications: userScopedList,
      latestPolled: latestNewUnread,
    };
  },

  /**
   * Mark a single notification as read for the specified recipient only.
   * Reading a notification as one user never changes another user's unread count.
   */
  async markNotificationRead(notificationId, { role = 'ADMIN', userId = null } = {}) {
    await delay(40);
    const effectiveUserId = normalizeUserId(userId, role);
    notifications = notifications.map((n) => {
      if (n.id !== notificationId) return n;
      const nextReadBy = {
        ...(n.read_by && typeof n.read_by === 'object' ? n.read_by : {}),
        [effectiveUserId]: true,
      };
      return {
        ...n,
        read_by: nextReadBy,
      };
    });
    persistAll();
    emitNotificationsUpdated();
    const res = await this.getNotifications({ poll: false, role, userId: effectiveUserId });
    return res.notifications;
  },

  /**
   * Mark all notifications for the specified recipient as read.
   */
  async markNotificationsRead({ role = 'ADMIN', userId = null } = {}) {
    await delay(60);
    const effectiveUserId = normalizeUserId(userId, role);
    notifications = notifications.map((n) => {
      const recipientId = normalizeUserId(n.recipient_user_id || n.student_id, n.target_role);
      if (n.target_role === role && (!recipientId || recipientId === effectiveUserId)) {
        const nextReadBy = {
          ...(n.read_by && typeof n.read_by === 'object' ? n.read_by : {}),
          [effectiveUserId]: true,
        };
        return {
          ...n,
          read_by: nextReadBy,
        };
      }
      return n;
    });
    persistAll();
    emitNotificationsUpdated();
    const res = await this.getNotifications({ poll: false, role, userId: effectiveUserId });
    return res.notifications;
  },

  // Student Settings
  async getStudentSettings(studentId = 'student-rohit') {
    await delay(50);
    const normalizedId = normalizeUserId(studentId, 'STUDENT');
    return (
      studentSettings[normalizedId] || {
        email_alerts: true,
        interview_sms_reminders: true,
        eligible_drive_digest: true,
        share_verified_resume_with_partners: true,
        preferred_job_tiers: ['Core', 'Dream', 'Super Dream'],
        preferred_locations: ['Bangalore', 'Hyderabad', 'Pune', 'Remote'],
      }
    );
  },

  async updateStudentSettings(studentId = 'student-rohit', nextSettings) {
    await delay(80);
    const normalizedId = normalizeUserId(studentId, 'STUDENT');
    studentSettings = {
      ...studentSettings,
      [normalizedId]: {
        ...(studentSettings[normalizedId] || {}),
        ...nextSettings,
      },
    };
    persistAll();
    return studentSettings[normalizedId];
  },

  // Analytics (dynamically reflects live store counts alongside institutional historical series)
  async getAnalytics() {
    await delay(70);
    const openDrivesCount = jobs.filter((j) => (j.status || 'OPEN') === 'OPEN').length;
    const baseSamplePlaced = initialStudents.filter((s) => s.placed).length;
    const currentSamplePlaced = students.filter((s) => s.placed).length;
    const placedDelta = Math.max(0, currentSamplePlaced - baseSamplePlaced);
    const baseOffersCount = initialOffers.length;
    const offersDelta = Math.max(0, offers.length - baseOffersCount);

    const liveStudentsPlaced = initialAnalytics.summary.students_placed + placedDelta;
    const totalEligible = initialAnalytics.summary.total_eligible_students;
    const livePlacementRate = +((liveStudentsPlaced / totalEligible) * 100).toFixed(1);
    const liveTotalOffers = initialAnalytics.summary.total_offers + offersDelta;

    return {
      ...initialAnalytics,
      summary: {
        ...initialAnalytics.summary,
        students_placed: liveStudentsPlaced,
        studentsPlaced: liveStudentsPlaced,
        placement_rate_percent: livePlacementRate,
        placementRatePercent: livePlacementRate,
        drives_open: Math.max(openDrivesCount, initialAnalytics.summary.drives_open),
        drivesOpen: Math.max(openDrivesCount, initialAnalytics.summary.drivesOpen),
        total_offers: liveTotalOffers,
        totalOffers: liveTotalOffers,
        partner_companies: Math.max(companies.length, initialAnalytics.summary.partner_companies),
        partnerCompanies: Math.max(companies.length, initialAnalytics.summary.partnerCompanies),
      },
    };
  },

  // Deterministic Demo Authentication (NO email-substring role guessing)
  async login({ accountId, email, role }) {
    await delay(140);
    const normalizedAccountId = accountId ? normalizeUserId(accountId, role) : null;

    // 1. Explicit Demo Account ID lookup
    if (normalizedAccountId === 'admin-ishan' || (!normalizedAccountId && !email && role === 'ADMIN')) {
      const adm =
        staffAccounts.find((a) => a.id === 'admin-ishan' || a.role === 'ADMIN') ||
        DEMO_STAFF_ACCOUNTS.ADMIN;
      return { user: { ...adm, role: 'ADMIN' } };
    }
    if (normalizedAccountId === 'staff-raghav' || (!normalizedAccountId && !email && role === 'STAFF')) {
      const stf =
        staffAccounts.find((a) => a.id === normalizedAccountId && a.role === 'STAFF') ||
        staffAccounts.find((a) => a.role === 'STAFF') ||
        DEMO_STAFF_ACCOUNTS.STAFF;
      return { user: { ...stf, role: 'STAFF' } };
    }
    if (normalizedAccountId) {
      const matchedStaff = staffAccounts.find((a) => a.id === normalizedAccountId);
      if (matchedStaff) {
        return { user: { ...matchedStaff } };
      }
      const matchedStudent = students.find((s) => s.id === normalizedAccountId);
      if (matchedStudent) {
        return { user: { ...matchedStudent, role: 'STUDENT' } };
      }
    }

    // 2. Exact email match against known demo accounts (never substring guessing)
    const normalizedEmail = (email || '').trim().toLowerCase();
    const matchedStaffByEmail = staffAccounts.find(
      (a) => a.email.toLowerCase() === normalizedEmail
    );
    if (matchedStaffByEmail) {
      return { user: { ...matchedStaffByEmail } };
    }

    const matchedByEmail = students.find(
      (s) => s.email.toLowerCase() === normalizedEmail
    );
    if (matchedByEmail) {
      return { user: { ...matchedByEmail, role: 'STUDENT' } };
    }

    throw new Error(
      'Account not found. Select one of the 3 Role Accounts or use a registered campus email.'
    );
  },

  // Register new student or staff demo account during Signup flow
  async registerDemoAccount({ name, roll_number, email, department, role = 'STUDENT' }) {
    await delay(150);
    if (role === 'ADMIN' || role === 'STAFF') {
      const created = await this.createUserAccount({
        name,
        roll_number,
        email,
        department,
        role,
      });
      return { user: created };
    }

    const existing = students.find(
      (s) =>
        s.roll_number.toLowerCase() === (roll_number || '').trim().toLowerCase() ||
        s.email.toLowerCase() === (email || '').trim().toLowerCase()
    );
    if (existing) {
      return { user: { ...existing, role: 'STUDENT' } };
    }

    const createdStudent = await this.createUserAccount({
      name,
      roll_number,
      email,
      department,
      role: 'STUDENT',
    });
    return { user: createdStudent };
  },

  // ============================================================================
  // SIMULATED FRONTEND DEMO INBOX (Participant-Scoped Conversations)
  // ============================================================================
  async getConversations({ userId, role = 'STUDENT' } = {}) {
    await delay(50);
    const effectiveUserId = normalizeUserId(userId, role);
    return conversations
      .filter((conv) => Array.isArray(conv.participant_ids) && conv.participant_ids.includes(effectiveUserId))
      .map((conv) => ({
        ...conv,
        unread: Boolean(conv.unread_by && conv.unread_by[effectiveUserId]),
        messages: [...(conv.messages || [])],
      }))
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
  },

  async getPermittedMessagingContacts({ userId, role = 'STUDENT' } = {}) {
    await delay(40);
    const effectiveUserId = normalizeUserId(userId, role);

    const activeStaffList = staffAccounts
      .filter((st) => st.account_status !== 'DEACTIVATED' && st.id !== effectiveUserId)
      .map((st) => ({
        id: st.id,
        name: st.name,
        role: st.role,
        email: st.email,
        phone: st.phone,
        subtitle: `${st.title || st.role} · ${st.department || 'CDC'}`,
      }));

    if (role === 'STUDENT') {
      // Students can only message TPO Staff and Admin coordinators
      return activeStaffList;
    }

    // Staff & Admin can message any active student, staff member, or corporate HR contact
    const studentContacts = students
      .filter((s) => s.account_status !== 'DEACTIVATED' && s.id !== effectiveUserId)
      .map((s) => ({
        id: s.id,
        name: s.name,
        role: 'STUDENT',
        email: s.email,
        phone: s.phone,
        subtitle: `${s.roll_number} · ${s.department}`,
      }));

    const hrContacts = [];
    companies.forEach((comp) => {
      (comp.hr_contacts || []).forEach((hr) => {
        const slugId = `hr-${String(hr.email || hr.name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}`;
        hrContacts.push({
          id: slugId,
          name: `${hr.name} (${comp.name} HR)`,
          role: 'HR_CONTACT',
          email: hr.email,
          phone: hr.phone || '',
          subtitle: `${hr.email || 'Corporate HR'} · ${comp.name}`,
        });
      });
    });

    return [...activeStaffList, ...studentContacts, ...hrContacts];
  },

  async openOrCreateConversation({ currentUser, targetParticipant, subject = '' }) {
    await delay(60);
    if (!currentUser || !targetParticipant) {
      throw new Error('Both sender and recipient are required to open a demo conversation.');
    }
    const senderRole = currentUser.role || 'STUDENT';
    const senderId = normalizeUserId(currentUser.id, senderRole);
    const targetRole = targetParticipant.role || 'STAFF';
    const targetId =
      targetParticipant.id ||
      `hr-${String(targetParticipant.email || targetParticipant.name || 'contact')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;

    // Permission check: Students can only message STAFF or ADMIN accounts
    if (senderRole === 'STUDENT' && targetRole !== 'STAFF' && targetRole !== 'ADMIN') {
      throw new Error('Students may only message Placement Staff (TPO) or Career Cell Administrators.');
    }

    const existing = conversations.find(
      (c) =>
        Array.isArray(c.participant_ids) &&
        c.participant_ids.includes(senderId) &&
        c.participant_ids.includes(targetId)
    );

    if (existing) {
      const nextUnread = { ...(existing.unread_by || {}) };
      delete nextUnread[senderId];
      existing.unread_by = nextUnread;
      persistAll();
      emitConversationsUpdated();
      return {
        ...existing,
        unread: false,
        messages: [...(existing.messages || [])],
      };
    }

    const nowIso = new Date().toISOString();
    const newConv = {
      id: `conv-${Date.now()}`,
      subject:
        subject ||
        `Placement Desk Thread: ${currentUser.name} & ${targetParticipant.name}`,
      participant_ids: [senderId, targetId],
      participants: [
        {
          id: senderId,
          name: currentUser.name,
          role: senderRole,
          subtitle: currentUser.department || currentUser.roll_number || senderRole,
        },
        {
          id: targetId,
          name: targetParticipant.name,
          role: targetRole,
          subtitle:
            targetParticipant.subtitle ||
            targetParticipant.department ||
            targetParticipant.email ||
            targetRole,
        },
      ],
      updated_at: nowIso,
      unread_by: {},
      messages: [],
    };

    conversations = [newConv, ...conversations];
    persistAll();
    emitConversationsUpdated();
    return {
      ...newConv,
      unread: false,
      messages: [],
    };
  },

  async sendMessage({ conversationId, sender, text }) {
    await delay(70);
    const trimmed = String(text || '').trim();
    if (!trimmed) {
      throw new Error('Message cannot be empty. Please enter a message before sending.');
    }
    const senderRole = sender?.role || 'STUDENT';
    const senderId = normalizeUserId(sender?.id, senderRole);

    const targetConv = conversations.find((c) => c.id === conversationId);
    if (!targetConv) {
      throw new Error('Conversation not found.');
    }
    if (!targetConv.participant_ids.includes(senderId)) {
      throw new Error('Access denied: You are not a participant in this demo conversation.');
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)} IST`;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender_id: senderId,
      sender_name: sender?.name || 'PlaceTrack User',
      sender_role: senderRole,
      text: trimmed,
      timestamp: timeStr,
      created_at: nowIso,
    };

    const nextUnreadBy = { ...(targetConv.unread_by || {}) };
    targetConv.participant_ids.forEach((pid) => {
      if (pid !== senderId) {
        nextUnreadBy[pid] = true;
      }
    });
    delete nextUnreadBy[senderId];

    let updatedConversation = null;
    conversations = conversations.map((c) => {
      if (c.id !== conversationId) return c;
      updatedConversation = {
        ...c,
        updated_at: nowIso,
        unread_by: nextUnreadBy,
        messages: [...(c.messages || []), newMsg],
      };
      return updatedConversation;
    });

    // Also create a deterministic notification for internal campus recipients (STUDENT / STAFF / ADMIN)
    (targetConv.participants || []).forEach((p) => {
      if (p.id !== senderId && ['STUDENT', 'STAFF', 'ADMIN'].includes(p.role)) {
        pushNotification({
          event_type: 'DIRECT_MESSAGE',
          recipient_user_id: p.id,
          target_role: p.role,
          student_id: p.role === 'STUDENT' ? p.id : null,
          title: `New Message from ${sender?.name || 'Placement Desk'}`,
          message: trimmed.length > 90 ? `${trimmed.slice(0, 87)}...` : trimmed,
          type: 'info',
          sender_name: sender?.name || 'Placement Desk',
          link: '/dashboard/notifications',
          dedupe_key: `DIRECT_MESSAGE:${p.id}:${newMsg.id}`,
        });
      }
    });

    persistAll();
    emitConversationsUpdated();
    return updatedConversation;
  },

  async markConversationRead(conversationId, userId, role = 'STUDENT') {
    await delay(30);
    const effectiveUserId = normalizeUserId(userId, role);
    conversations = conversations.map((c) => {
      if (c.id !== conversationId) return c;
      const nextUnread = { ...(c.unread_by || {}) };
      delete nextUnread[effectiveUserId];
      return {
        ...c,
        unread_by: nextUnread,
      };
    });
    persistAll();
    emitConversationsUpdated();
    return true;
  },

  async resetDemoData() {
    await delay(100);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_DATA_KEY);
    }
    students = [...initialStudents];
    staffAccounts = [...initialStaffAccounts];
    jobs = [...initialJobs];
    applications = [...initialApplications];
    interviews = [...initialInterviews];
    offers = [...initialOffers];
    companies = [...initialCompanies];
    notifications = initialNotifications.map((n) => ({
      ...n,
      read_by: {},
    }));
    conversations = initialConversations.map((c) => ({
      ...c,
      unread_by: { ...(c.unread_by || {}) },
      messages: [...(c.messages || [])],
    }));
    Object.keys(surfacedPollIdsByRecipient).forEach((k) => {
      delete surfacedPollIdsByRecipient[k];
    });
    policies = { ...initialPolicies };
    studentSettings = {};
    persistAll();
    emitNotificationsUpdated();
    emitConversationsUpdated();
    return true;
  },
};

