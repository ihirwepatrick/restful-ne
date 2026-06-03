'use client';

import { useState } from 'react';
import { useResendCooldown, OTP_RESEND_COOLDOWN_SEC } from '@/hooks/useResendCooldown';

interface OtpResendButtonProps {
  onResend: () => Promise<void>;
  cooldownSec?: number;
}

export default function OtpResendButton({ onResend, cooldownSec = OTP_RESEND_COOLDOWN_SEC }: OtpResendButtonProps) {
  const [resending, setResending] = useState(false);
  const { secondsLeft, canResend, resetCooldown } = useResendCooldown(cooldownSec);

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    try {
      await onResend();
      resetCooldown();
    } finally {
      setResending(false);
    }
  };

  const label = resending
    ? 'Sending...'
    : secondsLeft > 0
      ? `Resend in ${secondsLeft}s`
      : 'Resend code';

  return (
    <p className="text-center text-sm text-[var(--text-muted)]">
      Didn&apos;t get a code?{' '}
      <button
        type="button"
        onClick={handleResend}
        disabled={resending || !canResend}
        className="font-medium text-orange-600 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-orange-600"
      >
        {label}
      </button>
    </p>
  );
}
