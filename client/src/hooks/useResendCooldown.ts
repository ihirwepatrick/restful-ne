'use client';

import { useCallback, useEffect, useState } from 'react';

export const OTP_RESEND_COOLDOWN_SEC = 60;

export function useResendCooldown(cooldownSec = OTP_RESEND_COOLDOWN_SEC) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSec);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const resetCooldown = useCallback(() => {
    setSecondsLeft(cooldownSec);
  }, [cooldownSec]);

  return {
    secondsLeft,
    canResend: secondsLeft === 0,
    resetCooldown,
  };
}
