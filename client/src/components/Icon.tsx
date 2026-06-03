'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';

interface IconProps {
  icon: IconSvgElement;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function Icon({ icon, size = 20, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
