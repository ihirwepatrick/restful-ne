'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';
import { api } from '@/lib/api';

interface NotificationItem {
  inspectionId: string;
  extinguisherId: string;
  serialNumber: string;
  scheduledAt: string;
  status: string;
  isOverdue: boolean;
  title: string;
}

interface NotificationsResponse {
  items: NotificationItem[];
  count: number;
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    api<NotificationsResponse>('/api/operations/notifications/me')
      .then((data) => {
        setItems(data.items);
        setCount(data.count);
      })
      .catch(() => {
        setItems([]);
        setCount(0);
      });
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(load, 60_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const viewInspection = (id: string) => {
    setOpen(false);
    router.push(`/inspections?modal=view&id=${id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--main-bg)] hover:text-[var(--text-primary)]"
        aria-label="Notifications"
      >
        <Icon icon={NavIcons.bell} size={20} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[var(--card-border)] bg-[var(--surface-bg)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Your tasks</span>
            <Link
              href="/notifications"
              className="text-xs text-orange-600 hover:underline dark:text-orange-400"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                No open inspections assigned to you.
              </li>
            ) : (
              items.map((n) => (
                <li key={n.inspectionId}>
                  <button
                    type="button"
                    onClick={() => viewInspection(n.inspectionId)}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--main-bg)]"
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(n.scheduledAt).toLocaleString()}
                      {n.isOverdue && (
                        <span className="ml-2 font-medium text-red-500">Overdue</span>
                      )}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
