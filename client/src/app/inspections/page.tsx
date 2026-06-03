'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import IconButton from '@/components/IconButton';
import Modal from '@/components/ui/Modal';
import ScheduleInspectionForm from '@/components/forms/ScheduleInspectionForm';
import InspectionDetailPanel from '@/components/inspections/InspectionDetailPanel';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import TableToolbar from '@/components/tables/TableToolbar';
import { buttonClass } from '@/components/Button';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/tables/DataTable';
import StatusBadge from '@/components/tables/StatusBadge';
import TableActions from '@/components/tables/TableActions';
import { NavIcons } from '@/lib/nav-icons';
import { inspectionStatusTone } from '@/lib/table-status';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useDataTable } from '@/hooks/useDataTable';
import RouteLoadingFallback from '@/components/ui/RouteLoadingFallback';

interface Inspection {
  id: string;
  extinguisherId: string;
  scheduledAt: string;
  status: string;
  result: string;
  assignedInspectorId: string;
}

function InspectionsContent() {
  const { user } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modal = searchParams.get('modal');
  const recordId = searchParams.get('id');

  const [items, setItems] = useState<Inspection[]>([]);
  const [filter, setFilter] = useState('');
  const isAdmin = user?.role === 'ADMIN';

  const load = useCallback(() => {
    const q = filter ? `?status=${filter}` : '';
    return api<Inspection[]>(`/api/operations/inspections${q}`).then(setItems).catch(console.error);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const closeModal = () => router.push(pathname);
  const openSchedule = () => router.push(`${pathname}?modal=schedule`);
  const openView = (id: string) => router.push(`${pathname}?modal=view&id=${id}`);

  const scheduleModalOpen = modal === 'schedule';
  const viewModalOpen = modal === 'view' && !!recordId;

  const isOverdue = (i: Inspection) =>
    i.status !== 'Completed' && i.status !== 'Cancelled' && new Date(i.scheduledAt) < new Date();

  const filterFn = useCallback(
    (row: Inspection, q: string) =>
      row.extinguisherId.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q) ||
      (row.result || '').toLowerCase().includes(q),
    [],
  );

  const table = useDataTable(items, filterFn);

  const remove = async (id: string) => {
    const ok = await confirm({
      title: 'Delete inspection',
      message: 'Delete this inspection record? It will be marked as cancelled.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api(`/api/operations/inspections/${id}`, { method: 'DELETE' });
      toast.success('Inspection removed');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete inspection');
    }
  };

  return (
    <AppLayout>
      {ConfirmDialog}
      <PageHeader
        title="Inspections"
        icon={NavIcons.inspections}
        action={
          <IconButton icon={NavIcons.schedule} onClick={openSchedule}>
            Schedule Inspection
          </IconButton>
        }
      />
      {isAdmin && <AdminQuickActions />}
      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'Scheduled', 'InProgress', 'Completed', 'Cancelled'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setFilter(s)}
            className={buttonClass(filter === s ? 'filterActive' : 'filter', 'sm')}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search extinguisher, status, result…"
        rangeStart={table.rangeStart}
        rangeEnd={table.rangeEnd}
        totalCount={table.totalCount}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
        pageSize={table.pageSize}
        onPageSizeChange={table.setPageSize}
      />
      <DataTable isEmpty={table.filteredRows.length === 0} emptyMessage="No inspections match this filter.">
        {table.pagedRows.length > 0 && (
          <>
            <DataTableHead>
              <DataTableHeaderCell>Extinguisher</DataTableHeaderCell>
              <DataTableHeaderCell>Scheduled</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell>Result</DataTableHeaderCell>
              <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {table.pagedRows.map((i) => {
                const overdue = isOverdue(i);
                const statusLabel = overdue ? 'Overdue' : i.status;
                return (
                  <DataTableRow
                    key={i.id}
                    className={overdue ? 'bg-red-500/5' : ''}
                    onClick={() => openView(i.id)}
                  >
                    <DataTableCell emphasis className="font-mono text-xs">
                      {i.extinguisherId.slice(0, 10)}…
                    </DataTableCell>
                    <DataTableCell className="text-[var(--text-muted)]">
                      {new Date(i.scheduledAt).toLocaleString()}
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge label={statusLabel} tone={inspectionStatusTone(i.status, overdue)} />
                    </DataTableCell>
                    <DataTableCell className="text-[var(--text-muted)]">{i.result || '—'}</DataTableCell>
                    <DataTableCell align="right" onClick={(ev) => ev.stopPropagation()}>
                      <TableActions
                        actions={[
                          { label: 'View', icon: NavIcons.view, onClick: () => openView(i.id) },
                          ...(isAdmin
                            ? [
                                {
                                  label: 'Delete',
                                  icon: NavIcons.delete,
                                  variant: 'danger' as const,
                                  onClick: () => remove(i.id),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </>
        )}
      </DataTable>

      <Modal
        open={viewModalOpen}
        onClose={closeModal}
        title="Inspection details"
        subtitle="Review schedule, status, and complete the inspection"
        size="2xl"
      >
        {recordId && (
          <InspectionDetailPanel
            key={recordId}
            inspectionId={recordId}
            onUpdated={load}
          />
        )}
      </Modal>

      <Modal
        open={scheduleModalOpen}
        onClose={closeModal}
        title="Schedule Inspection"
        subtitle="Assign an inspection and notify the inspector by email"
        size="lg"
      >
        <ScheduleInspectionForm
          onSuccess={() => {
            closeModal();
            toast.success('Inspection scheduled');
            load();
          }}
          onCancel={closeModal}
        />
      </Modal>
    </AppLayout>
  );
}

export default function InspectionsPage() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <InspectionsContent />
    </Suspense>
  );
}
