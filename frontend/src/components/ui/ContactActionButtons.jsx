import React, { useState } from 'react';
import { Phone, PhoneOff, MessageSquare, Lock, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  validatePhoneNumber,
  canViewContactDetails,
} from '../../utils/interactionHelpers.js';

/**
 * Reusable Call (tel:) + Message (Simulated Demo Inbox) action bar.
 * - Uses a genuine user-initiated `tel:` anchor when a valid phone number exists.
 * - Never shows a fake "Call successful" message.
 * - Shows a helpful inline explanation if no valid phone number is configured.
 * - Enforces role-based contact visibility.
 * - Opens the intended recipient's conversation in the Simulated Demo Inbox.
 */
export const ContactActionButtons = ({
  target,
  subject = '',
  compact = false,
  showPhoneText = false,
  className = '',
}) => {
  const { user, role } = useAuth();
  const [phoneNotice, setPhoneNotice] = useState(null);

  if (!target) return null;

  const targetId =
    target.id ||
    `hr-${String(target.email || target.name || 'contact')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`;
  const targetRole = target.role || 'STAFF';
  const targetName = target.name || target.student || 'Contact';

  const visibility = canViewContactDetails({
    viewerRole: role,
    viewerId: user?.id,
    targetRole,
    targetId,
  });

  const phoneCheck = validatePhoneNumber(target.phone);

  const canMessage =
    role === 'ADMIN' ||
    role === 'STAFF' ||
    (role === 'STUDENT' && (targetRole === 'STAFF' || targetRole === 'ADMIN'));

  const handleOpenDemoInbox = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('placetrack-open-demo-inbox', {
        detail: {
          targetParticipant: {
            id: targetId,
            name: targetName,
            role: targetRole,
            email: target.email || '',
            phone: target.phone || '',
            subtitle:
              target.subtitle ||
              target.department ||
              target.title ||
              target.email ||
              targetRole,
          },
          subject:
            subject ||
            `Placement Coordination — ${targetName}`,
        },
      })
    );
  };

  if (!visibility.allowed) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-medium text-[#64748B] ${className}`}
        title={visibility.reason}
      >
        <Lock className="w-3 h-3 text-[#94A3B8]" />
        <span>Contact Restricted</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
      <div className="inline-flex items-center flex-wrap gap-1.5">
        {/* CALL ACTION: Genuine user-initiated tel: link if valid, helpful explanation if missing */}
        {phoneCheck.valid ? (
          <a
            href={phoneCheck.telHref}
            className={`inline-flex items-center gap-1.5 rounded-lg font-bold transition-colors border ${
              compact
                ? 'px-2.5 py-1 text-[11px]'
                : 'px-3 py-1.5 text-[12px]'
            } bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]`}
            title={`Initiate device call to ${targetName} (${phoneCheck.sanitized})`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{showPhoneText ? phoneCheck.sanitized : 'Call'}</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() =>
              setPhoneNotice(
                phoneNotice
                  ? null
                  : `Cannot initiate call for ${targetName}: ${phoneCheck.reason}`
              )
            }
            className={`inline-flex items-center gap-1.5 rounded-lg font-bold transition-colors border ${
              compact
                ? 'px-2.5 py-1 text-[11px]'
                : 'px-3 py-1.5 text-[12px]'
            } bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]`}
            title={phoneCheck.reason}
          >
            <PhoneOff className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <span>{compact ? 'No Phone' : 'Call Unavailable'}</span>
          </button>
        )}

        {/* MESSAGE ACTION: Opens Simulated Frontend Demo Inbox */}
        {canMessage && targetId !== user?.id && (
          <button
            type="button"
            onClick={handleOpenDemoInbox}
            className={`inline-flex items-center gap-1.5 rounded-lg font-bold transition-colors border ${
              compact
                ? 'px-2.5 py-1 text-[11px]'
                : 'px-3 py-1.5 text-[12px]'
            } bg-[#F8F8F8] hover:bg-[#F1F1F1] text-[#171717] border-[#E5E5E5] cursor-pointer`}
            title={`Message ${targetName}`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span>Message</span>
          </button>
        )}
      </div>

      {phoneNotice && (
        <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E] max-w-xs">
          <AlertCircle className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
          <span className="flex-1 leading-snug">{phoneNotice}</span>
          <button
            type="button"
            onClick={() => setPhoneNotice(null)}
            className="text-[#92400E] hover:text-[#78350F]"
            aria-label="Dismiss phone notice"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
