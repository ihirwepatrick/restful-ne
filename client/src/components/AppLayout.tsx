'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './notifications/NotificationBell';
import PageLoader from '@/components/ui/PageLoader';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--main-bg)]">
        <PageLoader label="Signing in…" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--main-bg)] transition-colors">
      <Sidebar />
      <div className="ml-64 flex min-h-screen min-w-0 flex-col">
        <header className="app-header-bar sticky top-0 z-20 flex shrink-0 items-center justify-end gap-2 border-b px-8 py-3">
          <NotificationBell />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-8 text-[var(--text-primary)]">{children}</main>
      </div>
    </div>
  );
}
