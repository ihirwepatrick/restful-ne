'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import AuthForm, { AuthSubmitButton, AuthLink } from '@/components/AuthForm';
import AuthField from '@/components/auth/AuthField';
import PasswordRequirements from '@/components/auth/PasswordRequirements';
import { NavIcons } from '@/lib/nav-icons';
import { isPasswordValid } from '@/lib/password';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const passwordsMismatch =
    confirmTouched &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const canSubmit = isPasswordValid(password, confirmPassword) && Boolean(token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmTouched(true);

    if (!token) {
      setError('Invalid or expired reset link. Please request a new code.');
      return;
    }

    if (!canSubmit) {
      setError('Please meet all password requirements before continuing.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken: token, newPassword: password }),
      });
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Set new password"
      subtitle="Create a strong password that meets all requirements below."
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
        {!token && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            Invalid or expired reset link.{' '}
            <AuthLink href="/forgot-password">Request a new code</AuthLink>
          </p>
        )}
        <AuthField
          label="New password"
          value={password}
          onChange={setPassword}
          placeholder="Create a strong password"
          required
          minLength={8}
          icon={NavIcons.lock}
          showToggle
        />
        <AuthField
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          onBlur={() => setConfirmTouched(true)}
          placeholder="Re-enter your password"
          required
          minLength={8}
          icon={NavIcons.lock}
          showToggle
          error={passwordsMismatch ? 'Passwords do not match' : undefined}
        />
        <PasswordRequirements password={password} confirmPassword={confirmPassword} />
        <AuthSubmitButton loading={loading} disabled={!canSubmit}>
          {loading ? 'Saving...' : 'Reset password'}
        </AuthSubmitButton>
      </form>
    </AuthForm>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
