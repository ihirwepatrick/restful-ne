'use client';

import { useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  loading?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  loading = false,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const isDisabled = disabled || loading;

  useEffect(() => {
    if (!isDisabled) {
      inputsRef.current[0]?.focus();
    }
  }, [isDisabled]);

  const getDigit = (index: number) => value[index] ?? '';

  const commitValue = (next: string) => {
    const cleaned = next.replace(/\D/g, '').slice(0, length);
    onChange(cleaned);
    if (cleaned.length === length && onComplete && !isDisabled) {
      onComplete(cleaned);
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      commitValue(value.slice(0, index) + value.slice(index + 1));
      return;
    }

    const chars = value.split('');
    let cursor = index;
    for (const char of raw) {
      if (cursor >= length) break;
      chars[cursor] = char;
      cursor += 1;
    }
    commitValue(chars.join(''));
    if (cursor < length) {
      inputsRef.current[cursor]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !getDigit(index) && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    commitValue(pasted);
    if (pasted.length < length) {
      const focusIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div>
      <label className="block text-sm text-[var(--text-muted)] mb-3">Verification code</label>
      <div className="relative">
        <div
          className={`grid grid-cols-6 gap-3 sm:gap-4 transition-opacity ${loading ? 'opacity-40 pointer-events-none' : ''}`}
        >
          {Array.from({ length }, (_, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={length}
              disabled={isDisabled}
              value={getDigit(index)}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${index + 1}`}
              className="h-14 w-full min-w-0 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-center text-lg font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-colors disabled:opacity-50"
            />
          ))}
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-orange-500/30 border-t-orange-500" />
          </div>
        )}
      </div>
    </div>
  );
}
