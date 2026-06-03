'use client';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 28, className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-orange-600 border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
