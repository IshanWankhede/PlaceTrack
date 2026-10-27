import React, { useState, useMemo } from 'react';
import DomeGallery from './DomeGallery.jsx';
import {
  Sparkles,
  Trophy,
  TrendingUp,
  Building2,
  CheckCircle2,
  Search,
  ExternalLink,
  Award,
  Layers,
  Globe2,
  BadgeCheck,
  Briefcase,
  X,
  ChevronRight,
  Filter
} from 'lucide-react';

export const PLACED_ACHIEVERS = [
  {
    id: 'plc-google-1',
    name: 'Aarav Sharma',
    roll: '21CS042',
    department: 'Computer Science & Engg.',
    branchShort: 'CSE',
    company: 'Google',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=120&auto=format&fit=crop&q=80',
    companyColor: '#4285F4',
    companyBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    role: 'Software Engineer (Cloud & Systems)',
    packageLpa: 45.0,
    packageFormatted: '₹45.0 LPA',
    tier: 'marquee',
    category: 'tech',
    location: 'Bangalore, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹28,00,000',
      stock: '$25,000 RSUs (4 yrs)',
      bonus: '₹5,00,000 Sign-on',
      roundsCleared: 5,
      cgpa: 9.2,
      quote: 'PlaceTrack automated my interview round schedules and made tracking 6 parallel tech rounds stress-free.'
    }
  },
  {
    id: 'plc-msft-2',
    name: 'Priya Patel',
    roll: '21CS089',
    department: 'Computer Science & Engg.',
    branchShort: 'CSE',
    company: 'Microsoft',
    companyLogo: 'https://images.unsplash.com/photo-1642132652806-9430155b40cf?w=120&auto=format&fit=crop&q=80',
    companyColor: '#00A4EF',
    companyBg: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    role: 'Software Engineer II (Azure Core)',
    packageLpa: 42.5,
    packageFormatted: '₹42.5 LPA',
    tier: 'marquee',
    category: 'tech',
    location: 'Hyderabad, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹26,50,000',
      stock: '$22,000 Stock Units',
      bonus: '₹4,00,000 Relocation & Join',
      roundsCleared: 4,
      cgpa: 9.38,
      quote: 'The real-time placement dashboard kept me updated right until the offer letter was generated!'
    }
  },
  {
    id: 'plc-atlassian-3',
    name: 'Devansh Gupta',
    roll: '21IT023',
    department: 'Information Technology',
    branchShort: 'IT',
    company: 'Atlassian',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    companyColor: '#0052CC',
    companyBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    role: 'Product Backend Engineer (Jira Platform)',
    packageLpa: 38.0,
    packageFormatted: '₹38.0 LPA',
    tier: 'marquee',
    category: 'tech',
    location: 'Bangalore, India (Remote-first)',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹24,00,000',
      stock: '$18,000 RSUs',
      bonus: '₹3,50,000 Sign-on',
      roundsCleared: 4,
      cgpa: 8.95,
      quote: 'PlaceTrack filtered out non-eligible drives automatically so I could concentrate on cracking Atlassian.'
    }
  },
  {
    id: 'plc-amazon-4',
    name: 'Ananya Iyer',
    roll: '21CS054',
    department: 'Computer Science & Engg.',
    branchShort: 'CSE',
    company: 'Amazon AWS',
    companyLogo: 'https://images.unsplash.com/photo-1523474255658-4af61b168344?w=120&auto=format&fit=crop&q=80',
    companyColor: '#FF9900',
    companyBg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    role: 'Cloud Solutions Architect & SDE',
    packageLpa: 34.0,
    packageFormatted: '₹34.0 LPA',
    tier: 'marquee',
    category: 'tech',
    location: 'Bangalore, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹22,00,000',
      stock: '₹8,00,000 Amazon Stocks',
      bonus: '₹4,00,000 First-year bonus',
      roundsCleared: 4,
      cgpa: 8.9,
      quote: 'Received instant offer notifications on my phone with zero delays.'
    }
  },
  {
    id: 'plc-gs-5',
    name: 'Vikram Rao',
    roll: '21EC015',
    department: 'Electronics & Comm.',
    branchShort: 'ECE',
    company: 'Goldman Sachs',
    companyLogo: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
    companyColor: '#0F172A',
    companyBg: 'bg-slate-900/10 text-slate-800 border-slate-900/20',
    role: 'Quantitative Financial Analyst',
    packageLpa: 32.0,
    packageFormatted: '₹32.0 LPA',
    tier: 'marquee',
    category: 'fintech',
    location: 'Bangalore, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹24,00,000',
      stock: 'Performance pool bonus',
      bonus: '₹6,00,000 Fixed annual incentive',
      roundsCleared: 5,
      cgpa: 9.1,
      quote: 'The mock interviews and round tracking gave me the edge in Goldman’s math & quant panel.'
    }
  },
  {
    id: 'plc-uber-6',
    name: 'Meera Nair',
    roll: '21IT088',
    department: 'Information Technology',
    branchShort: 'IT',
    company: 'Uber Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=120&auto=format&fit=crop&q=80',
    companyColor: '#000000',
    companyBg: 'bg-black/10 text-black border-black/20',
    role: 'Software Engineer (High-throughput Routing)',
    packageLpa: 30.5,
    packageFormatted: '₹30.5 LPA',
    tier: 'marquee',
    category: 'tech',
    location: 'Hyderabad, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹21,00,000',
      stock: '$12,000 Stock grant',
      bonus: '₹3,00,000 Joining bonus',
      roundsCleared: 4,
      cgpa: 8.85,
      quote: 'Cleanest placement experience ever. Transparent shortlists and verified digital offer letters.'
    }
  },
  {
    id: 'plc-adobe-7',
    name: 'Rohan Mehra',
    roll: '21CS115',
    department: 'Computer Science & Engg.',
    branchShort: 'CSE',
    company: 'Adobe',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    companyColor: '#FF0000',
    companyBg: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    role: 'Computer Vision & Creative Cloud Eng.',
    packageLpa: 28.0,
    packageFormatted: '₹28.0 LPA',
    tier: 'super-dream',
    category: 'tech',
    location: 'Noida, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹19,00,000',
      stock: '$10,000 Adobe RSUs',
      bonus: '₹2,50,000 Relocation Allowance',
      roundsCleared: 4,
      cgpa: 8.78,
      quote: 'Direct campus link with Adobe engineering leads through PlaceTrack portal.'
    }
  },
  {
    id: 'plc-oracle-8',
    name: 'Sneha Kulkarni',
    roll: '21CS112',
    department: 'Computer Science & Engg.',
    branchShort: 'CSE',
    company: 'Oracle Cloud (OCI)',
    companyLogo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80',
    companyColor: '#F80000',
    companyBg: 'bg-red-500/10 text-red-700 border-red-500/20',
    role: 'Cloud Infrastructure SRE Specialist',
    packageLpa: 24.5,
    packageFormatted: '₹24.5 LPA',
    tier: 'super-dream',
    category: 'tech',
    location: 'Bangalore, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹18,00,000',
      stock: '₹4,50,000 RSUs',
      bonus: '₹2,00,000 Performance Bonus',
      roundsCleared: 3,
      cgpa: 8.65,
      quote: 'OCI hired 4 students in our batch; having all interview materials in one portal was a game changer.'
    }
  },
  {
    id: 'plc-technova-9',
    name: 'Aditya Joshi',
    roll: '21CS077',
    department: 'Computer Science & Engg.',
    branchShort: 'CSE',
    company: 'TechNova Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
    companyColor: '#6D28D9',
    companyBg: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    role: 'Distributed Systems Backend Engineer',
    packageLpa: 17.5,
    packageFormatted: '₹17.5 LPA',
    tier: 'super-dream',
    category: 'tech',
    location: 'Bangalore, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹14,00,000',
      stock: 'Stock retention units',
      bonus: '₹2,50,000 Bonus',
      roundsCleared: 4,
      cgpa: 8.6,
      quote: 'TechNova conducted live online assessments right inside PlaceTrack.'
    }
  },
  {
    id: 'plc-datawave-10',
    name: 'Tanvi Shah',
    roll: '21IT092',
    department: 'Information Technology',
    branchShort: 'IT',
    company: 'DataWave Analytics',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
    companyColor: '#B45309',
    companyBg: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    role: 'Machine Learning Research Engineer',
    packageLpa: 18.0,
    packageFormatted: '₹18.0 LPA',
    tier: 'super-dream',
    category: 'ai',
    location: 'Hyderabad, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹15,00,000',
      stock: 'Equity options',
      bonus: '₹3,00,000 Annual retention',
      roundsCleared: 3,
      cgpa: 9.05,
      quote: 'Top 1% ranking in our campus machine learning competition opened this direct placement route.'
    }
  },
  {
    id: 'plc-cloudnest-11',
    name: 'Kavya Pillai',
    roll: '21CS034',
    department: 'Computer Science & Engg.',
    branchShort: 'CSE',
    company: 'CloudNest Systems',
    companyLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=80',
    companyColor: '#059669',
    companyBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    role: 'DevOps & Site Reliability Engineer',
    packageLpa: 15.0,
    packageFormatted: '₹15.0 LPA',
    tier: 'dream',
    category: 'tech',
    location: 'Pune, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹12,50,000',
      stock: 'Performance equity',
      bonus: '₹2,50,000 Annual Incentive',
      roundsCleared: 3,
      cgpa: 8.52,
      quote: 'The verification workflow guaranteed our resumes reached recruiters without any manual clerical delay.'
    }
  },
  {
    id: 'plc-embedded-12',
    name: 'Karthik Subramanian',
    roll: '21EC077',
    department: 'Electronics & Comm.',
    branchShort: 'ECE',
    company: 'Embedded Edge Labs',
    companyLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=80',
    companyColor: '#0284C7',
    companyBg: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
    role: 'IoT Firmware & Hardware Architect',
    packageLpa: 12.0,
    packageFormatted: '₹12.0 LPA',
    tier: 'dream',
    category: 'core',
    location: 'Bangalore, India',
    date: 'Oct 2026',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    breakdown: {
      base: '₹10,20,000',
      stock: 'Stock grants',
      bonus: '₹1,80,000 Joining stipend bonus',
      roundsCleared: 3,
      cgpa: 8.35,
      quote: 'Core hardware engineering placements were treated with equal priority and dedicated tech panels.'
    }
  }
];

