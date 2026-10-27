/**
 * Design Tokens for PlaceTrack
 * Single source of truth for colors, typography, radii, shadows, and easings.
 */

export const tokens = {
  colors: {
    canvas: '#F6F6F8',
    surface: '#FFFFFF',
    surfaceSubtle: '#F9F9FB',
    dark: '#0B0B0F',
    darkMuted: '#1E1E24',
    border: 'rgba(11, 11, 15, 0.08)',
    borderGlass: 'rgba(255, 255, 255, 0.65)',
    
    text: {
      primary: '#0B0B0F',
      secondary: '#64748B',
      muted: '#94A3B8',
      inverted: '#FFFFFF',
    },

    accent: {
      lavender: '#8B5CF6',
      violet: '#A78BFA',
      periwinkle: '#6366F1',
      warmYellow: '#F5C451',
      mint: '#10B981',
      peach: '#FB923C',
      lilac: '#C084FC',
      sky: '#38BDF8',
      rose: '#F43F5E',
    },

    status: {
      applied: {
        bg: '#F1F5F9',
        text: '#475569',
        dot: '#64748B',
        label: 'Applied',
      },
      under_review: {
        bg: '#E0F2FE',
        text: '#0369A1',
        dot: '#0284C7',
        label: 'Under Review',
      },
      shortlisted: {
        bg: '#EDE9FE',
        text: '#6D28D9',
        dot: '#8B5CF6',
        label: 'Shortlisted',
      },
      assessment: {
        bg: '#EEF2FF',
        text: '#4338CA',
        dot: '#6366F1',
        label: 'Assessment',
      },
      interview: {
        bg: '#FEF3C7',
        text: '#B45309',
        dot: '#F59E0B',
        label: 'Interview',
      },
      selected: {
        bg: '#DCFCE7',
        text: '#15803D',
        dot: '#22C55E',
        label: 'Final Selected',
      },
      offer_released: {
        bg: '#ECFDF5',
        text: '#047857',
        dot: '#10B981',
        label: 'Offer Released',
      },
      offer_accepted: {
        bg: '#D1FAE5',
        text: '#065F46',
        dot: '#059669',
        label: 'Offer Accepted',
      },
      offer_declined: {
        bg: '#FFE4E6',
        text: '#BE123C',
        dot: '#F43F5E',
        label: 'Offer Declined',
      },
      offer_expired: {
        bg: '#F3F4F6',
        text: '#4B5563',
        dot: '#6B7280',
        label: 'Offer Expired',
      },
      rejected: {
        bg: '#FFE4E6',
        text: '#BE123C',
        dot: '#F43F5E',
        label: 'Rejected',
      },
      cancelled: {
        bg: '#F1F5F9',
        text: '#64748B',
        dot: '#94A3B8',
        label: 'Cancelled',
      },
      withdrawn: {
        bg: '#F3F4F6',
        text: '#6B7280',
        dot: '#9CA3AF',
        label: 'Withdrawn',
      },
      passed: {
        bg: '#DCFCE7',
        text: '#15803D',
        dot: '#22C55E',
        label: 'Passed',
      },
      failed: {
        bg: '#FFE4E6',
        text: '#BE123C',
        dot: '#F43F5E',
        label: 'Failed',
      },
      pending: {
        bg: '#FEF3C7',
        text: '#B45309',
        dot: '#F59E0B',
        label: 'Pending',
      },
      accepted: {
        bg: '#D1FAE5',
        text: '#065F46',
        dot: '#059669',
        label: 'Accepted',
      },
      declined: {
        bg: '#FFE4E6',
        text: '#BE123C',
        dot: '#F43F5E',
        label: 'Declined',
      },
      expired: {
        bg: '#F3F4F6',
        text: '#4B5563',
        dot: '#6B7280',
        label: 'Expired',
      },
    },
  },

  radii: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    card: '28px',
    cardLg: '32px',
    cardXl: '40px',
    pill: '9999px',
  },

  shadows: {
    soft: '0 8px 30px -6px rgba(11, 11, 15, 0.04)',
    card: '0 16px 40px -12px rgba(11, 11, 15, 0.06)',
    cardHover: '0 24px 50px -12px rgba(11, 11, 15, 0.1)',
    glass: '0 12px 36px 0 rgba(11, 11, 15, 0.05)',
    glowLavender: '0 0 60px -15px rgba(139, 92, 246, 0.35)',
    glowYellow: '0 0 60px -15px rgba(245, 196, 81, 0.35)',
  },

  fonts: {
    display: '"Outfit", sans-serif',
    body: '"Plus Jakarta Sans", sans-serif',
  },

  easings: {
    expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    power3Out: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

export default tokens;
