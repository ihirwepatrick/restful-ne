export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const toneClasses: Record<StatusTone, string> = {
  success:
    'bg-emerald-500/15 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/20',
  warning:
    'bg-orange-500/15 text-orange-800 ring-orange-600/20 dark:bg-orange-500/20 dark:text-orange-400 dark:ring-orange-400/20',
  danger:
    'bg-red-500/15 text-red-700 ring-red-600/20 dark:bg-red-500/20 dark:text-red-400 dark:ring-red-400/20',
  neutral:
    'bg-[var(--main-bg)] text-[var(--text-muted)] ring-[var(--card-border)]',
  info: 'bg-blue-500/15 text-blue-700 ring-blue-600/20 dark:bg-blue-500/20 dark:text-blue-400 dark:ring-blue-400/20',
};

export function statusToneClass(tone: StatusTone): string {
  return `inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`;
}

export function roleTone(role: string): StatusTone {
  if (role === 'ADMIN') return 'danger';
  if (role === 'INSPECTOR') return 'info';
  return 'neutral';
}

export function inspectionStatusTone(status: string, overdue?: boolean): StatusTone {
  if (overdue) return 'danger';
  if (status === 'Completed') return 'success';
  if (status === 'InProgress') return 'warning';
  if (status === 'Cancelled') return 'neutral';
  return 'info';
}

export function extinguisherStatusTone(name: string): StatusTone {
  const n = name.toLowerCase();
  if (n.includes('expired') || n.includes('inactive')) return 'danger';
  if (n.includes('maintenance')) return 'warning';
  if (n.includes('active') || n.includes('stock')) return 'success';
  return 'neutral';
}

export function complianceStatusTone(status: string): StatusTone {
  if (status === 'Overdue') return 'danger';
  if (status === 'Compliant') return 'success';
  return 'warning';
}
