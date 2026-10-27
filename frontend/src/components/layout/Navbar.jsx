import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import {
  Workflow,
  Sparkles,
  Building2,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  {
    id: 'how-it-works',
    label: 'How it works',
    href: '#how-it-works',
    icon: Workflow,
    description: '4-step automated placement pipeline',
  },
  {
    id: 'features',
    label: 'Features',
    href: '#features',
    icon: Sparkles,
    description: 'Smart eligibility & live round tracking',
  },
  {
    id: 'preview',
    label: 'For Recruiters',
    href: '#preview',
    icon: Building2,
    description: 'Campus hiring command center',
  },
  {
    id: 'stats',
    label: 'Analytics',
    href: '#stats',
    icon: BarChart3,
    description: 'Placement conversion benchmarks',
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [focusedItem, setFocusedItem] = useState(null);
  const [activeTouchItem, setActiveTouchItem] = useState(null);
  const [labelPositions, setLabelPositions] = useState({});

  const navRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Scroll detection & active section spy
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      // Determine active section using vertical scroll position
      const scrollPos = window.scrollY + 180;
      let currentSection = '';

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPos >= top) {
            currentSection = item.id;
            break;
          }
        }
      }

      if (window.scrollY < 260) {
        currentSection = '';
      }

      setActiveSection(currentSection);

      // Dismiss any open touch label when the user scrolls
      if (activeTouchItem) {
        setActiveTouchItem(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTouchItem]);

  // Click outside listener for touch device label dismissal
  useEffect(() => {
    const handleOutsideInteraction = (e) => {
      if (!e.target.closest('[data-nav-dock]')) {
        setActiveTouchItem(null);
      }
    };

    document.addEventListener('touchstart', handleOutsideInteraction, { passive: true });
    document.addEventListener('click', handleOutsideInteraction);
    return () => {
      document.removeEventListener('touchstart', handleOutsideInteraction);
      document.removeEventListener('click', handleOutsideInteraction);
    };
  }, []);

  // Compute boundary-aware label alignment to prevent right/left edge viewport overflow
  const calculateLabelAlignment = useCallback((itemId, element) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const iconCenter = rect.left + rect.width / 2;

    // Standard floating pill label width is roughly 120-140px (half-width ~70px)
    // Safe buffer margin is 20px
    if (iconCenter - 75 < 20) {
      setLabelPositions((prev) => ({ ...prev, [itemId]: 'left' }));
    } else if (iconCenter + 75 > viewportWidth - 20) {
      setLabelPositions((prev) => ({ ...prev, [itemId]: 'right' }));
    } else {
      setLabelPositions((prev) => ({ ...prev, [itemId]: 'center' }));
    }
  }, []);

  // Smooth scroll handler
  const handleNavClick = (e, item) => {
    e.preventDefault();
    const element = document.getElementById(item.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(item.id);
    }
    setHoveredItem(null);
    setFocusedItem(null);
    setActiveTouchItem(null);
  };

  // Brand click: scroll to top smoothly
  const handleBrandClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Touch item tap handler:
  // First tap on touch reveals label; second tap on revealed item (or on the label) navigates.
  const handleTouchItem = (e, item) => {
    if (activeTouchItem === item.id) {
      // Second tap: navigate to destination
      handleNavClick(e, item);
      setActiveTouchItem(null);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    } else {
      // First tap: reveal label smoothly
      e.preventDefault();
      calculateLabelAlignment(item.id, e.currentTarget);
      setActiveTouchItem(item.id);

      // Auto-dismiss after 3.5s of inactivity
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = setTimeout(() => {
        setActiveTouchItem(null);
      }, 3500);
    }
  };

  const handleMouseEnter = (itemId, element) => {
    calculateLabelAlignment(itemId, element);
    setHoveredItem(itemId);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleFocus = (itemId, element) => {
    calculateLabelAlignment(itemId, element);
    setFocusedItem(itemId);
  };

  const handleBlur = () => {
    setFocusedItem(null);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-3.5 sm:top-5 inset-x-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none">
      <nav
        ref={navRef}
        aria-label="Main Navigation"
        className={`pointer-events-auto transition-all duration-300 ease-out flex items-center justify-between gap-3 sm:gap-6 md:gap-8 rounded-full border ${
          scrolled
            ? 'py-2 px-3 sm:px-5 bg-white/80 backdrop-blur-2xl border-white/85 shadow-[0_12px_36px_rgba(11,11,15,0.08)] max-w-3xl'
            : 'py-2.5 sm:py-3 px-3.5 sm:px-6 bg-white/70 backdrop-blur-xl border-white/75 shadow-[0_8px_30px_rgba(11,11,15,0.04)] max-w-4xl'
        } w-full`}
      >
        {/* ============================================================ */}
        {/* 1. BRAND LOGO & TITLE                                        */}
        {/* ============================================================ */}
        <Link
          to="/"
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 group shrink-0 select-none focus-visible:outline-2 focus-visible:outline-violet-500 rounded-full"
        >
          <div className="w-8 h-8 rounded-full bg-[#0B0B0F] text-white flex items-center justify-center font-display font-black text-xs tracking-tighter shadow-sm transition-transform group-hover:scale-105 relative">
            <span>P.</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
          </div>
          <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-[#0B0B0F] hidden sm:inline-block">
            PlaceTrack
          </span>
        </Link>

        {/* ============================================================ */}
        {/* 2. ICON-FIRST COMPACT NAVIGATION DOCK                        */}
        {/* ============================================================ */}
        <div
          data-nav-dock="true"
          className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-black/[0.04] border border-black/[0.05] shadow-2xs relative"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isRevealed =
              hoveredItem === item.id ||
              focusedItem === item.id ||
              activeTouchItem === item.id;
            const alignment = labelPositions[item.id] || 'center';

            return (
              <div
                key={item.id}
                data-nav-item={item.id}
                className="relative"
                onMouseEnter={(e) => handleMouseEnter(item.id, e.currentTarget)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Stationary Icon-Only Button */}
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  onFocus={(e) => handleFocus(item.id, e.currentTarget)}
                  onBlur={handleBlur}
                  onTouchStart={(e) => handleTouchItem(e, item)}
                  aria-label={item.label}
                  aria-describedby={isRevealed ? `nav-tooltip-${item.id}` : undefined}
                  className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 select-none group focus-visible:outline-2 focus-visible:outline-violet-500 focus-visible:outline-offset-2 ${
                    isActive
                      ? 'bg-[#0B0B0F] text-white shadow-xs'
                      : isRevealed
                      ? 'bg-black/10 text-[#0B0B0F]'
                      : 'text-[#475569] hover:text-[#0B0B0F] hover:bg-black/5'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />

                  {/* Active Section Lime/Emerald Indicator Dot */}
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                  )}
                </a>

                {/* ============================================================ */}
                {/* 3. SMOOTH EXPANDING FLOATING LABEL (HOVER / TOUCH / FOCUS)   */}
                {/* ============================================================ */}
                <div
                  id={`nav-tooltip-${item.id}`}
                  role="tooltip"
                  className={`absolute top-[calc(100%+8px)] z-50 pointer-events-auto transition-all duration-200 ease-out ${
                    isRevealed
                      ? 'opacity-100 translate-y-0 scale-100 visible'
                      : 'opacity-0 -translate-y-1.5 scale-95 invisible pointer-events-none'
                  } ${
                    alignment === 'left'
                      ? 'left-0 origin-top-left'
                      : alignment === 'right'
                      ? 'right-0 origin-top-right'
                      : 'left-1/2 -translate-x-1/2 origin-top'
                  }`}
                >
                  {/* Invisible Hit Bridge: Prevents pointer-leave flicker when moving onto label */}
                  <div className="absolute -top-2.5 inset-x-0 h-2.5" />

                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0B0F]/95 backdrop-blur-xl text-white text-xs font-semibold shadow-[0_12px_28px_-4px_rgba(11,11,15,0.35)] border border-white/15 whitespace-nowrap hover:bg-[#0B0B0F] transition-colors group/label"
                  >
                    {/* Micro Caret Pointer */}
                    <div
                      className={`absolute -top-1 w-2 h-2 bg-[#0B0B0F] border-t border-l border-white/15 rotate-45 ${
                        alignment === 'left'
                          ? 'left-3.5'
                          : alignment === 'right'
                          ? 'right-3.5'
                          : 'left-1/2 -translate-x-1/2'
                      }`}
                    />

                    {/* Lime-green dot indicator */}
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
                    <span className="tracking-tight">{item.label}</span>

                    {/* Touch device contextual hint */}
                    {activeTouchItem === item.id && (
                      <span className="text-[10px] text-emerald-300 font-normal pl-1 border-l border-white/20">
                        Tap to jump
                      </span>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 4. CTA & ACCOUNT PILLS                                       */}
        {/* ============================================================ */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {user ? (
            <Link
              to="/dashboard/profile"
              className="text-xs font-semibold text-[#0B0B0F] hover:text-violet-600 px-2.5 py-1.5 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[100px] md:max-w-[120px]">{user.name}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-[#0B0B0F] hover:text-black px-2.5 py-1.5 transition-colors hidden sm:inline-block"
            >
              Log in
            </Link>
          )}

          <Button
            variant="primary"
            size="sm"
            magnetic={true}
            onClick={handleGetStarted}
            icon={ArrowRight}
            iconPosition="right"
            className="px-3 sm:px-4 text-xs font-bold"
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
