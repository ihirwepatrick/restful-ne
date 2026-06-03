'use client';

import Icon from '@/components/Icon';
import { buttonClass } from '@/components/Button';
import { NavIcons } from '@/lib/nav-icons';
import PeriodFilter from './PeriodFilter';
import type { DashboardPeriod } from '@/lib/dashboard-types';

interface DashboardHeaderProps {
  period: DashboardPeriod;
  onPeriodChange: (p: DashboardPeriod) => void;
  generatedAt?: string;
  onRefresh?: () => void;
}

export default function DashboardHeader({
  period,
  onPeriodChange,
  generatedAt,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Fleet Overview</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)] max-w-xl">
          Real-time view of extinguisher stock, inspections, maintenance, and compliance for your
          organization.
        </p>
        {generatedAt && (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Last updated: {new Date(generatedAt).toLocaleString()}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PeriodFilter value={period} onChange={onPeriodChange} />
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className={buttonClass('secondary', 'md', 'shadow-none shrink-0')}
            aria-label="Refresh dashboard"
          >
            <Icon icon={NavIcons.refresh} size={16} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
