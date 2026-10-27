/**
 * Centralized validation & role-based visibility helpers for interactive controls:
 * - Phone call (tel:) links
 * - Interview meeting URLs
 * - Role-based contact visibility
 */

/**
 * Validates whether a phone string is a usable telephone number
 * (at least 7 digits, only allowed phone characters).
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return {
      valid: false,
      reason: 'No phone number is recorded for this contact.',
      sanitized: '',
      telHref: null,
    };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return {
      valid: false,
      reason: 'Phone number field is empty.',
      sanitized: '',
      telHref: null,
    };
  }

  // Allow digits, +, spaces, hyphens, parentheses
  const allowedPattern = /^[+\d\s\-()]+$/;
  if (!allowedPattern.test(trimmed)) {
    return {
      valid: false,
      reason: 'Phone number contains unsupported characters.',
      sanitized: trimmed,
      telHref: null,
    };
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      valid: false,
      reason: 'Phone number must contain between 7 and 15 digits.',
      sanitized: trimmed,
      telHref: null,
    };
  }

  const normalized = trimmed.startsWith('+') ? `+${digitsOnly}` : digitsOnly;
  return {
    valid: true,
    reason: null,
    sanitized: trimmed,
    telHref: `tel:${normalized}`,
  };
}

/**
 * Enforces role-based visibility of phone numbers & direct contact details:
 * - ADMIN and STAFF can view contact details for Students, Staff, Admins, and HR contacts.
 * - STUDENT can view their own contact details and official Placement Staff (TPO) desk contacts,
 *   but cannot view private phone numbers of other students or external corporate HR contacts.
 */
export function canViewContactDetails({
  viewerRole = 'STUDENT',
  viewerId = '',
  targetRole = 'STUDENT',
  targetId = '',
}) {
  if (viewerRole === 'ADMIN' || viewerRole === 'STAFF') {
    return { allowed: true, reason: null };
  }

  // Student viewer
  if (viewerId && targetId && viewerId === targetId) {
    return { allowed: true, reason: null };
  }

  if (targetRole === 'STAFF' || targetRole === 'ADMIN') {
    return { allowed: true, reason: null };
  }

  if (targetRole === 'HR') {
    return {
      allowed: false,
      reason:
        'Corporate HR phone numbers are restricted to Placement Staff (TPO) and Admin roles.',
    };
  }

  return {
    allowed: false,
    reason: 'Other students’ private phone numbers are hidden for student roles.',
  };
}

/**
 * Validates an interview meeting link, mode, and status.
 * Never invents a link if missing, cancelled, or in-person.
 */
export function evaluateInterviewMeetingLink(interview) {
  if (!interview) {
    return {
      canJoin: false,
      url: null,
      statusLabel: 'Unavailable',
      explanation: 'Interview record not found.',
    };
  }

  const isCancelled =
    interview.attendance === 'CANCELLED' || interview.result === 'CANCELLED';
  if (isCancelled) {
    return {
      canJoin: false,
      url: null,
      statusLabel: 'Interview Cancelled',
      explanation:
        'This interview slot was cancelled. Virtual meeting access is disabled.',
    };
  }

  const mode = (interview.mode || 'ONLINE').toUpperCase();
  if (mode === 'IN_PERSON') {
    return {
      canJoin: false,
      url: null,
      statusLabel: 'In-Person Session',
      explanation: `In-person interview at ${
        interview.venue || interview.location || 'Campus Venue'
      }. No online meeting link is used.`,
    };
  }

  const rawUrl = (interview.meeting_link || '').trim();
  if (!rawUrl) {
    return {
      canJoin: false,
      url: null,
      statusLabel: 'Link Not Configured',
      explanation:
        'No meeting URL has been configured by Placement Staff for this online session yet.',
    };
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        canJoin: false,
        url: null,
        statusLabel: 'Invalid Protocol',
        explanation: 'Meeting URL must use https:// or http:// protocol.',
      };
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        canJoin: false,
        url: null,
        statusLabel: 'Invalid URL Format',
        explanation: 'Meeting URL hostname is malformed.',
      };
    }

    return {
      canJoin: true,
      url: parsed.toString(),
      hostname: parsed.hostname,
      statusLabel: 'Join Meeting',
      explanation: `Configured meeting URL (${parsed.hostname})`,
    };
  } catch {
    return {
      canJoin: false,
      url: null,
      statusLabel: 'Malformed URL',
      explanation: 'The configured meeting URL is not a valid web address.',
    };
  }
}
