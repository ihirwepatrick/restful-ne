'use client';

import { useEffect, useState } from 'react';
import FormShell from '@/components/forms/FormShell';
import FormGrid from '@/components/forms/FormGrid';
import FormField from '@/components/forms/FormField';
import FormSelect from '@/components/forms/FormSelect';
import FormDivider from '@/components/forms/FormDivider';
import FormActions from '@/components/forms/FormActions';
import { api } from '@/lib/api';

interface ComplianceRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ComplianceRecordForm({ onSuccess, onCancel }: ComplianceRecordFormProps) {
  const [extinguishers, setExtinguishers] = useState<
    { id: string; serialNumber: string; location: string }[]
  >([]);
  const [form, setForm] = useState({ extinguisherId: '', requirement: '', dueDate: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ id: string; serialNumber: string; location: string }[]>(
      '/api/equipment/extinguishers',
    ).then(setExtinguishers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api('/api/reports/compliance', { method: 'POST', body: JSON.stringify(form) });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title="Add compliance record"
      subtitle="Track regulatory or internal requirements per extinguisher"
      error={error}
      embedded
    >
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormSelect
            label="Extinguisher"
            required
            colSpan="3"
            value={form.extinguisherId}
            onChange={(e) => setForm({ ...form, extinguisherId: e.target.value })}
            options={[
              { value: '', label: 'Select extinguisher' },
              ...extinguishers.map((e) => ({
                value: e.id,
                label: `${e.serialNumber} — ${e.location}`,
              })),
            ]}
          />
          <FormField
            label="Due date"
            type="date"
            required
            colSpan="3"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <FormField
            label="Requirement"
            required
            placeholder="e.g. Annual hydrostatic test"
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
          />
        </FormGrid>
        <FormDivider />
        <FormActions onCancel={onCancel} submitLabel="Add record" loading={loading} />
      </form>
    </FormShell>
  );
}
