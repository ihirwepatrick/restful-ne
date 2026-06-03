'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';

interface EditableEmailFieldProps {
  email: string;
  onEmailChange: (email: string) => void;
}

export default function EditableEmailField({ email, onEmailChange }: EditableEmailFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(email);

  useEffect(() => {
    setDraft(email);
  }, [email]);

  const hasChanges = draft.trim() !== email.trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.trim());

  const startEdit = () => {
    setDraft(email);
    setEditing(true);
  };

  const save = () => {
    onEmailChange(draft.trim());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(email);
    setEditing(false);
  };

  if (editing) {
    return (
      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1.5">Email address</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <Icon icon={NavIcons.mail} size={18} />
          </span>
          <input
            type="email"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            required
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-colors"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!hasChanges || !isValidEmail}
            className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-orange-600"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={cancel}
            className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm text-[var(--text-muted)] mb-1.5">Email address</label>
      <div className="flex items-center gap-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-3">
        <span className="text-[var(--text-muted)] shrink-0">
          <Icon icon={NavIcons.mail} size={18} />
        </span>
        <span className="flex-1 min-w-0 truncate text-sm text-[var(--text-primary)]">{email}</span>
        <button
          type="button"
          onClick={startEdit}
          aria-label="Edit email address"
          className="shrink-0 rounded-md p-1.5 text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--surface-bg)] hover:text-[var(--text-primary)] active:scale-95"
        >
          <Icon icon={NavIcons.edit} size={16} />
        </button>
      </div>
    </div>
  );
}
