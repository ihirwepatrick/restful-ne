'use client';

import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  let classes = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
  if (lower === 'completed') classes = 'bg-green-500/10 text-green-600 dark:text-green-400';
  if (lower === 'overdue' || lower.includes('progress')) {
    classes = lower === 'overdue'
      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${classes}`}>
      {status}
    </span>
  );
}

interface InspectionRow {
  id: string;
  serialNumber: string;
  location: string;
  scheduledAt: string;
  status: string;
}

interface MaintenanceRow {
  actionTaken: string;
  performedAt: string;
  extinguisherSerial?: string;
  performedByName?: string;
  conditionsNoted?: string;
}

interface ActivityListPanelProps {
  title: string;
  emptyMessage: string;
  viewAllHref?: string;
  inspections?: InspectionRow[];
  maintenance?: MaintenanceRow[];
}

export default function ActivityListPanel({
  title,
  emptyMessage,
  viewAllHref,
  inspections,
  maintenance,
}: ActivityListPanelProps) {
  const isInspections = !!inspections;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-orange-600 hover:text-orange-500"
          >
            View all
          </Link>
        )}
      </div>
      <ul className="flex-1 space-y-3 overflow-y-auto max-h-[320px]">
        {isInspections &&
          (inspections!.length === 0 ? (
            <li className="text-sm text-[var(--text-muted)] py-4 text-center">{emptyMessage}</li>
          ) : (
            inspections!.map((item) => {
              const isOverdue =
                item.status !== 'Completed' &&
                item.status !== 'Cancelled' &&
                new Date(item.scheduledAt) < new Date();
              return (
                <li key={item.id}>
                  <Link
                    href="/inspections"
                    className="flex items-start gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-[var(--main-bg)]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.serialNumber}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{item.location}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {new Date(item.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={isOverdue ? 'Overdue' : item.status} />
                    <span className="text-[var(--text-muted)] shrink-0 mt-1 text-sm" aria-hidden>
                      ›
                    </span>
                  </Link>
                </li>
              );
            })
          ))}
        {maintenance &&
          (maintenance.length === 0 ? (
            <li className="text-sm text-[var(--text-muted)] py-4 text-center">{emptyMessage}</li>
          ) : (
            maintenance.map((m, i) => (
              <li key={i}>
                <Link
                  href="/maintenance"
                  className="flex items-start gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-[var(--main-bg)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{m.actionTaken}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {m.extinguisherSerial} · {m.performedByName}
                    </p>
                    {m.conditionsNoted && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                        {m.conditionsNoted}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-muted)] shrink-0">
                    {new Date(m.performedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))
          ))}
      </ul>
    </div>
  );
}
