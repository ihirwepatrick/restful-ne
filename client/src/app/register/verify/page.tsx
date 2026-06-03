'use client';

import { useState, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm, { AuthSubmitButton, AuthLink } from '@/components/AuthForm';
import EditableEmailField from '@/components/auth/EditableEmailField';
import OtpInput from '@/components/auth/OtpInput';
import OtpResendButton from '@/components/auth/OtpResendButton';

function RegisterVerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const [email, setEmail] = useState(params.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const verifyingRef = useRef(false);

  const verifyCode = useCallback(async (code: string) => {
    if (verifyingRef.current || code.length !== 6) return;
    verifyingRef.current = true;
    setOtp(code);
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await verifyRegistrationOtp(email, code);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      verifyingRef.current = false;
      setLoading(false);
    }
  }, [email, router, verifyRegistrationOtp]);

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
    setMessage('');
    try {
      await resendRegistrationOtp(email);
      setMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
      throw err;
    }
  };

  return (
    <AuthForm
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your email. It expires in 10 minutes."
      footer={
        <p>
          Wrong email? <AuthLink href="/register">Start over</AuthLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
        <EditableEmailField email={email} onEmailChange={setEmail} />
        <OtpInput value={otp} onChange={setOtp} onComplete={verifyCode} disabled={loading} loading={loading} />
        <AuthSubmitButton loading={loading} disabled={otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify and create account'}
        </AuthSubmitButton>
        <OtpResendButton onResend={handleResend} />
      </form>
    </AuthForm>
  );
}

export default function RegisterVerifyPage() {
  return (
    <Suspense>
      <RegisterVerifyForm />
    </Suspense>
  );
}
