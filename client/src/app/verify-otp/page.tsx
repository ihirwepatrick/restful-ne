'use client';

import { useState, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import AuthForm, { AuthSubmitButton, AuthLink } from '@/components/AuthForm';
import EditableEmailField from '@/components/auth/EditableEmailField';
import OtpInput from '@/components/auth/OtpInput';
import OtpResendButton from '@/components/auth/OtpResendButton';

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const verifyingRef = useRef(false);

  const verifyCode = useCallback(async (code: string) => {
    if (verifyingRef.current || code.length !== 6) return;
    verifyingRef.current = true;
    setOtp(code);
    setLoading(true);
    setError('');
    try {
      const { resetToken } = await api<{ resetToken: string }>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: code }),
      });
      router.push(`/reset-password?token=${resetToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      verifyingRef.current = false;
      setLoading(false);
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    await verifyCode(otp);
  };

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email address first.');
      throw new Error('No email');
    }
    setError('');
    await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  };

  return (
    <AuthForm
      title="Verify your code"
      subtitle="Enter the 6-digit code sent to your email. It expires in 10 minutes."
      footer={
        <p>
          <AuthLink href="/login">Back to sign in</AuthLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <EditableEmailField email={email} onEmailChange={setEmail} />
        <OtpInput value={otp} onChange={setOtp} onComplete={verifyCode} disabled={loading} loading={loading} />
        <AuthSubmitButton loading={loading} disabled={otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify code'}
        </AuthSubmitButton>
        <OtpResendButton onResend={handleResend} />
      </form>
    </AuthForm>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
