'use client';

import ChartCard from './ChartCard';

interface InspectionStatusBreakdownProps {
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export default function InspectionStatusBreakdown({
  scheduled,
  inProgress,
  completed,
  overdue,
}: InspectionStatusBreakdownProps) {
  const total = scheduled + inProgress + completed + overdue || 1;
  const items = [
    { label: 'Scheduled', value: scheduled, color: 'bg-blue-500' },
    { label: 'In progress', value: inProgress, color: 'bg-orange-500' },
    { label: 'Completed', value: completed, color: 'bg-green-500' },
    { label: 'Overdue', value: overdue, color: 'bg-red-500' },
  ];

  return (
    <ChartCard title="Inspection pipeline" subtitle="Current status across all inspections">
      <div className="space-y-4 py-2">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-muted)]">{item.label}</span>
              <span className="font-medium tabular-nums text-[var(--text-primary)]">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--main-bg)] overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${Math.max((item.value / total) * 100, item.value > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
