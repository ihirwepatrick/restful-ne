'use client';

import { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
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
import RoleSelect from '@/components/tables/RoleSelect';
import TableActions from '@/components/tables/TableActions';
import { NavIcons } from '@/lib/nav-icons';
import { roleTone } from '@/lib/table-status';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useDataTable } from '@/hooks/useDataTable';
import PageLoader from '@/components/ui/PageLoader';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    () =>
      api<User[]>('/api/auth/users')
        .then(setUsers)
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const filterFn = useCallback(
    (row: User, q: string) =>
      `${row.firstName} ${row.lastName}`.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.role.toLowerCase().includes(q),
    [],
  );

  const table = useDataTable(users, filterFn);

  const updateRole = async (id: string, role: string) => {
    try {
      await api(`/api/auth/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
      toast.success('Role updated');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const removeUser = async (u: User) => {
    const ok = await confirm({
      title: 'Delete user',
      message: `Permanently delete ${u.firstName} ${u.lastName} (${u.email})?`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api(`/api/auth/users/${u.id}`, { method: 'DELETE' });
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <AppLayout>
      {ConfirmDialog}
      <PageHeader
        title="User Management"
        subtitle="Manage roles and access for inspectors, users, and administrators"
        icon={NavIcons.users}
      />
      <AdminQuickActions />
      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search name, email, role…"
        rangeStart={table.rangeStart}
        rangeEnd={table.rangeEnd}
        totalCount={table.totalCount}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
        pageSize={table.pageSize}
        onPageSizeChange={table.setPageSize}
      />
      {loading ? (
        <PageLoader label="Loading users…" />
      ) : (
      <DataTable isEmpty={table.filteredRows.length === 0} emptyMessage="No users found.">
        {table.pagedRows.length > 0 && (
          <>
            <DataTableHead>
              <DataTableHeaderCell>Name</DataTableHeaderCell>
              <DataTableHeaderCell>Email</DataTableHeaderCell>
              <DataTableHeaderCell>Role</DataTableHeaderCell>
              <DataTableHeaderCell>Joined</DataTableHeaderCell>
              <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {table.pagedRows.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <DataTableRow key={u.id}>
                    <DataTableCell emphasis>
                      {u.firstName} {u.lastName}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">(you)</span>
                      )}
                    </DataTableCell>
                    <DataTableCell className="text-[var(--text-muted)]">{u.email}</DataTableCell>
                    <DataTableCell>
                      <StatusBadge label={u.role} tone={roleTone(u.role)} />
                    </DataTableCell>
                    <DataTableCell className="text-[var(--text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </DataTableCell>
                    <DataTableCell align="right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <RoleSelect
                          value={u.role}
                          disabled={isSelf}
                          onChange={(role) => updateRole(u.id, role)}
                        />
                        <TableActions
                          actions={[
                            {
                              label: 'Email',
                              href: `mailto:${u.email}`,
                              icon: NavIcons.mail,
                            },
                            ...(!isSelf
                              ? [
                                  {
                                    label: 'Delete',
                                    icon: NavIcons.delete,
                                    variant: 'danger' as const,
                                    onClick: () => removeUser(u),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </div>
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
