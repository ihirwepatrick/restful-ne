'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';
import type { IconSvgElement } from '@hugeicons/react';
import { NavIcons } from '@/lib/nav-icons';

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: IconSvgElement;
  variant?: 'default' | 'danger';
  disabled?: boolean;
};

const variantClass = {
  default:
    'text-[var(--text-muted)] hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10',
  danger: 'text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10',
};

function ActionButton({ action }: { action: Action }) {
  const cls = `inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${variantClass[action.variant || 'default']} ${action.disabled ? 'opacity-40 pointer-events-none' : ''}`;

  if (action.href) {
    return (
      <Link href={action.href} className={cls} title={action.label}>
        <Icon icon={action.icon || NavIcons.view} size={14} />
        <span className="hidden sm:inline">{action.label}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={cls} title={action.label} disabled={action.disabled}>
      <Icon icon={action.icon || NavIcons.view} size={14} />
      <span className="hidden sm:inline">{action.label}</span>
    </button>
  );
}

export default function TableActions({ actions }: { actions: Action[] }) {
  if (actions.length === 0) return <span className="text-[var(--text-muted)]">—</span>;

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {actions.map((action) => (
        <ActionButton key={action.label} action={action} />
      ))}
    </div>
  );
}
