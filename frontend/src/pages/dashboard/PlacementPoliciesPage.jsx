import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ShieldCheck,
  Check,
  Sliders,
  Lock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export default function PlacementPoliciesPage() {
  const { user, showToast } = useAuth();
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await mockApi.getPolicies();
        setPolicies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSavePolicies = async (e) => {
    e.preventDefault();
    if (!policies) return;
    setSaving(true);
    try {
      const updated = await mockApi.updatePolicies({
        ...policies,
        dream_tier_min_lpa: Number(policies.dream_tier_min_lpa),
        super_dream_tier_min_lpa: Number(policies.super_dream_tier_min_lpa),
        min_ctc_upgrade_multiplier: Number(policies.min_ctc_upgrade_multiplier),
        institutional_min_cgpa: Number(policies.institutional_min_cgpa),
        max_allowed_backlogs: Number(policies.max_allowed_backlogs),
        max_active_applications: Number(policies.max_active_applications),
        offer_decision_window_hours: Number(policies.offer_decision_window_hours),
        last_updated_by: `${user?.name || 'Ishan Wankhede'} (Admin)`,
      });
      setPolicies(updated);
      showToast('Institutional placement policies saved and broadcast');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !policies) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-100 text-violet-800">
            Admin-Only Policy Governance
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            Institutional Placement Policies ({policies.academic_year})
          </h2>
          <p className="text-xs text-[#64748B]">
            Configure single-offer rules, tier upgrade thresholds, and academic eligibility guardrails
          </p>
        </div>

        <div className="text-right text-xs text-[#64748B]">
          <p>
            Last updated by: <strong className="text-[#0B0B0F]">{policies.last_updated_by}</strong>
          </p>
          <p>Effective date: {policies.last_updated_at}</p>
        </div>
      </div>

      <form onSubmit={handleSavePolicies} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Single-Offer & Tier Progression Rules */}
          <GlassCard variant="white" className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-black/5">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0B0B0F]">
                  Single-Offer & Tier Upgrade Rules
                </h3>
                <p className="text-xs text-[#64748B]">
                  Governs student offer acceptance and eligibility for higher-tier drives
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/5 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#0B0B0F]">
                    Enforce Single-Offer Policy
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Accepting an offer locks same/lower tier offers automatically
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.single_offer_policy}
                  onChange={(e) =>
                    setPolicies({ ...policies, single_offer_policy: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-violet-600"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/5 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#0B0B0F]">
                    Allow Higher-Tier Upgrade (Core → Dream → Super Dream)
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Placed candidates may apply to a strictly higher compensation tier
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.allow_higher_tier_upgrade}
                  onChange={(e) =>
                    setPolicies({
                      ...policies,
                      allow_higher_tier_upgrade: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-violet-600"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Input
                label="Dream Tier Min (LPA)"
                type="number"
                step="0.5"
                value={policies.dream_tier_min_lpa}
                onChange={(e) =>
                  setPolicies({ ...policies, dream_tier_min_lpa: e.target.value })
                }
              />
              <Input
                label="Super Dream Min (LPA)"
                type="number"
                step="0.5"
                value={policies.super_dream_tier_min_lpa}
                onChange={(e) =>
                  setPolicies({ ...policies, super_dream_tier_min_lpa: e.target.value })
                }
              />
              <Input
                label="Upgrade CTC Multiplier"
                type="number"
                step="0.1"
                value={policies.min_ctc_upgrade_multiplier}
                onChange={(e) =>
                  setPolicies({
                    ...policies,
                    min_ctc_upgrade_multiplier: e.target.value,
                  })
                }
              />
            </div>
          </GlassCard>

          {/* Card 2: Academic & Conduct Thresholds */}
          <GlassCard variant="white" className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-black/5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0B0B0F]">
                  Academic & Participation Guardrails
                </h3>
                <p className="text-xs text-[#64748B]">
                  Baseline CDC verification requirements and candidate limits
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/5 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#0B0B0F]">
                    Require CDC CGPA Verification Before Applying
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Students must have verified transcript status to unlock drives
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.require_cdc_cgpa_verification}
                  onChange={(e) =>
                    setPolicies({
                      ...policies,
                      require_cdc_cgpa_verification: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-violet-600"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/5 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#0B0B0F]">
                    Auto-Flag Interview No-Show
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Unexcused absence in scheduled interview rounds triggers TPO review
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.auto_debar_on_interview_noshow}
                  onChange={(e) =>
                    setPolicies({
                      ...policies,
                      auto_debar_on_interview_noshow: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-violet-600"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Input
                label="Min Institutional CGPA"
                type="number"
                step="0.1"
                value={policies.institutional_min_cgpa}
                onChange={(e) =>
                  setPolicies({
                    ...policies,
                    institutional_min_cgpa: e.target.value,
                  })
                }
              />
              <Input
                label="Max Allowed Backlogs"
                type="number"
                value={policies.max_allowed_backlogs}
                onChange={(e) =>
                  setPolicies({ ...policies, max_allowed_backlogs: e.target.value })
                }
              />
              <Input
                label="Offer Decision Window (Hrs)"
                type="number"
                value={policies.offer_decision_window_hours}
                onChange={(e) =>
                  setPolicies({
                    ...policies,
                    offer_decision_window_hours: e.target.value,
                  })
                }
              />
            </div>
          </GlassCard>
        </div>

        {/* Policy Statement Banner */}
        <GlassCard variant="white" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <h4 className="font-display font-bold text-sm text-[#0B0B0F]">
                Official Policy Advisory Displayed on Student Offer Letters
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Synced with Student Portal
            </span>
          </div>

          <textarea
            rows={2}
            value={policies.policy_note}
            onChange={(e) => setPolicies({ ...policies, policy_note: e.target.value })}
            className="w-full rounded-2xl border border-black/10 bg-slate-50 p-3.5 text-xs font-medium text-[#0B0B0F] outline-none focus:border-violet-600"
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={saving}
              icon={Check}
            >
              Save Institutional Policies
            </Button>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
