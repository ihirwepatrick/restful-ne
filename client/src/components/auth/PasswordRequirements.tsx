'use client';

import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';
import { getPasswordChecks } from '@/lib/password';

interface PasswordRequirementsProps {
  password: string;
  confirmPassword: string;
}

export default function PasswordRequirements({ password, confirmPassword }: PasswordRequirementsProps) {
  const checks = getPasswordChecks(password, confirmPassword);
  const hasInput = password.length > 0 || confirmPassword.length > 0;

  if (!hasInput) return null;

  return (
    <ul className="space-y-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-bg)] px-4 py-3">
      {checks.map((check) => (
        <li key={check.id} className="flex items-center gap-2.5 text-sm">
          {check.met ? (
            <span className="flex shrink-0 items-center justify-center text-green-600">
              <Icon icon={NavIcons.success} size={18} />
            </span>
          ) : (
            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[var(--border-color)]" />
          )}
          <span className={check.met ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
            {check.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
