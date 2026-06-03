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
import { useAuth } from '@/context/AuthContext';

interface Extinguisher {
  id: string;
  serialNumber: string;
  location: string;
}
interface Inspector {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ScheduleInspectionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ScheduleInspectionForm({ onSuccess, onCancel }: ScheduleInspectionFormProps) {
  const { user } = useAuth();
  const [extinguishers, setExtinguishers] = useState<Extinguisher[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [form, setForm] = useState({
    extinguisherId: '',
    scheduledAt: '',
    assignedInspectorId: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Extinguisher[]>('/api/equipment/extinguishers').then(setExtinguishers);
    api<Inspector[]>('/api/operations/inspectors').then((insp) => {
      setInspectors(insp);
      if (user?.role === 'INSPECTOR') setForm((f) => ({ ...f, assignedInspectorId: user.id }));
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const scheduledAt = new Date(form.scheduledAt).toISOString();
      await api('/api/operations/inspections', {
        method: 'POST',
        body: JSON.stringify({ ...form, scheduledAt }),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell title="Inspection details" error={error} embedded>
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
            label="Date and time"
            type="datetime-local"
            required
            colSpan="3"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          />
          {user?.role !== 'INSPECTOR' && (
            <FormSelect
              label="Assign inspector"
              required
              colSpan="3"
              value={form.assignedInspectorId}
              onChange={(e) => setForm({ ...form, assignedInspectorId: e.target.value })}
              options={[
                { value: '', label: 'Select inspector' },
                ...inspectors.map((i) => ({
                  value: i.id,
                  label: `${i.firstName} ${i.lastName} (${i.email})`,
                })),
              ]}
            />
          )}
          <FormTextarea
            label="Notes"
            placeholder="Optional instructions for the inspector"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
          />
        </FormGrid>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Assigned inspector and admins will receive an email notification.
        </p>
        <FormDivider />
        <FormActions onCancel={onCancel} submitLabel="Schedule inspection" loading={loading} />
      </form>
    </FormShell>
  );
}
