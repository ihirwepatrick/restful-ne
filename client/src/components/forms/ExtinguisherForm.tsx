'use client';

import { useEffect, useMemo, useState } from 'react';
import FormShell from '@/components/forms/FormShell';
import FormGrid from '@/components/forms/FormGrid';
import FormField from '@/components/forms/FormField';
import FormSelect from '@/components/forms/FormSelect';
import FormDivider from '@/components/forms/FormDivider';
import FormActions from '@/components/forms/FormActions';
import { api } from '@/lib/api';
import PageLoader from '@/components/ui/PageLoader';

interface ExtinguisherFormProps {
  extinguisherId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExtinguisherForm({ extinguisherId, onSuccess, onCancel }: ExtinguisherFormProps) {
  const isEdit = Boolean(extinguisherId);
  const [types, setTypes] = useState<{ id: number; name: string }[]>([]);
  const [sizes, setSizes] = useState<{ id: number; label: string }[]>([]);
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    serialNumber: '',
    location: '',
    typeId: 1,
    sizeId: 1,
    statusId: 1,
    installationDate: '',
    expiryDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(!isEdit);
  const [initialForm, setInitialForm] = useState<typeof form | null>(null);

  useEffect(() => {
    const loads = [
      api<{ id: number; name: string }[]>('/api/equipment/types'),
      api<{ id: number; label: string }[]>('/api/equipment/sizes'),
      api<{ id: number; name: string }[]>('/api/equipment/statuses'),
    ] as const;

    if (isEdit && extinguisherId) {
      Promise.all([
        ...loads,
        api<Record<string, unknown>>(`/api/equipment/extinguishers/${extinguisherId}`),
      ]).then(([t, s, st, e]) => {
        setTypes(t);
        setSizes(s);
        setStatuses(st);
        const loaded = {
          serialNumber: e.serialNumber as string,
          location: e.location as string,
          typeId: (e.type as { id: number }).id,
          sizeId: (e.size as { id: number }).id,
          statusId: (e.status as { id: number }).id,
          installationDate: (e.installationDate as string).split('T')[0],
          expiryDate: (e.expiryDate as string).split('T')[0],
        };
        setForm(loaded);
        setInitialForm(loaded);
        setReady(true);
      });
    } else {
      Promise.all(loads).then(([t, s, st]) => {
        setTypes(t);
        setSizes(s);
        setStatuses(st);
        if (t[0]) setForm((f) => ({ ...f, typeId: t[0].id }));
        if (s[0]) setForm((f) => ({ ...f, sizeId: s[0].id }));
        if (st[0]) setForm((f) => ({ ...f, statusId: st[0].id }));
        setReady(true);
      });
    }
  }, [extinguisherId, isEdit]);

  const isDirty = useMemo(() => {
    if (!isEdit || !initialForm) return true;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        typeId: Number(form.typeId),
        sizeId: Number(form.sizeId),
        statusId: Number(form.statusId),
      };
      if (isEdit && extinguisherId) {
        await api(`/api/equipment/extinguishers/${extinguisherId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/equipment/extinguishers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save extinguisher');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return <PageLoader label="Loading form…" className="min-h-[8rem]" />;
  }

  return (
    <FormShell
      title={isEdit ? 'Edit unit details' : 'Extinguisher details'}
      subtitle="Required fields are marked with *"
      error={error}
      embedded
    >
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormField
            label="Serial number"
            name="serialNumber"
            required
            placeholder="e.g. FE-2024-001"
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
          />
          <FormField
            label="Location"
            name="location"
            required
            placeholder="Building, floor, or area"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <FormSelect
            label="Type"
            name="typeId"
            required
            colSpan="2"
            value={form.typeId}
            onChange={(e) => setForm({ ...form, typeId: Number(e.target.value) })}
            options={types.map((t) => ({ value: t.id, label: t.name }))}
          />
          <FormSelect
            label="Size"
            name="sizeId"
            required
            colSpan="2"
            value={form.sizeId}
            onChange={(e) => setForm({ ...form, sizeId: Number(e.target.value) })}
            options={sizes.map((s) => ({ value: s.id, label: s.label }))}
          />
          <FormSelect
            label="Status"
            name="statusId"
            required
            colSpan="2"
            value={form.statusId}
            onChange={(e) => setForm({ ...form, statusId: Number(e.target.value) })}
            options={statuses.map((s) => ({ value: s.id, label: s.name }))}
          />
          <FormField
            label="Installation date"
            name="installationDate"
            type="date"
            required
            colSpan="3"
            value={form.installationDate}
            onChange={(e) => setForm({ ...form, installationDate: e.target.value })}
          />
          <FormField
            label="Expiry date"
            name="expiryDate"
            type="date"
            required
            colSpan="3"
            hint="Unit should be replaced or serviced before this date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </FormGrid>
        <FormDivider />
        <FormActions
          onCancel={onCancel}
          submitLabel={isEdit ? 'Save' : 'Save extinguisher'}
          loading={loading}
          submitDisabled={isEdit && !isDirty}
        />
      </form>
    </FormShell>
  );
}
