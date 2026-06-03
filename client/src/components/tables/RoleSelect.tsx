'use client';

import CustomSelect from '@/components/ui/CustomSelect';

export default function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
}) {
  return (
    <CustomSelect
      value={value}
      onChange={(v) => onChange(String(v))}
      disabled={disabled}
      noMargin
      options={[
        { value: 'USER', label: 'User' },
        { value: 'INSPECTOR', label: 'Inspector' },
        { value: 'ADMIN', label: 'Admin' },
      ]}
    />
  );
}
