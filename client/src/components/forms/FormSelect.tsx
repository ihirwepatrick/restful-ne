'use client';

import type { SelectHTMLAttributes } from 'react';
import { formColSpan } from './FormGrid';
import CustomSelect from '@/components/ui/CustomSelect';

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  colSpan?: 'full' | '3' | '2';
  options: { value: string | number; label: string; disabled?: boolean }[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function FormSelect({
  label,
  required,
  error,
  hint,
  colSpan = 'full',
  options,
  id,
  value,
  onChange,
  name,
  disabled,
}: FormSelectProps) {
  const fieldId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  const handleChange = (next: string | number) => {
    onChange?.({
      target: { value: String(next), name: name ?? '' },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div className={formColSpan(colSpan)}>
      <label htmlFor={fieldId} className="text-sm font-medium text-[var(--form-label)]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <CustomSelect
        id={fieldId}
        value={value ?? ''}
        onChange={handleChange}
        options={options}
        disabled={disabled}
        error={!!error}
        aria-invalid={!!error}
      />
      {hint && !error && <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
