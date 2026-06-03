'use client';

import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';

const actions = [
  { href: '/admin/users', label: 'Users', icon: NavIcons.users },
  { href: '/extinguishers?modal=new', label: 'Add extinguisher', icon: NavIcons.add },
  { href: '/inspections?modal=schedule', label: 'Schedule inspection', icon: NavIcons.schedule },
  { href: '/maintenance?modal=log', label: 'Log maintenance', icon: NavIcons.maintenance },
  { href: '/compliance?modal=new', label: 'Add compliance', icon: NavIcons.compliance },
];

export default function AdminQuickActions() {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {actions.map((item) => (
        <button
          key={item.href}
          type="button"
          onClick={() => router.push(item.href)}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-orange-500/40 hover:bg-orange-500/10"
        >
          <Icon icon={item.icon} size={16} className="text-orange-600 dark:text-orange-400" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
