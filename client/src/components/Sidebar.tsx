'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/Icon';
import { getNavIcon, NavIcons } from '@/lib/nav-icons';
import { api } from '@/lib/api';
import type { DashboardData } from '@/lib/dashboard-types';

type NavLink = {
  href: string;
  label: string;
  roles: string[];
  badgeKey?: 'overdue' | 'notifications';
};

const navGroups: { title: string; links: NavLink[] }[] = [
  {
    title: 'Overview',
    links: [
      { href: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
      { href: '/reports', label: 'Reports', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
    ],
  },
  {
    title: 'Fleet',
    links: [
      { href: '/extinguishers', label: 'Extinguishers', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
    ],
  },
  {
    title: 'Operations',
    links: [
      { href: '/inspections', label: 'Inspections', roles: ['ADMIN', 'INSPECTOR', 'USER'], badgeKey: 'overdue' },
      { href: '/notifications', label: 'Notifications', roles: ['ADMIN', 'INSPECTOR'], badgeKey: 'notifications' },
      { href: '/inspections/schedule', label: 'Schedule Inspection', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
      { href: '/maintenance', label: 'Maintenance', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
      { href: '/maintenance/log', label: 'Log Maintenance', roles: ['ADMIN', 'INSPECTOR'] },
    ],
  },
  {
    title: 'Compliance',
    links: [
      { href: '/compliance', label: 'Compliance', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/profile', label: 'Profile', roles: ['ADMIN', 'INSPECTOR', 'USER'] },
      { href: '/admin/users', label: 'User Management', roles: ['ADMIN'] },
    ],
  },
];

/** Only the most specific nav href matches (avoids /maintenance + /maintenance/log both active). */
function resolveActiveHref(pathname: string, hrefs: string[]): string | null {
  const matches = hrefs.filter(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.length - a.length)[0]!;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [overdueCount, setOverdueCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    api<DashboardData>('/api/reports/dashboard?period=30d')
      .then((d) => setOverdueCount(d.inspections.overdue))
      .catch(() => {});
    if (user.role === 'ADMIN' || user.role === 'INSPECTOR') {
      api<{ count: number }>('/api/operations/notifications/me')
        .then((d) => setNotificationCount(d.count))
        .catch(() => {});
    }
  }, [user]);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex h-dvh w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] transition-colors">
      <div className="shrink-0 p-5 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-orange-600 rounded-lg shrink-0">
            <Icon icon={NavIcons.brand} size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight truncate text-[var(--sidebar-text)]">
              TZW Fire Safety
            </h1>
            <p className="text-xs text-[var(--sidebar-text-muted)] mt-0.5 truncate">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
        <span className="text-xs bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] px-2 py-0.5 rounded mt-3 inline-block font-medium">
          {user?.role}
        </span>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
        {navGroups.map((group) => {
          const visibleLinks = group.links.filter((l) => user && l.roles.includes(user.role));
          if (visibleLinks.length === 0) return null;
          const activeHref = resolveActiveHref(
            pathname,
            visibleLinks.map((l) => l.href),
          );
          return (
            <div key={group.title} className="mb-4">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-text-muted)]">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {visibleLinks.map((link) => {
                  const active = link.href === activeHref;
                  const badge =
                    link.badgeKey === 'overdue' && overdueCount > 0
                      ? overdueCount
                      : link.badgeKey === 'notifications' && notificationCount > 0
                        ? notificationCount
                        : null;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] shadow-sm'
                          : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)]'
                      }`}
                    >
                      <Icon icon={getNavIcon(link.href)} size={18} />
                      <span className="flex-1 truncate">{link.label}</span>
                      {badge !== null && (
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-red-500/25 text-red-200'
                          }`}
                        >
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-[var(--sidebar-border)] p-3">
      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm text-[var(--sidebar-text)] border border-[var(--sidebar-border)] rounded-xl transition-all duration-150 hover:bg-[var(--sidebar-hover-bg)] hover:border-[var(--sidebar-active)]/50 active:scale-[0.98]"
      >
        <Icon icon={NavIcons.logout} size={18} />
        Logout
      </button>
      </div>
    </aside>
  );
}
