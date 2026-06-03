'use client';

import Spinner from '@/components/ui/Spinner';

interface PageLoaderProps {
  label?: string;
  className?: string;
}

export default function PageLoader({ label = 'Loading…', className = '' }: PageLoaderProps) {
  return (
    <div
      className={`flex min-h-[12rem] flex-col items-center justify-center gap-3 text-[var(--text-muted)] ${className}`}
    >
      <Spinner size={36} />
      {label ? <p className="text-sm font-medium">{label}</p> : null}
    </div>
  );
}
