export type PasswordCheck = {
  id: string;
  label: string;
  met: boolean;
};

export function getPasswordChecks(password: string, confirmPassword: string): PasswordCheck[] {
  return [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'lower', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'number', label: 'One number', met: /\d/.test(password) },
    {
      id: 'match',
      label: 'Passwords match',
      met: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
    },
  ];
}

export function isPasswordValid(password: string, confirmPassword: string): boolean {
  return getPasswordChecks(password, confirmPassword).every((check) => check.met);
}
