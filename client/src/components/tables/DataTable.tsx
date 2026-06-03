'use client';

import type { MouseEventHandler, ReactNode } from 'react';

export function DataTable({
  children,
  className = '',
  emptyMessage,
  isEmpty,
}: {
  children: ReactNode;
  className?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden ${className}`}
    >
      {isEmpty && emptyMessage ? (
        <p className="p-8 text-center text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">{children}</table>
        </div>
      )}
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[var(--card-border)] bg-[var(--main-bg)]">{children}</tr>
    </thead>
  );
}

export function DataTableHeaderCell({
  children,
  className = '',
  align = 'left',
}: {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] ${alignClass} ${className}`}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--card-border)]">{children}</tbody>;
}

export function DataTableRow({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={`transition-colors hover:bg-[var(--main-bg)]/60 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  className = '',
  align = 'left',
  emphasis = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  emphasis?: boolean;
  onClick?: MouseEventHandler<HTMLTableCellElement>;
}) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td
      className={`px-4 py-3.5 ${alignClass} ${
        emphasis ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </td>
  );
}
