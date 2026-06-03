'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import IconButton from '@/components/IconButton';
import StatusBadge from '@/components/tables/StatusBadge';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/tables/DataTable';
import { NavIcons } from '@/lib/nav-icons';
import { inspectionStatusTone } from '@/lib/table-status';
import { api } from '@/lib/api';
import PageLoader from '@/components/ui/PageLoader';

interface NotificationItem {
  inspectionId: string;
  extinguisherId: string;
  serialNumber: string;
  scheduledAt: string;
  status: string;
  isOverdue: boolean;
  title: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    return api<{ items: NotificationItem[] }>('/api/operations/notifications/me')
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(load, 60_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [load]);

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        subtitle="Open inspections assigned to you"
        icon={NavIcons.bell}
        action={
          <IconButton icon={NavIcons.refresh} onClick={load}>
            Refresh
          </IconButton>
        }
      />
      {loading ? (
        <PageLoader label="Loading notifications…" />
      ) : (
      <DataTable
        isEmpty={items.length === 0}
        emptyMessage="No open inspections assigned to you."
      >
        {items.length > 0 && (
          <>
            <DataTableHead>
              <DataTableHeaderCell>Task</DataTableHeaderCell>
              <DataTableHeaderCell>Scheduled</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {items.map((n) => {
                const statusLabel = n.isOverdue ? 'Overdue' : n.status;
                return (
                  <DataTableRow
                    key={n.inspectionId}
                    onClick={() =>
                      router.push(`/inspections?modal=view&id=${n.inspectionId}`)
                    }
                  >
                    <DataTableCell emphasis>{n.title}</DataTableCell>
                    <DataTableCell className="text-[var(--text-muted)]">
                      {new Date(n.scheduledAt).toLocaleString()}
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge
                        label={statusLabel}
                        tone={inspectionStatusTone(n.status, n.isOverdue)}
                      />
                    </DataTableCell>
                    <DataTableCell align="right">
                      <IconButton
                        icon={NavIcons.view}
                        onClick={() =>
                          router.push(`/inspections?modal=view&id=${n.inspectionId}`)
                        }
                      >
                        View
                      </IconButton>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </>
        )}
      </DataTable>
      )}
    </AppLayout>
  );
}
