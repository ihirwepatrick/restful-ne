'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm, { AuthSubmitButton, AuthLink } from '@/components/AuthForm';
import AuthField from '@/components/auth/AuthField';
import PasswordRequirements from '@/components/auth/PasswordRequirements';
import Icon from '@/components/Icon';
import { NavIcons } from '@/lib/nav-icons';
import { isPasswordValid } from '@/lib/password';

export default function RegisterPage() {
  const { requestRegistrationOtp } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'INSPECTOR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const passwordsMismatch =
    confirmTouched &&
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

  const canSubmit = isPasswordValid(form.password, form.confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmTouched(true);

    if (!canSubmit) {
      setError('Please meet all password requirements before continuing.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await requestRegistrationOtp({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      router.push(`/register/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create your account"
      subtitle="We'll email you a 6-digit code to verify your address before creating your account."
      footer={
        <p>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <AuthField
            label="First name"
            value={form.firstName}
            onChange={(v) => setForm({ ...form, firstName: v })}
            placeholder="John"
            required
          />
          <AuthField
            label="Last name"
            value={form.lastName}
            onChange={(v) => setForm({ ...form, lastName: v })}
            placeholder="Doe"
            required
          />
        </div>
        <AuthField
          label="Email address"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="you@company.com"
          required
          icon={NavIcons.mail}
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Account type</label>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: 'USER' as const, label: 'Facility user', hint: 'View fleet and compliance' },
                { value: 'INSPECTOR' as const, label: 'Inspector', hint: 'Schedule and complete inspections' },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm({ ...form, role: option.value })}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  form.role === option.value
                    ? 'border-orange-500/60 bg-orange-500/10'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-orange-500/30'
                }`}
              >
                <span className="block text-sm font-medium text-[var(--text-primary)]">{option.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{option.hint}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Admin accounts are assigned by an existing administrator after you register.
          </p>
        </div>
        <AuthField
          label="Password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder="Create a strong password"
          required
          minLength={8}
          icon={NavIcons.lock}
          showToggle
        />
        <AuthField
          label="Confirm password"
          value={form.confirmPassword}
          onChange={(v) => setForm({ ...form, confirmPassword: v })}
          onBlur={() => setConfirmTouched(true)}
          placeholder="Re-enter your password"
          required
          minLength={8}
          icon={NavIcons.lock}
          showToggle
          error={passwordsMismatch ? 'Passwords do not match' : undefined}
        />
        <PasswordRequirements password={form.password} confirmPassword={form.confirmPassword} />
        <p className="text-xs text-[var(--text-muted)]">
          By continuing, you agree to TZW&apos;s Terms of Service and Privacy Policy.
        </p>
        <AuthSubmitButton loading={loading} disabled={!canSubmit}>
          <Icon icon={NavIcons.mail} size={18} />
          {loading ? 'Continuing...' : 'Continue'}
        </AuthSubmitButton>
      </form>
    </AuthForm>
  );
}
