'use client';

import { inputBaseClass } from '@/components/forms/FormField';
import { buttonClass } from '@/components/Button';

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  rangeStart: number;
  rangeEnd: number;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export default function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  rangeStart,
  rangeEnd,
  totalCount,
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: TableToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className={`${inputBaseClass} max-w-md`}
        aria-label="Search table"
      />
      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
        <span>
          {totalCount === 0
            ? 'No results'
            : `Showing ${rangeStart}–${rangeEnd} of ${totalCount}`}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className={`${inputBaseClass} w-auto py-1.5 text-xs`}
          aria-label="Rows per page"
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={buttonClass('filter', 'sm')}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={buttonClass('filter', 'sm')}
        >
          Next
        </button>
      </div>
    </div>
  );
}
