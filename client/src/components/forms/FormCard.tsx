'use client';

import type { ReactNode } from 'react';

export default function FormCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
