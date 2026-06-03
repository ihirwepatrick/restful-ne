'use client';

import { useEffect, useState } from 'react';
import IconButton from '@/components/IconButton';
import Icon from '@/components/Icon';
import StatusBadge from '@/components/tables/StatusBadge';
import { NavIcons } from '@/lib/nav-icons';
import { extinguisherStatusTone } from '@/lib/table-status';
import { api } from '@/lib/api';
import PageLoader from '@/components/ui/PageLoader';

interface ExtinguisherDetailPanelProps {
  extinguisherId: string;
  canEdit?: boolean;
  onEdit?: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-[var(--card-border)] bg-[var(--main-bg)]/50 px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

const historyTone: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
  inspection: 'info',
  maintenance: 'warning',
  compliance: 'success',
};

export default function ExtinguisherDetailPanel({
  extinguisherId,
  canEdit,
  onEdit,
}: ExtinguisherDetailPanelProps) {
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<{ type: string; date: string; data: Record<string, unknown> }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api<Record<string, unknown>>(`/api/equipment/extinguishers/${extinguisherId}`),
      api<{ type: string; date: string; data: Record<string, unknown> }[]>(
        `/api/operations/extinguishers/${extinguisherId}/history`,
      ),
    ])
      .then(([detail, hist]) => {
        setItem(detail);
        setHistory(hist);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [extinguisherId]);

  if (loading) {
    return <PageLoader label="Loading unit details…" />;
  }

  if (!item) {
    return <p className="py-8 text-center text-sm text-red-500">Could not load extinguisher details.</p>;
  }

  const statusName = (item.status as { name: string })?.name ?? 'Unknown';
  const expiry = new Date(item.expiryDate as string);
  const isExpired = expiry < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--main-bg)]/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600 dark:text-orange-400">
            <Icon icon={NavIcons.extinguishers} size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{item.serialNumber as string}</p>
            <p className="text-sm text-[var(--text-muted)]">{item.location as string}</p>
          </div>
        </div>
        <StatusBadge label={statusName} tone={extinguisherStatusTone(statusName)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label="Type" value={(item.type as { name: string })?.name ?? '—'} />
        <DetailRow label="Size" value={(item.size as { label: string })?.label ?? '—'} />
        <DetailRow
          label="Installation"
          value={new Date(item.installationDate as string).toLocaleDateString()}
        />
        <DetailRow
          label="Expiry"
          value={`${expiry.toLocaleDateString()}${isExpired ? ' (expired)' : ''}`}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Activity history</h3>
        {history.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--card-border)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
            No inspections or maintenance recorded yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li
                key={`${h.type}-${h.date}-${i}`}
                className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--main-bg)]/30 px-4 py-3"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={h.type}
                      tone={historyTone[h.type.toLowerCase()] ?? 'neutral'}
                    />
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(h.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {canEdit && onEdit && (
        <div className="flex justify-end border-t border-[var(--card-border)] pt-4">
          <IconButton icon={NavIcons.edit} onClick={onEdit}>
            Edit unit
          </IconButton>
        </div>
      )}
    </div>
  );
}
