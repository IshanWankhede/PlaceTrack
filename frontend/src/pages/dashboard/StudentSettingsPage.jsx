import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Settings, Bell, Shield, Check, RotateCcw } from 'lucide-react';

export default function StudentSettingsPage() {
  const { user, showToast, refreshStudentsCache } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await mockApi.getStudentSettings(user?.id || 'student-rohit');
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!settings) return;
    const updated = await mockApi.updateStudentSettings(
      user?.id || 'student-rohit',
      settings
    );
    setSettings(updated);
    showToast('Saved personal portal preferences');
  };

  const toggleTier = (tier) => {
    if (!settings) return;
    const current = settings.preferred_job_tiers || [];
    const next = current.includes(tier)
      ? current.filter((t) => t !== tier)
      : [...current, tier];
    setSettings({ ...settings, preferred_job_tiers: next });
  };

  const handleResetDemoStore = async () => {
    await mockApi.resetDemoData();
    await refreshStudentsCache();
    showToast('Reset centralized mock dataset to clean factory defaults');
  };

  if (loading || !settings) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Student Portal Preferences
        </span>
        <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
          Settings & Alert Preferences ({user?.name})
        </h2>
        <p className="text-xs text-[#64748B]">
          Manage personal notification channels, resume visibility to corporate recruiters, and job tier filters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard variant="white" className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
              <Bell className="w-5 h-5 text-violet-600" />
              <h3 className="font-display font-bold text-base text-[#0B0B0F]">
                Notification & Interview Alerts
              </h3>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/5 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-[#0B0B0F]">
                  Campus Email Notifications
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Receive instant alerts when a round status or offer changes
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_alerts}
                onChange={(e) =>
                  setSettings({ ...settings, email_alerts: e.target.checked })
                }
                className="w-4 h-4 rounded text-violet-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/5 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-[#0B0B0F]">
                  30-Minute Interview Reporting Reminders
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Alert before scheduled Technical and HR panel check-ins
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.interview_sms_reminders}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    interview_sms_reminders: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-violet-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/5 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-[#0B0B0F]">
                  Eligible Drive Match Digest
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Notify when new drives match 100% of your CDC profile rules
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.eligible_drive_digest}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    eligible_drive_digest: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-violet-600"
              />
            </label>
          </GlassCard>

          <GlassCard variant="white" className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-bold text-base text-[#0B0B0F]">
                Privacy & Preferred Drive Tiers
              </h3>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/5 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-[#0B0B0F]">
                  Share Verified Resume & Transcript with Corporate Partners
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Allows onboarded HR contacts to view your CDC-verified profile
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.share_verified_resume_with_partners}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    share_verified_resume_with_partners: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-violet-600"
              />
            </label>

            <div className="pt-2">
              <span className="block text-xs font-bold text-[#475569] mb-2">
                Preferred Compensation Tiers:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Core', 'Dream', 'Super Dream'].map((tier) => {
                  const active = (settings.preferred_job_tiers || []).includes(tier);
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => toggleTier(tier)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        active
                          ? 'bg-[#0B0B0F] text-white border-[#0B0B0F]'
                          : 'bg-white text-[#64748B] border-black/15'
                      }`}
                    >
                      {active ? `✓ ${tier}` : tier}
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleResetDemoStore}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Dataset to Defaults
          </button>

          <Button variant="primary" size="md" type="submit" icon={Check}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
