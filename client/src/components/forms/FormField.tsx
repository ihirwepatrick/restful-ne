'use client';

import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';
import { formColSpan } from './FormGrid';

export const inputBaseClass =
  'w-full rounded-lg border border-[var(--form-input-border)] bg-[var(--form-input-bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 disabled:opacity-50';

export const inputClass = `mt-2 ${inputBaseClass}`;

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  colSpan?: 'full' | '3' | '2';
  children?: ReactNode;
  showPasswordToggle?: boolean;
}

export default function FormField({
  label,
  required,
  error,
  hint,
  colSpan = 'full',
  children,
  id,
  showPasswordToggle = false,
  type,
  ...inputProps
}: FormFieldProps) {
  const fieldId = id || inputProps.name || label.toLowerCase().replace(/\s+/g, '-');
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password' && showPasswordToggle;
  const inputType = isPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div className={formColSpan(colSpan)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-[var(--form-label)]"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children ?? (
        <div className={isPassword ? 'relative mt-2' : ''}>
          <input
            id={fieldId}
            type={inputType}
            aria-invalid={!!error}
            className={`${isPassword ? inputBaseClass : inputClass} ${
              error ? 'border-red-500/60 focus:ring-red-500/30' : ''
            } ${isPassword ? 'pr-11' : ''}`}
            {...inputProps}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--main-bg)] hover:text-[var(--text-primary)]"
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              <Icon icon={NavIcons.view} size={18} />
            </button>
          )}
        </div>
      )}
      {hint && !error && <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
