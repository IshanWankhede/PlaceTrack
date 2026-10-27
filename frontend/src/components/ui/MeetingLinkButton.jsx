import React, { useState } from 'react';
import { Video, MapPin, Ban, AlertCircle, ExternalLink } from 'lucide-react';
import { evaluateInterviewMeetingLink } from '../../utils/interactionHelpers.js';

/**
 * Validated Join Meeting control for configured demo interviews.
 * - Validates URL format and allowed protocols (https: / http:).
 * - Opens links only when the user clicks the anchor.
 * - Handles cancelled interviews, in-person rounds, and missing/invalid URLs gracefully.
 */
export const MeetingLinkButton = ({
  interview,
  compact = false,
  className = '',
}) => {
  const [showReason, setShowReason] = useState(false);
  const evaluation = evaluateInterviewMeetingLink(interview);

  if (evaluation.status === 'CANCELLED') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[11px] font-bold ${className}`}
        title={evaluation.reason}
      >
        <Ban className="w-3.5 h-3.5 shrink-0" />
        <span>Cancelled — Link Inactive</span>
      </div>
    );
  }

  if (evaluation.status === 'IN_PERSON') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-[11px] font-bold ${className}`}
        title={evaluation.reason}
      >
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>
          In-Person: {interview?.venue || interview?.location || 'Campus Venue'}
        </span>
      </div>
    );
  }

  if (evaluation.valid && evaluation.href) {
    return (
      <a
        href={evaluation.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold transition-colors border ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-[12px]'
        } bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE] ${className}`}
        title={`Open meeting link (${evaluation.href})`}
      >
        <Video className="w-3.5 h-3.5 shrink-0" />
        <span>Join Meeting</span>
        <ExternalLink className="w-3 h-3 opacity-75 shrink-0" />
      </a>
    );
  }

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setShowReason((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold border ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]'
        } bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]`}
        title={evaluation.reason}
      >
        <AlertCircle className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
        <span>Meeting Link Pending</span>
      </button>
      {showReason && (
        <span className="text-[11px] text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] rounded-md px-2 py-1 max-w-xs">
          {evaluation.reason}
        </span>
      )}
    </div>
  );
};
