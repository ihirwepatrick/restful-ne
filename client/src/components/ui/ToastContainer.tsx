'use client';

import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';
import { useToast } from '@/context/ToastContext';

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
            t.type === 'success'
              ? 'border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-300'
              : 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300'
          }`}
        >
          <Icon
            icon={t.type === 'success' ? NavIcons.success : NavIcons.alert}
            size={18}
            className="shrink-0 mt-0.5"
          />
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <Icon icon={NavIcons.close} size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
