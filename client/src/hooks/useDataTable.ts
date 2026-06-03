'use client';

import { useMemo, useState } from 'react';

export function useDataTable<T>(
  rows: T[],
  filterFn: (row: T, search: string) => boolean,
  initialPageSize = 10,
) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => filterFn(row, q));
  }, [rows, search, filterFn]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize) || 1);
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const setSearchAndReset = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const setPageSizeAndReset = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    search,
    setSearch: setSearchAndReset,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: setPageSizeAndReset,
    filteredRows,
    pagedRows,
    totalPages,
    totalCount: filteredRows.length,
    rangeStart: filteredRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1,
    rangeEnd: Math.min(safePage * pageSize, filteredRows.length),
  };
}