export default function PlacementHallOfFame() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchiever, setSelectedAchiever] = useState(null);
  const [galleryGrayscale, setGalleryGrayscale] = useState(false);

  // Images for DomeGallery
  const domeImages = useMemo(() => {
    return PLACED_ACHIEVERS.map(item => ({
      src: item.avatar,
      alt: `${item.name} · ${item.company} (${item.packageFormatted})`
    }));
  }, []);

  const filteredAchievers = useMemo(() => {
    return PLACED_ACHIEVERS.filter(item => {
      // Filter by tab
      if (activeTab === 'marquee' && item.packageLpa < 25) return false;
      if (activeTab === 'super-dream' && (item.packageLpa < 15 || item.packageLpa >= 25)) return false;
      if (activeTab === 'dream' && item.packageLpa >= 15) return false;
      if (activeTab === 'cse' && item.branchShort !== 'CSE') return false;
      if (activeTab === 'it-ece' && !['IT', 'ECE'].includes(item.branchShort)) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCompany = item.company.toLowerCase().includes(query);
        const matchesRole = item.role.toLowerCase().includes(query);
        const matchesPkg = item.packageFormatted.toLowerCase().includes(query);
        if (!matchesName && !matchesCompany && !matchesRole && !matchesPkg) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, searchQuery]);

  return (
    <section id="placements" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0B0B0F] text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 right-10 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-violet-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Placement Records Season 2026/27</span>
            <span className="text-white/40">·</span>
            <span className="text-emerald-400 font-bold">100% Verified Offers</span>
          </div>

          <h2 className="font-display font-black tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
            Who got placed with{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
              what package
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Real students. Marquee packages. Global tier-1 tech & Fortune 500 recruiters. Explore who bagged the highest CTCs and browse verified placement milestones.
          </p>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Highest Package</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400">
              ₹45.0 LPA
            </div>
            <p className="text-[11px] text-slate-400">Google Cloud (Batch 2026)</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
              <span>Average CTC</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white">
              ₹16.4 LPA
            </div>
            <p className="text-[11px] text-slate-400">+22% YoY growth</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium text-slate-400">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>Total Offers Rolled</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white">
              340+
            </div>
            <p className="text-[11px] text-slate-400">Across 58 active drives</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Partner Recruiters</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white">
              120+
            </div>
            <p className="text-[11px] text-slate-400">MNCs, Startups & Labs</p>
          </div>
        </div>

        {/* 3D DOME GALLERY SHOWCASE CONTAINER */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#14121F] to-[#0D0B12] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Header inside 3D Dome widget */}
          <div className="p-6 pb-2 sm:px-8 sm:pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
                <Globe2 className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Interactive 3D Sphere of Achievers</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Drag to spin the 360° dome or click any student portrait to inspect full offer stats.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setGalleryGrayscale(!galleryGrayscale)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-slate-300"
              >
                {galleryGrayscale ? 'Show Color' : 'Show Monochrome'}
              </button>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>360° Drag & Zoom Enabled</span>
              </div>
            </div>
          </div>

          {/* DOME CANVAS */}
          <div className="relative w-full h-[420px] sm:h-[480px] md:h-[540px]">
            <DomeGallery
              images={domeImages}
              fit={0.5}
              minRadius={450}
              maxRadius={900}
              overlayBlurColor="#0D0B12"
              grayscale={galleryGrayscale}
              openedImageWidth="360px"
              openedImageHeight="360px"
              imageBorderRadius="24px"
              openedImageBorderRadius="24px"
            />

            {/* Subtle overlay hint */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
              <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-300 shadow-lg flex items-center gap-2">
                <span>👈 Click & drag horizontally to rotate</span>
                <span className="text-white/30">|</span>
                <span>Click photo to enlarge 👉</span>
              </div>
            </div>
          </div>

        </div>

        {/* DETAILED PLACED STUDENTS WALL / FILTERABLE GRID */}
        <div className="space-y-6 pt-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-2xl text-white">
                Detailed Placed Students Wall
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Transparent view of students, companies, job titles, and verified packages.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
            {[
              { id: 'all', label: 'All Offers', count: PLACED_ACHIEVERS.length },
              { id: 'marquee', label: 'Marquee (25+ LPA)', count: PLACED_ACHIEVERS.filter(p => p.packageLpa >= 25).length },
              { id: 'super-dream', label: 'Super Dream (15-25 LPA)', count: PLACED_ACHIEVERS.filter(p => p.packageLpa >= 15 && p.packageLpa < 25).length },
              { id: 'dream', label: 'Dream (8-15 LPA)', count: PLACED_ACHIEVERS.filter(p => p.packageLpa < 15).length },
              { id: 'cse', label: 'CSE Stream', count: PLACED_ACHIEVERS.filter(p => p.branchShort === 'CSE').length },
              { id: 'it-ece', label: 'IT & ECE', count: PLACED_ACHIEVERS.filter(p => ['IT', 'ECE'].includes(p.branchShort)).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0B0B0F] shadow-md font-bold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-black/10 text-black' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* GRID OF PLACED ACHIEVERS */}
          {filteredAchievers.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-white/[0.02] border border-white/5 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No placed students matched your search criteria.</p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="text-xs text-violet-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAchievers.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAchiever(item)}
                  className="group relative rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-violet-500/40 p-5 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1"
                >
                  {/* Top: Student photo, roll, verification */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="relative">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white/15 group-hover:border-violet-400/80 transition-colors shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0B0B0F] flex items-center justify-center text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Package Pill */}
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-tight bg-gradient-to-r from-emerald-400/20 to-teal-400/20 text-emerald-300 border border-emerald-400/30 shadow-sm">
                          {item.packageFormatted}
                        </div>
                        <span className="block text-[10px] text-slate-400 font-medium mt-1">
                          {item.tier === 'marquee' ? '🌟 Marquee Offer' : item.tier === 'super-dream' ? '✨ Super Dream' : '💼 Dream Offer'}
                        </span>
                      </div>
                    </div>

                    {/* Student Name & Branch */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display font-bold text-base text-white group-hover:text-violet-300 transition-colors">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.roll} · <span className="text-slate-300 font-medium">{item.branchShort}</span>
                      </p>
                    </div>

                    {/* Hiring Company & Role */}
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black text-white">
                          {item.company.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-display font-bold text-sm text-white">
                          {item.company}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-1">
                        {item.role}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified TPO</span>
                    </span>

                    <span className="text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* OFFER DETAILS MODAL */}
      {selectedAchiever && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#14121F] border border-white/15 p-6 sm:p-8 text-white shadow-2xl space-y-6 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src={selectedAchiever.avatar}
                  alt={selectedAchiever.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-400 shadow-md"
                />
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Placement Offer</span>
                  </div>
                  <h3 className="font-display font-black text-xl text-white">
                    {selectedAchiever.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedAchiever.roll} · {selectedAchiever.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAchiever(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Offer Key Highlights */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total CTC Package
                </span>
                <div className="font-display font-black text-2xl text-emerald-400">
                  {selectedAchiever.packageFormatted}
                </div>
                <span className="text-[10px] text-slate-400">Fixed + Variable + Stock</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hiring Partner
                </span>
                <div className="font-display font-bold text-lg text-white">
                  {selectedAchiever.company}
                </div>
                <span className="text-[10px] text-slate-400">{selectedAchiever.location}</span>
              </div>
            </div>

            {/* Role & Compensation Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-300">
                Offer Breakdown & Metrics
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Designation / Role:</span>
                  <span className="font-semibold text-white">{selectedAchiever.role}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Base Component:</span>
                  <span className="font-semibold text-white">{selectedAchiever.breakdown.base}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Stock Grants / RSUs:</span>
                  <span className="font-semibold text-emerald-300">{selectedAchiever.breakdown.stock}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Selection Rounds Cleared:</span>
                  <span className="font-semibold text-white">{selectedAchiever.breakdown.roundsCleared} Rounds</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Student CGPA:</span>
                  <span className="font-semibold text-white">{selectedAchiever.breakdown.cgpa} / 10.0</span>
                </div>
              </div>
            </div>

            {/* Student Experience Quote */}
            {selectedAchiever.breakdown.quote && (
              <div className="p-3.5 rounded-2xl bg-violet-950/40 border border-violet-500/20 text-xs text-violet-200 italic">
                "{selectedAchiever.breakdown.quote}"
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedAchiever(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
