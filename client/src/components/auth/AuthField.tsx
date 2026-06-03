'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';
import { inputBaseClass } from '@/components/forms/FormField';
import type { IconSvgElement } from '@hugeicons/react';

interface AuthFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  icon?: IconSvgElement;
  showToggle?: boolean;
  error?: string;
  onBlur?: () => void;
  id?: string;
}

export default function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  minLength,
  maxLength,
  icon,
  showToggle,
  error,
  onBlur,
  id,
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? 'text' : 'password') : type;
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-medium text-[var(--form-label)]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative mt-2">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <Icon icon={icon} size={18} />
          </span>
        )}
        <input
          id={fieldId}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          aria-invalid={!!error}
          className={`${inputBaseClass} ${
            error ? 'border-red-500/60 focus:ring-red-500/30' : ''
          } ${icon ? 'pl-10 pr-4' : ''} ${showToggle ? 'pr-11' : ''}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--surface-bg)] hover:text-[var(--text-primary)] active:scale-95"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            <Icon icon={NavIcons.view} size={18} />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
