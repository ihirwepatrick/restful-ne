'use client';

import Icon from '@/components/Icon';
import type { IconSvgElement } from '@hugeicons/react';
import type { DashboardDelta } from '@/lib/dashboard-types';

type MetricTone = 'blue' | 'green' | 'orange' | 'red';

const toneStyles: Record<MetricTone, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
};

interface MetricCardProps {
  label: string;
  value: number;
  icon: IconSvgElement;
  tone?: MetricTone;
  delta?: DashboardDelta;
  invertDelta?: boolean;
}

export default function MetricCard({
  label,
  value,
  icon,
  tone = 'blue',
  delta,
  invertDelta = false,
}: MetricCardProps) {
  const styles = toneStyles[tone];
  const trendUp = delta ? delta.value >= 0 : null;
  const trendGood = invertDelta ? !trendUp : trendUp;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-lg p-2.5 ${styles.bg}`}>
          <Icon icon={icon} size={22} className={styles.text} />
        </div>
        {delta && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trendGood
                ? 'bg-green-500/10 text-[var(--metric-positive)]'
                : 'bg-red-500/10 text-[var(--metric-negative)]'
            }`}
          >
            {delta.value >= 0 ? '+' : ''}
            {delta.percent}%
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
