'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { IconSvgElement } from '@hugeicons/react';
import Icon from '@/components/Icon';

export type ButtonVariant =
  | 'primary'
  | 'orange'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'success'
  | 'danger'
  | 'filter'
  | 'filterActive'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-in-out cursor-pointer ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--main-bg)] ' +
  'active:scale-[0.98]';

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 rounded text-sm',
  md: 'px-4 py-2 rounded-lg text-sm',
  lg: 'px-6 py-2.5 rounded-lg text-sm',
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-orange-600 text-white hover:bg-orange-500 hover:shadow-md',
  orange: 'bg-orange-600 text-white hover:bg-orange-500 hover:shadow-md',
  secondary:
    'bg-[var(--filter-bg)] text-[var(--filter-text)] border-0 hover:bg-[var(--filter-hover-bg)] hover:text-[var(--filter-hover-text)]',
  outline:
    'bg-[var(--surface-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--surface-elevated)] hover:border-[var(--border-color)] hover:shadow-sm',
  ghost:
    'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]',
  success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md',
  danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md',
  filter:
    'bg-[var(--filter-bg)] text-[var(--filter-text)] border-0 hover:bg-[var(--filter-hover-bg)] hover:text-[var(--filter-hover-text)]',
  filterActive:
    'bg-[var(--filter-active-bg)] text-[var(--filter-active-text)] border-0 hover:bg-[var(--filter-active-hover-bg)]',
  link: 'text-green-600 hover:text-green-700 hover:underline bg-transparent p-0 active:scale-100 shadow-none',
};

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
) {
  const sizeClass = variant === 'link' ? 'text-xs' : sizes[size];
  return `${base} ${variants[variant]} ${sizeClass} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconSvgElement;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {icon && <Icon icon={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
