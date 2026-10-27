import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Bell,
  Send,
  Check,
  CheckCheck,
  Award,
  FileCheck,
  Briefcase,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user, activeRole, studentsList, showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'OFFERS' | 'INTERVIEWS' | 'SYSTEM'

  // Staff / Admin Notification Composer State
  const [targetType, setTargetType] = useState('SPECIFIC_STUDENT'); // 'SPECIFIC_STUDENT' | 'ALL_STUDENTS' | 'STAFF' | 'ADMIN'
  const [targetStudentId, setTargetStudentId] = useState('student-rohit');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');

  const canSendNotifications = activeRole === 'ADMIN' || activeRole === 'STAFF';

  useEffect(() => {
    loadNotifications(true);
    const handleSync = () => {
      loadNotifications(false);
    };
    window.addEventListener('placetrack-notifications-updated', handleSync);
    return () => window.removeEventListener('placetrack-notifications-updated', handleSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRole, user?.id]);

  async function loadNotifications(showSpinner = true) {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const res = await mockApi.getNotifications({
        poll: false,
        role: activeRole,
        userId: user?.id,
      });
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load notifications.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  const handleMarkOneRead = async (e, notifId) => {
    e.stopPropagation();
    try {
      const updated = await mockApi.markNotificationRead(notifId, {
        role: activeRole,
        userId: user?.id,
      });
      if (Array.isArray(updated)) {
        setNotifications(updated);
      } else if (updated?.notifications) {
        setNotifications(updated.notifications);
      }
      showToast('Notification marked as read');
    } catch (err) {
      console.error(err);
      showToast('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const updated = await mockApi.markNotificationsRead({
        role: activeRole,
        userId: user?.id,
      });
      setNotifications(updated);
      showToast('Marked all notifications as read for this account');
    } catch (err) {
      console.error(err);
      showToast('Failed to mark all notifications as read');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      const updated = await mockApi.markNotificationRead(notif.id, {
        role: activeRole,
        userId: user?.id,
      });
      if (Array.isArray(updated)) {
        setNotifications(updated);
      } else if (updated?.notifications) {
        setNotifications(updated.notifications);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    const targetRole =
      targetType === 'ADMIN'
        ? 'ADMIN'
        : targetType === 'STAFF'
        ? 'STAFF'
        : 'STUDENT';
    const studentId =
      targetType === 'SPECIFIC_STUDENT' ? targetStudentId : null;

    await mockApi.sendNotification({
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType,
      event_type: 'MANUAL_DISPATCH',
      target_role: targetRole,
      recipient_user_id:
        targetType === 'ADMIN'
          ? 'admin-ishan'
          : targetType === 'STAFF'
          ? 'staff-raghav'
          : studentId,
      student_id: studentId,
      sender_name: `${user?.name} (${activeRole})`,
      link:
        targetRole === 'STUDENT'
          ? notifType === 'placement'
            ? '/dashboard/my-offers'
            : '/dashboard/my-applications'
          : '/dashboard/applications',
    });

    const targetStudentName =
      studentsList.find((s) => s.id === targetStudentId)?.name || 'Student';

    showToast(
      targetType === 'SPECIFIC_STUDENT'
        ? `Dispatched notification to ${targetStudentName}`
        : `Dispatched notification to ${targetType}`
    );

    setNotifTitle('');
    setNotifMessage('');
    await loadNotifications(false);
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filterTab === 'UNREAD') return !n.read;
      if (filterTab === 'OFFERS') {
        return (
          n.type === 'placement' ||
          n.event_type?.includes('OFFER') ||
          Boolean(n.related_offer_id)
        );
      }
      if (filterTab === 'INTERVIEWS') {
        return (
          n.event_type?.includes('INTERVIEW') ||
          n.event_type?.includes('DRIVE') ||
          n.event_type?.includes('APPLICATION') ||
          Boolean(n.related_interview_id || n.related_drive_id || n.related_application_id)
        );
      }
      if (filterTab === 'SYSTEM') {
        return (
          n.event_type?.includes('POLICY') ||
          n.event_type?.includes('VERIFICATION') ||
          n.event_type?.includes('STAFF_ACCOUNT')
        );
      }
      return true;
    });
  }, [notifications, filterTab]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          Loading notifications for {user?.name} ({activeRole})...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-100 text-violet-800">
            Recipient-Scoped Notification Center · {activeRole} ({user?.id})
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            {activeRole === 'ADMIN'
              ? 'Administrative Alerts & Governance Events'
              : activeRole === 'STAFF'
              ? 'Placement Staff Operations & Candidate Alerts'
              : `My Personal Notifications (${user?.name})`}
          </h2>
          <p className="text-xs text-[#64748B]">
            {canSendNotifications
              ? 'Deterministic event alerts and per-recipient read tracking across placement workflows'
              : 'Event-driven updates for eligible drives, applications, interviews, and placement offers'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={() => loadNotifications(true)}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: `All (${notifications.length})` },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'INTERVIEWS', label: 'Drives, Applications & Interviews' },
          { id: 'OFFERS', label: 'Offers & Selections' },
          { id: 'SYSTEM', label: 'Verification & Governance' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterTab === tab.id
                ? 'bg-[#0B0B0F] text-white shadow-sm'
                : 'bg-white/80 text-slate-600 hover:bg-white border border-black/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <GlassCard
          variant="white"
          className="p-5 border border-rose-200 bg-rose-50/60 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-rose-900">Notification Load Error</h4>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => loadNotifications(true)}>
            Retry
          </Button>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Role-Scoped Inbox */}
        <div
          className={
            canSendNotifications ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'
          }
        >
          {filteredNotifications.length === 0 ? (
            <GlassCard variant="white" className="p-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Bell className="w-5 h-5" />
              </div>
              <p className="font-display font-bold text-sm text-[#0B0B0F]">
                {filterTab === 'UNREAD'
                  ? 'All caught up! No unread notifications.'
                  : `No notifications matching "${filterTab}" for ${user?.name} (${activeRole}).`}
              </p>
              <p className="text-xs text-slate-500">
                Notifications are generated deterministically when drives, applications, interviews, offers, or policies change.
              </p>
            </GlassCard>
          ) : (
            filteredNotifications.map((notif) => (
              <GlassCard
                key={notif.id}
                variant="white"
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 cursor-pointer transition-all hover:shadow-md flex items-start justify-between gap-4 ${
                  notif.read
                    ? 'opacity-80 bg-white/70'
                    : 'border-l-4 border-l-violet-600 bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 ${
                      notif.type === 'placement'
                        ? 'bg-violet-100 text-violet-700'
                        : notif.type === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : notif.type === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {notif.type === 'placement' ? (
                      <Award className="w-4 h-4" />
                    ) : notif.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : notif.type === 'success' ? (
                      <FileCheck className="w-4 h-4" />
                    ) : (
                      <Briefcase className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!notif.read && (
                        <span
                          className="w-2 h-2 rounded-full bg-violet-600 flex-shrink-0"
                          title="Unread for your account"
                        />
                      )}
                      <h4 className="font-display font-bold text-sm text-[#0B0B0F]">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          Unread
                        </span>
                      )}
                      {notif.event_type && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {notif.event_type.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Related Entity Metadata & Destination Chip */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {notif.related_drive_id && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                          Drive #{notif.related_drive_id}
                        </span>
                      )}
                      {notif.related_application_id && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                          App #{notif.related_application_id}
                        </span>
                      )}
                      {notif.related_interview_id && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                          Interview #{notif.related_interview_id}
                        </span>
                      )}
                      {notif.related_offer_id && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          Offer #{notif.related_offer_id}
                        </span>
                      )}
                      {notif.link && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 hover:underline">
                          Open {notif.link.replace('/dashboard/', '') || 'overview'}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-[#94A3B8] mt-1.5">
                      {notif.sender_name ? `From: ${notif.sender_name} · ` : ''}
                      Recipient: {notif.recipient_user_id || activeRole} · {notif.timestamp}
                    </p>
                  </div>
                </div>

                {/* Per-item Mark as Read action */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {!notif.read ? (
                    <button
                      type="button"
                      onClick={(e) => handleMarkOneRead(e, notif.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors cursor-pointer"
                      title="Mark as read for this user"
                    >
                      <Check className="w-3 h-3" />
                      Mark read
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">Read</span>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>

        {/* Right Column (Staff & Admin Only): Targeted Student Notification Composer */}
        {canSendNotifications && (
          <GlassCard variant="white" className="lg:col-span-5 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0B0B0F]">
                  Dispatch Targeted Notification
                </h3>
                <p className="text-xs text-[#64748B]">
                  Delivered only to the targeted recipient without broadcasting to unrelated roles
                </p>
              </div>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Recipient Target
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
                >
                  <option value="SPECIFIC_STUDENT">Specific Student Candidate</option>
                  <option value="ALL_STUDENTS">All Enrolled Students</option>
                  <option value="STAFF">Placement Staff (TPO Desk)</option>
                  <option value="ADMIN">Admin Governance Desk</option>
                </select>
              </div>

              {targetType === 'SPECIFIC_STUDENT' && (
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Select Student Recipient
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
                  >
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.roll_number} · {s.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Alert Category
                </label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
                >
                  <option value="info">Interview / Schedule Info</option>
                  <option value="placement">Placement / Offer Update</option>
                  <option value="success">Verification / Shortlist Success</option>
                  <option value="warning">Action Required / Deadline Warning</option>
                </select>
              </div>

              <Input
                label="Notification Title"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Report to CDC Room B for Technical Round 2"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Enter instructions, reporting time, or document checklist..."
                  className="w-full rounded-2xl border border-black/15 p-3 text-xs text-[#0B0B0F] outline-none"
                  required
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                icon={Send}
                className="w-full"
              >
                Dispatch Notification
              </Button>
            </form>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

