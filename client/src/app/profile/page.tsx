'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import FormShell from '@/components/forms/FormShell';
import FormCard from '@/components/forms/FormCard';
import FormGrid from '@/components/forms/FormGrid';
import FormField from '@/components/forms/FormField';
import FormDivider from '@/components/forms/FormDivider';
import FormActions from '@/components/forms/FormActions';
import PasswordRequirements from '@/components/auth/PasswordRequirements';
import { NavIcons } from '@/lib/nav-icons';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { isPasswordValid } from '@/lib/password';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const passwordsMismatch =
    confirmTouched &&
    passwords.confirmPassword.length > 0 &&
    passwords.newPassword !== passwords.confirmPassword;

  const canChangePassword =
    passwords.currentPassword.length > 0 &&
    isPasswordValid(passwords.newPassword, passwords.confirmPassword);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileMessage('');
    try {
      await api('/api/auth/me', { method: 'PATCH', body: JSON.stringify(profile) });
      await refreshUser();
      setProfileMessage('Profile updated');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmTouched(true);

    if (!canChangePassword) {
      setPasswordError('Please meet all password requirements before continuing.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setConfirmTouched(false);
      setPasswordMessage('Password changed successfully');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Profile"
        subtitle="Manage your account details and security"
        icon={NavIcons.profile}
      />

      <div className="grid max-w-5xl gap-6 md:grid-cols-2">
        <FormCard>
          <FormShell title="Personal information" subtitle="Update your name and email" embedded>
            {profileMessage && (
              <p className="mb-4 text-sm text-green-600 dark:text-green-400 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                {profileMessage}
              </p>
            )}
            {profileError && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                {profileError}
              </p>
            )}
            <form onSubmit={updateProfile}>
              <FormGrid>
                <FormField
                  label="First name"
                  required
                  colSpan="3"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
                <FormField
                  label="Last name"
                  required
                  colSpan="3"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
                <FormField
                  label="Email"
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </FormGrid>
              <FormDivider />
              <FormActions submitLabel="Save profile" loading={profileLoading} />
            </form>
          </FormShell>
        </FormCard>

        <FormCard>
          <FormShell title="Change password" subtitle="Use a strong, unique password" embedded>
            {passwordMessage && (
              <p className="mb-4 text-sm text-green-600 dark:text-green-400 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                {passwordMessage}
              </p>
            )}
            {passwordError && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                {passwordError}
              </p>
            )}
            <form onSubmit={changePassword}>
              <FormGrid>
                <FormField
                  label="Current password"
                  type="password"
                  required
                  showPasswordToggle
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, currentPassword: e.target.value })
                  }
                />
                <FormField
                  label="New password"
                  type="password"
                  required
                  minLength={8}
                  showPasswordToggle
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
                <FormField
                  label="Confirm new password"
                  type="password"
                  required
                  minLength={8}
                  showPasswordToggle
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                  }
                  onBlur={() => setConfirmTouched(true)}
                  error={passwordsMismatch ? 'Passwords do not match' : undefined}
                />
              </FormGrid>
              <div className="mt-4">
                <PasswordRequirements
                  password={passwords.newPassword}
                  confirmPassword={passwords.confirmPassword}
                />
              </div>
              <FormDivider />
              <FormActions
                submitLabel="Change password"
                loading={passwordLoading}
                submitDisabled={!canChangePassword}
              />
            </form>
          </FormShell>
        </FormCard>
      </div>
    </AppLayout>
  );
}
