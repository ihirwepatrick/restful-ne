'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import StatusBadge from '@/components/tables/StatusBadge';
import { NavIcons } from '@/lib/nav-icons';
import { inspectionStatusTone } from '@/lib/table-status';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import PageLoader from '@/components/ui/PageLoader';

interface InspectionDetailPanelProps {
  inspectionId: string;
  onUpdated?: () => void;
}

interface Inspector {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-[var(--card-border)] bg-[var(--main-bg)]/50 px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export default function InspectionDetailPanel({
  inspectionId,
  onUpdated,
}: InspectionDetailPanelProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [inspection, setInspection] = useState<Record<string, string> | null>(null);
  const [extinguisher, setExtinguisher] = useState<Record<string, unknown> | null>(null);
  const [inspectorName, setInspectorName] = useState('—');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const canComplete = user?.role === 'ADMIN' || user?.role === 'INSPECTOR';

  const load = useCallback(() => {
    setLoading(true);
    return api<Record<string, string>>(`/api/operations/inspections/${inspectionId}`)
      .then(async (insp) => {
        setInspection(insp);
        const [ext, inspectors] = await Promise.all([
          api<Record<string, unknown>>(`/api/equipment/extinguishers/${insp.extinguisherId}`).catch(
            () => null,
          ),
          api<Inspector[]>('/api/operations/inspectors').catch(() => [] as Inspector[]),
        ]);
        setExtinguisher(ext);
        const inspector = inspectors.find((i) => i.id === insp.assignedInspectorId);
        if (inspector) {
          setInspectorName(`${inspector.firstName} ${inspector.lastName}`);
        } else if (insp.assignedInspectorId === user?.id) {
          setInspectorName(`${user.firstName} ${user.lastName} (you)`);
        } else {
          setInspectorName(insp.assignedInspectorId?.slice(0, 8) + '…' || '—');
        }
      })
      .catch(() => setInspection(null))
      .finally(() => setLoading(false));
  }, [inspectionId, user]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (data: Record<string, string>) => {
    setUpdating(true);
    try {
      const updated = await api<Record<string, string>>(`/api/operations/inspections/${inspectionId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setInspection(updated);
      toast.success('Inspection updated');
      onUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update inspection');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading inspection…" />;
  }

  if (!inspection) {
    return <p className="py-8 text-center text-sm text-red-500">Could not load inspection details.</p>;
  }

  const overdue =
    inspection.status !== 'Completed' &&
    inspection.status !== 'Cancelled' &&
    new Date(inspection.scheduledAt) < new Date();
  const statusLabel = overdue ? 'Overdue' : inspection.status;
  const serial = (extinguisher?.serialNumber as string) ?? inspection.extinguisherId;
  const location = (extinguisher?.location as string) ?? '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--main-bg)]/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600 dark:text-orange-400">
            <Icon icon={NavIcons.inspections} size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{serial}</p>
            <p className="text-sm text-[var(--text-muted)]">{location}</p>
          </div>
        </div>
        <StatusBadge label={statusLabel} tone={inspectionStatusTone(inspection.status, overdue)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label="Scheduled" value={new Date(inspection.scheduledAt).toLocaleString()} />
        <DetailRow label="Inspector" value={inspectorName} />
        <DetailRow label="Result" value={inspection.result || 'Pending'} />
        <DetailRow label="Extinguisher ID" value={inspection.extinguisherId} />
        {inspection.notes && (
          <div className="sm:col-span-2">
            <DetailRow label="Notes" value={inspection.notes} />
          </div>
        )}
      </div>

      {canComplete && inspection.status !== 'Completed' && inspection.status !== 'Cancelled' && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--card-border)] pt-4">
          {inspection.status === 'Scheduled' && (
            <Button
              variant="outline"
              disabled={updating}
              onClick={() => update({ status: 'InProgress' })}
            >
              Start
            </Button>
          )}
          <Button
            variant="success"
            disabled={updating}
            onClick={() => update({ status: 'Completed', result: 'Pass' })}
          >
            Pass
          </Button>
          <Button
            variant="danger"
            disabled={updating}
            onClick={() => update({ status: 'Completed', result: 'Fail' })}
          >
            Fail
          </Button>
        </div>
      )}
    </div>
  );
}
