'use client';

import type { TextareaHTMLAttributes } from 'react';
import { formColSpan } from './FormGrid';
import { inputClass } from './FormField';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  colSpan?: 'full' | '3' | '2';
}

export default function FormTextarea({
  label,
  required,
  error,
  hint,
  colSpan = 'full',
  id,
  ...props
}: FormTextareaProps) {
  const fieldId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={formColSpan(colSpan)}>
      <label htmlFor={fieldId} className="text-sm font-medium text-[var(--form-label)]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={!!error}
        className={`${inputClass} resize-y min-h-[88px] ${error ? 'border-red-500/60' : ''}`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
