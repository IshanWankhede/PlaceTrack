import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  useAuth,
  IS_DEMO_ENVIRONMENT,
  DEMO_ACCOUNTS_REGISTRY,
} from '../context/AuthContext.jsx';
import { mockApi } from '../services/mockApi.js';
import Avatar from '../components/ui/Avatar.jsx';
import Input from '../components/ui/Input.jsx';
import CRTWarp from '../components/ui/CRTWarp.jsx';
import { DemoInboxModal } from '../components/ui/DemoInboxModal.jsx';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Briefcase,
  Building2,
  Award,
  BarChart3,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck,
  Layers,
  User,
  FileCheck,
  UserCog,
  Calendar,
  CheckSquare,
  Compass,
  Settings,
  Sliders,
  Sparkles,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

const PLASMA_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#06B6D4'];

export default function DashboardLayout({ children }) {
  const {
    activeDemoUser,
    activeDemoRole,
    switchDemoAccount,
    logoutDemoSession,
  } = useAuth();
  const user = activeDemoUser;
  const activeRole = activeDemoRole;

  const toast = useToast();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [inboxInitialTarget, setInboxInitialTarget] = useState(null);
  const [unreadConvCount, setUnreadConvCount] = useState(0);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [crtColor, setCrtColor] = useState(PLASMA_COLORS[0]);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Notification popover positioning & outside-click refs
  const bellButtonRef = useRef(null);
  const notificationPopoverRef = useRef(null);
  const [popoverCoords, setPopoverCoords] = useState({
    top: 60,
    left: 0,
    width: 380,
    maxHeight: 480,
    caretLeft: 340,
  });

  const updateNotificationPosition = useCallback(() => {
    if (!bellButtonRef.current) return;
    const rect = bellButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Constrain width to 380px or viewport width minus 24px on narrow screens
    const width = Math.min(380, Math.max(280, viewportWidth - 24));
    const top = Math.min(rect.bottom + 8, viewportHeight - 120);

    const bellCenter = rect.left + rect.width / 2;
    // Align popover so its right edge lines up comfortably with the bell area
    let left = rect.right - width + 18;

    // Strict clamping within viewport margins
    if (left + width > viewportWidth - 12) {
      left = viewportWidth - width - 12;
    }
    if (left < 12) {
      left = 12;
    }

    // Caret offset relative to left edge of popover
    const caretLeft = Math.max(16, Math.min(width - 24, bellCenter - left - 6));
    const maxHeight = Math.max(260, Math.min(540, viewportHeight - top - 16));

    setPopoverCoords({ top, left, width, maxHeight, caretLeft });
  }, []);

  // Close mobile sidebar & header menus on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setShowNotificationMenu(false);
    setShowRoleMenu(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  // Handle outside click, escape key, and scroll/resize repositioning for notification menu
  useEffect(() => {
    if (!showNotificationMenu) return;
    updateNotificationPosition();

    const handleWindowEvents = () => {
      updateNotificationPosition();
    };

    const handleDocumentClick = (e) => {
      if (
        notificationPopoverRef.current &&
        !notificationPopoverRef.current.contains(e.target) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(e.target)
      ) {
        setShowNotificationMenu(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotificationMenu(false);
        setShowRoleMenu(false);
        setShowSearchDropdown(false);
      }
    };

    window.addEventListener('resize', handleWindowEvents);
    window.addEventListener('scroll', handleWindowEvents, true);
    document.addEventListener('mousedown', handleDocumentClick, true);
    document.addEventListener('touchstart', handleDocumentClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleWindowEvents);
      window.removeEventListener('scroll', handleWindowEvents, true);
      document.removeEventListener('mousedown', handleDocumentClick, true);
      document.removeEventListener('touchstart', handleDocumentClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotificationMenu, updateNotificationPosition]);

  // Background color changes smoothly every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCrtColor((prev) => {
        const nextIdx = (PLASMA_COLORS.indexOf(prev) + 1) % PLASMA_COLORS.length;
        return PLASMA_COLORS[nextIdx];
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen for Demo Inbox open requests and conversation updates
  useEffect(() => {
    let mounted = true;
    async function refreshConversations() {
      if (!user?.id) return;
      try {
        const list = await mockApi.getConversations({
          userId: user.id,
          role: activeRole,
        });
        if (mounted) {
          setUnreadConvCount(list.filter((c) => c.unread).length);
        }
      } catch (e) {
        console.error(e);
      }
    }
    refreshConversations();

    const handleOpenInboxEvent = (evt) => {
      setInboxInitialTarget(evt.detail || null);
      setShowInboxModal(true);
      setShowNotificationMenu(false);
      setShowRoleMenu(false);
    };

    const handleConversationsUpdated = () => {
      refreshConversations();
    };

    window.addEventListener('placetrack-open-demo-inbox', handleOpenInboxEvent);
    window.addEventListener('placetrack-conversations-updated', handleConversationsUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('placetrack-open-demo-inbox', handleOpenInboxEvent);
      window.removeEventListener('placetrack-conversations-updated', handleConversationsUpdated);
    };
  }, [user?.id, activeRole]);

  // Live Global Search across Drives, Companies, Students, and Navigation
  useEffect(() => {
    let active = true;
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) {
      setGlobalSearchResults([]);
      return;
    }

    async function runGlobalSearch() {
      try {
        const [jobs, comps, stds] = await Promise.all([
          mockApi.getJobs(),
          mockApi.getCompanies(),
          activeRole === 'STUDENT' ? Promise.resolve([]) : mockApi.getStudents(),
        ]);
        if (!active) return;

        const matches = [];
        jobs.forEach((j) => {
          if (
            (j.company || '').toLowerCase().includes(q) ||
            (j.title || '').toLowerCase().includes(q) ||
            (j.tier || '').toLowerCase().includes(q)
          ) {
            matches.push({
              id: `job-${j.id}`,
              category: 'Job Drive',
              title: `${j.company} — ${j.title}`,
              subtitle: `${j.package_lpa || j.packageLPA} LPA · ${j.tier}`,
              path: '/dashboard/jobs',
            });
          }
        });

        comps.forEach((c) => {
          if (
            (c.name || '').toLowerCase().includes(q) ||
            (c.sector || '').toLowerCase().includes(q)
          ) {
            matches.push({
              id: `comp-${c.id}`,
              category: 'Partner Company',
              title: c.name,
              subtitle: `${c.sector} · ${c.tier} Tier`,
              path: activeRole === 'STUDENT' ? '/dashboard/jobs' : '/dashboard/companies',
            });
          }
        });

        stds.forEach((s) => {
          if (
            (s.name || '').toLowerCase().includes(q) ||
            (s.roll_number || '').toLowerCase().includes(q) ||
            (s.department || '').toLowerCase().includes(q)
          ) {
            matches.push({
              id: `std-${s.id}`,
              category: 'Student Record',
              title: `${s.name} (${s.roll_number})`,
              subtitle: `${s.department} · CGPA ${s.cgpa}`,
              path: '/dashboard/students',
            });
          }
        });

        setGlobalSearchResults(matches.slice(0, 8));
      } catch (e) {
        console.error(e);
      }
    }

    runGlobalSearch();
    return () => {
      active = false;
    };
  }, [globalSearchQuery, activeRole]);

  // Load recipient-scoped notifications & listen for instant event updates
  useEffect(() => {
    let mounted = true;
    async function fetchRoleNotifications(isPoll = false) {
      if (!user?.id) return;
      try {
        const res = await mockApi.getNotifications({
          poll: isPoll,
          role: activeRole,
          userId: user.id,
        });
        if (mounted && res?.notifications) {
          setNotifications(res.notifications);
          if (isPoll && res.latestPolled) {
            const notif = res.latestPolled;
            const toastFn = toast[notif.type] || toast.info;
            toastFn(notif.title, notif.message, {
              actionLabel: 'View',
              onAction: () => navigate(notif.link || '/dashboard'),
              duration: 4500,
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchRoleNotifications(false);

    const handleNotificationsUpdated = () => {
      fetchRoleNotifications(false);
    };
    window.addEventListener('placetrack-notifications-updated', handleNotificationsUpdated);

    const pollInterval = setInterval(() => {
      fetchRoleNotifications(true);
    }, 30000);

    return () => {
      mounted = false;
      window.removeEventListener('placetrack-notifications-updated', handleNotificationsUpdated);
      clearInterval(pollInterval);
    };
  }, [activeRole, user?.id, navigate, toast]);

  // Refresh notifications when opening bell dropdown
  const handleToggleNotificationMenu = async () => {
    const nextState = !showNotificationMenu;
    if (nextState) {
      updateNotificationPosition();
    }
    setShowNotificationMenu(nextState);
    setShowRoleMenu(false);
    if (nextState && user?.id) {
      try {
        const res = await mockApi.getNotifications({
          poll: false,
          role: activeRole,
          userId: user.id,
        });
        if (res?.notifications) setNotifications(res.notifications);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Distinct Navigation items per role (ADMIN, STAFF, STUDENT)
  const adminNav = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/dashboard/students', icon: Users },
    { label: 'Placement Staff / User Management', path: '/dashboard/user-management', icon: UserCog },
    { label: 'Companies', path: '/dashboard/companies', icon: Building2 },
    { label: 'Job Drives', path: '/dashboard/jobs', icon: Briefcase },
    { label: 'Applications', path: '/dashboard/applications', icon: FileSpreadsheet },
    { label: 'Placements and Offers', path: '/dashboard/placements', icon: Award },
    { label: 'Analytics and Reports', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Placement Policies', path: '/dashboard/policies', icon: Sliders },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
  ];

  const staffNav = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/dashboard/students', icon: Users },
    { label: 'Companies', path: '/dashboard/companies', icon: Building2 },
    { label: 'Job Drives', path: '/dashboard/jobs', icon: Briefcase },
    { label: 'Eligible Students', path: '/dashboard/eligible-students', icon: UserCheck },
    { label: 'Applications', path: '/dashboard/applications', icon: FileSpreadsheet },
    { label: 'Interview Schedule', path: '/dashboard/interviews', icon: Calendar },
    { label: 'Results and Selection', path: '/dashboard/results', icon: CheckSquare },
    { label: 'Offers and Placements', path: '/dashboard/placements', icon: Award },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
  ];

  const studentNav = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
    { label: 'Available Jobs', path: '/dashboard/jobs', icon: Briefcase },
    { label: 'My Applications', path: '/dashboard/my-applications', icon: Layers },
    { label: 'My Interviews', path: '/dashboard/my-interviews', icon: Calendar },
    { label: 'My Offers', path: '/dashboard/my-placement', icon: Award },
    { label: 'My Placement Progress', path: '/dashboard/my-progress', icon: Compass },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const currentNav =
    activeRole === 'ADMIN'
      ? adminNav
      : activeRole === 'STAFF'
      ? staffNav
      : studentNav;

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Single authoritative account switch handler
  const handleSwitchDemoAccount = (targetAccountId) => {
    const nextUser = switchDemoAccount(targetAccountId);
    setShowRoleMenu(false);
    setShowNotificationMenu(false);

    if (!nextUser) return;

    // Navigate to /dashboard so the user immediately sees the new role's Overview dashboard
    navigate('/dashboard');

    toast.info(
      `Active Account: ${nextUser.name}`,
      `Switched session to ${nextUser.role} (${
        nextUser.designation || nextUser.title || nextUser.roll_number || nextUser.email
      })`
    );
  };

  const handleLogout = () => {
    setShowRoleMenu(false);
    setShowNotificationMenu(false);
    logoutDemoSession();
    toast.info('Session Ended', 'You have been signed out of the platform.');
    navigate('/login');
  };

  const roleSubtitle =
    activeRole === 'ADMIN'
      ? user?.designation || user?.title || 'Dean of Corporate Relations'
      : activeRole === 'STAFF'
      ? user?.designation || user?.title || 'Senior Placement Coordinator (TPO)'
      : `${user?.roll_number || '21EC015'} · ${user?.department || 'Electronics & Comm.'}`;

  return (
    <div className="relative min-h-screen bg-[#07070A] p-2 md:p-6 lg:p-8 flex flex-col justify-center items-center overflow-hidden">
      {/* Dynamic CRTWarp Background */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <CRTWarp
          color={crtColor}
          backgroundColor="#07070A"
          mask="aperture"
          curvature={0.2}
          persistence={0.45}
          speed={0.4}
          bloom={1.8}
          vignette={0.45}
          scanlineStrength={0.3}
          changeOnClick={true}
        />
      </div>

      {/* Main Floating Glassmorphic App Frame */}
      <div className="relative z-10 w-full max-w-[1600px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3.5rem)] bg-white/70 backdrop-blur-3xl rounded-[24px] sm:rounded-[32px] md:rounded-[40px] shadow-[0_36px_120px_rgba(0,0,0,0.85),0_0_90px_rgba(0,0,0,0.65)] overflow-hidden flex flex-row">
        {/* Mobile Sidebar Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* TALL FROSTED BLACK ROUNDED SIDEBAR */}
        <aside
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          className={`h-full bg-black text-white flex flex-col justify-between py-6 transition-all duration-300 z-40 select-none shadow-[12px_0_40px_rgba(0,0,0,0.28)] fixed md:static inset-y-0 left-0 ${
            isMobileSidebarOpen
              ? 'translate-x-0 w-64 px-4'
              : '-translate-x-full md:translate-x-0'
          } ${isSidebarHovered ? 'md:w-64 md:px-4' : 'md:w-20 md:px-3'}`}
        >
          {/* Top Logo */}
          <div className="flex items-center justify-between px-2 mb-6">
            <Link to="/" className="flex items-center gap-3 group min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-[#0B0B0F] flex items-center justify-center font-display font-black text-sm tracking-tighter shadow-sm flex-shrink-0 transition-transform group-hover:scale-105">
                P.
              </div>
              {(isSidebarHovered || isMobileSidebarOpen) && (
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="font-display font-bold text-base tracking-tight text-white block">
                    PlaceTrack
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                    {activeRole === 'ADMIN'
                      ? 'CDC Admin Portal'
                      : activeRole === 'STAFF'
                      ? 'TPO Staff Desk'
                      : 'Student Hub'}
                  </span>
                </div>
              )}
            </Link>
            {isMobileSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1.5 py-4 overflow-y-auto">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  title={!isSidebarHovered && !isMobileSidebarOpen ? item.label : undefined}
                  className={`group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#0B0B0F] font-bold shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#0B0B0F]' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {(isSidebarHovered || isMobileSidebarOpen) && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom section: Active Demo Account summary and Logout */}
          <div className="space-y-3 pt-4">
            {(isSidebarHovered || isMobileSidebarOpen) && (
              <div className="px-2.5 py-2 bg-white/5 rounded-xl text-[11px] text-slate-400 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-white font-semibold truncate">{user?.name}</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/10 text-violet-300">
                    {activeRole}
                  </span>
                </div>
                <div className="truncate text-slate-400 font-medium">
                  {roleSubtitle}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-sm cursor-pointer"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {(isSidebarHovered || isMobileSidebarOpen) && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-transparent">
          {/* GLASS TOP BAR */}
          <header className="h-16 sm:h-20 px-4 sm:px-6 lg:px-10 border-b border-white/40 flex items-center justify-between gap-2.5 sm:gap-4 flex-shrink-0 bg-white/50 backdrop-blur-xl z-20">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 max-w-md">
              {/* Mobile Sidebar Drawer Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="p-2 rounded-full bg-white/80 hover:bg-white text-[#0B0B0F] border border-black/10 shadow-2xs md:hidden shrink-0 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Pill Input with Live Results Dropdown */}
              <div className="relative w-full min-w-0">
              <Input
                variant="pill"
                icon={Search}
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search students, drives, companies, tags..."
                className="w-full bg-white/70 backdrop-blur-md"
              />
              {showSearchDropdown && globalSearchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/10 p-2 z-50 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 flex items-center justify-between border-b border-black/5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Quick Jump Results ({globalSearchResults.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalSearchQuery('');
                        setShowSearchDropdown(false);
                      }}
                      className="text-[10px] font-bold text-violet-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  {globalSearchResults.length > 0 ? (
                    <div className="divide-y divide-black/5">
                      {globalSearchResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setGlobalSearchQuery('');
                            navigate(item.path);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-violet-50/70 rounded-xl transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0B0B0F] truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.subtitle}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                            {item.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No matching drives, companies, or student records for &ldquo;{globalSearchQuery}&rdquo;.
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>

            {/* Right actions: Demo Account Quick Switcher + Demo Inbox + Bell notification + User Profile Dropdown */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
              {/* Quick Demo Account Switcher Pill */}
              {IS_DEMO_ENVIRONMENT && (
                <div className="hidden xl:flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-violet-200/80 shadow-2xs">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-violet-700 px-2 py-0.5 rounded-full bg-violet-100/80">
                    <Sparkles className="w-3 h-3" />
                    Role Switcher
                  </span>
                  {DEMO_ACCOUNTS_REGISTRY.map((acc) => {
                    const isSelected = user?.id === acc.id || activeRole === acc.role;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSwitchDemoAccount(acc.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0B0B0F] text-white shadow-xs'
                            : 'text-[#475569] hover:text-[#0B0B0F] hover:bg-black/5'
                        }`}
                        title={`Switch active session to ${acc.name} (${acc.role})`}
                      >
                        <span>
                          {acc.role === 'ADMIN'
                            ? 'Admin'
                            : acc.role === 'STAFF'
                            ? 'Staff'
                            : 'Student'}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Inbox Button */}
              <button
                type="button"
                onClick={() => {
                  setInboxInitialTarget(null);
                  setShowInboxModal(true);
                  setShowNotificationMenu(false);
                  setShowRoleMenu(false);
                }}
                className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/70 hover:bg-white text-[#475569] hover:text-[#0B0B0F] border border-white/80 shadow-2xs transition-colors cursor-pointer"
                title="Open Inbox"
              >
                <MessageSquare className="w-4 h-4 text-[#0B0B0F]" />
                <span className="hidden md:inline text-xs font-bold text-[#0B0B0F]">
                  Inbox
                </span>
                {unreadConvCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-[#0B0B0F] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center tabular-nums">
                    {unreadConvCount}
                  </span>
                )}
              </button>

              {/* Notification Bell with Recipient-Scoped Live List & Unread Count */}
              <div className="relative inline-flex items-center">
                <button
                  ref={bellButtonRef}
                  type="button"
                  aria-expanded={showNotificationMenu}
                  aria-haspopup="dialog"
                  onClick={handleToggleNotificationMenu}
                  className={`relative p-2.5 rounded-full transition-colors ${
                    showNotificationMenu
                      ? 'bg-white shadow-2xs text-[#0B0B0F]'
                      : 'hover:bg-white/60 text-[#475569] hover:text-[#0B0B0F]'
                  }`}
                  title={`Notifications for ${user?.name} (${activeRole})`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full ring-2 ring-white flex items-center justify-center tabular-nums shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotificationMenu &&
                  typeof document !== 'undefined' &&
                  createPortal(
                    <div
                      ref={notificationPopoverRef}
                      style={{
                        position: 'fixed',
                        top: `${popoverCoords.top}px`,
                        left: `${popoverCoords.left}px`,
                        width: `${popoverCoords.width}px`,
                        maxHeight: `${popoverCoords.maxHeight}px`,
                        zIndex: 9999,
                      }}
                      role="dialog"
                      aria-label={`${activeRole} notifications`}
                      className="flex flex-col bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-150 select-none overflow-hidden"
                    >
                      {/* Visual Caret Pointer directly targeting the Bell Button */}
                      <div
                        className="absolute -top-1.5 w-3 h-3 bg-white/95 border-t border-l border-white/80 rotate-45 transform pointer-events-none"
                        style={{ left: `${popoverCoords.caretLeft}px` }}
                      />

                      {/* Popover Header (Pinned) */}
                      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-black/5 bg-slate-50/70">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B0B0F]">
                              {activeRole} Notifications
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Recipient: <span className="font-medium text-slate-700">{user?.name}</span>{' '}
                            <span className="text-slate-400">({user?.id})</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              unreadCount > 0
                                ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            }`}
                          >
                            {unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowNotificationMenu(false)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                            title="Close notifications"
                            aria-label="Close notifications"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Popover Body (Scrollable List) */}
                      <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                            <Bell className="w-6 h-6 text-slate-300 stroke-[1.5]" />
                            <p>No notifications for {user?.name}.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={async () => {
                                if (!notif.read) {
                                  const updated = await mockApi.markNotificationRead(
                                    notif.id,
                                    {
                                      role: activeRole,
                                      userId: user?.id,
                                    }
                                  );
                                  setNotifications(updated);
                                }
                                setShowNotificationMenu(false);
                                if (notif.link) navigate(notif.link);
                              }}
                              className={`group p-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border flex items-start gap-3 ${
                                notif.read
                                  ? 'border-transparent opacity-75'
                                  : 'border-violet-200 bg-violet-50/50 shadow-2xs'
                              }`}
                            >
                              <div
                                className={`p-2 rounded-lg group-hover:scale-105 transition-transform flex-shrink-0 ${
                                  notif.type === 'placement'
                                    ? 'bg-violet-100 text-violet-600'
                                    : notif.type === 'warning'
                                    ? 'bg-amber-100 text-amber-600'
                                    : notif.type === 'success'
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                {notif.type === 'placement' ? (
                                  <Award className="w-4 h-4" />
                                ) : notif.type === 'success' ? (
                                  <FileCheck className="w-4 h-4" />
                                ) : (
                                  <Briefcase className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {!notif.read && (
                                      <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                                    )}
                                    <p className="text-xs font-bold text-[#0B0B0F] truncate">
                                      {notif.title}
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                                    {notif.timestamp}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                                  {notif.message}
                                </p>
                                <div className="flex items-center justify-between gap-2 mt-1.5">
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {notif.event_type || 'SYSTEM_ALERT'}
                                  </span>
                                  {!notif.read && (
                                    <button
                                      type="button"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const updated = await mockApi.markNotificationRead(
                                          notif.id,
                                          {
                                            role: activeRole,
                                            userId: user?.id,
                                          }
                                        );
                                        setNotifications(updated);
                                      }}
                                      className="text-[10px] font-bold text-violet-700 hover:text-violet-900 hover:underline"
                                    >
                                      Mark read
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Popover Footer (Pinned) */}
                      <div className="flex-shrink-0 px-4 py-2.5 border-t border-black/5 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotificationMenu(false);
                            navigate('/dashboard/notifications');
                          }}
                          className="font-bold text-[#0B0B0F] hover:text-violet-700 transition-colors"
                        >
                          Open Notification Center →
                        </button>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={async () => {
                              const updated = await mockApi.markNotificationsRead({
                                role: activeRole,
                                userId: user?.id,
                              });
                              setNotifications(updated);
                              toast.success(
                                'All notifications marked read',
                                `Cleared unread inbox for ${user?.name}.`
                              );
                            }}
                            className="text-violet-600 font-semibold hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}
              </div>

              <div className="h-7 w-[1px] bg-black/10 hidden sm:block" />

              {/* User Account Dropdown Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleMenu(!showRoleMenu);
                    setShowNotificationMenu(false);
                  }}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white/60 hover:bg-white transition-all border border-white/60 shadow-2xs"
                >
                  <Avatar
                    src={user?.photo_url || user?.avatar}
                    name={user?.name}
                    size="sm"
                    status="online"
                  />
                  <div className="text-left hidden md:block">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#0B0B0F] leading-tight">
                        {user?.name}
                      </p>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                          activeRole === 'ADMIN'
                            ? 'bg-violet-100 text-violet-800'
                            : activeRole === 'STAFF'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {activeRole}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#64748B] font-medium leading-tight">
                      {roleSubtitle}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-xs bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 py-3 z-50 animate-in fade-in zoom-in-95">
                    {/* CURRENT DEMO ACCOUNT */}
                    <div className="px-4 pb-3 border-b border-black/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Current Demo Account
                        </span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                          DEMO ACCOUNT
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pt-0.5">
                        <Avatar
                          src={user?.photo_url || user?.avatar}
                          name={user?.name}
                          size="md"
                          status="online"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-extrabold text-[#0B0B0F] truncate">
                              {user?.name}
                            </p>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                activeRole === 'ADMIN'
                                  ? 'bg-violet-100 text-violet-800'
                                  : activeRole === 'STAFF'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {activeRole}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-[#475569] truncate mt-0.5">
                            {roleSubtitle}
                          </p>
                          <p className="text-[10px] text-[#64748B] truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SWITCH ACCOUNT */}
                    {IS_DEMO_ENVIRONMENT && (
                      <div className="py-2 border-b border-black/5">
                        <div className="px-4 pb-1.5 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">
                            Switch Account
                          </span>
                        </div>

                        {DEMO_ACCOUNTS_REGISTRY.map((accountItem) => {
                          const isCurrent =
                            user?.id === accountItem.id ||
                            (activeRole === accountItem.role &&
                              accountItem.role !== 'STUDENT');

                          const rolePrefix =
                            accountItem.role === 'ADMIN'
                              ? 'Admin'
                              : accountItem.role === 'STAFF'
                              ? 'Staff'
                              : 'Student';

                          return (
                            <button
                              key={accountItem.id}
                              type="button"
                              onClick={() => handleSwitchDemoAccount(accountItem.id)}
                              className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between ${
                                isCurrent
                                  ? 'bg-violet-50/80 text-[#0B0B0F]'
                                  : 'hover:bg-black/5 text-[#0B0B0F]'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold truncate">
                                  {rolePrefix} — {accountItem.name}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {accountItem.designation}
                                </p>
                              </div>
                              {isCurrent && (
                                <UserCheck className="w-4 h-4 text-violet-600 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* SESSION ACTION */}
                    <div className="pt-1.5 space-y-0.5">
                      <div className="px-4 py-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Session Action
                        </span>
                      </div>

                      <Link
                        to="/dashboard/profile"
                        onClick={() => setShowRoleMenu(false)}
                        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-black/5 text-[#0B0B0F] flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-violet-600" />
                        <span>My Profile & 3D ID Card</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* PAGE VIEWPORT WITH GLASS BACKGROUND */}
          <main
            className="flex-1 overflow-y-auto bg-slate-100/35 backdrop-blur-md p-4 sm:p-6 lg:p-8 scroll-smooth"
            onClick={() => {
              if (showSearchDropdown) setShowSearchDropdown(false);
              if (showNotificationMenu) setShowNotificationMenu(false);
              if (showRoleMenu) setShowRoleMenu(false);
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Simulated Frontend Demo Inbox Modal */}
      <DemoInboxModal
        isOpen={showInboxModal}
        onClose={() => {
          setShowInboxModal(false);
          setInboxInitialTarget(null);
        }}
        initialTarget={inboxInitialTarget}
      />
    </div>
  );
}
