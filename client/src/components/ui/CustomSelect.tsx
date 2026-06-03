'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';
import { inputBaseClass } from '@/components/forms/FormField';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  id?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  noMargin?: boolean;
  'aria-invalid'?: boolean;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  noMargin = false,
  'aria-invalid': ariaInvalid,
}: CustomSelectProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const selected = options.find((o) => String(o.value) === String(value));
  const displayLabel = selected?.label ?? placeholder;
  const isPlaceholder = !selected || selected.value === '';

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) setHighlight(-1);
  }, [open]);

  const pick = (opt: SelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const enabledOptions = options.filter((o) => !o.disabled && o.value !== '');

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && highlight >= 0 && enabledOptions[highlight]) {
        pick(enabledOptions[highlight]);
      } else {
        setOpen((o) => !o);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.min(h + 1, enabledOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.max(h - 1, 0));
    }
  };

  return (
    <div ref={rootRef} className={`relative ${noMargin ? '' : 'mt-2'}`}>
      <button
        type="button"
        id={fieldId}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={ariaInvalid ?? error}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`${inputBaseClass} flex items-center justify-between gap-2 text-left ${
          error ? 'border-red-500/60 focus:ring-red-500/30' : ''
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`truncate ${isPlaceholder ? 'text-[var(--text-muted)]' : ''}`}>
          {displayLabel}
        </span>
        <Icon
          icon={NavIcons.chevronDown}
          size={16}
          className={`shrink-0 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby={fieldId}
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-1.5 shadow-xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-sm"
        >
          {options.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const enabledIdx = enabledOptions.indexOf(opt);
            const isHighlighted = enabledIdx === highlight;
            return (
              <li key={`${opt.value}-${idx}`} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={opt.disabled}
                  onMouseEnter={() => enabledIdx >= 0 && setHighlight(enabledIdx)}
                  onClick={() => pick(opt)}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    opt.disabled
                      ? 'cursor-not-allowed text-[var(--text-muted)] opacity-50'
                      : isSelected
                        ? 'bg-orange-500/15 font-medium text-orange-700 dark:text-orange-300'
                        : isHighlighted
                          ? 'bg-orange-500/10 text-[var(--text-primary)]'
                          : 'text-[var(--text-primary)] hover:bg-[var(--main-bg)]'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
