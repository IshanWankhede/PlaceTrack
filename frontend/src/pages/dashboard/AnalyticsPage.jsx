import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import DepartmentBarChart from '../../components/charts/DepartmentBarChart.jsx';
import PackageHistogram from '../../components/charts/PackageHistogram.jsx';
import FunnelChart from '../../components/charts/FunnelChart.jsx';
import CompanySelectionsChart from '../../components/charts/CompanySelectionsChart.jsx';
import { analyticsService } from '../../services/analyticsService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Award,
  TrendingUp,
  DollarSign,
  Briefcase,
  Download,
  RefreshCw,
  Users,
  Building2,
  Trophy,
  AlertCircle,
} from 'lucide-react';

// ─── Skeleton loader for stat cards ──────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[24px] border border-black/5 p-6 animate-pulse flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="h-3 w-24 bg-black/8 rounded-full" />
        <div className="h-8 w-8 bg-black/5 rounded-2xl" />
      </div>
      <div className="h-9 w-20 bg-black/10 rounded-xl mt-2" />
      <div className="h-3 w-32 bg-black/5 rounded-full" />
    </div>
  );
}

// ─── Skeleton loader for charts ───────────────────────────────────────────────
function SkeletonChart({ height = 'h-64' }) {
  return (
    <div className={`${height} w-full bg-black/4 rounded-2xl animate-pulse`} />
  );
}

// ─── Skeleton for table rows ──────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="py-3 flex items-center gap-3 animate-pulse">
      <div className="h-4 w-5 bg-black/8 rounded-full" />
      <div className="h-8 w-8 bg-black/8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 bg-black/10 rounded-full" />
        <div className="h-2.5 w-20 bg-black/5 rounded-full" />
      </div>
      <div className="h-5 w-16 bg-black/8 rounded-full" />
    </div>
  );
}

// ─── Error state card ─────────────────────────────────────────────────────────
function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <div>
        <p className="font-bold text-sm text-[#0B0B0F]">Failed to load analytics</p>
        <p className="text-xs text-[#64748B] mt-1">Could not reach the analytics service.</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

