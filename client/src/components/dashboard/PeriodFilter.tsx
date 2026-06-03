'use client';

import { buttonClass } from '@/components/Button';
import { DASHBOARD_PERIOD_OPTIONS, type DashboardPeriod } from '@/lib/dashboard-types';

interface PeriodFilterProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DASHBOARD_PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={buttonClass(
            value === opt.value ? 'filterActive' : 'filter',
            'sm',
            'rounded-full px-3',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
