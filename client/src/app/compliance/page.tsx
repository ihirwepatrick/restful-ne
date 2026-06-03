'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import IconButton from '@/components/IconButton';
import Modal from '@/components/ui/Modal';
import ComplianceRecordForm from '@/components/forms/ComplianceRecordForm';
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
import { complianceStatusTone } from '@/lib/table-status';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDataTable } from '@/hooks/useDataTable';
import RouteLoadingFallback from '@/components/ui/RouteLoadingFallback';

interface ComplianceRecord {
  id: string;
  extinguisherId: string;
  requirement: string;
  dueDate: string;
  status: string;
  completedAt?: string;
}

function ComplianceContent() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modalOpen = searchParams.get('modal') === 'new';

  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const canEdit = user?.role === 'ADMIN' || user?.role === 'INSPECTOR';
  const isAdmin = user?.role === 'ADMIN';

  const load = useCallback(
    () => api<ComplianceRecord[]>('/api/reports/compliance').then(setRecords),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const closeModal = () => router.push(pathname);

  const filterFn = useCallback(
    (row: ComplianceRecord, q: string) =>
      row.requirement.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q) ||
      row.extinguisherId.toLowerCase().includes(q),
    [],
  );

  const table = useDataTable(records, filterFn);

  const markComplete = async (id: string) => {
    try {
      await api(`/api/reports/compliance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completedAt: new Date().toISOString(), status: 'Compliant' }),
      });
      toast.success('Compliance record completed');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update record');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Compliance Board"
        icon={NavIcons.compliance}
        action={
          canEdit ? (
            <IconButton icon={NavIcons.add} onClick={() => router.push(`${pathname}?modal=new`)}>
              Add Record
            </IconButton>
          ) : undefined
        }
      />
      {isAdmin && <AdminQuickActions />}
      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search requirement, status, extinguisher…"
        rangeStart={table.rangeStart}
        rangeEnd={table.rangeEnd}
        totalCount={table.totalCount}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
        pageSize={table.pageSize}
        onPageSizeChange={table.setPageSize}
      />
      <DataTable isEmpty={table.filteredRows.length === 0} emptyMessage="No compliance records yet.">
        {table.pagedRows.length > 0 && (
          <>
            <DataTableHead>
              <DataTableHeaderCell>Requirement</DataTableHeaderCell>
              <DataTableHeaderCell>Extinguisher</DataTableHeaderCell>
              <DataTableHeaderCell>Due date</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              {canEdit && <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>}
            </DataTableHead>
            <DataTableBody>
              {table.pagedRows.map((r) => (
                <DataTableRow key={r.id} className={r.status === 'Overdue' ? 'bg-red-500/5' : ''}>
                  <DataTableCell emphasis>{r.requirement}</DataTableCell>
                  <DataTableCell className="font-mono text-xs text-[var(--text-muted)]">
                    {r.extinguisherId.slice(0, 12)}…
                  </DataTableCell>
                  <DataTableCell className="text-[var(--text-muted)]">
                    {new Date(r.dueDate).toLocaleDateString()}
                  </DataTableCell>
                  <DataTableCell>
                    <StatusBadge label={r.status} tone={complianceStatusTone(r.status)} />
                  </DataTableCell>
                  {canEdit && (
                    <DataTableCell align="right">
                      <TableActions
                        actions={[
                          {
                            label: 'View unit',
                            href: `/extinguishers?modal=view&id=${r.extinguisherId}`,
                            icon: NavIcons.view,
                          },
                          ...(r.status !== 'Compliant'
                            ? [
                                {
                                  label: 'Complete',
                                  icon: NavIcons.success,
                                  onClick: () => markComplete(r.id),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </DataTableCell>
                  )}
                </DataTableRow>
              ))}
            </DataTableBody>
          </>
        )}
      </DataTable>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Add compliance record"
        subtitle="Track regulatory or internal requirements per extinguisher"
        size="lg"
      >
        <ComplianceRecordForm
          onSuccess={() => {
            closeModal();
            toast.success('Compliance record created');
            load();
          }}
          onCancel={closeModal}
        />
      </Modal>
    </AppLayout>
  );
}

export default function CompliancePage() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ComplianceContent />
    </Suspense>
  );
}
