'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import { useAuth } from '@/context/AuthContext';
import MetricCard from '@/components/dashboard/MetricCard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import ChartCard from '@/components/dashboard/ChartCard';
import InspectionStatusBreakdown from '@/components/dashboard/InspectionStatusBreakdown';
import ActivityListPanel from '@/components/dashboard/ActivityListPanel';

const chartLoading = (
  <div className="h-full min-h-[200px] animate-pulse rounded-lg bg-[var(--card-border)]/30" />
);

const StockTrendChart = dynamic(() => import('@/components/dashboard/StockTrendChart'), {
  ssr: false,
  loading: () => chartLoading,
});

const InspectionActivityChart = dynamic(
  () => import('@/components/dashboard/InspectionActivityChart'),
  { ssr: false, loading: () => chartLoading },
);
import { NavIcons } from '@/lib/nav-icons';
import { api } from '@/lib/api';
import type { DashboardData, DashboardPeriod } from '@/lib/dashboard-types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api<DashboardData>(`/api/reports/dashboard?period=${period}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const inspections = data
    ? [...data.overdueInspections, ...data.upcomingInspections].slice(0, 8)
    : [];

  return (
    <AppLayout>
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        generatedAt={data?.generatedAt}
        onRefresh={load}
      />
      {user?.role === 'ADMIN' && <AdminQuickActions />}

      {loading && !data ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="In stock"
              value={data.stock.totalInStock}
              icon={NavIcons.extinguishers}
              tone="green"
              delta={data.deltas.stockTotal}
            />
            <MetricCard
              label="Active fleet"
              value={data.stock.activeCount}
              icon={NavIcons.dashboard}
              tone="blue"
            />
            <MetricCard
              label="Overdue inspections"
              value={data.inspections.overdue}
              icon={NavIcons.inspections}
              tone="orange"
              delta={data.deltas.overdue}
              invertDelta
            />
            <MetricCard
              label="Expired units"
              value={data.stock.expiredCount}
              icon={NavIcons.alert}
              tone="red"
              delta={data.deltas.expiredCount}
              invertDelta
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Stock trend" subtitle="Units in stock over time">
              <StockTrendChart data={data.trends.stock} />
            </ChartCard>
            <ChartCard
              title="Inspection activity"
              subtitle={`${data.inspections.completedInPeriod} completed in period`}
            >
              <InspectionActivityChart data={data.trends.inspectionsByDay} />
            </ChartCard>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <InspectionStatusBreakdown
                scheduled={data.inspections.scheduled}
                inProgress={data.inspections.inProgress}
                completed={data.inspections.completed}
                overdue={data.inspections.overdue}
              />
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Needs inspection</p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {data.stock.needsInspectionCount}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Under maintenance</p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {data.stock.underMaintenanceCount}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Pass / Fail (period)</p>
                <p className="text-2xl font-semibold tabular-nums mt-1">
                  {data.inspections.pass} / {data.inspections.fail}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Completed (period)</p>
                <p className="text-2xl font-semibold tabular-nums mt-1 text-[var(--metric-positive)]">
                  {data.inspections.completedInPeriod}
                  {data.deltas.completedInspections && (
                    <span className="text-sm font-normal text-[var(--text-muted)] ml-2">
                      {data.deltas.completedInspections.percent >= 0 ? '+' : ''}
                      {data.deltas.completedInspections.percent}%
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityListPanel
              title="Inspections"
              emptyMessage="No overdue or upcoming inspections"
              viewAllHref="/inspections"
              inspections={inspections}
            />
            <ActivityListPanel
              title="Recent maintenance"
              emptyMessage="No maintenance logged in this period"
              viewAllHref="/maintenance"
              maintenance={data.recentMaintenance}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Unable to load dashboard data.</p>
      )}
    </AppLayout>
  );
}
