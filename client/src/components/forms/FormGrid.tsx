'use client';

import type { ReactNode } from 'react';

export default function FormGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">{children}</div>
  );
}

export function formColSpan(span: 'full' | '3' | '2'): string {
  if (span === 'full') return 'col-span-full';
  if (span === '3') return 'col-span-full sm:col-span-3';
  return 'col-span-full sm:col-span-2';
}
