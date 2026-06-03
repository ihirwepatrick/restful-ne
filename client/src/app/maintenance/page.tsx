'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import IconButton from '@/components/IconButton';
import Modal from '@/components/ui/Modal';
import MaintenanceLogForm from '@/components/forms/MaintenanceLogForm';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import TableToolbar from '@/components/tables/TableToolbar';
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
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDataTable } from '@/hooks/useDataTable';
import RouteLoadingFallback from '@/components/ui/RouteLoadingFallback';

interface MaintenanceLog {
  id: string;
  extinguisherId: string;
  performedAt: string;
  actionTaken: string;
  conditionsNoted: string;
}

function MaintenanceContent() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modalOpen = searchParams.get('modal') === 'log';
  const presetExtinguisherId = searchParams.get('extinguisherId') ?? undefined;

  const [items, setItems] = useState<MaintenanceLog[]>([]);
  const canLog = user?.role === 'ADMIN' || user?.role === 'INSPECTOR';
  const isAdmin = user?.role === 'ADMIN';

  const load = useCallback(
    () => api<MaintenanceLog[]>('/api/operations/maintenance').then(setItems).catch(console.error),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const closeModal = () => router.push(pathname);
  const openLog = (extinguisherId?: string) => {
    const q = extinguisherId ? `?modal=log&extinguisherId=${extinguisherId}` : '?modal=log';
    router.push(`${pathname}${q}`);
  };

  const filterFn = useCallback(
    (row: MaintenanceLog, q: string) =>
      row.actionTaken.toLowerCase().includes(q) ||
      row.conditionsNoted.toLowerCase().includes(q) ||
      row.extinguisherId.toLowerCase().includes(q),
    [],
  );

  const table = useDataTable(items, filterFn);

  return (
    <AppLayout>
      <PageHeader
        title="Maintenance History"
        icon={NavIcons.maintenance}
        action={
          canLog ? (
            <IconButton icon={NavIcons.maintenanceLog} onClick={() => openLog()}>
              Log Maintenance
            </IconButton>
          ) : undefined
        }
      />
      {isAdmin && <AdminQuickActions />}
      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search action, conditions, extinguisher…"
        rangeStart={table.rangeStart}
        rangeEnd={table.rangeEnd}
        totalCount={table.totalCount}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
        pageSize={table.pageSize}
        onPageSizeChange={table.setPageSize}
      />
      <DataTable isEmpty={table.filteredRows.length === 0} emptyMessage="No maintenance logs recorded yet.">
        {table.pagedRows.length > 0 && (
          <>
            <DataTableHead>
              <DataTableHeaderCell>Action</DataTableHeaderCell>
              <DataTableHeaderCell>Performed</DataTableHeaderCell>
              <DataTableHeaderCell>Conditions</DataTableHeaderCell>
              <DataTableHeaderCell>Extinguisher</DataTableHeaderCell>
              <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {table.pagedRows.map((m) => (
                <DataTableRow key={m.id}>
                  <DataTableCell emphasis>
                    <StatusBadge label={m.actionTaken} tone="info" />
                  </DataTableCell>
                  <DataTableCell className="text-[var(--text-muted)]">
                    {new Date(m.performedAt).toLocaleString()}
                  </DataTableCell>
                  <DataTableCell className="max-w-xs truncate text-[var(--text-muted)]">
                    {m.conditionsNoted}
                  </DataTableCell>
                  <DataTableCell className="font-mono text-xs text-[var(--text-muted)]">
                    {m.extinguisherId.slice(0, 12)}…
                  </DataTableCell>
                  <DataTableCell align="right">
                    <TableActions
                      actions={[
                        {
                          label: 'View unit',
                          href: `/extinguishers?modal=view&id=${m.extinguisherId}`,
                          icon: NavIcons.view,
                        },
                        ...(canLog
                          ? [
                              {
                                label: 'Log again',
                                icon: NavIcons.add,
                                onClick: () => openLog(m.extinguisherId),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </>
        )}
      </DataTable>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Log Maintenance"
        subtitle="Record service performed on a fleet unit"
        size="lg"
      >
        <MaintenanceLogForm
          key={presetExtinguisherId ?? 'new'}
          initialExtinguisherId={presetExtinguisherId}
          onSuccess={() => {
            closeModal();
            toast.success('Maintenance logged');
            load();
          }}
          onCancel={closeModal}
        />
      </Modal>
    </AppLayout>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <MaintenanceContent />
    </Suspense>
  );
}
