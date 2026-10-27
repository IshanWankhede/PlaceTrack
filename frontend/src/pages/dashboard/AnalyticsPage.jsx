import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import DepartmentBarChart from '../../components/charts/DepartmentBarChart.jsx';
import PackageHistogram from '../../components/charts/PackageHistogram.jsx';
import FunnelChart from '../../components/charts/FunnelChart.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Award,
  TrendingUp,
  DollarSign,
  Briefcase,
  Download,
  BarChart3,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { showToast } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [an, stds] = await Promise.all([
          mockApi.getAnalytics(),
          mockApi.getStudents(),
        ]);
        setAnalytics(an);
        setStudents(stds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Requirement 12: Export NIRF-style report
  const handleExportNirfReport = () => {
    if (!analytics) return;
    const headers = [
      'Academic Year,Program / Department,Total Eligible Graduating Students,Total Students Placed,Placement Percentage (%),Median Salary (LPA),Average Salary (LPA),Highest Salary (LPA)',
    ];
    const rows = analytics.departmentBreakdown.map(
      (d) =>
        `"2025-26","B.Tech - ${d.department}",${d.total},${d.placed},${d.rate}%,${
          d.medianLpa || 14.2
        },${d.avgLpa},${analytics.summary.highest_package_lpa || 28.5}`
    );
    rows.push(
      `"2025-26","OVERALL INSTITUTION (NIRF SUMMARY)",${analytics.summary.total_eligible_students},${analytics.summary.students_placed},${analytics.summary.placement_rate_percent}%,${analytics.summary.median_package_lpa},${analytics.summary.avg_package_lpa},${analytics.summary.highest_package_lpa}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'PlaceTrack_NIRF_Placement_Report_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported official NIRF-style placement report (CSV)');
  };

  if (loading || !analytics) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const topStudents = [...students]
    .filter((s) => s.placed)
    .sort(
      (a, b) =>
        (b.placed_package || b.placedPackage || 0) -
        (a.placed_package || a.placedPackage || 0)
    )
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Header + Export NIRF-style report button (Requirement 12) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F]">
            Institutional Placement Analytics
          </h2>
          <p className="text-xs text-[#64748B]">
            In-depth university accreditation statistics, Median CTC, salary distributions, and NIRF reporting
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Download}
          onClick={handleExportNirfReport}
          className="shadow-md self-start sm:self-auto"
        >
          Export NIRF-style report
        </Button>
      </div>

      {/* Top 5 KPI Stat Cards including Median CTC (Requirement 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Placement Conversion"
          value={`${analytics.summary.placement_rate_percent ?? analytics.summary.placementRatePercent}%`}
          trend="+8.2% vs target"
          trendPositive={true}
          icon={TrendingUp}
          accentColor="mint"
        />
        <StatCard
          title="Median CTC"
          value={analytics.summary.median_package_lpa ?? analytics.summary.medianPackageLpa ?? 14.2}
          suffix="LPA"
          trend="NIRF Benchmark"
          trendPositive={true}
          icon={BarChart3}
          accentColor="lavender"
          caption="50th percentile package"
        />
        <StatCard
          title="Average CTC Package"
          value={analytics.summary.avg_package_lpa ?? analytics.summary.avgPackageLpa}
          suffix="LPA"
          trend="+18% YoY growth"
          trendPositive={true}
          icon={Award}
          accentColor="yellow"
        />
        <StatCard
          title="Highest Offer"
          value={analytics.summary.highest_package_lpa ?? analytics.summary.highestPackageLpa}
          suffix="LPA"
          icon={DollarSign}
          accentColor="lavender"
          caption="DataWave Analytics"
        />
        <StatCard
          title="Total Offers Extended"
          value={analytics.summary.total_offers ?? analytics.summary.totalOffers}
          icon={Briefcase}
          accentColor="peach"
          caption="58 recruiting partners"
        />
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <GlassCard variant="white" className="p-6 md:p-8 h-full flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Department-wise Placement Rate
              </h3>
              <p className="text-xs text-[#64748B]">
                Percentage of students with verified job offers per department
              </p>
            </div>
            <DepartmentBarChart data={analytics.departmentBreakdown} />
          </GlassCard>
        </div>

        <div className="lg:col-span-5">
          <GlassCard variant="white" className="p-6 md:p-8 h-full flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Salary Tier Distribution
              </h3>
              <p className="text-xs text-[#64748B]">
                Count of placed students across CTC compensation tiers
              </p>
            </div>
            <PackageHistogram data={analytics.packageDistribution} />
          </GlassCard>
        </div>
      </div>

      {/* Row 2: Application Recruitment Funnel + Top Students Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <GlassCard variant="white" className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Campus Recruitment Pipeline Funnel
              </h3>
              <p className="text-xs text-[#64748B]">
                Attrition and advancement ratios across all concurrent drive stages
              </p>
            </div>
            <FunnelChart data={analytics.funnelData} />
          </GlassCard>
        </div>

        <div className="lg:col-span-5">
          <GlassCard variant="white" className="p-6 md:p-8">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                Premier Placement Honors
              </h3>
              <p className="text-xs text-[#64748B]">
                Top salary package recipients for current academic batch
              </p>
            </div>

            <div className="divide-y divide-black/5">
              {topStudents.map((std, i) => (
                <div key={std.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-[#94A3B8]">
                      #{i + 1}
                    </span>
                    <Avatar src={std.photo_url || std.avatar} name={std.name} size="xs" />
                    <div>
                      <p className="font-bold text-xs text-[#0B0B0F]">{std.name}</p>
                      <p className="text-[10px] text-[#64748B]">
                        {std.placed_company || std.placedCompany}
                      </p>
                    </div>
                  </div>
                  <span className="font-display font-black text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full tabular-nums">
                    {std.placed_package || std.placedPackage} LPA
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
