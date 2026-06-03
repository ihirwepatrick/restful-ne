'use client';

import { statusToneClass, type StatusTone } from '@/lib/table-status';

export default function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  return <span className={statusToneClass(tone)}>{label}</span>;
}
