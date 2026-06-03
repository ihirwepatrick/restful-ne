'use client';

import { useEffect, useState } from 'react';
import FormShell from '@/components/forms/FormShell';
import FormGrid from '@/components/forms/FormGrid';
import FormField from '@/components/forms/FormField';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import FormDivider from '@/components/forms/FormDivider';
import FormActions from '@/components/forms/FormActions';
import { api } from '@/lib/api';

const ACTIONS = [
  'Refill',
  'Recharge',
  'Repair',
  'Replace',
  'HydroTest',
  'InspectionFollowUp',
  'Other',
];

interface MaintenanceLogFormProps {
  initialExtinguisherId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MaintenanceLogForm({
  initialExtinguisherId,
  onSuccess,
  onCancel,
}: MaintenanceLogFormProps) {
  const [extinguishers, setExtinguishers] = useState<
    { id: string; serialNumber: string; location: string }[]
  >([]);
  const [form, setForm] = useState({
    extinguisherId: initialExtinguisherId ?? '',
    performedAt: '',
    actionTaken: 'Refill',
    conditionsNoted: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ id: string; serialNumber: string; location: string }[]>(
      '/api/equipment/extinguishers',
    ).then(setExtinguishers);
  }, []);

  useEffect(() => {
    if (initialExtinguisherId) {
      setForm((f) => ({ ...f, extinguisherId: initialExtinguisherId }));
    }
  }, [initialExtinguisherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api('/api/operations/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          performedAt: new Date(form.performedAt).toISOString(),
        }),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell title="Maintenance record" error={error} embedded>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormSelect
            label="Extinguisher"
            required
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
            label="Performed on"
            type="date"
            required
            colSpan="3"
            value={form.performedAt}
            onChange={(e) => setForm({ ...form, performedAt: e.target.value })}
          />
          <FormSelect
            label="Action taken"
            required
            colSpan="3"
            value={form.actionTaken}
            onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
            options={ACTIONS.map((a) => ({ value: a, label: a }))}
          />
          <FormTextarea
            label="Conditions noted"
            required
            placeholder="Describe the condition of the unit during service"
            value={form.conditionsNoted}
            onChange={(e) => setForm({ ...form, conditionsNoted: e.target.value })}
            rows={4}
          />
          <FormTextarea
            label="Additional description"
            placeholder="Optional details"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
        </FormGrid>
        <FormDivider />
        <FormActions onCancel={onCancel} submitLabel="Save log" loading={loading} />
      </form>
    </FormShell>
  );
}
