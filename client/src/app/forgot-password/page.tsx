'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import AuthForm, { AuthSubmitButton, AuthLink } from '@/components/AuthForm';
import AuthField from '@/components/auth/AuthField';
import { NavIcons } from '@/lib/nav-icons';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    } catch {
      // Same response either way — don't reveal whether email exists
    } finally {
      setLoading(false);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <AuthForm
      title="Forgot password?"
      subtitle="We'll send a 6-digit verification code to your email."
      footer={
        <p>
          Remember your password? <AuthLink href="/login">Back to sign in</AuthLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          required
          icon={NavIcons.mail}
        />
        <AuthSubmitButton loading={loading}>
          {loading ? 'Sending...' : 'Send verification code'}
        </AuthSubmitButton>
      </form>
    </AuthForm>
  );
}
