'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm, { AuthSubmitButton, AuthLink } from '@/components/AuthForm';
import AuthField from '@/components/auth/AuthField';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Sign in to TZW"
      subtitle="Manage extinguishers, inspections, and compliance in one place."
      footer={
        <p>
          Don&apos;t have an account? <AuthLink href="/register">Create account</AuthLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <AuthField
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          required
          icon={NavIcons.mail}
        />
        <div>
          <AuthField
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
            icon={NavIcons.lock}
            showToggle
          />
          <div className="flex justify-end mt-2">
            <AuthLink href="/forgot-password">Forgot password?</AuthLink>
          </div>
        </div>
        <AuthSubmitButton loading={loading}>
          <Icon icon={NavIcons.login} size={18} />
          {loading ? 'Signing in...' : 'Sign in'}
        </AuthSubmitButton>
      </form>
    </AuthForm>
  );
}
