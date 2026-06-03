'use client';

import type { ReactNode } from 'react';
import type { IconSvgElement } from '@hugeicons/react';
import { buttonClass } from '@/components/Button';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconSvgElement;
  action?: ReactNode;
  onRefresh?: () => void;
}

export default function PageHeader({ title, subtitle, icon, action, onRefresh }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-start">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
            <Icon icon={icon} size={22} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className={buttonClass('secondary', 'md', 'shadow-none')}
            aria-label="Refresh"
          >
            <Icon icon={NavIcons.refresh} size={16} />
            Refresh
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
