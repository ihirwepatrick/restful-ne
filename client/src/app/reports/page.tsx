'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import CustomSelect from '@/components/ui/CustomSelect';
import { buttonClass } from '@/components/Button';
import Icon from '@/components/Icon';
import type { IconSvgElement } from '@hugeicons/react';
import { NavIcons } from '@/lib/nav-icons';
import { api, downloadFile } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

type Period = 'daily' | 'monthly' | 'yearly';
type ExportType = 'stock' | 'expired' | 'maintenance' | 'inspections';

const EXPORT_OPTIONS: { value: ExportType; label: string }[] = [
  { value: 'stock', label: 'Stock' },
  { value: 'expired', label: 'Expired extinguishers' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inspections', label: 'Inspections' },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [period, setPeriod] = useState<Period>('daily');
  const [exportType, setExportType] = useState<ExportType>('stock');
  const [exporting, setExporting] = useState(false);
  const [stock, setStock] = useState<Record<string, unknown> | null>(null);
  const [inspections, setInspections] = useState<Record<string, unknown> | null>(null);
  const [expired, setExpired] = useState<Record<string, unknown> | null>(null);
  const [maintenance, setMaintenance] = useState<Record<string, unknown> | null>(null);

  const load = () => {
    const q = `?period=${period}`;
    api<Record<string, unknown>>(`/api/reports/stock${q}`).then(setStock);
    api<Record<string, unknown>>(`/api/reports/inspections/status${q}`).then(setInspections);
    api<Record<string, unknown>>(`/api/reports/extinguishers/expired${q}`).then(setExpired);
    api<Record<string, unknown>>(`/api/reports/maintenance/history${q}&limit=20`).then(setMaintenance);
  };

  useEffect(() => { load(); }, [period]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await downloadFile(
        `/api/reports/export?type=${exportType}`,
        `${exportType}-export.csv`,
      );
      toast.success('CSV downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Reports"
        subtitle={
          isAdmin
            ? 'Detailed stock, inspection, and maintenance reports by period. Export CSV for Excel (Admin).'
            : 'Detailed stock, inspection, and maintenance reports by period'
        }
        icon={NavIcons.reports}
        onRefresh={load}
      />
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex gap-2">
          {(['daily', 'monthly', 'yearly'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={buttonClass(period === p ? 'filterActive' : 'filter', 'sm', 'rounded-lg capitalize')}
            >
              {p}
            </button>
          ))}
        </div>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <div className="w-full min-w-[12rem] sm:w-56">
              <CustomSelect
                value={exportType}
                onChange={(v) => setExportType(v as ExportType)}
                options={EXPORT_OPTIONS}
                disabled={exporting}
                noMargin
              />
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={exporting}
              className={buttonClass('outline', 'md', 'shadow-none')}
            >
              <Icon icon={NavIcons.reports} size={16} />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ReportCard title="Extinguishers In Stock" icon={NavIcons.extinguishers}>
          {stock && (
            <>
              <p className="text-3xl font-bold text-green-600">{stock.totalInStock as number}</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">Active: {stock.activeCount as number} · Expired: {stock.expiredCount as number}</p>
            </>
          )}
        </ReportCard>

        <ReportCard title="Inspection Status" icon={NavIcons.inspections}>
          {inspections && (
            <ul className="space-y-1 text-sm mt-2">
              <li>Scheduled: {inspections.scheduled as number}</li>
              <li>In Progress: {inspections.inProgress as number}</li>
              <li>Completed: {inspections.completed as number}</li>
              <li className="text-red-600 font-medium">Overdue: {inspections.overdue as number}</li>
              <li>Pass: {inspections.pass as number} · Fail: {inspections.fail as number}</li>
            </ul>
          )}
        </ReportCard>

        <ReportCard title="Expired Extinguishers" icon={NavIcons.alert}>
          {expired && (
            <>
              <p className="text-2xl font-bold text-red-600">{expired.count as number}</p>
              <ul className="mt-3 space-y-1 text-xs max-h-40 overflow-y-auto">
                {(expired.items as { serialNumber: string; location: string; daysOverdue: number }[])?.map((e, i) => (
                  <li key={i}>{e.serialNumber} — {e.location} ({e.daysOverdue}d overdue)</li>
                ))}
              </ul>
            </>
          )}
        </ReportCard>

        <ReportCard title="Maintenance History" icon={NavIcons.maintenance}>
          {maintenance && (
            <ul className="mt-2 space-y-2 text-xs max-h-48 overflow-y-auto">
              {(maintenance.items as { actionTaken: string; performedAt: string; conditionsNoted: string; extinguisherSerial?: string }[])?.map((m, i) => (
                <li key={i} className="border-b pb-2">
                  <strong>{m.actionTaken}</strong> — {m.extinguisherSerial || 'N/A'}<br />
                  {new Date(m.performedAt).toLocaleDateString()}: {m.conditionsNoted?.slice(0, 60)}...
                </li>
              ))}
            </ul>
          )}
        </ReportCard>
      </div>
    </AppLayout>
  );
}

function ReportCard({ title, children, icon }: { title: string; children: React.ReactNode; icon?: IconSvgElement }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {icon && (
          <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Icon icon={icon} size={18} />
          </div>
        )}
        <h2 className="font-semibold text-[var(--text-primary)]">{title}</h2>
      </div>
      {children}
    </div>
  );
}
