'use client';

import type { ReactNode } from 'react';
import type { IconSvgElement } from '@hugeicons/react';
import Icon from '@/components/Icon';
import { buttonClass, type ButtonVariant } from '@/components/Button';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconSvgElement;
  children: ReactNode;
  variant?: ButtonVariant;
}

export default function IconButton({
  icon,
  children,
  variant = 'primary',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button className={buttonClass(variant, 'md', className)} {...props}>
      {icon && <Icon icon={icon} size={16} />}
      {children}
    </button>
  );
}