// ─── Avatar initials fallback ─────────────────────────────────────────────────
function InitialsAvatar({ name = '', size = 7 }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center font-bold text-[10px] flex-shrink-0 select-none`}
    >
      {initials || '?'}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { activeDemoRole, showToast } = useAuth();
  const isAdminOrStaff = ['ADMIN', 'STAFF'].includes(activeDemoRole);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [ov, depts, comps, pkgs, fn, ts] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getDepartments(),
        analyticsService.getCompanies(),
        analyticsService.getPackages(),
        analyticsService.getFunnel(),
        analyticsService.getTopStudents(),
      ]);
      setOverview(ov);
      setDepartments(depts);
      setCompanies(comps);
      setPackages(pkgs);
      setFunnel(fn);
      setTopStudents(ts);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── NIRF CSV download (backend generates the real CSV) ────────────────────
  const handleExportNirf = () => {
    const token = localStorage.getItem('placetrack_access_token');
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1');
    const url = `${base}/analytics/nirf-report.csv`;

    const link = document.createElement('a');
    // Pass JWT in URL since browser downloads can't set headers
    // The backend accepts token via Authorization header from the Axios interceptor,
    // but for direct download we open it with a temporary fetch + blob approach.
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Not authorised');
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        link.download = 'PlaceTrack_NIRF_Placement_Report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        showToast('NIRF placement report downloaded', 'success');
      })
      .catch(() => showToast('Export failed – check your role permissions', 'error'));
  };

  // ── Refresh materialized view (ADMIN / STAFF only) ────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await analyticsService.refresh();
      showToast('Analytics data refreshed successfully', 'success');
      await loadAll();
    } catch {
      showToast('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // ── Format helpers ────────────────────────────────────────────────────────
  const fmt = (val, decimals = 1) =>
    val != null ? Number(val).toFixed(decimals) : '—';

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && !loading) {
    return (
      <div className="space-y-6 pb-12">
        <GlassCard variant="white" className="p-8">
          <ErrorState onRetry={loadAll} />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header Row ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F]">
            Institutional Placement Analytics
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Live data · Department breakdowns, salary distributions & NIRF reporting
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdminOrStaff && (
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className={refreshing ? 'opacity-70' : ''}
            >
              {refreshing ? 'Refreshing…' : 'Refresh Data'}
            </Button>
          )}
          {isAdminOrStaff && (
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleExportNirf}
              disabled={loading}
            >
              Export NIRF Report
            </Button>
          )}
        </div>
      </div>

      {/* ── KPI Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Placement Rate"
              value={`${fmt(overview?.placement_rate)}%`}
              trend="Live cohort rate"
              trendPositive={true}
              icon={TrendingUp}
              accentColor="mint"
            />
            <StatCard
              title="Avg Package"
              value={fmt(overview?.avg_package)}
              suffix="LPA"
              trend="Mean across all offers"
              trendPositive={true}
              icon={Award}
              accentColor="lavender"
            />
            <StatCard
              title="Highest Offer"
              value={fmt(overview?.highest_package)}
              suffix="LPA"
              icon={DollarSign}
              accentColor="yellow"
              caption="Peak CTC this cycle"
            />
            <StatCard
              title="Students Placed"
              value={overview?.total_placed ?? '—'}
              suffix={`/ ${overview?.total_students ?? '—'}`}
              icon={Users}
              accentColor="mint"
              caption="Verified placements"
            />
            <StatCard
              title="Total Offers"
              value={overview?.total_offers ?? '—'}
              icon={Briefcase}
              accentColor="peach"
              caption={`${overview?.total_companies ?? '—'} recruiting partners`}
            />
          </>
        )}
      </div>

      {/* ── Charts Row 1: Department Placement Rate + Company Rankings ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department-wise Placement Rate (vertical bar) */}
        <div className="lg:col-span-7">
          <GlassCard variant="white" className="p-6 md:p-8 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Department-wise Placement Rate
              </h3>
              <p className="text-xs text-[#64748B]">
                Percentage of students with confirmed offers per department
              </p>
            </div>
            {loading ? (
              <SkeletonChart height="h-64" />
            ) : departments.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-[#94A3B8]">
                No department data available
              </div>
            ) : (
              <DepartmentBarChart data={departments} />
            )}
          </GlassCard>
        </div>

        {/* Package / CTC Tier Distribution (horizontal histogram) */}
        <div className="lg:col-span-5">
          <GlassCard variant="white" className="p-6 md:p-8 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Salary Tier Distribution
              </h3>
              <p className="text-xs text-[#64748B]">
                Count of placed students across CTC compensation tiers
              </p>
            </div>
            {loading ? (
              <SkeletonChart height="h-64" />
            ) : packages.every((p) => p.count === 0) ? (
              <div className="h-64 flex items-center justify-center text-xs text-[#94A3B8]">
                No placement package data yet
              </div>
            ) : (
              <PackageHistogram data={packages} />
            )}
          </GlassCard>
        </div>
      </div>

      {/* ── Charts Row 2: Company Rankings + Application Funnel ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Companies by Selections */}
        <div className="lg:col-span-7">
          <GlassCard variant="white" className="p-6 md:p-8 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Top Companies by Selections
              </h3>
              <p className="text-xs text-[#64748B]">
                Ranked by number of students offered positions
              </p>
            </div>
            {loading ? (
              <SkeletonChart height="h-64" />
            ) : companies.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-[#94A3B8]">
                No company selection data available
              </div>
            ) : (
              <CompanySelectionsChart data={companies} />
            )}
          </GlassCard>
        </div>

        {/* Application Recruitment Funnel */}
        <div className="lg:col-span-5">
          <GlassCard variant="white" className="p-6 md:p-8 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Application Pipeline Funnel
              </h3>
              <p className="text-xs text-[#64748B]">
                Conversion and attrition across all recruitment stages
              </p>
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-3 w-20 bg-black/8 rounded-full" />
                      <div className="h-3 w-10 bg-black/5 rounded-full" />
                    </div>
                    <div className="h-3 w-full bg-black/5 rounded-full" />
                  </div>
                ))}
              </div>
            ) : funnel.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-xs text-[#94A3B8]">
                No application data yet
              </div>
            ) : (
              <FunnelChart data={funnel} />
            )}
          </GlassCard>
        </div>
      </div>

      {/* ── Row 3: Top Placed Students Leaderboard ───────────────────────── */}
      <GlassCard variant="white" className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
              Premier Placement Honours
            </h3>
            <p className="text-xs text-[#64748B]">
              Top package recipients for the current academic batch
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-black/5">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : topStudents.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-xs text-[#94A3B8]">No placed students yet</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {topStudents.map((std, i) => (
              <div key={std.student_id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank badge */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                      i === 0
                        ? 'bg-amber-400 text-white'
                        : i === 1
                        ? 'bg-slate-300 text-slate-800'
                        : i === 2
                        ? 'bg-orange-300 text-orange-900'
                        : 'bg-black/5 text-[#64748B]'
                    }`}
                  >
                    {i + 1}
                  </span>

                  <InitialsAvatar name={std.student_name} size={7} />

                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#0B0B0F] truncate">
                      {std.student_name}
                    </p>
                    <p className="text-[10px] text-[#64748B] truncate">
                      {std.roll_number} · {std.department}
                    </p>
                    <p className="text-[10px] text-[#94A3B8] truncate">
                      {std.job_role} @ {std.company}
                    </p>
                  </div>
                </div>

                <span className="font-display font-black text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full tabular-nums whitespace-nowrap flex-shrink-0">
                  {fmt(std.package)} LPA
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ── Department Detail Table ─────────────────────────────────────── */}
      {!loading && departments.length > 0 && (
        <GlassCard variant="white" className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Department Summary Table
              </h3>
              <p className="text-xs text-[#64748B]">
                Full placement statistics per department
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr className="text-[#94A3B8] uppercase tracking-wider text-[10px] font-bold">
                  <th className="text-left pb-3 px-2">Department</th>
                  <th className="text-right pb-3 px-2">Total Students</th>
                  <th className="text-right pb-3 px-2">Placed</th>
                  <th className="text-right pb-3 px-2">Rate</th>
                  <th className="text-right pb-3 px-2">Avg CTC</th>
                  <th className="text-right pb-3 px-2">Max CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {departments.map((d) => (
                  <tr key={d.department_id} className="hover:bg-[#F9F9FB] transition-colors">
                    <td className="py-3 px-2 font-semibold text-[#0B0B0F]">
                      {d.department}
                    </td>
                    <td className="py-3 px-2 text-right text-[#64748B] tabular-nums">
                      {d.total_students}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums font-bold text-[#0B0B0F]">
                      {d.placed_students}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                          Number(d.placement_rate) >= 60
                            ? 'bg-emerald-50 text-emerald-700'
                            : Number(d.placement_rate) >= 30
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {fmt(d.placement_rate)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-[#64748B] tabular-nums">
                      {d.avg_package != null ? `${fmt(d.avg_package)} LPA` : '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-violet-700 tabular-nums">
                      {d.max_package != null ? `${fmt(d.max_package)} LPA` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
