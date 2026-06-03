'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import IconButton from '@/components/IconButton';
import Modal from '@/components/ui/Modal';
import ExtinguisherForm from '@/components/forms/ExtinguisherForm';
import ExtinguisherDetailPanel from '@/components/extinguishers/ExtinguisherDetailPanel';
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
import { extinguisherStatusTone } from '@/lib/table-status';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useDataTable } from '@/hooks/useDataTable';
import RouteLoadingFallback from '@/components/ui/RouteLoadingFallback';

interface Extinguisher {
  id: string;
  serialNumber: string;
  location: string;
  type: { name: string };
  size: { label: string };
  status: { name: string };
  expiryDate: string;
}

function ExtinguishersContent() {
  const { user } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modal = searchParams.get('modal');
  const recordId = searchParams.get('id');

  const [items, setItems] = useState<Extinguisher[]>([]);
  const canEdit = user?.role === 'ADMIN' || user?.role === 'INSPECTOR';
  const isAdmin = user?.role === 'ADMIN';

  const load = useCallback(
    () => api<Extinguisher[]>('/api/equipment/extinguishers').then(setItems).catch(console.error),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const closeModal = () => router.push(pathname);

  const openCreate = () => router.push(`${pathname}?modal=new`);
  const openView = (id: string) => router.push(`${pathname}?modal=view&id=${id}`);
  const openEdit = (id: string) => router.push(`${pathname}?modal=edit&id=${id}`);

  const onSaved = () => {
    closeModal();
    toast.success(modal === 'edit' ? 'Extinguisher updated' : 'Extinguisher created');
    load();
  };

  const filterFn = useCallback(
    (row: Extinguisher, q: string) =>
      row.serialNumber.toLowerCase().includes(q) ||
      row.location.toLowerCase().includes(q) ||
      (row.type?.name || '').toLowerCase().includes(q) ||
      (row.status?.name || '').toLowerCase().includes(q),
    [],
  );

  const table = useDataTable(items, filterFn);

  const remove = async (id: string, serial: string) => {
    const ok = await confirm({
      title: 'Delete extinguisher',
      message: `Delete extinguisher ${serial}? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api(`/api/equipment/extinguishers/${id}`, { method: 'DELETE' });
      toast.success('Extinguisher deleted');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete extinguisher');
    }
  };

  const formModalOpen = modal === 'new' || (modal === 'edit' && !!recordId);
  const viewModalOpen = modal === 'view' && !!recordId;

  const viewedItem = recordId ? items.find((e) => e.id === recordId) : undefined;

  return (
    <AppLayout>
      {ConfirmDialog}
      <PageHeader
        title="Fire Extinguishers"
        icon={NavIcons.extinguishers}
        action={
          canEdit ? (
            <IconButton icon={NavIcons.add} onClick={openCreate}>
              Add New
            </IconButton>
          ) : undefined
        }
      />
      {isAdmin && <AdminQuickActions />}
      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search serial, location, type, status…"
        rangeStart={table.rangeStart}
        rangeEnd={table.rangeEnd}
        totalCount={table.totalCount}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
        pageSize={table.pageSize}
        onPageSizeChange={table.setPageSize}
      />
      <DataTable isEmpty={table.filteredRows.length === 0} emptyMessage="No extinguishers registered yet.">
        {table.pagedRows.length > 0 && (
          <>
            <DataTableHead>
              <DataTableHeaderCell>Serial</DataTableHeaderCell>
              <DataTableHeaderCell>Location</DataTableHeaderCell>
              <DataTableHeaderCell>Type</DataTableHeaderCell>
              <DataTableHeaderCell>Size</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell>Expiry</DataTableHeaderCell>
              <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {table.pagedRows.map((e) => (
                <DataTableRow key={e.id} onClick={() => openView(e.id)}>
                  <DataTableCell emphasis>{e.serialNumber}</DataTableCell>
                  <DataTableCell>{e.location}</DataTableCell>
                  <DataTableCell className="text-[var(--text-muted)]">{e.type?.name}</DataTableCell>
                  <DataTableCell className="text-[var(--text-muted)]">{e.size?.label}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge
                      label={e.status?.name ?? 'Unknown'}
                      tone={extinguisherStatusTone(e.status?.name ?? '')}
                    />
                  </DataTableCell>
                  <DataTableCell className="text-[var(--text-muted)]">
                    {new Date(e.expiryDate).toLocaleDateString()}
                  </DataTableCell>
                  <DataTableCell align="right" onClick={(ev) => ev.stopPropagation()}>
                    <TableActions
                      actions={[
                        { label: 'View', icon: NavIcons.view, onClick: () => openView(e.id) },
                        ...(canEdit
                          ? [{ label: 'Edit', icon: NavIcons.edit, onClick: () => openEdit(e.id) }]
                          : []),
                        ...(isAdmin
                          ? [
                              {
                                label: 'Delete',
                                icon: NavIcons.delete,
                                variant: 'danger' as const,
                                onClick: () => remove(e.id, e.serialNumber),
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
        open={viewModalOpen}
        onClose={closeModal}
        title={viewedItem?.serialNumber ?? 'Extinguisher details'}
        subtitle={viewedItem?.location ?? 'Fleet unit overview and activity history'}
        size="2xl"
      >
        {recordId && (
          <ExtinguisherDetailPanel
            key={recordId}
            extinguisherId={recordId}
            canEdit={canEdit}
            onEdit={() => openEdit(recordId)}
          />
        )}
      </Modal>

      <Modal
        open={formModalOpen}
        onClose={closeModal}
        title={modal === 'edit' ? 'Edit Extinguisher' : 'Add Extinguisher'}
        subtitle={
          modal === 'edit'
            ? 'Update fleet unit details'
            : 'Register a new unit in the fleet inventory'
        }
        size="xl"
      >
        {modal === 'new' && <ExtinguisherForm onSuccess={onSaved} onCancel={closeModal} />}
        {modal === 'edit' && recordId && (
          <ExtinguisherForm extinguisherId={recordId} onSuccess={onSaved} onCancel={closeModal} />
        )}
      </Modal>
    </AppLayout>
  );
}

export default function ExtinguishersPage() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ExtinguishersContent />
    </Suspense>
  );
}
