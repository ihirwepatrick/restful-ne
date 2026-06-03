'use client';

import type { ReactNode } from 'react';

interface FormShellProps {
  title: string;
  subtitle?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  embedded?: boolean;
}

export default function FormShell({
  title,
  subtitle,
  error,
  children,
  className = '',
  embedded = false,
}: FormShellProps) {
  const wrapper = embedded ? '' : 'sm:mx-auto sm:max-w-2xl';

  return (
    <div className={`${wrapper} ${className}`}>
      {!embedded && (
        <>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
          )}
        </>
      )}
      {embedded && (
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h2>
      )}
      {embedded && subtitle && (
        <p className="text-sm text-[var(--text-muted)] mb-4">{subtitle}</p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className={embedded ? '' : 'mt-8'}>{children}</div>
    </div>
  );
}
