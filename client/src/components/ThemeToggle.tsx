'use client';

import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, mounted, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150 ease-in-out cursor-pointer active:scale-[0.98]
        border-[var(--border-color)] bg-[var(--surface-bg)] text-[var(--text-muted)]
        hover:bg-[var(--surface-elevated)] hover:border-orange-500/40 hover:text-[var(--text-primary)] hover:shadow-sm
        ${className}`}
    >
      <Icon icon={mounted ? (isDark ? NavIcons.sun : NavIcons.moon) : NavIcons.sun} size={18} />
      <span className="hidden sm:inline">
        {mounted ? (isDark ? 'Light' : 'Dark') : '…'}
      </span>
    </button>
  );
}
